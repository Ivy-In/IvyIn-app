"use server";

import { revalidatePath } from "next/cache";
import { getContext } from "@/lib/auth";

export async function sendMessage(formData: FormData) {
  const ctx = await getContext();
  if (!ctx) return;

  const conversationId = String(formData.get("conversation_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!conversationId || !body || body.length > 5000) return;

  // sender_id is always the signed-in user. The database rejects any other value.
  await ctx.supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: ctx.user.id,
    body,
  });

  revalidatePath("/portal/messages");
}
