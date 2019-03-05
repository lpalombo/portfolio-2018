var renderer, scene, camera, controls, light, container;

var materialShader;

init();

function init() {

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

  container = document.getElementById( 'luc-home' );
  //document.body.appendChild( container );

  renderer = new THREE.WebGLRenderer({canvas: container,alpha: true});
  //renderer.setSize(container.innerWidth, container.innerHeight);
  //container.appendChild(renderer.domElement);

  light = new THREE.HemisphereLight(0xffffff, 0x444422, 1.2);
  light.position.set(0, 1, 0);
  scene.add(light);

  var lucMaterial = new THREE.MeshPhongMaterial();

  var texture = new THREE.TextureLoader().load("assets/textures/NewTexture.jpg", function (texture) {
    lucMaterial.map = texture;
  });

  lucMaterial.onBeforeCompile = function (shader) {

    shader.uniforms.time = {
      value: 0
    };

    shader.vertexShader = 'uniform float time;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      [
        'float theta = sin( time + position.y * 5.) / 2.0;',
        'float c = cos( theta );',
        'float s = sin( theta );',
        'mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );',
        'vec3 transformed = vec3( position ) * m;',
        'vNormal = vNormal * m;'
      ].join('\n')
    );
    materialShader = shader;

  };

  // model
  var loader = new THREE.GLTFLoader().setPath('assets/models/');
  loader.load('luc_lowpoly.glb', function (gltf) {
    gltf.scene.traverse(function (child) {
      if (child.isMesh) {
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
  camera.position.y = 8;
  //controls.update();

  window.addEventListener('resize', onWindowResize, false);
}

function resizeRendererToDisplaySize(renderer) {
  var canvas = renderer.domElement;
  var pixelRatio = window.devicePixelRatio;
  var wrapper = document.getElementById( 'luc-wrapper' );
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
  if (resizeRendererToDisplaySize(renderer)) {
    var canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    console.log("resizing: "+canvas.clientWidth+" "+canvas.clientHeight);
    camera.updateProjectionMatrix();
  }
  if (materialShader) {
    materialShader.uniforms.time.value = performance.now() / 1000;
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