import { runMaintenance } from "@/lib/maintenance";

export const dynamic = "force-dynamic";

// Vercel Cron sends "Authorization: Bearer <CRON_SECRET>". Anything else gets a 401.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const report = await runMaintenance();
    return Response.json({ ok: true, ...report });
  } catch (err) {
    // Log the detail server-side only. The response stays generic.
    console.error("maintenance failed", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
