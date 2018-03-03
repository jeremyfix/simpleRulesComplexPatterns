class Grayscott extends ReactionDiffusion {
  constructor(canvas_id, controls_id, simulation_size) {

    var shaders = {
      vshader: 'shaders/standardVertexShader.glsl',
      initializationFragmentShader: 'shaders/initializationFragmentShader.glsl',
      simulationFragmentShader: 'shaders/simulationFragmentShader.glsl',
      renderingFragmentShader: 'shaders/renderingFragmentShader.glsl'
    };

    super(canvas_id, controls_id, simulation_size, shaders);


    this.presets = {
      "worms": {
        // Worms
        kill: 0.063,
        feed: 0.046
      },
      "solitons": {
        // Solitons
        kill: 0.062,
        feed: 0.03
      },
      "pulse solitons": {
        // Solitons
        kill: 0.059,
        feed: 0.020
      },
      "waves": {
        kill: 0.045,
        feed: 0.014
      }
    };
    this.preset = "worms";

    this.uniforms.feed = {
      type: "f",
      value: this.presets[this.preset].feed
    };
    this.uniforms.kill = {
      type: "f",
      value: this.presets[this.preset].kill
    };

    this.gui.add(this, 'preset', Object.keys(this.presets)).name("Preset").onChange(this.on_preset.bind(this));

  }

  on_preset() {
    this.uniforms.feed.value = this.presets[this.preset].feed;
    this.uniforms.kill.value = this.presets[this.preset].kill;
  }
  /*
      render_display() {
        super.render_display();
      }
      */
}
