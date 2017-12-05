#version 300 es

in vec4 vPosition;
in vec4 vAmbientDiffuseColor;
in vec4 vNormal;
in vec4 vColor;
in vec4 vSpecularColor;
in float vSpecularExponent; //Scalar so comes in as a float

out vec4 fAmbientDiffuseColor;
out vec4 fSpecularColor;
out float fSpecularExponent;
out vec4 color;
out vec3 N;
out vec3 H1;
out vec3 H2;
out vec3 H3;
out vec3 H4;
out vec3 positionToLight;
out vec4 eyePosition;
out vec3 eye;

uniform mat4 mv;
uniform mat4 proj;
uniform vec4 light_position[4]; //A location in space
uniform vec4 light_color[4];
uniform vec4 ambient_light;
uniform vec4 spotlight_color;
uniform vec4 spotlight_position;
uniform vec4 spotlight_direction;
uniform float cutoff;
uniform float t;
uniform vec2 controlPoints[4];

void main() {
    vec4 veyepos = mv * vPosition; //vertex position in eyespace

    vec3 toLight = vec3(spotlight_direction - vPosition);

    //E for eye
    vec3 E = normalize(-veyepos.xyz);


    //Swizzle off just the xyz part since that's all we care about
    vec3 normal = normalize(mv * vNormal).xyz;

    gl_Position = proj * veyepos;

    N = normal;
    eye = E;
    fAmbientDiffuseColor = vAmbientDiffuseColor;
    fSpecularColor = vSpecularColor;
    fSpecularExponent = vSpecularExponent;
    color = vColor;
    positionToLight = toLight;
    eyePosition = veyepos;
}