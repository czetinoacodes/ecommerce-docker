import AuthPanel from "@/components/AuthPanel";
import { Suspense } from "react";

interface LoginPageProps {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center text-stone-500">
          Cargando...
        </div>
      }
    >
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginContent({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const returnTo =
    typeof params.returnTo === "string" ? params.returnTo : "/productos";

  return <AuthPanel returnTo={returnTo} />;
}
