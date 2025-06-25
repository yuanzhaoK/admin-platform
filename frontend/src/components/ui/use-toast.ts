import { useCallback, useState } from "react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}

interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      ...options,
    };

    setToasts((prev) => [...prev, newToast]);

    // 显示简单的浏览器通知（临时解决方案）
    if (options.variant === "destructive") {
      alert(
        `错误: ${options.title}${
          options.description ? `\n${options.description}` : ""
        }`,
      );
    } else {
      alert(
        `${options.title}${
          options.description ? `\n${options.description}` : ""
        }`,
      );
    }

    // 3秒后自动移除
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toast,
    dismiss,
    toasts,
  };
}
