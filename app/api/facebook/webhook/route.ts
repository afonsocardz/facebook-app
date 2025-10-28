import { NextRequest, NextResponse } from "next/server";

// Verificação inicial exigida pelo Facebook
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    console.log("Webhook verificado!");
    return new Response(challenge, { status: 200 });
  }

  return new Response("Erro na verificação", { status: 403 });
}

// Recebimento de eventos (mensagens, status, etc.)
export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("📨 Evento recebido:", JSON.stringify(body, null, 2));

  // Exemplo: filtrar mensagens recebidas
  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const messages = changes?.value?.messages;

  if (messages) {
    for (const msg of messages) {
      console.log("Mensagem recebida:", msg.text?.body);
    }
  }

  return NextResponse.json({ received: true });
}