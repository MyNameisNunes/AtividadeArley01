import type {
  Aluno,
  CadastrosLocais,
  DadosPersistidos,
  Disciplina,
  Matricula,
} from "@/types";
import { chaveMatricula } from "@/lib/relacionamentos";

/**
 * Persistência no localStorage.
 *
 * Funções puras que recebem o acesso ao Storage como parâmetro. Isso permite
 * testá-las sem navegador e simular falhas (cota cheia, acesso bloqueado).
 *
 * Somente os registros CRIADOS pelo usuário são gravados. Os registros
 * originais vêm sempre de `src/data/` e nunca são escritos ou alterados.
 */

export const CHAVE_ARMAZENAMENTO = "registro-academico:cadastros";
export const VERSAO_DADOS = 1;

export type MotivoErroArmazenamento =
  | "cota"
  | "bloqueado"
  | "indisponivel"
  | "verificacao"
  | "desconhecido";

const MENSAGENS: Record<MotivoErroArmazenamento, string> = {
  cota: "O espaço de armazenamento do navegador está cheio.",
  bloqueado:
    "O navegador bloqueou o acesso ao armazenamento local (verifique se dados de sites estão permitidos).",
  indisponivel: "O armazenamento local não está disponível neste navegador.",
  verificacao: "Não foi possível confirmar a gravação dos dados no navegador.",
  desconhecido: "Ocorreu um erro inesperado ao acessar o armazenamento local.",
};

/** Erro de leitura/gravação no localStorage, com motivo identificado. */
export class ErroArmazenamento extends Error {
  readonly motivo: MotivoErroArmazenamento;

  constructor(motivo: MotivoErroArmazenamento, causa?: unknown) {
    super(MENSAGENS[motivo], { cause: causa });
    this.name = "ErroArmazenamento";
    this.motivo = motivo;
  }
}

/** Converte qualquer exceção do Storage em um `ErroArmazenamento`. */
export function paraErroArmazenamento(erro: unknown): ErroArmazenamento {
  if (erro instanceof ErroArmazenamento) return erro;

  if (erro instanceof DOMException) {
    const cotaExcedida =
      erro.name === "QuotaExceededError" ||
      erro.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      erro.code === 22 ||
      erro.code === 1014;
    if (cotaExcedida) return new ErroArmazenamento("cota", erro);
    if (erro.name === "SecurityError") {
      return new ErroArmazenamento("bloqueado", erro);
    }
  }

  return new ErroArmazenamento("desconhecido", erro);
}

/** Obtém o localStorage do navegador (o próprio acesso pode lançar erro). */
export function obterLocalStorage(): Storage {
  if (typeof window === "undefined") {
    throw new ErroArmazenamento("indisponivel");
  }
  const storage = window.localStorage;
  if (!storage) throw new ErroArmazenamento("indisponivel");
  return storage;
}

/** Coleções originais usadas para validar os registros lidos do navegador. */
export interface ColecoesBase {
  alunos: readonly Aluno[];
  disciplinas: readonly Disciplina[];
  matriculas: readonly Matricula[];
}

export interface LeituraCadastros {
  cadastros: CadastrosLocais;
  /** Mensagem para o usuário quando algo impediu a leitura completa. */
  aviso: string | null;
}

export const AVISO_DADOS_ILEGIVEIS =
  "Os dados salvos neste navegador estavam corrompidos ou em um formato desconhecido e foram ignorados. Os registros originais continuam disponíveis.";

function semCadastros(): CadastrosLocais {
  return { alunos: [], matriculas: [] };
}

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function ehInteiroPositivo(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isSafeInteger(valor) && valor > 0;
}

function ehAluno(valor: unknown): valor is Aluno {
  return (
    ehObjeto(valor) &&
    ehInteiroPositivo(valor.ra) &&
    typeof valor.name === "string" &&
    valor.name.trim() !== ""
  );
}

function ehMatricula(valor: unknown): valor is Matricula {
  return (
    ehObjeto(valor) &&
    ehInteiroPositivo(valor.student_ra) &&
    ehInteiroPositivo(valor.course_id)
  );
}

