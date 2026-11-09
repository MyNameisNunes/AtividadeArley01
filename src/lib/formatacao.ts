/** Iniciais para o avatar: primeira letra do primeiro e do último nome. */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return `${primeira}${ultima}`.toLocaleUpperCase("pt-BR");
}

/** "1 aluno", "4 alunos". */
export function pluralizar(
  quantidade: number,
  singular: string,
  plural: string,
): string {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}

/** Comparação alfabética respeitando acentos do português. */
export function compararNomes(a: string, b: string): number {
  return a.localeCompare(b, "pt-BR", { sensitivity: "base" });
}
