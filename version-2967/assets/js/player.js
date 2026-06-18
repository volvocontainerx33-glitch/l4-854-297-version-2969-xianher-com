(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initPlayer(root) {
    var video = root.querySelector("video[data-video-src]");
    var button = root.querySelector("[data-play-button]");
    var state = root.querySelector("[data-player-state]");
    var loaded = false;
    var hls = null;

    if (!video || !button) {
      return;
    }

    function setState(message, hidden) {
      if (!state) {
        return;
      }
      state.textContent = message;
      state.classList.toggle("is-hidden", Boolean(hidden));
    }

    function loadSource() {
      var source = video.dataset.videoSrc;

      if (loaded || !source) {
        return;
      }

      loaded = true;
      setState("正在加载播放源", false);

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setState("播放源已就绪", true);
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setState("网络错误，正在重试", false);
            hls.startLoad();
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setState("媒体错误，正在恢复", false);
            hls.recoverMediaError();
            return;
          }

          setState("无法播放视频，请刷新重试", false);
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function () {
          setState("播放源已就绪", true);
        }, { once: true });
      } else {
        setState("当前浏览器不支持 HLS 播放", false);
      }
    }

    button.addEventListener("click", function () {
      loadSource();
      button.classList.add("is-hidden");

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          setState("请再次点击播放器开始播放", false);
        });
      }
    });

    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
      setState("播放中", true);
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        setState("已暂停", false);
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(initPlayer);
  });
})();
