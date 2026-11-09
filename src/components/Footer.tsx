import { BrandMark } from "@/components/BrandMark";
import { IconeArmazenamento } from "@/components/Icons";
import styles from "./Footer.module.css";

/** Rodapé do layout raiz. */
export function Footer() {
  return (
    <footer className={styles.rodape}>
      <div className={styles.conteudo}>
        <div className={styles.identificacao}>
          <BrandMark tamanho={28} />
          <div>
            <p className={styles.nome}>Registro Acadêmico</p>
            <p className={styles.texto}>
              Atividade 1 — Rotas e navegação no Next.js · Laboratório de
              Desenvolvimento Web
            </p>
          </div>
        </div>
        <p className={styles.nota}>
          <IconeArmazenamento tamanho={18} />
          <span>
            Os dados iniciais vêm dos arquivos fornecidos. Novos cadastros ficam
            salvos somente neste navegador (localStorage).
          </span>
        </p>
      </div>
    </footer>
  );
}
