(() => {
  "use strict";
  const data = window.AEGIS_DATA;
  const escapeHtml = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  const portrait = (id) => {
    const guard = data.guards.find((item) => item.id === id);
    const atlas = /#(?:agent-|extra-|specialist-|guard-)/.test(
      guard.image || "",
    );
    const image =
      '<img src="' +
      escapeHtml(guard.image) +
      '" alt="' +
      escapeHtml(guard.name) +
      '" loading="lazy" width="512" height="768" />';
    const content = guard.easterEgg
      ? '<button type="button" class="kaito-portrait-trigger" data-kaito-egg aria-label="ภาพ ' +
        escapeHtml(guard.name) +
        '">' +
        image +
        "</button>"
      : image;
    return (
      '<div class="portrait character-portrait' +
      (atlas ? "" : " single-portrait") +
      (guard.easterEgg ? " kaito-portrait" : "") +
      '">' +
      content +
      "</div>"
    );
  };
  const modalEl = document.getElementById("profileModal");
  const bookingEl = document.getElementById("bookingModal");
  let selectedGuard = null;
  let profileOpener = null;
  let profileReady = false;
  modalEl?.addEventListener("show.bs.modal", () => {
    profileReady = false;
  });
  modalEl?.addEventListener("shown.bs.modal", () => {
    profileReady = true;
  });

  // เพิ่มคนใน data.js แล้วการ์ดและตัวเลือกในแบบฟอร์มจะเพิ่มตามอัตโนมัติ
  const guardSelect = document.getElementById("bookingGuard");
  if (guardSelect) {
    while (guardSelect.options.length > 1) guardSelect.remove(1);
    data.guards.forEach((guard) =>
      guardSelect.add(new Option(guard.name, guard.id)),
    );
  }

  const guardGrid = document.getElementById("guardGrid");
  if (guardGrid) {
    guardGrid.innerHTML = data.guards
      .map(
        (guard) => `
      <div class="col-12 col-md-6 col-lg-4" data-category="${escapeHtml(guard.category)}">
        <article class="guard-card">
          ${portrait(guard.id)}
          <div class="guard-body">
            <span class="chip">${escapeHtml(guard.label)}</span>
            <h3>${escapeHtml(guard.name)}</h3>
            <p>${escapeHtml(guard.specialty)}</p>
            <div class="guard-bottom">
              <button type="button" data-profile="${escapeHtml(guard.id)}" aria-label="ดูโปรไฟล์ ${escapeHtml(guard.name)}">ดูโปรไฟล์ &nbsp; <span class="arrow" aria-hidden="true">↗</span></button>
            </div>
          </div>
        </article>
      </div>`,
      )
      .join("");

    // กรองก่อนแบ่งเป็นชุดละ 9 คน และกลับชุดแรกทุกครั้งที่เปลี่ยนตัวกรอง
    const pageSize = 9;
    const cards = [...guardGrid.querySelectorAll("[data-category]")];
    const previous = document.getElementById("guardsPrevious");
    const next = document.getElementById("guardsNext");
    const pagination = document.querySelector(".guard-pagination");
    let category = "all";
    let page = 1;

    function renderPage() {
      const matches = cards.filter(
        (card) => category === "all" || card.dataset.category === category,
      );
      const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
      page = Math.min(Math.max(page, 1), pageCount);
      const start = (page - 1) * pageSize;
      const visible = new Set(matches.slice(start, start + pageSize));
      cards.forEach((card) => {
        card.hidden = !visible.has(card);
      });
      document.getElementById("resultsCount").textContent = matches.length
        ? `แสดง ${start + 1}–${Math.min(start + pageSize, matches.length)} จาก ${matches.length} คน`
        : "ไม่พบบอดี้การ์ดในบริการนี้";
      document.getElementById("guardsPageStatus").textContent =
        `ชุดที่ ${page} / ${pageCount} · ชุดละ ${pageSize} คน`;
      previous.disabled = page === 1;
      next.disabled = page === pageCount;
      pagination.hidden = false;
    }

    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll("[data-filter]").forEach((item) => {
          item.classList.toggle("active", item === button);
          item.setAttribute("aria-pressed", String(item === button));
        });
        category = button.dataset.filter;
        page = 1;
        renderPage();
      });
    });

    function changePage(offset) {
      page += offset;
      renderPage();
      const header = document.querySelector(".site-header");
      const top =
        window.scrollY +
        guardGrid.getBoundingClientRect().top -
        (header?.offsetHeight || 0) -
        20;
      window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
    }
    previous.addEventListener("click", () => changePage(-1));
    next.addEventListener("click", () => changePage(1));
    renderPage();
  }

  // เปิดรายละเอียดของบอดี้การ์ดที่เลือก
  document.querySelectorAll("[data-profile]").forEach((button) => {
    button.addEventListener("click", () => {
      profileOpener = button;
      selectedGuard = data.guards.find(
        (guard) => guard.id === button.dataset.profile,
      );
      document.getElementById("profileTitle").textContent = selectedGuard.name;
      document.getElementById("profileVisual").innerHTML = portrait(
        selectedGuard.id,
      );
      document.getElementById("profileCategory").textContent =
        selectedGuard.label;
      document.getElementById("profileName").textContent = selectedGuard.name;
      document.getElementById("profileExperience").textContent =
        selectedGuard.experience;
      document.getElementById("profileArea").textContent = selectedGuard.area;
      document.getElementById("profilePrice").textContent =
        data.prices[selectedGuard.category];
      document.getElementById("profileSpecialty").textContent =
        selectedGuard.specialty;
      bootstrap.Modal.getOrCreateInstance(modalEl).show(button);
    });
  });

  // เปิดแบบฟอร์มทดลอง พร้อมโปรไฟล์และแพ็กเกจที่เลือก
  function openBooking(guard, plan, trigger) {
    document.getElementById("bookingForm").reset();
    document.getElementById("bookingFields").hidden = false;
    document.getElementById("bookingSuccess").hidden = true;
    document.getElementById("bookingGuard").value = guard || "";
    document.getElementById("bookingPlan").value = plan || "personal";
    bootstrap.Modal.getOrCreateInstance(bookingEl).show(trigger);
  }

  // ปุ่มเลือกแพ็กเกจและปุ่มเลือกคนนี้
  document
    .querySelectorAll("[data-book]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        openBooking("", button.dataset.book, button),
      ),
    );
  document.getElementById("chooseGuard")?.addEventListener("click", () => {
    const guard = selectedGuard;
    modalEl.addEventListener(
      "hidden.bs.modal",
      () => openBooking(guard.id, guard.category, profileOpener),
      { once: true },
    );
    // รอหน้าต่างเปิดเสร็จก่อนปิด กรณีกดเลือกอย่างรวดเร็ว
    const hideProfile = () =>
      bootstrap.Modal.getOrCreateInstance(modalEl).hide();
    if (profileReady) hideProfile();
    else
      modalEl.addEventListener("shown.bs.modal", hideProfile, { once: true });
  });

  // กำหนดวันที่เริ่มต้นเป็นวันนี้ตามเวลาในเครื่อง
  const dateInput = document.getElementById("bookingDate");
  function todayLocal() {
    const now = new Date();
    return (
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0")
    );
  }
  if (dateInput) dateInput.min = todayLocal();
  dateInput?.addEventListener("input", () => dateInput.setCustomValidity(""));

  // ตรวจแบบฟอร์มและแสดงสรุป โดยไม่ส่งข้อมูลออกจากหน้าเว็บ
  document
    .getElementById("bookingForm")
    ?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (dateInput.value < todayLocal()) {
        dateInput.setCustomValidity("กรุณาเลือกวันนี้หรือวันถัดไป");
        dateInput.reportValidity();
        return;
      }
      const form = event.currentTarget;
      if (!form.reportValidity()) return;
      const guardId = document.getElementById("bookingGuard").value;
      const guard = data.guards.find((item) => item.id === guardId);
      const date = new Date(dateInput.value + "T12:00:00").toLocaleDateString(
        "th-TH",
        {
          dateStyle: "long",
        },
      );
      document.getElementById("bookingSummary").textContent =
        (guard ? guard.name : "ให้ทีมช่วยเลือกบอดี้การ์ด") +
        " · " +
        data.plans[document.getElementById("bookingPlan").value] +
        " · " +
        date;
      document.getElementById("bookingFields").hidden = true;
      document.getElementById("bookingSuccess").hidden = false;
      document.getElementById("successHeading").focus();
    });
  // ชื่อหัวข้อเป็นลิงก์เปลี่ยนหน้า ส่วนลูกศรใช้เปิดแถบหัวข้อย่อย
  const navigationGroups = [...document.querySelectorAll(".nav-group")];
  let navigationCloseTimer;

  function closeNavigation() {
    clearTimeout(navigationCloseTimer);
    navigationGroups.forEach((group) => {
      group.querySelector(".nav-toggle").setAttribute("aria-expanded", "false");
      group.querySelector(".nav-prism-panel").hidden = true;
    });
  }

  function openNavigation(group) {
    closeNavigation();
    group.querySelector(".nav-toggle").setAttribute("aria-expanded", "true");
    group.querySelector(".nav-prism-panel").hidden = false;
  }

  navigationGroups.forEach((group) => {
    const trigger = group.querySelector(".nav-toggle");

    group.addEventListener("pointerenter", (event) => {
      if (
        event.pointerType === "mouse" &&
        window.matchMedia("(min-width: 992px)").matches
      ) {
        openNavigation(group);
      }
    });
    group.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "mouse") {
        navigationCloseTimer = setTimeout(() => {
          if (!group.contains(document.activeElement)) closeNavigation();
        }, 180);
      }
    });
    trigger.addEventListener("click", () => {
      if (trigger.getAttribute("aria-expanded") === "true") closeNavigation();
      else openNavigation(group);
    });
    group.querySelector(".nav-heading").addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        openNavigation(group);
        group.querySelector(".nav-sub-link").focus();
      }
    });
    group.addEventListener("focusout", (event) => {
      if (
        !group.contains(event.relatedTarget) &&
        !group.querySelector(".nav-prism-panel").hidden
      ) {
        closeNavigation();
      }
    });
    group.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeNavigation();
        trigger.focus();
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav-group")) closeNavigation();
  });
  document
    .getElementById("mainNavigation")
    ?.addEventListener("hidden.bs.collapse", closeNavigation);
  window
    .matchMedia("(min-width: 992px)")
    .addEventListener("change", closeNavigation);

  // พับเมนูมือถือหลังจากเลือกลิงก์ในเมนู
  document
    .querySelectorAll(
      ".navbar-collapse .nav-sub-link, .navbar-collapse .nav-main",
    )
    .forEach((link) =>
      link.addEventListener("click", () => {
        closeNavigation();
        const menu = document.getElementById("mainNavigation");
        if (menu?.classList.contains("show"))
          bootstrap.Collapse.getOrCreateInstance(menu).hide();
      }),
    );

  // คืนตำแหน่งโฟกัสให้ปุ่มเดิมเมื่อปิดหน้าต่าง
  document.querySelectorAll(".modal").forEach((modal) => {
    let opener;
    modal.addEventListener("show.bs.modal", (event) => {
      opener = event.relatedTarget || document.activeElement;
    });
    modal.addEventListener("hidden.bs.modal", () => {
      if (!document.querySelector(".modal.show") && opener?.isConnected)
        opener.focus();
    });
  });
})();
