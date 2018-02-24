var hex_to_rgb = function(hex_value) {
    var color = new THREE.Color(hex_value);
    return new THREE.Vector3(color.r, color.g, color.b);
}

class ReactionDiffusion {

    constructor(canvas_id, controls_id, simulation_size, render_size, shaders) {

	this.canvas = $("#" + canvas_id)[0];
	this.controls_id = controls_id;

	this.t0_seconds = new Date().getTime() / 1000;
	this.frame_rate = {
	    fps: 0.0,
	    last_time: this.t0_seconds,
	    frame_idx: 0
	};

	this.simulation_size = simulation_size;

	this.presets = {
	    "worms" : {
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

	this.nb_render_per_steps = 50;

	this.call_init = true;
	this.start_pause = true;
	this.is_fullscreen_mode = false;
	this.render_size = render_size;

	this.shaders = shaders;
	this.gui_width = 300;

	this.gradient = [
	    {
		value: 0.0,
		color: 0x03001E
	    },
	    {
		value: 0.25,
		color: 0x7303C0
	    },
	    {
		value: 0.5,
		color: 0xEC38BC
	    }
	];

	this.init_textures();
	this.init_materials();
	this.init_scene();
	this.init_camera();
	this.init_renderer();

	this.init_callbacks();
	this.init_gui();

	this.resizeCanvas();

	// Start the callback
	this.step(0);
    }



    //////////////////////// Initialization functions //////////////////////////////

    init_textures() {
	this.mTextureBuffer0 = new THREE.WebGLRenderTarget(
	    this.simulation_size.width, this.simulation_size.height, {
		minFilter: THREE.NearestFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat,
		type: THREE.FloatType,
		wrapS: THREE.RepeatWrapping,
		wrapT: THREE.RepeatWrapping
	    });
	this.mTextureBuffer1 = new THREE.WebGLRenderTarget(
	    this.simulation_size.width, this.simulation_size.height, {
		minFilter: THREE.NearestFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat,
		type: THREE.FloatType,
		wrapS: THREE.RepeatWrapping,
		wrapT: THREE.RepeatWrapping
	    });
	this.mTextureBuffer2 = new THREE.WebGLRenderTarget(
	    this.simulation_size.width, this.simulation_size.height, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBAFormat,
		type: THREE.FloatType,
		wrapS: THREE.RepeatWrapping,
		wrapT: THREE.RepeatWrapping
	    });

	this.uniforms = {
	    time: {
		type: "f",
		value: new Date().getTime() / 1000
	    },
	    source_channel_idx: {
		value: 1
	    },
	    tSource: {
		type: "t",
		value: undefined
	    },
	    delta: {
		type: "v2",
		value: new THREE.Vector2(1. / this.simulation_size.width, 1. / this.simulation_size.height)
	    },
	    mousePosition: {
		type: "v2",
		value: new THREE.Vector2(0.0, 0.0)
	    },
	    mouseDown: {
		type: "b",
		value: false
	    },
	    running: {
		type: "b",
		value: this.start_pause
	    },
	    feed: {
		type: "f",
		value: this.presets[this.preset].feed
	    },
	    kill: {
		type: "f",
		value: this.presets[this.preset].kill
	    },
	    value0: {
		type: "f",
		value: this.gradient[0].value
	    },
	    color0 : {
		type: "v3",
		value: hex_to_rgb(this.gradient[0].color)
	    },
	    value1: {
		type: "f",
		value: this.gradient[1].value
	    },
	    color1 : {
		type: "v3",
		value: hex_to_rgb(this.gradient[1].color)
	    },
	    value2: {
		type: "f",
		value: this.gradient[2].value
	    },
	    color2 : {
		type: "v3",
		value: hex_to_rgb(this.gradient[2].color)
	    }
	};
	this.front_buffer = 0;
	this.iteration = 0;
	var col = hex_to_rgb(this.gradient[0].color);
	console.log(col);
    }

    init_materials() {

	var load_shader = function(url) {
	    return $.ajax(url, {
		async: false
	    }).responseText;
	};

	var shd_src = load_shader(this.shaders.vshader);

	this.materials = {
	    textMat: new THREE.MeshBasicMaterial({
		color: 0xffff00,
		side: THREE.DoubleSide
	    }),
	    // Shaders used for initializing the front buffer
	    initializationMaterial: new THREE.ShaderMaterial({
		uniforms: this.uniforms,
		vertexShader: load_shader(this.shaders.vshader),
		fragmentShader: load_shader(this.shaders.initializationFragmentShader)
	    }),
	    // Shaders used for performing the simulation
	    simulationMaterial: new THREE.ShaderMaterial({
		uniforms: this.uniforms,
		vertexShader: load_shader(this.shaders.vshader),
		fragmentShader: load_shader(this.shaders.simulationFragmentShader)
	    }),
	    // Shaders used for render the simulation to the screen
	    renderingMaterial: new THREE.ShaderMaterial({
		uniforms: this.uniforms,
		vertexShader: load_shader(this.shaders.vshader),
		fragmentShader: load_shader(this.shaders.renderingFragmentShader)
	    })
	};
    }


    init_camera() {
	this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -5, 5);
	this.camera.position.z = 1;
	this.scene.add(this.camera);
    }


