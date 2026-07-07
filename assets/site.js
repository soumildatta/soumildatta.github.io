// theme toggle -----------------------------------------------------------
function currentTheme() {
  var explicit = document.documentElement.getAttribute("data-theme");
  if (explicit) return explicit;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
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

// for the curious ----------------------------------------------------------
console.log(
  "%c⚠ adversarial input detected: you.\n%cInterested in ML security? Let's talk → https://www.linkedin.com/in/soumildatta",
  "color:#ff5a4e;font-weight:bold;font-size:14px;font-family:monospace",
  "color:#888;font-size:12px;font-family:monospace"
);
