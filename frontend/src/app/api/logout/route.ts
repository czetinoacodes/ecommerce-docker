import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("token");
  response.cookies.delete("user_name");
  response.cookies.delete("user_id");
  revalidatePath("/login", "layout");
  return response;
}