# Registro Acadêmico

Aplicação web para **consultar e cadastrar alunos e matrículas** e **consultar o catálogo de disciplinas** de um curso, desenvolvida com Next.js (App Router), React e TypeScript.

> Atividade 1 — Rotas e navegação no Next.js · Laboratório de Desenvolvimento Web

---

## Objetivo acadêmico

Demonstrar, em uma aplicação funcional, os conceitos da disciplina:

- rotas estáticas e dinâmicas com o **App Router**;
- **layouts** compartilhados e aninhados (layout raiz + layout próprio da área de alunos);
- navegação com destaque da seção ativa e página de **endereço não encontrado**;
- **componentes** reutilizáveis e formulários com validação;
- **estado compartilhado** entre páginas com a **Context API**;
- **persistência no navegador** com `localStorage`, com tratamento de falhas;
- **relacionamento entre coleções** (matrícula → aluno e disciplina).

## Tecnologias

| Tecnologia | Uso no projeto |
| --- | --- |
| [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Cache Components) | Rotas, layouts, renderização no servidor |
| [React 19](https://react.dev/) | Componentes, Context API, `useSyncExternalStore` |
| [TypeScript 5](https://www.typescriptlang.org/) | Tipagem de dados, props e resultados das operações |
| CSS Modules | Estilos isolados por componente e identidade visual por módulo |
| `next/font` | Fontes Public Sans e Source Serif 4 servidas pela própria aplicação |
| [Vitest](https://vitest.dev/) | Testes unitários das regras de negócio |
| [Playwright](https://playwright.dev/) + [axe-core](https://github.com/dequelabs/axe-core) | Testes de ponta a ponta e auditoria de acessibilidade |

Não há banco de dados, API nem autenticação.

## Requisitos para execução

- **Node.js 20.9 ou superior** (desenvolvido com Node.js 24)
- **npm** (instalado junto com o Node.js)
- Acesso à internet na **primeira** execução, para baixar as dependências e as fontes

## Instalação e execução

```bash
# 1. Clonar o repositório
git clone <url-do-repositorio>
cd <pasta-do-repositorio>

# 2. Instalar as dependências
npm install

# 3. Iniciar em modo de desenvolvimento
npm run dev
```

Acesse **<http://localhost:3000>**.

### Outros comandos

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Executa o build de produção |
| `npm run lint` | Análise estática (ESLint) |
| `npm run typecheck` | Verificação de tipos (TypeScript) |
| `npm test` | Testes unitários (Vitest) |
| `npm run test:e2e` | Testes de ponta a ponta (Playwright) contra o build de produção |
| `E2E_DEV=1 npm run test:e2e` | Mesmos testes de ponta a ponta contra `npm run dev` |

> Antes da primeira execução dos testes de ponta a ponta, instale o navegador do Playwright com `npx playwright install chromium`.

## Funcionalidades

### Navegação e layout

- **Página inicial (`/`)**: apresenta o sistema, seu objetivo e os links para os três módulos, com um resumo das quantidades.
- **Layout raiz**: cabeçalho com identificação do sistema, menu principal, conteúdo e rodapé em todas as páginas.
- **Seção ativa destacada** no menu, inclusive em páginas internas (`/alunos/novo`, `/alunos/258001`, `/matriculas/nova`).
- **Página de endereço não encontrado** para qualquer rota inexistente, com link para voltar ao início.
- **Identidade visual por módulo**: azul para alunos (menu lateral e lista), verde para disciplinas (cartões) e laranja para matrículas (tabela).

### Parte 1 — Alunos (azul)

| Rota | Descrição |
| --- | --- |
| `/alunos` | Lista com nome, RA e quantidade de matrículas de cada aluno, total de registros e link para os detalhes |
| `/alunos/[ra]` | Detalhes do aluno obtido pelo RA da URL, com as disciplinas em que está matriculado. RA inexistente ou inválido exibe mensagem e link para a lista |
| `/alunos/novo` | Cadastro com RA e nome completo, validações e link para voltar |

O módulo tem **layout próprio** (`src/app/alunos/layout.tsx`) com menu lateral, que destaca a página atual e o aluno selecionado.

**Validações do cadastro**: campos obrigatórios; RA somente com números, exatamente 6 dígitos e sem zero à esquerda (mesmo formato dos RAs fornecidos); RA não pode se repetir; nome completo com nome e sobrenome.

Não há edição nem exclusão de alunos.

### Parte 2 — Disciplinas (verde)

| Rota | Descrição |
| --- | --- |
| `/disciplinas` | Catálogo com as 39 disciplinas fornecidas, em cartões com ID e nome, e o total calculado a partir da coleção |

As disciplinas são dados fixos: não há formulários, botões nem rotas de cadastro, edição ou exclusão. A página é um Server Component, gerada no servidor.

### Parte 3 — Matrículas (laranja)

| Rota | Descrição |
| --- | --- |
| `/matriculas` | Tabela com RA, nome do aluno e nome da disciplina, total de matrículas e indicadores |
| `/matriculas/nova` | Cadastro com seleção de aluno e de disciplina, botão de cadastro e link para voltar |

- **Relacionamento**: a coleção de matrículas guarda apenas `student_ra` e `course_id`. Os nomes exibidos são obtidos consultando as coleções de alunos e de disciplinas por esses identificadores.
- **Seleção dinâmica**: as opções vêm das coleções da aplicação. Um aluno recém-cadastrado aparece na seleção imediatamente, sem recarregar a página.
- **Sem duplicidade**: o mesmo par RA + ID da disciplina não pode ser cadastrado duas vezes. Um aluno pode ter várias disciplinas e uma disciplina pode ter vários alunos.
- Após um cadastro válido, a aplicação volta para a listagem, destaca a nova matrícula e mostra o total atualizado.

Não há edição, cancelamento nem exclusão de matrículas.

## Estado e persistência local

- Alunos e matrículas são compartilhados entre as páginas por um **contexto React** (`src/context/AppContext.tsx`), acessado pelo hook `useApp()`. As disciplinas permanecem uma coleção fixa, importada diretamente de `src/data/`.
- **No primeiro acesso**, a aplicação usa somente os registros dos arquivos fornecidos.
- **Somente os novos cadastros** são gravados no `localStorage`, na chave `registro-academico:cadastros`. Em seguida são combinados com os registros originais, que assim nunca são alterados nem perdidos.
- O `localStorage` é lido apenas no navegador, por meio de `useSyncExternalStore`. No servidor, as listas aparecem em estado de carregamento, o que evita diferenças entre o HTML do servidor e o do navegador (erros de hidratação).
- Cada cadastro segue a sequência **ler → validar → gravar**: o `localStorage` é relido imediatamente antes de validar e gravar. Assim, um cadastro feito em outra aba nunca é sobrescrito.
- **Cada cadastro só é considerado concluído depois que a gravação é confirmada.** Se o navegador não conseguir salvar (espaço cheio, armazenamento bloqueado), a aplicação mostra o motivo, mantém os dados digitados e não altera nenhuma lista.
- Dados salvos corrompidos ou inválidos são ignorados, com um aviso na tela.
- Abas abertas da aplicação no mesmo navegador são sincronizadas automaticamente.

### Limitações da persistência local

- Os cadastros ficam **apenas no navegador e no perfil** em que foram feitos. Outro navegador, outro computador ou uma janela anônima começam somente com os dados originais.
- Limpar os dados de navegação apaga os cadastros feitos, mas os registros originais continuam disponíveis.
- O `localStorage` tem capacidade limitada (normalmente cerca de 5 MB por site), o que é suficiente para o volume desta atividade.

## Dados fornecidos

Os arquivos recebidos foram copiados **sem nenhuma alteração** para `src/data/`, preservando registros, tipos e nomes das propriedades:

| Arquivo | Tipo | Registros | Propriedades |
| --- | --- | --- | --- |
| `src/data/alunos.tsx` | `Aluno` | 3 | `ra: number`, `name: string` |
| `src/data/disciplinas.ts` | `Disciplina` | 39 | `id: number`, `name: string` |
| `src/data/matriculas.ts` | `Matricula` | 22 | `student_ra: number`, `course_id: number` |

Observações:

- O arquivo de alunos foi fornecido com extensão `.tsx`, embora não contenha JSX. O nome original foi mantido.
- Os tipos usados na aplicação são **reexportados** desses arquivos (`src/types/index.ts`), sem redefinição.
- A aplicação nunca escreve nos arquivos de `src/data/`.

## Estrutura do projeto

```text
src/
├── app/                       # Rotas (App Router)
│   ├── layout.tsx             # Layout raiz: cabeçalho, menu, conteúdo, rodapé, provedor de estado
│   ├── page.tsx               # Página inicial
│   ├── not-found.tsx          # Endereço não encontrado
│   ├── globals.css            # Tokens de design e cores por módulo
│   ├── alunos/
│   │   ├── layout.tsx         # Layout da área de alunos (menu lateral)
│   │   ├── page.tsx           # /alunos
│   │   ├── novo/page.tsx      # /alunos/novo
│   │   └── [ra]/page.tsx      # /alunos/[ra] (rota dinâmica)
│   ├── disciplinas/page.tsx   # /disciplinas
│   └── matriculas/
│       ├── page.tsx           # /matriculas
│       └── nova/page.tsx      # /matriculas/nova
├── components/                # Componentes reutilizáveis (Header, Navigation, StudentSidebar,
│                              # StudentCard, DisciplineCard, EnrollmentTable, FormComponents…)
├── context/AppContext.tsx     # Contexto com alunos, matrículas e operações de cadastro
├── hooks/useApp.ts            # Hook de acesso ao contexto
├── lib/
│   ├── armazenamento.ts       # Leitura, validação e gravação no localStorage
│   ├── lojaCadastros.ts       # Store externa usada com useSyncExternalStore
│   ├── relacionamentos.ts     # Junção matrícula → aluno/disciplina e contagens
│   ├── validacoes.ts          # Regras de validação de alunos e matrículas
│   └── formatacao.ts          # Iniciais, plural e ordenação
├── types/index.ts             # Tipos da aplicação
└── data/                      # Arquivos fornecidos (sem alterações)
tests/
├── unit/                      # Vitest: validações, relacionamentos, persistência
└── e2e/                       # Playwright: navegação, alunos, disciplinas, matrículas, persistência
```

## Qualidade e testes

- **49 testes unitários**: validações, relacionamentos, leitura e gravação no `localStorage`, consistência entre estado e persistência, estado vazio da tabela.
- **65 testes de ponta a ponta** em desktop e celular: navegação, destaque da seção ativa, layouts, cadastros, duplicidades, relacionamento, persistência após recarregar a página, falha de gravação simulada, armazenamento bloqueado, dados corrompidos, sincronização entre abas, ausência de rolagem horizontal e ausência de erros no console.
- **Acessibilidade** verificada com axe-core (WCAG 2.1 níveis A e AA) em todas as páginas: navegação por teclado, link para pular ao conteúdo, rótulos e mensagens de erro associados aos campos (e anunciados por leitores de tela), foco levado à confirmação após cada cadastro, contraste adequado e `aria-current` no menu.
