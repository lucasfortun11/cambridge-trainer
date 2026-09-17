import { Info } from "lucide-react";

export function EmptyStateBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-surface-muted p-4">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div>
        <p className="text-sm font-medium text-foreground">
          Todavía no tienes datos de progreso
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Completa el test de nivel inicial y algunos ejercicios para que tus
          estadísticas y recomendaciones aparezcan aquí automáticamente.
        </p>
      </div>
    </div>
  );
}
