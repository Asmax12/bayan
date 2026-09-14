// كل جزء هنا محاط بفحص وجود العنصر، عشان لو عنصر اتشال بالغلط من الـ HTML
// الأجزاء التانية (المنيو، السلايدر، المودال) تفضل شغالة عادي.

// ===== Mobile menu =====
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", isOpen);
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ===== Header on scroll =====
const header = document.querySelector(".site-header");
if (header) {
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 20);
  });
}

// ===== Soft cursor glow on desktop =====
const glow = document.querySelector(".cursor-glow");
if (glow) {
  window.addEventListener("mousemove", e => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  });
}

// ===== Reveal animation =====
const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));
} else {
  // فallback: لو المتصفح مش بيدعم IntersectionObserver، اظهر المحتوى مباشرة
  revealEls.forEach(el => el.classList.add("visible"));
}

// ===== Before / After slider =====
const comparison = document.querySelector(".comparison");
const before = document.querySelector(".before");
const handle = document.querySelector(".compare-handle");

if (comparison && before && handle) {
  let dragging = false;
  let currentPercent = 50;

  function setSlider(percent) {
    currentPercent = Math.max(10, Math.min(90, percent));
    before.style.width = `${currentPercent}%`;
    handle.style.left = `${currentPercent}%`;
    handle.setAttribute("aria-valuenow", Math.round(currentPercent));
  }

  function moveSliderFromClientX(clientX) {
    const rect = comparison.getBoundingClientRect();
    const percent = ((clientX - rect.left) / rect.width) * 100;
    setSlider(percent);
  }

  handle.addEventListener("pointerdown", e => {
    dragging = true;
    handle.setPointerCapture(e.pointerId);
  });

  handle.addEventListener("pointermove", e => {
    if (dragging) moveSliderFromClientX(e.clientX);
  });

  handle.addEventListener("pointerup", () => (dragging = false));
  handle.addEventListener("pointercancel", () => (dragging = false));

  comparison.addEventListener("click", e => moveSliderFromClientX(e.clientX));

  // دعم لوحة المفاتيح: الأسهم اليمين/اليسار (والأعلى/الأسفل احتياطيًا) تحرك المقبض
  handle.addEventListener("keydown", e => {
    const step = e.shiftKey ? 10 : 5;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setSlider(currentPercent - step);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setSlider(currentPercent + step);
    } else if (e.key === "Home") {
      e.preventDefault();
      setSlider(10);
    } else if (e.key === "End") {
      e.preventDefault();
      setSlider(90);
    }
  });

  // ضبط القيمة الابتدائية
  setSlider(currentPercent);
}

// ===== Portfolio modal =====
const modal = document.querySelector(".modal");
const modalTitle = document.querySelector(".modal-title");
const modalDesc = document.querySelector(".modal-desc");
const modalDemo = document.querySelector(".modal-demo");
const modalClose = document.querySelector(".modal-close");
const modalBackdrop = document.querySelector(".modal-backdrop");
const viewProjectButtons = document.querySelectorAll(".view-project");

if (modal && modalTitle && modalDesc && modalDemo && modalClose) {
  let lastFocusedElement = null;

  const openModal = triggerButton => {
    lastFocusedElement = triggerButton;

    modalTitle.textContent = triggerButton.dataset.title || "";
    modalDesc.textContent = triggerButton.dataset.desc || "";

    // يعرض صورة النموذج الحقيقية بدل النص الوهمي
    if (triggerButton.dataset.img) {
      modalDemo.innerHTML = `<img class="modal-image" src="${triggerButton.dataset.img}" alt="${triggerButton.dataset.title || ""}">`;
    } else {
      modalDemo.innerHTML = `<span>نموذج ${triggerButton.dataset.title || ""}</span>`;
    }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    // نقل الفوكس جوه المودال عشان مستخدمي لوحة المفاتيح وقارئ الشاشة
    modalClose.focus();
  };

  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");

    // إرجاع الفوكس لنفس الزرار اللي فتح المودال
    if (lastFocusedElement) lastFocusedElement.focus();
  };

  viewProjectButtons.forEach(button => {
    button.addEventListener("click", () => openModal(button));
  });

  modalClose.addEventListener("click", closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener("click", closeModal);

  document.addEventListener("keydown", e => {
    if (!modal.classList.contains("open")) return;

    if (e.key === "Escape") {
      closeModal();
      return;
    }

    // حبس الفوكس (focus trap) بسيط داخل المودال أثناء فتحه
    if (e.key === "Tab") {
      const focusable = modal.querySelectorAll(
        'button, a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
