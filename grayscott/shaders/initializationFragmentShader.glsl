varying vec2 vUv; // each in [0, 1]

uniform float time;
uniform int source_channel_idx;
uniform sampler2D tSource;
uniform vec2 delta;
// https://stackoverflow.com/questions/5149544/can-i-generate-a-random-number-inside-a-pixel-shaderhttps://stackoverflow.com/questions/5149544/can-i-generate-a-random-number-inside-a-pixel-shader
// https://math.stackexchange.com/questions/337782/pseudo-random-number-generation-on-the-gpu
// http://www.reedbeta.com/blog/quick-and-easy-gpu-random-numbers-in-d3d11/
// https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_ch37.html
float random(vec2 p)
{
  // We need irrationals for pseudo randomness.
  // Most (all?) known transcendental numbers will (generally) work.
  vec2 r = vec2(
    23.1406926327792690,  // e^pi (Gelfond's constant)
     2.6651441426902251); // 2^sqrt(2) (Gelfond–Schneider constant)
  return fract( cos( mod( 123456789., 1e-7 + 256. * dot(p,r) ) ) );
}

float rand(vec2 co)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c * time);
}

void main()
{
    float iu;
    float iv;
    iu = 1.0;
    iv = 0.0;
    float dn = 0.15;
    if( (vUv.x >= (0.5-dn)) && (vUv.x <= (0.5+dn)) && (vUv.y >= (0.5-dn)) && (vUv.y <= (0.5+dn))) {
      iu = 0.5;
      iv = 0.25;
    }
    iu = clamp(iu + 0.2 * (2.0 * random(vUv) - 1.0), 0.0, 1.0);
    iv = clamp(iv + 0.2 * (2.0 * random(vUv+3.0*delta) - 1.0), 0.0, 1.0);

    gl_FragColor = vec4(iu, iv, 0.0, 0.0);
}
