#version 300 es
precision mediump float;

in vec4 fSpecularColor;
in float fSpecularExponent;
in vec3 N;
in vec4 color;
in vec3 positionToLight;
in vec4 eyePosition;
in vec3 eye;

out vec4  fColor;

uniform highp vec4 light_position[4]; //A location in space
uniform highp vec4 light_color[4];
uniform highp vec4 ambient_light;
uniform highp vec4 spotlight_color;
uniform highp vec4 spotlight_position;
uniform highp vec4 spotlight_direction;
uniform highp float cutoff;

void main() {
    //Re-normalize
    vec3 newN = normalize(N);
    vec3 toLight = normalize(positionToLight);
    vec4 veyepos = eyePosition;
    vec3 E = eye;

    //Vector from where I am to where the light is, and then normalize for the lighting equation
    vec3 L1 = normalize(light_position[0].xyz - veyepos.xyz); //Using swizzling
    vec3 L2 = normalize(light_position[1].xyz - veyepos.xyz);
    vec3 L3 = normalize(light_position[2].xyz - veyepos.xyz);
    vec3 L4 = normalize(light_position[3].xyz - veyepos.xyz);

    vec3 sLight = normalize(spotlight_position.xyz - veyepos.xyz);

    //The halfway vector
    vec3 H1 = normalize(L1+E);
    vec3 H2 = normalize(L2+E);
    vec3 H3 = normalize(L3+E);
    vec3 H4 = normalize(L4+E);
    vec3 sLightH = normalize(sLight+E);

    vec4 amb = color * ambient_light;

    bool isLit = max(dot(vec3(spotlight_direction), -sLight), 0.0) > cutoff;

    vec4 diff1 = max(dot(L1, newN), 0.0) * color * light_color[0];
    vec4 diff2 = max(dot(L2, newN), 0.0) * color * light_color[1];
    vec4 diff3 = max(dot(L3, newN), 0.0) * color * light_color[2];
    vec4 diff4 = max(dot(L4, newN), 0.0) * color * light_color[3];

    vec4 diff = diff1 + diff2 + diff3 + diff4;
    if(isLit) {
        diff += max(dot(sLight, newN), 0.0) * color * spotlight_color;
    }

    vec4 spec1 = fSpecularColor * light_color[0] * pow(max(dot(newN, H1), 0.0), fSpecularExponent);
    if(dot(L1, newN) < 0.0) { //Backside of object (Only needs to be checked in bling-phong, not regular bling)
        spec1 = vec4(0,0,0,1);
    }
    vec4 spec2 = fSpecularColor * light_color[1] * pow(max(dot(newN, H2), 0.0), fSpecularExponent);
    if(dot(L2, newN) < 0.0) { //Backside of object (Only needs to be checked in bling-phong, not regular bling)
        spec2 = vec4(0,0,0,1);
    }
    vec4 spec3 = fSpecularColor * light_color[2] * pow(max(dot(newN, H3), 0.0), fSpecularExponent);
    if(dot(L3, newN) < 0.0) { //Backside of object (Only needs to be checked in bling-phong, not regular bling)
        spec3 = vec4(0,0,0,1);
    }
    vec4 spec4 = fSpecularColor * light_color[3] * pow(max(dot(newN, H4), 0.0), fSpecularExponent);
    if(dot(L4, newN) < 0.0) { //Backside of object (Only needs to be checked in bling-phong, not regular bling)
        spec4 = vec4(0,0,0,1);
    }

    vec4 spec = spec1 + spec2 + spec3 + spec4;
    if(isLit) {
        spec += fSpecularColor * spotlight_color * pow(max(dot(newN, sLightH), 0.0), fSpecularExponent);
    }

    fColor = amb + diff + spec;
    fColor.a = 1.0;
}