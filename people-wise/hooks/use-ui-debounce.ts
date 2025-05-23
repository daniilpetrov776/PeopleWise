import { useRef, useState, useEffect } from "react";

type UseUiDebounceOptions = {
  delay?: number;
  initialBlocked?: boolean;
}

export const useUiDebounce = (options: UseUiDebounceOptions = {}) => {
  const {delay = 200, initialBlocked = false} = options;
  const [isUiBlocked, setIsUiBlocked] = useState(initialBlocked);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleUiDebounce = () => {
    if (isUiBlocked && timerRef.current) {
      clearTimeout(timerRef.current);
    } else if (!isUiBlocked) {
      setIsUiBlocked(true);
    }

    timerRef.current = setTimeout(() => {
      setIsUiBlocked(false);
    }, delay);
  };

    // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

    // Функция для принудительной разблокировки (на случай ошибок)
  const forceUnblock = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsUiBlocked(false);
  };

  return {
    isUiBlocked,
    handleUiDebounce,
    forceUnblock,
  };
};
