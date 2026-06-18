(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      toggle.textContent = menu.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var next = slider.querySelector('[data-hero-next]');
    var prev = slider.querySelector('[data-hero-prev]');
    var active = 0;
    var timer;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    if (slides.length > 1) {
      restart();
    }
  }

  function setupFiltering() {
    var input = document.querySelector('[data-filter-input]');
    var region = document.querySelector('[data-filter-region]');
    var type = document.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    if (!cards.length || !input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function run() {
      var keyword = normalize(input.value);
      var regionValue = normalize(region ? region.value : '');
      var typeValue = normalize(type ? type.value : '');
      cards.forEach(function (card) {
        var haystack = normalize(card.textContent + ' ' + card.dataset.title + ' ' + card.dataset.tags);
        var cardRegion = normalize(card.dataset.region);
        var cardType = normalize(card.dataset.type);
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1;
        var matchesType = !typeValue || cardType.indexOf(typeValue) !== -1;
        card.classList.toggle('is-hidden', !(matchesKeyword && matchesRegion && matchesType));
      });
    }

    input.addEventListener('input', run);
    if (region) {
      region.addEventListener('change', run);
    }
    if (type) {
      type.addEventListener('change', run);
    }
    run();
  }

  window.setupVideoPlayer = function (streamUrl) {
    var video = document.querySelector('[data-player-video]');
    var trigger = document.querySelector('[data-player-trigger]');
    if (!video || !trigger || !streamUrl) {
      return;
    }

    var loaded = false;
    var hlsInstance = null;

    function prepare() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      prepare();
      trigger.classList.add('is-hidden');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          trigger.classList.remove('is-hidden');
        });
      }
    }

    trigger.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      trigger.classList.add('is-hidden');
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFiltering();
  });
})();
