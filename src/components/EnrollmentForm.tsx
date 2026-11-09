"use client";

import { useRouter } from "next/navigation";
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { disciplinas } from "@/data/disciplinas";
import { Button, ButtonLink } from "@/components/Button";
import { Alert } from "@/components/Feedback";
import {
  FormActions,
  FormAside,
  FormLayout,
  FormPanel,
  SelectField,
} from "@/components/FormComponents";
import { IconeMais, IconeVoltar } from "@/components/Icons";
import { useApp } from "@/hooks/useApp";
import { compararNomes, pluralizar } from "@/lib/formatacao";
import {
  chaveMatricula,
  contarMatriculasPorAluno,
  contarMatriculasPorDisciplina,
} from "@/lib/relacionamentos";
import { validarNovaMatricula } from "@/lib/validacoes";
import type { CampoMatricula, EntradaMatricula, ErrosDeCampo } from "@/types";
import styles from "./EnrollmentForm.module.css";

const VAZIO: EntradaMatricula = { studentRa: "", courseId: "" };

/** Formulário de /matriculas/nova: seleção de aluno e de disciplina. */
export function EnrollmentForm() {
  const router = useRouter();
  const { carregado, alunos, matriculas, cadastrarMatricula } = useApp();

  const [valores, setValores] = useState<EntradaMatricula>(VAZIO);
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [falha, setFalha] = useState<string | null>(null);
  const [redirecionando, setRedirecionando] = useState(false);

  const refAluno = useRef<HTMLSelectElement>(null);
  const refDisciplina = useRef<HTMLSelectElement>(null);
  const refFalha = useRef<HTMLDivElement>(null);

  // As opções vêm das coleções do contexto: um aluno recém-cadastrado já
  // aparece aqui, sem recarregar a página.
  const alunosOrdenados = useMemo(
    () => [...alunos].sort((a, b) => compararNomes(a.name, b.name)),
    [alunos],
  );

  // Disciplinas que o aluno selecionado já cursa (para sinalizar no select).
  const disciplinasDoSelecionado = useMemo(
    () =>
      new Set(
        matriculas
          .filter((m) => String(m.student_ra) === valores.studentRa)
          .map((m) => m.course_id),
      ),
    [matriculas, valores.studentRa],
  );

  const matriculasPorAluno = useMemo(() => contarMatriculasPorAluno(matriculas), [matriculas]);
  const alunosPorDisciplina = useMemo(
    () => contarMatriculasPorDisciplina(matriculas),
    [matriculas],
  );

  // Validação derivada dos valores atuais. A duplicidade aparece assim que
  // a combinação aluno + disciplina é escolhida; os demais erros, após enviar.
  const validacao = validarNovaMatricula(valores, alunos, disciplinas, matriculas);
  const erros: ErrosDeCampo<CampoMatricula> = validacao.ok ? {} : validacao.erros;
  const combinacaoEscolhida = valores.studentRa !== "" && valores.courseId !== "";
  const erroAluno = tentouEnviar ? erros.studentRa : undefined;
  const erroDisciplina = tentouEnviar || combinacaoEscolhida ? erros.courseId : undefined;

  const alunoSelecionado = alunos.find((a) => String(a.ra) === valores.studentRa);
  const disciplinaSelecionada = disciplinas.find((d) => String(d.id) === valores.courseId);

  // Ao ocultar a página (navegação com <Activity>), descarta falhas antigas.
  useLayoutEffect(() => {
    return () => {
      setFalha(null);
      setRedirecionando(false);
    };
  }, []);

  function alterar(campo: CampoMatricula, valor: string) {
    setValores((anteriores) => ({ ...anteriores, [campo]: valor }));
    setFalha(null);
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (redirecionando) return;

    setTentouEnviar(true);
    setFalha(null);

    const resultado = cadastrarMatricula(valores);

    if (resultado.ok) {
      setValores(VAZIO);
      setTentouEnviar(false);
      setRedirecionando(true);
      router.push(`/matriculas?nova=${chaveMatricula(resultado.valor)}`);
      return;
    }

    if (resultado.motivo === "validacao") {
      if (resultado.erros?.studentRa) refAluno.current?.focus();
      else refDisciplina.current?.focus();
      return;
    }

    setFalha(resultado.mensagem);
    requestAnimationFrame(() => refFalha.current?.focus());
  }

  return (
    <FormLayout>
      <FormPanel
        titulo="Dados da matrícula"
        descricao="Escolha um aluno e uma disciplina. O mesmo vínculo não pode ser cadastrado duas vezes."
        onSubmit={enviar}
        aria-describedby={falha ? "falha-cadastro-matricula" : undefined}
      >
        {falha ? (
          <div ref={refFalha} tabIndex={-1} className={styles.falha}>
            <Alert
              id="falha-cadastro-matricula"
              tipo="erro"
              titulo="Não foi possível cadastrar a matrícula"
            >
              {falha}
            </Alert>
          </div>
        ) : null}

        <SelectField
          ref={refAluno}
          id="studentRa"
          name="studentRa"
          rotulo="Aluno"
          obrigatorio
          value={valores.studentRa}
          onChange={(evento) => alterar("studentRa", evento.target.value)}
          disabled={!carregado}
          dica={
            carregado
              ? `${pluralizar(alunos.length, "aluno disponível", "alunos disponíveis")}, em ordem alfabética.`
              : "Carregando alunos…"
          }
          erro={erroAluno}
        >
          <option value="">Selecione um aluno</option>
          {alunosOrdenados.map((aluno) => (
            <option key={aluno.ra} value={aluno.ra}>
              {aluno.name} — RA {aluno.ra}
            </option>
          ))}
        </SelectField>

        <SelectField
          ref={refDisciplina}
          id="courseId"
          name="courseId"
          rotulo="Disciplina"
          obrigatorio
          value={valores.courseId}
          onChange={(evento) => alterar("courseId", evento.target.value)}
          disabled={!carregado}
          dica={`${pluralizar(disciplinas.length, "disciplina", "disciplinas")} do catálogo, por ID.`}
          erro={erroDisciplina}
        >
          <option value="">Selecione uma disciplina</option>
          {disciplinas.map((disciplina) => (
            <option key={disciplina.id} value={disciplina.id}>
              {disciplina.id} · {disciplina.name}
              {disciplinasDoSelecionado.has(disciplina.id) ? " (já matriculado)" : ""}
            </option>
          ))}
        </SelectField>

        <FormActions>
          <Button
            type="submit"
            icone={<IconeMais tamanho={18} />}
            disabled={!carregado || redirecionando}
          >
            {redirecionando ? "Cadastrando…" : "Cadastrar matrícula"}
          </Button>
          <ButtonLink
            href="/matriculas"
            variante="secundario"
            icone={<IconeVoltar tamanho={18} />}
          >
            Voltar para as matrículas
          </ButtonLink>
        </FormActions>
      </FormPanel>

      <FormAside id="resumo-matricula" titulo="Resumo do vínculo">
        <dl className={styles.resumo}>
          <div>
            <dt>Aluno</dt>
            <dd>
              {alunoSelecionado ? (
                <>
                  <strong>{alunoSelecionado.name}</strong>
                  <span className="numero">
                    RA {alunoSelecionado.ra} ·{" "}
                    {pluralizar(
                      matriculasPorAluno.get(alunoSelecionado.ra) ?? 0,
                      "matrícula atual",
                      "matrículas atuais",
                    )}
                  </span>
                </>
              ) : (
                <span className={styles.pendente}>Nenhum aluno selecionado</span>
              )}
            </dd>
          </div>
          <div>
            <dt>Disciplina</dt>
            <dd>
              {disciplinaSelecionada ? (
                <>
                  <strong>{disciplinaSelecionada.name}</strong>
                  <span className="numero">
                    ID {disciplinaSelecionada.id} ·{" "}
                    {pluralizar(
                      alunosPorDisciplina.get(disciplinaSelecionada.id) ?? 0,
                      "aluno matriculado",
                      "alunos matriculados",
                    )}
                  </span>
                </>
              ) : (
                <span className={styles.pendente}>Nenhuma disciplina selecionada</span>
              )}
            </dd>
          </div>
        </dl>
        <p className={styles.regra}>
          Regra de duplicidade: a combinação <strong>RA + ID da disciplina</strong>{" "}
          deve ser única. Um aluno pode cursar várias disciplinas, e uma disciplina
          pode ter vários alunos.
        </p>
      </FormAside>
    </FormLayout>
  );
}
