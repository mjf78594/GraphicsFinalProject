#version 300 es

attribute vec3 aVertexPosition;
uniform mat4 uPMatrix; //Proj matrix
uniform mat4 uMVMatrix; //Model View Matrix
void main (void) {
  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}