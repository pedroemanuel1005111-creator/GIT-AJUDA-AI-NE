export interface QuestionItem {
  id: string;
  category: "saude_digital" | "cultura_digital" | "cultura_alagoana";
  text: string;
  options: [string, string, string, string];
  correctOption: number; // 0, 1, 2, or 3
  explanation: string;
}

export const OFFICIAL_QUESTIONS: QuestionItem[] = [
  // --- SAÚDE DIGITAL ---
  {
    id: "sd-1",
    category: "saude_digital",
    text: "O que caracteriza a prática da 'Telemedicina' no contexto da Saúde Digital moderna?",
    options: [
      "Apenas a marcação de consultas online por e-mail",
      "Prestação de serviços de saúde à distância com o uso de Tecnologias de Informação e Comunicação (TICs)",
      "Venda de medicamentos exclusivamente por sites de comércio eletrônico",
      "Substituição completa de médicos humanos por robôs cirúrgicos autônomos"
    ],
    correctOption: 1,
    explanation: "A Telemedicina utiliza tecnologias de comunicação para conectar pacientes e profissionais de saúde, permitindo diagnósticos, triagem, monitoramento e consultas remotas com segurança e agilidade."
  },
  {
    id: "sd-2",
    category: "saude_digital",
    text: "No Brasil, qual lei estabelece diretrizes rigorosas para o tratamento e proteção dos dados sensíveis dos pacientes (como prontuários médicos)?",
    options: [
      "Lei do Retorno Médico (LRM)",
      "Marco Civil da Internet (MCI)",
      "Lei Geral de Proteção de Dados (LGPD)",
      "Código de Defesa do Internauta (CDI)"
    ],
    correctOption: 2,
    explanation: "A LGPD (Lei nº 13.709/2018) classifica dados de saúde como 'dados sensíveis', exigindo consentimento explícito e esquemas avançados de criptografia e anonimização por parte de hospitais e clínicas."
  },
  {
    id: "sd-3",
    category: "saude_digital",
    text: "O que significa a sigla 'PEP' na gestão moderna de unidades de saúde?",
    options: [
      "Prontuário Eletrônico do Paciente",
      "Plano Emergencial de Proteção",
      "Portal de Especialidades Presenciais",
      "Programa de Exercício e Prevenção"
    ],
    correctOption: 0,
    explanation: "O Prontuário Eletrônico do Paciente (PEP) integra todo o histórico médico, exames, vacinas e tratamentos do cidadão em uma plataforma unificada e acessível pelos profissionais autorizados."
  },
  {
    id: "sd-4",
    category: "saude_digital",
    text: "O que é a 'IoMT' (Internet of Medical Things / Internet das Coisas Médicas)?",
    options: [
      "Uma rede social exclusiva para debates entre enfermeiros e médicos",
      "Dispositivos e sensores médicos conectados à internet que coletam e transmitem sinais vitais em tempo real",
      "Um tipo de vírus de computador que ataca equipamentos de ressonância magnética",
      "Uma biblioteca digital contendo livros de biologia em código aberto"
    ],
    correctOption: 1,
    explanation: "A IoMT engloba wearables (relógios inteligentes, monitores de glicose) e equipamentos hospitalares conectados que transmitem dados para análise contínua da saúde do paciente."
  },
  {
    id: "sd-5",
    category: "saude_digital",
    text: "De que forma a Inteligência Artificial (IA) tem causado uma revolução na Radiologia e Medicina Diagnóstica?",
    options: [
      "Eliminando completamente a necessidade de realizar exames de raio-X",
      "Colorindo radiografias automaticamente para fins artísticos",
      "Identificando padrões e anomalias sutis em imagens médicas com extrema rapidez e precisão para apoiar o médico",
      "Impedindo que pacientes visualizem seus próprios laudos antes de 30 dias"
    ],
    correctOption: 2,
    explanation: "Algoritmos de aprendizado de máquina (Machine Learning) são capazes de analisar milhares de exames em segundos, auxiliando radiologistas na detecção precoce de tumores e fraturas."
  },
  {
    id: "sd-6",
    category: "saude_digital",
    text: "Qual a importância da interoperabilidade de sistemas na Saúde Digital?",
    options: [
      "Permitir que diferentes sistemas hospitalares e laboratoriais troquem informações clínicas de forma padronizada",
      "Fazer com que os computadores consumam menos energia elétrica nas UTIs",
      "Garantir que todos os hospitais usem exatamente a mesma marca de computador",
      "Proibir o uso de dispositivos móveis dentro dos postos de saúde"
    ],
    correctOption: 0,
    explanation: "A interoperabilidade garante que o laudo de um laboratório X seja compreendido de imediato pelo software de um hospital Y, evitando duplicidade de exames e salvando vidas em urgências."
  },

  // --- CULTURA DIGITAL ---
  {
    id: "cd-1",
    category: "cultura_digital",
    text: "O que se entende por 'Letramento Digital' ou 'Alfabetização Digital' no mundo contemporâneo?",
    options: [
      "Saber digitar textos rapidamente sem olhar para o teclado",
      "Capacidade de ler, compreender, avaliar criticamente e criar conteúdos utilizando tecnologias digitais",
      "Decorar todas as linguagens de programação de computadores existentes",
      "A habilidade de consertar smartphones e placas de computador estragadas"
    ],
    correctOption: 1,
    explanation: "O Letramento Digital vai muito além de usar um aparelho: envolve senso crítico para avaliar fake news, noções de privacidade, segurança online e cidadania na web."
  },
  {
    id: "cd-2",
    category: "cultura_digital",
    text: "O fenômeno das 'Bolhas de Informação' (ou Câmaras de Eco) nas redes sociais é impulsionado principalmente por:",
    options: [
      "Algoritmos de recomendação que priorizam mostrar conteúdos alinhados com as preferências e crenças anteriores do usuário",
      "Quedas frequentes nos servidores de conexão de internet via fibra óptica",
      "Excesso de links quebrados em sites governamentais",
      "Falta de espaço de armazenamento nos smartphones modernos"
    ],
    correctOption: 0,
    explanation: "Algoritmos buscam maximizar o engajamento exibindo postagens que confirmam a visão de mundo do usuário, o que pode isolar as pessoas de opiniões contraditórias ou plurais."
  },
  {
    id: "cd-3",
    category: "cultura_digital",
    text: "O que é a 'Netiqueta' no contexto da Convivência e Cultura Digital?",
    options: [
      "Um imposto cobrado sobre compras internacionais feitas por aplicativos",
      "O selo azul de verificação concedido a influenciadores digitais famosíssimos",
      "Conjunto de regras de boas maneiras, respeito e cordialidade na comunicação em ambientes virtuais",
      "Um software antivírus instalado automaticamente em computadores escolares"
    ],
    correctOption: 2,
    explanation: "Netiqueta (Internet + Etiqueta) engloba práticas como não escrever tudo em CAIXA ALTA (que soa como grito), respeitar opiniões alheias e checar a veracidade do que compartilha."
  },
  {
    id: "cd-4",
    category: "cultura_digital",
    text: "O conceito de 'Cidadania Digital' pressupõe que os usuários da internet:",
    options: [
      "Tenham direitos, deveres e responsabilidade ética em suas interações no espaço cibernético",
      "Usem a internet exclusivamente para fins de entretenimento e jogos online",
      "Sejam obrigados a votar em eleições políticas através de enquetes no Instagram",
      "Possuam um passaporte físico especial emitido por empresas de tecnologia"
    ],
    correctOption: 0,
    explanation: "Assim como na sociedade civil, a Cidadania Digital exige o respeito às leis, a defesa da liberdade de expressão sem discurso de ódio e a proteção dos direitos humanos na internet."
  },
  {
    id: "cd-5",
    category: "cultura_digital",
    text: "O que caracteriza o movimento do 'Software Livre' e do 'Código Aberto' (Open Source) na evolução da Cultura Digital?",
    options: [
      "Softwares de altíssimo custo vendidos em leilões fechados para poucas empresas",
      "Programas pirateados ilegalmente com o objetivo de burlar sistemas de pagamento",
      "Softwares cujo código-fonte é disponibilizado publicamente para uso, modificação e distribuição colaborativa",
      "Apenas aplicativos de celular que não exibem propagandas comerciais"
    ],
    correctOption: 2,
    explanation: "O movimento de software livre (como o sistema Linux ou navegadores web) promove a transparência, cooperação mútua, democratização do saber e segurança inspecionável por todos."
  },
  {
    id: "cd-6",
    category: "cultura_digital",
    text: "O que significa o termo 'Phishing' no campo da segurança na Cultura Digital?",
    options: [
      "Técnica de engenharia social usada por golpistas para enganar usuários e roubar senhas e dados bancários",
      "Uma nova modalidade de esporte eletrônico (e-Sport) que simula pescaria em alto mar",
      "Um formato de arquivo de vídeo de altíssima definição 8K",
      "O ato de curtir centenas de fotos de uma mesma pessoa em poucos minutos"
    ],
    correctOption: 0,
    explanation: "Phishing atrai vítimas através de e-mails, SMS ou sites falsos (disfarçados de bancos ou lojas) para 'pescar' informações confidenciais como senhas e números de cartão."
  },

  // --- CULTURA DIGITAL ALAGOANA ---
  {
    id: "cda-1",
    category: "cultura_alagoana",
    text: "Qual é o nome do ecossistema de inovação, startups e tecnologia consolidado no bairro histórico de Jaraguá, em Maceió?",
    options: [
      "Mangue Bit Valley",
      "Sururu Valley",
      "Sertão Tech Hub",
      "Mandacaru Cyber Space"
    ],
    correctOption: 1,
    explanation: "Batizado em homenagem ao famoso molusco símbolo da gastronomia alagoana, o 'Sururu Valley' conecta empreendedores, startups, universidades e poder público para fomentar a tecnologia no estado."
  },
  {
    id: "cda-2",
    category: "cultura_alagoana",
    text: "Qual grande evento de inovação, marketing, negócios e tecnologia nascido em Alagoas se tornou uma das maiores referências do Nordeste brasileiro?",
    options: [
      "Trakto Show",
      "Campus Alagoas Prime",
      "Maceió Game Show",
      "Encontro Digital do São Francisco"
    ],
    correctOption: 0,
    explanation: "O Trakto Show reúne milhares de participantes no Centro de Convenções de Maceió (e edições pelo estado) com palestras de impacto sobre IA, empreendedorismo, design e cultura digital."
  },
  {
    id: "cda-3",
    category: "cultura_alagoana",
    text: "O Centro de Inovação do Polo Tecnológico (CIPT) de Alagoas, localizado em Maceió, tem como objetivo principal:",
    options: [
      "Servir de depósito para computadores antigos e sucatas descartadas do governo",
      "Incubar startups, desenvolver pesquisas avançadas e conectar o setor produtivo com o talento tecnológico alagoano",
      "Imprimir documentos em papel de forma centralizada para todas as escolas do estado",
      "Ser uma central exclusiva de telemarketing de bancos privados"
    ],
    correctOption: 1,
    explanation: "O Centro de Inovação de Alagoas (localizado no Jaraguá) é um marco na modernização econômica de Alagoas, abrigando laboratórios, empresas de tecnologia e eventos comunitários."
  },
  {
    id: "cda-4",
    category: "cultura_alagoana",
    text: "Como os artesãos do tradicional 'Bordado Filé' (Patrimônio Imaterial de Alagoas) têm se inserido na Cultura Digital?",
    options: [
      "Substituindo suas linhas artesanais por cabos de fibra óptica coloridos",
      "Proibindo que turistas fotografem ou postem suas peças nas redes sociais",
      "Utilizando o comércio eletrônico, redes sociais e vitrines virtuais para exportar suas peças de Alagoas para todo o planeta",
      "Abandonando a produção manual e usando impressoras 3D para fazer as roupas"
    ],
    correctOption: 2,
    explanation: "A tradição secular das bordadeiras do Pontal da Barra uniu-se ao poder do Instagram, e-commerce e WhatsApp para valorizar sua arte e vender diretamente para clientes do Brasil e do exterior."
  },
  {
    id: "cda-5",
    category: "cultura_alagoana",
    text: "Qual a importância da digitalização de acervos históricos locais, como o acervo do Instituto Histórico e Geográfico de Alagoas (IHGAL)?",
    options: [
      "Garantir a preservação e o acesso global à rica memória literária, fotográfica e folclórica alagoana por pesquisadores e estudantes",
      "Apagar os documentos originais em papel para economizar espaço nas prateleiras",
      "Vender os documentos históricos como criptomoedas (NFTs) em leilões secretos",
      "Impedir que moradores do interior do estado tenham acesso à história da capital"
    ],
    correctOption: 0,
    explanation: "A digitalização de museus e arquivos históricos de Alagoas eterniza documentos raros sobre a Revolução Pernambucana, Quilombo dos Palmares e vultos da história, garantindo acesso público e perpétuo."
  },
  {
    id: "cda-6",
    category: "cultura_alagoana",
    text: "Na transformação digital dos serviços públicos em Alagoas, qual é o papel dos portais de atendimento unificado na internet (como o Já! Digital)?",
    options: [
      "Cobrar taxas extras de conveniência para quem não quiser ir pessoalmente aos postos",
      "Simplificar a vida do cidadão permitindo agendamentos, emissão de documentos e consultas online sem filas intermináveis",
      "Bloquear o acesso de cidadãos que possuam celulares mais antigos",
      "Substituir todos os servidores públicos por robôs com vozes computadorizadas"
    ],
    correctOption: 1,
    explanation: "O portal Já! Digital e aplicativos estaduais levam cidadania e praticidade à população, permitindo serviços de trânsito, educação, fazenda e identificação na palma da mão."
  },

  // --- QUESTÕES INTERDISCIPLINARES (Completando as 20) ---
  {
    id: "mix-1",
    category: "saude_digital",
    text: "Um aplicativo móvel desenvolvido em Alagoas auxilia agentes comunitários a mapear focos do mosquito da Dengue. Essa tecnologia une:",
    options: [
      "Apenas videogames de entretenimento e redes sociais de fotos",
      "Saúde Digital, Geoprocessamento e Engajamento Cidadão na Saúde Pública",
      "Comércio de produtos de jardinagem e streaming de séries",
      "Realidade virtual para cinemas e fabricação de automóveis"
    ],
    correctOption: 1,
    explanation: "A Saúde Digital aplicada à vigilância epidemiológica usa mapas interativos e dados comunitários para otimizar mutirões de prevenção contra arboviroses no território alagoano."
  },
  {
    id: "mix-2",
    category: "cultura_alagoana",
    text: "A inclusão de jovens do semiárido alagoano (Sertão e Agreste) na economia do futuro depende fundamentalmente de:",
    options: [
      "Expansão da banda larga de qualidade, laboratórios de robótica nas escolas públicas e fomento ao letramento digital",
      "Migração obrigatória de todos os jovens para grandes centros do Sudeste do país",
      "Proibição do uso de computadores na agricultura e pecuária local",
      "Aulas exclusivas de datilografia em máquinas de escrever manuais"
    ],
    correctOption: 0,
    explanation: "A interiorização da Cultura Digital em Arapiraca, Santana do Ipanema, Delmiro Gouveia e demais municípios transforma vidas ao criar oportunidades de trabalho remoto em TI e inovação no campo."
  }
];
