// import { useRef } from 'react';
// import { Animated } from 'react-native';

// export function useCardAnimation() {
//   const scale = useRef(new Animated.Value(1)).current;
//   const saveButtonAnim = useRef(new Animated.Value(0)).current;    // ← вот она
//   const shadowDistance = useRef(new Animated.Value(25)).current;

//   const enter = () => {
//     Animated.spring(scale, { toValue: 1.1, friction: 3, useNativeDriver: true }).start();
//     Animated.spring(saveButtonAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
//     Animated.timing(shadowDistance, { toValue: 40, duration: 300, useNativeDriver: false }).start();
//   };

//   /**
//    * leave(callback)
//    * 1) Скрывает кнопку (анимация saveButtonAnim → 0)
//    * 2) Вызывает callback (в вашем случае — setIsEditing(false))
//    * 3) Запускает обратные анимации scale и shadowDistance
//    */
//   const leave = (afterHide: () => void) => {
//     Animated.timing(saveButtonAnim, {
//       toValue: 0,
//       duration: 300,
//       useNativeDriver: true,
//     }).start(() => {
//       // Шаг 2: отключаем режим редактирования
//       afterHide();

//       // Шаг 3: обратные анимации
//       Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
//       Animated.timing(shadowDistance, { toValue: 25, duration: 300, useNativeDriver: false }).start();
//     });
//   };

//   return { scale, saveButtonAnim, shadowDistance, enter, leave };
// }

import { useCallback } from 'react';
import { Platform } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS
} from 'react-native-reanimated';

export function useCardAnimation() {
  // Shared values
  const scale = useSharedValue(1);
  const saveButton = useSharedValue(0);
  const shadowDistance = useSharedValue(25);

  // Animated styles for the card container
  const animatedStyle = useAnimatedStyle(() => {
    // Base transform and Android elevation
    const style: any = {
      transform: [{ scale: scale.value }],
      elevation: shadowDistance.value,
    };
    // iOS-only shadow properties
    if (Platform.OS === 'ios') {
      style.shadowOffset = { width: 0, height: shadowDistance.value };
      style.shadowOpacity = 0.3;
      style.shadowRadius = shadowDistance.value;
    }
    return style;
  });

  // Animated style for the save button
  const saveButtonStyle = useAnimatedStyle(() => ({
    opacity: saveButton.value,
    transform: [{ translateY: interpolate(saveButton.value, [0, 1], [20, 0]) }],
  }));

  // Triggered when entering edit mode
  const enter = useCallback(() => {
    scale.value = withSpring(1.1, { damping: 10, stiffness: 100 });
    saveButton.value = withSpring(1, { damping: 12, stiffness: 120 });
    shadowDistance.value = withTiming(40, { duration: 300 });
  }, [scale, saveButton, shadowDistance]);

  // Triggered when exiting edit mode
  const leave = useCallback((afterHide: () => void) => {
    // Hide save button first
    saveButton.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) {
        // Callback to switch UI state must run on JS thread
        runOnJS(afterHide)();
        // Return card to default
        scale.value = withSpring(1, { damping: 10, stiffness: 100 });
        shadowDistance.value = withTiming(25, { duration: 300 });
      }
    });
  }, [saveButton, scale, shadowDistance]);

  return {
    animatedStyle,
    saveButtonStyle,
    enter,
    leave,
  };
}
