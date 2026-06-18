(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
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
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

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

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupGlobalSearch() {
    var panel = document.querySelector("[data-search-panel]");
    var openButtons = Array.prototype.slice.call(document.querySelectorAll("[data-search-open]"));
    var closeButton = document.querySelector("[data-search-close]");
    var input = document.querySelector("[data-global-search-input]");
    var results = document.querySelector("[data-global-search-results]");
    var movies = window.MOVIE_DATA || [];

    if (!panel || !input || !results) {
      return;
    }

    function openPanel() {
      panel.hidden = false;
      window.setTimeout(function () {
        input.focus();
      }, 30);
    }

    function closePanel() {
      panel.hidden = true;
      input.value = "";
      results.innerHTML = "";
    }

    function buildResult(movie) {
      var link = document.createElement("a");
      var img = document.createElement("img");
      var body = document.createElement("span");
      var title = document.createElement("strong");
      var meta = document.createElement("span");
      var summary = document.createElement("span");

      link.className = "search-result-item";
      link.href = movie.url;
      img.src = movie.cover;
      img.alt = movie.title;
      title.textContent = movie.title;
      meta.textContent = movie.year + " · " + movie.region + " · " + movie.genre;
      summary.textContent = movie.oneLine || "";

      body.appendChild(title);
      body.appendChild(meta);
      body.appendChild(summary);
      link.appendChild(img);
      link.appendChild(body);
      return link;
    }

    function render() {
      var query = normalize(input.value);
      results.innerHTML = "";

      if (!query) {
        results.innerHTML = '<p class="empty-state">请输入关键词开始搜索。</p>';
        return;
      }

      var matched = movies.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(" "));
        return haystack.indexOf(query) !== -1;
      }).slice(0, 18);

      if (!matched.length) {
        results.innerHTML = '<p class="empty-state">没有找到匹配影片。</p>';
        return;
      }

      matched.forEach(function (movie) {
        results.appendChild(buildResult(movie));
      });
    }

    openButtons.forEach(function (button) {
      button.addEventListener("click", openPanel);
    });

    if (closeButton) {
      closeButton.addEventListener("click", closePanel);
    }

    panel.addEventListener("click", function (event) {
      if (event.target === panel) {
        closePanel();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) {
        closePanel();
      }
    });

    input.addEventListener("input", render);
  }

  function setupPageFilter() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
    var search = document.querySelector("[data-page-filter]");
    var year = document.querySelector('[data-filter-select="year"]');
    var region = document.querySelector('[data-filter-select="region"]');
    var visibleCount = document.querySelector("[data-visible-count]");
    var totalCount = document.querySelector("[data-total-count]");
    var emptyState = document.querySelector("[data-empty-state]");

    if (!cards.length || !search && !year && !region) {
      return;
    }

    if (totalCount) {
      totalCount.textContent = String(cards.length);
    }

    function apply() {
      var query = normalize(search ? search.value : "");
      var selectedYear = normalize(year ? year.value : "");
      var selectedRegion = normalize(region ? region.value : "");
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(" "));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
        var matchesRegion = !selectedRegion || normalize(card.dataset.region).indexOf(selectedRegion) !== -1;
        var visible = matchesQuery && matchesYear && matchesRegion;

        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });

      if (visibleCount) {
        visibleCount.textContent = String(shown);
      }

      if (emptyState) {
        emptyState.hidden = shown !== 0;
      }
    }

    [search, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupGlobalSearch();
    setupPageFilter();
  });
})();
