"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useRef } from "react";
import { ButtonLink } from "@/components/Button";
import { Alert, EmptyState, LoadingState } from "@/components/Feedback";
import { IconeAlunos, IconeMais } from "@/components/Icons";
import { StudentCard } from "@/components/StudentCard";
import { useApp } from "@/hooks/useApp";
import { pluralizar } from "@/lib/formatacao";
import { contarMatriculasPorAluno } from "@/lib/relacionamentos";
import styles from "./StudentList.module.css";

/**
 * Listagem de /alunos. Lê a coleção do contexto e, se a URL tiver
 * ?cadastrado=<RA>, exibe a confirmação do cadastro recém-concluído.
 */
export function StudentList() {
  const { carregado, alunos, matriculas, cadastrosLocais } = useApp();
  const raCadastrado = useSearchParams().get("cadastrado");
  const idTitulo = useId();
  const refConfirmacao = useRef<HTMLDivElement>(null);

  const matriculasPorAluno = useMemo(
    () => contarMatriculasPorAluno(matriculas),
    [matriculas],
  );
  const rasLocais = useMemo(
    () => new Set(cadastrosLocais.alunos.map((aluno) => aluno.ra)),
    [cadastrosLocais.alunos],
  );

  // Só confirma o cadastro se o RA realmente foi salvo neste navegador.
  const alunoCadastrado = raCadastrado
    ? cadastrosLocais.alunos.find((aluno) => String(aluno.ra) === raCadastrado)
    : undefined;
  const raConfirmado = alunoCadastrado?.ra;

  // Após o redirecionamento, o botão clicado ficou na página anterior (agora
  // oculta). Levar o foco à confirmação informa o resultado a quem usa
  // teclado ou leitor de tela.
  useEffect(() => {
    if (raConfirmado !== undefined) refConfirmacao.current?.focus();
  }, [raConfirmado]);

  if (!carregado) return <LoadingState linhas={4} rotulo="Carregando alunos…" />;

  return (
    <section className={styles.secao} aria-labelledby={idTitulo}>
      {alunoCadastrado ? (
        <div ref={refConfirmacao} tabIndex={-1} className="foco-programatico">
          <Alert
            tipo="sucesso"
            titulo="Aluno cadastrado com sucesso"
            acoes={
              <>
                <Link href={`/alunos/${alunoCadastrado.ra}`}>Ver detalhes</Link>
                <Link href="/matriculas/nova">Matricular em uma disciplina</Link>
              </>
            }
          >
            <strong>{alunoCadastrado.name}</strong> (RA {alunoCadastrado.ra}) foi
            salvo neste navegador e já está disponível para matrícula.
          </Alert>
        </div>
      ) : null}

      <div className={styles.topo}>
        <h2 id={idTitulo} className={styles.titulo}>
          Lista de alunos
        </h2>
        <p className={styles.resumo}>
          {pluralizar(alunos.length, "aluno", "alunos")} · ordem de cadastro
        </p>
      </div>

      {alunos.length === 0 ? (
        <EmptyState
          icone={<IconeAlunos tamanho={26} />}
          titulo="Nenhum aluno cadastrado"
          acoes={
            <ButtonLink href="/alunos/novo" icone={<IconeMais tamanho={18} />}>
              Cadastrar aluno
            </ButtonLink>
          }
        >
          <p>Cadastre o primeiro aluno para que ele apareça nesta lista.</p>
        </EmptyState>
      ) : (
        <ul className={styles.lista}>
          {alunos.map((aluno) => (
            <li key={aluno.ra}>
              <StudentCard
                aluno={aluno}
                totalMatriculas={matriculasPorAluno.get(aluno.ra) ?? 0}
                cadastradoNoNavegador={rasLocais.has(aluno.ra)}
                destacado={aluno.ra === raConfirmado}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
