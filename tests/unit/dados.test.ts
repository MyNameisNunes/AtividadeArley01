import { describe, expect, it } from "vitest";
import { alunos } from "@/data/alunos";
import { disciplinas } from "@/data/disciplinas";
import { matriculas } from "@/data/matriculas";
import { chaveMatricula } from "@/lib/relacionamentos";

describe("dados fornecidos (src/data)", () => {
  it("contém as 39 disciplinas com IDs únicos", () => {
    expect(disciplinas).toHaveLength(39);
    expect(new Set(disciplinas.map((d) => d.id)).size).toBe(39);
  });

  it("contém 3 alunos com RAs únicos de 6 dígitos (base da regra de validação)", () => {
    expect(alunos).toHaveLength(3);
    expect(new Set(alunos.map((a) => a.ra)).size).toBe(3);
    for (const aluno of alunos) {
      expect(String(aluno.ra)).toMatch(/^[1-9]\d{5}$/);
    }
  });

  it("contém 22 matrículas sem duplicidade e com referências válidas", () => {
    expect(matriculas).toHaveLength(22);
    expect(new Set(matriculas.map(chaveMatricula)).size).toBe(22);

    const ras = new Set(alunos.map((a) => a.ra));
    const ids = new Set(disciplinas.map((d) => d.id));
    for (const matricula of matriculas) {
      expect(ras.has(matricula.student_ra)).toBe(true);
      expect(ids.has(matricula.course_id)).toBe(true);
    }
  });
});
