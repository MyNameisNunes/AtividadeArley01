import type { ReactNode, SVGProps } from "react";

/**
 * Ícones em SVG inline (sem biblioteca externa). São decorativos: recebem
 * aria-hidden, e o significado é sempre transmitido também por texto.
 */
type IconeProps = SVGProps<SVGSVGElement> & { tamanho?: number };

function Icone({
  tamanho = 20,
  children,
  ...props
}: IconeProps & { children: ReactNode }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconeAlunos(props: IconeProps) {
  return (
    <Icone {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 19.5c.8-3.4 3.5-5.5 6.5-5.5s5.7 2.1 6.5 5.5" />
      <path d="M15.5 4.8a3.5 3.5 0 0 1 0 6.4" />
      <path d="M18 14.4c1.8.8 3 2.6 3.5 5.1" />
    </Icone>
  );
}

export function IconeDisciplinas(props: IconeProps) {
  return (
    <Icone {...props}>
      <path d="M12 6.5C10.3 5.2 8 4.5 5 4.5H3v14h2c3 0 5.3.7 7 2 1.7-1.3 4-2 7-2h2v-14h-2c-3 0-5.3.7-7 2Z" />
      <path d="M12 6.5v14" />
    </Icone>
  );
}

export function IconeMatriculas(props: IconeProps) {
  return (
    <Icone {...props}>
      <rect x="5" y="4.5" width="14" height="16.5" rx="2" />
      <rect x="9" y="2.75" width="6" height="3.5" rx="1" />
      <path d="M8.5 11.5h7M8.5 15.5h4.5" />
    </Icone>
  );
}

export function IconeInicio(props: IconeProps) {
  return (
    <Icone {...props}>
      <path d="M3.5 10.5 12 4l8.5 6.5" />
      <path d="M5.5 9v10.5h13V9" />
      <path d="M10 19.5v-5h4v5" />
    </Icone>
  );
}

export function IconeMais(props: IconeProps) {
  return (
    <Icone {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icone>
  );
}

export function IconeVoltar(props: IconeProps) {
  return (
    <Icone {...props}>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </Icone>
  );
}

export function IconeSeta(props: IconeProps) {
  return (
    <Icone {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Icone>
  );
}

export function IconeChevron(props: IconeProps) {
  return (
    <Icone {...props}>
      <path d="m9 6 6 6-6 6" />
    </Icone>
  );
}

export function IconeSucesso(props: IconeProps) {
  return (
    <Icone {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.5 2.5L16 9.5" />
    </Icone>
  );
}

export function IconeErro(props: IconeProps) {
  return (
    <Icone {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </Icone>
  );
}

export function IconeAlerta(props: IconeProps) {
  return (
    <Icone {...props}>
      <path d="M10.3 4.3 2.8 17.5A2 2 0 0 0 4.5 20.5h15a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9.5v4" />
      <path d="M12 17h.01" />
    </Icone>
  );
}

export function IconeInfo(props: IconeProps) {
  return (
    <Icone {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </Icone>
  );
}

export function IconeArmazenamento(props: IconeProps) {
  return (
    <Icone {...props}>
      <ellipse cx="12" cy="6" rx="7" ry="2.5" />
      <path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6" />
      <path d="M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" />
    </Icone>
  );
}

export function IconeCodigo(props: IconeProps) {
  return (
    <Icone {...props}>
      <path d="m8 7-5 5 5 5M16 7l5 5-5 5" />
    </Icone>
  );
}

export function IconeBussola(props: IconeProps) {
  return (
    <Icone {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </Icone>
  );
}

export function IconeIdentificacao(props: IconeProps) {
  return (
    <Icone {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M6 16c.5-1.3 1.6-2 3-2s2.5.7 3 2" />
      <path d="M14.5 10h4M14.5 13h3" />
    </Icone>
  );
}
