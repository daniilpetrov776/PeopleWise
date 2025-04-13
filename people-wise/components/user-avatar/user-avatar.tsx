import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

const DefaultUserAvatar = () => (
  <Svg width="100" height="100" viewBox="0 0 100 100">
    <Circle cx="50" cy="30" r="20" fill="#cccccc" />
    <Path
      d="M20,90 C20,70 80,70 80,90 Z"
      fill="#cccccc"
    />
  </Svg>
);

export default DefaultUserAvatar;
