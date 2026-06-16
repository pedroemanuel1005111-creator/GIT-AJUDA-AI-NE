import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, players, answers, roomReactions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;

    // Reset room status to waiting and currentQuestionIndex to 0
    await db.update(rooms)
      .set({
        status: "waiting",
        currentQuestionIndex: 0,
        questionStartTime: null,
      })
      .where(eq(rooms.id, roomId));

    // Reset all players scores and streaks
    await db.update(players)
      .set({
        score: 0,
        correctAnswers: 0,
        streak: 0,
      })
      .where(eq(players.roomId, roomId));

    // Delete previous answers and reactions
    await db.delete(answers).where(eq(answers.roomId, roomId));
    await db.delete(roomReactions).where(eq(roomReactions.roomId, roomId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error restarting room:", error);
    return NextResponse.json({ error: "Erro ao reiniciar sala" }, { status: 500 });
  }
}
