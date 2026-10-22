import { requireAdmin } from "@/lib/admin";
import { deleteFile } from "./actions";

const ERRORS: Record<string, string> = {
  confirm: "Tick the box to confirm the deletion.",
  failed: "The file could not be deleted.",
};

export default async function FilesAdmin({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}) {
  const ctx = await requireAdmin();
  const sp = await searchParams;
  const { data: rows } = await ctx.supabase
    .from("files")
    .select("id, file_name, size_bytes, created_at, profiles:owner_id(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <>
      <h1>Files</h1>
      <p className="muted">
        Files are kept until someone deletes them here. A deleted file is removed from storage by the nightly job.
      </p>
      {sp.deleted && <p className="msg">Deleted. Storage is cleared on the next nightly run.</p>}
      {sp.error && <p className="error">{ERRORS[sp.error] ?? "Something went wrong."}</p>}
      <div className="card">
        <table>
          <thead>
            <tr><th>Name</th><th>Client</th><th>Size</th><th>Added</th><th>Delete</th></tr>
          </thead>
          <tbody>
            {(rows ?? []).map((f) => {
              const owner = f.profiles as unknown as { full_name: string | null; email: string | null } | null;
              return (
                <tr key={f.id}>
                  <td>{f.file_name}</td>
                  <td>{owner?.full_name ?? owner?.email ?? "—"}</td>
                  <td>{f.size_bytes ? `${(f.size_bytes / 1024 / 1024).toFixed(1)} MB` : "—"}</td>
                  <td>{new Date(f.created_at).toLocaleDateString()}</td>
                  <td>
                    <form action={deleteFile} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input type="hidden" name="id" value={f.id} />
                      <label style={{ display: "inline", fontWeight: 400, margin: 0 }}>
                        <input type="checkbox" name="confirm" value="yes" style={{ width: "auto" }} /> sure
                      </label>
                      <button className="btn ghost" type="submit">Delete</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
