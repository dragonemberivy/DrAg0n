/* PROCEDURAL UNIVERSE CORE ENGINE */
(function() {
  const container = document.getElementById('nms-canvas-container');
  const overlay = document.getElementById('nms-overlay');
  const crosshair = document.getElementById('nms-crosshair');
  const hud = document.getElementById('nms-hud');
  const debugPos = document.getElementById('nms-debug-pos');
  const debugMode = document.getElementById('nms-debug-mode');

  let scene, camera, renderer;
  let planetMesh;
  const PLANET_RADIUS = 100;

  let pitchObject, yawObject;
  let keys = { w: false, a: false, s: false, d: false, space: false };
  let isFlying = false;

  let isLocked = false;
  let clock = new THREE.Clock();
  let nmsLoopId;

  function init() {
    if (!container) return;
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510); // Deep space
    
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);

    pitchObject = new THREE.Object3D();
    pitchObject.add(camera);
    yawObject = new THREE.Object3D();
    yawObject.position.y = PLANET_RADIUS + 2; 
    yawObject.add(pitchObject);
    scene.add(yawObject);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(500, 200, 500);
    scene.add(sunLight);

    createPlanet();

    window.addEventListener('resize', onResize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    
    overlay.addEventListener('click', () => {
      if (!isLocked) {
        container.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      isLocked = document.pointerLockElement === container;
      if (isLocked) {
        overlay.style.display = 'none';
        crosshair.style.display = 'block';
        hud.style.display = 'block';
      } else {
        overlay.style.display = 'flex';
        crosshair.style.display = 'none';
        hud.style.display = 'none';
      }
    });

    document.addEventListener('mousemove', onMouseMove);
  }

  function createPlanet() {
    const geometry = new THREE.SphereGeometry(PLANET_RADIUS, 128, 128);
    const material = new THREE.MeshStandardMaterial({ 
      wireframe: false,
      roughness: 0.8,
      metalness: 0.1
    });
    
    const simplex = new SimplexNoise('seed_123');
    const positionAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    
    const colors = [];
    const colorObj = new THREE.Color();
    
    for ( let i = 0; i < positionAttribute.count; i ++ ) {
       vertex.fromBufferAttribute( positionAttribute, i );
       vertex.normalize(); 

       let noiseVal = 0;
       let freq = 0.05;
       let amp = 6;
       // 2 Octaves
       noiseVal += simplex.noise3D(vertex.x * freq, vertex.y * freq, vertex.z * freq) * amp;
       freq *= 2; amp *= 0.5;
       noiseVal += simplex.noise3D(vertex.x * freq, vertex.y * freq, vertex.z * freq) * amp;

       if (noiseVal < 0) { noiseVal = 0; colorObj.setHex(0x1d4ed8); } 
       else if (noiseVal < 1) { colorObj.setHex(0x3b82f6); }
       else if (noiseVal < 3) { colorObj.setHex(0x22c55e); }
       else if (noiseVal < 5) { colorObj.setHex(0x78716c); }
       else { colorObj.setHex(0xf8fafc); }
       
       vertex.multiplyScalar(PLANET_RADIUS + noiseVal);
       positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
       colors.push(colorObj.r, colorObj.g, colorObj.b);
    }
    
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    
    material.vertexColors = true;
    
    planetMesh = new THREE.Mesh(geometry, material);
    scene.add(planetMesh);
  }

  function onResize() {
    if(!camera || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  function onKeyDown(e) {
    switch(e.code) {
      case 'ArrowUp': keys.w = true; break;
      case 'ArrowLeft': keys.a = true; break;
      case 'ArrowDown': keys.s = true; break;
      case 'ArrowRight': keys.d = true; break;
      case 'Space': keys.space = true; break;
      case 'KeyF': if(isLocked) isFlying = !isFlying; break;
    }
  }

  function onKeyUp(e) {
    switch(e.code) {
      case 'ArrowUp': keys.w = false; break;
      case 'ArrowLeft': keys.a = false; break;
      case 'ArrowDown': keys.s = false; break;
      case 'ArrowRight': keys.d = false; break;
      case 'Space': keys.space = false; break;
    }
  }

  const PI_2 = Math.PI / 2;
  function onMouseMove(event) {
    if (!isLocked) return;
    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    yawObject.rotation.y -= movementX * 0.002;
    pitchObject.rotation.x -= movementY * 0.002;
    pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
  }

  function updatePhysics(dt) {
    if (!isLocked) return;
    
    const direction = new THREE.Vector3(0,0,0);
    if(keys.w) direction.z -= 1;
    if(keys.s) direction.z += 1;
    if(keys.a) direction.x -= 1;
    if(keys.d) direction.x += 1;
    direction.normalize();

    const speed = isFlying ? 150 : 20;

    if (isFlying) {
       direction.set(0,0,0);
       if(keys.w) direction.z -= 1;
       if(keys.s) direction.z += 1;
       if(keys.a) direction.x -= 1;
       if(keys.d) direction.x += 1;
       direction.normalize();
       
       const camQuat = new THREE.Quaternion();
       camera.getWorldQuaternion(camQuat);
       direction.applyQuaternion(camQuat);
       
       yawObject.position.add(direction.multiplyScalar(speed * dt));
    } else {
       direction.applyQuaternion(yawObject.quaternion);
       yawObject.position.add(direction.multiplyScalar(speed * dt));
       
       const center = new THREE.Vector3(0,0,0);
       const up = yawObject.position.clone().sub(center).normalize();
       
       yawObject.position.copy(center).add(up.multiplyScalar(PLANET_RADIUS + 5)); 

       const targetQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), up);
       
       const currentYaw = yawObject.rotation.y;
       yawObject.quaternion.copy(targetQuat);
       yawObject.rotateY(currentYaw);
    }
    
    debugPos.innerText = `Pos: ${yawObject.position.x.toFixed(0)}, ${yawObject.position.y.toFixed(0)}, ${yawObject.position.z.toFixed(0)}`;
    debugMode.innerText = `Mode: ${isFlying ? 'Spaceship 🚀' : 'Walking 🚶'}`;
  }

  function animate() {
    nmsLoopId = requestAnimationFrame(animate);
    const dt = clock.getDelta();
    updatePhysics(dt);
    if(renderer && scene && camera) renderer.render(scene, camera);
  }

  window.startNMS = function() {
    if (!scene) {
      init();
      animate();
    }
    if (!isLocked && container) {
       container.requestPointerLock();
    }
  };

})();
