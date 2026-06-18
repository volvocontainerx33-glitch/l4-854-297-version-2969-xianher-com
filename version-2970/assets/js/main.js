(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMenu() {
    var toggle = qs("[data-menu-toggle]");
    var panel = qs("[data-nav-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = qs("[data-hero-slider]");
    if (!hero) {
      return;
    }
    var slides = qsa(".hero-slide", hero);
    var dots = qsa(".hero-dot", hero);
    var prev = qs("[data-hero-prev]", hero);
    var next = qs("[data-hero-next]", hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilterPage() {
    var grid = qs("[data-filter-grid]");
    if (!grid) {
      return;
    }
    var input = qs("[data-filter-input]");
    var sort = qs("[data-sort-select]");
    var cards = qsa(".movie-card", grid);

    function apply() {
      var keyword = normalize(input && input.value);
      cards.forEach(function (card) {
        var haystack = normalize(card.dataset.title + " " + card.dataset.tags + " " + card.dataset.year);
        card.hidden = keyword && haystack.indexOf(keyword) === -1;
      });

      if (sort) {
        var sorted = cards.slice().sort(function (a, b) {
          if (sort.value === "popular") {
            return Number(b.dataset.views) - Number(a.dataset.views);
          }
          if (sort.value === "oldest") {
            return String(a.dataset.date).localeCompare(String(b.dataset.date));
          }
          return String(b.dataset.date).localeCompare(String(a.dataset.date));
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (sort) {
      sort.addEventListener("change", apply);
    }
    apply();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "" +
      "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.href) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"duration\">" + escapeHtml(movie.duration) + "</span>" +
      "<span class=\"play-badge\">▶</span>" +
      "</a>" +
      "<div class=\"movie-info\">" +
      "<div class=\"movie-meta\"><a href=\"" + escapeHtml(movie.categoryHref) + "\">" + escapeHtml(movie.category) + "</a><span>" + escapeHtml(movie.year) + "</span></div>" +
      "<h3><a href=\"" + escapeHtml(movie.href) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.description) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function initSearchPage() {
    var root = qs("[data-search-results]");
    if (!root || !window.SITE_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get("q") || "";
    var input = qs("[data-search-input]");
    var note = qs("[data-search-note]");

    if (input) {
      input.value = keyword;
    }

    function run(query) {
      var term = normalize(query);
      if (!term) {
        root.innerHTML = "<div class=\"empty-state panel\"><h2>输入关键词开始搜索</h2><p>可按影片名、地区、题材、标签进行查找。</p></div>";
        if (note) {
          note.textContent = "";
        }
        return;
      }

      var results = window.SITE_MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.description,
          movie.category,
          movie.region,
          movie.genre,
          movie.year,
          (movie.tags || []).join(" ")
        ].join(" "));
        return haystack.indexOf(term) !== -1;
      });

      if (note) {
        note.textContent = "搜索“" + query + "”找到 " + results.length + " 部相关影片";
      }

      if (!results.length) {
        root.innerHTML = "<div class=\"empty-state panel\"><h2>未找到相关影片</h2><p>尝试使用其他片名、题材、地区或标签。</p></div>";
        return;
      }

      root.innerHTML = results.map(movieCard).join("");
    }

    if (input) {
      input.addEventListener("input", function () {
        run(input.value);
      });
    }
    run(keyword);
  }

  function initPlayer() {
    var video = qs("#movie-video");
    var overlay = qs("#play-overlay");
    var dataScript = qs("#player-data");
    if (!video || !dataScript) {
      return;
    }

    var payload = {};
    try {
      payload = JSON.parse(dataScript.textContent || "{}");
    } catch (error) {
      payload = {};
    }

    var source = payload.source;
    var poster = payload.poster;
    var loaded = false;
    var hls = null;

    if (poster) {
      video.poster = poster;
    }

    function loadSource() {
      if (loaded || !source) {
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
    }

    function playVideo() {
      loadSource();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilterPage();
    initSearchPage();
    initPlayer();
  });
})();
