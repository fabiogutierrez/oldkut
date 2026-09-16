import type { Locale } from './translations';

interface LegalSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

interface LegalPage {
  title: string;
  intro: string;
  sections: LegalSection[];
}

export const PRIVACY_CONTENT: Record<Locale, LegalPage> = {
  pt: {
    title: 'Política de Privacidade',
    intro:
      'Esta política explica quais dados o oldkut coleta e como eles são usados. Ao criar uma conta, você concorda com o que está descrito aqui.',
    sections: [
      {
        heading: 'Quais dados coletamos',
        paragraphs: ['Ao criar uma conta e um perfil, coletamos:'],
        list: [
          'E-mail e senha (ou dados básicos da sua conta Google, se você entrar por esse método)',
          'Data de nascimento — usada só pra confirmar que você tem 18 anos ou mais, não é exibida publicamente',
          'Nome, nome de usuário, foto (URL), cidade, país e bio — informações que você escolhe preencher no perfil',
          'Conteúdo que você publica: recados, depoimentos, comunidades e pedidos de amizade',
        ],
      },
      {
        heading: 'Como usamos esses dados',
        paragraphs: [
          'Os dados servem exclusivamente para o funcionamento do site: autenticação, exibição do seu perfil pra outras pessoas e as funcionalidades de recados, depoimentos, comunidades e amigos. Não vendemos nem compartilhamos seus dados com terceiros para fins de publicidade.',
        ],
      },
      {
        heading: 'Cookies',
        paragraphs: ['Usamos cookies apenas para manter sua sessão logada. Não usamos cookies de rastreamento ou publicidade.'],
      },
      {
        heading: 'Seus direitos',
        paragraphs: [
          'Você pode editar suas informações a qualquer momento na tela de edição de perfil. Também é possível excluir sua conta por completo — perfil, recados, depoimentos, amizades e comunidades criadas — na mesma tela, na seção "Zona de perigo". Essa ação é permanente.',
        ],
      },
      {
        heading: 'Contato',
        paragraphs: ['Dúvidas sobre privacidade: contato@oldkut.com'],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    intro: 'This policy explains what data oldkut collects and how it is used. By creating an account, you agree to what is described here.',
    sections: [
      {
        heading: 'What data we collect',
        paragraphs: ['When you create an account and a profile, we collect:'],
        list: [
          'Email and password (or basic data from your Google account, if you sign in that way)',
          "Date of birth — used only to confirm you're 18 or older, never shown publicly",
          'Name, username, photo (URL), city, country and bio — information you choose to fill in on your profile',
          'Content you post: scraps, testimonials, communities and friend requests',
        ],
      },
      {
        heading: 'How we use this data',
        paragraphs: [
          "This data is used exclusively to run the site: authentication, showing your profile to other people, and the scraps, testimonials, communities and friends features. We don't sell or share your data with third parties for advertising purposes.",
        ],
      },
      {
        heading: 'Cookies',
        paragraphs: ['We only use cookies to keep you logged in. We do not use tracking or advertising cookies.'],
      },
      {
        heading: 'Your rights',
        paragraphs: [
          'You can edit your information at any time on the edit profile screen. You can also permanently delete your account — profile, scraps, testimonials, friendships and communities you created — on the same screen, in the "Danger zone" section. This action is permanent.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: ['Privacy questions: contato@oldkut.com'],
      },
    ],
  },
  es: {
    title: 'Política de Privacidad',
    intro: 'Esta política explica qué datos recopila oldkut y cómo se usan. Al crear una cuenta, aceptas lo que se describe aquí.',
    sections: [
      {
        heading: 'Qué datos recopilamos',
        paragraphs: ['Al crear una cuenta y un perfil, recopilamos:'],
        list: [
          'Correo y contraseña (o datos básicos de tu cuenta de Google, si entras por ese método)',
          'Fecha de nacimiento — usada solo para confirmar que tienes 18 años o más, no se muestra públicamente',
          'Nombre, nombre de usuario, foto (URL), ciudad, país y bio — información que eliges completar en el perfil',
          'Contenido que publicas: recados, testimonios, comunidades y solicitudes de amistad',
        ],
      },
      {
        heading: 'Cómo usamos estos datos',
        paragraphs: [
          'Los datos se usan exclusivamente para el funcionamiento del sitio: autenticación, mostrar tu perfil a otras personas y las funciones de recados, testimonios, comunidades y amigos. No vendemos ni compartimos tus datos con terceros con fines publicitarios.',
        ],
      },
      {
        heading: 'Cookies',
        paragraphs: ['Usamos cookies solo para mantener tu sesión iniciada. No usamos cookies de rastreo ni de publicidad.'],
      },
      {
        heading: 'Tus derechos',
        paragraphs: [
          'Puedes editar tu información en cualquier momento en la pantalla de editar perfil. También puedes eliminar tu cuenta por completo — perfil, recados, testimonios, amistades y comunidades creadas — en la misma pantalla, en la sección "Zona de peligro". Esta acción es permanente.',
        ],
      },
      {
        heading: 'Contacto',
        paragraphs: ['Dudas sobre privacidad: contato@oldkut.com'],
      },
    ],
  },
};

export const TERMS_CONTENT: Record<Locale, LegalPage> = {
  pt: {
    title: 'Termos de Serviço',
    intro: 'Ao usar o oldkut, você concorda com os termos abaixo.',
    sections: [
      {
        heading: 'Idade mínima',
        paragraphs: ['O oldkut é destinado exclusivamente a maiores de 18 anos. Ao criar uma conta, você declara ter 18 anos ou mais.'],
      },
      {
        heading: 'Sua conta',
        paragraphs: [
          'Você é responsável por manter sua senha em segurança e por tudo que for publicado através da sua conta. Não é permitido criar contas falsas ou se passar por outra pessoa.',
        ],
      },
      {
        heading: 'Conteúdo publicado',
        paragraphs: [
          'Recados, depoimentos, comunidades e informações de perfil são de responsabilidade de quem os publica. Não é permitido conteúdo ilegal, discurso de ódio, assédio ou spam. Contas que violarem essas regras podem ser suspensas ou excluídas.',
        ],
      },
      {
        heading: 'Disponibilidade',
        paragraphs: [
          'O oldkut é oferecido "como está", sem garantias de disponibilidade contínua. Funcionalidades podem mudar ou ser descontinuadas a qualquer momento.',
        ],
      },
      {
        heading: 'Alterações',
        paragraphs: ['Estes termos podem ser atualizados. O uso continuado do site após uma alteração implica aceitação dela.'],
      },
      {
        heading: 'Contato',
        paragraphs: ['Dúvidas sobre estes termos: contato@oldkut.com'],
      },
    ],
  },
  en: {
    title: 'Terms of Service',
    intro: 'By using oldkut, you agree to the terms below.',
    sections: [
      {
        heading: 'Minimum age',
        paragraphs: ['oldkut is intended exclusively for people 18 and older. By creating an account, you declare that you are 18 or older.'],
      },
      {
        heading: 'Your account',
        paragraphs: [
          "You're responsible for keeping your password secure and for everything posted through your account. Creating fake accounts or impersonating someone else is not allowed.",
        ],
      },
      {
        heading: 'Posted content',
        paragraphs: [
          "Scraps, testimonials, communities and profile information are the responsibility of whoever posts them. Illegal content, hate speech, harassment or spam are not allowed. Accounts that break these rules may be suspended or deleted.",
        ],
      },
      {
        heading: 'Availability',
        paragraphs: [
          'oldkut is provided "as is", with no guarantee of continuous availability. Features may change or be discontinued at any time.',
        ],
      },
      {
        heading: 'Changes',
        paragraphs: ['These terms may be updated. Continuing to use the site after a change means you accept it.'],
      },
      {
        heading: 'Contact',
        paragraphs: ['Questions about these terms: contato@oldkut.com'],
      },
    ],
  },
  es: {
    title: 'Términos de Servicio',
    intro: 'Al usar oldkut, aceptas los siguientes términos.',
    sections: [
      {
        heading: 'Edad mínima',
        paragraphs: ['oldkut está destinado exclusivamente a mayores de 18 años. Al crear una cuenta, declaras tener 18 años o más.'],
      },
      {
        heading: 'Tu cuenta',
        paragraphs: [
          'Eres responsable de mantener tu contraseña segura y de todo lo que se publique a través de tu cuenta. No está permitido crear cuentas falsas ni hacerte pasar por otra persona.',
        ],
      },
      {
        heading: 'Contenido publicado',
        paragraphs: [
          'Los recados, testimonios, comunidades e información de perfil son responsabilidad de quien los publica. No está permitido contenido ilegal, discurso de odio, acoso o spam. Las cuentas que violen estas reglas pueden ser suspendidas o eliminadas.',
        ],
      },
      {
        heading: 'Disponibilidad',
        paragraphs: [
          'oldkut se ofrece "tal cual", sin garantías de disponibilidad continua. Las funciones pueden cambiar o descontinuarse en cualquier momento.',
        ],
      },
      {
        heading: 'Cambios',
        paragraphs: ['Estos términos pueden actualizarse. El uso continuado del sitio después de un cambio implica su aceptación.'],
      },
      {
        heading: 'Contacto',
        paragraphs: ['Dudas sobre estos términos: contato@oldkut.com'],
      },
    ],
  },
};
