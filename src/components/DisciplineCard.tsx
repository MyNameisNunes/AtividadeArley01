import type { Disciplina } from "@/types";
import styles from "./DisciplineCard.module.css";

/** Cartão do catálogo: apenas exibe ID e nome (sem ações). */
export function DisciplineCard({ disciplina }: { disciplina: Disciplina }) {
  const idTitulo = `disciplina-${disciplina.id}`;
  return (
    <article className={styles.cartao} aria-labelledby={idTitulo}>
      <p className={styles.id}>
        <span className={styles.idRotulo}>ID</span>
        <span className={`${styles.idValor} numero`}>{disciplina.id}</span>
      </p>
      <h3 id={idTitulo} className={styles.nome}>
        {disciplina.name}
      </h3>
    </article>
  );
}
