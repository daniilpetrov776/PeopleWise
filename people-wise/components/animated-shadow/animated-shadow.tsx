import React, { forwardRef } from "react";
import { useEffect, useState } from "react";
import { Animated, StyleSheet } from "react-native";
import { Shadow } from "react-native-shadow-2";

type AnimatedShadowProps = {
  distance: Animated.Value;
  children: React.ReactNode;
}

const AnimatedShadow = forwardRef((props: AnimatedShadowProps, _ref) => {
  const { distance, children } = props;
  const [value, setValue] = useState(20);

  useEffect(() => {
    const id = distance.addListener(({ value }) => {
      setValue(value);
    });

    return () => distance.removeListener(id);
  }, [distance]);

  return (
    <Shadow
      distance={value}
      offset={[0, 0]}
      startColor="rgba(200, 17, 231, 0.4)"
      containerStyle={styles.shadowContainer}
    >
      {children}
    </Shadow>
  );
})

const styles = StyleSheet.create({
  shadowContainer: {
    alignSelf: "center",
  },
});

export default AnimatedShadow;
