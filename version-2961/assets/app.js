(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const navPanel = document.querySelector(".nav-panel");

  if (menuButton && navPanel) {
    menuButton.addEventListener("click", function () {
      const open = navPanel.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    const prev = hero.querySelector(".hero-prev");
    const next = hero.querySelector(".hero-next");
    let index = 0;
    let timer = null;

    const show = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    const start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    show(0);
    start();
  }

  const filterInput = document.getElementById("movieFilter");
  const yearFilter = document.getElementById("yearFilter");
  const cards = Array.from(document.querySelectorAll("[data-filter-list] .movie-card"));

  if (filterInput && cards.length) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";

    if (query) {
      filterInput.value = query;
    }

    const applyFilter = function () {
      const keyword = filterInput.value.trim().toLowerCase();
      const year = yearFilter ? yearFilter.value : "";

      cards.forEach(function (card) {
        const text = (card.getAttribute("data-search") || "").toLowerCase();
        const cardYear = card.getAttribute("data-year") || "";
        const matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        const matchedYear = !year || cardYear === year;
        card.classList.toggle("is-hidden", !(matchedKeyword && matchedYear));
      });
    };

    filterInput.addEventListener("input", applyFilter);

    if (yearFilter) {
      yearFilter.addEventListener("change", applyFilter);
    }

    applyFilter();
  }
})();

const AppPlayer = {
  mount: function (id, source) {
    const root = document.getElementById(id);

    if (!root) {
      return;
    }

    const wrap = root.querySelector(".player-wrap");
    const video = root.querySelector("video");
    const cover = root.querySelector(".player-cover");
    let hls = null;
    let loaded = false;

    const load = function () {
      if (loaded || !video) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }

      video.src = source;
    };

    const play = function () {
      load();

      if (wrap) {
        wrap.classList.add("is-playing");
      }

      if (video) {
        video.controls = true;
        const attempt = function () {
          const promise = video.play();

          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
          }
        };

        if (hls && window.Hls) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, attempt);
        }

        attempt();
      }
    };

    if (cover) {
      cover.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    }
  }
};
