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

export async function POST(req: NextRequest) {
  try {
    const { code, redirect_uri } = await req.json();

    if (!code || !redirect_uri) {
      return NextResponse.json({ error: "Missing code or redirect_uri" }, { status: 400 });
    }

    const clientId = process.env.NEXT_PUBLIC_META_APP_ID; // Assuming this is the client_id
    const clientSecret = process.env.META_APP_SECRET; // Assuming this is the client_secret

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "Missing client ID or client secret environment variables" }, { status: 500 });
    }

    const tokenExchangeUrl = `https://graph.facebook.com/v22.0/oauth/access_token`;
    const response = await fetch(tokenExchangeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: redirect_uri,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      console.error("Error exchanging code for access token:", data);
      return NextResponse.json({ error: data.error?.message || "Failed to exchange code for access token" }, { status: response.status });
    }
  } catch (error) {
    console.error("Server error during token exchange:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
