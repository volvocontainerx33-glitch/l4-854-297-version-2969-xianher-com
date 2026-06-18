(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-search]'));

    function applyFilter(scope, query) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var normalized = String(query || '').trim().toLowerCase();

        cards.forEach(function (card) {
            var text = card.getAttribute('data-filter-text') || '';
            var hidden = normalized && text.indexOf(normalized) === -1;
            card.setAttribute('data-card-hidden', hidden ? 'true' : 'false');
        });
    }

    searchInputs.forEach(function (input) {
        var parent = input.closest('section') || document;
        var scope = parent.querySelector('[data-card-scope]') || document;
        var group = parent.querySelector('[data-filter-group]');
        var buttons = group ? Array.prototype.slice.call(group.querySelectorAll('[data-filter]')) : [];

        input.addEventListener('input', function () {
            applyFilter(scope, input.value);
            buttons.forEach(function (button) {
                button.classList.toggle('is-active', button.getAttribute('data-filter') === '');
            });
        });

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var value = button.getAttribute('data-filter') || '';
                input.value = value;
                applyFilter(scope, value);
                buttons.forEach(function (other) {
                    other.classList.toggle('is-active', other === button);
                });
            });
        });

        if (buttons[0]) {
            buttons[0].classList.add('is-active');
        }
    });
})();
