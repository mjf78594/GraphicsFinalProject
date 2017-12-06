#version 300 es

in vec4 vPosition;
uniform mat4 uPMatrix; //Proj matrix
uniform mat4 uMVMatrix; //Model View Matrix
void main (void) {
  gl_Position = uPMatrix * uMVMatrix * vPosition;
}