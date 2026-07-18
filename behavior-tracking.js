(function () {
  "use strict";

  var startedAt = Date.now();
  var maxScroll = 0;
  var visibleStartedAt = document.visibilityState === "visible" ? Date.now() : null;
  var visibleMs = 0;
  var sentScroll = {};
  var sentTime = {};
  var seenSections = {};
  var summarySent = false;
  var pending = [];

  function tracker() {
    return window.ConversionTracker || null;
  }

  function send(name, properties) {
    var activeTracker = tracker();

    if (!activeTracker) {
      pending.push([name, properties || {}]);
      return;
    }

    activeTracker.track(name, properties || {});
  }

  function flushPending() {
    var activeTracker = tracker();
    var item;

    if (!activeTracker) return;

    while (pending.length) {
      item = pending.shift();
      activeTracker.track(item[0], item[1]);
    }
  }

  function roundedVisibleSeconds() {
    var total = visibleMs;

    if (visibleStartedAt !== null) {
      total += Date.now() - visibleStartedAt;
    }

    return Math.max(0, Math.round(total / 1000));
  }

  function updateScroll() {
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var depth = scrollable > 0 ? Math.round((window.scrollY / scrollable) * 100) : 100;
    var milestones = [25, 50, 75, 90, 100];
    var index;

    depth = Math.max(0, Math.min(100, depth));
    maxScroll = Math.max(maxScroll, depth);

    for (index = 0; index < milestones.length; index += 1) {
      if (depth >= milestones[index] && !sentScroll[milestones[index]]) {
        sentScroll[milestones[index]] = true;
        send("scroll_depth", {
          depth: milestones[index],
          seconds_visible: roundedVisibleSeconds()
        });
      }
    }
  }

  function installTimeMilestones() {
    var milestones = [10, 30, 60, 120];

    milestones.forEach(function (seconds) {
      window.setTimeout(function () {
        if (document.visibilityState !== "visible" || sentTime[seconds]) return;
        sentTime[seconds] = true;
        send("time_milestone", {
          seconds: seconds,
          max_scroll_depth: maxScroll
        });
      }, seconds * 1000);
    });
  }

  function installSectionTracking() {
    var sections = document.querySelectorAll("[data-chapter]");

    if (!("IntersectionObserver" in window) || !sections.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var element = entry.target;
        var key = element.getAttribute("data-chapter") || element.id || "unknown";

        if (!entry.isIntersecting || entry.intersectionRatio < 0.45 || seenSections[key]) return;

        seenSections[key] = true;
        send("section_view", {
          section_id: element.id || null,
          chapter: element.getAttribute("data-chapter") || null,
          section_name: element.getAttribute("data-chapter-title") || null,
          seconds_visible: roundedVisibleSeconds(),
          max_scroll_depth: maxScroll
        });
      });
    }, { threshold: [0.45] });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function installBuyTiming() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      var link;

      if (!target || typeof target.closest !== "function") return;
      link = target.closest("a");
      if (!link) return;

      if (
        !link.classList.contains("header-buy") &&
        !link.classList.contains("hero-buy-primary") &&
        !link.classList.contains("buy-button") &&
        !link.classList.contains("desktop-buy-dock") &&
        !link.closest(".mobile-buy") &&
        !link.closest(".menu-panel")
      ) {
        return;
      }

      send("buy_intent_timing", {
        seconds_to_click: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
        seconds_visible: roundedVisibleSeconds(),
        max_scroll_depth: maxScroll,
        placement: link.classList.contains("hero-buy-primary") ? "hero" :
          link.classList.contains("header-buy") ? "header" :
          link.classList.contains("desktop-buy-dock") ? "desktop_dock" :
          link.closest(".mobile-buy") ? "mobile_sticky" :
          link.closest(".menu-panel") ? "menu" : "offer"
      });
    }, true);
  }

  function sendSummary(reason) {
    if (summarySent) return;
    summarySent = true;

    send("session_summary", {
      reason: reason,
      duration_seconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
      visible_seconds: roundedVisibleSeconds(),
      max_scroll_depth: maxScroll,
      sections_viewed: Object.keys(seenSections).length,
      quick_exit: roundedVisibleSeconds() < 10 && maxScroll < 25
    });
  }

  function installErrorTracking() {
    window.addEventListener("error", function (event) {
      send("javascript_error", {
        message: String(event.message || "Unknown JavaScript error").slice(0, 500),
        filename: event.filename || null,
        line: event.lineno || null,
        column: event.colno || null
      });
    });

    window.addEventListener("unhandledrejection", function (event) {
      send("javascript_error", {
        message: String(event.reason || "Unhandled promise rejection").slice(0, 500),
        kind: "unhandledrejection"
      });
    });
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      visibleStartedAt = Date.now();
      flushPending();
    } else if (visibleStartedAt !== null) {
      visibleMs += Date.now() - visibleStartedAt;
      visibleStartedAt = null;
    }
  });

  window.addEventListener("scroll", updateScroll, { passive: true });
  window.addEventListener("pagehide", function () {
    sendSummary("pagehide");
  });
  window.addEventListener("beforeunload", function () {
    sendSummary("beforeunload");
  });

  installTimeMilestones();
  installSectionTracking();
  installBuyTiming();
  installErrorTracking();
  updateScroll();

  var trackerWait = window.setInterval(function () {
    flushPending();
    if (tracker()) window.clearInterval(trackerWait);
  }, 200);
})();
