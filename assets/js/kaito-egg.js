(() => {
  "use strict";
  const dialog = document.createElement("dialog");
  dialog.className = "kaito-egg";
  dialog.setAttribute("aria-label", "ฉากลับของคุโระบะ ไคโตะ");
  dialog.innerHTML = `
    <button class="kaito-egg-close" type="button" aria-label="ปิดฉากลับ">×</button>
    <img class="kaito-egg-film" alt="ไคโตะปรากฏตัวท่ามกลางแสงจันทร์และไพ่" />`;
  document.body.append(dialog);
  const film = dialog.querySelector("img");
  const closeButton = dialog.querySelector("button");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let timer;
  let fadeTimer;
  let opener;
  let previousOverflow;

  function finish() {
    clearTimeout(timer);
    clearTimeout(fadeTimer);
    film.onload = null;
    film.onerror = null;
    film.removeAttribute("src");
    dialog.classList.remove("is-closing");
    document.body.style.overflow = previousOverflow;
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  }

  function closeScene() {
    if (!dialog.open || dialog.classList.contains("is-closing")) return;
    clearTimeout(timer);
    dialog.classList.add("is-closing");
    fadeTimer = window.setTimeout(
      () => dialog.close(),
      reducedMotion.matches ? 0 : 420,
    );
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-kaito-egg]");
    if (!trigger || dialog.open) return;
    opener = trigger;
    previousOverflow = document.body.style.overflow;
    // อยู่ภายในหน้าต่างเดิม เพื่อให้การควบคุมโฟกัสของ Bootstrap ทำงานร่วมกันได้
    (trigger.closest(".modal") || document.body).append(dialog);
    document.body.style.overflow = "hidden";
    dialog.showModal();
    closeButton.focus({ preventScroll: true });
    film.onload = () => {
      clearTimeout(timer);
      timer = window.setTimeout(closeScene, 5800);
    };
    film.onerror = closeScene;
    film.src = "assets/media/plan-background.gif?kaito=" + Date.now();
    // สำรองกรณีไฟล์โหลดช้าหรือไม่ตอบกลับ
    timer = window.setTimeout(closeScene, 15000);
  });

  closeButton.addEventListener("click", closeScene);
  // กัน Escape ไม่ให้ส่งต่อไปปิดหน้าต่างโปรไฟล์ด้านหลัง
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeScene();
    }
  });
  document.addEventListener("hidden.bs.modal", (event) => {
    if (dialog.open && event.target.contains(dialog)) {
      previousOverflow = document.body.style.overflow;
      dialog.close();
    }
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeScene();
  });
  dialog.addEventListener("close", finish);
})();
