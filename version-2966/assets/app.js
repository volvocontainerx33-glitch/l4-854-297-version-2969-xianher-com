document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");

    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("active", position === index);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        show(0);
        startTimer();
    });

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
        var scope = form.parentElement || document;
        var input = form.querySelector("[data-search-input]");
        var year = form.querySelector("[data-filter-year]");
        var region = form.querySelector("[data-filter-region]");
        var category = form.querySelector("[data-filter-category]");
        var empty = scope.querySelector("[data-empty-result]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

        function textOf(card) {
            return [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-category")
            ].join(" ").toLowerCase();
        }

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var selectedYear = year ? year.value : "";
            var selectedRegion = region ? region.value : "";
            var selectedCategory = category ? category.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = textOf(card);
                var ok = true;

                if (query && text.indexOf(query) === -1) {
                    ok = false;
                }

                if (selectedYear && card.getAttribute("data-year") !== selectedYear) {
                    ok = false;
                }

                if (selectedRegion && card.getAttribute("data-region") !== selectedRegion) {
                    ok = false;
                }

                if (selectedCategory && card.getAttribute("data-category") !== selectedCategory) {
                    ok = false;
                }

                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [input, year, region, category].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    });
});
