import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms } from "@/db/schema";
import { eq } from "drizzle-orm";

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

    // Start with question index 0
    await db.update(rooms)
      .set({
        status: "playing",
        currentQuestionIndex: 0,
        questionStartTime: Math.floor(Date.now() / 1000), // Active epoch seconds
      })
      .where(eq(rooms.id, roomId));

    return NextResponse.json({ success: true, status: "playing" });
  } catch (error) {
    console.error("Error starting room:", error);
    return NextResponse.json({ error: "Erro interno ao iniciar a sala" }, { status: 500 });
  }
}
