"use client";

import { useEffect, useState } from "react";

// Declaração para que o TypeScript reconheça o FB global
declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

export default function FacebookSDK() {
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);

  useEffect(() => {
    // Evita recarregar o SDK se já estiver presente
    if (document.getElementById("facebook-jssdk")) {
      setIsSdkLoaded(true);
      return;
    }

    // Define a função de inicialização global
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v20.0",
      });
      setIsSdkLoaded(true); // Marca o SDK como carregado e inicializado
    };

    // Cria e insere o elemento script para carregar o SDK
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // O componente pode opcionalmente renderizar um loader ou nada
  return null;
}
