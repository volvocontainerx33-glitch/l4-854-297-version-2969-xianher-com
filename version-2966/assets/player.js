document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-player]").forEach(function (wrap) {
        var video = wrap.querySelector("video");
        var button = wrap.querySelector(".play-overlay");
        var stream = wrap.getAttribute("data-stream");
        var hls = null;
        var ready = false;

        function attach() {
            if (!video || !stream || ready) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }

            ready = true;
        }

        function play() {
            attach();

            if (button) {
                button.classList.add("is-hidden");
            }

            var request = video.play();

            if (request && typeof request.catch === "function") {
                request.catch(function () {
                    if (button) {
                        button.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("is-hidden");
                }
            });
            video.addEventListener("pause", function () {
                if (button && video.currentTime === 0) {
                    button.classList.remove("is-hidden");
                }
            });
        }

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    });
});
