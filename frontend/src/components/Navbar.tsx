"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { useStore } from "@/components/StoreProvider";
import type { CreateOrderResponse } from "@/lib/types";

interface NavbarProps {
  authenticated: boolean;
  userName: string | null;
}

const actionClass =
  "rounded-lg px-3 py-2 text-sm font-semibold text-yellow-400 transition hover:bg-white/10 hover:text-yellow-200";

export default function Navbar({ authenticated, userName }: NavbarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const { items, itemCount, removeFromCart, clearCart } = useStore();

  useEffect(() => {
    // Wait for this Suspense-delayed client component to hydrate before showing localStorage data.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  const visibleItemCount = hydrated ? itemCount : 0;
  const total = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  async function handleCheckout() {
    if (!authenticated || items.length === 0 || checkingOut) {
      return;
    }

    setCheckoutError(null);
    setCheckingOut(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ product, quantity }) => ({
            product_id: product.id,
            quantity,
          })),
        }),
      });
      const result = (await response.json()) as
        | CreateOrderResponse
        | { message?: string };

      if (!response.ok || !("data" in result)) {
        setCheckoutError(
          "message" in result && result.message
            ? result.message
            : "No se pudo realizar la compra."
        );
        return;
      }

      clearCart();
      setCartOpen(false);
      router.push(`/ordenes?creada=${result.data.id}`);
      router.refresh();
    } catch {
      setCheckoutError("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-2xl font-bold text-yellow-400"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          TECH-STORE
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/productos" className={actionClass}>
            Productos
          </Link>
          {authenticated ? (
            <>
              <Link href="/ordenes" className={actionClass}>
                Órdenes
              </Link>
             
             
               <span className="text-sm font-medium text-white">
                 <LogoutButton className={actionClass} />
                Hola, {userName || "usuario"}
              </span>
              <button
            type="button"
            onClick={() => setCartOpen((open) => !open)}
            aria-expanded={cartOpen}
            className={actionClass}
          >
            Carrito ({visibleItemCount})
          </button>
            </>
          ) : (
            <Link href="/login" className={actionClass}>
              Iniciar sesión
            </Link>
          )}
          
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
        >
          <span className="h-0.5 w-6 bg-white" />
          <span className="h-0.5 w-6 bg-white" />
          <span className="h-0.5 w-6 bg-white" />
        </button>
      </nav>

      {menuOpen && (
        <div className="space-y-2 border-t border-white/10 px-6 py-4 md:hidden">
          <Link
            href="/productos"
            className="block py-2 text-yellow-400"
            onClick={() => setMenuOpen(false)}
          >
            Productos
          </Link>
          {authenticated ? (
            <>
               <p className="py-2 text-white">Hola, {userName || "usuario"}</p>
              <Link
                href="/ordenes"
                className="block py-2 text-yellow-400"
                onClick={() => setMenuOpen(false)}
              >
                Órdenes
              </Link>
             <button
            type="button"
            onClick={() => setCartOpen((open) => !open)}
            aria-expanded={cartOpen}
            className="block py-2 text-left text-yellow-400"
          >
            Carrito ({visibleItemCount})
          </button>
              <LogoutButton className={`${actionClass} -ml-3`} />
            </>
          ) : (
            <Link
              href="/login"
              className="block py-2 text-yellow-400"
              onClick={() => setMenuOpen(false)}
            >
              Iniciar sesión
            </Link>
          )}
          
        </div>
      )}

      {cartOpen && (
        <aside
          aria-label="Carrito de compras"
          className="absolute right-4 top-full z-50 w-[min(24rem,calc(100vw-2rem))] rounded-b-xl border border-stone-200 bg-white p-4 text-stone-900 shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Tu carrito</h2>
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              className="text-sm text-stone-500 hover:text-stone-900"
              aria-label="Cerrar carrito"
            >
              Cerrar
            </button>
          </div>
          {items.length === 0 ? (
            <p className="py-3 text-sm text-stone-500">
              Aún no has añadido productos.
            </p>
          ) : (
            <>
              <ul className="max-h-72 space-y-3 overflow-y-auto">
                {items.map(({ product, quantity }) => (
                  <li
                    key={product.id}
                    className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-stone-500">
                        {quantity} × ${Number(product.price).toFixed(2)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(product.id)}
                      className="text-sm font-medium text-rose-600 hover:text-rose-800"
                      aria-label={`Quitar ${product.name} del carrito`}
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-right font-semibold">
                Total: ${total.toFixed(2)}
              </p>
              {checkoutError && (
                <p role="alert" className="mt-3 text-sm text-rose-600">
                  {checkoutError}
                </p>
              )}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={!authenticated || checkingOut}
                className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkingOut ? "Procesando..." : "Realizar compra"}
              </button>
            </>
          )}
        </aside>
      )}
    </header>
  );
}
