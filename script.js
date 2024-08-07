import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import spline from "./spline.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
//add fog to scene
scene.fog = new THREE.FogExp2(0x000000, 0.3);
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
// camera.position.z = 5;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.03;

// create a reneder pass for the camera and scene
const renderScene = new RenderPass(scene, camera);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);

// create a bloom effect
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 5, 1, 0);
composer.addPass(bloomPass);

// tone mapping

// create a line from spline
// const points = spline.getPoints(100);
// const geometry = new THREE.BufferGeometry().setFromPoints(points);
// const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
// const line = new THREE.Line(geometry, material);
// scene.add(line);

// create tube from spline
const tubeGeo = new THREE.TubeGeometry(spline, 222, 0.65, 16, true);
const tubeMaterial = new THREE.MeshStandardMaterial({
  color: 0xfffff,
  wireframe: true,
});
const tubeMesh = new THREE.Mesh(tubeGeo, tubeMaterial);
scene.add(tubeMesh);

// create box geometry and add it to the scene inside the tube geometry
const boxNumber = 55;
const size = 0.15;
const boxGeometry = new THREE.BoxGeometry(size, size, size);
const boxMaterial = new THREE.MeshBasicMaterial({});

for (let i = 0; i < boxNumber; i++) {
  // randomize color values
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  // randomize box position
  const p = (i / boxNumber + Math.random() * 0.1) % 1;
  // position p point on the path
  const pos = tubeGeo.parameters.path.getPointAt(p);
  pos.x += Math.random() - 0.5;
  pos.z += Math.random() - 0.5;
  box.position.copy(pos);
  
  // randomize box rotation
  const rote = new THREE.Vector3(
    Math.random() - Math.PI,
    Math.random() - Math.PI,
    Math.random() - Math.PI
  );
  box.rotation.set(rote.x, rote.y, rote.z);
  
  const edges = new THREE.EdgesGeometry(boxGeometry, 0.2);
  
  const lineMat = new THREE.LineBasicMaterial({});
  const color = new THREE.Color(Math.random(), Math.random(), Math.random());
  lineMat.color.copy(color);

  const boxLines = new THREE.LineSegments(edges, lineMat);
  boxLines.position.copy(pos);
  boxLines.rotation.copy(rote);

  // scene.add(box);
  scene.add(boxLines);
}

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
scene.add(hemiLight);

function updateCamera(t) {
  const time = t * 0.2;
  const looptime = 20 * 1000;
  const p = (time % looptime) / looptime;
  const pos = tubeGeo.parameters.path.getPointAt(p);
  const lookAt = tubeGeo.parameters.path.getPointAt((p + 0.03) % 1);
  camera.position.copy(pos);
  camera.lookAt(lookAt);
}

function animate(t = 0) {
  updateCamera(t);
  // mesh1.rotation.y += 0.01;
  // renderer.render(scene, camera);
  composer.render();
  requestAnimationFrame(animate);
}
// renderer.setAnimationLoop(animate);
animate();
