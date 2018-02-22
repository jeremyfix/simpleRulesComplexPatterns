varying vec2 vUv;

uniform float time;
uniform int source_channel_idx;
uniform sampler2D tSource;
uniform vec2 delta;

uniform vec2 mousePosition;
uniform bool mouseDown;

uniform bool running;
uniform float feed;
uniform float kill;

vec2 get_uv(vec2 pos) {
  return texture2D(tSource, pos).xy;
}

vec2 laplacian(vec2 pos) {
  return -4.0 * get_uv(pos) + get_uv(pos + vec2(0.0,  delta.y)) + get_uv(pos + vec2(0.0,  -delta.y)) +get_uv(pos + vec2(delta.x,  0.0)) +get_uv(pos + vec2(-delta.x,0.0));
}

void main() {
  vec2 uv = get_uv(vUv);
  vec2 new_uv;

  float coeff = 0.0;
  if(mouseDown) {
    vec2 diff = vUv - mousePosition;
    float dist = dot(diff, diff);
    if(dist <= 0.01) {
      coeff = exp(-dist/(2.0 * 0.02*0.02));
    }
  }

  float dt = 1.0;

  if(running) {
    float l = 2.5;

    float h = (l * delta.x) * (l * delta.y);
    float Du = 2.2 * pow(10.0, -5.0) / h ; // 2.0
    float Dv = 0.9 * pow(10.0, -5.0) / h; // 1.0

    vec2 lapl_uv = laplacian(vUv);
    float uvv = uv.x * uv.y * uv.y;
    float du = Du*lapl_uv.x - uvv + feed*(1.0 - uv.x);
    float dv = Dv*lapl_uv.y + uvv - (feed+kill)*uv.y;
    new_uv = uv + dt * vec2(du, dv);
  }
  else {
    new_uv = uv;
  }
  new_uv = (1.0 - coeff) * new_uv + coeff * vec2(0.0, 0.5);
  gl_FragColor = vec4(new_uv, 0.0, 0.0);
}
