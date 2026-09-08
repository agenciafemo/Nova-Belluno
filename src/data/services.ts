export interface FAQItem {
  question: string;
  answer: string;
}

export interface ServiceSection {
  title: string;
  paragraphs: string[];
}

export interface Service {
  number: string;
  slug: string;
  area: string;
  title: string;
  shortDescription: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
  imageWidth: number;
  imageHeight: number;
  whatsappMessage: string;
  metaTitle: string;
  metaDescription: string;
  introduction: string;
  sections: ServiceSection[];
  faq: FAQItem[];
  related: string[];
}

export const services: Service[] = [
  {
    number: '01',
    slug: 'avaliacao-medica',
    area: 'Saúde',
    title: 'Avaliação médica regular',
    shortDescription: 'Avaliações periódicas ajudam a acompanhar necessidades, orientar condutas e dar continuidade ao cuidado de cada residente.',
    image: '/assets/img/services/avaliacao-medica-01.webp',
    imageAlt: 'Profissional acompanhando a pressão arterial de uma pessoa idosa',
    imagePosition: '50% 45%',
    imageWidth: 960,
    imageHeight: 1200,
    whatsappMessage: 'Olá! Gostaria de saber mais sobre Avaliação médica regular na Nova Belluno.',
    metaTitle: 'Avaliação médica regular | Nova Belluno',
    metaDescription: 'Entenda como a avaliação médica regular participa do cuidado integrado e do acompanhamento das necessidades de cada residente na Nova Belluno.',
    introduction: 'A avaliação médica regular integra o acompanhamento da pessoa idosa e ajuda a equipe a observar mudanças, revisar necessidades e alinhar condutas. O cuidado é organizado de acordo com a realidade de cada residente, sem substituir atendimentos de urgência ou prometer presença médica contínua.',
    sections: [
      {
        title: 'Acompanhamento atento ao longo do tempo',
        paragraphs: [
          'O envelhecimento reúne dimensões físicas, emocionais, sociais e funcionais. Por isso, a avaliação médica faz mais sentido quando está conectada às observações da enfermagem, às informações da família e ao trabalho das demais áreas de cuidado.',
          'As avaliações periódicas podem apoiar a identificação de novas necessidades e a revisão de orientações. Frequência, encaminhamentos e condutas dependem da situação individual e da avaliação dos profissionais responsáveis.',
        ],
      },
      {
        title: 'Integração com a rotina de cuidado',
        paragraphs: [
          'Informações relevantes da rotina podem contribuir para uma visão mais completa do residente. O objetivo é favorecer continuidade e coerência entre as orientações recebidas e o cuidado realizado no dia a dia.',
        ],
      },
      {
        title: 'O que a família pode conversar com a equipe',
        paragraphs: [
          'A família pode compartilhar histórico, alterações percebidas, dúvidas sobre orientações e informações de outros profissionais. A equipe explica como o acompanhamento é organizado em cada unidade e quais documentos podem ser necessários.',
        ],
      },
    ],
    faq: [
      { question: 'A Nova Belluno possui médico disponível 24 horas?', answer: 'Não fazemos essa afirmação. A Nova Belluno oferece avaliação médica regular. A presença contínua mencionada no site refere-se aos técnicos de enfermagem, e o funcionamento deve ser confirmado com a equipe.' },
      { question: 'Com que frequência acontecem as avaliações?', answer: 'A frequência não é igual para todos. Ela depende das necessidades do residente, das orientações profissionais e da organização da unidade.' },
      { question: 'A família pode compartilhar informações de outros atendimentos?', answer: 'Sim. Informações, documentos e orientações de outros profissionais podem ajudar a equipe a compreender o histórico e organizar a continuidade do cuidado.' },
      { question: 'A avaliação médica regular está disponível nas duas unidades?', answer: 'A composição e o funcionamento dos atendimentos podem variar. A equipe deve confirmar a disponibilidade e explicar como o acompanhamento é organizado em cada unidade.' },
    ],
    related: ['enfermagem', 'tecnicos-enfermagem', 'nutricao'],
  },
  {
    number: '02',
    slug: 'enfermagem',
    area: 'Enfermagem',
    title: 'Enfermagem',
    shortDescription: 'Coordena a assistência de enfermagem, acompanha os cuidados e orienta a equipe nas necessidades de cada residente.',
    image: '/assets/img/services/enfermeiro-chefe-01.webp',
    imageAlt: 'Profissionais de enfermagem revisando juntas informações do cuidado',
    imagePosition: '50% 42%',
    imageWidth: 960,
    imageHeight: 1200,
    whatsappMessage: 'Olá! Gostaria de saber mais sobre Enfermagem na Nova Belluno.',
    metaTitle: 'Enfermagem | Nova Belluno',
    metaDescription: 'Conheça o papel da enfermagem na coordenação da assistência, na orientação da equipe e no cuidado integrado da Nova Belluno.',
    introduction: 'A equipe de enfermagem contribui para organizar a assistência de enfermagem e conectar informações importantes da rotina. Seu trabalho envolve acompanhamento, orientação da equipe e articulação com outros profissionais conforme as necessidades de cada residente.',
    sections: [
      {
        title: 'Coordenação que dá continuidade ao cuidado',
        paragraphs: [
          'Uma rotina de cuidado envolve registros, observações e comunicação entre diferentes pessoas. A coordenação de enfermagem ajuda a organizar esses elementos para que a equipe trabalhe com referências claras e atenção às particularidades de cada residente.',
          'As decisões e os encaminhamentos dependem da avaliação profissional e das necessidades percebidas. A coordenação de enfermagem também pode contribuir para orientar a equipe diante de mudanças na rotina.',
        ],
      },
      {
        title: 'Trabalho integrado com outras áreas',
        paragraphs: [
          'A enfermagem participa do cuidado em diálogo com avaliação médica regular, nutrição, psicologia, fisioterapia e demais áreas. Essa troca ajuda a manter uma visão ampla, sem tratar cada necessidade de forma isolada.',
        ],
      },
      {
        title: 'Comunicação com familiares e responsáveis',
        paragraphs: [
          'Familiares podem conversar com a equipe sobre mudanças percebidas, orientações recebidas e dúvidas relacionadas à rotina. Os canais e responsáveis por cada informação são explicados durante o atendimento.',
        ],
      },
    ],
    faq: [
      { question: 'Qual é o papel da enfermagem?', answer: 'A enfermagem coordena a assistência, acompanha os cuidados e orienta a equipe de acordo com as necessidades observadas.' },
      { question: 'A enfermagem substitui a avaliação médica?', answer: 'Não. Enfermagem e avaliação médica possuem responsabilidades diferentes e podem atuar de forma integrada dentro do plano de cuidado.' },
      { question: 'A família pode conversar sobre mudanças na rotina?', answer: 'Sim. A comunicação ajuda a reunir informações relevantes. A equipe orienta o canal adequado para cada situação.' },
      { question: 'O funcionamento é igual nas duas unidades?', answer: 'Não presumimos que seja idêntico. Estrutura, composição da equipe e organização podem variar, por isso a confirmação deve ser feita diretamente com a Nova Belluno.' },
    ],
    related: ['tecnicos-enfermagem', 'avaliacao-medica', 'psicologia'],
  },
  {
    number: '03',
    slug: 'tecnicos-enfermagem',
    area: 'Enfermagem',
    title: 'Técnicos de enfermagem 24h',
    shortDescription: 'Presença contínua para os cuidados da rotina, apoio nas necessidades individuais e atenção ao bem-estar dos residentes.',
    image: '/assets/img/services/tecnicos-enfermagem-01.webp',
    imageAlt: 'Profissional de enfermagem verificando a oxigenação de uma pessoa idosa',
    imagePosition: '50% 45%',
    imageWidth: 960,
    imageHeight: 1200,
    whatsappMessage: 'Olá! Gostaria de saber mais sobre Técnicos de enfermagem 24h na Nova Belluno.',
    metaTitle: 'Técnicos de enfermagem 24h | Nova Belluno',
    metaDescription: 'Saiba como a presença contínua de técnicos de enfermagem apoia os cuidados da rotina e as necessidades individuais dos residentes.',
    introduction: 'A presença de técnicos de enfermagem 24 horas oferece apoio contínuo aos cuidados da rotina. O trabalho é realizado dentro das atribuições da enfermagem, com orientação e coordenação profissional e atenção às necessidades individuais dos residentes.',
    sections: [
      {
        title: 'Presença contínua na rotina',
        paragraphs: [
          'A continuidade permite acompanhar o dia a dia e observar informações relevantes para a equipe. Os cuidados não são padronizados de forma rígida: cada residente pode demandar níveis diferentes de apoio e supervisão.',
          'Quando uma situação exige avaliação de outro profissional ou serviço, a equipe segue as orientações e os fluxos definidos para o caso.',
        ],
      },
      {
        title: 'Atenção organizada em equipe',
        paragraphs: [
          'Os técnicos atuam em conjunto com a coordenação de enfermagem e em diálogo com as demais áreas. Registros e comunicação ajudam a dar continuidade às orientações relacionadas ao cuidado cotidiano.',
        ],
      },
      {
        title: 'Informações importantes para a família',
        paragraphs: [
          'Antes da hospedagem, a família pode explicar hábitos, necessidades de apoio e orientações já existentes. A Nova Belluno apresenta como a rotina de enfermagem funciona em cada unidade.',
        ],
      },
    ],
    faq: [
      { question: 'O que significa técnicos de enfermagem 24h?', answer: 'Significa presença contínua de técnicos de enfermagem para os cuidados da rotina, dentro de suas atribuições e da organização assistencial da unidade.' },
      { question: 'Isso significa médico disponível 24 horas?', answer: 'Não. A presença 24h refere-se aos técnicos de enfermagem. O atendimento médico é apresentado como avaliação médica regular.' },
      { question: 'Os cuidados são iguais para todos?', answer: 'Não. O apoio é organizado conforme as necessidades, orientações e condições de cada residente.' },
      { question: 'Como saber o que está disponível em cada unidade?', answer: 'Converse com a equipe. A estrutura e a organização podem variar entre Siderópolis e Capivari de Baixo.' },
    ],
    related: ['enfermagem', 'avaliacao-medica', 'nutricao'],
  },
  {
    number: '04',
    slug: 'nutricao',
    area: 'Alimentação',
    title: 'Nutrição',
    shortDescription: 'Cardápios equilibrados e planejados por profissionais unem necessidades nutricionais, cuidado e prazer em cada refeição.',
    image: '/assets/img/services/nutricao-01.webp',
    imageAlt: 'Refeição equilibrada sendo servida a uma pessoa idosa',
    imagePosition: '50% 48%',
    imageWidth: 960,
    imageHeight: 1200,
    whatsappMessage: 'Olá! Gostaria de saber mais sobre Nutrição na Nova Belluno.',
    metaTitle: 'Nutrição para pessoas idosas | Nova Belluno',
    metaDescription: 'Conheça como o planejamento nutricional considera necessidades individuais, segurança alimentar e o prazer das refeições na Nova Belluno.',
    introduction: 'A alimentação faz parte do cuidado, da convivência e da rotina. O acompanhamento nutricional busca considerar necessidades individuais, orientações existentes e a experiência das refeições, sempre com avaliação profissional.',
    sections: [
      {
        title: 'Planejamento atento às necessidades',
        paragraphs: [
          'O planejamento de cardápios pode considerar preferências, restrições informadas, consistências e orientações relacionadas ao estado de saúde. Ajustes dependem da avaliação e não devem ser feitos por conta própria.',
          'Além da composição nutricional, a apresentação, os horários e o ambiente das refeições também podem contribuir para uma rotina mais acolhedora.',
        ],
      },
      {
        title: 'Alimentação conectada ao cuidado integrado',
        paragraphs: [
          'Nutrição, enfermagem, avaliação médica e fonoaudiologia podem trocar informações quando houver necessidades relacionadas à alimentação, mastigação ou deglutição. Cada profissional atua dentro de suas competências.',
        ],
      },
      {
        title: 'O que informar antes da hospedagem',
        paragraphs: [
          'A família deve compartilhar restrições, preferências, alergias, orientações profissionais e dificuldades percebidas. A equipe confirma como essas informações serão avaliadas e incorporadas à rotina.',
        ],
      },
    ],
    faq: [
      { question: 'Os cardápios são iguais para todos?', answer: 'O planejamento é coletivo, mas necessidades específicas podem exigir avaliação e ajustes. A equipe explica o que é possível em cada caso.' },
      { question: 'Restrições alimentares são consideradas?', answer: 'Devem ser informadas à equipe e avaliadas pelos profissionais responsáveis, juntamente com documentos e orientações existentes.' },
      { question: 'Nutrição e fonoaudiologia trabalham juntas?', answer: 'Elas podem trocar informações quando há necessidades relacionadas à alimentação, mastigação ou deglutição, respeitando as competências de cada área.' },
      { question: 'O serviço é igual nas duas unidades?', answer: 'Cardápios, recursos e organização podem variar. Confirme diretamente com a equipe da unidade de interesse.' },
    ],
    related: ['fonoaudiologia', 'avaliacao-medica', 'tecnicos-enfermagem'],
  },
  {
    number: '05',
    slug: 'recreacao',
    area: 'Convivência',
    title: 'Recreação',
    shortDescription: 'Atividades individuais e em grupo estimulam convivência, autonomia, lazer e vínculos em uma rotina mais participativa.',
    image: '/assets/img/services/recreacao-01.webp',
    imageAlt: 'Pessoa idosa participando de uma atividade recreativa acompanhada',
    imagePosition: '50% 44%',
    imageWidth: 960,
    imageHeight: 1200,
    whatsappMessage: 'Olá! Gostaria de saber mais sobre Recreação na Nova Belluno.',
    metaTitle: 'Recreação e convivência | Nova Belluno',
    metaDescription: 'Entenda como atividades recreativas podem favorecer convivência, participação, lazer e vínculos na rotina das pessoas idosas.',
    introduction: 'A recreação cria oportunidades de convivência, expressão e lazer. As propostas podem ser individuais ou coletivas e procuram respeitar interesses, possibilidades e o ritmo de cada residente.',
    sections: [
      {
        title: 'Participação com sentido para cada pessoa',
        paragraphs: [
          'Atividades recreativas fazem mais sentido quando dialogam com histórias, preferências e habilidades. Jogos, conversas, práticas ao ar livre e momentos de criação podem integrar a programação, conforme a unidade e o planejamento.',
          'Participar não deve significar obrigatoriedade. Convites, adaptações e diferentes formas de envolvimento ajudam a respeitar escolhas e condições individuais.',
        ],
      },
      {
        title: 'Convivência e construção de vínculos',
        paragraphs: [
          'Momentos compartilhados podem favorecer contato social e pertencimento. A equipe observa como cada residente se relaciona com as propostas e ajusta a condução quando necessário.',
        ],
      },
      {
        title: 'O que a família pode compartilhar',
        paragraphs: [
          'Hobbies, músicas, lembranças, atividades preferidas e limites conhecidos ajudam a equipe a compreender o que pode tornar a rotina mais significativa para a pessoa idosa.',
        ],
      },
    ],
    faq: [
      { question: 'Quais atividades recreativas são realizadas?', answer: 'A programação pode incluir propostas individuais e em grupo. Tipos e frequência variam conforme a unidade, o planejamento e os residentes.' },
      { question: 'A participação é obrigatória?', answer: 'As propostas devem respeitar preferências, condições e o ritmo de cada residente. A equipe pode explicar como incentiva a participação.' },
      { question: 'A família pode sugerir interesses?', answer: 'Sim. Informações sobre hobbies, histórias e atividades preferidas ajudam a equipe a conhecer melhor a pessoa.' },
      { question: 'A programação é igual nas duas unidades?', answer: 'Não necessariamente. Espaços, recursos e programação podem variar; confirme com a unidade escolhida.' },
    ],
    related: ['atividades-musicais', 'educacao-fisica', 'psicologia'],
  },
  {
    number: '06',
    slug: 'psicologia',
    area: 'Bem-estar',
    title: 'Psicologia',
    shortDescription: 'Escuta e apoio emocional acompanham a adaptação, os vínculos e as transformações vividas na terceira idade.',
    image: '/assets/img/services/psicologia-01.webp',
    imageAlt: 'Profissional em uma conversa acolhedora com uma pessoa idosa',
    imagePosition: '50% 40%',
    imageWidth: 960,
    imageHeight: 1200,
    whatsappMessage: 'Olá! Gostaria de saber mais sobre Psicologia na Nova Belluno.',
    metaTitle: 'Psicologia e bem-estar | Nova Belluno',
    metaDescription: 'Saiba como a Psicologia pode apoiar adaptação, expressão emocional, vínculos e bem-estar no cuidado à pessoa idosa.',
    introduction: 'A Psicologia oferece um olhar atento às experiências emocionais, aos vínculos e às mudanças que podem acompanhar o envelhecimento e a adaptação a uma nova rotina. O acompanhamento considera a singularidade de cada pessoa.',
    sections: [
      {
        title: 'Escuta respeitosa e acolhimento',
        paragraphs: [
          'Mudanças de ambiente, rotina e relações podem despertar sentimentos diferentes. A escuta profissional cria espaço para expressão e compreensão dessas experiências, sem presumir que todas as pessoas vivem o envelhecimento da mesma maneira.',
          'Formato, objetivos e frequência do acompanhamento dependem das necessidades observadas e da avaliação profissional.',
        ],
      },
      {
        title: 'Vínculos e cuidado interdisciplinar',
        paragraphs: [
          'Quando pertinente e respeitando o sigilo profissional, a Psicologia pode contribuir com a equipe na compreensão de aspectos emocionais e relacionais que influenciam a rotina e o bem-estar.',
        ],
      },
      {
        title: 'Diálogo com a família',
        paragraphs: [
          'A família pode compartilhar mudanças percebidas e dúvidas sobre adaptação. A equipe orienta como ocorre a comunicação, preservando a dignidade, a autonomia e a privacidade do residente.',
        ],
      },
    ],
    faq: [
      { question: 'Todas as pessoas recebem o mesmo acompanhamento psicológico?', answer: 'Não. O formato depende das necessidades, da avaliação profissional e da organização disponível em cada unidade.' },
      { question: 'A Psicologia pode apoiar a adaptação à nova rotina?', answer: 'A escuta profissional pode contribuir para compreender sentimentos, mudanças e vínculos relacionados à adaptação.' },
      { question: 'A família participa do acompanhamento?', answer: 'A comunicação pode ocorrer quando pertinente, respeitando critérios profissionais, privacidade e necessidades do residente.' },
      { question: 'Como confirmar disponibilidade e frequência?', answer: 'Converse diretamente com a Nova Belluno, pois composição e frequência podem variar conforme a unidade e o caso.' },
    ],
    related: ['recreacao', 'atividades-musicais', 'educacao-fisica'],
  },
  {
    number: '07',
    slug: 'fonoaudiologia',
    area: 'Comunicação',
    title: 'Fonoaudiologia',
    shortDescription: 'Acompanha comunicação, voz, audição, mastigação e deglutição conforme as necessidades de cada residente.',
    image: '/assets/img/services/fonoaudiologia-01.webp',
    imageAlt: 'Profissional orientando uma atividade de fonoaudiologia com uma pessoa idosa',
    imagePosition: '50% 42%',
    imageWidth: 960,
    imageHeight: 1200,
    whatsappMessage: 'Olá! Gostaria de saber mais sobre Fonoaudiologia na Nova Belluno.',
    metaTitle: 'Fonoaudiologia para pessoas idosas | Nova Belluno',
    metaDescription: 'Conheça a atuação da Fonoaudiologia em comunicação, voz, audição, mastigação e deglutição no cuidado à pessoa idosa.',
    introduction: 'A Fonoaudiologia pode acompanhar aspectos de comunicação, voz, audição, mastigação e deglutição. A atuação parte de avaliação profissional e das necessidades identificadas, em diálogo com outras áreas quando necessário.',
    sections: [
      {
        title: 'Comunicação e participação na rotina',
        paragraphs: [
          'Comunicar desejos, desconfortos e histórias participa da autonomia e da convivência. O olhar fonoaudiológico pode ajudar a compreender mudanças na fala, na voz, na linguagem ou na audição e orientar estratégias adequadas ao caso.',
          'Não se presume que toda pessoa idosa precise do mesmo acompanhamento. Avaliação, objetivos e frequência são individualizados.',
        ],
      },
      {
        title: 'Atenção à mastigação e à deglutição',
        paragraphs: [
          'Quando existem dificuldades ou sinais relacionados à alimentação, a Fonoaudiologia pode avaliar funções de mastigação e deglutição dentro de suas competências. Nutrição, enfermagem e avaliação médica podem participar do cuidado integrado.',
        ],
      },
      {
        title: 'Informações que ajudam a equipe',
        paragraphs: [
          'Histórico de audição, uso de aparelhos, alterações de voz, episódios de engasgo e orientações anteriores devem ser comunicados. A equipe indicará os próximos passos adequados, sem substituir avaliação individual.',
        ],
      },
    ],
    faq: [
      { question: 'Em quais aspectos a Fonoaudiologia pode atuar?', answer: 'A área pode acompanhar comunicação, voz, audição, mastigação e deglutição, conforme avaliação e necessidade individual.' },
      { question: 'Todo residente precisa de atendimento fonoaudiológico?', answer: 'Não necessariamente. A indicação, os objetivos e a frequência dependem das necessidades identificadas e da avaliação profissional.' },
      { question: 'A família deve informar episódios de engasgo?', answer: 'Sim. Esse tipo de informação é relevante e deve ser comunicado à equipe para avaliação e orientação adequadas.' },
      { question: 'O atendimento está disponível nas duas unidades?', answer: 'A disponibilidade pode variar. Confirme com a equipe da unidade de interesse antes de tomar uma decisão.' },
    ],
    related: ['nutricao', 'psicologia', 'avaliacao-medica'],
  },
  {
    number: '08',
    slug: 'fisioterapia',
    area: 'Mobilidade',
    title: 'Fisioterapia',
    shortDescription: 'Exercícios e técnicas buscam apoiar mobilidade, equilíbrio, funcionalidade e segurança nos movimentos.',
    image: '/assets/img/services/fisioterapia-01.webp',
    imageAlt: 'Pessoa idosa realizando um exercício de mobilidade com acompanhamento profissional',
    imagePosition: '50% 52%',
    imageWidth: 960,
    imageHeight: 1200,
    whatsappMessage: 'Olá! Gostaria de saber mais sobre Fisioterapia na Nova Belluno.',
    metaTitle: 'Fisioterapia para pessoas idosas | Nova Belluno',
    metaDescription: 'Entenda como a Fisioterapia pode acompanhar mobilidade, equilíbrio, funcionalidade e segurança nos movimentos da pessoa idosa.',
    introduction: 'A Fisioterapia direcionada à pessoa idosa observa mobilidade, equilíbrio, funcionalidade e segurança nos movimentos. As propostas dependem de avaliação e respeitam condições, limites e objetivos individuais.',
    sections: [
      {
        title: 'Movimento com avaliação e propósito',
        paragraphs: [
          'A capacidade de se movimentar influencia atividades cotidianas e participação na rotina. A avaliação fisioterapêutica ajuda a compreender necessidades funcionais e a planejar exercícios ou técnicas adequados ao momento de cada pessoa.',
          'Não existe uma sequência única para todos. Intensidade, apoio, recursos e frequência precisam ser definidos pelo profissional responsável.',
        ],
      },
      {
        title: 'Segurança e integração com a equipe',
        paragraphs: [
          'Informações da enfermagem, da avaliação médica e da própria rotina podem ajudar o fisioterapeuta a acompanhar mudanças e alinhar orientações. O cuidado integrado busca coerência entre os diferentes momentos do dia.',
        ],
      },
      {
        title: 'O que compartilhar com a Nova Belluno',
        paragraphs: [
          'A família pode informar histórico de quedas, uso de dispositivos de apoio, limitações conhecidas e orientações de profissionais externos. A equipe explicará como a avaliação é organizada.',
        ],
      },
    ],
    faq: [
      { question: 'A Fisioterapia é igual para todos os residentes?', answer: 'Não. Exercícios, técnicas, objetivos e frequência dependem da avaliação funcional e das necessidades individuais.' },
      { question: 'A família deve informar histórico de quedas?', answer: 'Sim. Quedas anteriores, dispositivos utilizados e orientações profissionais são informações importantes para a equipe.' },
      { question: 'Fisioterapia e Educação física são a mesma coisa?', answer: 'Não. São áreas distintas, com competências próprias, que podem dialogar dentro do cuidado integrado.' },
      { question: 'Como confirmar a disponibilidade?', answer: 'A composição dos atendimentos pode variar por unidade. Consulte a Nova Belluno para conhecer a organização atual.' },
    ],
    related: ['educacao-fisica', 'tecnicos-enfermagem', 'avaliacao-medica'],
  },
  {
    number: '09',
    slug: 'educacao-fisica',
    area: 'Movimento',
    title: 'Educação física',
    shortDescription: 'Atividades orientadas estimulam uma rotina ativa, respeitando autonomia, equilíbrio e condições individuais.',
    image: '/assets/img/services/educacao-fisica-01.webp',
    imageAlt: 'Pessoa idosa fazendo uma atividade física orientada com faixa elástica',
    imagePosition: '50% 46%',
    imageWidth: 960,
    imageHeight: 1200,
    whatsappMessage: 'Olá! Gostaria de saber mais sobre Educação física na Nova Belluno.',
    metaTitle: 'Educação física para pessoas idosas | Nova Belluno',
    metaDescription: 'Conheça como atividades físicas orientadas podem apoiar movimento, convivência e uma rotina ativa para pessoas idosas.',
    introduction: 'A Educação física propõe atividades orientadas que podem contribuir para movimento, disposição, convivência e participação. Cada proposta deve considerar condições individuais, preferências e orientações da equipe.',
    sections: [
      {
        title: 'Uma rotina ativa dentro das possibilidades',
        paragraphs: [
          'Atividade física não precisa significar desempenho ou competição. Movimentos orientados e adaptados podem integrar a rotina de forma gradual, com atenção à segurança e ao ritmo de cada residente.',
          'O planejamento considera avaliação profissional e informações relevantes de outras áreas. Intensidade e frequência não devem ser generalizadas.',
        ],
      },
      {
        title: 'Movimento também pode ser convivência',
        paragraphs: [
          'Propostas em grupo podem criar oportunidades de interação, enquanto atividades individuais podem atender necessidades específicas. O formato depende do planejamento e do perfil dos participantes.',
        ],
      },
      {
        title: 'Informações importantes antes de participar',
        paragraphs: [
          'Limitações conhecidas, uso de apoio, desconfortos e orientações profissionais devem ser comunicados. A equipe avalia como incluir a atividade com responsabilidade.',
        ],
      },
    ],
    faq: [
      { question: 'As atividades físicas são adaptadas?', answer: 'As propostas devem considerar condições, limites e possibilidades individuais, conforme avaliação e orientação profissional.' },
      { question: 'É preciso ter experiência com exercícios?', answer: 'Não. O planejamento parte do momento de cada pessoa e não deve exigir experiência anterior.' },
      { question: 'As atividades são individuais ou em grupo?', answer: 'Podem existir diferentes formatos. A disponibilidade e a programação variam conforme unidade e planejamento.' },
      { question: 'Educação física substitui Fisioterapia?', answer: 'Não. São áreas diferentes, com objetivos e competências próprios, que podem atuar de forma articulada.' },
    ],
    related: ['fisioterapia', 'recreacao', 'atividades-musicais'],
  },
  {
    number: '10',
    slug: 'atividades-musicais',
    area: 'Expressão',
    title: 'Atividades musicais',
    shortDescription: 'Canto, ritmo e brincadeiras ajudam a estimular humor, autoestima, consciência corporal e convivência.',
    image: '/assets/img/services/atividades-musicais-01.webp',
    imageAlt: 'Pessoa idosa cantando durante uma atividade musical com violão',
    imagePosition: '50% 42%',
    imageWidth: 960,
    imageHeight: 1200,
    whatsappMessage: 'Olá! Gostaria de saber mais sobre Atividades musicais na Nova Belluno.',
    metaTitle: 'Atividades musicais | Nova Belluno',
    metaDescription: 'Saiba como canto, ritmo e experiências musicais podem favorecer expressão, memória afetiva e convivência na rotina.',
    introduction: 'A música pode abrir caminhos para expressão, lembranças e convivência. Canto, ritmo e brincadeiras musicais são apresentados de forma acolhedora, respeitando preferências, participação e possibilidades individuais.',
    sections: [
      {
        title: 'Música como experiência de expressão',
        paragraphs: [
          'Canções podem se relacionar a histórias pessoais e momentos importantes. As atividades musicais buscam criar experiências de escuta, participação e troca, sem exigir conhecimento técnico ou desempenho.',
          'A forma de participar pode variar: cantar, acompanhar o ritmo, ouvir ou simplesmente estar presente. A equipe observa interesses e respostas para conduzir cada proposta.',
        ],
      },
      {
        title: 'Convivência e memória afetiva',
        paragraphs: [
          'Atividades em grupo podem favorecer encontros e conversas. Repertórios compartilhados também podem ajudar familiares e equipe a conhecer referências importantes na história de cada residente.',
        ],
      },
      {
        title: 'Como a família pode contribuir',
        paragraphs: [
          'Informar artistas, gêneros, músicas marcantes e preferências ajuda a tornar as propostas mais próximas da pessoa. A programação e a frequência dependem de cada unidade.',
        ],
      },
    ],
    faq: [
      { question: 'É preciso saber cantar ou tocar um instrumento?', answer: 'Não. A participação pode acontecer por meio de canto, ritmo, escuta, lembranças ou outras formas confortáveis para a pessoa.' },
      { question: 'A família pode sugerir músicas?', answer: 'Sim. Repertórios e histórias musicais ajudam a equipe a conhecer preferências e memórias afetivas.' },
      { question: 'A participação é obrigatória?', answer: 'As propostas devem respeitar escolhas, interesses e condições individuais.' },
      { question: 'Qual é a frequência das atividades?', answer: 'A frequência e o formato podem variar conforme a programação e a unidade. Confirme diretamente com a equipe.' },
    ],
    related: ['recreacao', 'psicologia', 'educacao-fisica'],
  },
];

