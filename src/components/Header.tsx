import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { Navigation } from "@/components/Navigation";
import styles from "./Header.module.css";

/** Cabeçalho do layout raiz: identificação do sistema + menu principal. */
export function Header() {
  return (
    <header className={styles.cabecalho}>
      <div className={styles.conteudo}>
        <Link href="/" className={styles.marca}>
          <BrandMark />
          <span className={styles.marcaTexto}>
            <span className={styles.nome}>Registro Acadêmico</span>
            <span className={styles.subtitulo}>
              Laboratório de Desenvolvimento Web
            </span>
          </span>
        </Link>
        <Navigation />
      </div>
      <div className={styles.faixa} aria-hidden="true">
        <span data-modulo="alunos" />
        <span data-modulo="disciplinas" />
        <span data-modulo="matriculas" />
      </div>
    </header>
  );
}
