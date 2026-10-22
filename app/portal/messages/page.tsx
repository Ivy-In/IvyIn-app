import { getContext } from "@/lib/auth";
import { sendMessage } from "./actions";
import LiveRefresh from "@/components/LiveRefresh";

type Msg = {
  id: string;
  body: string | null;
  sender_id: string;
  created_at: string;
  profiles: { full_name: string | null } | null;
  files: { id: string; file_name: string } | null;
};

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; error?: string }>;
}) {
  const ctx = await getContext();
  if (!ctx) return null;
  const sp = await searchParams;
  const supabase = ctx.supabase;

  // Row-level security decides which threads are returned: your own, or all clients' for staff.
  const { data: convs } = await supabase
    .from("conversations")
    .select("id, user_id, last_message_at, profiles:user_id(full_name, email)")
    .order("last_message_at", { ascending: false, nullsFirst: false });

  const active = (convs ?? []).find((c) => c.id === sp.c) ?? (convs ?? [])[0];

  let messages: Msg[] = [];
  if (active) {
    const { data } = await supabase
      .from("messages")
      .select("id, body, sender_id, created_at, profiles:sender_id(full_name), files:file_id(id, file_name)")
      .eq("conversation_id", active.id)
      .order("created_at", { ascending: true });
    messages = (data ?? []) as unknown as Msg[];
  }

  return (
    <div className="grid2">
      <LiveRefresh />
      {ctx.isStaff && (
        <aside className="card">
          <h3>Clients</h3>
          {(convs ?? []).length === 0 && <p className="muted">No conversations yet.</p>}
          <ul style={{ listStyle: "none", padding: 0 }}>
            {(convs ?? []).map((c) => {
              const p = c.profiles as unknown as { full_name: string | null; email: string | null } | null;
              return (
                <li key={c.id} style={{ padding: "6px 0" }}>
                  <a href={`/portal/messages?c=${c.id}`}>{p?.full_name ?? p?.email ?? "Client"}</a>
                </li>
              );
            })}
          </ul>
        </aside>
      )}

      <section className="card" style={{ gridColumn: ctx.isStaff ? "auto" : "1 / -1" }}>
        <h3>Messages</h3>
        {!active && <p className="muted">No conversation yet.</p>}
        {active && (
          <>
            <div>
              {messages.length === 0 && <p className="muted">No messages yet. Say hello.</p>}
              {messages.map((m) => {
                const mine = m.sender_id === ctx.user.id;
                return (
                  <div key={m.id} className={`msg ${mine ? "me" : ""}`}>
                    <div className="meta">
                      {m.profiles?.full_name ?? "Team"} · {new Date(m.created_at).toLocaleString()}
                    </div>
                    {m.body && <div>{m.body}</div>}
                    {m.files && <div className="muted">Attached: {m.files.file_name}</div>}
                  </div>
                );
              })}
            </div>
            <form action={sendMessage} style={{ marginTop: 16 }}>
              <input type="hidden" name="conversation_id" value={active.id} />
              <textarea name="body" maxLength={5000} required placeholder="Write a message…" />
              <p style={{ marginTop: 10 }}>
                <button className="btn" type="submit">Send</button>
              </p>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
