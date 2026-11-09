/**
 * Marca do sistema: uma ficha de registro com três linhas, uma para cada
 * módulo (azul = alunos, verde = disciplinas, laranja = matrículas).
 */
export function BrandMark({ tamanho = 36 }: { tamanho?: number }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="8" fill="#1d2433" />
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="7.5"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.14"
      />
      <rect x="8" y="9" width="16" height="3.5" rx="1.75" fill="#93b4ff" />
      <rect x="8" y="14.25" width="11" height="3.5" rx="1.75" fill="#6fd69c" />
      <rect x="8" y="19.5" width="14" height="3.5" rx="1.75" fill="#ffa463" />
    </svg>
  );
}
