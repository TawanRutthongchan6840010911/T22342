(() => {
  'use strict';

  const hero = document.querySelector('.hero');
  const video = hero?.querySelector('.hero-video');
  const toggle = hero?.querySelector('.hero-video-toggle');
  if (!video || !toggle) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = reducedMotion.matches;
  let inView = true;

  // ปิดเสียงเสมอ เพื่อให้เล่นอัตโนมัติได้ทั้งคอมพิวเตอร์และมือถือ
  video.muted = true;
  toggle.hidden = false;

  function updateToggle() {
    toggle.textContent = userPaused ? 'เล่นวิดีโอ' : 'หยุดวิดีโอ';
    toggle.setAttribute('aria-pressed', String(userPaused));
  }

  // หยุดเมื่อเลื่อนพ้นฉากหรือเปลี่ยนแท็บ และเล่นต่อเมื่อกลับมา
  async function syncPlayback() {
    if (userPaused || !inView || document.hidden) {
      video.pause();
      return;
    }

    try {
      await video.play();
    } catch (error) {
      // หากเบราว์เซอร์ไม่อนุญาต autoplay ให้ผู้ชมกดเล่นเอง
      if (error.name === 'NotAllowedError' && inView && !document.hidden) {
        userPaused = true;
        updateToggle();
      }
    }
  }

  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    updateToggle();
    syncPlayback();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    }).observe(hero);
  }

  reducedMotion.addEventListener('change', () => {
    userPaused = reducedMotion.matches;
    updateToggle();
    syncPlayback();
  });
  document.addEventListener('visibilitychange', syncPlayback);

  updateToggle();
  syncPlayback();
})();
