if( ! Detector.webgl) Detector.addGetWebGlMessage();


var container;
var camera, scene, renderer;
var plane, cube;
var mouse, raycaster, isShiftDown = false;

var rollOverMesh, rollOverMaterial;
var bigCubeCounter = 0, smallCubeCounter = 0;

var objects = [];

updateCounter();
init();
render();

function updateCounter(){
	var bCount = document.getElementById("bigCubeCounter");
	bCount.innerHTML = bigCubeCounter;
	var sCount = document.getElementById("smallCubeCounter");
	sCount.innerHTML = smallCubeCounter;
}

function changeTool(){
	var existingRollOver = scene.getObjectByName("rollOver");
	scene.remove(existingRollOver);
	animate();

	switch(selectedTool){
	case 0: rollOverGeo = rollOverCube;
		rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
		rollOverMesh = new THREE.Mesh ( rollOverGeo, rollOverMaterial );
		rollOverMesh.name = "rollOver";
		scene.add(rollOverMesh);
		break;

	case 1: rollOverGeo = rollOverBrick;
		rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, opacity: 0.5, transparent: true });
		rollOverMesh = new THREE.Mesh ( rollOverGeo, rollOverMaterial);
		rollOverMesh.name = "rollOver";
		scene.add(rollOverMesh);
		break;
	}
}

function init(){
	container = document.getElementById("game");

	camera = new THREE.PerspectiveCamera(45,
			window.innerWidth/window.innerHeight,
			1, 10000 );

	camera.position.set(500, 800, 1300);
	camera.lookAt( new THREE.Vector3() );

	controls = new THREE.OrbitControls( camera );
	controls.addEventListener('change',render);

	scene = new THREE.Scene();

	var size = 500, step = 50;
	var geometry = new THREE.Geometry();

	for(var i = -size; i <= size; i+= step) {
		geometry.vertices.push( new THREE.Vector3( -size, 0, i) );
		geometry.vertices.push( new THREE.Vector3( size, 0, i) );
		geometry.vertices.push( new THREE.Vector3( i, 0, -size) );
		geometry.vertices.push( new THREE.Vector3( i, 0, size) );
	}

	var material = new THREE.LineBasicMaterial({
				color: 0x000000,
				opacity: 0.2,
				transparent: true
			});
	var line = new THREE.LineSegments( geometry, material);
	scene.add(line)

	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();
	var geometry = new THREE.PlaneBufferGeometry( 1000, 1000 );
	geometry.rotateX( - Math.PI / 2 );
	plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
	scene.add( plane );
	objects.push( plane );

	// Lights
	var ambientLight = new THREE.AmbientLight( 0x606060 );
	scene.add( ambientLight );
	var directionalLight = new THREE.DirectionalLight( 0xffffff );
	directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
	scene.add( directionalLight );

	renderer = new THREE.WebGLRenderer( { antialias: true});
	renderer.setClearColor( 0xf0f0f0 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild(renderer.domElement);
		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		document.addEventListener( 'mousedown', onDocumentMouseDown, false );
		document.addEventListener( 'keydown', onDocumentKeyDown, false );
		document.addEventListener( 'keyup', onDocumentKeyUp, false );
		//
		window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {
		event.preventDefault();
		mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
		var parameters = rollOverGeo.parameters;
		raycaster.setFromCamera( mouse, camera );
		var intersects = raycaster.intersectObjects( objects );
		if ( intersects.length > 0 ) {
			var intersect = intersects[ 0 ];
			rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
			rollOverMesh.position.divideScalar( parameters.width ).floor().multiplyScalar( parameters.height ).addScalar( parameters.depth/2 );
		}
		render();
}

function onDocumentMouseDown( event ) {
		event.preventDefault();
		mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
		raycaster.setFromCamera( mouse, camera );
		var intersects = raycaster.intersectObjects( objects );
		if ( intersects.length > 0 ) {
			var intersect = intersects[ 0 ];
			// delete cube
			if ( isShiftDown ) {
				if ( intersect.object != plane ) {
					scene.remove( intersect.object );
					var name = intersect.object.name;
					if(name == "big") { bigCubeCounter--; }
					else if(name == "small") { smallCubeCounter--; }
					objects.splice( objects.indexOf( intersect.object ), 1 );
					updateCounter();
				}
			// create cube
			} else {
				geo = rollOverGeo;
				var parameters = rollOverGeo.parameters;
				material = brickMaterial;
				var voxel = new THREE.Mesh( geo, brickMaterial );
				voxel.position.copy( intersect.point ).add( intersect.face.normal );
				voxel.position.divideScalar( parameters.width ).floor().multiplyScalar( parameters.height ).addScalar( parameters.depth/2 );
				if(selectedTool == 0) { voxel.name = "big"; bigCubeCounter++; }
				else if(selectedTool == 1) { voxel.name = "small"; smallCubeCounter++; }
				scene.add( voxel );
				objects.push( voxel );
				updateCounter();
			}
			render();
		}
}

function onDocumentKeyDown( event ) {
		switch( event.keyCode ) {
			case 16: isShiftDown = true; break;
		}
}

function onDocumentKeyUp( event ) {
		switch ( event.keyCode ) {
			case 16: isShiftDown = false; break;
		}
}

function animate() {
 requestAnimationFrame( animate );
 controls.update();
}

function render(){
	renderer.render(scene, camera);
}
