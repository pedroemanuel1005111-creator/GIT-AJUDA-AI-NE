import { NextResponse } from "next/server";
import { db } from "@/db";
import { roomReactions } from "@/db/schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { playerName, emoji } = body;

    if (!playerName || !emoji) {
      return NextResponse.json({ error: "Nome e emoji são obrigatórios" }, { status: 400 });
    }

    await db.insert(roomReactions).values({
      id: crypto.randomUUID(),
      roomId,
      playerName,
      emoji,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error posting reaction:", error);
    return NextResponse.json({ error: "Erro ao enviar reação" }, { status: 500 });
  }
}
