import { ISourceOptions } from "@tsparticles/engine";

export const snowOptions = {
  background: {
    color: "transparent" //transparent
  },
   particles: {
    color: { value: "#b1b3b1" },
    move: {
      direction: "bottom",
      enable: true,
      outModes: "out",
      speed: 2
    },
    number: {
      density: {
        enable: true,
        area: 1000
      },
      value: 800
    },
    opacity: {
      value: 0.7
    },
    shape: {
      type: "circle"
    },
    size: {
      value: 6
    },
    wobble: {
      enable: true,
      distance: 10,
      speed: 10
    },
    zIndex: {
      value: { min: 0, max: 200 }
    }
  }
} as ISourceOptions