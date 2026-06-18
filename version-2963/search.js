(function () {
  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;"
      }[character];
    });
  }

  function card(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + escapeHtml(movie.url) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="badge">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + '</span>',
      '    <span class="play-dot">▶</span>',
      '  </a>',
      '  <div class="card-content">',
      '    <a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-line">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function runSearch(query, filter) {
    var data = window.MOVIE_SEARCH_DATA || [];
    var normalizedQuery = normalize(query);
    var normalizedFilter = normalize(filter === "全部" ? "" : filter);
    var terms = normalizedFilter.split(/\s+/).filter(Boolean);
    var results = data.filter(function (movie) {
      var text = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        movie.tags.join(" ")
      ].join(" "));
      var queryHit = !normalizedQuery || text.indexOf(normalizedQuery) !== -1;
      var filterHit = !terms.length || terms.some(function (term) {
        return text.indexOf(term) !== -1;
      });
      return queryHit && filterHit;
    });
    return results.slice(0, 120);
  }

  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var params = new URLSearchParams(window.location.search);
    var input = document.getElementById("searchInput");
    var resultsNode = document.querySelector("[data-search-results]");
    var statusNode = document.querySelector("[data-search-status]");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    if (!resultsNode || !statusNode) {
      return;
    }
    var currentFilter = "全部";
    if (input) {
      input.value = params.get("q") || "";
    }

    function render() {
      var query = input ? input.value : "";
      var results = runSearch(query, currentFilter);
      statusNode.textContent = query || currentFilter !== "全部"
        ? "已找到相关影片"
        : "热门推荐";
      resultsNode.innerHTML = results.length
        ? results.map(card).join("")
        : '<div class="search-status">暂无相关影片</div>';
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentFilter = button.getAttribute("data-filter") || "全部";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        render();
      });
    });
    render();
  });
})();
