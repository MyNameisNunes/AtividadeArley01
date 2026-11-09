"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import type { Modulo } from "@/types";
import {
  IconeAlunos,
  IconeDisciplinas,
  IconeInicio,
  IconeMatriculas,
} from "@/components/Icons";
import styles from "./Navigation.module.css";

interface ItemDeMenu {
  href: string;
  rotulo: string;
  modulo: Modulo | null;
  icone: ReactNode;
}

const ITENS: ItemDeMenu[] = [
  { href: "/", rotulo: "Início", modulo: null, icone: <IconeInicio tamanho={18} /> },
  { href: "/alunos", rotulo: "Alunos", modulo: "alunos", icone: <IconeAlunos tamanho={18} /> },
  {
    href: "/disciplinas",
    rotulo: "Disciplinas",
    modulo: "disciplinas",
    icone: <IconeDisciplinas tamanho={18} />,
  },
  {
    href: "/matriculas",
    rotulo: "Matrículas",
    modulo: "matriculas",
    icone: <IconeMatriculas tamanho={18} />,
  },
];

/**
 * Situação de um item do menu para a rota atual:
 * - "pagina": a rota é exatamente a do item (ex.: /alunos);
 * - "secao": a rota é interna à seção (ex.: /alunos/novo, /alunos/258001);
 * - null: não relacionado.
 */
export function situacaoDoItem(
  href: string,
  pathname: string,
): "pagina" | "secao" | null {
  if (pathname === href) return "pagina";
  if (href !== "/" && pathname.startsWith(`${href}/`)) return "secao";
  return null;
}

function ListaDeLinks({ pathname }: { pathname: string | null }) {
  return (
    <ul className={styles.lista}>
      {ITENS.map((item) => {
        const situacao = pathname ? situacaoDoItem(item.href, pathname) : null;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              data-modulo={item.modulo ?? undefined}
              className={`${styles.link} ${situacao ? styles.ativo : ""}`}
              // "page" = página atual; "true" = item atual de um conjunto
              // (estamos numa página interna da seção).
              aria-current={
                situacao === "pagina" ? "page" : situacao === "secao" ? "true" : undefined
              }
            >
              <span className={styles.icone}>{item.icone}</span>
              <span>{item.rotulo}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ListaComRotaAtual() {
  const pathname = usePathname();
  return <ListaDeLinks pathname={pathname} />;
}

/**
 * Menu principal, presente em todas as páginas (está no layout raiz).
 *
 * `usePathname` pode suspender durante a pré-renderização de rotas com
 * parâmetro dinâmico (/alunos/[ra]). O <Suspense> mostra os mesmos links,
 * ainda sem destaque, até a rota atual ser conhecida.
 */
export function Navigation() {
  return (
    <nav aria-label="Navegação principal" className={styles.nav}>
      <Suspense fallback={<ListaDeLinks pathname={null} />}>
        <ListaComRotaAtual />
      </Suspense>
    </nav>
  );
}
