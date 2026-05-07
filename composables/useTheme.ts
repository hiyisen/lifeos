type Theme = 'light' | 'dark' | 'system';

function getStoredTheme(): Theme {
  if (import.meta.server) return 'system';
  return (localStorage.getItem('lifeos-theme') as Theme) || 'system';
}

function isDark(t: Theme): boolean {
  if (t === 'dark') return true;
  if (t === 'light') return false;
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(t: Theme) {
  const dark = isDark(t);
  document.documentElement.classList.toggle('dark', dark);
}

export function useTheme() {
  const theme = ref<Theme>(getStoredTheme());

  if (import.meta.client) {
    applyTheme(theme.value);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', () => {
      if (theme.value === 'system') applyTheme('system');
    });
  }

  const setTheme = (t: Theme) => {
    theme.value = t;
    localStorage.setItem('lifeos-theme', t);
    applyTheme(t);
  };

  const isDarkMode = computed(() => isDark(theme.value));

  return { theme, setTheme, isDarkMode };
}
