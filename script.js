(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

  if (hasGsap && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ─── Hero sequence ─── */
  function initHero() {
    const sub = document.querySelector(".hero-sub");
    const actions = document.querySelector(".hero-actions");
    const photo = document.querySelector(".hero-photo-wrap");
    const photoFrame = document.querySelector(".hero-photo-frame");

    if (!hasGsap || prefersReducedMotion) {
      document.querySelectorAll(".hero-fade").forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    gsap.set([sub, actions], { opacity: 0, y: 24 });
    gsap.set(photo, { opacity: 0, y: 28, scale: 0.96 });

    const runHeroTail = () => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(sub, { opacity: 1, y: 0, duration: 0.65 })
        .to(actions, { opacity: 1, y: 0, duration: 0.55 }, "-=0.32")
        .to(photo, { opacity: 1, y: 0, scale: 1, duration: 0.85 }, "-=0.28");
    };

    if (typeof initSplitText === "function") {
      initSplitText({
        selector: "#hero-title",
        splitType: "words",
        delay: 55,
        duration: 1.1,
        ease: "power3.out",
        from: { opacity: 0, y: 32 },
        to: { opacity: 1, y: 0 },
        triggerOnScroll: false,
        highlightPhrases: [
          { phrase: "вайб", className: "split-word--vibe" },
          { phrase: "система", className: "split-word--system" }
        ],
        onComplete: runHeroTail
      });
    } else {
      runHeroTail();
    }

    if (photoFrame) {
      gsap.to(photoFrame, {
        y: -36,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.8
        }
      });
    }
  }

  /* ─── Scroll progress ─── */
  function initScrollProgress() {
    const bar = document.getElementById("scroll-progress");
    if (!bar || !hasGsap || prefersReducedMotion) return;

    gsap.fromTo(
      bar,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          start: 0,
          end: "max",
          scrub: 0.15
        }
      }
    );
  }

  /* ─── Nav scroll spy ─── */
  function initNavSpy() {
    const sections = [
      { id: "about" },
      { id: "skills" },
      { id: "projects" },
      { id: "contact" }
    ];
    const links = document.querySelectorAll('.nav a[href^="#"], .mobile-menu__nav a[href^="#"]');

    function setActive(id) {
      links.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
      });
    }

    if (!hasGsap || prefersReducedMotion) return;

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 45%",
        onToggle: (self) => {
          if (self.isActive) setActive(id);
        }
      });
    });
  }

  /* ─── Generic scroll reveals ─── */
  function initReveals() {
    const els = document.querySelectorAll(".reveal");

    if (prefersReducedMotion) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    if (!hasGsap) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      els.forEach((el) => observer.observe(el));
      return;
    }

    els.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true
          }
        }
      );
    });
  }

  /* ─── Stagger lists & grids ─── */
  function initStaggers() {
    const containers = document.querySelectorAll("[data-stagger]");

    if (prefersReducedMotion) return;

    containers.forEach((container) => {
      const items = Array.from(container.children);
      if (!items.length) return;

      if (!hasGsap) {
        items.forEach((item) => item.classList.add("is-visible"));
        return;
      }

      gsap.fromTo(
        items,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.07,
          scrollTrigger: {
            trigger: container,
            start: "top 84%",
            once: true
          }
        }
      );
    });
  }

  /* ─── Projects wipe ─── */
  function initProjects() {
    const projects = document.querySelectorAll(".project");
    if (!projects.length) return;

    if (prefersReducedMotion || !hasGsap) return;

    projects.forEach((project) => {
      const visual = project.querySelector(".project-visual");
      const info = project.querySelector(".project-info");
      if (!visual || !info) return;

      gsap.set(visual, { clipPath: "inset(100% 0 0 0)" });
      gsap.set(info, { opacity: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: project,
          start: "top 85%",
          once: true
        }
      });

      tl.to(visual, {
        clipPath: "inset(0% 0 0 0)",
        duration: 0.9,
        ease: "power3.inOut"
      }).to(
        info,
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: "power3.out"
        },
        "-=0.4"
      );
    });
  }

  /* ─── Steps: entrance + active state ─── */
  function initSteps() {
    const steps = document.querySelectorAll(".step");
    if (!steps.length) return;

    if (prefersReducedMotion || !hasGsap) return;

    gsap.fromTo(
      steps,
      { opacity: 0, x: -24 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: ".steps",
          start: "top 82%",
          once: true
        }
      }
    );

    steps.forEach((step) => {
      ScrollTrigger.create({
        trigger: step,
        start: "top 70%",
        end: "bottom 30%",
        onEnter: () => step.classList.add("is-active"),
        onEnterBack: () => step.classList.add("is-active"),
        onLeave: () => step.classList.remove("is-active"),
        onLeaveBack: () => step.classList.remove("is-active")
      });
    });
  }

  /* ─── Manifesto word reveal ─── */
  function initManifesto() {
    if (prefersReducedMotion || !hasGsap || typeof initSplitText !== "function") return;

    initSplitText({
      selector: "#manifesto-text",
      splitType: "words",
      delay: 45,
      duration: 0.85,
      ease: "power3.out",
      from: { opacity: 0, y: 18 },
      to: { opacity: 1, y: 0 },
      triggerOnScroll: true,
      highlightPhrases: [{ phrase: "энергия", className: "split-word--manifesto" }]
    });
  }

  /* ─── Magnetic CTA buttons (desktop) ─── */
  function initMagneticButtons() {
    if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

    document.querySelectorAll(".btn--primary:not([data-app-lightbox-open]), .header-cta").forEach((btn) => {
      const strength = 14;

      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, {
          x: (x / rect.width) * strength,
          y: (y / rect.height) * strength,
          duration: 0.35,
          ease: "power2.out"
        });
      });

      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
      });
    });
  }

  /* ─── App lightbox (Мой ритм) ─── */
  function initAppLightbox() {
    const modal = document.getElementById("app-lightbox");
    const project = document.querySelector("[data-app-lightbox]");
    if (!modal || !project) return;

    const openBtn = project.querySelector(".project-visual--open");
    const template = project.querySelector(".app-lightbox-images");
    const imgEl = modal.querySelector(".app-lightbox__img");
    const captionEl = modal.querySelector(".app-lightbox__caption");
    const dotsEl = modal.querySelector(".app-lightbox__dots");
    const closeBtn = modal.querySelector(".app-lightbox__close");
    const prevBtn = modal.querySelector(".app-lightbox__nav--prev");
    const nextBtn = modal.querySelector(".app-lightbox__nav--next");

    if (!openBtn || !template || !imgEl) return;

    const slideRoot = template.content || template;
    const slides = Array.from(slideRoot.querySelectorAll("[data-src]")).map((el) => ({
      src: el.dataset.src,
      alt: el.dataset.alt || ""
    }));
    if (!slides.length) return;

    let index = 0;

    function renderDots() {
      dotsEl.innerHTML = "";
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "app-lightbox__dot" + (i === index ? " is-active" : "");
        dot.setAttribute("aria-label", `Скриншот ${i + 1}`);
        dot.addEventListener("click", () => show(i));
        dotsEl.appendChild(dot);
      });
    }

    function show(i) {
      index = (i + slides.length) % slides.length;
      imgEl.src = slides[index].src;
      imgEl.alt = slides[index].alt;
      captionEl.textContent = slides[index].alt;
      renderDots();
    }

    function open(e) {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      show(0);
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
      closeBtn.focus();
    }

    function close() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
      openBtn.focus();
    }

    openBtn.addEventListener("click", open);
    project.querySelector("[data-app-lightbox-open]")?.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", () => show(index - 1));
    nextBtn.addEventListener("click", () => show(index + 1));

    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });

    document.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
  }

  /* ─── Init all motion ─── */
  initHero();
  initScrollProgress();
  initNavSpy();
  initReveals();
  initStaggers();
  initProjects();
  initSteps();
  initManifesto();
  initAppLightbox();
  if (hasGsap) initMagneticButtons();

  /* ─── Mobile menu ─── */
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileOverlay = document.getElementById("mobile-overlay");

  function closeMenu() {
    burger?.classList.remove("is-active");
    mobileMenu?.classList.remove("is-open");
    mobileOverlay?.classList.remove("is-visible");
    burger?.setAttribute("aria-expanded", "false");
    mobileMenu?.setAttribute("aria-hidden", "true");
    mobileOverlay?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  }

  function openMenu() {
    burger?.classList.add("is-active");
    mobileMenu?.classList.add("is-open");
    mobileOverlay?.classList.add("is-visible");
    burger?.setAttribute("aria-expanded", "true");
    mobileMenu?.setAttribute("aria-hidden", "false");
    mobileOverlay?.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
  }

  burger?.addEventListener("click", () => {
    if (mobileMenu?.classList.contains("is-open")) closeMenu();
    else openMenu();
  });

  mobileOverlay?.addEventListener("click", closeMenu);

  document.querySelectorAll(".mobile-menu__nav a, .mobile-menu__cta").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) closeMenu();
  });

  /* ─── Header on scroll ─── */
  const header = document.querySelector(".header");
  let ticking = false;

  function updateHeader() {
    if (window.scrollY > 60) {
      header.style.background = "rgba(7, 7, 12, 0.92)";
    } else {
      header.style.background = "rgba(7, 7, 12, 0.7)";
    }
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    },
    { passive: true }
  );

  /* ─── Smooth anchors ─── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      const offset =
        parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
})();
