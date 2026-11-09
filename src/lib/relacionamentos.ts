import type {
  Aluno,
  Disciplina,
  Matricula,
  MatriculaDetalhada,
} from "@/types";

/**
 * Chave única de uma matrícula: combinação RA + ID da disciplina.
 * É a mesma regra usada para impedir vínculos duplicados.
 */
export function chaveMatricula(matricula: Matricula): string {
  return `${matricula.student_ra}-${matricula.course_id}`;
}

/** Índice de alunos por RA, para buscas em tempo constante. */
export function indexarAlunos(alunos: readonly Aluno[]): Map<number, Aluno> {
  return new Map(alunos.map((aluno) => [aluno.ra, aluno]));
}

/** Índice de disciplinas por ID, para buscas em tempo constante. */
export function indexarDisciplinas(
  disciplinas: readonly Disciplina[],
): Map<number, Disciplina> {
  return new Map(disciplinas.map((disciplina) => [disciplina.id, disciplina]));
}

/**
 * Relaciona cada matrícula ao aluno e à disciplina correspondentes.
 *
 * Os nomes NÃO estão gravados na matrícula: eles são obtidos consultando as
 * coleções de alunos e disciplinas pelos identificadores `student_ra` e
 * `course_id`. É o equivalente a um JOIN entre tabelas.
 */
export function relacionarMatriculas(
  matriculas: readonly Matricula[],
  alunos: readonly Aluno[],
  disciplinas: readonly Disciplina[],
): MatriculaDetalhada[] {
  const alunosPorRa = indexarAlunos(alunos);
  const disciplinasPorId = indexarDisciplinas(disciplinas);

  return matriculas.map((matricula) => ({
    chave: chaveMatricula(matricula),
    matricula,
    aluno: alunosPorRa.get(matricula.student_ra),
    disciplina: disciplinasPorId.get(matricula.course_id),
  }));
}

/** Disciplinas em que um aluno está matriculado, na ordem das matrículas. */
export function disciplinasDoAluno(
  ra: number,
  matriculas: readonly Matricula[],
  disciplinas: readonly Disciplina[],
): Disciplina[] {
  const disciplinasPorId = indexarDisciplinas(disciplinas);

  return matriculas
    .filter((matricula) => matricula.student_ra === ra)
    .map((matricula) => disciplinasPorId.get(matricula.course_id))
    .filter((disciplina): disciplina is Disciplina => disciplina !== undefined);
}

/** Quantidade de matrículas de cada aluno (RA → total). */
export function contarMatriculasPorAluno(
  matriculas: readonly Matricula[],
): Map<number, number> {
  const contagem = new Map<number, number>();
  for (const { student_ra } of matriculas) {
    contagem.set(student_ra, (contagem.get(student_ra) ?? 0) + 1);
  }
  return contagem;
}

/** Quantidade de alunos matriculados em cada disciplina (ID → total). */
export function contarMatriculasPorDisciplina(
  matriculas: readonly Matricula[],
): Map<number, number> {
  const contagem = new Map<number, number>();
  for (const { course_id } of matriculas) {
    contagem.set(course_id, (contagem.get(course_id) ?? 0) + 1);
  }
  return contagem;
}

/** Verifica se já existe um vínculo entre o aluno e a disciplina. */
export function existeMatricula(
  matriculas: readonly Matricula[],
  studentRa: number,
  courseId: number,
): boolean {
  return matriculas.some(
    (matricula) =>
      matricula.student_ra === studentRa && matricula.course_id === courseId,
  );
}
