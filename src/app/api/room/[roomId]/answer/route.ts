import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, players, answers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { OFFICIAL_QUESTIONS, QuestionItem } from "@/data/questions";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { playerId, selectedOption } = body;

    if (!playerId || typeof selectedOption !== "number") {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // Find room and player
    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
    });

    const player = await db.query.players.findFirst({
      where: and(eq(players.id, playerId), eq(players.roomId, roomId)),
    });

    if (!room || !player) {
      return NextResponse.json({ error: "Sala ou jogador não encontrado" }, { status: 404 });
    }

    if (room.status !== "playing") {
      return NextResponse.json({ error: "Não é possível enviar resposta no momento" }, { status: 403 });
    }

    // Check if player already answered this question
    const existingAnswer = await db.query.answers.findFirst({
      where: and(
        eq(answers.roomId, roomId),
        eq(answers.playerId, playerId),
        eq(answers.questionIndex, room.currentQuestionIndex)
      ),
    });

    if (existingAnswer) {
      return NextResponse.json({ error: "Você já respondeu a esta questão!" }, { status: 400 });
    }

    // Get current question
    let activeQuestions: QuestionItem[] = OFFICIAL_QUESTIONS;
    if (room.quizCategory !== "all") {
      activeQuestions = OFFICIAL_QUESTIONS.filter(q => q.category === room.quizCategory);
    }
    const question = activeQuestions[room.currentQuestionIndex];

    if (!question) {
      return NextResponse.json({ error: "Questão inválida" }, { status: 400 });
    }

    const isCorrect = selectedOption === question.correctOption;

    // Calculate response time
    const now = Math.floor(Date.now() / 1000);
    const startTime = room.questionStartTime || now;
    const elapsedSeconds = Math.max(1, now - startTime);
    const timeLimit = room.timePerQuestion || 20;

    let pointsEarned = 0;
    let newStreak = player.streak;

    if (isCorrect) {
      // Kahoot style calculation: base 1000 points, degraded by speed up to 50% max penalty
      const timeFactor = Math.min(1, elapsedSeconds / timeLimit);
      const basePoints = Math.round(1000 * (1 - (timeFactor / 2)));
      
      // Streak bonus: +100 points per consecutive answer
      const streakBonus = player.streak * 100;

      pointsEarned = basePoints + streakBonus;
      newStreak += 1;
    } else {
      newStreak = 0; // reset streak
    }

    // Insert answer record
    await db.insert(answers).values({
      id: crypto.randomUUID(),
      roomId,
      playerId,
      questionIndex: room.currentQuestionIndex,
      selectedOption,
      isCorrect,
      scoreEarned: pointsEarned,
      responseTimeMs: elapsedSeconds * 1000,
    });

    // Update player score and streak
    await db.update(players)
      .set({
        score: player.score + pointsEarned,
        correctAnswers: isCorrect ? player.correctAnswers + 1 : player.correctAnswers,
        streak: newStreak,
      })
      .where(eq(players.id, playerId));

    return NextResponse.json({
      success: true,
      isCorrect,
      pointsEarned,
      newScore: player.score + pointsEarned,
      newStreak,
    });
  } catch (error) {
    console.error("Error processing answer:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
