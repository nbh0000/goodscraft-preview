(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* 사진: 캐시에서 이미 실패한 경우까지 빈 칸 표시 */
  $$('.shot img').forEach((img) => {
    if (img.complete && img.naturalWidth === 0) img.parentNode.classList.add('is-empty');
  });

  /* 모바일 드로어 */
  const drawer = $('#drawer');
  const openBtn = $('[data-drawer-open]');
  let lastFocus = null;
  const setDrawer = (open) => {
    drawer.classList.toggle('is-open', open);
    drawer.inert = !open;
    openBtn.setAttribute('aria-expanded', String(open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) {
      lastFocus = document.activeElement;
      $('.drawer__top button', drawer).focus();
    } else if (lastFocus) {
      lastFocus.focus({ preventScroll: true });
      lastFocus = null;
    }
  };
  openBtn.addEventListener('click', () => setDrawer(true));
  $$('[data-drawer-close]', drawer).forEach((el) => el.addEventListener('click', () => setDrawer(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) setDrawer(false);
  });
  matchMedia('(min-width: 900px)').addEventListener('change', (e) => { if (e.matches) setDrawer(false); });

  /* 갤러리 필터 + 모바일 스와이프 진행 표시 */
  const tabs = $('[data-tabs]');
  const tabsWrap = $('[data-tabs-wrap]');
  const gallery = $('[data-gallery]');
  const progress = $('[data-gallery-progress]');
  const items = $$('.gallery__item', gallery);

  const updateProgress = () => {
    const max = gallery.scrollWidth - gallery.clientWidth;
    const visible = items.filter((i) => !i.hidden).length;
    progress.classList.toggle('is-single', visible <= 1);
    const base = visible ? 1 / visible : 1;
    const p = max > 0 ? base + (1 - base) * (gallery.scrollLeft / max) : 1;
    progress.style.setProperty('--p', p.toFixed(3));
  };
  const updateTabsFade = () => {
    tabsWrap.classList.toggle('has-more', tabs.scrollWidth - tabs.clientWidth - tabs.scrollLeft > 4);
  };

  tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    $$('button', tabs).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    const cat = btn.dataset.filter;
    items.forEach((i) => { i.hidden = !(cat === 'all' || i.dataset.category === cat); });
    gallery.scrollLeft = 0;
    updateProgress();
  });

  let ticking = false;
  gallery.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateProgress(); ticking = false; });
  }, { passive: true });
  tabs.addEventListener('scroll', updateTabsFade, { passive: true });
  new ResizeObserver(() => { updateProgress(); updateTabsFade(); }).observe(gallery);

  /* 그래프: 화면에 들어올 때 한 번 */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.35 });
  $$('[data-inview]').forEach((el) => io.observe(el));

  /* 하단 고정 바: 신청 영역·모집 조건·푸터와 겹치면 숨김 */
  const bar = $('[data-bar]');
  const covered = new Set();
  const barIo = new IntersectionObserver((entries) => {
    entries.forEach((en) => { en.isIntersecting ? covered.add(en.target) : covered.delete(en.target); });
    const hide = covered.size > 0;
    bar.classList.toggle('is-hidden', hide);
    bar.inert = hide;
  }, { rootMargin: '0px 0px -12% 0px' });
  [$('.offer__panel'), $('#apply'), $('.site-footer')].forEach((el) => el && barIo.observe(el));

  /* 연락처 자동 하이픈 */
  const phone = $('#f-phone');
  phone.addEventListener('input', () => {
    let v = phone.value.replace(/[^0-9]/g, '');
    if (v.length > 3 && v.length <= 7) v = v.slice(0, 3) + '-' + v.slice(3);
    else if (v.length > 7) v = v.slice(0, 3) + '-' + v.slice(3, 7) + '-' + v.slice(7, 11);
    phone.value = v;
  });

  /* 신청 접수 */
  const form = $('#partner-form');
  const done = $('#success-modal');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    done.showModal();
    form.reset();
  });
  $('[data-done-close]').addEventListener('click', () => done.close());
  done.addEventListener('click', (e) => { if (e.target === done) done.close(); });
})();
