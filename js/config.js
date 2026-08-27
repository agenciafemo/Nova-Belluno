// Configuração central do site — edite aqui para atualizar em todas as páginas.
const NOVA_BELLUNO_CONFIG = {
  // Contato geral direcionado à unidade principal de Siderópolis.
  whatsappNumber: "5548991749986",
  whatsappNumbers: {
    sideropolis: "5548991749986",
    capivari: "5548988520869",
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
