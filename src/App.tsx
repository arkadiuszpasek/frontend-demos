import React, { useEffect, useRef, useState } from "react";
import "./App.css";

declare global {
  interface Window {
    google?: any;
  }
}

const clientId =
  "431252099136-p02fjsce2gv2cgcfp34fd1ann53rmvmn.apps.googleusercontent.com";

export function App() {
  const buttonContainerRef = useRef<HTMLDivElement | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!window.google) return;
    if (!buttonContainerRef.current) return;

    const handleCredentialResponse = (response: any) => {
      const token = response?.credential;
      if (!token) return;

      const payloadBase64 = token.split(".")[1];
      if (!payloadBase64) return;

      const payloadJson = atob(
        payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
      );
      const payload = JSON.parse(payloadJson);

      setUserEmail(payload.email ?? null);
      console.log("Google ID token", token);
    };

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(buttonContainerRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signin_with",
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>Sign in with Google</p>
        <div ref={buttonContainerRef} />
        {userEmail && <p>Signed in as {userEmail}</p>}
      </header>
    </div>
  );
}
