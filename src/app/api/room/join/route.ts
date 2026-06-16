import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, players } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pin, playerName, avatar } = body;

    if (!pin || !playerName) {
      return NextResponse.json({ error: "PIN da sala e seu nome (apelido) são obrigatórios" }, { status: 400 });
    }

    const cleanPin = pin.trim();

    // Find room
    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, cleanPin)
    });

    if (!room) {
      return NextResponse.json({ error: "Sala não encontrada! Verifique o PIN digitado." }, { status: 404 });
    }

    if (room.status !== "waiting") {
      return NextResponse.json({ error: "Esta prova já começou ou foi encerrada. Peça ao apresentador para abrir o lobby." }, { status: 403 });
    }

    // Check if player name already exists in this room
    const existingPlayer = await db.query.players.findFirst({
      where: (players, { eq, and }) => and(eq(players.roomId, cleanPin), eq(players.name, playerName.trim()))
    });

    const playerId = existingPlayer ? existingPlayer.id : crypto.randomUUID();

    if (!existingPlayer) {
      // Create new player
      await db.insert(players).values({
        id: playerId,
        roomId: cleanPin,
        name: playerName.trim(),
        avatar: avatar || "🧙‍♂️",
        score: 0,
        correctAnswers: 0,
        streak: 0,
        isHost: false,
      });
    }

    return NextResponse.json({
      success: true,
      playerId,
      roomId: cleanPin,
      playerName: playerName.trim(),
      avatar: avatar || "🧙‍♂️",
      roomName: room.name,
    });
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json({ error: "Erro interno ao entrar na sala" }, { status: 500 });
  }
}
