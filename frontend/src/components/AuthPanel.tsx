"use client";

import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";

export default function AuthPanel({ returnTo }: { returnTo: string }) {
  const [registering, setRegistering] = useState(false);
  const safeReturnTo =
    returnTo.startsWith("/") && !returnTo.startsWith("//")
      ? returnTo
      : "/productos";

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-stone-900">
          {registering ? "Crear cuenta" : "Iniciar sesión"}
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          {registering
            ? "Crea una cuenta para añadir productos a tu carrito."
            : "Inicia sesión para añadir productos a tu carrito."}
        </p>
      </div>
      {registering ? (
        <RegisterForm returnTo={safeReturnTo} />
      ) : (
        <LoginForm returnTo={safeReturnTo} />
      )}
      <p className="text-sm text-stone-600">
        {registering ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
        <button
          type="button"
          onClick={() => setRegistering((current) => !current)}
          className="font-semibold text-indigo-700 underline-offset-2 hover:underline"
        >
          {registering ? "Inicia sesión" : "Crear cuenta"}
        </button>
      </p>
    </div>
  );
}
