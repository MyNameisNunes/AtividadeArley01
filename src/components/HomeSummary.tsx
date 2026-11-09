"use client";

import Link from "next/link";
import { disciplinas } from "@/data/disciplinas";
import { useApp } from "@/hooks/useApp";
import type { Modulo } from "@/types";
import styles from "./HomeSummary.module.css";

interface LinhaResumo {
  modulo: Modulo;
  rotulo: string;
  href: string;
  valor: number | null;
  detalhe: string;
}

/** Ficha-resumo da página inicial com as quantidades de cada coleção. */
export function HomeSummary() {
  const { carregado, alunos, matriculas } = useApp();

  const linhas: LinhaResumo[] = [
    {
      modulo: "alunos",
      rotulo: "Alunos",
      href: "/alunos",
      valor: carregado ? alunos.length : null,
      detalhe: "consulta e cadastro",
    },
    {
      modulo: "disciplinas",
      rotulo: "Disciplinas",
      href: "/disciplinas",
      valor: disciplinas.length,
      detalhe: "catálogo fixo",
    },
    {
      modulo: "matriculas",
      rotulo: "Matrículas",
      href: "/matriculas",
      valor: carregado ? matriculas.length : null,
      detalhe: "consulta e cadastro",
    },
  ];

  return (
    <aside className={styles.ficha} aria-labelledby="resumo-titulo">
      <div className={styles.topo}>
        <h2 id="resumo-titulo" className={styles.titulo}>
          Ficha de registros
        </h2>
        <span className={styles.selo}>ao vivo</span>
      </div>
      <ul className={styles.linhas}>
        {linhas.map((linha) => (
          <li key={linha.modulo} data-modulo={linha.modulo}>
            <Link href={linha.href} className={styles.linha}>
              <span className={styles.marcador} aria-hidden="true" />
              <span className={styles.rotulo}>
                {linha.rotulo}
                <small>{linha.detalhe}</small>
              </span>
              <span className={`${styles.valor} numero`} aria-busy={linha.valor === null}>
                {linha.valor ?? "—"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className={styles.rodape}>
        Quantidades calculadas a partir das coleções da aplicação.
      </p>
    </aside>
  );
}
