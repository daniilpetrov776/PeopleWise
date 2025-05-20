import { useRef } from 'react';
import { Animated } from 'react-native';

export function useCardAnimation() {
  const scale = useRef(new Animated.Value(1)).current;
  const saveButtonAnim = useRef(new Animated.Value(0)).current;    // ← вот она
  const shadowDistance = useRef(new Animated.Value(25)).current;

  const enter = () => {
    Animated.spring(scale, { toValue: 1.1, friction: 3, useNativeDriver: true }).start();
    Animated.spring(saveButtonAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
    Animated.timing(shadowDistance, { toValue: 40, duration: 300, useNativeDriver: false }).start();
  };

  /**
   * leave(callback)
   * 1) Скрывает кнопку (анимация saveButtonAnim → 0)
   * 2) Вызывает callback (в вашем случае — setIsEditing(false))
   * 3) Запускает обратные анимации scale и shadowDistance
   */
  const leave = (afterHide: () => void) => {
    Animated.timing(saveButtonAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Шаг 2: отключаем режим редактирования
      afterHide();

      // Шаг 3: обратные анимации
      Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
      Animated.timing(shadowDistance, { toValue: 25, duration: 300, useNativeDriver: false }).start();
    });
  };

  return { scale, saveButtonAnim, shadowDistance, enter, leave };
}