export const servicesFaq: FAQItem[] = [
  {
    question: 'Como saber quais serviços fazem sentido para cada residente?',
    answer: 'A definição depende das necessidades, do histórico, das orientações profissionais e da avaliação da equipe. Uma conversa inicial ajuda a compreender o momento da pessoa idosa e da família.',
  },
  {
    question: 'Todos os serviços estão disponíveis nas duas unidades?',
    answer: 'Não presumimos disponibilidade idêntica. A composição dos atendimentos, os recursos e a frequência podem variar entre Siderópolis e Capivari de Baixo. Confirme com a equipe da unidade de interesse.',
  },
  {
    question: 'A Nova Belluno possui médico disponível 24 horas?',
    answer: 'Não fazemos essa afirmação. O serviço apresentado é de avaliação médica regular. A presença contínua mencionada no site refere-se aos técnicos de enfermagem.',
  },
  {
    question: 'Como os profissionais trabalham de forma integrada?',
    answer: 'Cada área observa aspectos diferentes da rotina e pode compartilhar informações relevantes dentro de suas responsabilidades. Essa comunicação ajuda a organizar um cuidado mais coerente com as necessidades do residente.',
  },
  {
    question: 'Os atendimentos são iguais para todos?',
    answer: 'Não. Formato, frequência e objetivos dependem da avaliação profissional, das necessidades individuais e da organização disponível em cada unidade.',
  },
  {
    question: 'Como conversar com a equipe ou agendar uma visita?',
    answer: 'Use os botões de WhatsApp da página ou consulte a seção de unidades. A equipe pode explicar os serviços, as diferenças entre as casas e os próximos passos.',
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}

export function getRelatedServices(service: Service) {
  return service.related
    .map((slug) => getServiceBySlug(slug))
    .filter((item): item is Service => Boolean(item));
}
