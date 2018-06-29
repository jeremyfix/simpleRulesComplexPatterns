varying vec2 vUv;

uniform float time;
uniform int source_channel_idx;
uniform sampler2D tSource;
uniform vec2 delta;

uniform vec2 mousePosition;
uniform bool mouseDown;

uniform bool running;
uniform float temperature;

// Per pixel sequence of random numbers
// https://www.shadertoy.com/view/4s2cWR

// float random(vec2 p) {
//   // We need irrationals for pseudo randomness.
//   // Most (all?) known transcendental numbers will (generally) work.
//   vec2 r = vec2(23.1406926327792690, // e^pi (Gelfond's constant)
//                 2.6651441426902251); // 2^sqrt(2) (Gelfond–Schneider constant)
//   return fract(cos(mod(123456789. * time, 1e-7 + 256. * dot(p, r))));
// }


float rand(vec2 co)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy + time,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c );
}

float get_spin(vec2 pos) { return 2.0 * (texture2D(tSource, pos).x-0.5); }

void main() {
  float spin = get_spin(vUv);
  
  float spin_N = get_spin(vUv + vec2(0.0, -delta.y));
  float spin_S = get_spin(vUv + vec2(0.0, delta.y));
  float spin_E = get_spin(vUv + vec2(delta.x, 0.0));
  float spin_W = get_spin(vUv + vec2(-delta.x, 0.0));
  if (running) {
      float dE = 2.0 * spin * (spin_N + spin_S + spin_E + spin_W);
      if(rand(vUv) >= 0.1) {
      if (dE <= 0.0) {
        spin = 1.0 - spin;
      } else {
        float pflip = exp(-temperature * dE);
        if (rand(vUv) <= pflip) {
         spin = 1.0 - spin;
        }
      }
      }
  }

  gl_FragColor = vec4(spin, 0.0, 0.0, 0.0);
  
//  bool state = rand(vUv) > 0.5;	
//  gl_FragColor = vec4(state, 0.0, 0.0, 0.0);
}
