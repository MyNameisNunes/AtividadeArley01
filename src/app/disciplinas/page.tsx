import type { Metadata } from "next";
import { disciplinas } from "@/data/disciplinas";
import { DisciplineCard } from "@/components/DisciplineCard";
import { IconeDisciplinas, IconeInfo } from "@/components/Icons";
import { Contador, ModuleArea, PageHeader } from "@/components/PageHeader";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Disciplinas",
};

/**
 * /disciplinas — catálogo fixo.
 *
 * Server Component: os dados são fixos e não dependem do navegador, então a
 * página inteira é gerada no servidor (pré-renderizada no build), sem JS de
 * estado. A quantidade vem do tamanho da coleção, nunca de um número fixo.
 */
export default function DisciplinasPage() {
  const total = disciplinas.length;

  return (
    <ModuleArea modulo="disciplinas">
      <PageHeader
        icone={<IconeDisciplinas tamanho={24} />}
        sobretitulo="Catálogo acadêmico"
        titulo="Disciplinas do curso"
        descricao={
          <>
            Catálogo com as disciplinas fornecidas em{" "}
            <code>src/data/disciplinas.ts</code>, identificadas por ID e nome.
          </>
        }
        indicador={
          <Contador valor={total} rotulo={total === 1 ? "disciplina" : "disciplinas"} />
        }
      />

      <p className={styles.aviso}>
        <IconeInfo tamanho={18} />
        <span>
          Área somente para consulta: as disciplinas são dados fixos e não podem
          ser cadastradas, editadas ou excluídas.
        </span>
      </p>

      <section aria-labelledby="titulo-catalogo">
        <h2 id="titulo-catalogo" className="visualmente-oculto">
          Catálogo de disciplinas
        </h2>
        <ul className={styles.grade}>
          {disciplinas.map((disciplina) => (
            <li key={disciplina.id}>
              <DisciplineCard disciplina={disciplina} />
            </li>
          ))}
        </ul>
      </section>
    </ModuleArea>
  );
}
