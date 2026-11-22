import { TERMS_VERSION, legalVersionDate } from '@/lib/legal/versions';

export default function TermsPage() {
  return (
    <article className="admin-panel admin-legal">
      <h1>Termos de uso</h1>
      <p>
        Versão {TERMS_VERSION}, de {legalVersionDate(TERMS_VERSION)}.
      </p>
      <p>
        Estes termos regulam a área interna da Nardini Select, loja em Resende,
        RJ. A área é o espaço de quem a loja autoriza a operar o cadastro. Ela
        não é a loja online e não atende clientes.
      </p>

      <h2>Quem pode entrar</h2>
      <p>
        Só entra quem recebe um convite de um administrador ou, enquanto não
        existe nenhuma conta, a conta Google indicada para o primeiro
        administrador. O convite vale para uma pessoa, uma única vez, por 30
        minutos. O nome completo é o que o administrador escreveu no convite.
      </p>

      <h2>Conta Google</h2>
      <p>
        O acesso usa somente a conta Google. A Nardini Select não cria senha
        para esta área. O botão de entrada só funciona depois que você marca que
        leu e aceita estes termos. O{' '}
        <a href="/admin/privacidade" target="_blank" rel="noopener noreferrer">
          aviso de privacidade
          <span className="sr-only"> em uma nova aba</span>
        </a>{' '}
        faz parte desse aceite.
      </p>

      <h2>O que a área faz</h2>
      <p>
        A área identifica quem está operando, guarda o papel de cada pessoa e
        registra as mudanças administrativas. Ter um papel significa que o
        cadastro foi aprovado. Sem papel, você vê apenas que o cadastro está em
        aprovação.
      </p>

      <h2>Sua conta</h2>
      <ul>
        <li>Use a sua própria conta. Não compartilhe convite nem sessão.</li>
        <li>
          Sair encerra todas as sessões dessa conta, em todos os aparelhos.
        </li>
        <li>Uma conta desabilitada ou anonimizada não entra de novo.</li>
        <li>
          Você pode ajustar o nome de exibição e a foto. O nome completo e o
          e-mail só mudam por um administrador, ou são apagados na anonimização.
        </li>
      </ul>

      <h2>Administradores</h2>
      <p>
        Administradores convidam pessoas, criam e renomeiam papéis, atribuem
        papéis, desabilitam acessos e podem anonimizar um cadastro já
        desabilitado. A anonimização é irreversível: pede a digitação do nome
        completo e apaga os dados pessoais, mantendo o registro do que foi
        feito. O sistema sempre conserva pelo menos um administrador ativo.
        Ninguém desabilita, anonimiza, exclui ou troca o papel da própria conta.
      </p>

      <h2>Aceite e versão</h2>
      <p>
        Guardamos a versão destes termos, a versão do aviso de privacidade e o
        momento do aceite. Se uma versão mudar, a área pede um novo aceite antes
        de qualquer outra ação.
      </p>

      <h2>Dados pessoais</h2>
      <p>
        O tratamento dos dados pessoais, os prazos e a transferência para os
        Estados Unidos estão no{' '}
        <a href="/admin/privacidade" target="_blank" rel="noopener noreferrer">
          aviso de privacidade
          <span className="sr-only"> em uma nova aba</span>
        </a>
        .
      </p>
      <p className="admin-links">
        <a href="/admin">Ir para a área interna</a>
      </p>
    </article>
  );
}
