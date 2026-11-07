import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import type { ReactNode } from "react";
import "./globals.css";
import { ApiRequestError, getCurrentUser } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { StoreProvider } from "@/components/StoreProvider";

export const metadata: Metadata = {
  title: "Catálogo de Productos",
  description: "Frontend Next.js conectado a la API de Laravel de Productos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-stone-50 text-stone-900">
        <Suspense
          fallback={
            <SiteContent authenticated={false} userName={null} userId={null}>
              {children}
            </SiteContent>
          }
        >
          <SessionContent>{children}</SessionContent>
        </Suspense>
      </body>
    </html>
  );
}

async function SessionContent({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  let authenticated = Boolean(token);
  let userName = cookieStore.get("user_name")?.value ?? null;
  let userId = authenticated ? cookieStore.get("user_id")?.value ?? null : null;

  if (token && !userId) {
    try {
      const user = await getCurrentUser(token);
      userId = String(user.id);
      userName = user.name;
    } catch (error) {
      if (!(error instanceof ApiRequestError) || error.status !== 401) {
        throw error;
      }
      authenticated = false;
      userName = null;
    }
  }

  return (
    <SiteContent
      authenticated={authenticated}
      userName={userName}
      userId={userId}
    >
      {children}
    </SiteContent>
  );
}

function SiteContent({
  children,
  authenticated,
  userName,
  userId,
}: {
  children: ReactNode;
  authenticated: boolean;
  userName: string | null;
  userId: string | null;
}) {
  return (
    <StoreProvider userId={userId}>
      <Navbar authenticated={authenticated} userName={userName} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {children}
      </main>
    </StoreProvider>
  );
}