    init_scene() {
	this.scene = new THREE.Scene();

	this.planeScreen = new THREE.Mesh(
	    new THREE.PlaneGeometry(1, 1),
	    this.materials.testMat);
	this.scene.add(this.planeScreen);

    }

    init_renderer() {
	this.renderer = new THREE.WebGLRenderer({
	    canvas: this.canvas,
	    preserveDrawingBuffer: true
	});
	this.renderer.setClearColor(0xFFFFFF);
	this.renderer.setSize(this.render_size.width, this.render_size.height);
    }


    //////////////////////// GUI functions //////////////////////////////


    init_callbacks(){
	this.canvas.onmousedown = this.onMouseDown.bind(this);
	this.canvas.onmouseup = this.onMouseUp.bind(this);
	this.canvas.onmousemove = this.onMouseMove.bind(this);
	window.addEventListener('resize', this.resizeCanvas.bind(this), false);
    }

    onMouseDown(ev) {
	this.uniforms.mouseDown.value = true;
    }
    onMouseUp(ev) {
	this.uniforms.mouseDown.value = false;
    }
    onMouseMove(ev) {
	var rect = this.canvas.getBoundingClientRect();

	var mMouseX = ev.clientX - rect.left;
	var mMouseY = ev.clientY - rect.top;

	this.uniforms.mousePosition.value = new THREE.Vector2(mMouseX/(rect.right - rect.left), 1.0 - mMouseY/(rect.bottom-rect.top));
    }

    resizeCanvas(){
	var aspect_ratio = this.simulation_size.width/this.simulation_size.height;
	var w_canvas = Math.min(window.innerWidth-this.gui_width, aspect_ratio*window.innerHeight);
	this.renderer.setSize(w_canvas, w_canvas / aspect_ratio);
    }

    init_gui(){
	this.gui = new dat.GUI({
	    autoPlace: false,
	    width: this.gui_width
	});

	this.gui.add(this.frame_rate, 'fps').name('Frame rate(fps) ').listen();
	this.gui.add(this, 'nb_render_per_steps').name("Steps/Frame");

	this.gui.add(this, 'preset', Object.keys(this.presets)).name("Preset").onChange(this.on_preset.bind(this));
	console.log(Object.keys(this.presets));

	var buttons = {
	    start_pause: this.on_start_pause.bind(this),
	    reset: this.on_reset.bind(this),
	    fullscreen: this.on_fullscreen.bind(this),
	    screenshot: this.on_screenshot.bind(this),
	    toggle: this.on_toggle.bind(this)
	};
	this.gui.add(buttons, 'start_pause').name("Start/Pause");
	this.gui.add(buttons, 'reset').name("Reset");
	this.gui.add(buttons, 'toggle').name("Show other");
	this.gui.add(buttons, 'fullscreen').name("Fullscreen");
	this.gui.add(buttons, 'screenshot').name("Take screenshot");


	var fgradient = this.gui.addFolder('Gradient');
	for (var idx in this.gradient) {
	    var fg = fgradient.addFolder('Color' + idx);
	    fg.add(this.gradient[idx], "value").onChange(this.on_gradient_change.bind(this, idx));
	    fg.addColor(this.gradient[idx], "color").onChange(this.on_gradient_change.bind(this, idx));
	    fg.open();
	}

	$('#controls').append($(this.gui.domElement));
    }

