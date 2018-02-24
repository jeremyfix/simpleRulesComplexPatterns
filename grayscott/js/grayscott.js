
class Grayscott extends ReactionDiffusion {
    constructor(canvas_id, controls_id, simulation_size) {

      var shaders = {
          vshader: 'shaders/standardVertexShader.glsl',
          initializationFragmentShader: 'shaders/initializationFragmentShader.glsl',
          simulationFragmentShader: 'shaders/simulationFragmentShader.glsl',
          renderingFragmentShader: 'shaders/renderingFragmentShader.glsl'
        };

	      super(canvas_id, controls_id, simulation_size, shaders);
    }
}
