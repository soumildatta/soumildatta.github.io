// theme toggle -----------------------------------------------------------
function currentTheme() {
  return document.documentElement.getAttribute("data-theme") || "light";
}

function toggleTheme() {
  var next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

// adversarial perturbation of the detection label --------------------------
(function () {
  var label = document.getElementById("detect-label");
  if (!label) return;

  var clean = "person · 0.99";
  var perturbed = [
    "toaster · 0.62",
    "avocado · 0.54",
    "traffic light · 0.48",
    "gibbon · 0.71",
    "espresso · 0.33"
  ];
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  var box = label.closest(".detect");
  var timer = null;
  var i = 0;

  box.addEventListener("mouseenter", function () {
    i = 0;
    timer = setInterval(function () {
      label.textContent = perturbed[i % perturbed.length];
      i++;
    }, 420);
  });

  box.addEventListener("mouseleave", function () {
    clearInterval(timer);
    label.innerHTML = "person&nbsp;&middot;&nbsp;0.99";
  });
})();

// content — rendered from the YAML files in /content -----------------------
// Edit the .yml files, not this markup. Each section below maps one file to
// one container element via a small template function.
(function () {
  // --- tiny inline-markdown -> HTML (bold, italic, links, code) ---
  function md(value) {
    if (value == null) return "";
    return String(value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*(?!\*)([^*]+)\*/g, "$1<em>$2</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  // load one YAML file, hand the parsed data to render(), inject into #id
  function load(file, id, render) {
    var mount = document.getElementById(id);
    if (!mount) return;
    fetch("/content/" + file)
      .then(function (r) {
        if (!r.ok) throw new Error(r.status + " " + r.statusText);
        return r.text();
      })
      .then(function (text) { mount.innerHTML = render(jsyaml.load(text)); })
      .catch(function (err) {
        console.error("Could not load /content/" + file + ":", err);
      });
  }

  var visible = function (item) { return !item.hidden; };

  // --- news ---
  load("news.yml", "news-list", function (items) {
    return items.filter(visible).map(function (n) {
      return "<li>" +
        '<span class="news-date">' + md(n.date) + "</span>" +
        '<span class="news-text">' + md(n.text) + "</span>" +
      "</li>";
    }).join("");
  });

  // --- research cards ---
  load("research.yml", "research-cards", function (items) {
    return items.filter(visible).map(function (c, i) {
      var num = "/" + String(i + 1).padStart(2, "0");
      var tags = (c.tags || []).map(function (t) {
        return '<span class="tag">' + md(t) + "</span>";
      }).join("");
      return '<article class="card">' +
        '<span class="card-num">' + num + " &middot; " + md(c.kicker) + "</span>" +
        "<h3>" + md(c.title) + "</h3>" +
        "<p>" + md(c.text) + "</p>" +
        '<div class="tags">' + tags + "</div>" +
      "</article>";
    }).join("");
  });

  // --- publications ---
  load("publications.yml", "pub-list", function (items) {
    return items.filter(visible).map(function (p) {
      var title = p.link
        ? '<a class="pub-title" href="' + p.link + '">' + md(p.title) + "</a>"
        : '<span class="pub-title">' + md(p.title) + "</span>";
      var badges = "";
      if (p.status) badges += '<span class="badge badge-review">' + md(p.status) + "</span>";
      if (p.venue)  badges += '<span class="badge badge-venue">' + md(p.venue) + "</span>";
      if (p.award) {
        var star = /nominee/i.test(p.award) ? "☆" : "★"; // ☆ nominee, ★ award
        badges += '<span class="badge badge-award">' + star + " " + md(p.award) + "</span>";
      }
      return '<li class="pub">' +
        title +
        '<p class="pub-authors">' + md(p.authors) + "</p>" +
        '<div class="pub-meta">' + badges + "</div>" +
      "</li>";
    }).join("");
  });

  // --- awards ---
  load("awards.yml", "award-list", function (items) {
    return items.filter(visible).map(function (a) {
      var body = a.link ? '<a href="' + a.link + '">' + md(a.text) + "</a>" : md(a.text);
      var date = a.date ? '<span class="award-date">' + md(a.date) + "</span>" : "";
      return "<li><span class=\"marker\">★</span><span>" + body + "</span>" + date + "</li>";
    }).join("");
  });

  // --- service (grouped venue chips) ---
  load("service.yml", "service-groups", function (groups) {
    return groups.map(function (g) {
      var chips = (g.venues || []).map(function (v) {
        return '<div class="venue-chip">' +
          '<span class="v-name">' + md(v.name) + "</span>" +
          '<span class="v-years">' + md(v.years) + "</span>" +
          '<span class="v-full">' + md(v.full) + "</span>" +
        "</div>";
      }).join("");
      return '<p class="service-intro">' + md(g.heading) + "</p>" +
        '<div class="service-grid">' + chips + "</div>";
    }).join("");
  });

  // --- teaching prose ---
  load("teaching.yml", "teaching-prose", function (data) {
    var paras = (data.paragraphs || []).map(function (p) {
      return "<p>" + md(p) + "</p>";
    }).join("");
    var link = data.link
      ? '<p><a href="' + data.link.url + '">' + md(data.link.text) + "</a></p>"
      : "";
    return paras + link;
  });
})();

// for the curious ----------------------------------------------------------
console.log(
  "%c⚠ adversarial input detected: you.\n%cInterested in ML security? Let's talk → https://www.linkedin.com/in/soumildatta",
  "color:#ff5a4e;font-weight:bold;font-size:14px;font-family:monospace",
  "color:#888;font-size:12px;font-family:monospace"
);
