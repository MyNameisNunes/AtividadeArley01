"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { Alert } from "@/components/Feedback";
import {
  FormActions,
  FormAside,
  FormLayout,
  FormPanel,
  TextField,
} from "@/components/FormComponents";
import { IconeMais, IconeVoltar } from "@/components/Icons";
import { useApp } from "@/hooks/useApp";
import {
  NOME_TAMANHO_MAXIMO,
  RA_QUANTIDADE_DIGITOS,
  validarNovoAluno,
} from "@/lib/validacoes";
import type { CampoAluno, EntradaAluno, ErrosDeCampo } from "@/types";
import styles from "./StudentForm.module.css";

const VAZIO: EntradaAluno = { ra: "", name: "" };

/** Formulário de /alunos/novo: campos RA e nome completo. */
export function StudentForm() {
  const router = useRouter();
  const { carregado, alunos, cadastrarAluno } = useApp();

  const [valores, setValores] = useState<EntradaAluno>(VAZIO);
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [falha, setFalha] = useState<string | null>(null);
  const [redirecionando, setRedirecionando] = useState(false);

  const refRa = useRef<HTMLInputElement>(null);
  const refNome = useRef<HTMLInputElement>(null);
  const refFalha = useRef<HTMLDivElement>(null);

  // A validação é derivada dos valores atuais (não é guardada em estado) e
  // inclui a verificação de RA duplicado contra a coleção do contexto.
  // Os erros aparecem a partir da primeira tentativa de envio e, depois
  // disso, são atualizados a cada alteração. (Validar no "blur" faria a
  // mensagem surgir no instante do clique, deslocando o botão e perdendo o
  // envio.)
  const validacao = validarNovoAluno(valores, alunos);
  const errosAtuais: ErrosDeCampo<CampoAluno> = validacao.ok ? {} : validacao.erros;
  const erroVisivel = (campo: CampoAluno) =>
    tentouEnviar ? errosAtuais[campo] : undefined;

  // Com Cache Components, o Next.js mantém a página oculta (<Activity>) ao
  // navegar. Esta limpeza roda quando ela é ocultada: evita reencontrar uma
  // mensagem de falha antiga ou o botão travado ao voltar ao formulário.
  useLayoutEffect(() => {
    return () => {
      setFalha(null);
      setRedirecionando(false);
    };
  }, []);

  function alterar(campo: CampoAluno, valor: string) {
    setValores((anteriores) => ({ ...anteriores, [campo]: valor }));
    setFalha(null);
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (redirecionando) return;

    setTentouEnviar(true);
    setFalha(null);

    const resultado = cadastrarAluno(valores);

    if (resultado.ok) {
      // Limpa o formulário antes de sair (a página fica preservada).
      setValores(VAZIO);
      setTentouEnviar(false);
      setRedirecionando(true);
      router.push(`/alunos?cadastrado=${resultado.valor.ra}`);
      return;
    }

    if (resultado.motivo === "validacao") {
      // Leva o foco ao primeiro campo com problema.
      if (resultado.erros?.ra) refRa.current?.focus();
      else refNome.current?.focus();
      return;
    }

    // Falha de persistência (ou dados ainda carregando): nada foi salvo.
    setFalha(resultado.mensagem);
    requestAnimationFrame(() => refFalha.current?.focus());
  }

  return (
    <FormLayout>
      <FormPanel
        titulo="Dados do aluno"
        descricao="O cadastro fica salvo neste navegador."
        onSubmit={enviar}
        aria-describedby={falha ? "falha-cadastro-aluno" : undefined}
      >
        {falha ? (
          <div ref={refFalha} tabIndex={-1} className={styles.falha}>
            <Alert id="falha-cadastro-aluno" tipo="erro" titulo="Não foi possível cadastrar o aluno">
              {falha}
            </Alert>
          </div>
        ) : null}

        <TextField
          ref={refRa}
          id="ra"
          name="ra"
          rotulo="RA"
          obrigatorio
          inputMode="numeric"
          autoComplete="off"
          placeholder="Ex.: 258004"
          value={valores.ra}
          // Espaços são descartados (ex.: RA colado como " 258004 "). Sem
          // maxLength, que cortaria o texto colado antes dessa limpeza.
          onChange={(evento) => alterar("ra", evento.target.value.replace(/\s/g, ""))}
          disabled={!carregado}
          dica={`Somente números, com ${RA_QUANTIDADE_DIGITOS} dígitos. Não pode repetir um RA existente.`}
          erro={erroVisivel("ra")}
        />

        <TextField
          ref={refNome}
          id="name"
          name="name"
          rotulo="Nome completo"
          obrigatorio
          autoComplete="name"
          maxLength={NOME_TAMANHO_MAXIMO + 20}
          placeholder="Ex.: Daniela Ferreira Lima"
          value={valores.name}
          onChange={(evento) => alterar("name", evento.target.value)}
          disabled={!carregado}
          dica="Nome e sobrenome, sem abreviações."
          erro={erroVisivel("name")}
        />

        <FormActions>
          <Button
            type="submit"
            icone={<IconeMais tamanho={18} />}
            disabled={!carregado || redirecionando}
          >
            {redirecionando ? "Cadastrando…" : "Cadastrar aluno"}
          </Button>
          <ButtonLink href="/alunos" variante="secundario" icone={<IconeVoltar tamanho={18} />}>
            Voltar para a lista
          </ButtonLink>
        </FormActions>
      </FormPanel>

      <FormAside id="regras-cadastro-aluno" titulo="Regras do cadastro">
        <ul className={styles.regras}>
          <li>
            <strong>RA</strong> com exatamente {RA_QUANTIDADE_DIGITOS} dígitos, sem
            zero à esquerda, no mesmo formato dos RAs fornecidos (ex.: 258001).
          </li>
          <li>
            <strong>RA único:</strong> não é possível cadastrar dois alunos com o
            mesmo RA.
          </li>
          <li>
            <strong>Nome completo</strong> com nome e sobrenome, até{" "}
            {NOME_TAMANHO_MAXIMO} caracteres.
          </li>
          <li>
            Não há edição nem exclusão de alunos: confira os dados antes de
            cadastrar.
          </li>
        </ul>
      </FormAside>
    </FormLayout>
  );
}
