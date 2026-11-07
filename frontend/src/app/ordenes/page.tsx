import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ApiRequestError, getOrders } from "@/lib/api";
import type { ApiListResponse, Order } from "@/lib/types";

interface OrdersPageProps {
  searchParams: Promise<{ creada?: string; page?: string }>;
}

export default function OrdersPage({ searchParams }: OrdersPageProps) {
  return (
    <Suspense
      fallback={
        <p className="rounded-xl border border-stone-200 bg-white p-6 text-stone-600">
          Cargando órdenes...
        </p>
      }
    >
      <OrdersList searchParams={searchParams} />
    </Suspense>
  );
}

async function OrdersList({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const requestedPage = Number(params.page);
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    redirect("/login?returnTo=%2Fordenes");
  }

  let result: ApiListResponse<Order>;
  try {
    result = await getOrders(token, page);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      redirect("/login?returnTo=%2Fordenes");
    }
    throw error;
  }

  if (result.meta?.last_page && page > result.meta.last_page) {
    redirect(`/ordenes?page=${result.meta.last_page}`);
  }

  return (
    <section aria-labelledby="orders-heading">
      <h1
        id="orders-heading"
        className="text-3xl font-extrabold text-stone-900"
      >
        Órdenes
      </h1>
      <p className="mt-2 text-stone-600">
        Historial de compras realizadas con tu cuenta.
      </p>
      {params.creada && (
        <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          Compra realizada. Se creó la orden #{params.creada}.
        </p>
      )}

      {result.data.length === 0 ? (
        <p className="mt-6 rounded-xl border border-stone-200 bg-white p-6 text-stone-600">
          Aún no tienes órdenes.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {result.data.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">
                    Orden #{order.id}
                  </h2>
                  <p className="mt-1 text-sm capitalize text-stone-500">
                    Estado: {order.status}
                  </p>
                </div>
                <p className="text-xl font-bold text-indigo-700">
                  ${Number(order.total).toFixed(2)}
                </p>
              </div>
              <ul className="mt-4 space-y-2 border-t border-stone-100 pt-4">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap justify-between gap-2 text-sm text-stone-700"
                  >
                    <span>
                      {item.product} × {item.quantity}
                    </span>
                    <span>
                      ${Number(item.unit_price).toFixed(2)} c/u
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
      {(result.meta?.last_page ?? 1) > 1 && (
        <nav
          aria-label="Paginación de órdenes"
          className="mt-6 flex items-center justify-between"
        >
          {page > 1 ? (
            <Link
              href={`/ordenes?page=${page - 1}`}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-white"
            >
              Anterior
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-stone-500">
            Página {result.meta?.current_page ?? page} de{" "}
            {result.meta?.last_page}
          </span>
          {page < (result.meta?.last_page ?? page) ? (
            <Link
              href={`/ordenes?page=${page + 1}`}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-white"
            >
              Siguiente
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </section>
  );
}
