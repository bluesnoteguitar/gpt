#!/usr/bin/env node
// ChatGPT MCP server: exposes OpenAI chat models as MCP tools over stdio.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-5";

async function openai(path, body) {
  if (!API_KEY) throw new Error("OPENAI_API_KEY is not set");
  const res = await fetch(`${BASE_URL}${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`OpenAI API ${res.status}: ${text.slice(0, 1000)}`);
  return JSON.parse(text);
}

const fail = (e) => ({ content: [{ type: "text", text: String(e?.message || e) }], isError: true });

const server = new McpServer({ name: "chatgpt", version: "1.0.0" });

server.registerTool(
  "ask_chatgpt",
  {
    description: "Send a prompt to ChatGPT (OpenAI chat model) and return its reply.",
    inputSchema: {
      prompt: z.string().describe("The question or instruction for ChatGPT"),
      system: z.string().optional().describe("Optional system prompt"),
      model: z.string().optional().describe(`Model id (default: ${DEFAULT_MODEL})`),
    },
  },
  async ({ prompt, system, model }) => {
    try {
      const messages = [];
      if (system) messages.push({ role: "system", content: system });
      messages.push({ role: "user", content: prompt });
      const data = await openai("/chat/completions", { model: model || DEFAULT_MODEL, messages });
      const reply = data.choices?.[0]?.message?.content ?? "(empty reply)";
      return { content: [{ type: "text", text: reply }] };
    } catch (e) {
      return fail(e);
    }
  }
);

server.registerTool(
  "list_models",
  { description: "List OpenAI model ids available to this API key.", inputSchema: {} },
  async () => {
    try {
      const data = await openai("/models");
      const ids = data.data.map((m) => m.id).sort().join("\n");
      return { content: [{ type: "text", text: ids }] };
    } catch (e) {
      return fail(e);
    }
  }
);

await server.connect(new StdioServerTransport());
