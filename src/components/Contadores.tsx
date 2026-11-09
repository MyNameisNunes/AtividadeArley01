"use client";

import { Contador } from "@/components/PageHeader";
import { useApp } from "@/hooks/useApp";

/**
 * Quantidades calculadas a partir das coleções do contexto. Ficam em
 * componentes cliente porque dependem dos cadastros do navegador.
 */
export function ContadorAlunos() {
  const { carregado, alunos } = useApp();
  return (
    <Contador
      valor={carregado ? alunos.length : null}
      rotulo={carregado && alunos.length === 1 ? "aluno cadastrado" : "alunos cadastrados"}
    />
  );
}

export function ContadorMatriculas() {
  const { carregado, matriculas } = useApp();
  return (
    <Contador
      valor={carregado ? matriculas.length : null}
      rotulo={
        carregado && matriculas.length === 1
          ? "matrícula cadastrada"
          : "matrículas cadastradas"
      }
    />
  );
}
