import type { Metadata } from "next";
import { Suspense } from "react";
import { ButtonLink } from "@/components/Button";
import { ContadorAlunos } from "@/components/Contadores";
import { LoadingState } from "@/components/Feedback";
import { IconeAlunos, IconeMais } from "@/components/Icons";
import { PageHeader } from "@/components/PageHeader";
import { StudentList } from "@/components/StudentList";

export const metadata: Metadata = {
  title: "Alunos",
};

/** /alunos — consulta dos alunos cadastrados. */
export default function AlunosPage() {
  return (
    <>
      <PageHeader
        icone={<IconeAlunos tamanho={24} />}
        sobretitulo="Gestão de alunos"
        titulo="Alunos cadastrados"
        descricao="Consulte o nome e o RA de cada aluno e acesse os detalhes. Novos alunos aparecem aqui assim que são cadastrados."
        indicador={<ContadorAlunos />}
        acoes={
          <ButtonLink href="/alunos/novo" icone={<IconeMais tamanho={18} />}>
            Cadastrar aluno
          </ButtonLink>
        }
      />
      {/* StudentList lê ?cadastrado= da URL (useSearchParams). */}
      <Suspense fallback={<LoadingState linhas={4} rotulo="Carregando alunos…" />}>
        <StudentList />
      </Suspense>
    </>
  );
}
