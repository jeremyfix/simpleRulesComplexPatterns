varying vec2 vUv; // each in [0, 1]

uniform float time;
uniform int source_channel_idx;
uniform sampler2D tSource;
uniform vec2 delta;


// https://stackoverflow.com/questions/5149544/can-i-generate-a-random-number-inside-a-pixel-shaderhttps://stackoverflow.com/questions/5149544/can-i-generate-a-random-number-inside-a-pixel-shader
// https://math.stackexchange.com/questions/337782/pseudo-random-number-generation-on-the-gpu
// http://www.reedbeta.com/blog/quick-and-easy-gpu-random-numbers-in-d3d11/
// https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_ch37.html


float rand2(vec2 p)
{
  // We need irrationals for pseudo randomness.
  // Most (all?) known transcendental numbers will (generally) work.
  vec2 r = vec2(
    23.1406926327792690,  // e^pi (Gelfond's constant)
     2.6651441426902251); // 2^sqrt(2) (Gelfond–Schneider constant)
  return fract( cos( mod( 123456789.*time, 1e-7 + 256. * dot(p,r) ) ) );
}

float rand(vec2 co)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy +time,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

void main()
{
    bool state = rand(vUv) > 0.5;
    //bool state = gold_noise(vUv) > 0.5;

    gl_FragColor = vec4(state, 0.0, 0.0, 0.0);
}
