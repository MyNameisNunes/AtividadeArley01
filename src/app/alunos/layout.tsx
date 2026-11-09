import { ModuleArea } from "@/components/PageHeader";
import { StudentSidebar } from "@/components/StudentSidebar";
import styles from "./layout.module.css";

/**
 * Layout próprio da área de alunos, compartilhado por /alunos,
 * /alunos/novo e /alunos/[ra]: identidade azul + menu lateral.
 *
 * Ele fica DENTRO do layout raiz (cabeçalho e rodapé continuam visíveis) e
 * não é desmontado ao navegar entre as páginas de alunos.
 */
export default function AlunosLayout({ children }: LayoutProps<"/alunos">) {
  return (
    <ModuleArea modulo="alunos">
      <div className={styles.grade}>
        <StudentSidebar />
        <div className={styles.conteudo}>{children}</div>
      </div>
    </ModuleArea>
  );
}
