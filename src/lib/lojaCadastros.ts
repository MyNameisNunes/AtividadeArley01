import { alunos as alunosIniciais } from "@/data/alunos";
import { disciplinas } from "@/data/disciplinas";
import { matriculas as matriculasIniciais } from "@/data/matriculas";
import type { CadastrosLocais } from "@/types";
import {
  CHAVE_ARMAZENAMENTO,
  carregarCadastros,
  salvarCadastros,
  type LeituraCadastros,
} from "@/lib/armazenamento";

/**
 * "Loja" (store) externa ao React que representa o localStorage.
 *
 * Ela expõe as três funções exigidas pelo hook `useSyncExternalStore`:
 * - `assinarLoja`: registra quem precisa ser avisado quando os dados mudam;
 * - `lerLoja`: devolve o estado atual (no navegador);
 * - `lerLojaNoServidor`: devolve o estado usado no servidor e na hidratação.
 *
 * O localStorage só é lido dentro de `lerLoja`, que o React chama apenas no
 * navegador. No servidor (SSR/pré-renderização) usa-se `lerLojaNoServidor`,
 * que devolve `null` = "dados ainda não carregados".
 */

const BASE = {
  alunos: alunosIniciais,
  disciplinas,
  matriculas: matriculasIniciais,
};

/** Estado em memória. `null` significa "ainda não lido do navegador". */
let estadoAtual: LeituraCadastros | null = null;
const ouvintes = new Set<() => void>();

function notificarOuvintes(): void {
  for (const ouvinte of ouvintes) ouvinte();
}

/** Outra aba alterou o localStorage: descarta o cache e relê. */
function aoAlterarEmOutraAba(evento: StorageEvent): void {
  if (evento.key === null || evento.key === CHAVE_ARMAZENAMENTO) {
    estadoAtual = null;
    notificarOuvintes();
  }
}

/**
 * A página voltou do cache de "voltar/avançar" do navegador: eventos de
 * outras abas podem ter sido perdidos enquanto ela estava congelada.
 */
function aoRestaurarDoCache(evento: PageTransitionEvent): void {
  if (evento.persisted) {
    estadoAtual = null;
    notificarOuvintes();
  }
}

export function assinarLoja(ouvinte: () => void): () => void {
  if (ouvintes.size === 0) {
    window.addEventListener("storage", aoAlterarEmOutraAba);
    window.addEventListener("pageshow", aoRestaurarDoCache);
  }
  ouvintes.add(ouvinte);

  return () => {
    ouvintes.delete(ouvinte);
    if (ouvintes.size === 0) {
      window.removeEventListener("storage", aoAlterarEmOutraAba);
      window.removeEventListener("pageshow", aoRestaurarDoCache);
    }
  };
}

/**
 * Lê o estado no navegador. O resultado fica em cache: o React exige que a
 * mesma referência seja devolvida enquanto os dados não mudarem.
 */
export function lerLoja(): LeituraCadastros {
  if (estadoAtual === null) {
    estadoAtual = carregarCadastros(BASE);
  }
  return estadoAtual;
}

/** Estado usado no servidor e durante a hidratação: ainda sem dados locais. */
export function lerLojaNoServidor(): null {
  return null;
}

/**
 * Relê o localStorage AGORA (ignorando o cache) e devolve os cadastros
 * salvos. É o primeiro passo de toda gravação — ler → validar → gravar —
 * para que um cadastro feito em outra aba nunca seja sobrescrito por uma
 * cópia desatualizada desta aba. Se o conteúdo salvo mudou, atualiza o
 * estado e avisa o React.
 */
export function sincronizarLoja(): CadastrosLocais {
  const leitura = carregarCadastros(BASE);
  const mudou =
    estadoAtual === null || JSON.stringify(leitura) !== JSON.stringify(estadoAtual);
  if (mudou) {
    estadoAtual = leitura;
    notificarOuvintes();
  }
  return leitura.cadastros;
}

/**
 * Persiste os cadastros e, SOMENTE se a gravação for confirmada, atualiza o
 * estado em memória e avisa o React.
 *
 * Se `salvarCadastros` lançar erro, a função é interrompida antes de mudar o
 * estado: a interface continua mostrando exatamente o que está salvo.
 */
export function gravarNaLoja(proximos: CadastrosLocais): void {
  salvarCadastros(proximos);
  estadoAtual = { cadastros: proximos, aviso: null };
  notificarOuvintes();
}
