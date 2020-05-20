import {
  Math as CMath
} from 'cesium'

export const randomizeParticles = function (maxParticles, viewerParameters, data) {
  const array = new Float32Array(4 * maxParticles)
  for (let i = 0; i < maxParticles; i++) {
    array[4 * i] = CMath.randomBetween(viewerParameters.lonRange.x, viewerParameters.lonRange.y)
    array[4 * i + 1] = CMath.randomBetween(viewerParameters.latRange.x, viewerParameters.latRange.y)
    array[4 * i + 2] = CMath.randomBetween(data.lev.min, data.lev.max)
    array[4 * i + 3] = 0.0
  }
  return array
}
