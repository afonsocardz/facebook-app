"use client";

import FacebookSDK from "./components/FacebookSDK";
import { useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = () => {
    if (!window.FB) {
      setMessage("Facebook SDK não carregou ainda. Tente novamente em alguns segundos.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    window.FB.login(
      function (response: any) {
        if (response.authResponse && response.authResponse.code) {
          setMessage("Autenticação bem-sucedida! Processando integração...");

          // Envia o código para o backend
          fetch("/api/facebook/onboarding", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code: response.authResponse.code }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.error) {
                throw new Error(data.error);
              }
              setMessage("Integração concluída com sucesso! As contas do WhatsApp foram conectadas.");
              setIsLoading(false);
            })
            .catch((error) => {
              console.error("Backend error:", error);
              setMessage(`Erro na integração: ${error.message}`);
              setIsLoading(false);
            });
        } else {
          setMessage("Falha na autenticação com o Facebook. O usuário cancelou ou houve um erro.");
          setIsLoading(false);
          console.log("User cancelled login or did not fully authorize.");
        }
      },
      {
        config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID, // ID de configuração do painel do app
        response_type: "code", // OBRIGATÓRIO para este fluxo
        override_default_response_type: true, // OBRIGATÓRIO para este fluxo
        scope: "whatsapp_business_management,whatsapp_business_messaging",
      }
    );
  };

  return (
    <>
      {/* Carrega o SDK do Facebook em segundo plano */}
      <FacebookSDK />

      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
            Bem-vindo à Integração WhatsApp da CCLX
          </p>
        </div>

        <div className="relative z-[-1] flex place-items-center my-16">
          <h1 className="text-4xl font-bold">Conecte sua Conta do WhatsApp</h1>
        </div>

        <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-1">
          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
            <h2 className="mb-3 text-2xl font-semibold">
              Passo 1: Conectar
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Clique no botão abaixo para iniciar a conexão segura com o Facebook e autorizar a integração com sua conta do WhatsApp Business.
            </p>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold transition-colors hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? "Processando..." : "Conectar com Facebook"}
            </button>
            {message && (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                {message}
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}