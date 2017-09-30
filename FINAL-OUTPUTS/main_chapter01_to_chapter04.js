/*
 * From chapters 01 to 04:
 *    - Building a simple scene
 *    - set updates, change material and object 3D geometry
 *    - adding fog
 *    - trying out different light types
 *    - using dat.GUI
 *    - add camera and light helpers
 *    - create a animations rig using Math.random(), Math.sin(timeElapsed), and
 *    TweenJS
 */
function init() {
  var scene = new THREE.Scene();
  var gui = new dat.GUI();
  var clock = new THREE.Clock();

  var enableFog = true;

  if (enableFog) {
    scene.fog = new THREE.FogExp2(0xffffff, 0.01);
  }

  //var box = getBox(1, 1, 1);
  var plane = getPlane(100);
  var directionalLight = getDirectionalLight(1);
  var sphere = getSphere(0.05);
  var boxGrid = getBoxGrid(20, 2.5);
  var helper = new THREE.CameraHelper(directionalLight.shadow.camera);
  //var ambientLight = getAmbientLight(3);

  plane.name = 'plane-1';
  boxGrid.name = 'boxGrid';

  plane.rotation.x = Math.PI/2;
  directionalLight.position.x = 13;
  directionalLight.position.y = 10;
  directionalLight.position.z = 10;
  directionalLight.intensity = 2;

  //gui.add(directionalLight, 'intensity', 0, 10);
  //gui.add(directionalLight.position, 'x', 0, 20);
  //gui.add(directionalLight.position, 'y', 0, 20);
  //gui.add(directionalLight.position, 'z', 0, 20);
  //gui.add(spotLight, 'penumbra', 0, 1);

  scene.add(plane);
  directionalLight.add(sphere);
  scene.add(directionalLight);
  scene.add(boxGrid);
  //scene.add(helper);
  //scene.add(ambientLight);

  var camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    1,
    1000
  );

  var cameraZRotation = new THREE.Group();
  var cameraYPosition = new THREE.Group();
  var cameraZPosition = new THREE.Group();
  var cameraYRotation = new THREE.Group();
  var cameraXRotation = new THREE.Group();

  cameraZRotation.name = 'cameraZRotation';
  cameraYPosition.name = 'cameraYPosition';
  cameraZPosition.name = 'cameraZPosition';
  cameraXRotation.name = 'cameraXRotation';
  cameraYRotation.name = 'cameraYRotation';

  cameraZRotation.add(camera);
  cameraYPosition.add(cameraZRotation);
  cameraZPosition.add(cameraYPosition);
  cameraXRotation.add(cameraZPosition);
  cameraYRotation.add(cameraXRotation);
  scene.add(cameraYRotation);

  cameraYPosition.position.y = 1;
  cameraZPosition.position.z = 100;
  cameraXRotation.rotation.x = -Math.PI / 2;

  // TWEEN js easing curves:
  //    http://tweenjs.github.io/tween.js/examples/03_graphs.html
  new TWEEN.Tween( {posZ: 100})
      .to({posZ: -50}, 12000)
      .onUpdate(function() {
        cameraZPosition.position.z = this.posZ;
      })
      .start();

  new TWEEN.Tween( {rotX: -Math.PI/2})
      .to({rotX: 0}, 6000)
      .delay(1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(function() {
        cameraXRotation.rotation.x = this.rotX;
      })
      .start();

  new TWEEN.Tween( {rotY: 0})
      .to({rotY: Math.PI/2}, 6000)
      .delay(1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(function() {
        cameraYRotation.rotation.y = this.rotY;
      })
      .start();

  gui.add(cameraZPosition.position, 'z', 0, 100);
  gui.add(cameraYRotation.rotation, 'y', -Math.PI, Math.PI);
  gui.add(cameraXRotation.rotation, 'x', -Math.PI, Math.PI);
  gui.add(cameraZRotation.rotation, 'z', -Math.PI, Math.PI);

  //var camera = new THREE.OrthographicCamera(
  //  -15, //camera left frustrum
  //  15,  //camera right frustrum
  //  15,  //camera top frustrum
  //  -15, //camera bottom frustrum
  //  1,
  //  1000
  //);

  //camera.position.x = 10;
  //camera.position.y = 18;
  //camera.position.z = -18;

  //camera.lookAt(new THREE.Vector3(0, 0, 0));

  var renderer = new THREE.WebGLRenderer();

  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor('rgb(120, 120, 120)');

  document.getElementById('webgl').appendChild(renderer.domElement);

  var controls = new THREE.OrbitControls(camera, renderer.domElement);

  update(renderer, scene, camera, controls, clock);

  return scene;
}

function getBox (width, height, depth) {
  var geometry = new THREE.BoxGeometry(width, height, depth);
  var material = new THREE.MeshPhongMaterial({
    color: 'rgb(120, 120, 120)'
  });
  var mesh = new THREE.Mesh(
    geometry,
    material
  );
  mesh.castShadow = true;

  return mesh;
}

function getBoxGrid (amount, separationMultiplier) {
  var group = new THREE.Group();

  for (var i = 0; i < amount; i++) {
    for (var j=0; j < amount; j++) {
      var obj = getBox(1, 3, 1);

      obj.position.x = i * separationMultiplier;
      obj.position.y = obj.geometry.parameters.height/2;
      obj.position.z = j * separationMultiplier;
      group.add(obj);
    }
  }

  group.position.x = -(separationMultiplier * (amount - 1)) / 2;
  group.position.z = -(separationMultiplier * (amount - 1)) / 2;

  return group;
}

function getPlane (size) {
  var geometry = new THREE.PlaneGeometry(size, size);
  var material = new THREE.MeshPhongMaterial({
    color: 'rgb(120, 120, 120)',
    side: THREE.DoubleSide
  });
  var mesh = new THREE.Mesh(
    geometry,
    material
  );
  mesh.receiveShadow = true;

  return mesh;
}

function getSphere (radius) {
  var geometry = new THREE.SphereGeometry(radius, 24, 24);
  var material = new THREE.MeshBasicMaterial({
    color: 'rgb(255, 255, 255)'
  });
  var mesh = new THREE.Mesh(
    geometry,
    material
  );
  return mesh;
}

function getPointLight (intensity) {
  var light = new THREE.PointLight(0xffffff, intensity);
  light.castShadow = true;

  return light;
}

function getSpotLight (intensity) {
  var light = new THREE.SpotLight(0xffffff, intensity);
  light.castShadow = true;

  light.shadow.bias = 0.001;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;

  return light;
}

function getDirectionalLight (intensity) {
  var light = new THREE.DirectionalLight(0xffffff, intensity);
  light.castShadow = true;

  light.shadow.camera.left   = -40;
  light.shadow.camera.bottom = -40;
  light.shadow.camera.right  =  40;
  light.shadow.camera.top    =  40;

  light.shadow.mapSize.width = 4096;
  light.shadow.mapSize.height = 4096;

  return light;
}

function getAmbientLight (intensity) {
  var light = new THREE.AmbientLight('rgb(10, 30, 50)', intensity);

  return light;
}


function update(renderer, scene, camera, controls, clock) {
  renderer.render(
    scene,
    camera
  );
  controls.update();
  TWEEN.update();

  var timeElapsed = clock.getElapsedTime();

  //var cameraXRotation = scene.getObjectByName('cameraXRotation');
  //if (cameraXRotation.rotation.x < 0) {
  //  cameraXRotation.rotation.x += 0.01;
  //}

  //var cameraZPosition = scene.getObjectByName('cameraZPosition');
  //cameraZPosition.position.z -= 0.25;

  var cameraZRotation = scene.getObjectByName('cameraZRotation');
  cameraZRotation.rotation.z = noise.simplex2(timeElapsed * 1.5, timeElapsed * 1.5) * 0.02;

  var plane = scene.getObjectByName('plane-1');
  var boxGrid = scene.getObjectByName('boxGrid');
  boxGrid.children.forEach(function(child, index) {
    var x = timeElapsed + index;
    child.scale.y = (noise.simplex2(x, x) + 1) / 2 + 0.001;
    //child.scale.y = (Math.sin(timeElapsed * 5 + index) + 1) / 2 + 0.001;
    child.position.y = child.scale.y/2;
  });


  requestAnimationFrame(function() {
    update(renderer, scene, camera, controls, clock);
  });
}

var scene = init();
