import { defineConfig, devices } from "@playwright/test";

const PORTA = 3100;

/** E2E_DEV=1 executa a suíte contra `next dev` em vez do build de produção. */
const MODO_DEV = process.env.E2E_DEV === "1";

/**
 * Testes de ponta a ponta. Por padrão rodam contra o build de produção
 * (`next build` + `next start`); com E2E_DEV=1, contra o servidor de
 * desenvolvimento (`npm run dev`). Cada teste usa um contexto de navegador
 * novo, portanto com localStorage vazio.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: process.env.CI || MODO_DEV ? 2 : 4,
  timeout: MODO_DEV ? 60_000 : 30_000,
  expect: { timeout: MODO_DEV ? 15_000 : 5_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORTA}`,
    locale: "pt-BR",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "celular",
      use: { ...devices["Pixel 7"] },
      testMatch: /(navegacao|alunos)\.spec\.ts/,
    },
  ],
  webServer: {
    command: MODO_DEV
      ? `npm run dev -- --port ${PORTA}`
      : `npm run build && npm run start -- --port ${PORTA}`,
    url: `http://localhost:${PORTA}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
