import Link from "next/link";
import { useId, type Ref } from "react";
import type { MatriculaDetalhada } from "@/types";
import { ButtonLink } from "@/components/Button";
import { EmptyState } from "@/components/Feedback";
import { IconeMais, IconeMatriculas } from "@/components/Icons";
import styles from "./EnrollmentTable.module.css";

/**
 * Tabela de matrículas. Recebe as linhas JÁ relacionadas: os nomes vêm das
 * coleções de alunos e disciplinas, nunca de texto fixo na tabela.
 */
export function EnrollmentTable({
  linhas,
  chaveDestacada,
  refLinhaDestacada,
}: {
  linhas: readonly MatriculaDetalhada[];
  chaveDestacada?: string;
  /** Referência à linha destacada (para rolar até ela e focá-la). */
  refLinhaDestacada?: Ref<HTMLTableRowElement>;
}) {
  // useId gera um id único mesmo quando o Next mantém outra cópia desta
  // página oculta no DOM (navegação com <Activity>).
  const idLegenda = useId();

  if (linhas.length === 0) {
    return (
      <EmptyState
        icone={<IconeMatriculas tamanho={26} />}
        titulo="Nenhuma matrícula cadastrada"
        acoes={
          <ButtonLink href="/matriculas/nova" icone={<IconeMais tamanho={18} />}>
            Cadastrar matrícula
          </ButtonLink>
        }
      >
        <p>
          Ainda não existem vínculos entre alunos e disciplinas. Cadastre uma
          matrícula para que ela apareça nesta tabela.
        </p>
      </EmptyState>
    );
  }

  return (
    <div className={styles.moldura}>
      <div
        className={styles.rolagem}
        role="region"
        aria-labelledby={idLegenda}
        tabIndex={0}
      >
        <table className={styles.tabela}>
          <caption id={idLegenda} className={styles.legenda}>
            Matrículas cadastradas ({linhas.length})
          </caption>
          <thead>
            <tr>
              <th scope="col" className={styles.colunaIndice}>
                #
              </th>
              <th scope="col">RA</th>
              <th scope="col">Nome do aluno</th>
              <th scope="col">Nome da disciplina</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha, indice) => {
              const destacada = linha.chave === chaveDestacada;
              return (
                <tr
                  key={linha.chave}
                  ref={destacada ? refLinhaDestacada : undefined}
                  tabIndex={destacada ? -1 : undefined}
                  className={destacada ? styles.destacada : undefined}
                >
                  <td className={`${styles.colunaIndice} numero`}>{indice + 1}</td>
                  <td className={`${styles.ra} numero`}>{linha.matricula.student_ra}</td>
                  <td>
                    {linha.aluno ? (
                      <Link href={`/alunos/${linha.aluno.ra}`} className={styles.aluno}>
                        {linha.aluno.name}
                      </Link>
                    ) : (
                      <span className={styles.ausente}>Aluno não encontrado</span>
                    )}
                    {destacada ? <span className={styles.selo}>Nova</span> : null}
                  </td>
                  <td>
                    <span className={styles.disciplina}>
                      <span className={`${styles.disciplinaId} numero`}>
                        ID {linha.matricula.course_id}
                      </span>
                      {linha.disciplina ? (
                        <span>{linha.disciplina.name}</span>
                      ) : (
                        <span className={styles.ausente}>Disciplina não encontrada</span>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
