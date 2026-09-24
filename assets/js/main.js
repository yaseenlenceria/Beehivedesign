/* Beehive Design — shared site behaviour */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  }

  /* ---------- Header hide on scroll down ---------- */
  var header = document.querySelector(".site-header");
  var lastY = 0;
  if (header) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y > 320 && y > lastY) header.classList.add("is-hidden");
      else header.classList.remove("is-hidden");
      lastY = y;
    }, { passive: true });
  }

  /* ---------- Scroll reveals ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el, i) {
      // stagger siblings that share a parent
      var sibs = el.parentElement ? el.parentElement.querySelectorAll(":scope > [data-reveal]") : [el];
      var idx = Array.prototype.indexOf.call(sibs, el);
      el.style.setProperty("--d", (Math.max(idx, 0) * 0.09).toFixed(2) + "s");
      io.observe(el);
    });
  }

  /* ---------- Hero hexagon parallax ---------- */
  var hexes = document.querySelectorAll(".hex");
  if (hexes.length && !prefersReduced) {
    var rx = 0, ry = 0, tx = 0, ty = 0;
    window.addEventListener("pointermove", function (e) {
      tx = (e.clientX / window.innerWidth - 0.5);
      ty = (e.clientY / window.innerHeight - 0.5);
    }, { passive: true });
    var scrollY = 0;
    window.addEventListener("scroll", function () { scrollY = window.scrollY; }, { passive: true });
    (function raf() {
      rx += (tx - rx) * 0.06;
      ry += (ty - ry) * 0.06;
      hexes.forEach(function (hex, i) {
        var depth = (i + 1) * 14;
        var drift = scrollY * (0.05 + i * 0.03);
        hex.style.transform =
          "translate3d(" + (rx * depth) + "px," + (ry * depth - drift) + "px,0) rotate(" + (rx * 8 + scrollY * 0.02 * (i % 2 ? 1 : -1)) + "deg)";
      });
      requestAnimationFrame(raf);
    })();
  }

  /* ---------- Testimonial slider ---------- */
  var slider = document.querySelector("[data-slider]");
  if (slider) {
    var slides = slider.querySelectorAll(".tst-slide");
    var dotsWrap = slider.querySelector(".tst-nav");
    var current = 0, timer;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.className = "tst-dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", "Show review " + (i + 1));
      dot.addEventListener("click", function () { go(i); restart(); });
      dotsWrap.appendChild(dot);
    });
    var dots = dotsWrap.querySelectorAll(".tst-dot");

    function go(i) {
      slides[current].classList.remove("is-active");
      dots[current].classList.remove("is-active");
      current = (i + slides.length) % slides.length;
      slides[current].classList.add("is-active");
      dots[current].classList.add("is-active");
    }
    function restart() {
      clearInterval(timer);
      if (!prefersReduced) timer = setInterval(function () { go(current + 1); }, 6000);
    }
    restart();
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Reading progress (article pages) ---------- */
  var postBody = document.querySelector(".post-body");
  if (postBody && !prefersReduced) {
    var bar = document.createElement("div");
    bar.className = "reading-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    var update = function () {
      var rect = postBody.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      var done = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      bar.style.width = (done / Math.max(total, 1) * 100) + "%";
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- Contact form -> Formspark ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var status = form.querySelector(".form-status");
    var submitBtn = form.querySelector(".form-submit");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (status) { status.hidden = true; status.className = "form-status"; }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      if (data._email) return; // honeypot — silently drop bots
      submitBtn.disabled = true;
      fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        if (status) {
          status.textContent = "Thanks — your request is in. We'll get back to you within one business day.";
          status.classList.add("is-ok");
          status.hidden = false;
        }
      }).catch(function () {
        if (status) {
          status.textContent = "Something went wrong. Email us directly at info@beehivedesign.ie or WhatsApp +353 85 179 1491.";
          status.classList.add("is-error");
          status.hidden = false;
        }
      }).finally(function () { submitBtn.disabled = false; });
    });
  }
})();
