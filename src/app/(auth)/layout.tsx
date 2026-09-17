import { GraduationCap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-8 flex items-center gap-2 text-xl font-semibold text-foreground">
        <GraduationCap className="h-7 w-7 text-primary" />
        Cambridge Trainer
      </div>
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
