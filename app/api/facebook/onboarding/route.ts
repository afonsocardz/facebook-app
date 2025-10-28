import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wabaId = searchParams.get("waba_id");
  const phoneId = searchParams.get("phone_number_id");
  const accessToken = searchParams.get("access_token");
  const state = searchParams.get("state");

  if (!wabaId || !phoneId) {
    return NextResponse.json({ error: "Dados incompletos no callback" }, { status: 400 });
  }

  console.log("✅ Onboarding concluído:");
  console.log({ wabaId, phoneId, state });

  // Aqui você pode salvar no banco (ex: Prisma, Firestore, etc.)
  // e associar o cliente identificado pelo "state" ao WABA e número.

  // Depois, inscreve sua app para receber webhooks desse WABA:
  const metaToken = process.env.META_SYSTEM_USER_TOKEN!;
  const apiVersion = process.env.META_API_VERSION!;
  const res = await fetch(
    `https://graph.facebook.com/${apiVersion}/${wabaId}/subscribed_apps`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${metaToken}`,
      },
    }
  );

  const json = await res.json();
  console.log("Subscribing result:", json);

  return NextResponse.redirect("https://seu-dominio.com/sucesso");
}