"use client";

export default function Home() {
  const onBoardingUrl =
    "https://business.facebook.com/messaging/whatsapp/onboard/?app_id=9045987662115906&config_id=1106468551317722&extras=%7B%22setup%22%3A%7B%7D%2C%22featureType%22%3A%22whatsapp_business_app_onboarding%22%2C%22sessionInfoVersion%22%3A%223%22%2C%22version%22%3A%22v3%22%2C%22features%22%3A[%7B%22name%22%3A%22marketing_messages_lite%22%7D]%7D";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold mb-6">
        Conectar WhatsApp Business App
      </h1>
      <a
        href={onBoardingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
      >
        Iniciar configuração
      </a>
    </main>
  );
}
