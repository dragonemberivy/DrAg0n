/* PROCEDURAL UNIVERSE CORE ENGINE */
(function() {
  const container = document.getElementById('nms-canvas-container');
  const overlay = document.getElementById('nms-overlay');
  const crosshair = document.getElementById('nms-crosshair');
  const hud = document.getElementById('nms-hud');
  const objectivesPanel = document.getElementById('nms-objectives');
  const debugPos = document.getElementById('nms-debug-pos');
  const debugMode = document.getElementById('nms-debug-mode');

  let scene, camera, renderer;
  let visitedPlanets = new Set();
  let planets = [];

  let pitchObject, yawObject;
  let keys = { w: false, a: false, s: false, d: false, space: false };
  let isFlying = false;
  let isRiding = false;
  let playerHealth = 100;

  let isLocked = false;
  let clock = new THREE.Clock();
  let nmsLoopId;

  let raycaster = new THREE.Raycaster();
  let weatherSystem;
  let minedCrystals = 0;

  function init() {
    if (!container) return;
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510); // Deep space
    
    // Starfield Background
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 8000;
    const posArray = new Float32Array(starsCount * 3);
    for(let i = 0; i < starsCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 80000; 
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starsMat = new THREE.PointsMaterial({color: 0xffffff, size: 1.0, sizeAttenuation: false, transparent: true, opacity: 0.8});
    const starMesh = new THREE.Points(starsGeo, starsMat);
    scene.add(starMesh);

    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100000);

    // 3rd Person Camera Offset (Orbital tracking)
    camera.position.set(0, 2, 7);

    pitchObject = new THREE.Object3D();
    pitchObject.add(camera);
    yawObject = new THREE.Object3D();
    // Start slightly above Earth-like planet at origin
    yawObject.position.set(0, 102, 0); 
    yawObject.add(pitchObject);

    // Astronaut Group
    window.astronautGroup = new THREE.Group();
    window.astronautGroup.position.y = -1;

    // Body
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdddddf, roughness: 0.8 });
    const bodyGeo = new THREE.CylinderGeometry(0.8, 0.8, 2.5, 16);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 1.25;
    window.astronautGroup.add(bodyMesh);

    // Helmet
    const helmetGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.8 });
    const helmetMesh = new THREE.Mesh(helmetGeo, helmetMat);
    helmetMesh.position.y = 2.8;
    window.astronautGroup.add(helmetMesh);
    
    // Visor
    const visorGeo = new THREE.SphereGeometry(0.6, 16, 16, 0, Math.PI * 2, 0, Math.PI/2.5);
    const visorMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.0, metalness: 1.0 });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 2.8, -0.15);
    visorMesh.rotation.x = Math.PI / 8;
    window.astronautGroup.add(visorMesh);

    // Jetpack / Backpack
    const packGeo = new THREE.BoxGeometry(1.2, 1.5, 0.6);
    const packMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const packMesh = new THREE.Mesh(packGeo, packMat);
    packMesh.position.set(0, 1.8, 0.6);
    window.astronautGroup.add(packMesh);

    // Glowing Jetpack Ring
    const ringGeo = new THREE.TorusGeometry(0.3, 0.05, 8, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(0, 1.8, 0.85);
    window.astronautGroup.add(ringMesh);

    yawObject.add(window.astronautGroup);

    // Alien Mount Group (Hidden until 'E' is pressed)
    window.alienMountGroup = new THREE.Group();
    window.alienMountGroup.visible = false;
    window.alienMountGroup.position.y = -1;

    // Beast Body
    const beastGeo = new THREE.BoxGeometry(2, 2.5, 6);
    const beastMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.9, flatShading: true });
    const beastMesh = new THREE.Mesh(beastGeo, beastMat);
    beastMesh.position.y = 1.25;
    window.alienMountGroup.add(beastMesh);
    
    // Add glowing spots
    const spotGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const spotMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const spot1 = new THREE.Mesh(spotGeo, spotMat); spot1.position.set(1.1, 1.5, 2);
    const spot2 = new THREE.Mesh(spotGeo, spotMat); spot2.position.set(-1.1, 1.5, 2);
    window.alienMountGroup.add(spot1); window.alienMountGroup.add(spot2);

    // Add tiny rider on top
    const rider = window.astronautGroup.clone();
    rider.position.set(0, 3.5, 0.5);
    rider.scale.set(0.8, 0.8, 0.8);
    window.alienMountGroup.add(rider);

    yawObject.add(window.alienMountGroup);

    // Spaceship Group
    window.spaceshipGroup = new THREE.Group();
    window.spaceshipGroup.visible = false; // Hidden at start
    
    // Hull
    const hullGeo = new THREE.CylinderGeometry(0.5, 1.5, 5, 8);
    hullGeo.rotateX(Math.PI / 2);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0xaa3333, metalness: 0.5 });
    const hullMesh = new THREE.Mesh(hullGeo, hullMat);
    window.spaceshipGroup.add(hullMesh);

    // Cockpit
    const shipVisorGeo = new THREE.SphereGeometry(1, 16, 16);
    shipVisorGeo.scale(1, 0.5, 1.5);
    const shipVisorMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 1.0, roughness: 0.1 });
    const shipVisorMesh = new THREE.Mesh(shipVisorGeo, shipVisorMat);
    shipVisorMesh.position.set(0, 0.5, -0.5);
    window.spaceshipGroup.add(shipVisorMesh);

    // Wings
    const wingGeo = new THREE.BoxGeometry(6, 0.2, 2);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const wingMesh = new THREE.Mesh(wingGeo, wingMat);
    wingMesh.position.set(0, 0, 1);
    window.spaceshipGroup.add(wingMesh);

    // Thrusters
    const thrusterGeo = new THREE.CylinderGeometry(0.6, 0.4, 1, 8);
    thrusterGeo.rotateX(Math.PI / 2);
    const thrusterMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const thrusterMesh1 = new THREE.Mesh(thrusterGeo, thrusterMat);
    thrusterMesh1.position.set(-1.5, 0, 2.5);
    const thrusterMesh2 = new THREE.Mesh(thrusterGeo, thrusterMat);
    thrusterMesh2.position.set(1.5, 0, 2.5);
    window.spaceshipGroup.add(thrusterMesh1);
    window.spaceshipGroup.add(thrusterMesh2);

    // Engine Glow
    const glowGeo = new THREE.SphereGeometry(0.4, 8, 8);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff8800 });
    const glow1 = new THREE.Mesh(glowGeo, glowMat);
    glow1.position.set(-1.5, 0, 3);
    const glow2 = new THREE.Mesh(glowGeo, glowMat);
    glow2.position.set(1.5, 0, 3);
    window.spaceshipGroup.add(glow1);
    window.spaceshipGroup.add(glow2);

    yawObject.add(window.spaceshipGroup);

    scene.add(yawObject);

    renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    scene.fog = new THREE.FogExp2(0x050510, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(2000, 1000, 2000);
    scene.add(sunLight);

    // Global Weather Particles
    const particleCount = 2000;
    const particleGeo = new THREE.BufferGeometry();
    const pArray = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount*3; i++) pArray[i] = (Math.random() - 0.5) * 150;
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pArray, 3));
    const particleMat = new THREE.PointsMaterial({color: 0xffffff, size: 1.0, transparent: true, opacity: 0.0, depthWrite: false});
    weatherSystem = new THREE.Points(particleGeo, particleMat);
    yawObject.add(weatherSystem);

    spawnSolarSystem();
    const resizeObserver = new ResizeObserver(() => onResize());
    resizeObserver.observe(container);
    window.addEventListener('resize', onResize);

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    
    overlay.addEventListener('click', () => {
      if (!isLocked) container.requestPointerLock();
    });

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('pointerlockchange', () => {
      isLocked = document.pointerLockElement === container;
      if (isLocked) {
        overlay.style.display = 'none';
        crosshair.style.display = 'block';
        hud.style.display = 'block';
        if (objectivesPanel) objectivesPanel.style.display = 'block';
      } else {
        overlay.style.display = 'flex';
        crosshair.style.display = 'none';
        hud.style.display = 'none';
        if (objectivesPanel) objectivesPanel.style.display = 'none';
      }
    });

    document.addEventListener('mousemove', onMouseMove);
  }

  function createPlanet(x, y, z, radius, seed, colorSet) {
    const lod = new THREE.LOD();
    
    // Creating different levels of detail
    const levels = [
      { res: 128, dist: 0 },
      { res: 64, dist: radius * 3 },
      { res: 32, dist: radius * 12 }
    ];

    levels.forEach(level => {
      const geometry = new THREE.SphereGeometry(radius, level.res, level.res);
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
         let freq = 0.05 * (100 / radius);
         let amp = 8 * (radius / 100);
         
         // 3-Octave Ridged Multifractal
         for(let o = 0; o < 3; o++) {
           let v = simplex.noise3D(vertex.x * freq, vertex.y * freq, vertex.z * freq);
           v = 1.0 - Math.abs(v); // Creates sharp ridges
           noiseVal += v * amp;
           freq *= 2.0; amp *= 0.5;
         }

         noiseVal -= 5 * (radius / 100); // Sink down for oceans

         if (noiseVal <= 0) { 
            noiseVal = 0; // Flat water
            colorObj.setHex(colorSet[0]); 
         } 
         else if (noiseVal < 1.5 * (radius/100)) { colorObj.setHex(colorSet[1]); }
         else if (noiseVal < 4 * (radius/100)) { colorObj.setHex(colorSet[2]); }
         else if (noiseVal < 7 * (radius/100)) { colorObj.setHex(colorSet[3]); }
         else { colorObj.setHex(colorSet[4]); }
         
         vertex.multiplyScalar(radius + noiseVal);
         positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
         colors.push(colorObj.r, colorObj.g, colorObj.b);
      }
      
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.computeVertexNormals();
      material.vertexColors = true;
      
      const mesh = new THREE.Mesh(geometry, material);

      // Spawn Minable Crystals on Highest LOD (level.dist === 0)
      if (level.dist === 0) {
         for(let r=0; r<15; r++) {
            const resGeo = new THREE.OctahedronGeometry(1.5, 0);
            const resMat = new THREE.MeshStandardMaterial({color: colorSet[3], emissive: colorSet[2], roughness: 0.1, flatShading: true});
            const resMesh = new THREE.Mesh(resGeo, resMat);
            resMesh.userData.isResource = true;
            const randVec = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
            resMesh.position.copy(randVec).multiplyScalar(radius + 5); 
            resMesh.lookAt(new THREE.Vector3(0,0,0));
            mesh.add(resMesh);
         }
         
         // Procedural Flora (Instanced Mesh for Extreme Performance)
         const treeCount = Math.floor(radius * 1.5);
         const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 3, 5);
         const leavesGeo = new THREE.ConeGeometry(1.5, 5, 5);
         leavesGeo.translate(0, 3, 0);
         
         const trunkMat = new THREE.MeshStandardMaterial({color: 0x3d2817, roughness: 0.9, flatShading: true});
         const leavesMat = new THREE.MeshStandardMaterial({color: colorSet[2], roughness: 0.8, flatShading: true});

         const imTrunk = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
         const imLeaves = new THREE.InstancedMesh(leavesGeo, leavesMat, treeCount);
         
         const dummy = new THREE.Object3D();
         let validTrees = 0;
         
         for(let r=0; r < treeCount * 5; r++) {
            if (validTrees >= treeCount) break;
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const rPos = new THREE.Vector3(
               Math.sin(phi) * Math.cos(theta),
               Math.sin(phi) * Math.sin(theta),
               Math.cos(phi)
            );
            
            let noiseVal = 0;
            let freq = 0.05 * (100 / radius);
            let amp = 8 * (radius / 100);
            for(let o = 0; o < 3; o++) {
                let n = simplex.noise3D(rPos.x * freq, rPos.y * freq, rPos.z * freq);
                noiseVal += (1.0 - Math.abs(n)) * amp;
                freq *= 2.0; amp *= 0.5;
            }
            noiseVal -= 5 * (radius / 100);
            
            // Only spawn trees on solid land (above water!)
            if (noiseVal > 0.5) {
                dummy.position.copy(rPos).multiplyScalar(radius + noiseVal);
                dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), rPos);
                const scale = 0.5 + Math.random() * 0.8;
                dummy.scale.set(scale, scale, scale);
                dummy.rotateY(Math.random() * Math.PI * 2);
                dummy.updateMatrix();
                imTrunk.setMatrixAt(validTrees, dummy.matrix);
                imLeaves.setMatrixAt(validTrees, dummy.matrix);
                validTrees++;
            }
         }
         imTrunk.count = validTrees;
         imLeaves.count = validTrees;
         mesh.add(imTrunk);
         mesh.add(imLeaves);
      }

      lod.addLevel(mesh, level.dist);
    });

    lod.position.set(x, y, z);
    scene.add(lod);

    // Planet Aura / Atmosphere
    const auraGeo = new THREE.SphereGeometry(radius * 1.15, 64, 64);
    const auraMat = new THREE.MeshBasicMaterial({
      color: colorSet[1], 
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    auraMesh.position.set(x, y, z);
    scene.add(auraMesh);

    // Fauna (Circling abstract birds/creatures)
    const faunaGroup = new THREE.Group();
    for(let f=0; f<12; f++) {
       const bGeo = new THREE.ConeGeometry(0.4, 1.2, 3);
       bGeo.rotateX(Math.PI/2);
       const bMat = new THREE.MeshStandardMaterial({color: colorSet[4], emissive: colorSet[1], flatShading: true});
       const bMesh = new THREE.Mesh(bGeo, bMat);
       const randY = (Math.random() - 0.5) * radius * 0.8;
       const randAngle = Math.random() * Math.PI * 2;
       const bDist = radius + 8 + Math.random() * 15;
       bMesh.position.set(Math.sin(randAngle) * bDist, randY, Math.cos(randAngle) * bDist);
       // Point along the orbit path
       bMesh.lookAt(new THREE.Vector3(Math.sin(randAngle + 0.1) * bDist, randY, Math.cos(randAngle + 0.1) * bDist));
       faunaGroup.add(bMesh);
    }
    faunaGroup.position.set(x, y, z);
    scene.add(faunaGroup);

    // Rideable Procedural Beasts
    const rideableGroup = new THREE.Group();
    for(let m=0; m<3; m++) {
       const mGeo = new THREE.BoxGeometry(2, 2.5, 6);
       const mMat = new THREE.MeshStandardMaterial({color: 0x4b5563, roughness: 0.9, flatShading: true});
       const mMesh = new THREE.Mesh(mGeo, mMat);
       const randY = (Math.random() - 0.5) * radius;
       const randAngle = Math.random() * Math.PI * 2;
       const bDist = radius + 1.25; // Walk strictly on surface
       mMesh.position.set(Math.sin(randAngle) * bDist, randY, Math.cos(randAngle) * bDist);
       mMesh.lookAt(new THREE.Vector3(Math.sin(randAngle + 0.1) * bDist, randY, Math.cos(randAngle + 0.1) * bDist));
       
       // Orient explicitly away from planet center!
       const currentUp = new THREE.Vector3(0,1,0).applyQuaternion(mMesh.quaternion);
       const upVector = mMesh.position.clone().normalize();
       const alignQuat = new THREE.Quaternion().setFromUnitVectors(currentUp, upVector);
       mMesh.quaternion.premultiply(alignQuat);
       
       rideableGroup.add(mMesh);
    }
    rideableGroup.position.set(x, y, z);
    scene.add(rideableGroup);

    planets.push({ mesh: lod, radius, position: new THREE.Vector3(x, y, z), colorSet: colorSet, simplex: new SimplexNoise(seed), faunaGroup: faunaGroup, rideableGroup });
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
     
     // 6 New Planets
     createPlanet(2500, 1000, 500, 120, 'seed_magma', [0x450a0a, 0x7f1d1d, 0xb91c1c, 0xef4444, 0xfca5a5]);
     createPlanet(-2500, 1500, 1000, 180, 'seed_pink', [0x831843, 0xbe185d, 0xdb2777, 0xf472b6, 0xfbcfe8]);
     createPlanet(0, 2500, -2000, 200, 'seed_desert', [0x78350f, 0x92400e, 0xb45309, 0xd97706, 0xfcd34d]);
     createPlanet(-800, -2500, -1500, 90, 'seed_ocean', [0x1e3a8a, 0x1e40af, 0x1d4ed8, 0x2563eb, 0x3b82f6]);
     createPlanet(1800, -2000, -2500, 140, 'seed_purple', [0x4c1d95, 0x5b21b6, 0x6d28d9, 0x7c3aed, 0xa78bfa]);
     createPlanet(-400, 500, -300, 30, 'seed_moon', [0x1c1917, 0x292524, 0x44403c, 0x57534e, 0x78716c]);
  }

  function onMouseDown(e) {
    if (!isLocked || isFlying) return;
    raycaster.setFromCamera(new THREE.Vector2(0,0), camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    for (let pt of intersects) {
       if (pt.distance < 30 && pt.object.userData && pt.object.userData.isResource) {
          pt.object.parent.remove(pt.object);
          minedCrystals++;
          const scoreEl = document.getElementById('obj-mine');
          if (scoreEl) {
             if(minedCrystals >= 10) scoreEl.innerText = '[x] Mine Crystals: 10/10';
             else scoreEl.innerText = `[ ] Mine Crystals: ${minedCrystals}/10 (Click!)`;
          }
          break;
       }
    }
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
      case 'KeyF': 
        toggleFlightMode();
        break;
      case 'KeyE':
        toggleRidingMode();
        break;
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

  function toggleFlightMode() {
    if(!isLocked) return;
    isFlying = !isFlying; 
    if(window.astronautGroup && window.spaceshipGroup) {
       window.astronautGroup.visible = !isFlying && !isRiding;
       window.spaceshipGroup.visible = isFlying;
       window.alienMountGroup.visible = !isFlying && isRiding;
       
       // Transfer pitch mathematically between ship hull and camera origin without Euler overlaps
       if (isFlying) {
           yawObject.rotateX(pitchObject.rotation.x);
           pitchObject.rotation.x = 0;
           isRiding = false; // Dismount if somehow forcing flight
       } else {
           pitchObject.rotation.x = 0;
       }
    }
  }

  function toggleRidingMode() {
    if (!isLocked || isFlying) return; // Can't ride in space!
    
    if (isRiding) {
        isRiding = false;
        window.astronautGroup.visible = true;
        window.alienMountGroup.visible = false;
        return;
    }
    
    // Find closest planet
    let closestPlanet = planets[0];
    let minDist = Infinity;
    for (let p of planets) {
       const dist = yawObject.position.distanceTo(p.position);
       if (dist < minDist) { minDist = dist; closestPlanet = p; }
    }
    
    // Check if we are near a beast on this planet
    const distToSurface = minDist - closestPlanet.radius;
    if (closestPlanet && closestPlanet.rideableGroup && distToSurface < 180) { 
       const planetCenter = closestPlanet.position;
       // Inverse rotate the player back into the beast local group
       const rawLocalPlayer = yawObject.position.clone().sub(planetCenter);
       const invRot = new THREE.Euler(0, -closestPlanet.rideableGroup.rotation.y, 0);
       const localPlayer = rawLocalPlayer.applyEuler(invRot);
       
       for (let beast of closestPlanet.rideableGroup.children) {
           if (beast.position.distanceTo(localPlayer) < 20) {
               // Mount it!
               isRiding = true;
               window.astronautGroup.visible = false;
               window.alienMountGroup.visible = true;
               // Rotate player to face same direction as beast?
               // Just stick with current rotation for seamless gameplay!
               break;
           }
       }
    }
  }

  const PI_2 = Math.PI / 2;
  
  function getTerrainHeight(planet, unitVector) {
     let noiseVal = 0;
     let freq = 0.05 * (100 / planet.radius);
     let amp = 8 * (planet.radius / 100);
     
     if (planet.simplex) {
        for(let j=0; j<3; j++) {
           let n = planet.simplex.noise3D(unitVector.x * freq, unitVector.y * freq, unitVector.z * freq);
           noiseVal += (1.0 - Math.abs(n)) * amp;
           amp *= 0.5;
           freq *= 2.0;
        }
     }
     noiseVal -= 5 * (planet.radius / 100); // Ocean depth modifier
     if (noiseVal <= 0) noiseVal = 0; // Flat water
     return planet.radius + noiseVal;
  }
  function onMouseMove(event) {
    if (!isLocked) return;
    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    yawObject.rotateY(-movementX * 0.002);
    
    if (isFlying) {
       yawObject.rotateX(-movementY * 0.002);
    } else {
       pitchObject.rotation.x -= movementY * 0.002;
       pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
    }
  }

  function updatePhysics(dt) {
    if (!isLocked) return;
    
    const direction = new THREE.Vector3(0,0,0);
    if(keys.w) direction.z -= 1;
    if(keys.s) direction.z += 1;
    if(keys.a) direction.x -= 1;
    if(keys.d) direction.x += 1;
    direction.normalize();

    // Flight mode travels 10x faster, Riding travels 6x faster
    const speed = isFlying ? 400 : (isRiding ? 120 : 20);

    // Calculate closest planet
    let closestPlanet = planets[0];
    let minDist = Infinity;
    let planetIndex = 0;
    let closestIdx = 0;
    for (let p of planets) {
      const dist = yawObject.position.distanceTo(p.position);
      if (dist < minDist) {
         minDist = dist;
         closestPlanet = p;
         closestIdx = planetIndex;
      }
      planetIndex++;
    }

    // Weather & Atmospheric Fog Effects
    const distToSurface = minDist - closestPlanet.radius;
    if (distToSurface < 180) {
       let intensity = Math.max(0, 1.0 - (distToSurface / 180));
       
       if (weatherSystem) {
          weatherSystem.material.opacity = Math.min(0.6, intensity);
          weatherSystem.material.color.setHex(closestPlanet.colorSet[4] || 0xffffff); // Use planet's lightest color 
          weatherSystem.rotation.y += 0.1 * dt;
          weatherSystem.rotation.x -= 0.05 * dt;
       }
       
       // Dynamic volumetric fog to hide planet curvature
       if (scene.fog) {
          const targetColor = new THREE.Color(closestPlanet.colorSet[4] || 0xffffff); // Use bright atmospheric color!
          const spaceColor = new THREE.Color(0x050510);
          
          scene.fog.color = spaceColor.lerp(targetColor, Math.pow(intensity, 2));
          scene.background = scene.fog.color; // Sky MUST match fog color to complete flat illusion
          scene.fog.density = intensity * (0.06 * Math.sqrt(100 / closestPlanet.radius)); 
       }
    } else {
       if (weatherSystem) weatherSystem.material.opacity = 0;
       if (scene.fog) {
           scene.fog.density = 0;
           scene.background = new THREE.Color(0x050510);
       }
    }
    
    // Animate local planet's rideable fauna (Beasts) 
    if (closestPlanet && closestPlanet.rideableGroup) {
       closestPlanet.rideableGroup.rotation.y += 0.2 * dt; // Orbit planet slowly
       
       // Give them a slight bobbing motion to simulate walking/hovering
       closestPlanet.rideableGroup.children.forEach((beast, idx) => {
           beast.position.y += Math.sin((Date.now() * 0.002) + idx) * 0.02;
       });
    }

    const center = closestPlanet.position;

    // Animate local planet's fauna flock (Boids) & Hostile Predator AI
    if (closestPlanet && closestPlanet.faunaGroup) {
        // Re-calculate the player's true local matrix relative to the spinning flock
        const rawLocalPlayer = yawObject.position.clone().sub(center);
        const invRot = new THREE.Euler(0, -closestPlanet.faunaGroup.rotation.y, 0);
        const localPlayer = rawLocalPlayer.applyEuler(invRot);

        closestPlanet.faunaGroup.rotation.y -= 0.6 * dt; // Entire flock orbits planet
        
        closestPlanet.faunaGroup.children.forEach((boid, idx) => {
            const distToPlayer = boid.position.distanceTo(localPlayer);
            
            // Seek and Destroy Player (Aggro behavior)
            if (distToPlayer < 25 && !isFlying) {
               const dir = localPlayer.clone().sub(boid.position).normalize();
               boid.position.add(dir.multiplyScalar(20 * dt)); // Rush player bounds
               boid.lookAt(localPlayer); // Face victim
               
               if (distToPlayer < 4) { // Visceral Hit
                  playerHealth -= 20 * dt;
                  const healthBar = document.getElementById('nms-health-bar');
                  if (healthBar) healthBar.style.width = Math.max(0, playerHealth) + '%';
                  
                  // Game Over State -> Origin Respawn
                  if (playerHealth <= 0) {
                      playerHealth = 100;
                      if (healthBar) healthBar.style.width = '100%';
                      yawObject.position.set(0, 150, 0); // Kick to Origin
                      if (!isFlying) toggleFlightMode(); // Put back in ship safely
                  }
               }
            } else {
               // Give them some individual drifting variation when wandering calmly
               boid.position.y += Math.sin((Date.now() * 0.003) + idx) * 0.05;
            }
        });
    }
    const up = yawObject.position.clone().sub(center).normalize();
    const currentDistCenter = yawObject.position.distanceTo(center);
    
    // Evaluate procedural noise exactly at player's latitude/longitude
    const terrainRadius = getTerrainHeight(closestPlanet, up);
    // +3 allows the capsule mesh (-2 downward span) to rest precisely on the ground without clipping
    const surfaceRadius = terrainRadius + 3;

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

       // Auto-Dismount if crashing into the planetary surface
       const newDistCenter = yawObject.position.distanceTo(center);
       if (newDistCenter < surfaceRadius) {
           yawObject.position.copy(center).add(up.multiplyScalar(surfaceRadius));
           pitchObject.rotation.x = 0; // Re-level camera to horizon!
           toggleFlightMode(); // Simulated crash landing auto-dismount!
       }

    } else {
       direction.applyQuaternion(yawObject.quaternion);
       yawObject.position.add(direction.multiplyScalar(speed * dt));
       
       // Mission Objectives Tracker
       visitedPlanets.add(closestIdx);
       if (visitedPlanets.size > 1) { const el = document.getElementById('obj-leave'); if(el) el.innerText = '[x] Leave Origin\'s orbit'; }
       { const el = document.getElementById('obj-progress'); if(el) el.innerText = `[-] Visited ${visitedPlanets.size}/10 Planets`; }
       if (visitedPlanets.size === 10) { const el = document.getElementById('obj-all'); if(el) el.innerText = '[x] Explore ALL 10 Planets!'; }
       
       // Smooth vertical gravity falling OR clamp to ground if currently below surface
       let targetDist = currentDistCenter;
       if (currentDistCenter > surfaceRadius + 1) { // High up in air
           targetDist -= 80 * dt; // Gravity descent speed
           if(targetDist < surfaceRadius) targetDist = surfaceRadius;
       } else if (currentDistCenter < surfaceRadius) { // Clipped into ground
           targetDist = surfaceRadius; 
       } else { // Already resting
           targetDist = surfaceRadius;
       }

       yawObject.position.copy(center).add(up.multiplyScalar(targetDist));  

       // Align Local Y perfectly to the planet's normal utilizing pure Quaternions to prevent Euler twisting
       const currentUp = new THREE.Vector3(0,1,0).applyQuaternion(yawObject.quaternion);
       const alignQuat = new THREE.Quaternion().setFromUnitVectors(currentUp, up);
       yawObject.quaternion.premultiply(alignQuat);
    }
    
    // Dynamic Camera FOV, Zoom & Collision Avoidance
    let targetZ = isFlying ? 15 : 7;
    let targetY = isFlying ? 4 : 2;
    let targetFOV = isFlying ? 85 : 55; // Lower FOV compresses and flattens the landscape!
    camera.position.z += (targetZ - camera.position.z) * 5 * dt;
    camera.position.y += (targetY - camera.position.y) * 5 * dt;
    camera.fov += (targetFOV - camera.fov) * 5 * dt;
    camera.updateProjectionMatrix();

    camera.updateMatrixWorld();
    const camPos = new THREE.Vector3();
    camera.getWorldPosition(camPos);
    const clipDist = camPos.distanceTo(center);
    
    const camUp = camPos.clone().sub(center).normalize();
    const camTerrainRad = getTerrainHeight(closestPlanet, camUp);
    const minCamRad = camTerrainRad + 1.5;
    
    if (clipDist < minCamRad) {
        const deficit = minCamRad - clipDist;
        camera.position.z -= deficit * 1.5; // Push camera closer to player
        camera.position.y += deficit * 0.5; // Push camera slightly up
    }
    
    if(debugPos) debugPos.innerText = `Pos: ${yawObject.position.x.toFixed(0)}, ${yawObject.position.y.toFixed(0)}, ${yawObject.position.z.toFixed(0)}`;
    if(debugMode) {
        if (isFlying) debugMode.innerText = 'Mode: Spaceship \uD83D\uDE80';
        else if (isRiding) debugMode.innerText = 'Mode: Riding Beast \uD83E\uDD9A';
        else debugMode.innerText = 'Mode: Walking \uD83D\uDEB6';
    }
  }

  function animate() {
    nmsLoopId = requestAnimationFrame(animate);
    const dt = clock.getDelta();
    updatePhysics(dt);
    
    for (let p of planets) {
      if (p.mesh && p.mesh.isLOD) p.mesh.update(camera);
    }
    
    if(renderer && scene && camera) renderer.render(scene, camera);
  }

  window.startNMS = function() {
    if (!isLocked && container) {
       container.requestPointerLock();
    }
  };

  // Pre-initialize the massive planetary math so it doesn't block the play button Event Loop!
  setTimeout(() => {
    if (!scene) {
      init();
      animate();
    }
  }, 100);

  window.toggleFullscreenNMS = function() {
    const parent = document.getElementById('nms-container');
    if (!document.fullscreenElement) {
      if(parent) parent.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen();
    }
  };

})();
