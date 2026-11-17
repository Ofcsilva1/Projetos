// Conhecimento público do serviço: sínteses curtas com fonte, data e limites de atualização.
const institutional = 'https://www.ba.gov.br/justica/proteja';
const newOffice = 'https://www.humanabrasil.org/mais/noticias/proteja-ganha-nova-sede-e-reforca-atendimento-especializado-a-criancas-e-adolescentes-vitimas-de-violencia';
const reviewed = '16/11/2026';
export const SERVICE_TOPICS = {
  proteja: { text: 'O Proteja é uma política pública da Bahia para crianças e adolescentes vítimas ou testemunhas de violência, em parceria entre SJDH e Humana Brasil. Suas frentes incluem atenção inicial, suporte psicossocial, orientação jurídico-social, prevenção e articulação com a rede de proteção.', source: institutional, published: '04/10/2024, atualizada em 06/11/2024' },
  publico: { text: 'O público informado são crianças e adolescentes vítimas ou testemunhas de violência e seus familiares no acompanhamento.', source: institutional, published: '04/10/2024, atualizada em 06/11/2024' },
  atencao_inicial: { text: 'A atenção inicial envolve acolhimento, escuta especializada, avaliação de risco e articulação dos encaminhamentos.', source: institutional, published: '04/10/2024, atualizada em 06/11/2024' },
  psicossocial: { text: 'O suporte psicossocial inclui acompanhamento, prontuário individualizado e encaminhamentos à rede, preservando o sigilo.', source: institutional, published: '04/10/2024, atualizada em 06/11/2024' },
  juridico_social: { text: 'A orientação jurídico-social apoia a relação das famílias com os órgãos de Justiça e os encaminhamentos necessários.', source: institutional, published: '04/10/2024, atualizada em 06/11/2024' },
  prevencao: { text: 'A prevenção inclui orientação às famílias e ações voltadas à redução de fatores de risco.', source: institutional, published: '04/10/2024, atualizada em 06/11/2024' },
  funcionamento: { text: 'A publicação da Humana Brasil informa atendimento de segunda a sexta-feira, das 8h às 17h, com equipe de serviço social, psicologia, direito e pedagogia. Confirme a disponibilidade com o serviço antes do deslocamento.', source: newOffice, published: '30/06/2026' },
  localizacao: { text: 'Na notícia sobre a nova sede, a Humana Brasil informa Rua Dr. Pedro Júlio Barbuda, nº 3, bairro da Saúde, Salvador. Esta referência é posterior às publicações que informavam Rua Américo de Sousa Gomes. Confirme com o serviço antes de se deslocar.', source: newOffice, published: '30/06/2026' },
  contato: { text: 'Os canais divulgados são WhatsApp (71) 99694-0507 e e-mail protejabahia@gmail.com. Confirme a disponibilidade diretamente com o serviço.', source: newOffice, published: '30/06/2026' },
  rede_nao_cadastrada: { text: 'O endereço ou contato específico desse órgão da rede não está cadastrado nesta base. A pergunta é pertinente ao serviço, mas não tenho a informação verificada. Consulte a fonte oficial do órgão e informe a equipe para atualizar o cadastro. O chat não pesquisa automaticamente na internet.' },
  regras_nao_cadastradas: { text: 'Esse protocolo ou regra operacional não está documentado na base disponível. A pergunta é pertinente ao serviço. Para responder com precisão, precisamos cadastrar a orientação institucional e sua fonte; não vou inventar procedimentos, normas ou pareceres.' }
};

export function answerServiceTopic(topic) {
  if (!Object.hasOwn(SERVICE_TOPICS, topic)) throw new Error('Tema institucional inválido.');
  const item = SERVICE_TOPICS[topic];
  return item.source
    ? `${item.text}\n\nInformação pública institucional; não é resultado da base de prontuários.\nFonte: ${item.source}\nPublicação: ${item.published}. Consulta da fonte: ${reviewed}.`
    : item.text;
}
