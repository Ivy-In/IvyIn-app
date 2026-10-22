import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/mail";
import { GB, PLAN_BYTES, levelFor } from "@/lib/storage";

const BATCH = 200;
const MAX_ROUNDS = 50;

// Runs once a day from Vercel Cron (see vercel.json).
// 1. Removes the bytes for files that were deleted in the app.
// 2. Removes uploads that were stored but never recorded (older than an hour).
// 3. Checks total storage against the plan and emails ALERT_EMAIL past 40 GB or 45 GB.
export async function runMaintenance() {
  const admin = createAdminClient();
  const report: Record<string, unknown> = {};

  // 1. Deletion queue. A failed storage call leaves rows queued, so the next run retries them.
  let removed = 0;
  for (let round = 0; round < MAX_ROUNDS; round++) {
    const { data: rows, error } = await admin
      .from("storage_deletions")
      .select("id, storage_path")
      .is("processed_at", null)
      .order("id")
      .limit(BATCH);
    if (error) throw new Error(`queue read failed: ${error.message}`);
    if (!rows || rows.length === 0) break;

    const { error: rmErr } = await admin.storage
      .from("client-files")
      .remove(rows.map((r) => r.storage_path));
    if (rmErr) throw new Error(`storage delete failed: ${rmErr.message}`);

    const { error: upErr } = await admin
      .from("storage_deletions")
      .update({ processed_at: new Date().toISOString() })
      .in("id", rows.map((r) => r.id));
    if (upErr) throw new Error(`queue update failed: ${upErr.message}`);

    removed += rows.length;
    if (rows.length < BATCH) break;
  }
  report.deleted_objects = removed;

  // 2. Orphans from uploads that stored the bytes but failed to record them.
  const { data: orphans, error: orphanErr } = await admin.rpc("orphan_storage_objects", {
    min_age: "1 hour",
  });
  if (orphanErr) throw new Error(`orphan scan failed: ${orphanErr.message}`);
  const orphanPaths = (orphans ?? []).map((o: { name: string }) => o.name);
  for (let i = 0; i < orphanPaths.length; i += BATCH) {
    const { error } = await admin.storage.from("client-files").remove(orphanPaths.slice(i, i + BATCH));
    if (error) throw new Error(`orphan delete failed: ${error.message}`);
  }
  report.orphans_removed = orphanPaths.length;

  // 3. Usage against the plan.
  const { data: usage, error: usageErr } = await admin.rpc("storage_usage_bytes");
  if (usageErr) throw new Error(`usage read failed: ${usageErr.message}`);
  const bytes = Number(usage ?? 0);
  const level = levelFor(bytes);
  report.usage_gb = Number((bytes / GB).toFixed(2));
  report.plan_gb = PLAN_BYTES / GB;
  report.level = level;

  if (level !== "ok" && process.env.ALERT_EMAIL) {
    report.alert_sent = await sendEmail({
      to: process.env.ALERT_EMAIL,
      subject: `IvyIn storage ${level}: ${(bytes / GB).toFixed(1)} GB of 50 GB used`,
      text: `Storage is at ${(bytes / GB).toFixed(2)} GB of the 50 GB plan. Review files in the admin Files page and delete what is no longer needed.`,
    });
  }

  return report;
}
