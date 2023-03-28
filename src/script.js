import './style.css'
import * as THREE from 'three'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';

const params = {
    enable: true
};
let afterimagePass;

let w = window.innerWidth
let h = window.innerHeight

const loader = new THREE.TextureLoader()
const cross = loader.load('./circle.png', (texture) => {
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;
    texture.generateMipmaps = false;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
});
// const cross = loader.load('./circle.png')


// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Objects
const particlesGeometry = new THREE.BufferGeometry;
const particlesCnt = 7000;

const posArray = new Float32Array(particlesCnt * 3)

for(let i = 0; i < particlesCnt * 3; i++) {
    posArray[i] = (Math.random() * 600) - 300
}


particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))

// Materials


const particlesMaterial = new THREE.PointsMaterial({
    map: cross,
    transparent: true,
    color: 0xaaaaaa,
    size: .45,
    blending: THREE.AdditiveBlending,

})



// Mesh
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particlesMesh)

// Lights

const pointLight = new THREE.PointLight(0xffffff, 0.1)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(pointLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 5, 200)
camera.rotation.x = 3
camera.position.y = 0
camera.position.z = 0

scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true

})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 2.0, 0, 0);
// afterimagePass = new AfterimagePass();
// afterimagePass.samples = 300000000002;
// afterimagePass.uniforms["damp"].value = 0.85;

// const renderScene = new RenderPass(scene, camera);

// const composer = new EffectComposer(renderer);
// composer.addPass(renderScene)
// composer.addPass(bloomPass);
// composer.addPass(afterimagePass)

const composer = new EffectComposer( renderer );
composer.addPass( new RenderPass( scene, camera ) );
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 2.0, 0, 0);
afterimagePass = new AfterimagePass();


composer.addPass( bloomPass )
composer.addPass( afterimagePass );
afterimagePass.uniforms["damp"].value = 0.45;


function createGUI() {

    const gui = new GUI( { name: 'Damp setting' } );
    gui.add( afterimagePass.uniforms[ 'damp' ], 'value', 0, 1 ).step( 0.001 );
    gui.add( params, 'enable' );

}


/**
 * Animate
 */

const clock = new THREE.Clock()

//Speed of 'stars'
// Flag to indicate whether the button is being hovered over
let isHovered = false;

// Speed of 'stars'
const button = document.querySelector('button');
const speedArray = new Float32Array(particlesCnt);
const normalSpeedArray = new Float32Array(particlesCnt);
for (let i = 0; i < particlesCnt; i++) {
  speedArray[i] = 0.3;
  normalSpeedArray[i] = 0.3;
}

button.addEventListener('mouseenter', () => {
  isHovered = true;
  for (let i = 0; i < particlesCnt; i++) {
    speedArray[i] = 10;
  }
});

button.addEventListener('mouseleave', () => {
  isHovered = false;
});

function animate() {

  // Animate particles
  const positions = particlesMesh.geometry.attributes.position.array;
  for (let i = 0; i < particlesCnt; i++) {
    // Move particle towards the camera
    positions[i * 3 + 2] -= speedArray[i];

    // If the particle is behind the camera, move it back to the front
    if (positions[i * 3 + 2] < -1) {
      positions[i * 3] = (Math.random() * 600) - 300;
      positions[i * 3 + 1] = (Math.random() * 600) - 300;
      positions[i * 3 + 2] = Math.random() * 600;
    }

    // Gradually decrease speed to normal when hovering stops
    if (!isHovered && speedArray[i] > normalSpeedArray[i]) {
      speedArray[i] -= 0.2;
    } else if (isHovered) {
      speedArray[i] = 10;
    }
  }
  particlesMesh.geometry.attributes.position.needsUpdate = true;

  // Render the scene and the AfterimagePass
  composer.render();

  // Call animate again on the next frame
  requestAnimationFrame(animate);
}



// Call animate for the first time to start the animation loop
animate();
createGUI();