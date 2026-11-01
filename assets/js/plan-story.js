(() => {
  'use strict';

  const story = document.getElementById('your-protection-plan');
  if (!story) return;

  const stage = story.querySelector('.plan-stage');
  const film = story.querySelector('.plan-film');
  const motionButton = story.querySelector('.plan-motion-toggle');
  const header = document.querySelector('.site-header');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frameRequested = false;
  let headerHeight = 110;
  let sceneVisible = false;
  let backgroundEnabled = true;

  const clamp = (value) => Math.max(0, Math.min(1, value));
  const ease = (value) => value * value * (3 - 2 * value);

  // โหลด GIF เฉพาะขณะที่ฉากอยู่ใกล้จอ และหยุดเมื่อออกจากฉาก/แท็บ
  function updateBackground() {
    const playing = sceneVisible && backgroundEnabled && !reducedMotion.matches && !document.hidden;
    if (playing) {
      if (!film.getAttribute('src')) film.src = film.dataset.src;
      film.hidden = false;
    } else {
      film.hidden = true;
      film.removeAttribute('src');
    }
  }

  // ระยะเลื่อนควบคุมการเข้าจากขวาและการเฟดพื้นหลัง ย้อนกลับได้
  function render() {
    frameRequested = false;
    if (reducedMotion.matches) return;

    const distance = Math.max(1, story.offsetHeight - stage.offsetHeight);
    const progress = clamp((headerHeight - story.getBoundingClientRect().top) / distance);
    const entry = ease(clamp((progress - 0.06) / 0.66));
    const fade = ease(clamp((progress - 0.02) / 0.5));

    story.style.setProperty('--plan-shift', `${((1 - entry) * 125).toFixed(2)}%`);
    story.style.setProperty('--plan-character', clamp(entry * 2).toFixed(4));
    story.style.setProperty('--plan-background', fade.toFixed(4));
    story.dataset.progress = progress.toFixed(3);
  }

  function requestRender() {
    if (frameRequested || reducedMotion.matches) return;
    frameRequested = true;
    window.requestAnimationFrame(render);
  }

  function resize() {
    headerHeight = Math.ceil(header?.getBoundingClientRect().height || 110);
    story.style.setProperty('--plan-top', `${headerHeight}px`);
    requestRender();
  }

  function setMotionPreference() {
    story.classList.toggle('is-reduced-motion', reducedMotion.matches);
    updateBackground();
    resize();
  }

  motionButton.hidden = false;
  motionButton.addEventListener('click', () => {
    backgroundEnabled = !backgroundEnabled;
    motionButton.textContent = backgroundEnabled
      ? 'ปิดพื้นหลังเคลื่อนไหว'
      : 'เปิดพื้นหลังเคลื่อนไหว';
    motionButton.setAttribute('aria-pressed', String(!backgroundEnabled));
    updateBackground();
  });

  story.classList.add('is-scroll-ready');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entry]) => {
        sceneVisible = entry.isIntersecting;
        updateBackground();
      },
      { rootMargin: '120px' }
    ).observe(story);
  } else {
    sceneVisible = true;
  }

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', updateBackground);
  reducedMotion.addEventListener('change', setMotionPreference);
  if (header && 'ResizeObserver' in window) new ResizeObserver(resize).observe(header);
  setMotionPreference();
})();
