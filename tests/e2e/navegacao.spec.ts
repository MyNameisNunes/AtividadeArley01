import AxeBuilder from "@axe-core/playwright";
import { conteudo, expect, test } from "./fixtures";

const ROTAS = [
  "/",
  "/alunos",
  "/alunos/novo",
  "/alunos/258001",
  "/disciplinas",
  "/matriculas",
  "/matriculas/nova",
];

test.describe("Navegação e layouts", () => {
  test("página inicial apresenta o sistema, o objetivo e os links dos módulos", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle("Registro Acadêmico");
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page.getByRole("heading", { level: 1, name: "Registro Acadêmico" })).toBeVisible();
    await expect(conteudo(page)).toContainText("consultar e cadastrar alunos e matrículas");

    for (const href of ["/alunos", "/disciplinas", "/matriculas"]) {
      await expect(conteudo(page).locator(`a[href="${href}"]`).first()).toBeVisible();
    }
  });

  test("menu principal, cabeçalho e rodapé existem em todas as páginas", async ({ page }) => {
    test.slow(); // percorre várias páginas em sequência
    for (const rota of [...ROTAS, "/rota-que-nao-existe"]) {
      await page.goto(rota);
      const menu = page.getByRole("navigation", { name: "Navegação principal" });
      await expect(menu, rota).toBeVisible();
      for (const nome of ["Início", "Alunos", "Disciplinas", "Matrículas"]) {
        await expect(menu.getByRole("link", { name: nome }), `${rota} → ${nome}`).toBeVisible();
      }
      await expect(page.getByRole("banner")).toContainText("Registro Acadêmico");
      await expect(page.getByRole("contentinfo")).toBeVisible();
    }
  });

  test("destaca a área ativa, inclusive em cadastro e detalhes", async ({ page }) => {
    test.slow(); // percorre várias páginas em sequência
    const casos: [string, string, string][] = [
      ["/", "Início", "page"],
      ["/alunos", "Alunos", "page"],
      ["/alunos/novo", "Alunos", "true"],
      ["/alunos/258001", "Alunos", "true"],
      ["/disciplinas", "Disciplinas", "page"],
      ["/matriculas", "Matrículas", "page"],
      ["/matriculas/nova", "Matrículas", "true"],
    ];

    for (const [rota, ativo, valor] of casos) {
      await page.goto(rota);
      const menu = page.getByRole("navigation", { name: "Navegação principal" });
      await expect(menu.getByRole("link", { name: ativo }), rota).toHaveAttribute(
        "aria-current",
        valor,
      );
      const outros = ["Início", "Alunos", "Disciplinas", "Matrículas"].filter((n) => n !== ativo);
      for (const nome of outros) {
        await expect(menu.getByRole("link", { name: nome }), `${rota} → ${nome}`).not.toHaveAttribute(
          "aria-current",
          /.*/,
        );
      }
    }
  });

  test("navega entre as áreas pelo menu sem recarregar a página", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => ((window as unknown as Record<string, boolean>).__semRecarga = true));
    const menu = page.getByRole("navigation", { name: "Navegação principal" });

    await menu.getByRole("link", { name: "Disciplinas" }).click();
    await expect(page).toHaveURL("/disciplinas");
    await expect(page.getByRole("heading", { level: 1, name: "Disciplinas do curso" })).toBeVisible();

    await menu.getByRole("link", { name: "Matrículas" }).click();
    await expect(page).toHaveURL("/matriculas");
    await expect(page.getByRole("heading", { level: 1, name: "Matrículas" })).toBeVisible();

    await menu.getByRole("link", { name: "Alunos" }).click();
    await expect(page).toHaveURL("/alunos");

    expect(await page.evaluate(() => (window as unknown as Record<string, boolean>).__semRecarga)).toBe(true);
  });

  test("área de alunos usa layout próprio com menu lateral", async ({ page }) => {
    for (const rota of ["/alunos", "/alunos/novo", "/alunos/258001"]) {
      await page.goto(rota);
      const lateral = page.getByRole("complementary", { name: "Área de alunos" });
      await expect(lateral, rota).toBeVisible();
      await expect(lateral.getByRole("link", { name: "Lista de alunos" })).toBeVisible();
      await expect(lateral.getByRole("link", { name: "Cadastrar aluno" })).toBeVisible();
    }

    for (const rota of ["/", "/disciplinas", "/matriculas"]) {
      await page.goto(rota);
      await expect(page.getByRole("complementary", { name: "Área de alunos" }), rota).toHaveCount(0);
    }
  });

  test("menu lateral destaca o aluno selecionado", async ({ page }) => {
    await page.goto("/alunos/258002");
    const lateral = page.getByRole("complementary", { name: "Área de alunos" });
    await expect(lateral.getByRole("link", { name: /Bruno Henrique Santos/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(lateral.getByRole("link", { name: /Ana Clara Silva/ })).not.toHaveAttribute(
      "aria-current",
      /.*/,
    );
  });

  test("cada módulo usa sua cor predominante", async ({ page }) => {
    test.slow(); // percorre várias páginas em sequência
    const cores: [string, string][] = [
      ["/alunos", "#1d4ed8"],
      ["/alunos/novo", "#1d4ed8"],
      ["/disciplinas", "#15803d"],
      ["/matriculas", "#c2410c"],
      ["/matriculas/nova", "#c2410c"],
    ];
    for (const [rota, cor] of cores) {
      await page.goto(rota);
      const accent = await conteudo(page)
        .locator("[data-modulo]")
        .first()
        .evaluate((el) => getComputedStyle(el).getPropertyValue("--accent").trim());
      expect(accent, rota).toBe(cor);
    }
  });

  test("rota inexistente mostra página de endereço não encontrado", async ({ page }) => {
    const resposta = await page.goto("/rota-que-nao-existe");
    expect(resposta?.status()).toBe(404);
    await expect(page).toHaveTitle("Endereço não encontrado · Registro Acadêmico");
    await expect(page.getByRole("heading", { level: 1, name: "Endereço não encontrado" })).toBeVisible();

    await conteudo(page).getByRole("link", { name: "Voltar ao início" }).click();
    await expect(page).toHaveURL("/");
  });

  test("não existem operações de edição, exclusão ou cancelamento", async ({ page }) => {
    test.slow(); // percorre várias páginas em sequência
    for (const rota of ROTAS) {
      await page.goto(rota);
      await expect(
        conteudo(page).getByRole("button", { name: /editar|excluir|remover|apagar|cancelar/i }),
        rota,
      ).toHaveCount(0);
      await expect(
        conteudo(page).getByRole("link", { name: /editar|excluir|remover|apagar|cancelar/i }),
        rota,
      ).toHaveCount(0);
    }
  });

  test("layout responsivo: nenhuma página nem a tabela exigem rolagem horizontal", async ({ page }) => {
    test.slow(); // percorre várias páginas em sequência
    for (const rota of [...ROTAS, "/rota-que-nao-existe"]) {
      await page.goto(rota);
      await expect(page.getByText(/^Carregando/)).toHaveCount(0);
      const transbordo = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(transbordo, rota).toBeLessThanOrEqual(0);
    }

    await page.goto("/matriculas");
    const regiaoTabela = page.getByRole("region", { name: /Matrículas cadastradas/ });
    const sobra = await regiaoTabela.evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(sobra, "tabela de matrículas").toBeLessThanOrEqual(0);
  });

  test("páginas sem violações de acessibilidade (WCAG 2.1 A/AA)", async ({ page }) => {
    test.slow(); // percorre várias páginas em sequência
    for (const rota of [...ROTAS, "/alunos/999999", "/rota-que-nao-existe"]) {
      await page.goto(rota);
      // Aguarda os dados do navegador substituírem os esqueletos de carregamento.
      await expect(page.getByText(/^Carregando/)).toHaveCount(0);
      const resultado = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const violacoes = resultado.violations.map(
        (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`,
      );
      expect(violacoes, rota).toEqual([]);
    }
  });
});
