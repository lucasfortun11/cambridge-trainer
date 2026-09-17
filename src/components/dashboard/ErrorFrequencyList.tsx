type ErrorFrequencyListProps = {
  data: { label: string; count: number }[];
};

export function ErrorFrequencyList({ data }: ErrorFrequencyListProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No has registrado errores todavía. ¡Buena señal, o aún no has practicado!
      </p>
    );
  }

  const max = Math.max(...data.map((d) => d.count));

  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-foreground">{d.label}</span>
            <span className="text-muted-foreground">{d.count}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-danger"
              style={{ width: `${Math.max(4, (d.count / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
