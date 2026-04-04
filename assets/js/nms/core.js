/* PROCEDURAL UNIVERSE CORE ENGINE */
(function() {
  const container = document.getElementById('nms-canvas-container');
  const overlay = document.getElementById('nms-overlay');
  const crosshair = document.getElementById('nms-crosshair');
  const hud = document.getElementById('nms-hud');
  const debugPos = document.getElementById('nms-debug-pos');
  const debugMode = document.getElementById('nms-debug-mode');

  let scene, camera, renderer;
  let planets = [];

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
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100000);

    pitchObject = new THREE.Object3D();
    pitchObject.add(camera);
    yawObject = new THREE.Object3D();
    // Start slightly above Earth-like planet at origin
    yawObject.position.set(0, 102, 0); 
    yawObject.add(pitchObject);
    scene.add(yawObject);

    renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(2000, 1000, 2000);
    scene.add(sunLight);

    spawnSolarSystem();
    const resizeObserver = new ResizeObserver(() => onResize());
    resizeObserver.observe(container);
    window.addEventListener('resize', onResize);

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    
    overlay.addEventListener('click', () => {
      if (!isLocked) container.requestPointerLock();
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

  function createPlanet(x, y, z, radius, seed, colorSet) {
    const geometry = new THREE.SphereGeometry(radius, 128, 128);
    const material = new THREE.MeshStandardMaterial({ 
      wireframe: false, roughness: 0.8, metalness: 0.1
    });
    
    const simplex = new SimplexNoise(seed);
    const positionAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    const colors = [];
    const colorObj = new THREE.Color();
    
    for ( let i = 0; i < positionAttribute.count; i ++ ) {
       vertex.fromBufferAttribute( positionAttribute, i );
       vertex.normalize(); 

       let noiseVal = 0;
       // Adaptive frequency/amplitude based on radius
       let freq = 0.05 * (100 / radius);
       let amp = 6 * (radius / 100);
       noiseVal += simplex.noise3D(vertex.x * freq, vertex.y * freq, vertex.z * freq) * amp;
       freq *= 2; amp *= 0.5;
       noiseVal += simplex.noise3D(vertex.x * freq, vertex.y * freq, vertex.z * freq) * amp;

       if (noiseVal < 0) { noiseVal = 0; colorObj.setHex(colorSet[0]); } 
       else if (noiseVal < 1) { colorObj.setHex(colorSet[1]); }
       else if (noiseVal < 3) { colorObj.setHex(colorSet[2]); }
       else if (noiseVal < 5) { colorObj.setHex(colorSet[3]); }
       else { colorObj.setHex(colorSet[4]); }
       
       vertex.multiplyScalar(radius + noiseVal);
       positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
       colors.push(colorObj.r, colorObj.g, colorObj.b);
    }
    
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    material.vertexColors = true;
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    planets.push({ mesh, radius, position: new THREE.Vector3(x, y, z) });
  }

  function spawnSolarSystem() {
     // Earth-like (Origin)
     createPlanet(0, 0, 0, 100, 'seed_earth', [0x1d4ed8, 0x3b82f6, 0x22c55e, 0x78716c, 0xf8fafc]);
     // Mars-like
     createPlanet(800, 300, -1200, 150, 'seed_mars', [0x7f1d1d, 0x991b1b, 0xd97706, 0xfcd34d, 0xfef3c7]);
     // Small Ice planet
     createPlanet(-1000, -500, -500, 60, 'seed_ice', [0x0284c7, 0x38bdf8, 0xbae6fd, 0xf0f9ff, 0xffffff]);
     // Toxic gas giant
     createPlanet(500, -800, 1500, 250, 'seed_gas', [0x064e3b, 0x166534, 0x65a30d, 0x84cc16, 0xd9f99d]);
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

    // Flight mode travels 10x faster
    const speed = isFlying ? 400 : 20;

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
       
       // Calculate closest planet for gravity
       let closestPlanet = planets[0];
       let minDist = Infinity;
       for (let p of planets) {
         const dist = yawObject.position.distanceTo(p.position);
         if (dist < minDist) {
            minDist = dist;
            closestPlanet = p;
         }
       }
       
       const center = closestPlanet.position;
       const up = yawObject.position.clone().sub(center).normalize();
       
       yawObject.position.copy(center).add(up.multiplyScalar(closestPlanet.radius + 5)); 

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

  window.toggleFullscreenNMS = function() {
    const parent = document.getElementById('nms-container');
    if (!document.fullscreenElement) {
      if(parent) parent.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen();
    }
  };

})();
