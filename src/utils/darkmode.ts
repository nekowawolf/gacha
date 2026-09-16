export function toggleDarkMode() {
  const isLight = document.documentElement.classList.toggle("darkmode");
  try {
    if (isLight) localStorage.setItem("darkmode", "active");
    else localStorage.removeItem("darkmode");
  } catch { /* The theme still works when browser storage is blocked. */ }
}