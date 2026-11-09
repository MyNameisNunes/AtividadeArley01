import type { Metadata } from "next";
import { Public_Sans, Source_Serif_4 } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { StorageNotice } from "@/components/StorageNotice";
import "./globals.css";
import styles from "./layout.module.css";

// next/font baixa as fontes no build e as serve pela própria aplicação.
const fonteSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

const fonteSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Registro Acadêmico",
    template: "%s · Registro Acadêmico",
  },
  description:
    "Consulta e cadastro de alunos e matrículas e catálogo de disciplinas. Atividade 1 de Laboratório de Desenvolvimento Web (Next.js).",
};

/**
 * Layout raiz: envolve TODAS as páginas com cabeçalho, menu, conteúdo e
 * rodapé. É um Server Component; apenas o <AppProvider> (estado
 * compartilhado) e o menu (rota ativa) executam no navegador.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${fonteSans.variable} ${fonteSerif.variable}`}>
      <body>
        <a href="#conteudo" className={styles.pularConteudo}>
          Pular para o conteúdo
        </a>
        <AppProvider>
          <div className={styles.estrutura}>
            <Header />
            <StorageNotice />
            <main id="conteudo" tabIndex={-1} className={styles.principal}>
              {children}
            </main>
            <Footer />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
