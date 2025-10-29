"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [loginResponse, setLoginResponse] = useState(null);

  const handleFacebookLogin = () => {
    const configId = process.env.NEXT_PUBLIC_META_CONFIG_ID;
    if (!configId) {
      console.error("NEXT_PUBLIC_META_CONFIG_ID is not defined");
      return;
    }

    window.FB.login(
      (response: any) => {
        setLoginResponse(response);
      },
      {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          feature: "whatsapp_embedded_signup",
          version: 2,
          session_info_version: 2,
        },
      }
    );
  };

  useEffect(() => {
    if (loginResponse) {
      console.log("Facebook Login Response:", loginResponse);
    }
  }, [loginResponse]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold mb-6">
        Conectar WhatsApp Business App
      </h1>
      <button
        onClick={handleFacebookLogin}
        className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
      >
        Iniciar configuração
      </button>
    </main>
  );
}
