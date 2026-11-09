import { describe, expect, it } from "vitest";
import { alunos } from "@/data/alunos";
import { disciplinas } from "@/data/disciplinas";
import { matriculas } from "@/data/matriculas";
import {
  contarMatriculasPorAluno,
  disciplinasDoAluno,
  existeMatricula,
  relacionarMatriculas,
} from "@/lib/relacionamentos";

describe("relacionarMatriculas", () => {
  it("resolve aluno e disciplina de todas as matrículas fornecidas", () => {
    const linhas = relacionarMatriculas(matriculas, alunos, disciplinas);

    expect(linhas).toHaveLength(22);
    expect(linhas.every((l) => l.aluno && l.disciplina)).toBe(true);
    expect(linhas[0]).toMatchObject({
      chave: "258001-1",
      aluno: { ra: 258001, name: "Ana Clara Silva" },
      disciplina: { id: 1, name: "Algoritmos e Lógica de Programação" },
    });
  });

  it("obtém os nomes das coleções (não de texto fixo)", () => {
    const alunosRenomeados = alunos.map((a) =>
      a.ra === 258001 ? { ...a, name: "Nome Alterado" } : a,
    );
    const [primeira] = relacionarMatriculas(matriculas, alunosRenomeados, disciplinas);
    expect(primeira.aluno?.name).toBe("Nome Alterado");
  });

  it("sinaliza referências inexistentes com undefined", () => {
    const [linha] = relacionarMatriculas(
      [{ student_ra: 111111, course_id: 99 }],
      alunos,
      disciplinas,
    );
    expect(linha.aluno).toBeUndefined();
    expect(linha.disciplina).toBeUndefined();
  });
});

describe("consultas derivadas", () => {
  it("lista as disciplinas de um aluno", () => {
    const ids = disciplinasDoAluno(258002, matriculas, disciplinas).map((d) => d.id);
    expect(ids).toEqual([6, 7, 8, 9, 10, 11, 12]);
  });

  it("conta matrículas por aluno", () => {
    const contagem = contarMatriculasPorAluno(matriculas);
    expect(contagem.get(258001)).toBe(5);
    expect(contagem.get(258002)).toBe(7);
    expect(contagem.get(258003)).toBe(10);
  });

  it("verifica a existência do par RA + disciplina", () => {
    expect(existeMatricula(matriculas, 258001, 1)).toBe(true);
    expect(existeMatricula(matriculas, 258001, 6)).toBe(false);
  });
});
