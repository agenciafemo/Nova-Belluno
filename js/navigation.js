(function () {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('menu-toggle');
  const mobileNavigation = document.getElementById('mobile-navigation');
  const servicesToggle = document.getElementById('services-menu-toggle');
  const servicesMenu = document.getElementById('services-menu');
  const mobileServicesToggle = document.getElementById('mobile-services-menu-toggle');
  const mobileServicesMenu = document.getElementById('mobile-services-menu');
  const logo = header?.querySelector('.site-header__logo');
  const year = document.getElementById('footer-year');

  if (year) year.textContent = String(new Date().getFullYear());
  if (!header || !toggle || !mobileNavigation) return;

  const mobileQuery = window.matchMedia('(max-width: 959px)');
  const navigationLinks = Array.from(header.querySelectorAll(
    '.site-header__nav a[href^="#"]:not([href="#top"]), ' +
    '.site-header__mobile-nav a[href^="#"]:not([href="#top"])'
  ));
  const sectionIds = ['modalidades', 'servicos', 'quem-somos', 'unidades'];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function setMenu(open) {
    const shouldOpen = Boolean(open && mobileQuery.matches);

    header.classList.toggle('is-menu-open', shouldOpen);
    toggle.setAttribute('aria-expanded', String(shouldOpen));
    toggle.setAttribute('aria-label', shouldOpen ? 'Fechar menu' : 'Abrir menu');
    mobileNavigation.setAttribute('aria-hidden', String(!shouldOpen));
  }

  function setServicesMenu(menu, button, open) {
    if (!menu || !button) return;
    const shouldOpen = Boolean(open);
    button.setAttribute('aria-expanded', String(shouldOpen));
    menu.hidden = !shouldOpen;
  }

  function closeServicesMenus() {
    setServicesMenu(servicesMenu, servicesToggle, false);
    setServicesMenu(mobileServicesMenu, mobileServicesToggle, false);
  }

  servicesToggle?.addEventListener('click', () => {
    const open = servicesToggle.getAttribute('aria-expanded') !== 'true';
    setServicesMenu(servicesMenu, servicesToggle, open);
    setServicesMenu(mobileServicesMenu, mobileServicesToggle, false);
  });

  mobileServicesToggle?.addEventListener('click', () => {
    const open = mobileServicesToggle.getAttribute('aria-expanded') !== 'true';
    setServicesMenu(mobileServicesMenu, mobileServicesToggle, open);
  });

  servicesMenu?.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeServicesMenus();
  });

  mobileServicesMenu?.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      closeServicesMenus();
      setMenu(false);
    }
  });

  toggle.addEventListener('click', () => {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  mobileNavigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });

  logo?.addEventListener('click', () => {
    setMenu(false);
    closeServicesMenus();
  });

  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) {
      setMenu(false);
      closeServicesMenus();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    const serviceMenuOpen = servicesToggle?.getAttribute('aria-expanded') === 'true';
    const mobileServiceMenuOpen = mobileServicesToggle?.getAttribute('aria-expanded') === 'true';
    if (serviceMenuOpen || mobileServiceMenuOpen) {
      closeServicesMenus();
      const desktopVisible = servicesToggle && getComputedStyle(servicesToggle).display !== 'none';
      (desktopVisible ? servicesToggle : mobileServicesToggle)?.focus();
      return;
    }

    if (!header.classList.contains('is-menu-open')) return;

    setMenu(false);
    toggle.focus();
  });

  mobileQuery.addEventListener('change', () => {
    setMenu(false);
    closeServicesMenus();
  });

  let updateRequested = false;

  function updateActiveSection() {
    updateRequested = false;

    const marker = window.scrollY + window.innerHeight * 0.34;
    let activeId = '';

    sections.forEach((section) => {
      if (section.offsetTop <= marker) activeId = section.id;
    });

    navigationLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${activeId}`;

      if (isActive) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    if (window.scrollY <= 24) setMenu(false);
  }

  function requestActiveSectionUpdate() {
    if (updateRequested) return;
    updateRequested = true;
    requestAnimationFrame(updateActiveSection);
  }

  updateActiveSection();
  window.addEventListener('scroll', requestActiveSectionUpdate, { passive: true });
  window.addEventListener('resize', requestActiveSectionUpdate);
})();
