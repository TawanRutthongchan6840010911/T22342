(() => {
  'use strict';
  // ข้อมูลโปรไฟล์จาก data.js และภาพเงาสำหรับช่องที่ยังไม่มีรูป
  const data = window.AEGIS_DATA;
  const silhouette =
    '<svg class="silhouette" viewBox="0 0 160 220" fill="currentColor" aria-hidden="true">' +
    '<path d="M80 17c-24 0-35 18-35 42 0 27 15 48 35 48s35-21 35-48c0-24-11-42-35-42Z"/>' +
    '<path d="m45 112 35 24 35-24 31 30 14 78H0l14-78Z"/>' +
    '<path d="m65 115 15 21 15-21-6 66-9 18-9-18Z" fill="#181a1c"/>' +
    '</svg>';
  const portrait = (id) =>
    '<div class="portrait"><span class="portrait-id">AG / ' +
    id +
    '</span><span class="portrait-plus" aria-hidden="true">+</span>' +
    silhouette +
    '<span class="portrait-label">PROFILE IMAGE / รอเพิ่มรูป</span></div>';
  const modalEl = document.getElementById('profileModal');
  const bookingEl = document.getElementById('bookingModal');
  let selectedGuard = null;
  let profileOpener = null;

  // กรองการ์ดตามประเภทบริการและอัปเดตจำนวนที่แสดง
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach((item) => {
        item.classList.remove('active');
        item.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
      let visible = 0;
      document.querySelectorAll('[data-category]').forEach((card) => {
        const show =
          button.dataset.filter === 'all' || card.dataset.category === button.dataset.filter;
        card.hidden = !show;
        if (show) visible++;
      });
      document.getElementById('resultsCount').textContent = 'แสดง ' + visible + ' โปรไฟล์ตัวอย่าง';
    });
  });

  // เปิดรายละเอียดของบอดี้การ์ดที่เลือก
  document.querySelectorAll('[data-profile]').forEach((button) => {
    button.addEventListener('click', () => {
      profileOpener = button;
      selectedGuard = data.guards.find((guard) => guard.id === button.dataset.profile);
      document.getElementById('profileTitle').textContent = selectedGuard.name;
      document.getElementById('profileVisual').innerHTML = portrait(selectedGuard.id);
      document.getElementById('profileCategory').textContent = selectedGuard.label;
      bootstrap.Modal.getOrCreateInstance(modalEl).show(button);
    });
  });

  // เปิดแบบฟอร์มทดลอง พร้อมโปรไฟล์และแพ็กเกจที่เลือก
  function openBooking(guard, plan, trigger) {
    document.getElementById('bookingForm').reset();
    document.getElementById('bookingFields').hidden = false;
    document.getElementById('bookingSuccess').hidden = true;
    document.getElementById('bookingGuard').value = guard || '';
    document.getElementById('bookingPlan').value = plan || 'personal';
    bootstrap.Modal.getOrCreateInstance(bookingEl).show(trigger);
  }

  // ปุ่มเลือกแพ็กเกจและปุ่มเลือกคนนี้
  document
    .querySelectorAll('[data-book]')
    .forEach((button) =>
      button.addEventListener('click', () => openBooking('', button.dataset.book, button))
    );
  document.getElementById('chooseGuard')?.addEventListener('click', () => {
    const guard = selectedGuard;
    modalEl.addEventListener(
      'hidden.bs.modal',
      () => openBooking(guard.id, guard.category, profileOpener),
      { once: true }
    );
    bootstrap.Modal.getOrCreateInstance(modalEl).hide();
  });

  // กำหนดวันที่เริ่มต้นเป็นวันนี้ตามเวลาในเครื่อง
  const dateInput = document.getElementById('bookingDate');
  function todayLocal() {
    const now = new Date();
    return (
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getDate()).padStart(2, '0')
    );
  }
  if (dateInput) dateInput.min = todayLocal();
  dateInput?.addEventListener('input', () => dateInput.setCustomValidity(''));

  // ตรวจแบบฟอร์มและแสดงสรุป โดยไม่ส่งข้อมูลออกจากหน้าเว็บ
  document.getElementById('bookingForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (dateInput.value < todayLocal()) {
      dateInput.setCustomValidity('กรุณาเลือกวันนี้หรือวันถัดไป');
      dateInput.reportValidity();
      return;
    }
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const guardId = document.getElementById('bookingGuard').value;
    const guard = data.guards.find((item) => item.id === guardId);
    const date = new Date(dateInput.value + 'T12:00:00').toLocaleDateString('th-TH', {
      dateStyle: 'long',
    });
    document.getElementById('bookingSummary').textContent =
      (guard ? guard.name : 'ให้ทีมช่วยเลือกบอดี้การ์ด') +
      ' · ' +
      data.plans[document.getElementById('bookingPlan').value] +
      ' · ' +
      date;
    document.getElementById('bookingFields').hidden = true;
    document.getElementById('bookingSuccess').hidden = false;
    document.getElementById('successHeading').focus();
  });
  // ชื่อหัวข้อเป็นลิงก์เปลี่ยนหน้า ส่วนลูกศรใช้เปิดแถบหัวข้อย่อย
  const navigationGroups = [...document.querySelectorAll('.nav-group')];
  let navigationCloseTimer;

  function closeNavigation() {
    clearTimeout(navigationCloseTimer);
    navigationGroups.forEach((group) => {
      group.querySelector('.nav-toggle').setAttribute('aria-expanded', 'false');
      group.querySelector('.nav-prism-panel').hidden = true;
    });
  }

  function openNavigation(group) {
    closeNavigation();
    group.querySelector('.nav-toggle').setAttribute('aria-expanded', 'true');
    group.querySelector('.nav-prism-panel').hidden = false;
  }

  navigationGroups.forEach((group) => {
    const trigger = group.querySelector('.nav-toggle');

    group.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse' && window.matchMedia('(min-width: 992px)').matches) {
        openNavigation(group);
      }
    });
    group.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'mouse') {
        navigationCloseTimer = setTimeout(() => {
          if (!group.contains(document.activeElement)) closeNavigation();
        }, 180);
      }
    });
    trigger.addEventListener('click', () => {
      if (trigger.getAttribute('aria-expanded') === 'true') closeNavigation();
      else openNavigation(group);
    });
    group.querySelector('.nav-heading').addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        openNavigation(group);
        group.querySelector('.nav-sub-link').focus();
      }
    });
    group.addEventListener('focusout', (event) => {
      if (!group.contains(event.relatedTarget) && !group.querySelector('.nav-prism-panel').hidden) {
        closeNavigation();
      }
    });
    group.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeNavigation();
        trigger.focus();
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav-group')) closeNavigation();
  });
  document
    .getElementById('mainNavigation')
    ?.addEventListener('hidden.bs.collapse', closeNavigation);
  window.matchMedia('(min-width: 992px)').addEventListener('change', closeNavigation);

  // พับเมนูมือถือหลังจากเลือกลิงก์ในเมนู
  document
    .querySelectorAll('.navbar-collapse .nav-sub-link, .navbar-collapse .nav-main')
    .forEach((link) =>
      link.addEventListener('click', () => {
        closeNavigation();
        const menu = document.getElementById('mainNavigation');
        if (menu?.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(menu).hide();
      })
    );

  // คืนตำแหน่งโฟกัสให้ปุ่มเดิมเมื่อปิดหน้าต่าง
  document.querySelectorAll('.modal').forEach((modal) => {
    let opener;
    modal.addEventListener('show.bs.modal', (event) => {
      opener = event.relatedTarget || document.activeElement;
    });
    modal.addEventListener('hidden.bs.modal', () => {
      if (!document.querySelector('.modal.show') && opener?.isConnected) opener.focus();
    });
  });
})();
