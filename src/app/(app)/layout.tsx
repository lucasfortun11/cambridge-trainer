import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPlanStatus } from "@/lib/billing";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell
      userName={user.name ?? user.email}
      streak={user.profile?.currentStreak ?? 0}
      xp={user.profile?.xp ?? 0}
      planStatus={getPlanStatus(user.profile)}
    >
      {children}
    </AppShell>
  );
}
