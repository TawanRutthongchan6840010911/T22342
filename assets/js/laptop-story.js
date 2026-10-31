(() => {
  'use strict';

  const story = document.getElementById('choose-protector');
  if (!story) return;

  const stage = story.querySelector('.story-stage');
  const header = document.querySelector('.site-header');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frameRequested = false;
  let headerHeight = 110;

  const clamp = (value) => Math.max(0, Math.min(1, value));
  const smoothStep = (value) => value * value * (3 - 2 * value);
  const between = (from, to, progress) => from + (to - from) * progress;

  // กำหนดจุดเริ่มและสิ้นสุดจากตำแหน่ง section จริง จึงเลื่อนย้อนกลับได้
  function render() {
    frameRequested = false;
    if (reducedMotion.matches) return;

    const distance = Math.max(1, story.offsetHeight - stage.offsetHeight);
    const progress = clamp((headerHeight - story.getBoundingClientRect().top) / distance);
    const opening = smoothStep(clamp((progress - 0.08) / 0.76));
    const screen = smoothStep(clamp((progress - 0.32) / 0.4));

    story.style.setProperty('--open-progress', progress.toFixed(4));
    story.style.setProperty('--lid-angle', `${between(-89, -4, opening).toFixed(2)}deg`);
    story.style.setProperty('--device-pitch', `${between(-28, -13, opening).toFixed(2)}deg`);
    story.style.setProperty('--device-yaw', `${between(-32, 0, opening).toFixed(2)}deg`);
    story.style.setProperty('--device-roll', `${between(-8, 0, opening).toFixed(2)}deg`);
    story.style.setProperty('--device-y-factor', between(-0.24, -0.05, opening).toFixed(4));
    story.style.setProperty('--device-scale', between(0.76, 0.88, opening).toFixed(4));
    story.style.setProperty('--screen-opacity', screen.toFixed(4));
    story.dataset.progress = progress.toFixed(3);
  }

  // อ่านตำแหน่งและอัปเดตภาพไม่เกินหนึ่งครั้งต่อเฟรม ไม่มี animation loop ขณะอยู่นิ่ง
  function requestRender() {
    if (frameRequested || reducedMotion.matches) return;
    frameRequested = true;
    window.requestAnimationFrame(render);
  }

  function resize() {
    headerHeight = Math.ceil(header?.getBoundingClientRect().height || 110);
    story.style.setProperty('--story-top', `${headerHeight}px`);
    requestRender();
  }

  function setMotionPreference() {
    story.classList.toggle('is-reduced-motion', reducedMotion.matches);
    resize();
  }

  story.classList.add('is-scroll-ready');
  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  reducedMotion.addEventListener('change', setMotionPreference);
  if (header && 'ResizeObserver' in window) new ResizeObserver(resize).observe(header);
  setMotionPreference();
})();
