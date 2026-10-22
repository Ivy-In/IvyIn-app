import { getContext } from "@/lib/auth";
import { uploadFile } from "./actions";

const ERRORS: Record<string, string> = {
  nofile: "Choose a file to upload.",
  toolarge: "That file is larger than 50 MB. Please choose a smaller file.",
  upload: "The upload failed. Please try again.",
  record: "The file was uploaded but could not be recorded. Tell the team.",
};

export default async function FilesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const ctx = await getContext();
  if (!ctx) return null;
  const sp = await searchParams;

  // Row-level security decides which files are returned: your own, or all clients' for staff.
  const { data: files } = await ctx.supabase
    .from("files")
    .select("id, file_name, size_bytes, created_at, storage_path, owner_id, profiles:owner_id(full_name, email)")
    .order("created_at", { ascending: false });

  // Short-lived links. Creating one requires read access, so RLS applies here too.
  const rows = await Promise.all(
    (files ?? []).map(async (f) => {
      const { data: signed } = await ctx.supabase.storage
        .from("client-files")
        .createSignedUrl(f.storage_path, 60 * 10);
      return { ...f, url: signed?.signedUrl ?? null };
    })
  );

  // Staff need to choose which client a file belongs to.
  let clients: { id: string; full_name: string | null; email: string | null }[] = [];
  if (ctx.isStaff) {
    const { data } = await ctx.supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "user")
      .order("full_name");
    clients = data ?? [];
  }

  return (
    <>
      <div className="card">
        <h3>Upload a file</h3>
        <p className="muted">PDF, Word, or image files, up to 50 MB each.</p>
        {sp.ok && <p className="msg">Uploaded.</p>}
        {sp.error && <p className="error">{ERRORS[sp.error] ?? "Something went wrong."}</p>}
        <form action={uploadFile}>
          {ctx.isStaff && (
            <>
              <label htmlFor="owner_id">For client</label>
              <select id="owner_id" name="owner_id" required>
                <option value="">Choose a client…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name ?? c.email}
                  </option>
                ))}
              </select>
            </>
          )}
          <label htmlFor="file">File</label>
          <input id="file" name="file" type="file" required />
          <p style={{ marginTop: 14 }}>
            <button className="btn" type="submit">Upload</button>
          </p>
        </form>
      </div>

      <div className="card">
        <h3>{ctx.isStaff ? "All client files" : "Your files"}</h3>
        {rows.length === 0 && <p className="muted">No files yet.</p>}
        {rows.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                {ctx.isStaff && <th>Client</th>}
                <th>Size</th>
                <th>Added</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => {
                const owner = f.profiles as unknown as { full_name: string | null; email: string | null } | null;
                return (
                  <tr key={f.id}>
                    <td>{f.file_name}</td>
                    {ctx.isStaff && <td>{owner?.full_name ?? owner?.email ?? "—"}</td>}
                    <td>{f.size_bytes ? `${(f.size_bytes / 1024 / 1024).toFixed(1)} MB` : "—"}</td>
                    <td>{new Date(f.created_at).toLocaleDateString()}</td>
                    <td>{f.url && <a href={f.url}>Download</a>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
