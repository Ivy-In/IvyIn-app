"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { getContext } from "@/lib/auth";

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB per file, as agreed.

export async function uploadFile(formData: FormData) {
  const ctx = await getContext();
  if (!ctx) redirect("/login?next=/portal/files");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/portal/files?error=nofile");
  }
  if (file.size > MAX_BYTES) {
    redirect("/portal/files?error=toolarge");
  }

  // Staff can upload for a client by passing that client's id. Clients always upload for themselves.
  // The database check on files and storage rejects any owner the user may not see.
  const requestedOwner = String(formData.get("owner_id") ?? "").trim();
  const ownerId = ctx.isStaff && requestedOwner ? requestedOwner : ctx.user.id;

  // Strip anything unsafe from the name. The stored path uses an id, so names can't collide.
  const safeName = file.name.replace(/[^\w.\- ]+/g, "_").slice(0, 200) || "file";
  const fileId = randomUUID();
  const path = `${ownerId}/${fileId}/${safeName}`;

  const { error: upErr } = await ctx.supabase.storage
    .from("client-files")
    .upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });
  if (upErr) redirect("/portal/files?error=upload");

  const { error: rowErr } = await ctx.supabase.from("files").insert({
    id: fileId,
    owner_id: ownerId,
    uploaded_by: ctx.user.id,
    storage_path: path,
    file_name: safeName,
    mime_type: file.type || null,
    size_bytes: file.size,
  });
  if (rowErr) {
    // Known limit: clients can't delete storage objects, so this leaves an orphan.
    // The reconciliation job cleans these up (see README).
    redirect("/portal/files?error=record");
  }

  revalidatePath("/portal/files");
  redirect("/portal/files?ok=1");
}
