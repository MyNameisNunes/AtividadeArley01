import type { ReactNode } from "react";
import Link from "next/link";
import type { Modulo } from "@/types";
import { ButtonLink } from "@/components/Button";
import { HomeSummary } from "@/components/HomeSummary";
import {
  IconeAlunos,
  IconeArmazenamento,
  IconeCodigo,
  IconeDisciplinas,
  IconeMatriculas,
  IconeSeta,
} from "@/components/Icons";
import styles from "./page.module.css";

interface CartaoModulo {
  modulo: Modulo;
  titulo: string;
  descricao: string;
  organizacao: string;
  icone: ReactNode;
  links: { href: string; rotulo: string }[];
}

const MODULOS: CartaoModulo[] = [
  {
    modulo: "alunos",
    titulo: "Alunos",
    descricao:
      "Consulte os alunos cadastrados, veja os detalhes de cada um pelo RA e cadastre novos alunos.",
    organizacao: "Menu lateral e lista",
    icone: <IconeAlunos tamanho={24} />,
    links: [
      { href: "/alunos", rotulo: "Consultar alunos" },
      { href: "/alunos/novo", rotulo: "Cadastrar aluno" },
    ],
  },
  {
    modulo: "disciplinas",
    titulo: "Disciplinas",
    descricao:
      "Consulte o catálogo fixo com as disciplinas do curso, identificadas por ID e nome.",
    organizacao: "Catálogo em cartões",
    icone: <IconeDisciplinas tamanho={24} />,
    links: [{ href: "/disciplinas", rotulo: "Consultar catálogo" }],
  },
  {
    modulo: "matriculas",
    titulo: "Matrículas",
    descricao:
      "Consulte os vínculos entre alunos e disciplinas e registre novas matrículas sem duplicidade.",
    organizacao: "Tabela de vínculos",
    icone: <IconeMatriculas tamanho={24} />,
    links: [
      { href: "/matriculas", rotulo: "Consultar matrículas" },
      { href: "/matriculas/nova", rotulo: "Nova matrícula" },
    ],
  },
];

const ETAPAS = [
  {
    icone: <IconeCodigo tamanho={20} />,
    titulo: "Dados fornecidos",
    texto:
      "Os registros iniciais de alunos, disciplinas e matrículas vêm dos arquivos de src/data, sem nenhuma alteração.",
  },
  {
    icone: <IconeAlunos tamanho={20} />,
    titulo: "Estado compartilhado",
    texto:
      "Alunos e matrículas ficam em um contexto React. Um aluno recém-cadastrado aparece na hora em todas as páginas.",
  },
  {
    icone: <IconeArmazenamento tamanho={20} />,
    titulo: "Persistência local",
    texto:
      "Cada cadastro é gravado no localStorage e só é exibido como concluído depois que a gravação é confirmada.",
  },
];

export default function HomePage() {
  return (
    <div className={styles.pagina}>
      <section className={styles.hero} aria-labelledby="titulo-sistema">
        <div className={styles.heroTexto}>
          <p className={styles.sobretitulo}>
            Atividade 1 · Rotas e navegação no Next.js
          </p>
          <h1 id="titulo-sistema" className={styles.titulo}>
            Registro Acadêmico
          </h1>
          <p className={styles.lead}>
            Sistema para <strong>consultar e cadastrar alunos e matrículas</strong>{" "}
            e <strong>consultar o catálogo de disciplinas</strong> de um curso.
            Os nomes exibidos nas matrículas são obtidos pelo relacionamento
            entre as coleções, a partir do RA do aluno e do ID da disciplina.
          </p>
          <div className={styles.acoes}>
            <ButtonLink href="/alunos" icone={<IconeAlunos tamanho={18} />}>
              Consultar alunos
            </ButtonLink>
            <ButtonLink
              href="/matriculas/nova"
              variante="secundario"
              icone={<IconeMatriculas tamanho={18} />}
            >
              Registrar matrícula
            </ButtonLink>
          </div>
        </div>
        <HomeSummary />
      </section>

      <section className={styles.secao} aria-labelledby="titulo-modulos">
        <div className={styles.secaoTopo}>
          <h2 id="titulo-modulos" className={styles.secaoTitulo}>
            Módulos do sistema
          </h2>
          <p className={styles.secaoTexto}>
            Cada área tem cor e organização próprias para facilitar a orientação.
          </p>
        </div>
        <ul className={styles.modulos}>
          {MODULOS.map((item) => (
            <li key={item.modulo} data-modulo={item.modulo} className={styles.modulo}>
              <div className={styles.moduloTopo}>
                <span className={styles.moduloIcone}>{item.icone}</span>
                <span className={styles.moduloEtiqueta}>{item.organizacao}</span>
              </div>
              <h3 className={styles.moduloTitulo}>{item.titulo}</h3>
              <p className={styles.moduloTexto}>{item.descricao}</p>
              <ul className={styles.moduloLinks}>
                {item.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      {link.rotulo}
                      <IconeSeta tamanho={16} />
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.secao} aria-labelledby="titulo-dados">
        <div className={styles.secaoTopo}>
          <h2 id="titulo-dados" className={styles.secaoTitulo}>
            Como os dados funcionam
          </h2>
          <p className={styles.secaoTexto}>
            Sem banco de dados, sem API e sem autenticação.
          </p>
        </div>
        <ol className={styles.etapas}>
          {ETAPAS.map((etapa) => (
            <li key={etapa.titulo} className={styles.etapa}>
              <span className={styles.etapaIcone}>{etapa.icone}</span>
              <h3 className={styles.etapaTitulo}>{etapa.titulo}</h3>
              <p className={styles.etapaTexto}>{etapa.texto}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
