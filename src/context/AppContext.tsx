"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { alunos as alunosIniciais } from "@/data/alunos";
import { disciplinas } from "@/data/disciplinas";
import { matriculas as matriculasIniciais } from "@/data/matriculas";
import type {
  Aluno,
  CadastrosLocais,
  CampoAluno,
  CampoMatricula,
  EntradaAluno,
  EntradaMatricula,
  Matricula,
  ResultadoOperacao,
} from "@/types";
import { ErroArmazenamento } from "@/lib/armazenamento";
import {
  assinarLoja,
  gravarNaLoja,
  lerLoja,
  lerLojaNoServidor,
  sincronizarLoja,
} from "@/lib/lojaCadastros";
import { validarNovaMatricula, validarNovoAluno } from "@/lib/validacoes";

export interface AppContextValue {
  /** `false` no servidor e na hidratação; `true` após ler o navegador. */
  carregado: boolean;
  /** Alunos originais + alunos cadastrados neste navegador. */
  alunos: readonly Aluno[];
  /** Matrículas originais + matrículas cadastradas neste navegador. */
  matriculas: readonly Matricula[];
  /** Somente os registros criados neste navegador. */
  cadastrosLocais: CadastrosLocais;
  /** Problema encontrado ao ler o armazenamento local, se houver. */
  avisoArmazenamento: string | null;
  cadastrarAluno: (
    entrada: EntradaAluno,
  ) => ResultadoOperacao<Aluno, CampoAluno>;
  cadastrarMatricula: (
    entrada: EntradaMatricula,
  ) => ResultadoOperacao<Matricula, CampoMatricula>;
}

export const AppContext = createContext<AppContextValue | null>(null);

const SEM_CADASTROS: CadastrosLocais = { alunos: [], matriculas: [] };

const MENSAGEM_CARREGANDO =
  "Os dados ainda estão sendo carregados. Aguarde um instante e tente novamente.";

const MENSAGEM_CORRIJA_CAMPOS = "Corrija os campos destacados para continuar.";

function mensagemFalhaPersistencia(erro: unknown): string {
  const causa =
    erro instanceof ErroArmazenamento
      ? erro.message
      : "Ocorreu um erro inesperado ao salvar.";
  return `${causa} O cadastro não foi salvo e nenhuma alteração foi aplicada.`;
}

/**
 * Provedor do estado compartilhado de alunos e matrículas.
 *
 * As disciplinas NÃO fazem parte do estado: são uma coleção fixa importada
 * diretamente de `src/data/disciplinas.ts`.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  // Lê o localStorage de forma segura para SSR: no servidor e na hidratação
  // o valor é `null`; logo após a hidratação o React relê no navegador.
  const estado = useSyncExternalStore(assinarLoja, lerLoja, lerLojaNoServidor);

  const carregado = estado !== null;
  const cadastrosLocais = estado?.cadastros ?? SEM_CADASTROS;
  const avisoArmazenamento = estado?.aviso ?? null;

  // Coleções completas = dados originais + cadastros do navegador.
  const alunos = useMemo(
    () => [...alunosIniciais, ...cadastrosLocais.alunos],
    [cadastrosLocais.alunos],
  );
  const matriculas = useMemo(
    () => [...matriculasIniciais, ...cadastrosLocais.matriculas],
    [cadastrosLocais.matriculas],
  );

  const cadastrarAluno = useCallback(
    (entrada: EntradaAluno): ResultadoOperacao<Aluno, CampoAluno> => {
      if (!carregado) {
        return { ok: false, motivo: "carregando", mensagem: MENSAGEM_CARREGANDO };
      }

      try {
        // 1. Ler: parte do que está salvo AGORA (outra aba pode ter gravado).
        const salvos = sincronizarLoja();

        // 2. Validar contra a coleção completa e atualizada.
        const validacao = validarNovoAluno(entrada, [
          ...alunosIniciais,
          ...salvos.alunos,
        ]);
        if (!validacao.ok) {
          return {
            ok: false,
            motivo: "validacao",
            mensagem: MENSAGEM_CORRIJA_CAMPOS,
            erros: validacao.erros,
          };
        }

        // 3. Gravar: o estado só muda se a gravação for confirmada.
        gravarNaLoja({ ...salvos, alunos: [...salvos.alunos, validacao.aluno] });
        return { ok: true, valor: validacao.aluno };
      } catch (erro) {
        return {
          ok: false,
          motivo: "persistencia",
          mensagem: mensagemFalhaPersistencia(erro),
        };
      }
    },
    [carregado],
  );

  const cadastrarMatricula = useCallback(
    (entrada: EntradaMatricula): ResultadoOperacao<Matricula, CampoMatricula> => {
      if (!carregado) {
        return { ok: false, motivo: "carregando", mensagem: MENSAGEM_CARREGANDO };
      }

      try {
        // Ler → validar → gravar, como em cadastrarAluno.
        const salvos = sincronizarLoja();

        const validacao = validarNovaMatricula(
          entrada,
          [...alunosIniciais, ...salvos.alunos],
          disciplinas,
          [...matriculasIniciais, ...salvos.matriculas],
        );
        if (!validacao.ok) {
          return {
            ok: false,
            motivo: "validacao",
            mensagem: MENSAGEM_CORRIJA_CAMPOS,
            erros: validacao.erros,
          };
        }

        gravarNaLoja({
          ...salvos,
          matriculas: [...salvos.matriculas, validacao.matricula],
        });
        return { ok: true, valor: validacao.matricula };
      } catch (erro) {
        return {
          ok: false,
          motivo: "persistencia",
          mensagem: mensagemFalhaPersistencia(erro),
        };
      }
    },
    [carregado],
  );

  const valor = useMemo<AppContextValue>(
    () => ({
      carregado,
      alunos,
      matriculas,
      cadastrosLocais,
      avisoArmazenamento,
      cadastrarAluno,
      cadastrarMatricula,
    }),
    [
      carregado,
      alunos,
      matriculas,
      cadastrosLocais,
      avisoArmazenamento,
      cadastrarAluno,
      cadastrarMatricula,
    ],
  );

  return <AppContext value={valor}>{children}</AppContext>;
}
