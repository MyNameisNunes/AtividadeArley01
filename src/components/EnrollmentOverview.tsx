"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { disciplinas } from "@/data/disciplinas";
import { EnrollmentTable } from "@/components/EnrollmentTable";
import { Alert, LoadingState } from "@/components/Feedback";
import { useApp } from "@/hooks/useApp";
import { chaveMatricula, relacionarMatriculas } from "@/lib/relacionamentos";
import styles from "./EnrollmentOverview.module.css";

/**
 * Conteúdo de /matriculas: indicadores, confirmação de cadastro e tabela.
 * Se a URL tiver ?nova=<RA>-<ID>, confirma e destaca a matrícula criada.
 */
export function EnrollmentOverview() {
  const { carregado, alunos, matriculas, cadastrosLocais } = useApp();
  const chaveNova = useSearchParams().get("nova");
  const refConfirmacao = useRef<HTMLDivElement>(null);
  const refLinhaNova = useRef<HTMLTableRowElement>(null);

  // Relacionamento: cada matrícula recebe o aluno (por RA) e a disciplina (por ID).
  const linhas = useMemo(
    () => relacionarMatriculas(matriculas, alunos, disciplinas),
    [matriculas, alunos],
  );

  // Só confirma se a matrícula realmente foi salva neste navegador.
  const foiCadastradaAgora =
    chaveNova !== null &&
    cadastrosLocais.matriculas.some((m) => chaveMatricula(m) === chaveNova);
  const nova = foiCadastradaAgora
    ? linhas.find((linha) => linha.chave === chaveNova)
    : undefined;
  const chaveConfirmada = nova?.chave;

  // Leva o foco à confirmação após o redirecionamento (ver StudentList).
  useEffect(() => {
    if (chaveConfirmada !== undefined) refConfirmacao.current?.focus();
  }, [chaveConfirmada]);

  function mostrarNaTabela() {
    const linha = refLinhaNova.current;
    if (!linha) return;
    const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    linha.scrollIntoView({ behavior: reduzirMovimento ? "auto" : "smooth", block: "center" });
    linha.focus({ preventScroll: true });
  }

  if (!carregado) return <LoadingState linhas={6} rotulo="Carregando matrículas…" />;

  const alunosComMatricula = new Set(matriculas.map((m) => m.student_ra)).size;
  const disciplinasComAlunos = new Set(matriculas.map((m) => m.course_id)).size;

  return (
    <>
      {nova ? (
        <div ref={refConfirmacao} tabIndex={-1} className="foco-programatico">
          <Alert
            tipo="sucesso"
            titulo="Matrícula cadastrada com sucesso"
            acoes={
              <button type="button" onClick={mostrarNaTabela}>
                Ver na tabela
              </button>
            }
          >
            <strong>{nova.aluno?.name}</strong> (RA {nova.matricula.student_ra}) foi
            vinculado(a) a <strong>{nova.disciplina?.name}</strong>. O total passou
            para {matriculas.length} matrículas.
          </Alert>
        </div>
      ) : null}

      <dl className={styles.indicadores}>
        <div className={styles.indicador}>
          <dt>Alunos com matrícula</dt>
          <dd>
            <span className="numero">{alunosComMatricula}</span>
            <small>de {alunos.length}</small>
          </dd>
        </div>
        <div className={styles.indicador}>
          <dt>Disciplinas com alunos</dt>
          <dd>
            <span className="numero">{disciplinasComAlunos}</span>
            <small>de {disciplinas.length}</small>
          </dd>
        </div>
        <div className={styles.indicador}>
          <dt>Registradas neste navegador</dt>
          <dd>
            <span className="numero">{cadastrosLocais.matriculas.length}</span>
            <small>de {matriculas.length}</small>
          </dd>
        </div>
      </dl>

      <EnrollmentTable
        linhas={linhas}
        chaveDestacada={chaveConfirmada}
        refLinhaDestacada={refLinhaNova}
      />
    </>
  );
}
