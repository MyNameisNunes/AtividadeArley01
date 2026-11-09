import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import styles from "./Button.module.css";

type Variante = "primario" | "secundario" | "discreto";

interface Aparencia {
  variante?: Variante;
  icone?: ReactNode;
}

function classes(variante: Variante, extra?: string): string {
  return [styles.botao, styles[variante], extra].filter(Boolean).join(" ");
}

/** Botão de ação (submit de formulários, por exemplo). */
export function Button({
  variante = "primario",
  icone,
  className,
  children,
  type = "button",
  ...props
}: ComponentProps<"button"> & Aparencia) {
  return (
    <button type={type} className={classes(variante, className)} {...props}>
      {icone}
      <span>{children}</span>
    </button>
  );
}

/** Link com aparência de botão (navegação entre rotas via next/link). */
export function ButtonLink({
  variante = "primario",
  icone,
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & Aparencia) {
  return (
    <Link className={classes(variante, className)} {...props}>
      {icone}
      <span>{children}</span>
    </Link>
  );
}
