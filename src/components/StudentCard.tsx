import Link from "next/link";
import type { Aluno } from "@/types";
import { IconeChevron } from "@/components/Icons";
import { iniciais, pluralizar } from "@/lib/formatacao";
import styles from "./StudentCard.module.css";

/** Item da lista de alunos, com link para a página de detalhes. */
export function StudentCard({
  aluno,
  totalMatriculas,
  cadastradoNoNavegador,
  destacado,
}: {
  aluno: Aluno;
  totalMatriculas: number;
  cadastradoNoNavegador: boolean;
  destacado: boolean;
}) {
  return (
    <Link
      href={`/alunos/${aluno.ra}`}
      className={`${styles.cartao} ${destacado ? styles.destacado : ""}`}
    >
      <span className={styles.avatar} aria-hidden="true">
        {iniciais(aluno.name)}
      </span>
      <span className={styles.info}>
        <span className={styles.nome}>
          {aluno.name}
          {cadastradoNoNavegador ? (
            <span className={styles.selo}>
              Novo<span className="visualmente-oculto"> — cadastrado neste navegador</span>
            </span>
          ) : null}
        </span>
        <span className={styles.meta}>
          <span className={`${styles.ra} numero`}>RA {aluno.ra}</span>
          <span aria-hidden="true">·</span>
          <span>{pluralizar(totalMatriculas, "matrícula", "matrículas")}</span>
        </span>
      </span>
      <span className={styles.acao}>
        Ver detalhes
        <IconeChevron tamanho={18} />
      </span>
    </Link>
  );
}
