import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { createHash } from "crypto";

const ADMIN_COOKIE = "admin_session";
const ADMIN_SALT = "followerbase-admin-v1";

function tokenForPassword(password: string): string {
  return createHash("sha256").update(password + ADMIN_SALT).digest("hex");
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = headers().get("x-admin-path") ?? "";
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password || password.length < 8) {
    redirect("/admin/login");
  }

  const cookieStore = await cookies();
  const cookie = cookieStore.get(ADMIN_COOKIE)?.value;
  const expected = tokenForPassword(password);
  if (cookie !== expected) {
    const loginUrl = `/admin/login?from=${encodeURIComponent(pathname || "/admin")}`;
    redirect(loginUrl);
  }

  return <>{children}</>;
}
