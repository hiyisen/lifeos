type Theme = 'light' | 'dark' | 'system';

function getStoredTheme(): Theme {
  if (import.meta.server) return 'system';
  return (localStorage.getItem('lifeos-theme') as Theme) || 'system';
}

function isDark(t: Theme): boolean {
  if (t === 'dark') return true;
  if (t === 'light') return false;
  if (import.meta.server) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(t: Theme) {
  if (import.meta.server) return;
  document.documentElement.classList.toggle('dark', isDark(t));
}

// Module-level singleton — all useTheme() callers share the same ref
const _theme = ref<Theme>('system');
let _initialized = false;

export function useTheme() {
  if (!_initialized) {
    _initialized = true;
    _theme.value = getStoredTheme();

    if (import.meta.client) {
      applyTheme(_theme.value);

      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', () => {
        if (_theme.value === 'system') applyTheme('system');
      });
    }
  }

  const setTheme = (t: Theme) => {
    _theme.value = t;
    if (import.meta.client) {
      localStorage.setItem('lifeos-theme', t);
    }
    applyTheme(t);
  };

  const isDarkMode = computed(() => isDark(_theme.value));

  return { theme: _theme, setTheme, isDarkMode };
}
