function backgroundRenderer(randomizer) {

	var renderer;
	var scene;
	var camera;
	var clock;
	var animateSpeed = 0;
	var animatingTargetSpeed = 0;
	var pathAmount = 0;
	var interestPoints = [];
	var wires;
	var sampleCount = fftData.length / 12 - 100;
	var cameraPathDuration = 200;
	var speedChangeDelay = 0.1;
	var randomness;
	var speedModifier = 1.0;
	var bgColor = new THREE.Color("#1d1d1d");
	//var tintColor = new THREE.Color(1.0,1.0,1.0, 1.0);

	var currentMode = "bright";

	var modes = {
		"dark" : {
			bgColor : new THREE.Color("#1d1d1d"),
			speedModifier : 0.15,
			tintAdd : new THREE.Vector3(0.19, 0.16, 0.2),
			tintSub : new THREE.Vector3(0.7, 0.630, 0.71)
		},
		"bright" : {
			bgColor : new THREE.Color("#f8f8f8"),
			speedModifier : 1,
			tintAdd : new THREE.Vector3(0.0, 0.0, 1.0),
			tintSub : new THREE.Vector3(0.9, 0.1, 0.1)
		},
		"bright-2" : {
			bgColor : new THREE.Color("#f8e8f8"),
			speedModifier : 1,
			tintAdd : new THREE.Vector3(0.7, 0.2, 0.2),
			tintSub : new THREE.Vector3(0.19, 0.81, 0.1)
		}
	};

	var modeNames = [];

	for(var itm in modes){
		modeNames.push(itm);
	}

	var camPath = {
		'cam':null,
		'target':null
	};

	var subtractiveMaterial;
	var additiveMaterial;

	function generateGeo() {

		var popChance = randomRange(0.7, 0.95);
		var popBand = Math.floor(random(0, 5));
		var addChance = randomRange(0.65, 1.0);
		var brightenChance = randomRange(0.9, 1.0);
		var rotationMulitplier = randomRange(0.0015, 0.01);
		var rotationBand = Math.floor(random(8));
		var wireframeChance = randomRange(0.8, 0.98);
		var fixedOffset = 0;//randomRange(0.065, 0.15);
		var ySpread = randomRange(-3, 3);
		var scaleBand = Math.floor(random(8) + 4);
		var scaleFactor = randomRange(0.1, 1.25);
		var rotationZFactor = randomRange(0, 40.1);


		var wireframeGeo = new THREE.Geometry();
		var subtractiveGeo = new THREE.Geometry();
		var additiveGeo = new THREE.Geometry();


		additiveMaterial = new THREE.ShaderMaterial({
			attributes:{
				alpha: { type: 'f', value: [] }
			},
	  	uniforms: {
				'tint': { type: 'v3', value: new THREE.Vector3(1,1,1)}
			},
	    vertexShader: document.getElementById("shader-vertex").textContent,
	    fragmentShader: document.getElementById("shader-fragment-add").textContent,
	    depthTest: false,
	    depthWrite: false,
	    transparent: true,
	    side: THREE.DoubleSide
	  });
		additiveMaterial.blending = THREE.CustomBlending;
		additiveMaterial.blendSrc = THREE.SrcAlphaFactor;
		additiveMaterial.blendDst = THREE.OneFactor;
		additiveMaterial.blendEquation = THREE.AddEquation;


		subtractiveMaterial = new THREE.ShaderMaterial({
			attributes:{
				alpha: { type: 'f', value: [] }
			},
			uniforms: {
				'tint': { type: 'v3', value: new THREE.Vector3(1,1,1) }
			},
	    vertexShader: document.getElementById("shader-vertex").textContent,
	    fragmentShader: document.getElementById("shader-fragment-sub").textContent,
	    depthTest: false,
	    depthWrite: false,
	    transparent: true,
	    side: THREE.DoubleSide
	  });
	  console.log("WEOFJOIWEJFOIWEJFOIJWEF");
		subtractiveMaterial.blending = THREE.CustomBlending;
		subtractiveMaterial.blendSrc = THREE.DstColorFactor;
		subtractiveMaterial.blendDst = THREE.OneMinusSrcColorFactor;
		subtractiveMaterial.blendEquation = THREE.SubtractEquation;

		var wireframeMaterial = new THREE.ShaderMaterial({
			attributes:{
				alpha: { type: 'f', value: [] }
			},
	    vertexShader: document.getElementById("shader-vertex").textContent,
	    fragmentShader: document.getElementById("shader-fragment-add").textContent,
	    depthTest: false,
	    depthWrite: false,
	    transparent: true,
	    side: THREE.DoubleSide
	  });
		wireframeMaterial.blending = THREE.CustomBlending;
		wireframeMaterial.blendSrc = THREE.SrcAlphaFactor;
		wireframeMaterial.blendDst = THREE.OneFactor;
		wireframeMaterial.blendEquation = THREE.AddEquation;
		wireframeMaterial.wireframe = true;
		wireframeMaterial.wireframeLinewidth = 1.5;

		var rotationX = 0;
	  var vx = 0;
	  var transform = new THREE.Matrix4();
	  var vy = 0;
	  var startX = vx;
	  var lastX = startX;
	  
	  var cursor = new THREE.Vector3();

	  var vertShiftX = randomRange(-10,10);
	  var vertShiftY = randomRange(-30,30);
		for(var i = 0; i < sampleCount; i += Math.floor(randomRange(1, 2))) {

			var isAdditive = false
		  var isWireframe = false;
			
			var colorValue = 0xffffff;
			var minAlpha = 0.1;
			var maxAlpha = 0.3;

			var choice = random(fft(i, popBand)) > popChance;

			if(!choice){
				choice = random(1) > 0.9;
			}

			if(!choice) {
				minAlpha = fft(i,1) * 0.05;
				maxAlpha = 0.25;
				colorValue = 0xe0e0e0;
				//minAlpha = randomRange(0.1, 0.2);
				//maxAlpha = randomRange(0.3, 0.5);

				if(random(1) > brightenChance){
					minAlpha = 0.01;
					maxAlpha = 0.2;
					colorValue = 0xd0d0d0;
					isAdditive = true;
				}

			} else {

				// red; 
				var r = Math.floor(randomRange(250,255));
				var g = 0;
				var b = Math.floor(randomRange(40,90));
				
				colorValue = (r << 16) | (g << 8) | b;//0xfe0040;
				colorValue = (r << 16) | (r << 8) | r;//0xfe0040;
				//green: 
				// colorValue = 0x19fe95;
				//var r = Math.floor(randomRange(0,30));
				//var g = Math.floor(randomRange(252,255));
				//var b = Math.floor(randomRange(100,170));
				//colorValue = (r << 16) | (g << 8) | b;//0xfe0040;
				
				// navy blue: 
				//colorValue = 0xb9b200;
				//colorValue = 0xffffff;
				//colorValue = 0x27e6c4
				
				//colorValue = 0x5746f0;
				minAlpha = 0.15;
				maxAlpha = 0.7;

				if(random(1) > addChance){
					
					minAlpha = 0.8;
					maxAlpha = 1.0;

					colorValue = 0x0080a0;
					//colorValue = 0x93550c;
					isAdditive = true;
				}

				if(random(1) > wireframeChance) {
					isWireframe = true;

					//blue: colorValue = 0x004090;
					
					//teal: 
					colorValue = 0x076655;
				}
			}

			var color = new THREE.Color( colorValue );
			var alphas = [randomRange(minAlpha, maxAlpha), randomRange(minAlpha, maxAlpha), randomRange(minAlpha, maxAlpha), randomRange(minAlpha, maxAlpha)];
			
			var squeezeX = fft(i,2) * 0.5 + 0.5;
			var squeezeY = fft(i,3) * 0.5 + 0.5;
			var aspect = (fft(i, 1) * 1.5) + 0.8;
			var w = 5 / (1/aspect);
			var h = 50 / aspect;

			var verts = [
				new THREE.Vector3( 0,  vertShiftY - h * squeezeY, vertShiftX - w * squeezeX),
				new THREE.Vector3( 0, vertShiftY + h * squeezeY, vertShiftX - w),
				new THREE.Vector3( 0, vertShiftY - h, vertShiftX + w*squeezeX ),
				new THREE.Vector3( 0, vertShiftY + h, vertShiftX + w )
			];

			vx += (fixedOffset + random(fft(i, 2)) * fft(i,2) * 5);
			vy = (fixedOffset + (fft(i,2) - 0.5) * ySpread);
			vz = ((fft(i,3) - 0.5) * 8.5);

			rotationX += rotationMulitplier + (( fft(i, rotationBand) - 0.5) * 0.05 * random(fft(i, rotationBand) - 0.5));//rotationMulitplier);
			var rotationZ = (( fft(i, rotationBand) - 0.5) * 3.26 * random(fft(i,1) - 0.5));//rotationMulitplier);
			
			var s1 = fft(i, scaleBand) * scaleFactor + 0.05;
			var s2 = fft(i, 12-scaleBand) * scaleFactor + 0.05;
			var s3 = fft(i, Math.floor(scaleBand/2)) * scaleFactor + 0.05;

			transform.makeScale(s1, s2, s3);
			for(var v = 0; v < verts.length; v++){
				verts[v].applyMatrix4(transform);
			}

			transform.makeRotationX(rotationX);
			for(var v = 0; v < verts.length; v++){
				verts[v].applyMatrix4(transform);
			}
			
			transform.makeRotationY(rotationZ * rotationZFactor);
			for(var v = 0; v < verts.length; v++){
				//verts[v].applyMatrix4(transform);
			}
			
			transform.makeTranslation(vx, vy, vz);
			for(var v = 0; v < verts.length; v++){
				verts[v].applyMatrix4(transform);
			}

			
			if(random(1) > 0.6){
				lastX = verts[0].x;
			interestPoints.push(verts[1].clone());
				if(isWireframe){
					addShard(wireframeMaterial, wireframeGeo, verts, color, alphas);
				} else if(isAdditive){
					addShard(additiveMaterial, additiveGeo, verts, color, alphas);
				} else {
					addShard(subtractiveMaterial, subtractiveGeo, verts, color, alphas);
				}
			}
		}

		var center = (lastX - startX) / 2;
		
		scene.add( new THREE.Mesh(wireframeGeo, wireframeMaterial) );
		scene.add( new THREE.Mesh(additiveGeo, additiveMaterial) );
		scene.add( new THREE.Mesh(subtractiveGeo, subtractiveMaterial) );

		for(var i = 0; i < scene.children.length; i++){
			scene.children[i].position.x = -center;
		}

		for(var i = 0; i < interestPoints.length; i++){
			interestPoints[i].x -= center;
		}
	}

	function addShard(material, geo, verts, color, alphas) {
		var idx = geo.vertices.length;
		var c = [color, color, color, color];
		
		for(var n = 0; n < verts.length; n++){
			geo.vertices.push(verts[n]);
			material.attributes.alpha.value.push(alphas[n]);
		}

		geo.faces.push( new THREE.Face3(idx, idx+1, idx+2, new THREE.Vector3(0,1,0), color ) );
		geo.faces.push( new THREE.Face3(idx+1, idx+2, idx+3, new THREE.Vector3(0,1,0), color ) );
	}

	function addWires() {

		var wireChance = randomRange(0.55, 0.85);

		var a = 0.10;
		var wireMaterial = new THREE.ShaderMaterial({
			attributes:{
				alpha: { type: 'f', value: [a,a,a,a] }
			},
	    vertexShader: document.getElementById("shader-vertex").textContent,
	    fragmentShader: document.getElementById("shader-fragment-sub").textContent,
	    depthTest: false,
	    depthWrite: false,
	    transparent: true,
	    wireframe:true,
	    side: THREE.DoubleSide
	  });
	  wireMaterial.blending = THREE.CustomBlending;
		wireMaterial.blendSrc = THREE.DstColorFactor;
		wireMaterial.blendDst = THREE.OneMinusSrcColorFactor;
		wireMaterial.blendEquation = THREE.SubtractEquation;

		var lastAngle = 0;
		var vx = -40;
		var vz = 0;

		var scaleY = randomRange(0.1, 2.0);

		var px = randomRange(0.125, 2);
		var geo = new THREE.PlaneGeometry(1, 1, 1, 1);
		wires = new THREE.Object3D();

		var lastPosition = new THREE.Vector2();
		var position = new THREE.Vector2();

		var targetPosX = 0;
		var targetPosY = 0;

		var adding = false;

		for(var i = 0; (i < sampleCount) && (vx < 40); i +=2){
			
			var b = new THREE.Mesh(geo, wireMaterial);
			b.geometry.faces[0].color.setHex(0x101010);
			b.geometry.faces[1].color.setHex(0x101010);

			var rot = (fft(i, 2) - 0.2) * 2;
			//b.rotation.y = -rot;
			
			position.x += 1;
			position.y = (fft(i,1) - 0.5) * 40;

			var angle = Math.atan2(position.x - lastPosition.x, position.y - lastPosition.y);
			b.rotation.x = Math.PI / 2;
			b.rotation.y = -angle - Math.PI / 2;


			/*vx += Math.cos(lastAngle) * px;
			vz += Math.sin(lastAngle)* px;

			vx += Math.cos(rot) * px;
			vz += Math.sin(rot)* px; 

			b.position.x = vx;
			b.position.z = vz;*/
			b.position.x = (position.x + lastPosition.x) / 2;
			b.position.y = (position.y + lastPosition.y) / 2;
			b.scale.x = position.distanceTo(lastPosition);//scaleY;
			b.scale.y = scaleY;

			lastAngle = rot;
			if(random(1) > wireChance){
				adding = !adding;
			} 

			if(adding){
				wires.add(b);
			}else {
				scaleY = randomRange(0.5, 6.0);
			}
			lastPosition.copy(position);
		}
		wires.position.x = (-lastPosition.x/2) * 0.1;
		console.log(wires);
		scene.add(wires);
		wires.scale.set(0.21,0.21,0.21);
		wires.rotation.x = random(Math.PI * 2);
	}

	function fft(sample, band, newVal) {
		if(newVal !== undefined){
			//fftData[(12 * sample) + band] = newVal;
		}
		return fftData[(12 * sample) + band] / 10000;
	}

	function randomRange(min, max){
		return randomness() * (max - min) + min;
	}

	function random(max) {
		return randomness() * max;
	}

	function smoothData(){
		var samp = 0;
		var newData = [];
		
		for(var band = 0; band < 12; band++) {
			newData.push(fft(0, band) * 10000);
		}

		for(var i = 1; i < sampleCount; i++) {
			

			for(var band = 0; band < 12; band++) {
				var avg = 0;
				
				avg += fft(i-1, band) * 10000;
				avg += fft(i, band)  * 10000;
				avg += fft(i+1, band) * 10000;

				//fftData[(12 * sample) + band] = newVal;
				newData.push(avg / 3);
				//fft(i, band, avg / 3);
				if(band == 0){
					//console.log(avg/3);
				}
			}
		}

		for(var band = 0; band < 12; band++) {
			newData.push(fft(sampleCount-1, band) * 10000);
		}
		
		fftData = newData;
	}

	function initRenderer() {

		renderer = new THREE.WebGLRenderer({antialias:true, premultipliedAlpha:false, preserveDrawingBuffer:true});

		//document.body.appendChild(renderer.domElement);
		
		//renderer.setClearColor(0xfdfdfd, 1);
		//renderer.setClearColor(0x1d1d1d, 1);
		
		renderer.setDepthWrite(false);
		renderer.setDepthTest(false);
		//renderer.sortObjects = false;
		renderer.autoClearColor = true;
		renderer.autoClearDepth = true;

		scene = new THREE.Scene();
		
		camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
		camera.position.set(200,100,0);
		camera.lookAt(new THREE.Vector3(0,0,0));

		// clear the webGL canvas on the first frame.
		//window.requestAnimationFrame(function() {
		//	renderer.clear(true, true, true);
		//});

		clock = new THREE.Clock();
	}

	function initAllGeometry() {
		//for(var i =0; i < 4; i++){
		//	smoothData();
		//}

		generateGeo();
		addWires();
	}

	function distanceTo(x1,y1, x2,y2){
		return Math.sqrt( (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) );
	}

	function makeCameraPath() {
		var camCurvePoints = [];
		var camTargetPoints = [];

		var centerPoint = new THREE.Vector3();
		for(var i = 0; i < interestPoints.length; i++){
			centerPoint.add(interestPoints[i]);
		}
		centerPoint.x /= interestPoints.length;
		centerPoint.y /= interestPoints.length;
		centerPoint.z /= interestPoints.length;
		
		camCurvePoints.push(
				new THREE.Vector3(
					randomRange(-15,15) + centerPoint.x,
					randomRange(-5,5) + centerPoint.y,
					randomRange(-8,8) + centerPoint.z 
				)
		);

		var item = Math.floor(random(interestPoints.length));
		camTargetPoints.push(interestPoints[item].clone());

		for(var i = 0; i < 10; i++) {
			camCurvePoints.push(
				new THREE.Vector3(
					randomRange(-30,30) + centerPoint.x,
					randomRange(-5,5) + centerPoint.y,
					randomRange(-10,10) + centerPoint.z 
				)
			);

			var item = Math.floor(random(interestPoints.length));
			camTargetPoints.push(interestPoints[item].clone());
		}

		var evenCamPoints = new THREE.ClosedSplineCurve3(camCurvePoints).getSpacedPoints(10); 
		var evenTargetPoints = new THREE.ClosedSplineCurve3(camTargetPoints).getSpacedPoints(10);

		camPath.cam = new THREE.ClosedSplineCurve3(evenCamPoints);
		camPath.target = new THREE.ClosedSplineCurve3(evenTargetPoints);
	}

	function updateCamera(delta) {
		pathAmount += (delta / cameraPathDuration) * animateSpeed;
		if(pathAmount > 1){
			pathAmount -= 1;
		}
		animateSpeed += (animatingTargetSpeed - animateSpeed) * 0.01;
		
		camera.position.copy( camPath.cam.getPoint(pathAmount) );
		camera.lookAt(camPath.target.getPoint(pathAmount));
	}

	function render(manualCam) {
		var delta = clock.getDelta();
		
		bgColor.lerp(modes[currentMode].bgColor, delta*2);
		renderer.setClearColor(bgColor);
		
		speedModifier += (modes[currentMode].speedModifier - speedModifier) * 0.05;
		
		additiveMaterial.uniforms.tint.value.lerp( modes[currentMode].tintAdd, delta*1.5);
		subtractiveMaterial.uniforms.tint.value.lerp( modes[currentMode].tintSub, delta*3);

		delta *= speedModifier;

		updateCamera(delta);
		
		speedChangeDelay -= delta;
		if(speedChangeDelay <= 0) {
			speedChangeDelay = randomRange(3,6);
			animatingTargetSpeed = randomRange(0.1, 1.5);
		}

		renderer.render(scene, camera);
	}

	function setMode(mode) {
		currentMode = mode;
	}

	function resize(width, height) {
		var aspectRatio = width / height;
	   
	  camera.aspect = aspectRatio;
	  camera.updateProjectionMatrix();

	  renderer.setSize(width, height);
	}

	function initScene(randomizer) {
		randomness = randomizer;
		initRenderer();
		initAllGeometry();
		makeCameraPath();
	}

	return {
		init : initScene,
		render : render,
		setMode : setMode,
		resize : resize,
		getModes : function(){
			return modeNames;
		},
		getMode : function(){
			return currentMode;
		},
		getCanvasElement : function() {
			return renderer.domElement;
		}
	}
};