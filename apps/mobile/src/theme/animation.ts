import { Easing } from 'react-native-reanimated';

export const ANIMATION_TIMING = {
  buttonPress: 120,
  cardSelect: 200,
  cardPlay: 300,
  cardDraw: 320,
  modalEntrance: 220,
  screenTransition: 260,
  reverseEffect: 350,
  victoryCelebration: 1200,
  goldPulseDuration: 1800,
};

export const SPRING_CONFIG = {
  cardLift: {
    damping: 14,
    stiffness: 160,
    mass: 0.6,
  },
  buttonTap: {
    damping: 12,
    stiffness: 200,
  },
  modalPopup: {
    damping: 16,
    stiffness: 140,
  },
};

export const EASING_CURVES = {
  natural: Easing.bezier(0.25, 0.1, 0.25, 1),
  sharp: Easing.bezier(0.4, 0, 0.2, 1),
  smoothOut: Easing.out(Easing.quad),
};
