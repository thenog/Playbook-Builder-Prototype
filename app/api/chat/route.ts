import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const FALLBACKS: Record<string, { message: string; nextComponent: string }> = {
  goal: {
    message: "Got it — here are the accounts that match your criteria.",
    nextComponent: "accountMatching",
  },
  accounts: {
    message: "Here's the nudge cadence I'd suggest for this play.",
    nextComponent: "nudgeCadence",
  },
  cadence: {
    message: "I've drafted an opening message for your reps.",
    nextComponent: "messageComposer",
  },
  message: {
    message: "Almost there — set a label for this play.",
    nextComponent: "labelConfigurator",
  },
  label: {
    message: "Everything looks good. Here's your play summary.",
    nextComponent: "launchSummary",
  },
};

export async function POST(req: NextRequest) {
  const { userMessage, stage } = await req.json();

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: `You are a Voze AI assistant helping a field sales manager build a targeted sales play for a gray-collar field sales team in commercial tire, heavy equipment, and heavy duty truck industries. Respond in one to two short sentences — conversational, confident, and specific to field sales. Always return valid JSON with two fields: message (your natural language reply) and nextComponent (one of: accountMatching, nudgeCadence, messageComposer, labelConfigurator, launchSummary). No markdown, no preamble, JSON only.`,
      messages: [
        {
          role: "user",
          content: `Stage: ${stage}. User message: ${userMessage}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(FALLBACKS[stage] ?? FALLBACKS["goal"]);
  }
}
