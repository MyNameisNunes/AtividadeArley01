import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * A loja usa `window.localStorage` e o evento `storage`. Aqui simulamos um
 * `window` mínimo para verificar a regra principal: o estado em memória só
 * muda depois que a gravação foi confirmada.
 */
function criarJanelaFalsa() {
  const itens = new Map<string, string>();
  const ouvintes = new Set<(evento: StorageEvent) => void>();
  const localStorage = {
    falharAoGravar: false,
    getItem: (chave: string) => itens.get(chave) ?? null,
    setItem(chave: string, valor: string) {
      if (this.falharAoGravar) {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      }
      itens.set(chave, valor);
    },
  };
  return {
    localStorage,
    addEventListener: (_tipo: string, ouvinte: (evento: StorageEvent) => void) =>
      ouvintes.add(ouvinte),
    removeEventListener: (_tipo: string, ouvinte: (evento: StorageEvent) => void) =>
      ouvintes.delete(ouvinte),
    dispararStorage: (key: string | null) => {
      for (const ouvinte of ouvintes) ouvinte({ key } as StorageEvent);
    },
  };
}

let janela: ReturnType<typeof criarJanelaFalsa>;

beforeEach(() => {
  vi.resetModules(); // cada teste começa com a loja "zerada"
  janela = criarJanelaFalsa();
  vi.stubGlobal("window", janela);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("lojaCadastros", () => {
  it("no servidor/hidratação o estado é null (ainda não carregado)", async () => {
    const { lerLojaNoServidor } = await import("@/lib/lojaCadastros");
    expect(lerLojaNoServidor()).toBeNull();
  });

  it("devolve a MESMA referência enquanto nada muda (exigência do useSyncExternalStore)", async () => {
    const { lerLoja } = await import("@/lib/lojaCadastros");
    expect(lerLoja()).toBe(lerLoja());
  });

  it("grava, atualiza o estado e notifica os ouvintes", async () => {
    const { assinarLoja, gravarNaLoja, lerLoja } = await import("@/lib/lojaCadastros");
    const ouvinte = vi.fn();
    assinarLoja(ouvinte);

    const novos = { alunos: [{ ra: 258004, name: "Daniela Ferreira Lima" }], matriculas: [] };
    gravarNaLoja(novos);

    expect(ouvinte).toHaveBeenCalledTimes(1);
    expect(lerLoja().cadastros).toEqual(novos);
  });

  it("se a gravação falhar, o estado NÃO muda e ninguém é notificado", async () => {
    const { assinarLoja, gravarNaLoja, lerLoja } = await import("@/lib/lojaCadastros");
    const antes = lerLoja();
    const ouvinte = vi.fn();
    assinarLoja(ouvinte);

    janela.localStorage.falharAoGravar = true;
    expect(() =>
      gravarNaLoja({ alunos: [{ ra: 258004, name: "Daniela Ferreira Lima" }], matriculas: [] }),
    ).toThrow(/espaço de armazenamento/);

    expect(ouvinte).not.toHaveBeenCalled();
    expect(lerLoja()).toBe(antes);
    expect(lerLoja().cadastros.alunos).toEqual([]);
  });

  it("sincronizarLoja relê o que está salvo agora (ler → validar → gravar)", async () => {
    const { assinarLoja, lerLoja, sincronizarLoja } = await import("@/lib/lojaCadastros");
    expect(lerLoja().cadastros.alunos).toEqual([]); // cache desta aba: vazio
    const ouvinte = vi.fn();
    assinarLoja(ouvinte);

    // Outra aba gravou sem que esta aba recebesse o evento "storage".
    const daOutraAba = { ra: 258004, name: "Daniela Ferreira Lima" };
    janela.localStorage.setItem(
      "registro-academico:cadastros",
      JSON.stringify({ versao: 1, alunos: [daOutraAba], matriculas: [] }),
    );

    expect(sincronizarLoja().alunos).toEqual([daOutraAba]);
    expect(lerLoja().cadastros.alunos).toEqual([daOutraAba]);
    expect(ouvinte).toHaveBeenCalledTimes(1);

    // Sem mudanças, não notifica de novo.
    sincronizarLoja();
    expect(ouvinte).toHaveBeenCalledTimes(1);
  });

  it("relê os dados quando outra aba altera o localStorage", async () => {
    const { assinarLoja, lerLoja, gravarNaLoja } = await import("@/lib/lojaCadastros");
    const ouvinte = vi.fn();
    assinarLoja(ouvinte);
    const antes = lerLoja();

    gravarNaLoja({ alunos: [], matriculas: [] });
    ouvinte.mockClear();
    janela.dispararStorage("registro-academico:cadastros");

    expect(ouvinte).toHaveBeenCalledTimes(1);
    expect(lerLoja()).not.toBe(antes);
  });
});
