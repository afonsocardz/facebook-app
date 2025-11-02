"use client";

import { useCallback } from "react";

// Declaração para que o TypeScript reconheça o FB global
declare global {
  interface Window {
    FB: any;
  }
}

export default function LoginButton() {
  const handleLogin = useCallback(() => {
    if (!window.FB) {
      console.error("Facebook SDK not loaded.");
      return;
    }

    window.FB.login(
      function (response: any) {
        if (response.authResponse) {
          console.log("Login successful!", response);
          // Enviar o código para o backend
          fetch("/api/facebook/onboarding", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code: response.authResponse.code }),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log("Onboarding response:", data);
              alert("Onboarding successful! Check the server logs.");
            })
            .catch((err) => {
              console.error("Onboarding failed:", err);
              alert("Onboarding failed. Check the console and server logs.");
            });
        } else {
          console.log("User cancelled login or did not fully authorize.");
        }
      },
      {
        config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          feature: "whatsapp_business_app_onboarding",
          setup: {},
          session_info_version: 2,
        },
      }
    );
  }, []);

  return (
    <button
      onClick={handleLogin}
      className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
    >
      Conectar com WhatsApp
    </button>
  );
}