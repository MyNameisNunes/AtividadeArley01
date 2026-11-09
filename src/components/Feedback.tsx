import type { ReactNode } from "react";
import {
  IconeAlerta,
  IconeErro,
  IconeInfo,
  IconeSucesso,
} from "@/components/Icons";
import styles from "./Feedback.module.css";

type TipoAlerta = "sucesso" | "erro" | "alerta" | "info";

const ICONES: Record<TipoAlerta, ReactNode> = {
  sucesso: <IconeSucesso tamanho={22} />,
  erro: <IconeErro tamanho={22} />,
  alerta: <IconeAlerta tamanho={22} />,
  info: <IconeInfo tamanho={22} />,
};

const CLASSES: Record<TipoAlerta, string> = {
  sucesso: styles.sucesso,
  erro: styles.erro,
  alerta: styles.aviso,
  info: styles.info,
};

/**
 * Mensagem de retorno para o usuário.
 * Erros usam role="alert" (anúncio imediato por leitores de tela); os demais
 * tipos usam role="status" (anúncio educado, sem interromper).
 */
export function Alert({
  tipo,
  titulo,
  children,
  acoes,
  id,
}: {
  tipo: TipoAlerta;
  titulo: string;
  children?: ReactNode;
  acoes?: ReactNode;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`${styles.alerta} ${CLASSES[tipo]}`}
      role={tipo === "erro" ? "alert" : "status"}
    >
      <span className={styles.alertaIcone}>{ICONES[tipo]}</span>
      <div className={styles.alertaCorpo}>
        <p className={styles.alertaTitulo}>{titulo}</p>
        {children ? <div className={styles.alertaTexto}>{children}</div> : null}
        {acoes ? <div className={styles.alertaAcoes}>{acoes}</div> : null}
      </div>
    </div>
  );
}

/** Estado vazio ou de "não encontrado", com ícone, explicação e ações. */
export function EmptyState({
  icone,
  titulo,
  children,
  acoes,
  tituloComo: Titulo = "h2",
}: {
  icone: ReactNode;
  titulo: string;
  children?: ReactNode;
  acoes?: ReactNode;
  tituloComo?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={styles.vazio}>
      <span className={styles.vazioIcone}>{icone}</span>
      <Titulo className={styles.vazioTitulo}>{titulo}</Titulo>
      {children ? <div className={styles.vazioTexto}>{children}</div> : null}
      {acoes ? <div className={styles.vazioAcoes}>{acoes}</div> : null}
    </div>
  );
}

/**
 * Esqueleto exibido enquanto os dados do navegador não foram carregados
 * (no HTML do servidor e no instante da hidratação).
 */
export function LoadingState({
  linhas = 3,
  rotulo = "Carregando dados…",
}: {
  linhas?: number;
  rotulo?: string;
}) {
  return (
    <div className={styles.carregando} role="status" aria-live="polite">
      <span className="visualmente-oculto">{rotulo}</span>
      {Array.from({ length: linhas }, (_, indice) => (
        <span key={indice} className={styles.esqueleto} aria-hidden="true" />
      ))}
    </div>
  );
}
