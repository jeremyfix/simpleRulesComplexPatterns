varying vec2 vUv;

uniform int source_channel_idx;
uniform sampler2D tSource;

uniform float value0;
uniform vec3 color0;
uniform float value1;
uniform vec3 color1;
uniform float value2;
uniform vec3 color2;

vec3 get_color_of_value(float value){
  if(value <= value0) {
    return color0;
  }
  else if(value <= value1) {
    return color0 + (value - value0)/(value1 - value0) * (color1 - color0);
  }
  else if(value <= value2){
    return color1 + (value - value1)/(value2 - value1) * (color2 - color1);
  }
  else {
    return color2;
  }
}

void main() {
  vec4 value = texture2D(tSource, vUv);
  float potential_value;
  if(source_channel_idx == 0) {
    potential_value = value.x;
  }
  else if(source_channel_idx == 1) {
    potential_value = value.y;
  }
  else if(source_channel_idx == 2) {
    potential_value = value.z;
  }
  gl_FragColor = vec4(get_color_of_value(potential_value), 1.0);
  /*
  vec3 color;
  if(vUv.x <= 0.0) {
    color.x = 0.0;
    color.y = 1.0;
    color.z = 0.0;
  }
  else if(vUv.x <= 1.0) {
    color.x = vUv.x;
    color.y = 0.0;
    color.z = 0.0;
  }
  else {
    color.x = 0.0;
    color.y = 0.0;
    color.z = 1.0;
  }
  gl_FragColor = vec4(color, 1.0);
*/
}
