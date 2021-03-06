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

//Pass out the shadowPositions
out vec4 sShadowPos;
out vec4 rShadowPos;
out vec4 gShadowPos;
out vec4 bShadowPos;
out vec4 wShadowPos;

uniform mat4 mv;
uniform mat4 proj;
uniform vec4 light_position[4]; //A location in space
uniform vec4 light_color[4];
uniform vec4 ambient_light;
uniform vec4 spotlight_color;
uniform vec4 spotlight_position;
uniform vec4 spotlight_direction;

//Take in uniforms of the individual lights model views and the projection matrix used for the lights
uniform mat4 sLightMV;
uniform mat4 rLightMV;
uniform mat4 gLightMV;
uniform mat4 bLightMV;
uniform mat4 wLightMV;
uniform mat4 lightProj;

// Used to normalize our coordinates from clip space to (0 - 1)
// so that we can access the corresponding point in our depth color texture
const mat4 texUnitConverter = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);

void main() {
    vec4 veyepos = mv * vPosition; //vertex position in eyespace

    vec3 toLight = vec3(spotlight_direction - vPosition);

    //E for eye
    vec3 E = normalize(-veyepos.xyz);


    //Swizzle off just the xyz part since that's all we care about
    vec3 normal = normalize(mv * vNormal).xyz;

    gl_Position = proj * veyepos;

    //Now we calculate the positions of the shadow based on that specific light sources model view matrix
    //The Projection Matrix stays the same for all 5 lights
    sShadowPos = texUnitConverter * lightProj * sLightMV * vPosition;
    rShadowPos = texUnitConverter * lightProj * rLightMV * vPosition;
    gShadowPos = texUnitConverter * lightProj * gLightMV * vPosition;
    bShadowPos = texUnitConverter * lightProj * bLightMV * vPosition;
    wShadowPos = texUnitConverter * lightProj * wLightMV * vPosition;

    //Pass over the rest of the variables we need for phong lighting
    N = normal;
    eye = E;
    fAmbientDiffuseColor = vAmbientDiffuseColor;
    fSpecularColor = vSpecularColor;
    fSpecularExponent = vSpecularExponent;
    color = vColor;
    positionToLight = toLight;
    eyePosition = veyepos;
}