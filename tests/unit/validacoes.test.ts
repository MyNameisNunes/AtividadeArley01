import { describe, expect, it } from "vitest";
import { alunos } from "@/data/alunos";
import { disciplinas } from "@/data/disciplinas";
import { matriculas } from "@/data/matriculas";
import {
  normalizarNome,
  validarFormatoRa,
  validarNome,
  validarNovaMatricula,
  validarNovoAluno,
} from "@/lib/validacoes";

describe("validarFormatoRa", () => {
  it.each([
    ["", "Informe o RA do aluno."],
    ["   ", "Informe o RA do aluno."],
    ["25800a", "O RA deve conter apenas números."],
    ["258-04", "O RA deve conter apenas números."],
    ["12345", "O RA deve ter exatamente 6 dígitos (por exemplo, 258004)."],
    ["1234567", "O RA deve ter exatamente 6 dígitos (por exemplo, 258004)."],
    ["012345", "O RA não pode começar com zero."],
  ])("rejeita %j", (entrada, mensagem) => {
    expect(validarFormatoRa(entrada)).toBe(mensagem);
  });

  it("aceita RA de 6 dígitos (ignorando espaços nas pontas)", () => {
    expect(validarFormatoRa("258004")).toBeNull();
    expect(validarFormatoRa(" 258004 ")).toBeNull();
  });
});

describe("validarNome", () => {
  it("exige o nome", () => {
    expect(validarNome("  ")).toBe("Informe o nome completo do aluno.");
  });

  it("exige nome e sobrenome", () => {
    expect(validarNome("Ana")).toBe("Informe o nome completo, com nome e sobrenome.");
  });

  it("rejeita números e símbolos", () => {
    expect(validarNome("Ana 123")).toMatch(/apenas letras/);
    expect(validarNome("Ana C. Silva")).toMatch(/apenas letras/);
  });

  it("limita o tamanho", () => {
    expect(validarNome(`Ana ${"a".repeat(80)}`)).toMatch(/no máximo 80/);
  });

  it("aceita acentos, hífen e apóstrofo", () => {
    expect(validarNome("João D'Ávila Sant-Anna")).toBeNull();
    expect(validarNome("Ana Clara Silva")).toBeNull();
  });

  it("normaliza espaços extras", () => {
    expect(normalizarNome("  Ana   Clara  Silva ")).toBe("Ana Clara Silva");
  });

  it("aceita acentos decompostos (texto colado) e os normaliza para NFC", () => {
    const decomposto = "José Silva"; // "e" + acento agudo combinante
    expect(validarNome(decomposto)).toBeNull();
    expect(normalizarNome(decomposto)).toBe("José Silva");
  });
});

describe("validarNovoAluno", () => {
  it("impede RA duplicado e informa a quem ele pertence", () => {
    const resultado = validarNovoAluno({ ra: "258001", name: "Outro Nome" }, alunos);
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.ra).toBe("Já existe um aluno com o RA 258001: Ana Clara Silva.");
    }
  });

  it("acusa todos os campos obrigatórios de uma vez", () => {
    const resultado = validarNovoAluno({ ra: "", name: "" }, alunos);
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros).toEqual({
        ra: "Informe o RA do aluno.",
        name: "Informe o nome completo do aluno.",
      });
    }
  });

  it("devolve o Aluno com os tipos e nomes de propriedade dos dados (ra: number)", () => {
    const resultado = validarNovoAluno(
      { ra: " 258004 ", name: "  Daniela   Ferreira Lima " },
      alunos,
    );
    expect(resultado).toEqual({
      ok: true,
      aluno: { ra: 258004, name: "Daniela Ferreira Lima" },
    });
  });
});

describe("validarNovaMatricula", () => {
  const validar = (studentRa: string, courseId: string) =>
    validarNovaMatricula({ studentRa, courseId }, alunos, disciplinas, matriculas);

  it("exige aluno e disciplina", () => {
    const resultado = validar("", "");
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros).toEqual({
        studentRa: "Selecione um aluno.",
        courseId: "Selecione uma disciplina.",
      });
    }
  });

  it("impede o mesmo par RA + ID da disciplina", () => {
    const resultado = validar("258001", "1");
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.courseId).toBe(
        "Ana Clara Silva (RA 258001) já possui matrícula em Algoritmos e Lógica de Programação.",
      );
    }
  });

  it("permite que um aluno curse várias disciplinas", () => {
    expect(validar("258001", "6")).toMatchObject({
      ok: true,
      matricula: { student_ra: 258001, course_id: 6 },
    });
  });

  it("permite que uma disciplina tenha vários alunos", () => {
    expect(validar("258002", "1")).toMatchObject({
      ok: true,
      matricula: { student_ra: 258002, course_id: 1 },
    });
  });

  it("rejeita aluno ou disciplina inexistentes", () => {
    const resultado = validar("999999", "40");
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erros.studentRa).toBe("O aluno selecionado não foi encontrado.");
      expect(resultado.erros.courseId).toBe(
        "A disciplina selecionada não existe no catálogo.",
      );
    }
  });
});
