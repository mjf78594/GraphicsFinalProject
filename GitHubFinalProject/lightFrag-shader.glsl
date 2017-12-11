#version 300 es
precision mediump float;
out vec4 fragColor;

precision mediump float;
vec4 encodeFloat (float depth) {
  vec4 bitShift = vec4(256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0);
  vec4 bitMask = vec4(0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0);
  vec4 comp = fract(depth * bitShift);
  comp -= comp.xxyz * bitMask;
  return comp;
}
void main() {
  // Encode the distance into the scene of this fragment.
  // We'll later decode this when rendering from our camera's
  // perspective and use this number to know whether the fragment
  // that our camera is seeing is inside of our outside of the shadow
  fragColor = encodeFloat(gl_FragCoord.z);
}