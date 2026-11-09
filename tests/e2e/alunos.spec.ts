import {
  cadastrarAluno,
  contador,
  conteudo,
  expect,
  lateralDeAlunos,
  listaDeAlunos,
  test,
} from "./fixtures";

test.describe("Parte 1 — Gestão de alunos", () => {
  test("lista nome e RA dos alunos com a quantidade total", async ({ page }) => {
    await page.goto("/alunos");
    const lista = listaDeAlunos(page);

    await expect(lista.getByRole("listitem")).toHaveCount(3);
    for (const [ra, nome] of [
      ["258001", "Ana Clara Silva"],
      ["258002", "Bruno Henrique Santos"],
      ["258003", "Camila Oliveira Souza"],
    ]) {
      const item = lista.getByRole("link", { name: new RegExp(nome) });
      await expect(item).toContainText(`RA ${ra}`);
      await expect(item).toHaveAttribute("href", `/alunos/${ra}`);
    }
    await expect(contador(page)).toHaveText("3alunos cadastrados");
  });

  test("abre os detalhes do aluno pelo link da listagem", async ({ page }) => {
    await page.goto("/alunos");
    await listaDeAlunos(page).getByRole("link", { name: /Ana Clara Silva/ }).click();

    await expect(page).toHaveURL("/alunos/258001");
    await expect(page.getByRole("heading", { level: 2, name: "Ana Clara Silva" })).toBeVisible();
    await expect(page.getByText("Registro original")).toBeVisible();
    const disciplinas = page
      .getByRole("region", { name: "Disciplinas matriculadas" })
      .getByRole("listitem");
    await expect(disciplinas).toHaveCount(5);
    await expect(disciplinas.first()).toContainText("Algoritmos e Lógica de Programação");
  });

  test("RA inexistente mostra mensagem e link para voltar à listagem", async ({ page }) => {
    await page.goto("/alunos/999999");
    await expect(page.getByRole("heading", { name: "Aluno não encontrado" })).toBeVisible();
    await expect(page.getByText("Não existe aluno cadastrado com o RA 999999")).toBeVisible();

    await page.getByRole("link", { name: "Voltar para a lista de alunos" }).click();
    await expect(page).toHaveURL("/alunos");
  });

  test("RA com formato inválido na URL também é tratado", async ({ page }) => {
    for (const rota of ["/alunos/abc", "/alunos/0258001"]) {
      await page.goto(rota);
      await expect(page.getByRole("heading", { name: "Aluno não encontrado" }), rota).toBeVisible();
      await expect(page.getByText(/não é um RA válido/), rota).toBeVisible();
    }
  });

  test("formulário tem RA, nome completo, botão de cadastro e link para voltar", async ({ page }) => {
    await page.goto("/alunos/novo");
    await expect(page.getByRole("textbox", { name: "RA" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Nome completo" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cadastrar aluno" })).toBeEnabled();

    await page.getByRole("link", { name: "Voltar para a lista" }).click();
    await expect(page).toHaveURL("/alunos");
  });

  test("campos obrigatórios", async ({ page }) => {
    await page.goto("/alunos/novo");
    await page.getByRole("button", { name: "Cadastrar aluno" }).click();

    await expect(page).toHaveURL("/alunos/novo");
    await expect(page.getByText("Informe o RA do aluno.")).toBeVisible();
    await expect(page.getByText("Informe o nome completo do aluno.")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "RA" })).toBeFocused();
    await expect(page.getByRole("textbox", { name: "RA" })).toHaveAttribute("aria-invalid", "true");
  });

  test("valida o formato do RA e do nome", async ({ page }) => {
    await page.goto("/alunos/novo");
    const ra = page.getByRole("textbox", { name: "RA" });
    const nome = page.getByRole("textbox", { name: "Nome completo" });

    await ra.fill("25a");
    await nome.fill("Ana");
    await page.getByRole("button", { name: "Cadastrar aluno" }).click();
    await expect(page.getByText("O RA deve conter apenas números.")).toBeVisible();
    await expect(page.getByText("Informe o nome completo, com nome e sobrenome.")).toBeVisible();

    await ra.fill("12345");
    await expect(page.getByText("O RA deve ter exatamente 6 dígitos (por exemplo, 258004).")).toBeVisible();
    await ra.fill("012345");
    await expect(page.getByText("O RA não pode começar com zero.")).toBeVisible();
  });

  test("um único clique envia e mostra todos os erros (sem perder o clique)", async ({ page }) => {
    await page.goto("/alunos/novo");
    await page.getByRole("textbox", { name: "RA" }).fill("258001");
    // O foco está no RA; o clique tira o foco do campo e envia na mesma ação.
    await page.getByRole("button", { name: "Cadastrar aluno" }).click();

    await expect(page.getByText("Já existe um aluno com o RA 258001: Ana Clara Silva.")).toBeVisible();
    await expect(page.getByText("Informe o nome completo do aluno.")).toBeVisible();
  });

  test("RA colado com espaços é aceito (espaços são descartados)", async ({ page }) => {
    await cadastrarAluno(page, " 258006 ", "Otávio Lins Barreto");
    await expect(page).toHaveURL("/alunos?cadastrado=258006");
  });

  test("impede RA duplicado", async ({ page }) => {
    await cadastrarAluno(page, "258001", "Outra Pessoa Qualquer");

    await expect(page).toHaveURL("/alunos/novo");
    await expect(
      page.getByText("Já existe um aluno com o RA 258001: Ana Clara Silva."),
    ).toBeVisible();

    await lateralDeAlunos(page).getByRole("link", { name: "Lista de alunos" }).click();
    await expect(listaDeAlunos(page).getByRole("listitem")).toHaveCount(3);
    await expect(conteudo(page).getByRole("link", { name: /Outra Pessoa/ })).toHaveCount(0);
  });

  test("cadastro válido atualiza a listagem, a quantidade e o menu lateral", async ({ page }) => {
    await cadastrarAluno(page, "258004", "Daniela Ferreira Lima");

    await expect(page).toHaveURL("/alunos?cadastrado=258004");
    await expect(
      page.getByRole("status").filter({ hasText: "Aluno cadastrado com sucesso" }),
    ).toBeVisible();
    // O foco vai para a confirmação (acessibilidade após o redirecionamento).
    await expect(page.locator(":focus")).toContainText("Aluno cadastrado com sucesso");
    await expect(contador(page)).toHaveText("4alunos cadastrados");
    await expect(listaDeAlunos(page).getByRole("listitem")).toHaveCount(4);
    await expect(
      listaDeAlunos(page).getByRole("link", { name: /Daniela Ferreira Lima/ }),
    ).toContainText("RA 258004");
    await expect(
      lateralDeAlunos(page).getByRole("link", { name: /Daniela Ferreira Lima/ }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Ver detalhes", exact: true }).click();
    await expect(page).toHaveURL("/alunos/258004");
    await expect(
      page.getByRole("heading", { level: 2, name: "Daniela Ferreira Lima" }),
    ).toBeVisible();
    await expect(page.getByText("Cadastrado neste navegador", { exact: true })).toBeVisible();
    await expect(
      lateralDeAlunos(page).getByRole("link", { name: /Daniela Ferreira Lima/ }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("formulário volta limpo após um cadastro bem-sucedido", async ({ page }) => {
    await cadastrarAluno(page, "258005", "Eduardo Martins Rocha");
    await expect(page).toHaveURL("/alunos?cadastrado=258005");

    await lateralDeAlunos(page).getByRole("link", { name: "Cadastrar aluno" }).click();
    await expect(page).toHaveURL("/alunos/novo");
    await expect(page.getByRole("textbox", { name: "RA" })).toHaveValue("");
    await expect(page.getByRole("textbox", { name: "Nome completo" })).toHaveValue("");
    await expect(page.getByRole("button", { name: "Cadastrar aluno" })).toBeEnabled();
  });
});
