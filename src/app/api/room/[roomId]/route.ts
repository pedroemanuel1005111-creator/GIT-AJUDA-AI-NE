import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, players, answers, roomReactions } from "@/db/schema";
import { eq, desc, gte, and } from "drizzle-orm";
import { OFFICIAL_QUESTIONS, QuestionItem } from "@/data/questions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;

    // Fetch room
    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
    });

    if (!room) {
      return NextResponse.json({ error: "Sala não encontrada" }, { status: 404 });
    }

    // Fetch players sorted by score
    const playersList = await db.select().from(players)
      .where(eq(players.roomId, roomId))
      .orderBy(desc(players.score));

    // Get current quiz questions list based on category
    let activeQuestions: QuestionItem[] = OFFICIAL_QUESTIONS;
    if (room.quizCategory !== "all") {
      activeQuestions = OFFICIAL_QUESTIONS.filter(q => q.category === room.quizCategory);
    }

    const currentQuestion = activeQuestions[room.currentQuestionIndex] || activeQuestions[0];

    // Fetch answers submitted for the current question
    const submittedAnswers = await db.select().from(answers)
      .where(
        and(
          eq(answers.roomId, roomId),
          eq(answers.questionIndex, room.currentQuestionIndex)
        )
      );

    // Fetch recent emoji reactions (from the last 10 seconds)
    const tenSecondsAgo = new Date(Date.now() - 10000);
    const recentReactions = await db.select().from(roomReactions)
      .where(
        and(
          eq(roomReactions.roomId, roomId),
          gte(roomReactions.createdAt, tenSecondsAgo)
        )
      )
      .orderBy(desc(roomReactions.createdAt));

    // Construct a safe Question object for the client
    // If we are currently 'playing', we do NOT send the correctOption or explanation to avoid client-side inspection / cheating!
    const isRevealed = room.status === "question_results" || room.status === "podium";
    
    const safeQuestion = currentQuestion ? {
      id: currentQuestion.id,
      category: currentQuestion.category,
      text: currentQuestion.text,
      options: currentQuestion.options,
      correctOption: isRevealed ? currentQuestion.correctOption : null,
      explanation: isRevealed ? currentQuestion.explanation : null,
      timeLimit: room.timePerQuestion || 20,
    } : null;

    // Calculate how many answers each option received for the chart during results
    const optionCounts = [0, 0, 0, 0];
    const playerSubmittedMap: Record<string, boolean> = {};

    submittedAnswers.forEach(ans => {
      playerSubmittedMap[ans.playerId] = true;
      if (ans.selectedOption >= 0 && ans.selectedOption < 4) {
        optionCounts[ans.selectedOption] += 1;
      }
    });

    return NextResponse.json({
      room,
      players: playersList,
      question: safeQuestion,
      answersCount: submittedAnswers.length,
      optionCounts: isRevealed ? optionCounts : null,
      playerSubmittedMap,
      reactions: recentReactions,
      totalQuestions: activeQuestions.length,
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
