import { requireAdmin } from "@/lib/admin";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteAsset, uploadAsset } from "./actions";

const ERRORS: Record<string, string> = {
  nofile: "Choose an image first.",
  type: "Upload a JPG, PNG or WebP image.",
  large: "Images must be 5 MB or smaller.",
  upload: "The upload failed. Please try again.",
};

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const ctx = await requireAdmin();
  const sp = await searchParams;
  const { data: files } = await ctx.supabase.storage
    .from("site-assets")
    .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });

  return (
    <>
      <h1>Images</h1>
      <p className="muted">
        Images used on the public site. Crop and resize first with the <a href="/tools/crop-tool.html" target="_blank" rel="noreferrer">crop tool</a>,
        then upload here. Copy the link into the page content.
      </p>
      {sp.ok && (
        <div className="msg">
          Uploaded. Link: <code style={{ wordBreak: "break-all" }}>{sp.ok}</code>
        </div>
      )}
      {sp.error && <p className="error" role="alert">{ERRORS[sp.error] ?? "That did not work. Try again in a moment."}</p>}
      <div className="card">
        <form action={uploadAsset}>
          <label htmlFor="file">Image (JPG, PNG or WebP, 5 MB max)</label>
          <input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp" required />
          <p style={{ marginTop: 12 }}><button className="btn" type="submit">Upload</button></p>
        </form>
      </div>
      <div className="card">
        <h3>Uploaded images</h3>
        {(files ?? []).filter((f) => f.id).length === 0 && <p className="muted">No images yet.</p>}
        <table>
          <tbody>
            {(files ?? []).filter((f) => f.id).map((f) => {
              const { data } = ctx.supabase.storage.from("site-assets").getPublicUrl(f.name);
              return (
                <tr key={f.name}>
                  <td><a href={data.publicUrl} target="_blank" rel="noreferrer">{f.name}</a></td>
                  <td>
                    <form action={deleteAsset}>
                      <input type="hidden" name="name" value={f.name} />
                      <ConfirmButton className="btn ghost" message="Delete this image? Any page using it will show a broken image. This cannot be undone.">Delete</ConfirmButton>
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
