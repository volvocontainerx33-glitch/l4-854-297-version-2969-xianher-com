(function () {
    window.initMoviePlayer = function (source) {
        var video = document.getElementById('movie-player');
        var button = document.querySelector('[data-play-button]');
        var loaded = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        function attach() {
            if (loaded) {
                return;
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function start() {
            attach();

            if (button) {
                button.classList.add('hidden');
            }

            var action = video.play();

            if (action && typeof action.catch === 'function') {
                action.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('hidden');
            }
        });

        video.addEventListener('ended', function () {
            if (button) {
                button.classList.remove('hidden');
            }
        });
    };
})();
