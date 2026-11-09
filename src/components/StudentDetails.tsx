"use client";

import { useId, useMemo } from "react";
import { disciplinas } from "@/data/disciplinas";
import { ButtonLink } from "@/components/Button";
import { EmptyState, LoadingState } from "@/components/Feedback";
import {
  IconeAlerta,
  IconeDisciplinas,
  IconeIdentificacao,
  IconeMais,
  IconeVoltar,
} from "@/components/Icons";
import { useApp } from "@/hooks/useApp";
import { iniciais, pluralizar } from "@/lib/formatacao";
import { disciplinasDoAluno } from "@/lib/relacionamentos";
import styles from "./StudentDetails.module.css";

/** Mostra um trecho seguro do valor digitado na URL. */
function resumirParametro(valor: string): string {
  return valor.length > 24 ? `${valor.slice(0, 24)}…` : valor;
}

/**
 * Detalhes de um aluno. Recebe o RA obtido da rota dinâmica /alunos/[ra]
 * (sempre uma string) e procura o aluno correspondente na coleção.
 */
export function StudentDetails({ ra }: { ra: string }) {
  const { carregado, alunos, matriculas, cadastrosLocais } = useApp();
  // Ids únicos mesmo com várias páginas de detalhes mantidas no DOM.
  const idNome = useId();
  const idDisciplinas = useId();

  // O parâmetro da rota é texto; o RA nos dados é number. Só aceita a forma
  // canônica (sem zero à esquerda): "/alunos/0258001" não é o RA 258001.
  const raNumerico = /^[1-9]\d*$/.test(ra) ? Number(ra) : null;
  const aluno =
    raNumerico === null ? undefined : alunos.find((item) => item.ra === raNumerico);

  const disciplinasMatriculadas = useMemo(
    () => (aluno ? disciplinasDoAluno(aluno.ra, matriculas, disciplinas) : []),
    [aluno, matriculas],
  );

  if (!carregado) {
    return <LoadingState linhas={3} rotulo="Carregando dados do aluno…" />;
  }

  if (!aluno) {
    return (
      <EmptyState
        icone={<IconeAlerta tamanho={26} />}
        titulo="Aluno não encontrado"
        acoes={
          <ButtonLink href="/alunos" icone={<IconeVoltar tamanho={18} />}>
            Voltar para a lista de alunos
          </ButtonLink>
        }
      >
        <p>
          {raNumerico === null ? (
            <>
              O valor <strong>“{resumirParametro(ra)}”</strong> não é um RA
              válido: o RA é composto apenas por números e não começa com zero.
            </>
          ) : (
            <>
              Não existe aluno cadastrado com o RA{" "}
              <strong className="numero">{resumirParametro(ra)}</strong>. Verifique
              o número ou consulte a lista de alunos.
            </>
          )}
        </p>
      </EmptyState>
    );
  }

  const cadastradoNoNavegador = cadastrosLocais.alunos.some(
    (item) => item.ra === aluno.ra,
  );

  return (
    <div className={styles.detalhes}>
      <article className={styles.perfil} aria-labelledby={idNome}>
        <div className={styles.perfilTopo}>
          <span className={styles.avatar} aria-hidden="true">
            {iniciais(aluno.name)}
          </span>
          <div className={styles.identidade}>
            <h2 id={idNome} className={styles.nome}>
              {aluno.name}
            </h2>
            <p className={styles.ra}>
              <IconeIdentificacao tamanho={18} />
              <span>
                RA <strong className="numero">{aluno.ra}</strong>
              </span>
            </p>
          </div>
          <span
            className={`${styles.origem} ${cadastradoNoNavegador ? styles.origemLocal : ""}`}
          >
            {cadastradoNoNavegador ? "Cadastrado neste navegador" : "Registro original"}
          </span>
        </div>

        <dl className={styles.dados}>
          <div>
            <dt>Nome completo</dt>
            <dd>{aluno.name}</dd>
          </div>
          <div>
            <dt>RA</dt>
            <dd className="numero">{aluno.ra}</dd>
          </div>
          <div>
            <dt>Matrículas</dt>
            <dd>{pluralizar(disciplinasMatriculadas.length, "disciplina", "disciplinas")}</dd>
          </div>
          <div>
            <dt>Origem do registro</dt>
            <dd>
              {cadastradoNoNavegador ? (
                "Cadastro salvo no localStorage"
              ) : (
                <>
                  Arquivo fornecido (<code>src/data/alunos.tsx</code>)
                </>
              )}
            </dd>
          </div>
        </dl>
      </article>

      <section className={styles.secao} aria-labelledby={idDisciplinas}>
        <div className={styles.secaoTopo}>
          <h2 id={idDisciplinas} className={styles.secaoTitulo}>
            Disciplinas matriculadas
          </h2>
          <ButtonLink
            href="/matriculas/nova"
            variante="secundario"
            icone={<IconeMais tamanho={18} />}
          >
            Nova matrícula
          </ButtonLink>
        </div>

        {disciplinasMatriculadas.length === 0 ? (
          <EmptyState
            tituloComo="h3"
            icone={<IconeDisciplinas tamanho={26} />}
            titulo="Nenhuma matrícula"
          >
            <p>Este aluno ainda não está matriculado em nenhuma disciplina.</p>
          </EmptyState>
        ) : (
          <ul className={styles.disciplinas}>
            {disciplinasMatriculadas.map((disciplina) => (
              <li key={disciplina.id} className={styles.disciplina}>
                <span className={`${styles.disciplinaId} numero`}>ID {disciplina.id}</span>
                <span>{disciplina.name}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
