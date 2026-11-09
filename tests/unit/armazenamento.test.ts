import { describe, expect, it } from "vitest";
import { alunos } from "@/data/alunos";
import { disciplinas } from "@/data/disciplinas";
import { matriculas } from "@/data/matriculas";
import {
  AVISO_DADOS_ILEGIVEIS,
  CHAVE_ARMAZENAMENTO,
  ErroArmazenamento,
  carregarCadastros,
  salvarCadastros,
} from "@/lib/armazenamento";

const BASE = { alunos, disciplinas, matriculas };

/** Implementação mínima de Storage em memória para os testes. */
class StorageEmMemoria implements Storage {
  private readonly itens = new Map<string, string>();
  get length() {
    return this.itens.size;
  }
  clear() {
    this.itens.clear();
  }
  getItem(chave: string) {
    return this.itens.get(chave) ?? null;
  }
  key(indice: number) {
    return [...this.itens.keys()][indice] ?? null;
  }
  removeItem(chave: string) {
    this.itens.delete(chave);
  }
  setItem(chave: string, valor: string) {
    this.itens.set(chave, valor);
  }
}

describe("carregarCadastros", () => {
  it("no primeiro acesso não há cadastros nem aviso", () => {
    const storage = new StorageEmMemoria();
    expect(carregarCadastros(BASE, () => storage)).toEqual({
      cadastros: { alunos: [], matriculas: [] },
      aviso: null,
    });
  });

  it("lê de volta o que foi salvo", () => {
    const storage = new StorageEmMemoria();
    const cadastros = {
      alunos: [{ ra: 258004, name: "Daniela Ferreira Lima" }],
      matriculas: [{ student_ra: 258004, course_id: 3 }],
    };
    salvarCadastros(cadastros, () => storage);
    expect(carregarCadastros(BASE, () => storage)).toEqual({ cadastros, aviso: null });
  });

  it("ignora JSON corrompido e avisa", () => {
    const storage = new StorageEmMemoria();
    storage.setItem(CHAVE_ARMAZENAMENTO, "{isto não é json");
    expect(carregarCadastros(BASE, () => storage)).toEqual({
      cadastros: { alunos: [], matriculas: [] },
      aviso: AVISO_DADOS_ILEGIVEIS,
    });
  });

  it("ignora formato/versão desconhecidos e avisa", () => {
    const storage = new StorageEmMemoria();
    storage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify({ versao: 99, alunos: [] }));
    expect(carregarCadastros(BASE, () => storage).aviso).toBe(AVISO_DADOS_ILEGIVEIS);
  });

  it("descarta registros inválidos, duplicados ou com referência inexistente", () => {
    const storage = new StorageEmMemoria();
    storage.setItem(
      CHAVE_ARMAZENAMENTO,
      JSON.stringify({
        versao: 1,
        alunos: [
          { ra: 258004, name: "Daniela Ferreira Lima" }, // válido
          { ra: 258001, name: "Duplicado do original" }, // RA já existe
          { ra: "258005", name: "RA em texto" }, // tipo errado
        ],
        matriculas: [
          { student_ra: 258004, course_id: 2 }, // válida
          { student_ra: 258001, course_id: 1 }, // já existe nos originais
          { student_ra: 777777, course_id: 2 }, // aluno inexistente
          { student_ra: 258004, course_id: 40 }, // disciplina inexistente
        ],
      }),
    );

    const { cadastros, aviso } = carregarCadastros(BASE, () => storage);
    expect(cadastros).toEqual({
      alunos: [{ ra: 258004, name: "Daniela Ferreira Lima" }],
      matriculas: [{ student_ra: 258004, course_id: 2 }],
    });
    expect(aviso).toBe("5 registros salvos neste navegador estavam inválidos e foram ignorados.");
  });

  it("não quebra quando o navegador bloqueia o acesso ao storage", () => {
    const leitura = carregarCadastros(BASE, () => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });
    expect(leitura.cadastros).toEqual({ alunos: [], matriculas: [] });
    expect(leitura.aviso).toMatch(/bloqueou o acesso/);
    expect(leitura.aviso).toMatch(/novos cadastros não poderão ser salvos/);
  });
});

describe("salvarCadastros", () => {
  it("grava somente os registros novos, com versão", () => {
    const storage = new StorageEmMemoria();
    salvarCadastros(
      { alunos: [{ ra: 258004, name: "Daniela Ferreira Lima" }], matriculas: [] },
      () => storage,
    );
    expect(JSON.parse(storage.getItem(CHAVE_ARMAZENAMENTO)!)).toEqual({
      versao: 1,
      alunos: [{ ra: 258004, name: "Daniela Ferreira Lima" }],
      matriculas: [],
    });
  });

  it("converte cota excedida em ErroArmazenamento('cota')", () => {
    const storage = new StorageEmMemoria();
    storage.setItem = () => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };

    expect.assertions(3);
    try {
      salvarCadastros({ alunos: [], matriculas: [] }, () => storage);
    } catch (erro) {
      expect(erro).toBeInstanceOf(ErroArmazenamento);
      expect((erro as ErroArmazenamento).motivo).toBe("cota");
      expect(storage.getItem(CHAVE_ARMAZENAMENTO)).toBeNull();
    }
  });

  it("falha se não conseguir confirmar a gravação", () => {
    const storage = new StorageEmMemoria();
    storage.setItem = () => {}; // aceita sem gravar nada

    expect(() =>
      salvarCadastros({ alunos: [], matriculas: [] }, () => storage),
    ).toThrowError(new ErroArmazenamento("verificacao"));
  });
});
