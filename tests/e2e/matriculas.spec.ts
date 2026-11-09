import { alunos } from "../../src/data/alunos";
import { disciplinas } from "../../src/data/disciplinas";
import { matriculas } from "../../src/data/matriculas";
import {
  cadastrarAluno,
  cadastrarMatricula,
  contador,
  expect,
  linhasDaTabela,
  test,
} from "./fixtures";

function menuPrincipal(page: import("@playwright/test").Page) {
  return page.getByRole("navigation", { name: "Navegação principal" });
}

test.describe("Parte 3 — Gestão de matrículas", () => {
  test("tabela mostra RA, nome do aluno e nome da disciplina obtidos pelos IDs", async ({ page }) => {
    test.slow(); // confere as 22 linhas uma a uma
    await page.goto("/matriculas");
    const tabela = page.getByRole("table");

    await expect(tabela.getByRole("columnheader")).toHaveText([
      "#",
      "RA",
      "Nome do aluno",
      "Nome da disciplina",
    ]);
    const linhas = linhasDaTabela(page);
    await expect(linhas).toHaveCount(22);
    await expect(contador(page)).toHaveText("22matrículas cadastradas");

    // Resultado esperado calculado a partir das coleções (relacionamento).
    for (const [indice, matricula] of matriculas.entries()) {
      const aluno = alunos.find((a) => a.ra === matricula.student_ra)!;
      const disciplina = disciplinas.find((d) => d.id === matricula.course_id)!;
      const celulas = linhas.nth(indice).getByRole("cell");
      await expect(celulas.nth(1)).toHaveText(String(matricula.student_ra));
      await expect(celulas.nth(2)).toHaveText(aluno.name);
      await expect(celulas.nth(3)).toHaveText(`ID ${disciplina.id}${disciplina.name}`);
    }
  });

  test("formulário tem seleções, botão de cadastro e link para voltar", async ({ page }) => {
    await page.goto("/matriculas/nova");
    await expect(page.getByRole("combobox", { name: "Aluno" }).locator("option")).toHaveCount(alunos.length + 1);
    await expect(page.getByRole("combobox", { name: "Disciplina" }).locator("option")).toHaveCount(
      disciplinas.length + 1,
    );
    await expect(page.getByRole("button", { name: "Cadastrar matrícula" })).toBeEnabled();

    await page.getByRole("link", { name: "Voltar para as matrículas" }).click();
    await expect(page).toHaveURL("/matriculas");
  });

  test("campos obrigatórios", async ({ page }) => {
    await page.goto("/matriculas/nova");
    await page.getByRole("button", { name: "Cadastrar matrícula" }).click();
    await expect(page).toHaveURL("/matriculas/nova");
    await expect(page.getByText("Selecione um aluno.")).toBeVisible();
    await expect(page.getByText("Selecione uma disciplina.")).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Aluno" })).toBeFocused();
  });

  test("cadastro válido volta à listagem com o novo vínculo e o total atualizado", async ({ page }) => {
    await cadastrarMatricula(page, "258001", "6");

    await expect(page).toHaveURL("/matriculas?nova=258001-6");
    await expect(
      page.getByRole("status").filter({ hasText: "Matrícula cadastrada com sucesso" }),
    ).toContainText("O total passou para 23 matrículas");
    await expect(contador(page)).toHaveText("23matrículas cadastradas");

    const linhas = linhasDaTabela(page);
    await expect(linhas).toHaveCount(23);
    const nova = linhas.last();
    await expect(nova).toContainText("258001");
    await expect(nova).toContainText("Ana Clara Silva");
    await expect(nova).toContainText("Sistemas Operacionais e Redes de Comp.");
    await expect(nova).toContainText("Nova");

    // Foco na confirmação e atalho "Ver na tabela" levando à nova linha.
    await expect(page.locator(":focus")).toContainText("Matrícula cadastrada com sucesso");
    await page.getByRole("button", { name: "Ver na tabela" }).click();
    await expect(nova).toBeFocused();
    await expect(nova).toBeInViewport();
  });

  test("impede matrícula duplicada (mesmo RA + mesma disciplina)", async ({ page }) => {
    await page.goto("/matriculas/nova");
    await page.getByRole("combobox", { name: "Aluno" }).selectOption("258001");
    await expect(page.getByRole("combobox", { name: "Disciplina" }).locator('option[value="1"]')).toHaveText(
      /\(já matriculado\)$/,
    );
    await page.getByRole("combobox", { name: "Disciplina" }).selectOption("1");

    const erro =
      "Ana Clara Silva (RA 258001) já possui matrícula em Algoritmos e Lógica de Programação.";
    await expect(page.getByText(erro)).toBeVisible();

    await page.getByRole("button", { name: "Cadastrar matrícula" }).click();
    await expect(page).toHaveURL("/matriculas/nova");
    await expect(page.getByText(erro)).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Disciplina" })).toBeFocused();

    await menuPrincipal(page).getByRole("link", { name: "Matrículas" }).click();
    await expect(linhasDaTabela(page)).toHaveCount(22);
  });

  test("não bloqueia vínculos válidos: aluno com várias disciplinas e disciplina com vários alunos", async ({ page }) => {
    await cadastrarMatricula(page, "258001", "13"); // Ana já tem 5 disciplinas
    await expect(page).toHaveURL("/matriculas?nova=258001-13");

    await cadastrarMatricula(page, "258002", "13"); // disciplina 13 já tem Camila e Ana
    await expect(page).toHaveURL("/matriculas?nova=258002-13");

    await expect(linhasDaTabela(page)).toHaveCount(24);
  });

  test("aluno recém-cadastrado aparece na seleção sem recarregar a página", async ({ page }) => {
    await cadastrarAluno(page, "258010", "Fernanda Alves Costa");
    await expect(page).toHaveURL("/alunos?cadastrado=258010");
    await page.evaluate(() => ((window as unknown as Record<string, boolean>).__semRecarga = true));

    // Navegação pelo menu (client-side), sem reload.
    await menuPrincipal(page).getByRole("link", { name: "Matrículas" }).click();
    await page.getByRole("link", { name: "Nova matrícula" }).click();
    await expect(page).toHaveURL("/matriculas/nova");

    await expect(page.getByRole("combobox", { name: "Aluno" }).locator('option[value="258010"]')).toHaveText(
      "Fernanda Alves Costa — RA 258010",
    );
    expect(
      await page.evaluate(() => (window as unknown as Record<string, boolean>).__semRecarga),
    ).toBe(true);

    await page.getByRole("combobox", { name: "Aluno" }).selectOption("258010");
    await page.getByRole("combobox", { name: "Disciplina" }).selectOption("20");
    await page.getByRole("button", { name: "Cadastrar matrícula" }).click();
    await expect(page).toHaveURL("/matriculas?nova=258010-20");
    await expect(linhasDaTabela(page).last()).toContainText("Fernanda Alves Costa");
    await expect(linhasDaTabela(page).last()).toContainText("Laboratório de Desenvolvimento Web");
  });
});
