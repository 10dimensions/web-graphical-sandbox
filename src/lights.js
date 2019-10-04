//import * as THREE from 'three';
//import { OrbitControls } from 'three-orbit-controls';
const THREE = require("three");
const OrbitControls = require("three-orbit-controls")(THREE);
const dat = require("dat.gui");

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas });

  const fov = 45;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);

  const scene = new THREE.Scene();

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();

  const planeSize = 40;

  const loader = new THREE.TextureLoader();
  const texture = loader.load("resources/images/checker.png");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  const repeats = planeSize / 2;
  texture.repeat.set(repeats, repeats);

  const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
  const planeMat = new THREE.MeshPhongMaterial({
    map: texture,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.rotation.x = Math.PI * -0.5;
  scene.add(mesh);

  {
    const cubeSize = 4;
    const cubeGeo = new THREE.BoxBufferGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMat = new THREE.MeshPhongMaterial({ color: "#8AC" });
    const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
    scene.add(mesh);
  }
  {
    const sphereRadius = 3;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereBufferGeometry(
      sphereRadius,
      sphereWidthDivisions,
      sphereHeightDivisions
    );
    const sphereMat = new THREE.MeshPhongMaterial({ color: "#CA8" });
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
    scene.add(mesh);
  }

  class ColorGUIHelper {
    constructor(object, prop) {
      this.object = object;
      this.prop = prop;
    }
    get value() {
      return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
      this.object[this.prop].set(hexString);
    }
  }

  const color = 0xffffff;
  const intensity = 1;
  const light = new THREE.AmbientLight(color, intensity);
  //scene.add(light);

  const skyColor = 0xb1e1ff; // light blue
  const groundColor = 0xb97a20; // brownish orange
  const HemLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
  //scene.add(HemLight);


//////////   DIR LIGHT ///////////////////////////////////

  const dcolor = 0xffffff;
  const dintensity = 1;
  const Dirlight = new THREE.DirectionalLight(color, intensity);
  Dirlight.position.set(0, 10, 0);
  Dirlight.target.position.set(-5, 0, 0);
  
  const helper = new THREE.DirectionalLightHelper(Dirlight);
  
  //scene.add(Dirlight);
  //scene.add(Dirlight.target);
  //scene.add(helper);


//////////   POINT LIGHT ///////////////////////////////////

  const pcolor = 0xffffff;
  const pintensity = 1;
  const plight = new THREE.PointLight(pcolor, pintensity);
  plight.position.set(0, 10, 0);

  const phelper = new THREE.PointLightHelper(plight);
  
  //scene.add(plight);
  //scene.add(phelper);


//////////   SPOT LIGHT //////////////////////////////

  // const hcolor = 0xFFFFFF;
  // const hintensity = 1;
  // const hlight = new THREE.SpotLight(hcolor, hintensity);
  
  // const hhelper = new THREE.SpotLightHelper(hlight);

  // scene.add(hlight);
  // scene.add(hlight.target);
  // scene.add(hhelper);



  function makeXYZGUI(gui, vector3, name, onChangeFn) {
    const folder = gui.addFolder(name);
    folder.add(vector3, "x", -10, 10).onChange(onChangeFn);
    folder.add(vector3, "y", 0, 10).onChange(onChangeFn);
    folder.add(vector3, "z", -10, 10).onChange(onChangeFn);
    folder.open();
  }

  function updateLight() {
    Dirlight.target.updateMatrixWorld();
    helper.update();
  }
  updateLight();

  function updatepLight() {
    helper.update();
  }
  updatepLight();

  const gui = new dat.GUI();
  gui.addColor(new ColorGUIHelper(light, "color"), "value").name("color");
  gui.add(light, "intensity", 0, 2, 0.01);

  gui.addColor(new ColorGUIHelper(HemLight, "color"), "value").name("skyColor");
  gui
    .addColor(new ColorGUIHelper(HemLight, "groundColor"), "value")
    .name("groundColor");
  gui.add(HemLight, "intensity", 0, 2, 0.01);

  gui.addColor(new ColorGUIHelper(Dirlight, "color"), "value").name("color");
  gui.add(Dirlight, "intensity", 0, 2, 0.01);

  makeXYZGUI(gui, Dirlight.position, 'position', updateLight);
  makeXYZGUI(gui, Dirlight.target.position, 'target', updateLight);

  gui.addColor(new ColorGUIHelper(plight, "color"), "value").name("color");
  gui.add(plight, "intensity", 0, 2, 0.01);
  gui.add(plight, "distance", 0, 40).onChange(updatepLight);

  makeXYZGUI(gui, plight.position, "pposition", updatepLight);

  //gui.add(Dirlight.target.position, 'x', -10, 10);
  //gui.add(Dirlight.target.position, 'z', -10, 10);
  //gui.add(Dirlight.target.position, 'y', 0, 10);

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render() {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
