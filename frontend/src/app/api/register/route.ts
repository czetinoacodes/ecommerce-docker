import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  ApiRequestError,
  getCurrentUser,
  loginRequest,
  registerRequest,
} from "@/lib/api";
import { getUserNameFromAuthResponse, setSessionCookies } from "@/lib/session";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
  };

  if (
    !body.name?.trim() ||
    !body.email ||
    !body.password ||
    !body.password_confirmation
  ) {
    return NextResponse.json(
      { message: "Completa todos los campos." },
      { status: 400 }
    );
  }

  try {
    const account = await registerRequest({
      name: body.name.trim(),
      email: body.email,
      password: body.password,
      password_confirmation: body.password_confirmation,
    });
    const auth = account.access_token
      ? account
      : await loginRequest(body.email, body.password);

    if (!auth.access_token) {
      throw new Error("La respuesta de registro no incluye un token.");
    }

    const user = await getCurrentUser(auth.access_token);
    const response = NextResponse.json({ ok: true });
    const name = getUserNameFromAuthResponse(auth, user.name);
    setSessionCookies(response, auth.access_token, name, user.id);
    revalidatePath("/", "layout");
    return response;
  } catch (error) {
    if (!(error instanceof ApiRequestError)) {
      throw error;
    }

    const status = error.status >= 400 && error.status < 500 ? error.status : 502;
    return NextResponse.json(
      {
        message:
          status === 422
            ? "No se pudo crear la cuenta. Revisa tus datos o usa otro correo."
            : "No se pudo crear la cuenta. Inténtalo de nuevo.",
      },
      { status }
    );
  }
}
