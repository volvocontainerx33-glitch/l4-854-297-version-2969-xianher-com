(function () {
  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-nav-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var dotsWrap = document.querySelector('[data-hero-dots]');
    var dots = [];

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换到第' + (i + 1) + '屏');
        dot.addEventListener('click', function () {
          show(i);
        });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
      });
    }
    show(0);
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function initLocalFilter() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]'));
    inputs.forEach(function (input) {
      var scope = document.querySelector('[data-card-scope]');
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      input.addEventListener('input', function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region')
          ].join(' ').toLowerCase();
          card.classList.toggle('is-hidden-card', query && text.indexOf(query) === -1);
        });
      });
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<a class="movie-card" href="' + movie.url + '">' +
      '<span class="poster-wrap">' +
      '<img src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-play">播放</span>' +
      '</span>' +
      '<span class="movie-info">' +
      '<strong>' + escapeHtml(movie.title) + '</strong>' +
      '<em>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</em>' +
      '<span class="movie-desc">' + escapeHtml(movie.oneLine) + '</span>' +
      '<span class="tag-row">' + tags + '</span>' +
      '</span>' +
      '</a>';
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

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var form = document.querySelector('[data-search-form]');
    if (!results || !form || !window.SEARCH_MOVIES) {
      return;
    }
    var input = document.querySelector('[data-search-input]');
    var region = document.querySelector('[data-search-region]');
    var type = document.querySelector('[data-search-type]');
    var params = new URLSearchParams(window.location.search);

    if (input) {
      input.value = params.get('q') || '';
    }
    if (region) {
      region.value = params.get('region') || '';
    }
    if (type) {
      type.value = params.get('type') || '';
    }

    function render() {
      var query = (input && input.value ? input.value : '').trim().toLowerCase();
      var regionValue = region && region.value ? region.value : '';
      var typeValue = type && type.value ? type.value : '';
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' '), movie.oneLine].join(' ').toLowerCase();
        if (query && text.indexOf(query) === -1) {
          return false;
        }
        if (regionValue && movie.region !== regionValue) {
          return false;
        }
        if (typeValue && movie.type !== typeValue) {
          return false;
        }
        return true;
      }).slice(0, 120);

      if (!matched.length) {
        results.innerHTML = '<div class="empty-state">未找到匹配影片</div>';
        return;
      }
      results.innerHTML = matched.map(movieCard).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var next = new URLSearchParams();
      if (input && input.value.trim()) {
        next.set('q', input.value.trim());
      }
      if (region && region.value) {
        next.set('region', region.value);
      }
      if (type && type.value) {
        next.set('type', type.value);
      }
      var url = window.location.pathname + (next.toString() ? '?' + next.toString() : '');
      window.history.replaceState(null, '', url);
      render();
    });

    [input, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', render);
        control.addEventListener('change', render);
      }
    });
    render();
  }

  initMenu();
  initHero();
  initLocalFilter();
  initSearchPage();
})();
