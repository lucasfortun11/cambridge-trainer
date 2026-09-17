import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatWindow } from "@/components/tutor/ChatWindow";

export default async function AiTutorPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const messages = await prisma.chatMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  const providerKind = process.env.AI_PROVIDER ?? "mock";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <MessageCircle className="h-5 w-5 text-primary" />
          Habla con mi profesor de inglés
        </h1>
        <p className="text-sm text-muted-foreground">
          {providerKind === "mock" ? (
            <>
              Usando el proveedor de IA de prueba (mock). Conecta una API real en{" "}
              <code className="rounded bg-surface-muted px-1 py-0.5 text-xs">src/lib/ai</code>{" "}
              para respuestas genuinas.
            </>
          ) : (
            <>Conectado a {providerKind} para respuestas reales.</>
          )}
        </p>
      </div>

      <ChatWindow
        initialMessages={messages.map((m) => ({ id: m.id, role: m.role, content: m.content }))}
      />
    </div>
  );
}
