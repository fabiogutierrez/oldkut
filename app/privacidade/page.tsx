export const metadata = {
  title: 'Política de Privacidade — oldkut',
};

export default function PrivacidadePage() {
  return (
    <div className="oldkut-box">
      <div className="oldkut-box-title">Política de Privacidade</div>
      <div className="oldkut-box-body oldkut-legal">
        <p>
          Esta política explica quais dados o oldkut coleta e como eles são usados. Ao criar uma conta, você concorda com
          o que está descrito aqui.
        </p>

        <h2>Quais dados coletamos</h2>
        <p>Ao criar uma conta e um perfil, coletamos:</p>
        <ul>
          <li>E-mail e senha (ou dados básicos da sua conta Google, se você entrar por esse método)</li>
          <li>Data de nascimento — usada só pra confirmar que você tem 18 anos ou mais, não é exibida publicamente</li>
          <li>Nome, nome de usuário, foto (URL), cidade, país e bio — informações que você escolhe preencher no perfil</li>
          <li>Conteúdo que você publica: recados, depoimentos e pedidos de amizade</li>
        </ul>

        <h2>Como usamos esses dados</h2>
        <p>
          Os dados servem exclusivamente para o funcionamento do site: autenticação, exibição do seu perfil pra outras
          pessoas e as funcionalidades de recados, depoimentos e amigos. Não vendemos nem compartilhamos seus dados com
          terceiros para fins de publicidade.
        </p>

        <h2>Cookies</h2>
        <p>Usamos cookies apenas para manter sua sessão logada. Não usamos cookies de rastreamento ou publicidade.</p>

        <h2>Seus direitos</h2>
        <p>
          Você pode editar ou excluir as informações do seu perfil a qualquer momento. Pra excluir sua conta por
          completo, entre em contato pelo e-mail abaixo.
        </p>

        <h2>Contato</h2>
        <p>Dúvidas sobre privacidade: contato@oldkut.com</p>
      </div>
    </div>
  );
}
