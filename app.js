// Initialize Three.js scene
let scene, camera, renderer, cube, torus, light;

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 5;

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);

    // Create cube
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({
        color: 0x667eea,
        metalness: 0.5,
        roughness: 0.5
    });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.x = -2;
    scene.add(cube);

    // Create torus
    const torusGeometry = new THREE.TorusGeometry(0.7, 0.3, 16, 100);
    const torusMaterial = new THREE.MeshStandardMaterial({
        color: 0x764ba2,
        metalness: 0.7,
        roughness: 0.3
    });
    torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.x = 2;
    scene.add(torus);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Start animation
    animate();
}

function animate() {
    requestAnimationFrame(animate);

    // Rotate objects
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    torus.rotation.x += 0.01;
    torus.rotation.y += 0.02;

    // Animate light position
    const time = Date.now() * 0.001;
    light.position.x = Math.sin(time) * 5;
    light.position.z = Math.cos(time) * 5;

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
