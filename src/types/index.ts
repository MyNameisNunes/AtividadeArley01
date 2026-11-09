/**
 * Tipos centrais da aplicação.
 *
 * Os tipos das entidades (Aluno, Disciplina e Matricula) NÃO são redefinidos
 * aqui: eles são reexportados dos arquivos fornecidos pelo professor em
 * `src/data/`. Assim, os nomes das propriedades (`ra`, `name`, `id`,
 * `student_ra`, `course_id`) permanecem exatamente como foram entregues.
 */
export type { Aluno } from "@/data/alunos";
export type { Disciplina } from "@/data/disciplinas";
export type { Matricula } from "@/data/matriculas";

import type { Aluno } from "@/data/alunos";
import type { Disciplina } from "@/data/disciplinas";
import type { Matricula } from "@/data/matriculas";

/** Áreas da aplicação. Cada uma tem cor e organização visual próprias. */
export type Modulo = "alunos" | "disciplinas" | "matriculas";

/**
 * Registros criados pelo usuário neste navegador.
 *
 * Apenas os NOVOS registros são persistidos no localStorage. Os registros
 * originais continuam vindo de `src/data/` e são combinados com estes em
 * tempo de execução — por isso nunca podem ser perdidos.
 */
export interface CadastrosLocais {
  alunos: Aluno[];
  matriculas: Matricula[];
}

/** Formato gravado no localStorage (versionado para permitir evolução). */
export interface DadosPersistidos extends CadastrosLocais {
  versao: 1;
}

/** Mensagens de erro por campo de um formulário. */
export type ErrosDeCampo<Campo extends string> = Partial<Record<Campo, string>>;

/** Motivo de uma operação de cadastro não ter sido concluída. */
export type MotivoFalha = "validacao" | "persistencia" | "carregando";

/**
 * Resultado de uma operação de cadastro.
 *
 * Usar um objeto de resultado (em vez de lançar exceções para a interface)
 * obriga quem chama a tratar explicitamente o caso de falha.
 */
export type ResultadoOperacao<T, Campo extends string = string> =
  | { ok: true; valor: T }
  | {
      ok: false;
      motivo: MotivoFalha;
      mensagem: string;
      erros?: ErrosDeCampo<Campo>;
    };

/** Campos do formulário de aluno (valores digitados, ainda como texto). */
export interface EntradaAluno {
  ra: string;
  name: string;
}
export type CampoAluno = keyof EntradaAluno;

/** Campos do formulário de matrícula (valores dos <select>, como texto). */
export interface EntradaMatricula {
  studentRa: string;
  courseId: string;
}
export type CampoMatricula = keyof EntradaMatricula;

/**
 * Matrícula com os dados relacionados já resolvidos.
 *
 * `aluno` e `disciplina` podem ser `undefined` se o identificador da
 * matrícula não corresponder a nenhum registro (integridade quebrada).
 */
export interface MatriculaDetalhada {
  chave: string;
  matricula: Matricula;
  aluno: Aluno | undefined;
  disciplina: Disciplina | undefined;
}
