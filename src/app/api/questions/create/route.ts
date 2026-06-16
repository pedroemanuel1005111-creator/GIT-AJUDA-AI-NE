import { NextResponse } from "next/server";
import { db } from "@/db";
import { questions } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, text, options, correctOption, explanation, timeLimit = 20 } = body;

    if (!category || !text || !options || options.length !== 4 || typeof correctOption !== "number" || !explanation) {
      return NextResponse.json({ error: "Preencha todos os campos corretamente" }, { status: 400 });
    }

    const questionId = "cust-" + crypto.randomUUID().slice(0, 8);

    await db.insert(questions).values({
      id: questionId,
      category,
      text,
      option0: options[0],
      option1: options[1],
      option2: options[2],
      option3: options[3],
      correctOption,
      explanation,
      timeLimit: Number(timeLimit) || 20,
      points: 1000,
    });

    return NextResponse.json({ success: true, questionId });
  } catch (error) {
    console.error("Error creating custom question:", error);
    return NextResponse.json({ error: "Erro interno ao salvar questão" }, { status: 500 });
  }
}
