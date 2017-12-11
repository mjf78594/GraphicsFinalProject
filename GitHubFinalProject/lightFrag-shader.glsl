#version 300 es
precision mediump float;
out vec4 fragColor;

precision mediump float;

//Encodes a float by using a bit shift and mask, gets decoded later//
vec4 encodeFloat (float depth) {
  vec4 bitShift = vec4(256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0);
  vec4 bitMask = vec4(0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0);
  vec4 comp = fract(depth * bitShift);
  comp -= comp.xxyz * bitMask;
  return comp;
}
void main() {
  // Encode the distance into the scene of this fragment. This will get decoded in the camera shader to determine
  // whether or not the fragment is in or out of a certain shadow
  fragColor = encodeFloat(gl_FragCoord.z);
}