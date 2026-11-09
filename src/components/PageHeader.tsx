import type { ReactNode } from "react";
import type { Modulo } from "@/types";
import styles from "./PageHeader.module.css";

/**
 * Área de um módulo. O atributo data-modulo troca as variáveis --accent-*
 * (definidas em globals.css), e todos os componentes internos herdam a cor:
 * azul (alunos), verde (disciplinas) ou laranja (matrículas).
 */
export function ModuleArea({
  modulo,
  children,
  className,
}: {
  modulo: Modulo;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-modulo={modulo} className={[styles.area, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

/** Indicador numérico de quantidade (ex.: "39 disciplinas"). */
export function Contador({
  valor,
  rotulo,
}: {
  valor: number | null;
  rotulo: string;
}) {
  return (
    <p className={styles.contador} aria-busy={valor === null}>
      <span className={`${styles.contadorValor} numero`}>
        {valor === null ? "—" : valor}
      </span>
      <span className={styles.contadorRotulo}>{rotulo}</span>
    </p>
  );
}

/** Cabeçalho de página: ícone, título, descrição, quantidade e ações. */
export function PageHeader({
  icone,
  sobretitulo,
  titulo,
  descricao,
  indicador,
  acoes,
}: {
  icone: ReactNode;
  sobretitulo: string;
  titulo: string;
  descricao?: ReactNode;
  indicador?: ReactNode;
  acoes?: ReactNode;
}) {
  return (
    <header className={styles.cabecalho}>
      <div className={styles.principal}>
        <span className={styles.icone}>{icone}</span>
        <div className={styles.textos}>
          <p className={styles.sobretitulo}>{sobretitulo}</p>
          <h1 className={styles.titulo}>{titulo}</h1>
          {descricao ? <div className={styles.descricao}>{descricao}</div> : null}
        </div>
      </div>
      {indicador || acoes ? (
        <div className={styles.lateral}>
          {indicador}
          {acoes ? <div className={styles.acoes}>{acoes}</div> : null}
        </div>
      ) : null}
    </header>
  );
}
