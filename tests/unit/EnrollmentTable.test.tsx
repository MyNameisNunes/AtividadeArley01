import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { alunos } from "@/data/alunos";
import { disciplinas } from "@/data/disciplinas";
import { matriculas } from "@/data/matriculas";
import { EnrollmentTable } from "@/components/EnrollmentTable";
import { relacionarMatriculas } from "@/lib/relacionamentos";

/**
 * O estado vazio da tabela não pode ser alcançado pela interface (os dados
 * fornecidos já têm 22 matrículas e não existe exclusão), então ele é
 * verificado renderizando o componente diretamente.
 */
describe("EnrollmentTable", () => {
  it("exibe mensagem e link de cadastro quando não há matrículas", () => {
    const html = renderToStaticMarkup(<EnrollmentTable linhas={[]} />);
    expect(html).toContain("Nenhuma matrícula cadastrada");
    expect(html).toContain('href="/matriculas/nova"');
    expect(html).not.toContain("<table");
  });

  it("renderiza uma linha por matrícula com os nomes relacionados", () => {
    const linhas = relacionarMatriculas(matriculas, alunos, disciplinas);
    const html = renderToStaticMarkup(<EnrollmentTable linhas={linhas} />);

    const corpo = html.slice(html.indexOf("<tbody>"), html.indexOf("</tbody>"));
    expect(corpo.match(/<tr[\s>]/g)).toHaveLength(22);
    expect(html).toContain("Nome do aluno");
    expect(html).toContain("Nome da disciplina");
    expect(html).toContain("Bruno Henrique Santos");
    expect(html).toContain("Internet das Coisas e Aplicações");
  });
});
