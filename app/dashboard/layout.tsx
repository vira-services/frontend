import { FloatingDock } from "@/components/floating-dock";
import { SiteHeader } from "@/components/site-header";
import getAccount from "@/lib/api/data/users/getAccount";
import { UserProvider } from "./_user-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = await getAccount();
  if (!account) return null;
  return (
    <UserProvider initialUser={account}>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex flex-1 flex-col pb-28">
          {children}
        </main>
        <FloatingDock />
      </div>
    </UserProvider>
  );
}
