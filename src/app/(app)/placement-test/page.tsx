import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PlacementTestRunner } from "@/components/placement/PlacementTestRunner";

export default async function PlacementTestPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div>
      <div className="mx-auto mb-6 max-w-xl text-center">
        <h1 className="text-xl font-semibold text-foreground">Test de nivel inicial</h1>
        <p className="text-sm text-muted-foreground">
          40 preguntas de Grammar, Vocabulary, Reading, Use of English y Listening,
          desde nivel A1 hasta C2. Tardarás unos 20 minutos.
        </p>
      </div>
      <PlacementTestRunner />
    </div>
  );
}
