// Initialize Three.js scene
let scene, camera, renderer, car, light, controls;
let raycaster, mouse, selectableObjects, selectedObject;
let originalMaterials = new Map();
let carWheels = [];

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
    camera.position.set(3, 2, 4);

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

    // Create car
    car = createCar();
    car.position.y = 0.4;
    car.name = 'Car';
    scene.add(car);

    // Store selectable objects (use car's children for raycasting)
    selectableObjects = [];
    car.traverse((child) => {
        if (child.isMesh) {
            selectableObjects.push(child);
            // Store original material
            originalMaterials.set(child, child.material.clone());
        }
    });

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Handle click events for object selection
    renderer.domElement.addEventListener('click', onObjectClick, false);

    // Handle touch events for mobile object selection
    renderer.domElement.addEventListener('touchend', onObjectTouch, false);

    // Setup transform controls
    setupTransformControls();

    // Start animation
    animate();
}

function createCar() {
    const carGroup = new THREE.Group();

    // Car body (main chassis)
    const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 1);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xe63946,
        metalness: 0.6,
        roughness: 0.4
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.25;
    body.name = 'Car';
    carGroup.add(body);

    // Car cabin (roof)
    const cabinGeometry = new THREE.BoxGeometry(1, 0.4, 0.9);
    const cabinMaterial = new THREE.MeshStandardMaterial({
        color: 0x457b9d,
        metalness: 0.3,
        roughness: 0.5
    });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(-0.1, 0.7, 0);
    cabin.name = 'Car';
    carGroup.add(cabin);

    // Wheel material
    const wheelMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d3436,
        metalness: 0.2,
        roughness: 0.8
    });

    // Create wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 16);
    const wheelPositions = [
        { x: 0.6, y: 0, z: 0.5 },   // front right
        { x: 0.6, y: 0, z: -0.5 },  // front left
        { x: -0.6, y: 0, z: 0.5 },  // back right
        { x: -0.6, y: 0, z: -0.5 }  // back left
    ];

    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial.clone());
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(pos.x, pos.y, pos.z);
        wheel.name = 'Car';
        carGroup.add(wheel);
        carWheels.push(wheel);
    });

    // Headlights
    const headlightGeometry = new THREE.BoxGeometry(0.05, 0.15, 0.2);
    const headlightMaterial = new THREE.MeshStandardMaterial({
        color: 0xf1faee,
        emissive: 0xffffcc,
        emissiveIntensity: 0.5
    });

    const headlightLeft = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlightLeft.position.set(1.01, 0.25, 0.3);
    headlightLeft.name = 'Car';
    carGroup.add(headlightLeft);

    const headlightRight = new THREE.Mesh(headlightGeometry, headlightMaterial.clone());
    headlightRight.position.set(1.01, 0.25, -0.3);
    headlightRight.name = 'Car';
    carGroup.add(headlightRight);

    // Taillights
    const taillightMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.3
    });

    const taillightLeft = new THREE.Mesh(headlightGeometry, taillightMaterial);
    taillightLeft.position.set(-1.01, 0.25, 0.3);
    taillightLeft.name = 'Car';
    carGroup.add(taillightLeft);

    const taillightRight = new THREE.Mesh(headlightGeometry, taillightMaterial.clone());
    taillightRight.position.set(-1.01, 0.25, -0.3);
    taillightRight.name = 'Car';
    carGroup.add(taillightRight);

    return carGroup;
}

function animate() {
    requestAnimationFrame(animate);

    // Update controls
    controls.update();

    // Spin the wheels
    carWheels.forEach(wheel => {
        wheel.rotation.x += 0.05;
    });

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

// Touch selection for mobile devices
function onObjectTouch(event) {
    // Only handle single-finger taps (not pinch/zoom gestures)
    if (event.changedTouches.length !== 1) return;

    const touch = event.changedTouches[0];
    const rect = renderer.domElement.getBoundingClientRect();

    // Calculate touch position in normalized device coordinates
    mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

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

// Select an object (selects the whole car)
function selectObject(object) {
    // Deselect current object first
    if (selectedObject) {
        deselectObject();
    }

    // Always select the car group
    selectedObject = car;

    // Highlight all parts of the car
    const highlightMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        metalness: 0.5,
        roughness: 0.5,
        emissive: 0xffff00,
        emissiveIntensity: 0.3
    });

    car.traverse((child) => {
        if (child.isMesh) {
            child.material = highlightMaterial.clone();
        }
    });

    // Show controls panel
    const controlsPanel = document.getElementById('controls-panel');
    controlsPanel.style.display = 'block';

    // Update selected object name
    document.getElementById('selected-object-name').textContent = `Selected: ${object.name}`;
}

// Deselect current object
function deselectObject() {
    if (selectedObject) {
        // Restore original materials for all car parts
        car.traverse((child) => {
            if (child.isMesh) {
                const originalMaterial = originalMaterials.get(child);
                if (originalMaterial) {
                    child.material = originalMaterial.clone();
                }
            }
        });

        selectedObject = null;

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
