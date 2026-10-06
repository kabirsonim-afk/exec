(function () {
  "use strict";

  var LOGO_PATH = "/iridium/iridium-hybrid-logo.png";
  var WEBSITE_URL = "https://projectiridium.lovable.app/";
  var settingsRedirectScheduled = false;
  var hiddenLabels = new Set([
    "account",
    "accounts",
    "login",
    "log in",
    "sign in",
    "discord",
    "join discord",
    "open discord",
    "open file",
    "save file",
    "undock panel",
    "clients",
    "launch roblox",
    "auto-execute",
    "auto execute",
    "cloud scripts",
    "download version",
    "hold to start spoof",
    "connections",
    "roblox",
    "client",
    "custom syntax theme format",
    "build a syntax theme",
    "import a json theme file"
  ]);

  function normalizedLabel(element) {
    return String(
      element.getAttribute("aria-label") ||
      element.getAttribute("title") ||
      element.textContent ||
      ""
    ).replace(/\s+/g, " ").trim().toLowerCase();
  }

  function hideUnwantedNavigation(root) {
    var scope = root && root.querySelectorAll ? root : document;

    scope.querySelectorAll("a[href], button, [role='button'], [role='menuitem'], nav li").forEach(function (element) {
      var label = normalizedLabel(element);
      var href = String(element.getAttribute("href") || "").toLowerCase();
      var isDiscord = href.indexOf("discord.gg") !== -1 ||
        href.indexOf("discord.com") !== -1 ||
        label.indexOf("discord") !== -1;

      var isAccountSurface = label.indexOf("account") !== -1;
      var isAuthPrompt = label.indexOf("login") !== -1 ||
        label.indexOf("log in") !== -1 ||
        label.indexOf("sign in") !== -1 ||
        label.indexOf("sign-in") !== -1;

      if (isDiscord || isAccountSurface || isAuthPrompt || hiddenLabels.has(label)) {
        element.setAttribute("data-iridium-hidden", "true");
        element.setAttribute("aria-hidden", "true");
        element.setAttribute("tabindex", "-1");
        if (element.tagName === "A") element.removeAttribute("href");
      }
    });

    scope.querySelectorAll("button[data-tb-tab='accounts'], .home-profile").forEach(function (element) {
      element.setAttribute("data-iridium-hidden", "true");
      element.setAttribute("aria-hidden", "true");
    });

    scope.querySelectorAll(".ov-grp-lbl").forEach(function (labelElement) {
      if (normalizedLabel(labelElement) !== "license") return;
      var group = labelElement.closest(".ov-grp");
      if (!group) return;
      group.setAttribute("data-iridium-hidden", "true");
      group.setAttribute("aria-hidden", "true");
    });

    var hiddenSettingSections = new Set([
      "roblox hwid spoofer",
      "account",
      "iridium mcp",
      "github gists",
      "discord account",
      "vs code integration",
      "theme",
      "music",
      "customization",
      "saved themes"
    ]);

    scope.querySelectorAll(".settings-section").forEach(function (section) {
      var title = section.querySelector(".section-title");
      if (!title) return;
      var sectionName = normalizedLabel(title);
      if (hiddenSettingSections.has(sectionName)) {
        section.setAttribute("data-iridium-hidden", "true");
        section.setAttribute("aria-hidden", "true");
        return;
      }

      if (sectionName === "background") {
        section.querySelectorAll("button").forEach(function (button) {
          if (normalizedLabel(button) !== "add") return;
          button.setAttribute("data-iridium-hidden", "true");
          button.setAttribute("aria-hidden", "true");
          button.setAttribute("tabindex", "-1");
        });
      }
    });
  }

  function replaceBrandText(root) {
    var scope = root && root.nodeType ? root : document.body;
    if (!scope) return;

    var walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(function (node) {
      var parent = node.parentElement;
      if (!parent || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/i.test(parent.tagName)) return;

      var value = node.nodeValue;
      var next = value
        .replace(/constraintt\.ez/gi, "IRIDIUM")
        .replace(/Exploiting evolved/gi, "Everything you want. Nothing you don't.")
        .replace(/Forged beyond the atmosphere/gi, "Everything you want. Nothing you don't.")
        .replace(/The best way to use Roblox/gi, "Everything you want. Nothing you don't.")
        .replace(/\bREAL\b/g, "IRIDIUM")
        .replace(/\bReal\b/g, "IRIDIUM")
        .replace(/\breal\b/g, "IRIDIUM");

      if (next !== value) node.nodeValue = next;
    });
  }

  function replaceBrandImages(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll("img").forEach(function (image) {
      var src = String(image.getAttribute("src") || "");
      var alt = String(image.getAttribute("alt") || "");
      if (/real-(?:logo|icon)|constraintt/i.test(src + " " + alt)) {
        image.setAttribute("src", LOGO_PATH);
        image.setAttribute("alt", "IRIDIUM");
        image.classList.add("iridium-brand-image");
        image.style.objectFit = "contain";
      }
    });
  }

  function updateWebsiteSurfaces(root) {
    var scope = root && root.querySelectorAll ? root : document;

    scope.querySelectorAll("a[href]").forEach(function (link) {
      var href = String(link.getAttribute("href") || "");
      if (/^https?:\/\/(?:www\.)?constraintt\.ez(?:\/|$)/i.test(href)) {
        link.setAttribute("href", WEBSITE_URL);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    });

    scope.querySelectorAll("[aria-label='Website'], [aria-label='Dashboard']").forEach(function (element) {
      element.removeAttribute("data-iridium-hidden");
      element.removeAttribute("aria-hidden");
      element.removeAttribute("tabindex");
      element.setAttribute("data-iridium-website", "true");
      var subtitle = element.querySelector(".home-link-sub");
      if (subtitle) subtitle.textContent = "projectiridium.lovable.app";
    });
  }

  function selectFunctionalSettings(root) {
    if (settingsRedirectScheduled) return;
    var scope = root && root.querySelectorAll ? root : document;
    var unsupportedPages = new Set(["roblox", "client", "connections"]);
    var currentHeading = Array.from(scope.querySelectorAll("h1")).find(function (heading) {
      return unsupportedPages.has(normalizedLabel(heading));
    });
    if (!currentHeading) return;

    var appearanceButton = Array.from(scope.querySelectorAll("button")).find(function (button) {
      return normalizedLabel(button) === "appearance";
    });
    if (!appearanceButton) return;

    settingsRedirectScheduled = true;
    window.requestAnimationFrame(function () {
      appearanceButton.click();
      window.setTimeout(function () {
        settingsRedirectScheduled = false;
      }, 400);
    });
  }

  function openIridiumWebsite(event) {
    var target = event.target && event.target.closest
      ? event.target.closest("a, button, [role='button']")
      : null;
    if (!target) return;

    var label = normalizedLabel(target);
    var href = String(target.getAttribute("href") || "");
    var isWebsiteControl = target.getAttribute("data-iridium-website") === "true" ||
      label === "website" ||
      label === "dashboard" ||
      /^https?:\/\/(?:www\.)?constraintt\.ez(?:\/|$)/i.test(href);

    if (!isWebsiteControl) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.open(WEBSITE_URL, "_blank", "noopener,noreferrer");
  }

  function applyIridium(root) {
    document.title = "IRIDIUM";
    document.documentElement.setAttribute("data-brand", "iridium");
    replaceBrandText(root);
    replaceBrandImages(root);
    hideUnwantedNavigation(root);
    updateWebsiteSurfaces(root);
    selectFunctionalSettings(root);
  }

  function createIntro() {
    if (document.getElementById("iridium-intro")) return;

    var intro = document.createElement("div");
    intro.id = "iridium-intro";
    intro.setAttribute("aria-label", "IRIDIUM startup animation");
    var letters = "IRIDIUM".split("").map(function (letter, index) {
      return '<span style="--letter-delay:' + (1.15 + (index * 0.070)).toFixed(3) + 's">' + letter + '</span>';
    }).join("");
    var sparks = Array.from({ length: 14 }, function (_, index) {
      var angle = (index * (360 / 14)).toFixed(2);
      var delay = (1.03 + (index * 0.012)).toFixed(3);
      var distance = 104 + ((index % 5) * 8);
      var width = 22 + ((index % 4) * 5);
      return '<i style="--spark-angle:' + angle + 'deg;--spark-delay:' + delay + 's;--spark-distance:' + distance + 'px;--spark-width:' + width + 'px"></i>';
    }).join("");

    intro.innerHTML =
      '<div class="iridium-intro-grid" aria-hidden="true"></div>' +
      '<div class="iridium-intro-stage">' +
        '<div class="iridium-orbit" aria-hidden="true"></div>' +
        '<div class="iridium-impact" aria-hidden="true"></div>' +
        '<span class="iridium-shockwave iridium-shockwave-a" aria-hidden="true"></span>' +
        '<span class="iridium-shockwave iridium-shockwave-b" aria-hidden="true"></span>' +
        '<div class="iridium-sparks" aria-hidden="true">' + sparks + '</div>' +
        '<div class="iridium-meteor-flight" aria-hidden="true">' +
          '<span class="iridium-trail iridium-trail-wide"></span>' +
          '<span class="iridium-trail iridium-trail-core"></span>' +
          '<img src="' + LOGO_PATH + '" alt="">' +
        '</div>' +
        '<div class="iridium-word-lockup">' +
          '<h1 class="iridium-intro-word" aria-label="IRIDIUM">' + letters + '</h1>' +
          '<span class="iridium-word-line" aria-hidden="true"></span>' +
        '</div>' +
        '<div class="iridium-final-mark">' +
          '<span class="iridium-logo-halo" aria-hidden="true"></span>' +
          '<img class="iridium-intro-logo" src="' + LOGO_PATH + '" alt="IRIDIUM meteor logo">' +
        '</div>' +
        '<p class="iridium-intro-subtitle">Everything you want. Nothing you don\'t.</p>' +
      '</div>';

    document.body.appendChild(intro);
    window.setTimeout(function () {
      if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
    }, 6250);
  }

  function start() {
    document.addEventListener("click", openIridiumWebsite, true);
    createIntro();
    applyIridium(document);

    var queued = false;
    var observer = new MutationObserver(function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () {
        queued = false;
        applyIridium(document);
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
