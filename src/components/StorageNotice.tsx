"use client";

import { Alert } from "@/components/Feedback";
import { useApp } from "@/hooks/useApp";
import styles from "./StorageNotice.module.css";

/**
 * Aviso global exibido quando o localStorage não pôde ser lido (bloqueado,
 * indisponível ou com dados corrompidos). A aplicação continua funcionando
 * com os registros originais.
 */
export function StorageNotice() {
  const { avisoArmazenamento } = useApp();
  if (!avisoArmazenamento) return null;

  return (
    <div className={styles.faixa}>
      <Alert tipo="alerta" titulo="Atenção: armazenamento local">
        {avisoArmazenamento}
      </Alert>
    </div>
  );
}
