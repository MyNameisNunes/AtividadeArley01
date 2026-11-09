"use client";

import { useContext } from "react";
import { AppContext, type AppContextValue } from "@/context/AppContext";

/**
 * Acesso ao estado compartilhado (alunos, matrículas e operações de cadastro).
 *
 * Lança erro se for usado fora do <AppProvider>, o que denuncia cedo um erro
 * de montagem da árvore de componentes.
 */
export function useApp(): AppContextValue {
  const contexto = useContext(AppContext);
  if (!contexto) {
    throw new Error("useApp deve ser usado dentro de <AppProvider>.");
  }
  return contexto;
}
