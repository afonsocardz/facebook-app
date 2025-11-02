"use client";

import FacebookSDK from "./components/FacebookSDK";
import LoginButton from "./components/LoginButton";

export default function Home() {
  return (
    <>
      <FacebookSDK />
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm flex flex-col gap-8">
          <h1 className="text-4xl font-bold text-center">
            CCLX WhatsApp Integration
          </h1>
          <p className="text-center">
            Clique no botão abaixo para conectar sua conta do WhatsApp Business.
          </p>
          <LoginButton />
        </div>
      </main>
    </>
  );
}
