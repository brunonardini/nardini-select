import Link from 'next/link';

import { PRIVACY_NOTICE_VERSION, legalVersionDate } from '@/lib/legal/versions';

export default function PrivacyPage() {
  return (
    <article className="admin-panel admin-legal">
      <h1>Aviso de privacidade</h1>
      <p>
        Versão {PRIVACY_NOTICE_VERSION}, de{' '}
        {legalVersionDate(PRIVACY_NOTICE_VERSION)}.
      </p>
      <p>
        Este aviso descreve os dados pessoais da área interna da Nardini Select,
        loja em Resende, RJ. A loja é a controladora. O tratamento segue a Lei
        Geral de Proteção de Dados (Lei 13.709/2018). Os{' '}
        <a href="/admin/termos">termos de uso</a> dizem quem pode entrar e o que
        a área faz.
      </p>

      <h2>Quais dados, para quê e por quanto tempo</h2>
      <ul>
        <li>
          Nome completo, nome de exibição e e-mail identificam quem acessa e
          quem agiu. A base é a execução destes termos. Ficam até a
          anonimização.
        </li>
        <li>
          O identificador da conta Google serve para o acesso. A base é a mesma.
          Fica até a anonimização. A foto, quando existe, aparece no perfil até
          ser trocada ou até a anonimização.
        </li>
        <li>
          A sessão guarda um identificador e as datas de criação e de expiração.
          A base é a execução destes termos. Ela dura 12 horas sem uso e no
          máximo 7 dias. Sair, desabilitar, excluir ou anonimizar apaga as
          sessões na hora.
        </li>
        <li>
          As datas de convite, cadastro, último acesso, desabilitação e
          anonimização servem para administrar o acesso. Ficam até a
          anonimização.
        </li>
        <li>
          A versão e a data do aceite destes termos e deste aviso comprovam o
          aceite. A base é a execução dos termos e o cumprimento de obrigação
          legal. Ficam até a anonimização.
        </li>
        <li>
          O convite guarda o nome completo escrito pelo administrador, para a
          pessoa entrar. A base é a etapa preliminar dos termos e o interesse
          legítimo de controlar quem recebe acesso. O convite é apagado 7 dias
          depois de criado, tenha sido usado, cancelado ou apenas expirado.
        </li>
        <li>
          A auditoria guarda o identificador de quem agiu, a ação, a entidade e
          rótulos de negócio, como o nome de um papel. Não guarda texto livre
          sobre pessoas. A base é o interesse legítimo de segurança e de
          prevenção a fraude, e o exercício de direitos. Cada registro dura 6
          meses. A exclusão roda segunda e sexta, então um registro pode ficar
          no máximo 6 meses e 4 dias.
        </li>
        <li>
          Relatórios de erro levam só o identificador interno da conta, depois
          da limpeza de cookies, convites e parâmetros de acesso. A base é o
          interesse legítimo de corrigir falhas. O prazo é o do plano da Sentry.
        </li>
      </ul>

      <h2>Quem administra as contas</h2>
      <p>
        Administradores veem, na lista da equipe, nome, e-mail, papel, estado do
        cadastro e último acesso. É a administração das contas, com os mesmos
        dados e a mesma finalidade. A busca não fica gravada. Neste aparelho, o
        navegador guarda apenas quantas pessoas aparecem por página e se o menu
        lateral está recolhido.
      </p>

      <h2>Onde os dados ficam</h2>
      <p>
        Os dados são transferidos para os Estados Unidos. A Neon guarda o banco.
        A Netlify executa a aplicação. O Google faz o acesso e, quando há foto,
        a hospeda. A Sentry recebe os relatórios de erro. Não vendemos esses
        dados e não os usamos para publicidade.
      </p>

      <h2>Anonimização</h2>
      <p>
        Um administrador pode anonimizar um cadastro já desabilitado. A ação é
        irreversível, pede que se digite o nome completo e apaga nome, e-mail,
        foto, vínculo com o Google e sessões. O identificador interno permanece,
        e a auditoria também. Nela, a pessoa passa a aparecer como Usuário
        removido. Quem já consta como autor na auditoria não é excluído; a
        anonimização é o meio de apagar os dados pessoais.
      </p>

      <h2>Cookies</h2>
      <p>
        O cookie de sessão é seguro, inacessível a scripts da página e vale só
        para este site. O cookie do convite dura 30 minutos e leva o convite e
        as versões aceitas, para concluir a entrada com o Google. Não há cookie
        de publicidade.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode pedir confirmação, acesso, correção e eliminação dos seus
        dados. O pedido segue pelo <Link href="/#contato">contato da loja</Link>
        . Uma versão nova deste aviso ou dos termos pede um novo aceite antes de
        qualquer outra ação.
      </p>
      <p className="admin-links">
        <a href="/admin/termos">Termos de uso</a>
        {' · '}
        <a href="/admin">Ir para a área interna</a>
      </p>
    </article>
  );
}
