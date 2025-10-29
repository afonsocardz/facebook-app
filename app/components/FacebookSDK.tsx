'use client';

import Script from 'next/script';

export default function FacebookSDK() {
  return (
    <Script
      id="fb-sdk"
      strategy="lazyOnload"
      src="https://connect.facebook.net/en_US/sdk.js"
      onLoad={() => {
        window.fbAsyncInit = function () {
          window.FB.init({
            appId: process.env.NEXT_PUBLIC_META_APP_ID,
            xfbml: true,
            version: 'v20.0',
          });
        };
      }}
    />
  );
}