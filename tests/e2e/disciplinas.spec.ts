import { disciplinas } from "../../src/data/disciplinas";
import { contador, conteudo, expect, test } from "./fixtures";

test.describe("Parte 2 — Consulta de disciplinas", () => {
  test("apresenta as 39 disciplinas em cartões com ID e nome", async ({ page }) => {
    test.slow(); // confere os 39 cartões um a um
    await page.goto("/disciplinas");
    const cartoes = conteudo(page).getByRole("article");

    await expect(cartoes).toHaveCount(39);
    await expect(contador(page)).toHaveText("39disciplinas");

    for (const [indice, disciplina] of disciplinas.entries()) {
      const cartao = cartoes.nth(indice);
      await expect(cartao.getByRole("heading")).toHaveText(disciplina.name);
      await expect(cartao.locator("p").first()).toHaveText(`ID${disciplina.id}`);
    }
  });

  test("HTML do servidor já contém o catálogo completo (Server Component)", async ({ request }) => {
    const html = await (await request.get("/disciplinas")).text();
    for (const disciplina of disciplinas) {
      expect(html).toContain(disciplina.name);
    }
  });

  test("não oferece cadastro, edição ou exclusão", async ({ page }) => {
    await page.goto("/disciplinas");
    await expect(conteudo(page).getByRole("button")).toHaveCount(0);
    await expect(conteudo(page).locator("form, input, select, textarea")).toHaveCount(0);

    for (const rota of ["/disciplinas/nova", "/disciplinas/novo", "/disciplinas/1"]) {
      const resposta = await page.goto(rota);
      expect(resposta?.status(), rota).toBe(404);
    }
  });
});
