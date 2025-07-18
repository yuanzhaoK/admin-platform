import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 性能优化工具
export const debounce = <T extends (...args: never[]) => unknown>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: never[]) => unknown>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// 数据验证工具
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// 格式化工具
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

// 缓存工具
export const createCache = <T>() => {
  const cache = new Map<string, { value: T; timestamp: number }>();
  const maxAge = 5 * 60 * 1000; // 5分钟

  return {
    get: (key: string): T | undefined => {
      const item = cache.get(key);
      if (!item) return undefined;

      if (Date.now() - item.timestamp > maxAge) {
        cache.delete(key);
        return undefined;
      }

      return item.value;
    },

    set: (key: string, value: T): void => {
      cache.set(key, { value, timestamp: Date.now() });
    },

    clear: (): void => {
      cache.clear();
    },

    delete: (key: string): boolean => {
      return cache.delete(key);
    },
  };
};

// 性能监控工具
export const measurePerformance = (
  name: string,
  fn: () => void,
): number => {
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;

  console.log(`${name} took ${duration.toFixed(2)}ms`);
  return duration;
};

// 错误处理工具
export const safeParseJSON = <T>(str: string): T | null => {
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
};

// 图片优化工具
export const getOptimizedImageUrl = (
  url: string,
  width?: number,
  height?: number,
): string => {
  if (!url) return "";

  // 如果是外部图片，添加优化参数
  if (url.startsWith("http")) {
    const params = new URLSearchParams();
    if (width) params.set("w", width.toString());
    if (height) params.set("h", height.toString());
    params.set("q", "80");
    params.set("f", "webp");

    return `${url}?${params.toString()}`;
  }

  return url;
};

// 数据分页工具
export const paginateArray = <T>(
  array: T[],
  pageSize: number,
  pageNumber: number,
): T[] => {
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return array.slice(startIndex, endIndex);
};

// 深拷贝工具
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as T;
  if (typeof obj === "object") {
    const cloned = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
};
