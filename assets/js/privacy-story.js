(() => {
  'use strict';

  const story = document.getElementById('privacy-first');
  if (!story) return;

  const stage = story.querySelector('.privacy-stage');
  const film = story.querySelector('.privacy-film');
  const motionButton = story.querySelector('.privacy-motion-toggle');
  const header = document.querySelector('.site-header');
  const markers = [...story.querySelectorAll('[data-pose-marker]')];
  const poseNumber = story.querySelector('[data-pose-number]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frameRequested = false;
  let headerHeight = 110;
  let sceneVisible = false;
  let backgroundEnabled = true;
  let currentPose = 0;

  const clamp = (value) => Math.max(0, Math.min(1, value));
  const ease = (value) => value * value * (3 - 2 * value);

  // GIF เป็นพื้นหลัง ส่วน Albert ใช้ภาพนิ่ง 3 เฟรม ไม่เล่น GIF ต้นฉบับ
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

  function showPoseNumber(index) {
    if (index === currentPose) return;
    currentPose = index;
    markers.forEach((marker, position) => marker.classList.toggle('is-active', position === index));
    poseNumber.textContent = `0${index + 1} / 03`;
  }

  function render() {
    frameRequested = false;
    if (reducedMotion.matches) return;

    const distance = Math.max(1, story.offsetHeight - stage.offsetHeight);
    const progress = clamp((headerHeight - story.getBoundingClientRect().top) / distance);
    const entry = ease(clamp((progress - 0.02) / 0.24));
    // ภาพแรกค้างให้อ่านก่อน แล้วละลายภาพ 1 → 2 และ 2 → 3 ตามระยะเลื่อน
    const secondPose = ease(clamp((progress - 0.34) / 0.12));
    const thirdPose = ease(clamp((progress - 0.64) / 0.12));

    story.style.setProperty('--privacy-shift', `${((1 - entry) * -115).toFixed(2)}%`);
    story.style.setProperty('--privacy-entry', clamp(entry * 1.4).toFixed(4));
    story.style.setProperty('--privacy-background', ease(clamp(progress / 0.38)).toFixed(4));
    story.style.setProperty('--privacy-pose-two', secondPose.toFixed(4));
    story.style.setProperty('--privacy-pose-three', thirdPose.toFixed(4));
    showPoseNumber(thirdPose >= 0.5 ? 2 : secondPose >= 0.5 ? 1 : 0);
    story.dataset.progress = progress.toFixed(3);
    story.dataset.pose = String(currentPose + 1);
  }

  function requestRender() {
    if (frameRequested || reducedMotion.matches) return;
    frameRequested = true;
    window.requestAnimationFrame(render);
  }

  function resize() {
    headerHeight = Math.ceil(header?.getBoundingClientRect().height || 110);
    story.style.setProperty('--privacy-top', `${headerHeight}px`);
    requestRender();
  }

  function setMotionPreference() {
    story.classList.toggle('is-reduced-motion', reducedMotion.matches);
    if (reducedMotion.matches) showPoseNumber(0);
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
