/* FeelyTalk – shared components (no build step, light-DOM custom elements).
   <ft-icon name="video">      inline SVG icon (currentColor)
   <ft-nav current="home">     site header + mobile menu
   <ft-footer current="home">  site footer
   <ft-cta>                    "Ready to Find Your People?" store banner
   Edit once here → every page updates. */
(function () {
  const PAGES = [
    { id: 'home',   label: 'Home',         href: 'index.html' },
    { id: 'how',    label: 'How it Works', href: 'how-it-works.html' },
    { id: 'join',   label: 'Join Us',      href: 'join-us.html' },
    { id: 'safety', label: 'Safety',       href: 'safety.html' },
    { id: 'help',   label: 'Help / FAQ',   href: 'help.html' },
    { id: 'blog',   label: 'Blog',         href: 'blog.html' },
  ];

  /* ---------------------------------------------------------------- icons */
  const S = (d) => `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</g>`;
  const ICONS = {
    video: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h7A2.5 2.5 0 0 1 16 6.5v2.4l4.2-2.6c.6-.4 1.3 0 1.3.7v9.9c0 .7-.7 1.1-1.3.7L16 14.9v2.6a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 4 17.5z" transform="translate(-1 0)"/>',
    phone: '<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>',
    chat: '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/><g style="fill:var(--white)"><circle cx="8" cy="10" r="1.4"/><circle cx="12" cy="10" r="1.4"/><circle cx="16" cy="10" r="1.4"/></g>',
    'chat-round': '<path d="M12 2.5c-5.25 0-9.5 3.7-9.5 8.3 0 2.4 1.15 4.55 3 6.05-.1 1.45-.7 2.8-1.7 3.9 2.2-.1 4-.8 5.3-1.8.9.2 1.9.3 2.9.3 5.25 0 9.5-3.7 9.5-8.3S17.25 2.5 12 2.5z"/><g style="fill:var(--white)"><circle cx="8" cy="10.6" r="1.3"/><circle cx="12" cy="10.6" r="1.3"/><circle cx="16" cy="10.6" r="1.3"/></g>',
    'chat-outline': S('<path d="M21 11.5a8.4 8.4 0 0 1-9 8.2 9 9 0 0 1-3.2-.6L4 20.5l1.4-4.2A8 8 0 0 1 3.5 11.5C3.5 7 7.3 3.5 12 3.5s9 3.5 9 8z"/><circle cx="8.5" cy="11.5" r=".6"/><circle cx="12" cy="11.5" r=".6"/><circle cx="15.5" cy="11.5" r=".6"/>'),
    bolt: '<path d="M13.6 1.5 4.2 13.2c-.4.5-.1 1.3.6 1.3H10l-1.6 8c-.1.7.8 1 1.2.5l9.5-12c.4-.5.1-1.3-.6-1.3H14l1.2-7.7c.1-.7-.9-.9-1.6-.5z"/>',
    heart: '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',
    'heart-outline': S('<path d="M12 20.2l-1.1-1C6 14.9 3 12.2 3 8.9 3 6.4 5 4.5 7.4 4.5c1.8 0 3.5.9 4.6 2.3 1.1-1.4 2.8-2.3 4.6-2.3C19 4.5 21 6.4 21 8.9c0 3.3-3 6-7.9 10.3z"/>'),
    group: '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>',
    users3: '<circle cx="12" cy="6.2" r="3.1"/><path d="M12 10.8c-3.1 0-5.4 1.9-5.4 4.2v1.6h10.8V15c0-2.3-2.3-4.2-5.4-4.2z"/><circle cx="4.8" cy="9.2" r="2.3"/><path d="M4.8 12.2C2.9 12.2 1 13.4 1 15v1.6h4.2V15c0-1 .4-1.9 1.1-2.6-.4-.1-.9-.2-1.5-.2z"/><circle cx="19.2" cy="9.2" r="2.3"/><path d="M19.2 12.2c-.6 0-1.1.1-1.5.2.7.7 1.1 1.6 1.1 2.6v1.6H23V15c0-1.6-1.9-2.8-3.8-2.8z"/>',
    user: '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>',
    search: S('<circle cx="10.5" cy="10.5" r="6.5" stroke-width="2.6"/><path d="m15.5 15.5 5 5" stroke-width="2.8"/>'),
    shield: '<path d="M12 1.5 3.5 5v6.2c0 5.2 3.6 9.9 8.5 11.3 4.9-1.4 8.5-6.1 8.5-11.3V5z"/><path d="M12.6 7.2c-2.8.3-4.6 2.5-4.4 5 .1 1.3.8 2.6 2 3.4 0-2.4 1.3-4.8 3.6-5.9-1.1.2-2.1.9-2.8 1.8.2-1.5 1-3 2.3-3.9z" style="fill:var(--white)"/>',
    'shield-check': '<path d="M12 1.5 3.5 5v6.2c0 5.2 3.6 9.9 8.5 11.3 4.9-1.4 8.5-6.1 8.5-11.3V5z"/><path d="m8.2 12 2.6 2.6 5-5.2" fill="none" style="stroke:var(--white)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    lock: '<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>',
    flag: '<path d="M5 2.5h1.8l.4 1.5H20l-2.2 5 2.2 5H8v7.5H5z"/>',
    sparkle: '<path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    download: S('<path d="M12 4v11"/><path d="m7.5 10.8 4.5 4.5 4.5-4.5"/><path d="M5 19.5h14"/>'),
    'arrow-left': S('<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>'),
    'arrow-right': S('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>'),
    'play-circle': '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10 8l6 4-6 4z"/>',
    menu: S('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    close: S('<path d="M6 6l12 12M18 6 6 18"/>'),
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    wave: '<g stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 10.5v3"/></g>',
    music: '<path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/>',
    gamepad: '<path d="M7 6h10a5 5 0 0 1 4.9 6l-.7 4.1a3 3 0 0 1-5.2 1.4L15 16.5H9l-1 1A3 3 0 0 1 2.8 16.1L2.1 12A5 5 0 0 1 7 6z"/><path d="M7.5 9v4M5.5 11h4" style="stroke:var(--white)" stroke-width="1.6" stroke-linecap="round" fill="none"/><circle cx="16" cy="10" r="1.1" style="fill:var(--white)"/><circle cx="18.2" cy="12.2" r="1.1" style="fill:var(--white)"/>',
    movie: '<path d="M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M4 4.6 19.6 3l.7 3.6L4.7 8.2z"/>',
    dots: '<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>',
    'edit-square': '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="m8 16 .6-3 5.6-5.6 2.4 2.4L11 15.4z" style="fill:var(--white)"/>',
    'play-filled': '<circle cx="12" cy="12" r="11"/><path d="M10 7.8v8.4l6.6-4.2z" style="fill:var(--white)"/>',
    plus: S('<path d="M12 5v14M5 12h14"/>'),
    mail: S('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>'),
    clock: S('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    chevron: S('<path d="m6 9 6 6 6-6"/>'),
    block: S('<circle cx="12" cy="12" r="9"/><path d="m6 6 12 12"/>'),
    mute: '<path d="M3 10v4h4l5 4V6L7 10z"/><path d="m16 9 5 6M21 9l-5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    gear: '<path d="M19.4 13a7.5 7.5 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-1.7-1L15 3.5h-4L10.7 6a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.4L4.6 11a7.5 7.5 0 0 0 0 2l-2 1.6 2 3.4 2.4-1c.5.4 1.1.7 1.7 1L11 20.5h4l.3-2.5c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.4zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="3"/><rect x="2.5" y="9" width="19" height="2.6" style="fill:var(--white)"/>',
    warning: '<path d="M12 3.2 22 20.5H2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v4.5M12 17.4v.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    doc: '<path d="M6 2.5h8l5 5V21a.5.5 0 0 1-.5.5h-12A.5.5 0 0 1 6 21z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 13h6M9 17h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    megaphone: '<path d="M3 10v4a1 1 0 0 0 1 1h2l5 4V5L6 9H4a1 1 0 0 0-1 1z"/><path d="M15 9.5a4 4 0 0 1 0 5M17.5 7a7.5 7.5 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    ban: S('<circle cx="12" cy="12" r="9"/><path d="m5.7 5.7 12.6 12.6"/>'),
    'eye-off': S('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="m4 4 16 16"/>'),
    instagram: S('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r=".6" fill="currentColor"/>'),
    twitter: '<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>',
    youtube: '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>',
    discord: '<path d="M20.317 4.37a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.74 19.74 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.1 13.1 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 01.078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.079.009c.12.1.246.198.373.293a.077.077 0 01-.006.127 12.3 12.3 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"/>',
    'google-play': '<path fill="#00A0FF" d="M3.6 1.9 13.7 12 3.6 22.1c-.2-.2-.3-.5-.3-.9V2.8c0-.4.1-.7.3-.9z"/><path fill="#00E676" d="M3.6 1.9c.3-.2.7-.2 1.2.1L17 9l-3.3 3z"/><path fill="#FFD500" d="m17 9 3.4 2c.6.4.6 1.6 0 2L17 15l-3.3-3z"/><path fill="#FF3A44" d="m13.7 12 3.3 3-12.2 7c-.5.3-.9.3-1.2.1z"/>',
    apple: '<path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>',
  };

  class FtIcon extends HTMLElement {
    connectedCallback() {
      const body = ICONS[this.getAttribute('name')];
      if (!body) return;
      this.setAttribute('aria-hidden', 'true');
      this.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" focusable="false">${body}</svg>`;
    }
  }
  customElements.define('ft-icon', FtIcon);

  /* ----------------------------------------------------------------- nav */
  // EDIT: replace both values with your real app-download URL (or app-store landing page).
  // Pages that have the store-badge banner (Home, How it Works) jump to it; the other pages jump to Home's banner.
  const DL = document.querySelector('ft-cta') ? '#download' : 'index.html#download';
  const LOGO = (cls = '') => `<img class="brand-logo ${cls}" src="assets/logo-trimmed.png" alt="FeelyTalk – Your Talking Partner" width="149" height="48" decoding="async">`;

  class FtNav extends HTMLElement {
    connectedCallback() {
      const cur = this.getAttribute('current');
      const link = (p, cls) => `<a href="${p.href}" class="${cls}"${p.id === cur ? ' aria-current="page"' : ''}>${p.label}</a>`;
      this.innerHTML = `
      <header class="site-header">
        <div class="container-ft bar flex items-center justify-between gap-6">
          <a href="index.html" aria-label="FeelyTalk – home" class="shrink-0">${LOGO()}</a>
          <nav aria-label="Primary" class="hidden lg:flex flex-1 justify-center gap-6 xl:gap-8">
            ${PAGES.map((p) => link(p, 'nav-link')).join('')}
          </nav>
          <a href="${DL}" class="btn btn-primary hidden lg:inline-flex">Download App <ft-icon name="download"></ft-icon></a>
          <button type="button" class="menu-btn lg:hidden" aria-expanded="false" aria-controls="ft-mobile-menu" aria-label="Open menu">
            <ft-icon name="menu" class="w-6 h-6"></ft-icon>
          </button>
        </div>
        <div id="ft-mobile-menu" class="menu-panel" role="dialog" aria-modal="true" aria-label="Menu" hidden>
          <div class="flex items-center justify-between" style="height:var(--nav-h)">
            <a href="index.html" aria-label="FeelyTalk – home">${LOGO()}</a>
            <button type="button" class="menu-btn" data-close aria-label="Close menu"><ft-icon name="close" class="w-6 h-6"></ft-icon></button>
          </div>
          <nav aria-label="Mobile" class="flex flex-col mt-2">
            ${PAGES.map((p) => link(p, 'nav-link')).join('')}
          </nav>
          <a href="${DL}" class="btn btn-primary btn-block mt-8">Download App <ft-icon name="download"></ft-icon></a>
        </div>
      </header>`;
      const open = this.querySelector('.menu-btn[aria-controls]');
      const menu = this.querySelector('#ft-mobile-menu');
      const set = (isOpen) => {
        menu.hidden = !isOpen;
        open.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('menu-open', isOpen);
        if (isOpen) menu.querySelector('[data-close]').focus(); else open.focus();
      };
      open.addEventListener('click', () => set(true));
      menu.querySelector('[data-close]').addEventListener('click', () => set(false));
      menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) set(false); });
      matchMedia('(min-width: 1024px)').addEventListener('change', (m) => { if (m.matches && !menu.hidden) set(false); });
    }
  }
  customElements.define('ft-nav', FtNav);

  /* -------------------------------------------------------------- footer */
  const FOOT = {
    Product: [
      ['home', 'Home', 'index.html'], ['how', 'How it Works', 'how-it-works.html'], ['join', 'Join Us', 'join-us.html'],
      ['safety', 'Safety', 'safety.html'], ['help', 'Help / FAQ', 'help.html'], ['blog', 'Blog', 'blog.html'],
      ['', 'Download App', DL],
    ],
    Company: [['', 'About Us', '#'], ['blog', 'Blog', 'blog.html'], ['', 'Careers', '#'], ['', 'Contact Us', 'help.html#support']],
    Support: [['help', 'Help / FAQ', 'help.html'], ['', 'Community Guidelines', 'safety.html#rules'], ['', 'Terms of Service', '#'], ['', 'Privacy Policy', '#']],
  };
  class FtFooter extends HTMLElement {
    connectedCallback() {
      const cur = this.getAttribute('current');
      const col = (title) => `
        <div>
          <h2 class="foot-head">${title}</h2>
          <ul>${FOOT[title].map(([id, label, href]) =>
            `<li><a class="foot-link" href="${href}"${id && id === cur && title === 'Product' ? ' aria-current="page"' : ''}>${label}</a></li>`).join('')}</ul>
        </div>`;
      const social = (n, label) => `<a href="#" aria-label="${label}" class="social"><ft-icon name="${n}" class="w-5 h-5"></ft-icon></a>`;
      this.innerHTML = `
      <footer class="pt-14 pb-8">
        <div class="container-ft grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div class="sm:col-span-2 lg:col-span-1">
            <a href="index.html" aria-label="FeelyTalk – home">${LOGO()}</a>
            <div class="flex gap-6 mt-5 pl-1">${social('instagram', 'Instagram')}${social('twitter', 'Twitter')}${social('youtube', 'YouTube')}${social('discord', 'Discord')}</div>
          </div>
          ${col('Product')}${col('Company')}${col('Support')}
        </div>
        <div class="container-ft mt-10 flex flex-wrap items-center justify-between gap-3 text-[14px] text-muted">
          <p class="m-0">© 2024 FeelyTalk. All rights reserved.</p>
          <p class="m-0 flex items-center gap-1.5">Made with <ft-icon name="heart" class="w-4 h-4 text-brand"></ft-icon> in India</p>
        </div>
      </footer>`;
    }
  }
  customElements.define('ft-footer', FtFooter);

  /* ------------------------------------------------------------ CTA band */
  class FtCta extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <section id="download" class="container-ft" aria-labelledby="cta-title">
        <div class="cta-band min-h-[260px] flex items-center justify-center text-center">
          <picture><source type="image/webp" srcset="assets/img/cta-banner-bg.webp"><img src="assets/img/cta-banner-bg.jpg" alt="" class="cta-bg" width="1352" height="268" loading="lazy" decoding="async"></picture>
          <div class="cta-shade lg:hidden"></div>
          <p class="hand hand-white absolute hidden xl:block text-[22px] -rotate-[10deg] text-left" style="right:48px;top:28px" aria-hidden="true">Good<br>Chats<br>Better<br>Days</p>
          <div class="relative px-6 py-10">
            <h2 id="cta-title" class="m-0 text-white font-extrabold text-[28px] lg:text-[32px] leading-tight">Ready to Find Your People?</h2>
            <p class="mx-auto mt-3 max-w-[440px] text-white text-[16px] leading-relaxed">Join FeelyTalk today and start real conversations with amazing hosts from all over India.</p>
            <div class="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#download" class="store-btn" aria-label="Get it on Google Play"><ft-icon name="google-play" class="w-7 h-7"></ft-icon><span><small>GET IT ON</small><strong>Google Play</strong></span></a>
              <a href="#download" class="store-btn" aria-label="Download on the App Store"><ft-icon name="apple" class="w-7 h-7"></ft-icon><span><small>Download on the</small><strong>App Store</strong></span></a>
            </div>
          </div>
        </div>
      </section>`;
    }
  }
  customElements.define('ft-cta', FtCta);
})();
