(function () {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 12) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }, { passive: true });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function startHero() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var input = panel.querySelector('[data-local-search]');
    var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-key]'));
    var list = panel.parentElement ? panel.parentElement.querySelector('[data-card-list]') : null;
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-card]')) : [];
    var activeKey = '';

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var key = activeKey.toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedKey = !key || text.indexOf(key) !== -1;
        card.classList.toggle('is-hidden', !(matchedQuery && matchedKey));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeKey = button.getAttribute('data-filter-key') || '';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilter();
      });
    });
  });

  var searchBox = document.querySelector('[data-global-search]');
  if (searchBox && window.SITE_MOVIES) {
    var searchInput = searchBox.querySelector('[data-search-input]');
    var searchButton = searchBox.querySelector('[data-search-button]');
    var resultBox = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');

    function buildCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<article class="movie-card">',
        '<a class="poster-link" href="./' + movie.file + '" aria-label="' + escapeHtml(movie.title) + '">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="card-year">' + escapeHtml(movie.year) + '</span>',
        '<span class="card-play">立即观看</span>',
        '</a>',
        '<div class="card-body">',
        '<a class="card-title" href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '<div class="tag-row">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function runSearch() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var params = new URLSearchParams(window.location.search);
      if (!query && params.get('q')) {
        query = params.get('q').trim().toLowerCase();
        searchInput.value = params.get('q');
      }
      var matches = window.SITE_MOVIES.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' ')].join(' ').toLowerCase();
        return !query || text.indexOf(query) !== -1;
      }).slice(0, 96);
      if (resultBox) {
        resultBox.innerHTML = matches.map(buildCard).join('');
      }
      if (summary) {
        summary.textContent = query ? '已为你筛选相关内容。' : '展示近期精选内容，可继续输入关键词筛选。';
      }
    }

    if (searchButton) searchButton.addEventListener('click', runSearch);
    if (searchInput) searchInput.addEventListener('input', runSearch);
    runSearch();
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video[data-stream]');
    var button = player.querySelector('[data-play-button]');
    var hls = null;

    if (!video || !button) return;

    function startPlayback() {
      var stream = video.getAttribute('data-stream');
      button.classList.add('is-hidden');
      video.controls = true;
      if (video.getAttribute('data-ready') === '1') {
        video.play().catch(function () {});
        return;
      }
      video.setAttribute('data-ready', '1');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
        return;
      }
      video.src = stream;
      video.play().catch(function () {});
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
  });
})();
