import type { Page } from "@playwright/test";
import {
  cadastrarAluno,
  cadastrarMatricula,
  contador,
  expect,
  lateralDeAlunos,
  linhasDaTabela,
  listaDeAlunos,
  test,
} from "./fixtures";

const CHAVE = "registro-academico:cadastros";

/** Faz toda gravação no localStorage falhar como "cota excedida". */
async function simularCotaExcedida(page: Page) {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (chave: string, valor: string) {
      if (this === window.localStorage) {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      }
      return original.call(this, chave, valor);
    };
  });
}

test.describe("Parte 4 — Estado e persistência", () => {
  test("aluno cadastrado permanece após recarregar a página", async ({ page }) => {
    await cadastrarAluno(page, "258020", "Gabriel Souza Pinto");
    await expect(page).toHaveURL("/alunos?cadastrado=258020");

    await page.goto("/alunos");
    await page.reload();
    await expect(listaDeAlunos(page).getByRole("link", { name: /Gabriel Souza Pinto/ })).toBeVisible();
    await expect(listaDeAlunos(page).getByRole("link", { name: /Ana Clara Silva/ })).toBeVisible();
    await expect(contador(page)).toHaveText("4alunos cadastrados");

    await page.goto("/alunos/258020");
    await expect(page.getByRole("heading", { level: 2, name: "Gabriel Souza Pinto" })).toBeVisible();
  });

  test("matrícula cadastrada permanece após recarregar a página", async ({ page }) => {
    await cadastrarMatricula(page, "258003", "39");
    await expect(page).toHaveURL("/matriculas?nova=258003-39");

    await page.goto("/matriculas");
    await page.reload();
    const linhas = linhasDaTabela(page);
    await expect(linhas).toHaveCount(23);
    await expect(linhas.last()).toContainText("Camila Oliveira Souza");
    await expect(linhas.last()).toContainText("Inglês IV");
  });

  test("localStorage guarda só os registros novos; os originais vêm dos arquivos", async ({ page }) => {
    await cadastrarAluno(page, "258030", "Helena Duarte Ramos");
    await expect(page).toHaveURL("/alunos?cadastrado=258030");
    await cadastrarMatricula(page, "258030", "2");
    await expect(page).toHaveURL("/matriculas?nova=258030-2");

    const salvo = await page.evaluate((chave) => JSON.parse(localStorage.getItem(chave)!), CHAVE);
    expect(salvo).toEqual({
      versao: 1,
      alunos: [{ ra: 258030, name: "Helena Duarte Ramos" }],
      matriculas: [{ student_ra: 258030, course_id: 2 }],
    });
    await expect(linhasDaTabela(page)).toHaveCount(23);
  });

  test("HTML do servidor não depende do localStorage (estado de carregamento)", async ({ request }) => {
    const html = await (await request.get("/alunos")).text();
    expect(html).toContain("Carregando alunos…");
    expect(html).not.toContain("Ana Clara Silva");
  });

  test("falha ao gravar aluno: informa o erro e não conclui a operação", async ({ page }) => {
    await simularCotaExcedida(page);
    await cadastrarAluno(page, "258040", "Igor Nunes Prado");

    const alerta = page.getByRole("alert").filter({ hasText: "Não foi possível" });
    await expect(alerta).toContainText("Não foi possível cadastrar o aluno");
    await expect(alerta).toContainText("O espaço de armazenamento do navegador está cheio.");
    await expect(alerta).toContainText("nenhuma alteração foi aplicada");
    await expect(page).toHaveURL("/alunos/novo");
    await expect(page.getByRole("textbox", { name: "RA" })).toHaveValue("258040"); // dados digitados preservados
    await expect(page.getByText("Aluno cadastrado com sucesso")).toHaveCount(0);

    await lateralDeAlunos(page).getByRole("link", { name: "Lista de alunos" }).click();
    await expect(listaDeAlunos(page).getByRole("listitem")).toHaveCount(3);
    await expect(contador(page)).toHaveText("3alunos cadastrados");
  });

  test("falha ao gravar matrícula: informa o erro e preserva os dados existentes", async ({ page }) => {
    await simularCotaExcedida(page);
    await cadastrarMatricula(page, "258002", "1");

    await expect(page.getByRole("alert").filter({ hasText: "Não foi possível" })).toContainText("Não foi possível cadastrar a matrícula");
    await expect(page).toHaveURL("/matriculas/nova");

    await page
      .getByRole("navigation", { name: "Navegação principal" })
      .getByRole("link", { name: "Matrículas" })
      .click();
    await expect(linhasDaTabela(page)).toHaveCount(22);
  });

  test("armazenamento bloqueado: avisa e mantém os registros originais", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        get() {
          throw new DOMException("The operation is insecure.", "SecurityError");
        },
      });
    });

    await page.goto("/alunos");
    await expect(
      page.getByRole("status").filter({ hasText: "Atenção: armazenamento local" }),
    ).toContainText("bloqueou o acesso ao armazenamento local");
    await expect(contador(page)).toHaveText("3alunos cadastrados");
  });

  test("dados corrompidos no navegador são ignorados com aviso", async ({ page }) => {
    await page.addInitScript((chave) => {
      localStorage.setItem(chave, "{isto não é json");
    }, CHAVE);

    await page.goto("/matriculas");
    await expect(
      page.getByRole("status").filter({ hasText: "Atenção: armazenamento local" }),
    ).toContainText("corrompidos");
    await expect(linhasDaTabela(page)).toHaveCount(22);
  });

  test("outra aba recebe o novo cadastro sem recarregar (evento storage)", async ({ context }) => {
    const abaA = await context.newPage();
    const abaB = await context.newPage();
    await abaB.goto("/alunos");
    await expect(contador(abaB)).toHaveText("3alunos cadastrados");

    await cadastrarAluno(abaA, "258050", "Juliana Prates Moura");
    await expect(abaA).toHaveURL("/alunos?cadastrado=258050");

    await expect(listaDeAlunos(abaB).getByRole("link", { name: /Juliana Prates Moura/ })).toBeVisible();
    await expect(contador(abaB)).toHaveText("4alunos cadastrados");
  });
});
