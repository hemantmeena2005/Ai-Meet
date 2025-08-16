import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  const { transcript, prompt } = await req.json();

  // Compose the prompt for Groq
  const userPrompt = prompt ? `${prompt}\n\n${transcript}` : transcript;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      model: "openai/gpt-oss-20b",
    });
    const summary = chatCompletion.choices[0]?.message?.content || "Could not generate summary.";
    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json({ summary: "Error generating summary.", error: error.message }, { status: 500 });
  }
}
