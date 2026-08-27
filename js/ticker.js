(function () {
  const svg = document.getElementById('ticker-svg');
  const trackPath = document.getElementById('ticker-path');
  const ribbon = document.getElementById('ticker-ribbon');
  const textPath = document.getElementById('ticker-textpath');
  if (!svg || !trackPath || !ribbon || !textPath) return;

  const PHRASES = [
    'Ambiente arborizado',
    '12 min do centro de Criciúma',
    'Equipe multidisciplinar',
    'Siderópolis · Capivari de Baixo',
  ];
  const SEPARATOR = '   /   ';
  const GROUP = PHRASES.join(SEPARATOR) + SEPARATOR;

  const SPEED = 55; // px por segundo
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  let groupLength = 0;
  let offset = 0;
  let frame = 0;
  let lastTimestamp = null;
  let resizeTimer;

  function cssNumber(name, fallback) {
    const value = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(name)
    );
    return Number.isNaN(value) ? fallback : value;
  }

  /* Curva orgânica em vez de senoide pura:

     1. Envelope de amplitude — começa discreta na esquerda (LEFT_SCALE) e
        abre progressivamente até a amplitude cheia na direita, então nenhum
        trecho repete o anterior.
     2. Harmônico secundário — soma uma segunda onda de frequência quebrada
        (2.3x) e fase deslocada, o que dessincroniza as cristas e tira o ar
        mecânico. Normalizado por (1 + HARMONIC) para que o desvio máximo
        continue <= amplitude, requisito para a fita cobrir a borda da imagem.

     Amostragem + Catmull-Rom convertido em cúbicas: com amplitude variável,
     as meias-ondas em Bézier fixa deixariam de ter tangente contínua nas
     emendas (dobra visível). Interpolar pontos amostrados resolve isso. */
  /* Envelope oscilante em vez de rampa: a rampa monotônica anterior saía de
     30% na esquerda, deixando o primeiro terço quase reto. Agora a amplitude
     varia suavemente entre ~80% e 100% ao longo da largura — some a área
     plana, mas mantém variação para não virar senoide uniforme. */
  const ENVELOPE_BASE = 0.9;
  const ENVELOPE_SWING = 0.1;   // faixa efetiva: 0.80 .. 1.00
  const ENVELOPE_FREQ = 0.7;    // menos de um ciclo na largura: variação lenta
  const ENVELOPE_PHASE = -Math.PI / 2; // começa no piso (80%), subindo

  const HARMONIC = 0.16;        // leve: varia as cristas sem competir com a onda
  const HARMONIC_FREQ = 2.3;    // não inteiro: evita repetição mecânica
  const HARMONIC_PHASE = 0.9;

  function waveAt(angle) {
    return (
      Math.sin(angle) +
      HARMONIC * Math.sin(angle * HARMONIC_FREQ + HARMONIC_PHASE)
    );
  }

  /* Pico real da soma das duas ondas. Como a frequência do harmônico não é
     inteira, a soma não é periódica em 2π — daí varrer várias voltas. Divide
     pelo pico medido (e não por 1+HARMONIC, que é o teto teórico) para que
     as cristas atinjam a amplitude cheia em vez de ficarem subaproveitadas. */
  const WAVE_PEAK = (function () {
    const samples = 4000;
    const span = Math.PI * 2 * 20;
    let peak = 0;
    for (let i = 0; i <= samples; i += 1) {
      peak = Math.max(peak, Math.abs(waveAt((i / samples) * span)));
    }
    return peak;
  })();

  function buildPath(width, midY, amplitude, cycles) {
    const period = width / cycles;
    const half = period / 2;
    // meia-onda extra de cada lado: a fita entra e sai da tela sem corte reto
    const startX = -half;
    const endX = width + half;

    function amplitudeAt(x) {
      const t = Math.min(Math.max(x / width, 0), 1);
      const envelope =
        ENVELOPE_BASE +
        ENVELOPE_SWING *
          Math.sin(2 * Math.PI * ENVELOPE_FREQ * t + ENVELOPE_PHASE);
      return amplitude * envelope;
    }

    function yAt(x) {
      const angle = (x * 2 * Math.PI) / period;
      return midY + (amplitudeAt(x) * waveAt(angle)) / WAVE_PEAK;
    }

    // 20 amostras por período ≈ 8.7 por ciclo do harmônico: densidade
    // suficiente para o Catmull-Rom reproduzir a curva sem achatar cristas
    const step = period / 20;
    const points = [];
    for (let x = startX - step; x <= endX + step + 0.001; x += step) {
      points.push({ x, y: yAt(x) });
    }

    let d = `M${points[1].x.toFixed(2)},${points[1].y.toFixed(2)}`;
    for (let i = 1; i < points.length - 2; i += 1) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2];
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)}`;
      d += ` ${c2x.toFixed(2)},${c2y.toFixed(2)}`;
      d += ` ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
    }
    return d;
  }

  // Mede o avanço horizontal de um grupo — independe do path, então basta
  // um <text> solto e escondido com a mesma tipografia.
  function measureGroup() {
    const probe = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    probe.setAttribute('class', 'ticker-text');
    probe.setAttribute('visibility', 'hidden');
    probe.textContent = GROUP;
    svg.appendChild(probe);
    const length = probe.getComputedTextLength();
    svg.removeChild(probe);
    return length;
  }

  function layout() {
    const width = svg.getBoundingClientRect().width;
    if (!width) return;

    const thickness = cssNumber('--band-thickness', 56);
    const amplitude = cssNumber('--band-amplitude', 26);
    const cycles = cssNumber('--band-cycles', 2.5);
    const height = amplitude * 2 + thickness;
    const midY = height / 2;

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.height = `${height}px`;

    const d = buildPath(width, midY, amplitude, cycles);
    trackPath.setAttribute('d', d);
    ribbon.setAttribute('d', d);

    groupLength = measureGroup();
    if (!groupLength) return;

    // Repete o suficiente para cobrir o trilho inteiro mais uma volta,
    // garantindo que nunca sobre um vão ao final do ciclo.
    const pathLength = trackPath.getTotalLength();
    const copies = Math.ceil((pathLength + groupLength) / groupLength) + 1;
    textPath.textContent = GROUP.repeat(copies);

    offset %= groupLength;
    textPath.setAttribute('startOffset', offset.toFixed(2));
  }

  function render(timestamp) {
    if (motionQuery.matches || document.hidden || !groupLength) {
      frame = 0;
      return;
    }

    if (lastTimestamp !== null) {
      const elapsed = Math.min(timestamp - lastTimestamp, 100);
      offset -= (elapsed * SPEED) / 1000;
      // Como o conteúdo se repete a cada grupo, voltar um grupo inteiro é
      // visualmente idêntico — o loop fecha sem salto perceptível.
      if (offset <= -groupLength) offset += groupLength;
      textPath.setAttribute('startOffset', offset.toFixed(2));
    }
    lastTimestamp = timestamp;
    frame = requestAnimationFrame(render);
  }

  function start() {
    if (motionQuery.matches || frame || document.hidden) return;
    lastTimestamp = null;
    frame = requestAnimationFrame(render);
  }

  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTimestamp = null;
  }

  function syncMotionPreference() {
    if (motionQuery.matches) {
      stop();
      offset = 0;
      textPath.setAttribute('startOffset', '0');
    } else {
      start();
    }
  }

  function initialize() {
    layout();
    syncMotionPreference();

    /* ResizeObserver em vez de só window.resize: se a página abrir numa aba
       em segundo plano, a largura chega como 0 e o layout sairia cedo, sem
       nunca redesenhar (aba oculta não dispara resize ao ser exibida).
       O observer avisa assim que o elemento ganha tamanho real. */
    if (typeof ResizeObserver === 'function') {
      let lastWidth = -1;
      const observer = new ResizeObserver((entries) => {
        const width = entries[0].contentRect.width;
        if (!width || width === lastWidth) return;
        lastWidth = width;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          layout();
          start();
        }, 120);
      });
      observer.observe(svg);
    }

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layout, 150);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stop();
        return;
      }
      /* Se a página carregou oculta, a largura veio 0 e nada foi desenhado —
         e o ResizeObserver não é entregue enquanto o documento está oculto.
         Ao voltar a ficar visível, refaz o layout antes de animar. */
      if (!groupLength) layout();
      start();
    });

    motionQuery.addEventListener('change', syncMotionPreference);
  }

  // Só mede depois das webfonts: largura de texto medida com fonte de
  // fallback desalinha o comprimento do grupo e trava o loop.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(initialize, initialize);
  } else if (document.readyState === 'complete') {
    initialize();
  } else {
    window.addEventListener('load', initialize, { once: true });
  }
})();
