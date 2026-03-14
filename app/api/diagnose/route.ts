import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { photo, plantName } = await req.json() as { photo: string; plantName?: string };

    if (!photo) {
      return NextResponse.json({ error: "No photo provided" }, { status: 400 });
    }

    // Strip data URL prefix to get raw base64
    const base64Data = photo.replace(/^data:image\/\w+;base64,/, "");
    const mediaType = (photo.match(/^data:(image\/\w+);base64,/)?.[1] ?? "image/jpeg") as
      | "image/jpeg"
      | "image/png"
      | "image/gif"
      | "image/webp";

    const stream = client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64Data },
            },
            {
              type: "text",
              text: [
                plantName
                  ? `This is a photo of my plant named "${plantName}".`
                  : "This is a photo of my plant.",
                "Please diagnose its health. Cover:",
                "1. Overall health assessment",
                "2. Any visible issues (pests, disease, nutrient deficiency, overwatering, underwatering)",
                "3. Specific actionable care recommendations",
                "Keep the response concise and practical.",
              ].join(" "),
            },
          ],
        },
      ],
    });

    // Stream the response as SSE
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Diagnose error:", error);
    return NextResponse.json({ error: "Diagnosis failed" }, { status: 500 });
  }
}
