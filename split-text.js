/**
 * Vanilla SplitText — адаптация React-компонента под статический HTML-сайт.
 */
(function (global) {
  "use strict";

  function splitText(el, splitType) {
    const text = el.textContent.trim();
    el.textContent = "";
    el.setAttribute("aria-label", text);

    if (splitType === "words" || splitType.includes("words")) {
      const words = text.split(/(\s+)/);
      words.forEach((part) => {
        if (/^\s+$/.test(part)) {
          el.appendChild(document.createTextNode(part));
        } else if (part) {
          const wrap = document.createElement("span");
          wrap.className = "split-word";
          wrap.setAttribute("aria-hidden", "true");
          wrap.textContent = part;
          el.appendChild(wrap);
        }
      });
      return el.querySelectorAll(".split-word");
    }

    const chars = [];
    for (const char of text) {
      const span = document.createElement("span");
      span.className = "split-char";
      span.setAttribute("aria-hidden", "true");
      span.textContent = char === " " ? "\u00A0" : char;
      el.appendChild(span);
      chars.push(span);
    }
    return chars;
  }

  function normalizeWord(str) {
    return str.trim().replace(/[,\.!?;:]+$/u, "").toLowerCase();
  }

  function highlightPhraseChars(chars, phrase, className) {
    const full = chars.map((c) => c.textContent.replace("\u00A0", " ")).join("");
    const start = full.indexOf(phrase);
    if (start === -1) return;
    for (let i = start; i < start + phrase.length; i++) {
      if (chars[i]) chars[i].classList.add(className);
    }
  }

  function highlightPhraseWords(words, phrase, className) {
    const target = phrase.toLowerCase();
    words.forEach((word) => {
      if (normalizeWord(word.textContent) === target) {
        word.classList.add(className);
      }
    });
  }

  function initSplitText(options) {
    const {
      selector,
      splitType = "chars",
      delay = 50,
      duration = 1.25,
      ease = "power3.out",
      from = { opacity: 0, y: 40 },
      to = { opacity: 1, y: 0 },
      triggerOnScroll = false,
      highlightPhrases = [],
      onComplete
    } = options;

    const elements = document.querySelectorAll(selector);
    if (!elements.length || typeof gsap === "undefined") return;

    const runAnimation = (el) => {
      if (el.dataset.splitDone === "true") return;
      const chars = splitText(el, splitType);
      if (!chars.length) return;

      const isWords = splitType.includes("words");
      highlightPhrases.forEach(({ phrase, className }) => {
        if (isWords) {
          highlightPhraseWords(chars, phrase, className);
        } else {
          highlightPhraseChars(chars, phrase, className);
        }
      });

      el.dataset.splitDone = "true";

      const tweenConfig = {
        ...to,
        duration,
        ease,
        stagger: delay / 1000,
        onComplete: () => onComplete?.()
      };

      if (triggerOnScroll && typeof ScrollTrigger !== "undefined") {
        gsap.fromTo(chars, { ...from }, {
          ...tweenConfig,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true
          }
        });
      } else {
        gsap.fromTo(chars, { ...from }, tweenConfig);
      }
    };

    const start = () => elements.forEach(runAnimation);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start);
    } else {
      start();
    }
  }

  global.initSplitText = initSplitText;
})(window);
