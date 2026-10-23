import { createServerFn } from "@tanstack/react-start";
import { serverPass } from "@/lib/engine";

export const runServerPipeline = createServerFn({ method: "POST" })
  .validator((input: { chunks?: number }) => ({ chunks: Math.min(8, Math.max(1, input.chunks ?? 4)) }))
  .handler(async ({ data }) => serverPass(data.chunks));

export const askDesk = createServerFn({ method: "POST" })
  .validator((input: { problem: string; claims: string[]; gaps: string[] }) => ({
    problem: String(input.problem ?? "").slice(0, 400),
    claims: (input.claims ?? []).slice(0, 8).map((c) => String(c).slice(0, 240)),
    gaps: (input.gaps ?? []).slice(0, 4).map((g) => String(g).slice(0, 200)),
  }))
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "AI is not available in this environment" };
    if (data.claims.length === 0) return { ok: false as const, error: "Accept a claim first. The agent does not invent evidence." };

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 320,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are the papershub desk. Use only the claims and gaps given. Do not invent papers, spans, or citations. Reply in four short lines: Next experiment. Gap it closes. Claim it depends on. What must not be treated as evidence.",
          },
          {
            role: "user",
            content: `Problem: ${data.problem}\nAccepted claims:\n${data.claims.map((c) => `- ${c}`).join("\n")}\nGaps:\n${data.gaps.map((g) => `- ${g}`).join("\n")}`,
          },
        ],
      }),
    });
    if (!res.ok) return { ok: false as const, error: `The desk could not answer (${res.status}).` };
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { ok: true as const, text: body.choices?.[0]?.message?.content ?? "" };
  });
