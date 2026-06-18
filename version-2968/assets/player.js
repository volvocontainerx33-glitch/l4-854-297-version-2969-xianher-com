function mountMoviePlayer(source) {
  var video = document.querySelector('[data-player]');
  var button = document.querySelector('[data-play-button]');
  var hls = null;
  var prepared = false;

  if (!video || !button || !source) {
    return;
  }

  function prepare() {
    if (prepared) {
      return;
    }
    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function start() {
    prepare();
    button.classList.add('is-hidden');
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        button.classList.remove('is-hidden');
      });
    }
  }

  button.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (!video.ended) {
      button.classList.remove('is-hidden');
    }
  });
  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
