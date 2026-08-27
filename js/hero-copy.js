(function () {
  const rotatingWord = document.getElementById('hero-rotating-word');
  const typingSlot = document.getElementById('hero-typing-slot');
  if (!rotatingWord || !typingSlot) return;

  const words = ['tranquilidade', 'cuidado', 'bem-estar', 'acolhimento'];
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) return;

  const DISPLAY_TIME = 2800;
  const DELETE_DELAY = 52;
  const TYPE_DELAY = 88;
  const WORD_GAP = 260;
  let current = 0;

  function schedule(callback, delay) {
    window.setTimeout(callback, delay);
  }

  function deleteLetter() {
    if (document.hidden) {
      schedule(deleteLetter, 500);
      return;
    }

    typingSlot.classList.add('is-typing');

    if (rotatingWord.textContent.length > 0) {
      rotatingWord.textContent = rotatingWord.textContent.slice(0, -1);
      schedule(deleteLetter, DELETE_DELAY);
      return;
    }

    current = (current + 1) % words.length;
    schedule(() => typeLetter(`${words[current]}.`, 0), WORD_GAP);
  }

  function typeLetter(word, letterIndex) {
    if (document.hidden) {
      schedule(() => typeLetter(word, letterIndex), 500);
      return;
    }

    rotatingWord.textContent = word.slice(0, letterIndex + 1);

    if (letterIndex + 1 < word.length) {
      schedule(() => typeLetter(word, letterIndex + 1), TYPE_DELAY);
      return;
    }

    typingSlot.classList.remove('is-typing');
    schedule(deleteLetter, DISPLAY_TIME);
  }

  schedule(deleteLetter, DISPLAY_TIME);
})();