/**
 * Valida o conteúdo lido do navegador. Registros inválidos, duplicados ou que
 * apontam para alunos/disciplinas inexistentes são descartados — o
 * localStorage pode ter sido alterado manualmente pelo DevTools.
 */
export function sanitizarCadastros(
  bruto: unknown,
  base: ColecoesBase,
): LeituraCadastros {
  if (
    !ehObjeto(bruto) ||
    bruto.versao !== VERSAO_DADOS ||
    !Array.isArray(bruto.alunos) ||
    !Array.isArray(bruto.matriculas)
  ) {
    return { cadastros: semCadastros(), aviso: AVISO_DADOS_ILEGIVEIS };
  }

  let descartados = 0;

  const rasConhecidos = new Set(base.alunos.map((aluno) => aluno.ra));
  const alunos: Aluno[] = [];
  for (const item of bruto.alunos) {
    if (ehAluno(item) && !rasConhecidos.has(item.ra)) {
      alunos.push({ ra: item.ra, name: item.name });
      rasConhecidos.add(item.ra);
    } else {
      descartados++;
    }
  }

  const idsDisciplinas = new Set(base.disciplinas.map((d) => d.id));
  const chavesExistentes = new Set(base.matriculas.map(chaveMatricula));
  const matriculas: Matricula[] = [];
  for (const item of bruto.matriculas) {
    if (
      ehMatricula(item) &&
      rasConhecidos.has(item.student_ra) &&
      idsDisciplinas.has(item.course_id) &&
      !chavesExistentes.has(chaveMatricula(item))
    ) {
      matriculas.push({ student_ra: item.student_ra, course_id: item.course_id });
      chavesExistentes.add(chaveMatricula(item));
    } else {
      descartados++;
    }
  }

  const aviso =
    descartados > 0
      ? `${descartados} ${descartados === 1 ? "registro salvo neste navegador estava inválido e foi ignorado" : "registros salvos neste navegador estavam inválidos e foram ignorados"}.`
      : null;

  return { cadastros: { alunos, matriculas }, aviso };
}

/**
 * Lê os cadastros do navegador. Nunca lança exceção: em caso de falha,
 * devolve uma coleção vazia de cadastros e uma mensagem de aviso.
 */
export function carregarCadastros(
  base: ColecoesBase,
  acessarStorage: () => Storage = obterLocalStorage,
): LeituraCadastros {
  let texto: string | null;
  try {
    texto = acessarStorage().getItem(CHAVE_ARMAZENAMENTO);
  } catch (erro) {
    const { message } = paraErroArmazenamento(erro);
    return {
      cadastros: semCadastros(),
      aviso: `${message} Os registros originais estão disponíveis, mas novos cadastros não poderão ser salvos.`,
    };
  }

  // Primeiro acesso: ainda não há nada salvo, valem só os dados originais.
  if (texto === null) return { cadastros: semCadastros(), aviso: null };

  try {
    return sanitizarCadastros(JSON.parse(texto), base);
  } catch {
    return { cadastros: semCadastros(), aviso: AVISO_DADOS_ILEGIVEIS };
  }
}

/**
 * Grava os cadastros no navegador e confirma a gravação relendo o valor.
 * Lança `ErroArmazenamento` se não for possível persistir.
 */
export function salvarCadastros(
  cadastros: CadastrosLocais,
  acessarStorage: () => Storage = obterLocalStorage,
): void {
  const dados: DadosPersistidos = {
    versao: VERSAO_DADOS,
    alunos: cadastros.alunos,
    matriculas: cadastros.matriculas,
  };
  const texto = JSON.stringify(dados);

  let gravado: string | null;
  try {
    const storage = acessarStorage();
    storage.setItem(CHAVE_ARMAZENAMENTO, texto);
    gravado = storage.getItem(CHAVE_ARMAZENAMENTO);
  } catch (erro) {
    throw paraErroArmazenamento(erro);
  }

  if (gravado !== texto) throw new ErroArmazenamento("verificacao");
}
