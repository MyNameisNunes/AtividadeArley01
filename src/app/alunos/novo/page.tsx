import type { Metadata } from "next";
import { IconeMais } from "@/components/Icons";
import { PageHeader } from "@/components/PageHeader";
import { StudentForm } from "@/components/StudentForm";

export const metadata: Metadata = {
  title: "Cadastrar aluno",
};

/** /alunos/novo — cadastro de aluno (somente cadastro: sem edição/exclusão). */
export default function NovoAlunoPage() {
  return (
    <>
      <PageHeader
        icone={<IconeMais tamanho={24} />}
        sobretitulo="Gestão de alunos"
        titulo="Cadastrar aluno"
        descricao="Informe o RA e o nome completo. O novo aluno aparece imediatamente na lista e na seleção de matrículas."
      />
      <StudentForm />
    </>
  );
}
