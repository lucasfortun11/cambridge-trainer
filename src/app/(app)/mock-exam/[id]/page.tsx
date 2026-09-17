import { requireOnboardedUser } from "@/lib/auth";
import { MockExamRunner } from "@/components/mock-exam/MockExamRunner";

export default async function MockExamRunnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOnboardedUser();
  const { id } = await params;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold text-foreground">Simulacro en curso</h1>
      <MockExamRunner examId={id} />
    </div>
  );
}
