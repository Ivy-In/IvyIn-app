import Link from "next/link";

// Logo at the top of the log in, sign up and MFA pages. Links back to the landing page.
export function AuthBrand() {
  return (
    <Link href="/" className="mk-brand auth-brand" aria-label="IvyIn home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-header-light.png" alt="IvyIn" width={1488} height={458} />
    </Link>
  );
}
