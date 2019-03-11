var renderer, scene, camera, controls, light, container;

var meObject;

var materialShader;

var jiggleDivider = 0, jiggleInc = 0, jiggleTime = 0, currentJiggle=0; 

var heroPos = {
  posY: 100,
  rotY: 0
};

init();

function init() {

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

  container = document.getElementById('luc-home');
  //document.body.appendChild( container );

  renderer = new THREE.WebGLRenderer({
    canvas: container,
    alpha: true
  });
  //renderer.setSize(container.innerWidth, container.innerHeight);
  //container.appendChild(renderer.domElement);

  var manager = new THREE.LoadingManager();
  manager.onStart = function (url, itemsLoaded, itemsTotal) {
    console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
  };
  manager.onLoad = function () {
    console.log('Loading complete!');
    animateHero();
  };
  manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
  };


  light = new THREE.HemisphereLight(0xffffff, 0x444422, 1.2);
  light.position.set(0, 1, 0);
  scene.add(light);

  var lucMaterial = new THREE.MeshBasicMaterial();

  var texture = new THREE.TextureLoader(manager).load("assets/textures/NewTexture.jpg", function (texture) {
    lucMaterial.map = texture;
  });

  lucMaterial.onBeforeCompile = function (shader) {

    shader.uniforms.time = {
      value: 0
    };
    shader.uniforms.speed = {
      value: 0
    };

    shader.vertexShader = 'uniform float time;\n uniform float speed; \n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      [
        'float theta = sin( time + position.z * 5.) / 2.0;',
        'float stheta = speed/5.;',
        //'float theta = sin( time * 5.) / 2.0;',
        'float multi = smoothstep( -0.5 , 0.9, position.z);',
        'float c = cos( multi * theta );',
        'float s = sin( multi * theta );',
        'float sc = cos( 2. * multi * stheta );',
        'float ss = sin( 2. * multi * stheta );',
        'mat3 my = mat3( c, 0, s, 0, 1, 0, -s, 0, c );',
        'mat3 mz = mat3( c, -s, 0, s, c, 0, 0, 0, 1 );',
        'mat3 smy = mat3( sc, 0, ss, 0, 1, 0, -ss, 0, sc );',
        'vec3 transformed = vec3( position ) * mz * my * smy;'
      ].join('\n')
    );
    materialShader = shader;

  };

  // model
  var loader = new THREE.GLTFLoader(manager).setPath('assets/models/');
  loader.load('luc_lowpoly.glb', function (gltf) {
    gltf.scene.traverse(function (child) {
      if (child.isMesh) {
        meObject = child;
        child.material = lucMaterial;
        child.rotation.z = 6.;
        //child.position.y = - 50;

        //child.scale.setScalar( 100 );
      }
    });
    scene.add(gltf.scene);
  }, undefined, function (e) {
    console.error(e);
  });

  //controls = new THREE.OrbitControls(camera);

  camera.position.z = 25;
  camera.position.y = heroPos.y;
  //controls.update();

  window.addEventListener('resize', onWindowResize, false);
  renderer.domElement.addEventListener('click', onClick, false);
}

function resizeRendererToDisplaySize(renderer) {
  var canvas = renderer.domElement;
  var pixelRatio = window.devicePixelRatio;
  var wrapper = document.getElementById('luc-wrapper');
  // var width = wrapper.clientWidth * pixelRatio;
  // var height = wrapper.clientHeight * pixelRatio;
  var width = canvas.clientWidth * pixelRatio;
  var height = canvas.clientHeight * pixelRatio;
  var needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

var animate = function () {
  //newMaterial.uniforms.timeDelta.value = timeDelta;

  requestAnimationFrame(animate);
  render();
  //controls.update();
};

function render() {

  camera.position.y = heroPos.posY;
  meObject.rotation.z = heroPos.rotY;
  if (resizeRendererToDisplaySize(renderer)) {
    var canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    console.log("resizing: " + canvas.clientWidth + " " + canvas.clientHeight);
    camera.updateProjectionMatrix();
  }
  if (materialShader) {
    materialShader.uniforms.time.value = performance.now() / 1000;
    materialShader.uniforms.speed.value = speedCalc();
  }
  renderer.render(scene, camera);

}

animate();

function onWindowResize() {
  //document.getElementById( 'luc-home' ).style.display = "none";
  if (resizeRendererToDisplaySize(renderer)) {
    var canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;

    camera.updateProjectionMatrix();
  }
}

function speedCalc(){

  currentJiggle = lerp(currentJiggle, jiggleInc, 0.1);
  jiggleInc = jiggleInc * 0.99;

  jiggleDivider = currentJiggle;
  console.log(jiggleDivider,jiggleInc,currentJiggle);
  return jiggleDivider;
}

function onClick(e){
  console.log("clicked");
  jiggleInc += 10;
}

function lerp(v0, v1, t) {
  return v0*(1-t)+v1*t;
}

function animateHero(){

  var tl = anime.timeline({
    easing: 'easeOutExpo',
    duration: 2000,
  });

  tl.add({
    targets: '#loader',
    opacity: 0,
    duration: 300,
    complete: function(anim) {
      document.querySelector(".preload-wrapper").classList.remove('preload-wrapper');
      var thingToRemove = document.querySelectorAll("#loader")[0];
      thingToRemove.parentNode.removeChild(thingToRemove);
    }
  });

  tl.add({
    targets: '#hero',
    opacity: [0, 1],
    duration: 800
  });

  tl.add({
    targets: heroPos,
    easing: 'easeOutElastic(10, 20)',
    posY: 10,
    rotY: (3.141592 * 4)
  }, '-=500');
}