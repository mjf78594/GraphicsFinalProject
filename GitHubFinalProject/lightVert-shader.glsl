#version 300 es

in vec4 vPosition;
uniform mat4 proj; //Projection matrix
uniform mat4 mv; //Model View Matrix
void main (void) {
  gl_Position = proj * mv * vPosition;
}