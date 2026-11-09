import type { Metadata } from "next";
import { Suspense } from "react";
import { ButtonLink } from "@/components/Button";
import { LoadingState } from "@/components/Feedback";
import { IconeIdentificacao, IconeVoltar } from "@/components/Icons";
import { PageHeader } from "@/components/PageHeader";
import { StudentDetails } from "@/components/StudentDetails";

export const metadata: Metadata = {
  title: "Detalhes do aluno",
};

/**
 * Lê o segmento dinâmico [ra]. Em Next.js 16, `params` é uma Promise; com
 * Cache Components, o acesso precisa ficar dentro de um <Suspense>.
 */
async function DetalhesPeloRa({ params }: { params: Promise<{ ra: string }> }) {
  const { ra } = await params;
  return <StudentDetails ra={decodificar(ra)} />;
}

/** Decodifica o segmento da URL sem quebrar com sequências inválidas (%E0). */
function decodificar(segmento: string): string {
  try {
    return decodeURIComponent(segmento);
  } catch {
    return segmento;
  }
}

/** /alunos/[ra] — detalhes de um aluno pelo RA informado na URL. */
export default function DetalhesAlunoPage({ params }: PageProps<"/alunos/[ra]">) {
  return (
    <>
      <PageHeader
        icone={<IconeIdentificacao tamanho={24} />}
        sobretitulo="Gestão de alunos"
        titulo="Detalhes do aluno"
        descricao="Dados do aluno localizado pelo RA informado no endereço."
        acoes={
          <ButtonLink href="/alunos" variante="secundario" icone={<IconeVoltar tamanho={18} />}>
            Voltar para a lista
          </ButtonLink>
        }
      />
      <Suspense fallback={<LoadingState linhas={3} rotulo="Carregando dados do aluno…" />}>
        <DetalhesPeloRa params={params} />
      </Suspense>
    </>
  );
}
