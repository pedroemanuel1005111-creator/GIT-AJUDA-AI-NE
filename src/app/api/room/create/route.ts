import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms } from "@/db/schema";
import { OFFICIAL_QUESTIONS } from "@/data/questions";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, hostName, quizCategory = "all", timePerQuestion = 20 } = body;

    if (!name || !hostName) {
      return NextResponse.json({ error: "Nome da sala e do apresentador são obrigatórios" }, { status: 400 });
    }

    // Generate a unique 6-digit PIN code like Kahoot!
    let roomId = "";
    for (let i = 0; i < 10; i++) {
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      // Check if room exists
      const existing = await db.query.rooms.findFirst({
        where: (rooms, { eq }) => eq(rooms.id, pin)
      });
      if (!existing) {
        roomId = pin;
        break;
      }
    }

    if (!roomId) {
      // Fallback if loop finishes
      roomId = Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Determine total questions for this category
    let totalQuestions = OFFICIAL_QUESTIONS.length;
    if (quizCategory !== "all") {
      const filtered = OFFICIAL_QUESTIONS.filter(q => q.category === quizCategory);
      if (filtered.length > 0) {
        totalQuestions = filtered.length;
      }
    }

    // Create the room
    await db.insert(rooms).values({
      id: roomId,
      name,
      hostName,
      status: "waiting", // Lobby
      quizCategory,
      currentQuestionIndex: 0,
      timePerQuestion: Number(timePerQuestion) || 20,
      totalQuestions,
    });

    return NextResponse.json({ roomId, success: true });
  } catch (error: unknown) {
    console.error("Error creating room:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Erro interno ao criar a sala: ${errMsg}` }, { status: 500 });
  }
}
