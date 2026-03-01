/**
 * Theme Toggle — Dark / Light / System
 *
 * Three-state toggle with localStorage persistence.
 * The inline <script> in <head> prevents flash of wrong theme (FOWT).
 * This file handles the interactive toggle after page load.
 *
 * States:
 *   "light"  -> data-theme="light"  on <html>, forces light
 *   "dark"   -> data-theme="dark"   on <html>, forces dark
 *   "system" -> no data-theme attr  on <html>, follows OS preference
 */

(function () {
  const STORAGE_KEY = "ds-theme";

  // Cycle order: system -> light -> dark -> system
  const CYCLE = ["system", "light", "dark"];

  // Icons for each state (using simple text; swap for SVGs in production)
  const ICONS = {
    system: "\u{1F4BB}", // laptop emoji
    light: "\u2600\uFE0F",  // sun
    dark: "\uD83C\uDF19",   // moon
  };

  const LABELS = {
    system: "Theme: System",
    light: "Theme: Light",
    dark: "Theme: Dark",
  };

  /**
   * Apply the given theme to the document.
   */
  function applyTheme(theme) {
    const root = document.documentElement;

    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      // system: remove override, let prefers-color-scheme handle it
      root.removeAttribute("data-theme");
    }
  }

  /**
   * Get the current stored theme, defaulting to "system".
   */
  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) || "system";
    } catch {
      return "system";
    }
  }

  /**
   * Persist the theme choice.
   */
  function storeTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // localStorage unavailable (private browsing, etc.)
    }
  }

  /**
   * Update the toggle button's icon and aria-label.
   */
  function updateToggleButton(button, theme) {
    const iconEl = button.querySelector(".theme-toggle__icon");
    if (iconEl) {
      iconEl.textContent = ICONS[theme];
    }
    button.setAttribute("aria-label", LABELS[theme]);
    button.setAttribute("title", LABELS[theme]);
  }

  /**
   * Initialize: apply stored theme and set up the toggle button.
   */
  function init() {
    const currentTheme = getStoredTheme();
    applyTheme(currentTheme);

    const toggleButton = document.getElementById("theme-toggle");
    if (!toggleButton) return;

    updateToggleButton(toggleButton, currentTheme);

    toggleButton.addEventListener("click", function () {
      const stored = getStoredTheme();
      const currentIndex = CYCLE.indexOf(stored);
      const nextIndex = (currentIndex + 1) % CYCLE.length;
      const nextTheme = CYCLE[nextIndex];

      applyTheme(nextTheme);
      storeTheme(nextTheme);
      updateToggleButton(toggleButton, nextTheme);
    });

    // Listen for OS theme changes so the button label updates
    // when in "system" mode and the user changes their OS theme.
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", function () {
        const current = getStoredTheme();
        if (current === "system") {
          updateToggleButton(toggleButton, "system");
        }
      });
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
