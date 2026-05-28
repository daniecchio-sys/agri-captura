// ui/PlaceholderPage.tsx
// Ocupa el lugar de cada feature hasta que se implemente.
// Muestra claramente qué módulo va ahí y en qué fase.

type Props = {
  titulo: string
  descripcion: string
}

export function PlaceholderPage({ titulo, descripcion }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-campo-800 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-campo-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
        </svg>
      </div>
      <h2 className="text-lg font-medium text-campo-200">{titulo}</h2>
      <p className="text-sm text-campo-500 font-mono">{descripcion}</p>
    </div>
  )
}
