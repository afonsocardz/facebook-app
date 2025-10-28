"use client";
import { useCallback } from "react";

export default function Home() {
  const startOnboarding = useCallback(() => {
    const appId = process.env.NEXT_PUBLIC_META_APP_ID || "";
    const redirectUri = process.env.NEXT_PUBLIC_META_REDIRECT_URI || "";
    const state = crypto.randomUUID(); // identifica o cliente no retorno

    const signupUrl = `https://www.facebook.com/dialog/whatsapp_business_signup?app_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${state}`;

    window.open(signupUrl, "_blank", "width=800,height=800");
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold mb-6">
        Conectar WhatsApp Business App
      </h1>
      <button
        onClick={startOnboarding}
        className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
      >
        Iniciar configuração
      </button>
    </main>
  );
}