    on_preset(){
	console.log(this.uniforms.feed);
	this.uniforms.feed.value = this.presets[this.preset].feed;
	this.uniforms.kill.value = this.presets[this.preset].kill;
    }

    on_gradient_change(idx) {
	this.uniforms["value"+idx].value = this.gradient[idx].value;
	this.uniforms["color"+idx].value = hex_to_rgb(this.gradient[idx].color);
    }

    on_start_pause(){
	this.start_pause = !this.start_pause;
	this.uniforms.running.value = this.start_pause;
    }

    on_reset(){
	this.call_init = true;
    }

    on_toggle(){
	this.uniforms.source_channel_idx.value = 1 - this.uniforms.source_channel_idx.value;
    }

    on_fullscreen(){
	if (!document.fullscreenElement && !document.msFullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
	    if (document.body.requestFullscreen) {
		document.body.requestFullscreen();
	    } else if (document.body.msRequestFullscreen) {
		document.body.msRequestFullscreen();
	    } else if (document.body.mozRequestFullScreen) {
		document.body.mozRequestFullScreen();
	    } else if (document.body.webkitRequestFullscreen) {
		document.body.webkitRequestFullscreen();
	    }
	} else {
	    if (document.exitFullscreen) {
		document.exitFullscreen();
	    } else if (document.msExitFullscreen) {
		document.msExitFullscreen();
	    } else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	    } else if (document.webkitCancelFullScreen) {
		document.webkitCancelFullScreen();
	    }
	}
    }

    on_screenshot(){
	var dataURL = this.canvas.toDataURL("image/png");
	window.open(dataURL, "screenshot-" + Math.random());
    }


    //////////////////////// Step/Rendering functions //////////////////////////////
    update_fps(){
	this.frame_rate.frame_idx++;
	var num_frames = 10;
	if (this.frame_rate.frame_idx == num_frames) {
	    this.frame_rate.frame_idx = 0;
	    var current_sec = new Date().getTime() / 1000;
	    this.frame_rate.fps = num_frames / (current_sec - this.frame_rate.last_time);
	    this.frame_rate.last_time = current_sec;
	}
    }

    init_simulation(){

	this.planeScreen.material = this.materials.initializationMaterial;

	// Initialize the two textures. Even if, in principle, we just
	// need to initialize the front buffer, since the back buffer will
	// computed at the first step.
	this.uniforms.tSource.value = this.mTextureBuffer1;
	this.renderer.render(
	    this.scene,
	    this.camera,
	    this.mTextureBuffer0, true);

	this.uniforms.tSource.value = this.mTextureBuffer0;
	this.renderer.render(
	    this.scene,
	    this.camera,
	    this.mTextureBuffer1, true);
    }

    step(time) {

	this.uniforms.time.value = new Date().getTime() / 1000 - this.t0_seconds;

	if(this.call_init ) {
	    this.init_simulation();
	    this.call_init = false;
	}
	else {
	    for(var i = 0 ; i < this.nb_render_per_steps; ++i) {
		// Update the model
		this.render_model();
	    }
	}

	// Update the display
	this.render_display();

	this.update_fps();

	requestAnimationFrame(this.step.bind(this));
    }

    render_model(){
	// In the step, we take the front buffer as the state
	// at the previous time step
	// And computes an iteration, the result being stored in the back buffer

	this.planeScreen.material = this.materials.simulationMaterial;

	var target_texture = this.front_buffer == 0 ? this.mTextureBuffer1 : this.mTextureBuffer0;
	this.uniforms.tSource.value = this.front_buffer == 0 ? this.mTextureBuffer0 : this.mTextureBuffer1;

	this.renderer.render(
	    this.scene,
	    this.camera,
	    target_texture);

	// And then we flip the front/back buffers
	this.front_buffer = 1 - this.front_buffer;

	this.iteration += 1;
    }

    render_display(){
	// We always render the front buffer to the screen
	this.planeScreen.material = this.materials.renderingMaterial;
	this.uniforms.tSource.value = this.front_buffer == 0 ? this.mTextureBuffer0 : this.mTextureBuffer1;
	this.renderer.render(this.scene, this.camera, this.mTextureBuffer2);
	
	this.uniforms.tSource.value = this.mTextureBuffer2;
	this.renderer.render(this.scene, this.camera);
    }
}
