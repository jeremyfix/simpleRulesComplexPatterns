class Ising extends ReactionDiffusion {
  constructor(canvas_id, controls_id, simulation_size, interpolate) {

    var shaders = {
      vshader: 'shaders/standardVertexShader.glsl',
      initializationFragmentShader: 'shaders/initializationFragmentShader.glsl',
      simulationFragmentShader: 'shaders/simulationFragmentShader.glsl',
      renderingFragmentShader: 'shaders/renderingFragmentShader.glsl'
    };

    super(canvas_id, controls_id, simulation_size, shaders, interpolate);

    this.uniforms.temperature = {
      type: "f",
      value: 0.1
    };

    this.uniforms.source_channel_idx.value = 0;

    this.gui.add(this.uniforms.temperature, 'value', 0, 1000.0);

  }
}
