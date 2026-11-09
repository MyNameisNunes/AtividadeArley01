import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/Button";
import { IconeBussola, IconeInicio } from "@/components/Icons";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Endereço não encontrado",
};

/**
 * Página exibida para qualquer rota que não existe na aplicação.
 * É renderizada dentro do layout raiz, então o menu continua disponível.
 */
export default function NotFound() {
  return (
    <div className={styles.pagina}>
      <section className={styles.cartao}>
        <span className={styles.icone}>
          <IconeBussola tamanho={28} />
        </span>
        <p className={`${styles.codigo} numero`}>Erro 404</p>
        <h1 className={styles.titulo}>
          Endereço não encontrado
        </h1>
        <p className={styles.texto}>
          A página que você tentou acessar não existe nesta aplicação. Verifique
          se o endereço foi digitado corretamente ou volte para o início para
          continuar navegando.
        </p>
        <ButtonLink href="/" icone={<IconeInicio tamanho={18} />}>
          Voltar ao início
        </ButtonLink>
        <nav aria-label="Áreas do sistema" className={styles.atalhos}>
          <span>Ou acesse:</span>
          <Link href="/alunos">Alunos</Link>
          <Link href="/disciplinas">Disciplinas</Link>
          <Link href="/matriculas">Matrículas</Link>
        </nav>
      </section>
    </div>
  );
}
