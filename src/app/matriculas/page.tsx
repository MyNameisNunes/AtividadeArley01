import type { Metadata } from "next";
import { Suspense } from "react";
import { ButtonLink } from "@/components/Button";
import { ContadorMatriculas } from "@/components/Contadores";
import { EnrollmentOverview } from "@/components/EnrollmentOverview";
import { LoadingState } from "@/components/Feedback";
import { IconeMais, IconeMatriculas } from "@/components/Icons";
import { ModuleArea, PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Matrículas",
};

/** /matriculas — consulta das matrículas em tabela. */
export default function MatriculasPage() {
  return (
    <ModuleArea modulo="matriculas">
      <PageHeader
        icone={<IconeMatriculas tamanho={24} />}
        sobretitulo="Gestão de matrículas"
        titulo="Matrículas"
        descricao="Vínculos entre alunos e disciplinas. Os nomes são obtidos a partir do RA do aluno e do ID da disciplina de cada matrícula."
        indicador={<ContadorMatriculas />}
        acoes={
          <ButtonLink href="/matriculas/nova" icone={<IconeMais tamanho={18} />}>
            Nova matrícula
          </ButtonLink>
        }
      />
      {/* EnrollmentOverview lê ?nova= da URL (useSearchParams). */}
      <Suspense fallback={<LoadingState linhas={6} rotulo="Carregando matrículas…" />}>
        <EnrollmentOverview />
      </Suspense>
    </ModuleArea>
  );
}
