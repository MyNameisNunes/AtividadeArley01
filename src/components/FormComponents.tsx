import type { ComponentProps, ReactNode } from "react";
import { IconeErro } from "@/components/Icons";
import styles from "./FormComponents.module.css";

interface PropsDeCampo {
  id: string;
  rotulo: string;
  dica?: ReactNode;
  erro?: string;
  obrigatorio?: boolean;
}

/**
 * Liga o campo ao texto de ajuda e à mensagem de erro via aria-describedby,
 * para que leitores de tela anunciem ambos ao focar o campo.
 */
function idsDescricao(id: string, dica?: ReactNode, erro?: string) {
  const idDica = dica ? `${id}-dica` : undefined;
  const idErro = erro ? `${id}-erro` : undefined;
  return {
    idDica,
    idErro,
    describedBy: [idErro, idDica].filter(Boolean).join(" ") || undefined,
  };
}

function Rotulo({ id, rotulo, obrigatorio }: PropsDeCampo) {
  return (
    <label htmlFor={id} className={styles.rotulo}>
      {rotulo}
      {obrigatorio ? (
        <span className={styles.obrigatorio} aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}

function Mensagens({
  dica,
  erro,
  idDica,
  idErro,
}: {
  dica?: ReactNode;
  erro?: string;
  idDica?: string;
  idErro?: string;
}) {
  return (
    <>
      {/* Região "viva" sempre presente: um erro que surge enquanto o usuário
          digita ou seleciona é anunciado pelo leitor de tela. */}
      <div aria-live="polite">
        {erro ? (
          <p id={idErro} className={styles.erro}>
            <IconeErro tamanho={16} />
            <span>{erro}</span>
          </p>
        ) : null}
      </div>
      {dica ? (
        <p id={idDica} className={styles.dica}>
          {dica}
        </p>
      ) : null}
    </>
  );
}

/** Campo de texto com rótulo, ajuda e mensagem de validação. */
export function TextField({
  id,
  rotulo,
  dica,
  erro,
  obrigatorio,
  className,
  ...input
}: PropsDeCampo & Omit<ComponentProps<"input">, "id">) {
  const { idDica, idErro, describedBy } = idsDescricao(id, dica, erro);
  return (
    <div className={styles.campo}>
      <Rotulo id={id} rotulo={rotulo} obrigatorio={obrigatorio} />
      <input
        id={id}
        className={[styles.controle, className].filter(Boolean).join(" ")}
        aria-invalid={erro ? true : undefined}
        aria-describedby={describedBy}
        aria-required={obrigatorio || undefined}
        {...input}
      />
      <Mensagens dica={dica} erro={erro} idDica={idDica} idErro={idErro} />
    </div>
  );
}

/** Campo de seleção com rótulo, ajuda e mensagem de validação. */
export function SelectField({
  id,
  rotulo,
  dica,
  erro,
  obrigatorio,
  className,
  children,
  ...select
}: PropsDeCampo & Omit<ComponentProps<"select">, "id">) {
  const { idDica, idErro, describedBy } = idsDescricao(id, dica, erro);
  return (
    <div className={styles.campo}>
      <Rotulo id={id} rotulo={rotulo} obrigatorio={obrigatorio} />
      <div className={styles.selecao}>
        <select
          id={id}
          className={[styles.controle, className].filter(Boolean).join(" ")}
          aria-invalid={erro ? true : undefined}
          aria-describedby={describedBy}
          aria-required={obrigatorio || undefined}
          {...select}
        >
          {children}
        </select>
      </div>
      <Mensagens dica={dica} erro={erro} idDica={idDica} idErro={idErro} />
    </div>
  );
}

/** Cartão que envolve um formulário, com título e nota de obrigatoriedade. */
export function FormPanel({
  titulo,
  descricao,
  children,
  ...form
}: { titulo: string; descricao?: ReactNode } & ComponentProps<"form">) {
  return (
    <form className={styles.painel} noValidate {...form}>
      <div className={styles.painelTopo}>
        <h2 className={styles.painelTitulo}>{titulo}</h2>
        {descricao ? <p className={styles.painelDescricao}>{descricao}</p> : null}
        <p className={styles.notaObrigatorio}>
          <span aria-hidden="true">*</span> Campos obrigatórios
        </p>
      </div>
      {children}
    </form>
  );
}

/** Linha de botões ao final do formulário. */
export function FormActions({ children }: { children: ReactNode }) {
  return <div className={styles.acoes}>{children}</div>;
}

/** Painel lateral com informações de apoio ao formulário. */
export function FormAside({
  id,
  titulo,
  children,
}: {
  id: string;
  titulo: string;
  children: ReactNode;
}) {
  const idTitulo = `${id}-titulo`;
  return (
    <aside id={id} className={styles.apoio} aria-labelledby={idTitulo}>
      <h2 id={idTitulo} className={styles.apoioTitulo}>
        {titulo}
      </h2>
      {children}
    </aside>
  );
}

/** Disposição em duas colunas: formulário + painel de apoio. */
export function FormLayout({ children }: { children: ReactNode }) {
  return <div className={styles.disposicao}>{children}</div>;
}
