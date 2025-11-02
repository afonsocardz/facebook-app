import { NextRequest, NextResponse } from "next/server";

/**
 * Lida com o callback do fluxo de Embedded Signup do Facebook.
 * Recebe um código de autorização de curta duração, troca-o por um token de acesso de longa duração,
 * busca as contas do WhatsApp Business (WABAs) associadas e inscreve o aplicativo para receber webhooks de cada uma.
 */
export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Authorization code is missing" }, { status: 400 });
    }

    const { META_APP_ID, META_APP_SECRET, META_API_VERSION, META_SYSTEM_USER_TOKEN } = process.env;

    if (!META_APP_ID || !META_APP_SECRET) {
      console.error("Missing META_APP_ID or META_APP_SECRET environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // 1. Trocar o código por um token de acesso do usuário
    const tokenResponse = await fetch(
      `https://graph.facebook.com/${META_API_VERSION}/oauth/access_token?client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&code=${code}`
    );
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Error exchanging code for token:", tokenData.error);
      return NextResponse.json({ error: "Failed to exchange code for access token" }, { status: 400 });
    }

    const userAccessToken = tokenData.access_token;

    // 2. Usar o token de acesso para obter as contas do WhatsApp Business (WABAs) compartilhadas
    // O endpoint debug_token é uma forma de obter os metadados do token, incluindo os WABAs
    const debugTokenResponse = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${userAccessToken}&access_token=${META_SYSTEM_USER_TOKEN}`
    );
    const debugTokenData = await debugTokenResponse.json();

    if (!debugTokenData.data || !debugTokenData.data.granular_scopes) {
      console.error("Failed to get granular scopes from debug_token:", debugTokenData);
      return NextResponse.json({ error: "Failed to retrieve WhatsApp accounts" }, { status: 400 });
    }

    const wabaIds = debugTokenData.data.granular_scopes
      .filter((scope: any) => scope.scope === "whatsapp_business_management")
      .flatMap((scope: any) => scope.target_ids || []);

    if (wabaIds.length === 0) {
      return NextResponse.json({ error: "No WhatsApp Business Account found" }, { status: 400 });
    }

    console.log(`Found ${wabaIds.length} WABA(s):`, wabaIds);

    // 3. Para cada WABA, inscrever o aplicativo para receber webhooks
    const subscriptionPromises = wabaIds.map(async (wabaId: string) => {
      const subResponse = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${wabaId}/subscribed_apps`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
          },
        }
      );
      const subData = await subResponse.json();
      if (!subResponse.ok) {
        console.error(`Failed to subscribe WABA ${wabaId}:`, subData);
        throw new Error(`Failed to subscribe WABA ${wabaId}`);
      }
      console.log(`Successfully subscribed app to WABA ${wabaId}`);
      return { wabaId, success: true };
    });

    const subscriptionResults = await Promise.all(subscriptionPromises);

    // Aqui você deve salvar o userAccessToken e os wabaIds no seu banco de dados,
    // associando-os ao seu cliente/usuário.

    return NextResponse.json({ success: true, subscribed_wabas: subscriptionResults });

  } catch (error) {
    console.error("Server error during onboarding:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}