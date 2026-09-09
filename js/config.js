// Configuração central do site — edite aqui para atualizar em todas as páginas.
const NOVA_BELLUNO_CONFIG = {
  /* Número único de atendimento: todos os botões de WhatsApp do site caem
     aqui, inclusive os das páginas de unidade. O mapa por unidade continua
     existindo para que o roteamento separado possa voltar sem mexer no
     markup — basta trocar os valores abaixo. */
  whatsappNumber: "5548991713199",
  whatsappNumbers: {
    sideropolis: "5548991713199",
    capivari: "5548991713199",
  },
  whatsappMessage: "Olá! Vim pelo site da Nova Belluno e gostaria de saber mais.",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Nova+Belluno+Residencial+Geri%C3%A1trico%2C+Rua+Jos%C3%A9+Salvaro%2C+716%2C+Sider%C3%B3polis%2C+SC",
};

function buildWhatsappLink(customMessage, target) {
  const message = encodeURIComponent(customMessage || NOVA_BELLUNO_CONFIG.whatsappMessage);
  const number = NOVA_BELLUNO_CONFIG.whatsappNumbers[target]
    || NOVA_BELLUNO_CONFIG.whatsappNumber;
  return `https://wa.me/${number}?text=${message}`;
}

document.querySelectorAll('#hero-whatsapp, #header-whatsapp, #floating-whatsapp, [data-whatsapp]').forEach((el) => {
  el.setAttribute('href', buildWhatsappLink(el.dataset.whatsappMessage, el.dataset.whatsappTarget));
  el.setAttribute('target', '_blank');
  el.setAttribute('rel', 'noopener');
});

document.querySelectorAll('#hero-maps').forEach((el) => {
  el.setAttribute('href', NOVA_BELLUNO_CONFIG.mapsUrl);
  el.setAttribute('target', '_blank');
  el.setAttribute('rel', 'noopener');
});
