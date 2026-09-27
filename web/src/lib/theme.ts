export type Theme = "human" | "ghoul";

export const THEME_STORAGE_KEY = "chestor-theme";

export function isTheme(value: unknown): value is Theme {
  return value === "human" || value === "ghoul";
}

export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  if (isTheme(stored)) return stored;
  return prefersDark ? "ghoul" : "human";
}

export function oppositeTheme(theme: Theme): Theme {
  return theme === "ghoul" ? "human" : "ghoul";
}

export const THEME_COLOR: Record<Theme, string> = {
  human: "#3390ec",
  ghoul: "#0e0b0c",
};

// Выполняется в <head> до первой отрисовки, поэтому без импортов и на ES5.
export const themeInitScript = `(function(){var t;try{t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})}catch(e){}if(t!=="human"&&t!=="ghoul"){t=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches?"ghoul":"human"}document.documentElement.setAttribute("data-theme",t)})();`;
