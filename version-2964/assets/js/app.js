(function () {
    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initCarousel() {
        var carousel = document.querySelector('[data-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-dot]'));
        var prev = carousel.querySelector('[data-slide-prev]');
        var next = carousel.querySelector('[data-slide-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('active', current === active);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('active', current === active);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                restart();
            });
        }
        show(0);
        restart();
    }

    function initFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]'));
        if (!grids.length) {
            return;
        }
        var input = document.querySelector('[data-filter-input]');
        var category = document.querySelector('[data-filter-category]');
        var year = document.querySelector('[data-filter-year]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (input && query) {
            input.value = query;
        }

        function apply() {
            var text = input ? input.value.trim().toLowerCase() : '';
            var selectedCategory = category ? category.value : '';
            var selectedYear = year ? year.value : '';
            grids.forEach(function (grid) {
                var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                    var cardCategory = card.getAttribute('data-category') || '';
                    var cardYear = card.getAttribute('data-year') || '';
                    var matchesText = !text || haystack.indexOf(text) !== -1;
                    var matchesCategory = !selectedCategory || cardCategory === selectedCategory;
                    var matchesYear = !selectedYear || cardYear === selectedYear;
                    card.classList.toggle('hidden-by-filter', !(matchesText && matchesCategory && matchesYear));
                });
            });
        }

        [input, category, year].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        });
        apply();
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var trigger = player.querySelector('[data-play-trigger]');
            var url = player.getAttribute('data-video');
            var attached = false;
            var hlsInstance = null;

            function start() {
                if (!video || !url) {
                    return;
                }
                player.classList.add('is-playing');
                if (!attached) {
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = url;
                        attached = true;
                        video.play().catch(function () {});
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                            hlsInstance.loadSource(url);
                        });
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                        attached = true;
                    } else {
                        video.src = url;
                        attached = true;
                        video.play().catch(function () {});
                    }
                } else {
                    video.play().catch(function () {});
                }
            }

            if (trigger) {
                trigger.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    start();
                });
            }
            player.addEventListener('click', function () {
                if (!player.classList.contains('is-playing')) {
                    start();
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initCarousel();
        initFilters();
        initPlayers();
    });
})();
