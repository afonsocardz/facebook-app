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

  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const field = changes?.field;

  if (field === "messages") {
    const messages = changes?.value?.messages;
    if (messages) {
      for (const msg of messages) {
        console.log("Mensagem recebida:", msg.text?.body);
        // TODO: Processar a mensagem recebida
      }
    }
  } else if (field === "history") {
    const history = changes?.value?.history;
    console.log("📜 Evento de histórico recebido:", JSON.stringify(history, null, 2));
    // TODO: Processar o histórico de chat
  } else if (field === "smb_app_state_sync") {
    const stateSync = changes?.value?.state_sync;
    console.log("🔄 Evento de sincronização de estado recebido:", JSON.stringify(stateSync, null, 2));
    // TODO: Processar a sincronização de contatos
  } else if (field === "smb_message_echoes") {
    const echoes = changes?.value?.message_echoes;
    console.log("📢 Evento de eco de mensagem recebido:", JSON.stringify(echoes, null, 2));
    // TODO: Processar o eco da mensagem enviada pelo app
  } else {
    console.log(`Webhook de campo não tratado recebido: ${field}`);
  }

  return NextResponse.json({ received: true });
}