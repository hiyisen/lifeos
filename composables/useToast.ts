export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

const toasts = ref<Toast[]>([]);
let nextId = 0;
let timerId: ReturnType<typeof setTimeout> | null = null;

export function useToast() {
  function add(type: Toast['type'], message: string) {
    const id = nextId++;
    toasts.value = [...toasts.value, { id, type, message }];
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      remove(id);
    }, 3000);
  }

  function remove(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return {
    toasts: readonly(toasts),
    success: (msg: string) => add('success', msg),
    error: (msg: string) => add('error', msg),
    info: (msg: string) => add('info', msg),
    remove,
  };
}
