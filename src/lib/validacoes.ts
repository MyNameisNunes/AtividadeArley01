import type {
  Aluno,
  CampoAluno,
  CampoMatricula,
  Disciplina,
  EntradaAluno,
  EntradaMatricula,
  ErrosDeCampo,
  Matricula,
} from "@/types";
import { existeMatricula } from "@/lib/relacionamentos";

/**
 * Regras derivadas dos dados fornecidos:
 * - `ra` é do tipo `number` e todos os RAs originais têm 6 dígitos
 *   (258001, 258002, 258003). Por isso o RA precisa ter exatamente 6 dígitos
 *   numéricos e não pode começar com zero — um zero à esquerda seria perdido
 *   na conversão para `number` (012345 → 12345).
 * - `name` guarda o nome completo, então exigimos nome e sobrenome.
 */
export const RA_QUANTIDADE_DIGITOS = 6;
export const NOME_TAMANHO_MAXIMO = 80;

const SOMENTE_DIGITOS = /^\d+$/;
/** Uma palavra do nome: letras (com acentos), podendo ter hífen ou apóstrofo. */
const PALAVRA_DO_NOME = /^\p{L}+(?:['’-]\p{L}+)*$/u;

/**
 * Normaliza o nome digitado:
 * - NFC junta letra + acento combinante em um só caractere ("e" + "´" → "é"),
 *   comum em textos colados de PDFs;
 * - remove espaços extras: "  Ana   Clara " → "Ana Clara".
 */
export function normalizarNome(nome: string): string {
  return nome.normalize("NFC").trim().replace(/\s+/g, " ");
}

/** Valida o formato do RA digitado. Retorna a mensagem de erro ou `null`. */
export function validarFormatoRa(texto: string): string | null {
  const ra = texto.trim();

  if (ra === "") return "Informe o RA do aluno.";
  if (!SOMENTE_DIGITOS.test(ra)) return "O RA deve conter apenas números.";
  if (ra.length !== RA_QUANTIDADE_DIGITOS) {
    return `O RA deve ter exatamente ${RA_QUANTIDADE_DIGITOS} dígitos (por exemplo, 258004).`;
  }
  if (ra.startsWith("0")) return "O RA não pode começar com zero.";

  return null;
}

/** Valida o nome completo digitado. Retorna a mensagem de erro ou `null`. */
export function validarNome(texto: string): string | null {
  const nome = normalizarNome(texto);

  if (nome === "") return "Informe o nome completo do aluno.";
  if (nome.length > NOME_TAMANHO_MAXIMO) {
    return `O nome deve ter no máximo ${NOME_TAMANHO_MAXIMO} caracteres.`;
  }

  const palavras = nome.split(" ");
  if (!palavras.every((palavra) => PALAVRA_DO_NOME.test(palavra))) {
    return "Use apenas letras, espaços, hífen (-) ou apóstrofo (').";
  }
  if (palavras.length < 2) {
    return "Informe o nome completo, com nome e sobrenome.";
  }

  return null;
}

export type ValidacaoAluno =
  | { ok: true; aluno: Aluno }
  | { ok: false; erros: ErrosDeCampo<CampoAluno> };

/**
 * Valida um novo aluno: formato dos campos e RA duplicado.
 * Em caso de sucesso, devolve o objeto `Aluno` já com os tipos corretos.
 */
export function validarNovoAluno(
  entrada: EntradaAluno,
  alunosExistentes: readonly Aluno[],
): ValidacaoAluno {
  const erros: ErrosDeCampo<CampoAluno> = {};

  const erroRa = validarFormatoRa(entrada.ra);
  if (erroRa) {
    erros.ra = erroRa;
  } else {
    const ra = Number(entrada.ra.trim());
    const existente = alunosExistentes.find((aluno) => aluno.ra === ra);
    if (existente) {
      erros.ra = `Já existe um aluno com o RA ${ra}: ${existente.name}.`;
    }
  }

  const erroNome = validarNome(entrada.name);
  if (erroNome) erros.name = erroNome;

  if (erros.ra || erros.name) return { ok: false, erros };

  return {
    ok: true,
    aluno: { ra: Number(entrada.ra.trim()), name: normalizarNome(entrada.name) },
  };
}

export type ValidacaoMatricula =
  | { ok: true; matricula: Matricula; aluno: Aluno; disciplina: Disciplina }
  | { ok: false; erros: ErrosDeCampo<CampoMatricula> };

/**
 * Valida uma nova matrícula: seleção obrigatória, existência do aluno e da
 * disciplina e duplicidade da combinação RA + ID da disciplina.
 *
 * Um aluno pode ter várias disciplinas e uma disciplina pode ter vários
 * alunos — só é bloqueada a repetição do MESMO par.
 */
export function validarNovaMatricula(
  entrada: EntradaMatricula,
  alunos: readonly Aluno[],
  disciplinas: readonly Disciplina[],
  matriculas: readonly Matricula[],
): ValidacaoMatricula {
  const erros: ErrosDeCampo<CampoMatricula> = {};

  const ra = Number(entrada.studentRa);
  const id = Number(entrada.courseId);
  const aluno =
    entrada.studentRa === "" ? undefined : alunos.find((a) => a.ra === ra);
  const disciplina =
    entrada.courseId === "" ? undefined : disciplinas.find((d) => d.id === id);

  if (entrada.studentRa === "") {
    erros.studentRa = "Selecione um aluno.";
  } else if (!aluno) {
    erros.studentRa = "O aluno selecionado não foi encontrado.";
  }

  if (entrada.courseId === "") {
    erros.courseId = "Selecione uma disciplina.";
  } else if (!disciplina) {
    erros.courseId = "A disciplina selecionada não existe no catálogo.";
  }

  if (aluno && disciplina && existeMatricula(matriculas, aluno.ra, disciplina.id)) {
    erros.courseId = `${aluno.name} (RA ${aluno.ra}) já possui matrícula em ${disciplina.name}.`;
  }

  if (erros.studentRa || erros.courseId || !aluno || !disciplina) {
    return { ok: false, erros };
  }

  return {
    ok: true,
    matricula: { student_ra: aluno.ra, course_id: disciplina.id },
    aluno,
    disciplina,
  };
}
