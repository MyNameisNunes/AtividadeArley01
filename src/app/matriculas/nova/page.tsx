import type { Metadata } from "next";
import { EnrollmentForm } from "@/components/EnrollmentForm";
import { IconeMais } from "@/components/Icons";
import { ModuleArea, PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Nova matrícula",
};

/** /matriculas/nova — cadastro de matrícula (sem edição/cancelamento). */
export default function NovaMatriculaPage() {
  return (
    <ModuleArea modulo="matriculas">
      <PageHeader
        icone={<IconeMais tamanho={24} />}
        sobretitulo="Gestão de matrículas"
        titulo="Nova matrícula"
        descricao="Vincule um aluno a uma disciplina. As opções são carregadas das coleções da aplicação."
      />
      <EnrollmentForm />
    </ModuleArea>
  );
}
