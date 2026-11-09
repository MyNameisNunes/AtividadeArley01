"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { LoadingState } from "@/components/Feedback";
import { IconeAlunos, IconeIdentificacao, IconeMais } from "@/components/Icons";
import { useApp } from "@/hooks/useApp";
import { iniciais, pluralizar } from "@/lib/formatacao";
import styles from "./StudentSidebar.module.css";

/** Extrai o RA de "/alunos/258001"; devolve null nas demais rotas. */
function raDaRota(pathname: string | null): string | null {
  const resultado = pathname?.match(/^\/alunos\/(\d+)\/?$/);
  return resultado ? resultado[1] : null;
}

function ConteudoDaSidebar({ pathname }: { pathname: string | null }) {
  const { carregado, alunos } = useApp();
  const raSelecionado = raDaRota(pathname);

  const itensMenu = [
    { href: "/alunos", rotulo: "Lista de alunos", icone: <IconeIdentificacao tamanho={18} /> },
    { href: "/alunos/novo", rotulo: "Cadastrar aluno", icone: <IconeMais tamanho={18} /> },
  ];

  return (
    <>
      <div className={styles.topo}>
        <span className={styles.topoIcone}>
          <IconeAlunos tamanho={20} />
        </span>
        <div>
          <p className={styles.topoTitulo}>Alunos</p>
          <p className={styles.topoTexto}>
            {carregado ? pluralizar(alunos.length, "registro", "registros") : "Carregando…"}
          </p>
        </div>
      </div>

      <nav aria-label="Menu de alunos">
        <ul className={styles.menu}>
          {itensMenu.map((item) => {
            const ativo = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.menuLink} ${ativo ? styles.ativo : ""}`}
                  aria-current={ativo ? "page" : undefined}
                >
                  {item.icone}
                  <span>{item.rotulo}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.secao}>
        <h2 id="sidebar-acesso-rapido" className={styles.secaoTitulo}>
          Acesso rápido
        </h2>
        {carregado ? (
          <nav aria-labelledby="sidebar-acesso-rapido">
            <ul className={styles.alunos}>
              {alunos.map((aluno) => {
                const selecionado = String(aluno.ra) === raSelecionado;
                return (
                  <li key={aluno.ra}>
                    <Link
                      href={`/alunos/${aluno.ra}`}
                      className={`${styles.aluno} ${selecionado ? styles.selecionado : ""}`}
                      aria-current={selecionado ? "page" : undefined}
                    >
                      <span className={styles.avatar} aria-hidden="true">
                        {iniciais(aluno.name)}
                      </span>
                      <span className={styles.alunoTexto}>
                        <span className={styles.alunoNome}>{aluno.name}</span>
                        <span className={`${styles.alunoRa} numero`}>RA {aluno.ra}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : (
          <LoadingState linhas={3} rotulo="Carregando alunos…" />
        )}
      </div>
    </>
  );
}

function SidebarComRotaAtual() {
  const pathname = usePathname();
  return <ConteudoDaSidebar pathname={pathname} />;
}

/**
 * Menu lateral do módulo de alunos (fica no layout de /alunos).
 * Destaca a página atual do menu e o aluno selecionado em /alunos/[ra].
 */
export function StudentSidebar() {
  return (
    <aside className={styles.sidebar} aria-label="Área de alunos">
      <Suspense fallback={<ConteudoDaSidebar pathname={null} />}>
        <SidebarComRotaAtual />
      </Suspense>
    </aside>
  );
}
