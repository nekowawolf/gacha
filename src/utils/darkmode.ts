let themeFrame: number | undefined;

export function toggleDarkMode() {
  const root = document.documentElement;
  if (themeFrame !== undefined) cancelAnimationFrame(themeFrame);
  root.classList.add("theme-changing");
  const isLight = root.classList.toggle("darkmode");
  // Flush the new palette while transitions are disabled, then restore hover effects.
  void getComputedStyle(document.body).color;
  themeFrame = requestAnimationFrame(() => {
    themeFrame = requestAnimationFrame(() => {
      root.classList.remove("theme-changing");
      themeFrame = undefined;
    });
  });
  try {
    if (isLight) localStorage.setItem("darkmode", "active");
    else localStorage.removeItem("darkmode");
  } catch { /* The theme still works when browser storage is blocked. */ }
}