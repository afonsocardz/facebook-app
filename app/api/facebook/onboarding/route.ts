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

    const wabaId = wabaIds[0]; // Usando o primeiro WABA encontrado

    // 3. Inscrever o aplicativo para receber webhooks do WABA
    const subResponse = await fetch(
      `https://graph.facebook.com/${META_API_VERSION}/${wabaId}/subscribed_apps`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscribed_fields: ["messages", "message_echoes", "message_template_status", "history", "smb_app_state_sync"],
        })
      }
    );
    const subData = await subResponse.json();
    if (!subResponse.ok) {
      console.error(`Failed to subscribe WABA ${wabaId}:`, subData);
      throw new Error(`Failed to subscribe WABA ${wabaId}`);
    }
    console.log(`Successfully subscribed app to WABA ${wabaId}`);

    // 4. Obter os números de telefone associados ao WABA
    const phoneNumbersResponse = await fetch(
      `https://graph.facebook.com/${META_API_VERSION}/${wabaId}/phone_numbers?access_token=${userAccessToken}`
    );
    const phoneNumbersData = await phoneNumbersResponse.json();

    if (!phoneNumbersData.data || phoneNumbersData.data.length === 0) {
      return NextResponse.json({ error: "No phone numbers found for this WABA" }, { status: 400 });
    }

    console.log(`Found ${phoneNumbersData.data.length} phone number(s).`);

    // 5. Para cada número, iniciar a sincronização de dados
    const syncPromises = phoneNumbersData.data.map(async (phone: any) => {
      const businessPhoneNumberId = phone.id;
      console.log(`Initiating sync for phone number ID: ${businessPhoneNumberId}`);

      // Iniciar sincronização de contatos
      const syncContactsResponse = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${businessPhoneNumberId}/smb_app_data`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            sync_type: "smb_app_state_sync",
          }),
        }
      );
      const syncContactsData = await syncContactsResponse.json();
      if (!syncContactsResponse.ok) {
        console.error(`Failed to initiate contact sync for ${businessPhoneNumberId}:`, syncContactsData);
      }
      console.log(`Contact sync initiated for ${businessPhoneNumberId}:`, syncContactsData);

      // Iniciar sincronização de histórico
      const syncHistoryResponse = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${businessPhoneNumberId}/smb_app_data`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            sync_type: "history",
          }),
        }
      );
      const syncHistoryData = await syncHistoryResponse.json();
      if (!syncHistoryResponse.ok) {
        console.error(`Failed to initiate history sync for ${businessPhoneNumberId}:`, syncHistoryData);
      }
      console.log(`History sync initiated for ${businessPhoneNumberId}:`, syncHistoryData);

      return { businessPhoneNumberId, contacts: syncContactsData, history: syncHistoryData };
    });

    const syncResults = await Promise.all(syncPromises);

    return NextResponse.json({ success: true, wabaId, syncResults });

  } catch (error) {
    console.error("Server error during onboarding:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}