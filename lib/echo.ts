// lib/echo.ts
import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  var echo: Echo | undefined;
}

// Singleton instance
if (!global.echo) {
  // Only run in browser
  if (typeof window !== "undefined") {
    // Pusher JS v8+ is required for Reverb
    (window as any).Pusher = Pusher;

    global.echo = new Echo({
      broadcaster: "reverb",
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY!,
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? "localhost",
      wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) ?? 8080,
      wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) ?? 8080,
      forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "https") === "https",
      enabledTransports: ["ws", "wss"] as const,
      disableStats: true,

      // This is the CORRECT way for Sanctum + Reverb
      authorizer: (channel: any) => {
        return {
          authorize: async (socketId: string, callback: Function) => {
            try {
              const response = await fetch("/api/broadcasting/auth", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  // Sanctum uses cookies → no need for Bearer token
                  // But we include X-Requested-With for Laravel
                  "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "include", // ← THIS IS CRITICAL
                body: JSON.stringify({
                  socket_id: socketId,
                  channel_name: channel.name,
                }),
              });

              if (!response.ok) throw new Error("Auth failed");

              const data = await response.json();
              callback(false, data); // success
            } catch (error) {
              console.error("Reverb auth failed:", error);
              callback(true, error); // failure
            }
          },
        };
      },
    });
  }
}

export const getEcho = (): Echo | null => {
  return global.echo ?? null;
};