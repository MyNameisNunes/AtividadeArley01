import { test as base, expect, type Page } from "@playwright/test";

/**
 * Fixture automática: coleta erros do console e exceções da página durante
 * cada teste e falha o teste se houver algum (inclui erros de hidratação).
 * A resposta 404 da página inexistente é esperada e, por isso, ignorada.
 */
export const test = base.extend<{ errosDoNavegador: string[] }>({
  errosDoNavegador: [
    async ({ page }, use) => {
      const erros: string[] = [];
      page.on("console", (mensagem) => {
        if (mensagem.type() !== "error") return;
        if (/status of 404/.test(mensagem.text())) return;
        erros.push(mensagem.text());
      });
      page.on("pageerror", (erro) => erros.push(erro.message));

      await use(erros);

      expect(erros, "Erros no console do navegador").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** Área principal da página (exclui cabeçalho e rodapé). */
export function conteudo(page: Page) {
  return page.locator("main");
}

/*
 * Com Cache Components, o Next.js mantém páginas visitadas ocultas no DOM
 * (<Activity>). Seletores CSS também encontrariam essas cópias ocultas, por
 * isso os auxiliares abaixo filtram apenas elementos visíveis.
 */

/** Indicador de quantidade do cabeçalho da página. */
export function contador(page: Page) {
  return page.locator("main header p[aria-busy]").filter({ visible: true });
}

/** Linhas do corpo da tabela de matrículas. */
export function linhasDaTabela(page: Page) {
  return page.locator("main tbody tr").filter({ visible: true });
}

/** Lista principal de /alunos (não inclui o menu lateral). */
export function listaDeAlunos(page: Page) {
  return page.getByRole("region", { name: "Lista de alunos" });
}

/** Menu lateral do módulo de alunos. */
export function lateralDeAlunos(page: Page) {
  return page.getByRole("complementary", { name: "Área de alunos" });
}

/** Preenche e envia o formulário de cadastro de aluno. */
export async function cadastrarAluno(page: Page, ra: string, nome: string) {
  await page.goto("/alunos/novo");
  await page.getByRole("textbox", { name: "RA" }).fill(ra);
  await page.getByRole("textbox", { name: "Nome completo" }).fill(nome);
  await page.getByRole("button", { name: "Cadastrar aluno" }).click();
}

/** Seleciona aluno e disciplina e envia o formulário de matrícula. */
export async function cadastrarMatricula(page: Page, ra: string, courseId: string) {
  await page.goto("/matriculas/nova");
  await page.getByRole("combobox", { name: "Aluno" }).selectOption(ra);
  await page.getByRole("combobox", { name: "Disciplina" }).selectOption(courseId);
  await page.getByRole("button", { name: "Cadastrar matrícula" }).click();
}
