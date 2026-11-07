"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton({ className = "text-red-500 hover:text-red-400" }: { className?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    setError(null);
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (!response.ok) {
        setError("No se pudo cerrar la sesión.");
        return;
      }

      router.refresh();
    } catch {
      setError("No se pudo cerrar la sesión.");
    }
  }

  return (
    <>
      <button type="button" onClick={handleLogout} className={className}>
        Cerrar sesión
      </button>
      {error && (
        <span role="alert" className="text-xs text-rose-300">
          {error}
        </span>
      )}
    </>
  );
}