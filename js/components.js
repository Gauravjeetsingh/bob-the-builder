
rollOverCube = new THREE.BoxGeometry( 100, 100, 100 );
rollOverBrick = new THREE.BoxGeometry( 50, 50, 50);

cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xffff00  } );
brickMaterial = new THREE.MeshLambertMaterial( {  map: new THREE.TextureLoader().load( "images/brick-pattern.jpg" ) } );
