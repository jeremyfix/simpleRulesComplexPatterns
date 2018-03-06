varying vec2 vUv;

uniform float time;
uniform int source_channel_idx;
uniform sampler2D tSource;
uniform vec2 delta;

uniform vec2 mousePosition;
uniform bool mouseDown;

uniform bool running;
uniform float temperature;

float random(vec2 p)
{
  // We need irrationals for pseudo randomness.
  // Most (all?) known transcendental numbers will (generally) work.
  vec2 r = vec2(
    23.1406926327792690,  // e^pi (Gelfond's constant)
     2.6651441426902251); // 2^sqrt(2) (Gelfond–Schneider constant)
  return fract( cos( mod( 123456789.*time, 1e-7 + 256. * dot(p,r) ) ) );
}


float get_spin(vec2 pos) {
  return texture2D(tSource, pos).x;
}

void main() {
  float spin = get_spin(vUv);
  float spin_N = get_spin(vUv + vec2(0.0     , -delta.y));
  float spin_S = get_spin(vUv + vec2(0.0     ,  delta.y));
  float spin_E = get_spin(vUv + vec2(delta.x ,      0.0));
  float spin_W = get_spin(vUv + vec2(-delta.x,      0.0));
  if(running) {
  float dE = 2.0 * spin * (spin_N + spin_S + spin_E + spin_W);
  float pflip = exp(-temperature * dE);
  if(pflip >= 1.0) {
    spin = 1.0 - spin;
  }
  else {
    if(random(vUv) <= pflip) {
      spin = 1.0 - spin;
    }
  }
}
  gl_FragColor = vec4(spin, 0.0, 0.0, 0.0);
}
