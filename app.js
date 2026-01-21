// Initialize Three.js scene
let scene, camera, renderer, cube, torus, light, controls;
let raycaster, mouse, selectableObjects, selectedObject;
let originalMaterials = new Map();
let autoRotateObjects = true;

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

    // Add grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Add OrbitControls for camera interaction
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 3;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;

    // Initialize raycaster for object selection
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Create cube
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({
        color: 0x667eea,
        metalness: 0.5,
        roughness: 0.5
    });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.x = -2;
    cube.name = 'Cube';
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
    torus.name = 'Torus';
    scene.add(torus);

    // Store selectable objects
    selectableObjects = [cube, torus];

    // Store original materials for highlighting
    originalMaterials.set(cube, cubeMaterial.clone());
    originalMaterials.set(torus, torusMaterial.clone());

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Handle click events for object selection
    renderer.domElement.addEventListener('click', onObjectClick, false);

    // Setup transform controls
    setupTransformControls();

    // Start animation
    animate();
}

function animate() {
    requestAnimationFrame(animate);

    // Update controls
    controls.update();

    // Rotate objects only if auto-rotate is enabled
    if (autoRotateObjects) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        torus.rotation.x += 0.01;
        torus.rotation.y += 0.02;
    }

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

// Object selection with raycasting
function onObjectClick(event) {
    // Calculate mouse position in normalized device coordinates
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update raycaster
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections
    const intersects = raycaster.intersectObjects(selectableObjects);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        selectObject(object);
    } else {
        deselectObject();
    }
}

// Select an object
function selectObject(object) {
    // Deselect current object first
    if (selectedObject) {
        deselectObject();
    }

    selectedObject = object;

    // Highlight the selected object
    const highlightMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        metalness: 0.5,
        roughness: 0.5,
        emissive: 0xffff00,
        emissiveIntensity: 0.3
    });
    selectedObject.material = highlightMaterial;

    // Stop auto-rotation for the selected object
    autoRotateObjects = false;

    // Show controls panel
    const controlsPanel = document.getElementById('controls-panel');
    controlsPanel.style.display = 'block';

    // Update selected object name
    document.getElementById('selected-object-name').textContent = `Selected: ${object.name}`;
}

// Deselect current object
function deselectObject() {
    if (selectedObject) {
        // Restore original material
        const originalMaterial = originalMaterials.get(selectedObject);
        if (originalMaterial) {
            selectedObject.material = originalMaterial.clone();
        }

        selectedObject = null;
        autoRotateObjects = true;

        // Hide controls panel
        const controlsPanel = document.getElementById('controls-panel');
        controlsPanel.style.display = 'none';
    }
}

// Setup transform controls
function setupTransformControls() {
    const controlButtons = document.querySelectorAll('.control-btn');
    const deselectBtn = document.getElementById('deselect-btn');

    controlButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!selectedObject) return;

            const action = button.dataset.action;
            const axis = button.dataset.axis;
            const dir = parseFloat(button.dataset.dir);

            if (action === 'translate') {
                translateObject(selectedObject, axis, dir);
            } else if (action === 'rotate') {
                rotateObject(selectedObject, axis, dir);
            } else if (action === 'scale') {
                scaleObject(selectedObject, dir);
            }
        });
    });

    deselectBtn.addEventListener('click', deselectObject);
}

// Translate object
function translateObject(object, axis, direction) {
    const step = 0.2 * direction;
    if (axis === 'x') {
        object.position.x += step;
    } else if (axis === 'y') {
        object.position.y += step;
    } else if (axis === 'z') {
        object.position.z += step;
    }
}

// Rotate object
function rotateObject(object, axis, direction) {
    const step = (Math.PI / 8) * direction; // 22.5 degrees
    if (axis === 'x') {
        object.rotation.x += step;
    } else if (axis === 'y') {
        object.rotation.y += step;
    } else if (axis === 'z') {
        object.rotation.z += step;
    }
}

// Scale object
function scaleObject(object, direction) {
    const step = 0.1 * direction;
    const newScale = object.scale.x + step;
    if (newScale > 0.1) { // Prevent negative or zero scale
        object.scale.set(newScale, newScale, newScale);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
