import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms } from "@/db/schema";
import { eq } from "drizzle-orm";
import { OFFICIAL_QUESTIONS, QuestionItem } from "@/data/questions";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;

    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
    });

    if (!room) {
      return NextResponse.json({ error: "Sala não encontrada" }, { status: 404 });
    }

    // Determine total active questions
    let activeQuestions: QuestionItem[] = OFFICIAL_QUESTIONS;
    if (room.quizCategory !== "all") {
      activeQuestions = OFFICIAL_QUESTIONS.filter(q => q.category === room.quizCategory);
    }
    const totalQuestions = activeQuestions.length;

    let nextStatus = room.status;
    let nextQuestionIndex = room.currentQuestionIndex;

    if (room.status === "playing") {
      // Advance to question results
      nextStatus = "question_results";
    } else if (room.status === "question_results") {
      // Check if more questions left
      if (room.currentQuestionIndex + 1 < totalQuestions) {
        nextQuestionIndex = room.currentQuestionIndex + 1;
        nextStatus = "playing";
      } else {
        // Game Over - Show Podium
        nextStatus = "podium";
      }
    } else if (room.status === "podium") {
      // Option to reset or replay
      nextStatus = "waiting";
      nextQuestionIndex = 0;
    }

    // Update room
    await db.update(rooms)
      .set({
        status: nextStatus,
        currentQuestionIndex: nextQuestionIndex,
        questionStartTime: nextStatus === "playing" ? Math.floor(Date.now() / 1000) : room.questionStartTime,
      })
      .where(eq(rooms.id, roomId));

    return NextResponse.json({
      success: true,
      status: nextStatus,
      currentQuestionIndex: nextQuestionIndex,
    });
  } catch (error) {
    console.error("Error advancing room:", error);
    return NextResponse.json({ error: "Erro interno ao avançar estado da sala" }, { status: 500 });
  }
}
