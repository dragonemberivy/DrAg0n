/* PROCEDURAL UNIVERSE CORE ENGINE */
(function() {
  const container = document.getElementById('nms-canvas-container');
  const overlay = document.getElementById('nms-overlay');
  const crosshair = document.getElementById('nms-crosshair');
  const hud = document.getElementById('nms-hud');
  const hudPlanetInfo = document.getElementById('nms-planet-info');
  const hudPlanetName = document.getElementById('nms-planet-name');
  const hudPlanetResource = document.getElementById('nms-planet-resource');
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

  let isTrading = false;
  let spaceStation = null;
  let credits = 0;
  let engineMultiplier = 1;
  let sunLight;
  
  let dungeon = null;
  let isInsideDungeon = false;
  let dungeonDrones = [];

  let isBuildMode = false;
  let buildPartIndex = 0;
  let buildHologram = null;
  let placedBasesGroup = new THREE.Group();
  let baseParts = [];
  let activeBoss = null;
  let hasDualLasers = false;
  let lastFreighterSummonTime = 0;

  let isLocked = false;
  let lastTime = performance.now();
  let nmsLoopId;

  let raycaster = new THREE.Raycaster();
  let weatherSystem;
  let minedCrystals = 0;
  let inventory = {};
  let lasers = [];
  let enemyLasers = [];
  let pirates = [];
  let asteroidPositions = [];

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

    // Handheld Multi-Tool Gun
    const gunGeo = new THREE.BoxGeometry(0.3, 0.4, 1.2);
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 });
    const gunMesh = new THREE.Mesh(gunGeo, gunMat);
    gunMesh.position.set(0.7, 1.5, 0.4); // Right-hand position
    
    // Glowing Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.4);
    barrelGeo.rotateX(Math.PI / 2);
    const barrelMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
    const barrelMesh = new THREE.Mesh(barrelGeo, barrelMat);
    barrelMesh.position.set(0, 0.1, -0.6);
    gunMesh.add(barrelMesh);
    
    window.astronautGroup.add(gunMesh);

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
    scene.add(placedBasesGroup);
    
    baseParts = [
        { name: "Iron Wall", geo: new THREE.BoxGeometry(10, 10, 1), mat: new THREE.MeshStandardMaterial({color: 0x444444, roughness: 0.8}) },
        { name: "Metal Floor", geo: new THREE.BoxGeometry(10, 1, 10), mat: new THREE.MeshStandardMaterial({color: 0x222222, roughness: 0.9}) },
        { name: "Glass Dome", geo: new THREE.SphereGeometry(15, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat: new THREE.MeshStandardMaterial({color: 0x88ccaa, transparent: true, opacity: 0.4}) },
        { name: "Sodium Light", geo: new THREE.CylinderGeometry(0.5, 0.5, 8), mat: new THREE.MeshStandardMaterial({color: 0xffffee, emissive: 0xffffaa, emissiveIntensity: 1.0}) }
    ];

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
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

    // Global Asteroids
    const astCount = 2000;
    const astGeo = new THREE.DodecahedronGeometry(8, 1);
    
    // Distort vertices to make base rocks extremely jagged and misshapen
    const astPos = astGeo.attributes.position;
    for (let j = 0; j < astPos.count; j++) {
        const vx = astPos.getX(j) * (0.6 + Math.random() * 0.8);
        const vy = astPos.getY(j) * (0.6 + Math.random() * 0.8);
        const vz = astPos.getZ(j) * (0.6 + Math.random() * 0.8);
        astPos.setXYZ(j, vx, vy, vz);
    }
    astGeo.computeVertexNormals();

    const astMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9, metalness: 0.1, flatShading: true });
    const astMesh = new THREE.InstancedMesh(astGeo, astMat, astCount);
    
    const dummy = new THREE.Object3D();
    for (let i = 0; i < astCount; i++) {
        let pos = new THREE.Vector3((Math.random() - 0.5) * 8000, (Math.random() - 0.5) * 8000, (Math.random() - 0.5) * 8000);
        dummy.position.copy(pos);
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        // Provide chaotic non-uniform scaling per instance
        const sx = 0.5 + Math.random() * 3.0;
        const sy = 0.5 + Math.random() * 3.0;
        const sz = 0.5 + Math.random() * 3.0;
        dummy.scale.set(sx, sy, sz);
        dummy.updateMatrix();
        astMesh.setMatrixAt(i, dummy.matrix);
        asteroidPositions.push(pos.clone());
    }
    scene.add(astMesh);

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

  function createPlanet(x, y, z, radius, seed, colorSet, name, resource) {
    const lod = new THREE.LOD();
    
    // Creating different levels of detail
    const levels = [
      { res: 128, dist: 0 },
      { res: 64, dist: radius * 3 },
      { res: 32, dist: radius * 12 }
    ];

    let primaryLeavesMat = null;

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
         for(let r=0; r<100; r++) {
            const resGeo = new THREE.OctahedronGeometry(1.5, 0);
            const resMat = new THREE.MeshStandardMaterial({color: colorSet[3], emissive: colorSet[2], roughness: 0.1, flatShading: true});
            const resMesh = new THREE.Mesh(resGeo, resMat);
            resMesh.userData.isResource = true;
            const randVec = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
            
            // Calculate exact procedural height at this vertex to sit directly on ground
            let tHeight = radius;
            let noiseV = 0;
            let amp = 8 * (radius/100);
            let freq = 0.05 * (100/radius);
            for(let oct=0; oct<3; oct++) {
               let n = simplex.noise3D(randVec.x * freq, randVec.y * freq, randVec.z * freq);
               noiseV += (1.0 - Math.abs(n)) * amp;
               amp *= 0.5; freq *= 2.0;
            }
            noiseV -= 5 * (radius/100);
            if (noiseV <= 0) noiseV = 0;
            tHeight += noiseV;
            
            resMesh.position.copy(randVec).multiplyScalar(tHeight + 1.2); 
            resMesh.lookAt(new THREE.Vector3(0,0,0));
            mesh.add(resMesh);
         }
         
         // Procedural Flora (Instanced Mesh for Extreme Performance)
         const treeCount = Math.floor(radius * 1.5);
         let trunkGeo, leavesGeo, trunkMat, leavesMat;
         
         if (seed === 'seed_ocean') {
            trunkGeo = new THREE.CylinderGeometry(0.2, 0.2, 3, 5); // Kelp
            leavesGeo = new THREE.DodecahedronGeometry(1.5, 0); // Coral
            trunkMat = new THREE.MeshStandardMaterial({color: 0x228b22, roughness: 0.9, flatShading: true}); // Green kelp
            leavesMat = new THREE.MeshStandardMaterial({color: 0xff7f50, roughness: 0.8, flatShading: true, emissive: 0xff7f50, emissiveIntensity: 0}); // Coral color
         } else {
            trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 3, 5);
            leavesGeo = new THREE.ConeGeometry(1.5, 5, 5);
            leavesGeo.translate(0, 3, 0);
            trunkMat = new THREE.MeshStandardMaterial({color: 0x3d2817, roughness: 0.9, flatShading: true});
            leavesMat = new THREE.MeshStandardMaterial({color: colorSet[2], roughness: 0.8, flatShading: true, emissive: colorSet[2], emissiveIntensity: 0});
         }
         if (level.dist === 0) primaryLeavesMat = leavesMat;

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
            
            // Only spawn trees/flora on solid land (above water!)
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

    // Fauna (Circling abstract birds/creatures or fish/sharks for ocean)
    const faunaGroup = new THREE.Group();
    for(let f=0; f<12; f++) {
       let bGeo, bMat;
       if (seed === 'seed_ocean') {
           bGeo = new THREE.ConeGeometry(0.6, 2.0, 4); // Fish/Shark shape
           bGeo.rotateX(Math.PI/2);
           bMat = new THREE.MeshStandardMaterial({color: 0x708090, emissive: 0x2f4f4f, flatShading: true});
       } else {
           bGeo = new THREE.ConeGeometry(0.4, 1.2, 3);
           bGeo.rotateX(Math.PI/2);
           bMat = new THREE.MeshStandardMaterial({color: colorSet[4], emissive: colorSet[1], flatShading: true});
       }
       const bMesh = new THREE.Mesh(bGeo, bMat);
       const randY = (Math.random() - 0.5) * radius * 0.8;
       const randAngle = Math.random() * Math.PI * 2;
       const bDist = radius + 8 + Math.random() * 15;
       bMesh.position.set(Math.sin(randAngle) * bDist, randY, Math.cos(randAngle) * bDist);
       // Point along the orbit path
       bMesh.lookAt(new THREE.Vector3(Math.sin(randAngle + 0.1) * bDist, randY, Math.cos(randAngle + 0.1) * bDist));
       bMesh.userData.isFauna = true; // Tag for Multi-Tool Raycaster
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

    planets.push({ mesh: lod, radius, position: new THREE.Vector3(x, y, z), colorSet: colorSet, simplex: new SimplexNoise(seed), faunaGroup: faunaGroup, rideableGroup, name: name, resource: resource, floraMat: primaryLeavesMat });
  }

  function spawnSolarSystem() {
     // Earth-like (Origin)
     createPlanet(0, 0, 0, 100, 'seed_earth', [0x1d4ed8, 0x3b82f6, 0x22c55e, 0x78716c, 0xf8fafc], 'Aethelgard IV (Origin World)', 'Iron');
     // Mars-like
     createPlanet(800, 300, -1200, 150, 'seed_mars', [0x7f1d1d, 0x991b1b, 0xd97706, 0xfcd34d, 0xfef3c7], 'Cygnus Prime (Desert Planet)', 'Platinum');
     // Small Ice planet
     createPlanet(-1000, -500, -500, 60, 'seed_ice', [0x0284c7, 0x38bdf8, 0xbae6fd, 0xf0f9ff, 0xffffff], 'Vespera Beta (Alien Ice World)', 'Gold');
     // Toxic gas giant
     createPlanet(500, -800, 1500, 250, 'seed_gas', [0x064e3b, 0x166534, 0x65a30d, 0x84cc16, 0xd9f99d], 'Romulus II (Toxic Gas Giant)', 'Titanium');
     
     // 6 New Planets
     createPlanet(2500, 1000, 500, 120, 'seed_magma', [0x450a0a, 0x7f1d1d, 0xb91c1c, 0xef4444, 0xfca5a5], 'Tholian Colony (Lava World)', 'Dilithium');
     createPlanet(-2500, 1500, 1000, 180, 'seed_pink', [0x831843, 0xbe185d, 0xdb2777, 0xf472b6, 0xfbcfe8], 'Qo\'noS Beta (Hostile Pink World)', 'Tritanium');
     createPlanet(0, 2500, -2000, 200, 'seed_desert', [0x78350f, 0x92400e, 0xb45309, 0xd97706, 0xfcd34d], 'Audet IX (Arid Alien Planet)', 'Uranium');
     createPlanet(-800, -2500, -1500, 90, 'seed_ocean', [0x1e3a8a, 0x1e40af, 0x1d4ed8, 0x2563eb, 0x3b82f6], 'Sarpeidon VII (Deep Ocean World)', 'Plutonium');
     createPlanet(1800, -2000, -2500, 140, 'seed_purple', [0x4c1d95, 0x5b21b6, 0x6d28d9, 0x7c3aed, 0xa78bfa], 'Atrea Alpha (Mystic Purple Planet)', 'Silver');
     createPlanet(-400, 500, -300, 30, 'seed_moon', [0x1c1917, 0x292524, 0x44403c, 0x57534e, 0x78716c], 'Coppelius IV (Desolate Moon)', 'Copper');
     
     createSpaceStation();
     createDungeon(-2000, 2000, -2000);
  }
  
  function createDungeon(x, y, z) {
     const group = new THREE.Group();
     
     // Exterior Hull
     const hullGeo = new THREE.BoxGeometry(60, 40, 200);
     const hullMat = new THREE.MeshStandardMaterial({color: 0x333333, roughness: 0.9, metalness: 0.5});
     const hull = new THREE.Mesh(hullGeo, hullMat);
     group.add(hull);
     
     // Slimey Green Ooze Patches
     const oozeGeo = new THREE.SphereGeometry(1, 8, 8);
     const oozeMat = new THREE.MeshStandardMaterial({color: 0x33ff00, roughness: 0.1, metalness: 0.2, emissive: 0x118800, emissiveIntensity: 0.5, transparent: true, opacity: 0.8});
     for (let i = 0; i < 60; i++) {
         const ooze = new THREE.Mesh(oozeGeo, oozeMat);
         ooze.scale.set(Math.random() * 8 + 4, Math.random() * 8 + 4, Math.random() * 8 + 4);
         
         let x = (Math.random() - 0.5) * 62;
         let y = (Math.random() - 0.5) * 42;
         let z = (Math.random() - 0.5) * 202;
         
         // Stick to the outer faces roughly 
         const face = Math.floor(Math.random() * 6);
         if (face === 0) x = 30; else if (face === 1) x = -30;
         else if (face === 2) y = 20; else if (face === 3) y = -20;
         else if (face === 4) z = 100; else z = -100;
         
         ooze.position.set(x, y, z);
         group.add(ooze);
     }
     
     // Interior Corridor (BackSide)
     const corridorGeo = new THREE.BoxGeometry(20, 20, 180);
     const corridorMat = new THREE.MeshStandardMaterial({color: 0x1a1a24, side: THREE.BackSide});
     const corridor = new THREE.Mesh(corridorGeo, corridorMat);
     group.add(corridor);
     
     // Treasure (Artifact Vault)
     const tGeo = new THREE.OctahedronGeometry(5, 0);
     const tMat = new THREE.MeshStandardMaterial({color: 0xffd700, emissive: 0xffaa00, emissiveIntensity: 0.5});
     const treasure = new THREE.Mesh(tGeo, tMat);
     treasure.position.set(0, -3, -80);
     treasure.userData.isTreasure = true;
     group.add(treasure);
     
     // Enemies (Alien Drones) inside corridor
     for (let i=0; i<8; i++) {
         const dGeo = new THREE.SphereGeometry(2, 8, 8);
         const dMat = new THREE.MeshStandardMaterial({color: 0xff00cc, emissive: 0xff00cc, emissiveIntensity: 0.8});
         const drone = new THREE.Mesh(dGeo, dMat);
         drone.userData.isDrone = true;
         // scatter between Z -70 to 70
         drone.position.set((Math.random()-0.5)*15, (Math.random()-0.5)*10, (Math.random()-0.5)*140);
         dungeonDrones.push({ mesh: drone, nextFire: Math.random()*2 });
         group.add(drone);
     }
     
     group.position.set(x, y, z);
     scene.add(group);
     dungeon = group;
  }

  function updateBuildHologram() {
      if (buildHologram) {
          scene.remove(buildHologram);
          buildHologram = null;
      }
      if (!isBuildMode) return;
      
      const part = baseParts[buildPartIndex];
      const holoMat = part.mat.clone();
      holoMat.transparent = true;
      holoMat.opacity = 0.5;
      holoMat.emissive = new THREE.Color(0x00ff00);
      holoMat.emissiveIntensity = 0.5;
      
      buildHologram = new THREE.Mesh(part.geo, holoMat);
      scene.add(buildHologram);
  }

  function createSpaceStation() {
     const stGeo = new THREE.TorusGeometry(80, 15, 16, 100);
     const stMat = new THREE.MeshStandardMaterial({color: 0x8888aa, metalness: 0.8, roughness: 0.2});
     spaceStation = new THREE.Mesh(stGeo, stMat);
     
     const coreGeo = new THREE.CylinderGeometry(30, 30, 100, 16);
     const coreMat = new THREE.MeshStandardMaterial({color: 0x444455, metalness: 0.9});
     const coreMesh = new THREE.Mesh(coreGeo, coreMat);
     spaceStation.add(coreMesh);
     
     spaceStation.position.set(0, 400, 0); // High orbit above origin
     spaceStation.rotation.x = Math.PI / 2;
     scene.add(spaceStation);
  }

  function onMouseDown(e) {
    if (!isLocked) return;
    
    if (isBuildMode && buildHologram && buildHologram.visible) {
        if (credits >= 10) {
            credits -= 10;
            document.getElementById('trade-credits').innerText = credits + ' ¢';
            
            const part = baseParts[buildPartIndex];
            const newPart = new THREE.Mesh(part.geo, part.mat);
            newPart.position.copy(buildHologram.position);
            newPart.quaternion.copy(buildHologram.quaternion);
            
            if (buildPartIndex === 3) { // Sodium Light logic
                const pl = new THREE.PointLight(0xffffaa, 1.5, 100);
                pl.position.set(0, 3, 0);
                newPart.add(pl);
            }
            
            placedBasesGroup.add(newPart);
            
            const scoreEl = document.getElementById('obj-progress');
            if (scoreEl) scoreEl.innerText = '[-10 ¢] Constructed Base Element!';
        } else {
            document.body.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
            setTimeout(() => { document.body.style.backgroundColor = "transparent"; }, 150);
            const scoreEl = document.getElementById('obj-progress');
            if (scoreEl) scoreEl.innerText = '[!] NEED 10 CREDITS TO BUILD!';
        }
        return; // Prevents normal shooting raycaster code from running
    }
    
    if (isFlying) {
       // Space Laser Shoot
       const laserGeo = new THREE.CylinderGeometry(0.2, 0.2, 4, 8);
       laserGeo.rotateX(Math.PI / 2);
       const laserMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
       
       const startPos = new THREE.Vector3();
       camera.getWorldPosition(startPos);
       const laserDir = new THREE.Vector3();
       camera.getWorldDirection(laserDir);
       
       if (hasDualLasers) {
           const offsetLeft = new THREE.Vector3(-1.5, -0.5, 0).applyQuaternion(camera.quaternion);
           const offsetRight = new THREE.Vector3(1.5, -0.5, 0).applyQuaternion(camera.quaternion);
           
           const laser1 = new THREE.Mesh(laserGeo, laserMat);
           laser1.position.copy(startPos).add(offsetLeft);
           laser1.lookAt(laser1.position.clone().add(laserDir.clone().multiplyScalar(10)));
           scene.add(laser1);
           lasers.push({ mesh: laser1, dir: laserDir, life: 100 });
           
           const laser2 = new THREE.Mesh(laserGeo, laserMat);
           laser2.position.copy(startPos).add(offsetRight);
           laser2.lookAt(laser2.position.clone().add(laserDir.clone().multiplyScalar(10)));
           scene.add(laser2);
           lasers.push({ mesh: laser2, dir: laserDir, life: 100 });
       } else {
           const laser = new THREE.Mesh(laserGeo, laserMat);
           laser.position.copy(startPos);
           
           const targetPoint = startPos.clone().add(laserDir.clone().multiplyScalar(10));
           laser.lookAt(targetPoint);
           
           scene.add(laser);
           lasers.push({ mesh: laser, dir: laserDir, life: 100 });
       }
       return;
    }
    
    // Handheld Multi-Tool Shoot (Mining & Culling)
    const pLaserGeo = new THREE.CylinderGeometry(0.08, 0.08, 2, 8);
    pLaserGeo.rotateX(Math.PI / 2);
    const pLaserMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const pLaser = new THREE.Mesh(pLaserGeo, pLaserMat);
    
    const pStartPos = new THREE.Vector3();
    camera.getWorldPosition(pStartPos);
    pStartPos.y -= 0.5; // Fire slightly below eye level (from gun)
    pLaser.position.copy(pStartPos);
    
    const pLaserDir = new THREE.Vector3();
    camera.getWorldDirection(pLaserDir);
    
    pLaser.lookAt(pStartPos.clone().add(pLaserDir.clone().multiplyScalar(10)));
    scene.add(pLaser);
    lasers.push({ mesh: pLaser, dir: pLaserDir, life: 50 }); // Fast dissipating beam

    raycaster.setFromCamera(new THREE.Vector2(0,0), camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    for (let pt of intersects) {
       if (pt.distance < 45) { // Range of handheld Multi-Tool
           
           // Handle specific interactable elements
           if (pt.object.userData && (pt.object.userData.isResource || pt.object.userData.isFauna || pt.object.userData.isTreasure || pt.object.userData.isDrone)) {
               if (pt.object.userData.isResource) {
                   pt.object.parent.remove(pt.object);
                   minedCrystals++;
                   const scoreEl = document.getElementById('obj-mine');
                   if (scoreEl) {
                      const resName = window.currentPlanetResource || 'Crystal';
                      inventory[resName] = (inventory[resName] || 0) + 1;
                      
                      if(minedCrystals >= 10) scoreEl.innerText = '[x] Mine Crystals: 10/10';
                      else scoreEl.innerText = `[ ] Mined ${resName}: ${inventory[resName]} (Total: ${minedCrystals}/10)`;
                   }
               }
               else if (pt.object.userData.isFauna) {
                   pt.object.parent.remove(pt.object);
                   const scoreEl = document.getElementById('obj-progress');
                   if (scoreEl) scoreEl.innerText = '[-] Culled Biological Entity!';
               }
               else if (pt.object.userData.isTreasure) {
                   pt.object.parent.remove(pt.object);
                   credits += 5000;
                   const scoreEl = document.getElementById('obj-progress');
                   if (scoreEl) scoreEl.innerText = '[$$$] LOOTED FREIGHTER VAULT!';
                   document.getElementById('trade-credits').innerText = credits + ' ¢';
               }
               else if (pt.object.userData.isDrone) {
                   pt.object.parent.remove(pt.object);
                   const scoreEl = document.getElementById('obj-progress');
                   if (scoreEl) scoreEl.innerText = '[-] Destroyed Alien Drone!';
               }
               else if (pt.object.userData.isBoss) {
                   if (activeBoss) {
                       activeBoss.health -= 25;
                       if (activeBoss.health <= 0) {
                           for (let seg of activeBoss.segments) scene.remove(seg);
                           activeBoss = null;
                           credits += 10000;
                           document.getElementById('trade-credits').innerText = credits + ' ¢';
                           const scoreEl = document.getElementById('obj-progress');
                           if (scoreEl) scoreEl.innerText = '[$$$] SLAIN THE PLANETARY TITAN!';
                       } else {
                           const scoreEl = document.getElementById('obj-progress');
                           if (scoreEl) scoreEl.innerText = `[⚠️] Boss HP: ${activeBoss.health}`;
                       }
                   }
               }
               break;
           }
           // Terrain hit check (Not fauna/resource, meaning we hit a solid planet surface)
           else if (window.currentPlanetResource) {
               minedCrystals++;
               const scoreEl = document.getElementById('obj-mine');
               if (scoreEl) {
                  const resName = window.currentPlanetResource;
                  inventory[resName] = (inventory[resName] || 0) + 1;
                  
                  if(minedCrystals >= 10) scoreEl.innerText = '[x] Mine Crystals: 10/10';
                  else scoreEl.innerText = `[ ] Mined ${resName}: ${inventory[resName]} (Total: ${minedCrystals}/10)`;
               }
               break; // Only mine 1 chunk per click on the ground
           }
       }
    }
  }

  function onResize() {
    if(!camera || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  function createPirateShip() {
    const group = new THREE.Group();
    
    // Hull
    const hullGeo = new THREE.CylinderGeometry(0.5, 1.5, 5, 8);
    hullGeo.rotateX(Math.PI / 2);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5 });
    const hullMesh = new THREE.Mesh(hullGeo, hullMat);
    group.add(hullMesh);

    // Cockpit
    const shipVisorGeo = new THREE.SphereGeometry(1, 16, 16);
    shipVisorGeo.scale(1, 0.5, 1.5);
    const shipVisorMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 1.0, roughness: 0.1 });
    const shipVisorMesh = new THREE.Mesh(shipVisorGeo, shipVisorMat);
    shipVisorMesh.position.set(0, 0.5, -0.5);
    group.add(shipVisorMesh);

    // Wings
    const wingGeo = new THREE.BoxGeometry(6, 0.2, 2);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });
    const wingMesh = new THREE.Mesh(wingGeo, wingMat);
    wingMesh.position.set(0, 0, 1);
    group.add(wingMesh);

    // Thrusters
    const thrusterGeo = new THREE.CylinderGeometry(0.6, 0.4, 1, 8);
    thrusterGeo.rotateX(Math.PI / 2);
    const thrusterMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const thrusterMesh1 = new THREE.Mesh(thrusterGeo, thrusterMat);
    thrusterMesh1.position.set(-1.5, 0, 2.5);
    const thrusterMesh2 = new THREE.Mesh(thrusterGeo, thrusterMat);
    thrusterMesh2.position.set(1.5, 0, 2.5);
    group.add(thrusterMesh1);
    group.add(thrusterMesh2);

    // Engine Glow
    const glowGeo = new THREE.SphereGeometry(0.4, 8, 8);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff8800 });
    const glow1 = new THREE.Mesh(glowGeo, glowMat);
    glow1.position.set(-1.5, 0, 3);
    const glow2 = new THREE.Mesh(glowGeo, glowMat);
    glow2.position.set(1.5, 0, 3);
    group.add(glow1);
    group.add(glow2);

    // Pirate Flag Emoji
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    context.font = '48px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('🏴‍☠️', 32, 32);
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(6, 6, 1);
    sprite.position.set(0, 4, 0); 
    group.add(sprite);

    // Scale up to match the original sphere size (radius ~60)
    group.scale.set(12, 12, 12);
    return group;
  }

  function onKeyDown(e) {
    let code = e.code || "";
    let key = (e.key || "").toLowerCase();
    
    if (code === 'ArrowUp' || code === 'KeyW' || key === 'w') keys.w = true;
    if (code === 'ArrowLeft' || code === 'KeyA' || key === 'a') keys.a = true;
    if (code === 'ArrowDown' || code === 'KeyS' || key === 's') keys.s = true;
    if (code === 'ArrowRight' || code === 'KeyD' || key === 'd') keys.d = true;
    if (code === 'Space' || key === ' ') keys.space = true;
    
    switch(code) {
      case 'KeyB':
        if (!isFlying && !isRiding && !isInsideDungeon) {
            isBuildMode = !isBuildMode;
            updateBuildHologram();
            const progressObj = document.getElementById('obj-progress');
            if (progressObj) {
                if (isBuildMode) progressObj.innerText = `[BUILD] Mode Active! Press 1-4 to switch.`;
                else progressObj.innerText = ``;
            }
        }
        break;
      case 'Digit1': if(isBuildMode) { buildPartIndex = 0; updateBuildHologram(); } break;
      case 'Digit2': if(isBuildMode) { buildPartIndex = 1; updateBuildHologram(); } break;
      case 'Digit3': if(isBuildMode) { buildPartIndex = 2; updateBuildHologram(); } break;
      case 'Digit4': if(isBuildMode) { buildPartIndex = 3; updateBuildHologram(); } break;
      case 'KeyG':
        if (dungeon && !isInsideDungeon && yawObject.position.distanceTo(dungeon.position) < 300 && isFlying) {
            isFlying = false;
            isRiding = false;
            isInsideDungeon = true;
            window.spaceshipGroup.visible = false;
            window.astronautGroup.visible = true;
            
            yawObject.position.copy(dungeon.position).add(new THREE.Vector3(0, 0, 80));
            camera.rotation.x = 0;
            yawObject.rotation.y = Math.PI; // Face inward (-Z)
        } else if (dungeon && isInsideDungeon) {
            const relPos = yawObject.position.clone().sub(dungeon.position);
            if (relPos.z > 70) { // Near the airlock
                isInsideDungeon = false;
                isFlying = true;
                window.spaceshipGroup.visible = true;
                window.astronautGroup.visible = false;
                
                yawObject.position.copy(dungeon.position).add(new THREE.Vector3(0, 0, 150));
                yawObject.rotation.y = 0;
                
                const promptEl = document.getElementById('nms-planet-info');
                if (promptEl) promptEl.style.opacity = '0';
            }
        }
        break;
      case 'KeyT':
        if (spaceStation && yawObject.position.distanceTo(spaceStation.position) < 300 && isFlying) {
            document.exitPointerLock();
            document.getElementById('nms-trade-overlay').style.display = 'flex';
            isTrading = true;
        }
        break;
      case 'KeyF': 
        toggleFlightMode();
        break;
      case 'KeyE':
        toggleRidingMode();
        break;
      case 'KeyH':
        if (!isInsideDungeon) {
            const now = Date.now();
            if (now - lastFreighterSummonTime >= 30 * 1000) { // 30 sec cooldown for testing
                lastFreighterSummonTime = now;
                
                // Remove old dungeon if exists
                if (dungeon) {
                    scene.remove(dungeon);
                    for(let droneObj of dungeonDrones) {
                        if (droneObj.mesh.parent) scene.remove(droneObj.mesh);
                    }
                    dungeonDrones = [];
                }
                
                const dir = new THREE.Vector3();
                camera.getWorldDirection(dir);
                // Spawn 150 units in front and 100 units UP, so it's impossible to miss!
                const spawnPos = yawObject.position.clone().add(dir.multiplyScalar(150)).add(new THREE.Vector3(0, 100, 0));
                
                createDungeon(spawnPos.x, spawnPos.y, spawnPos.z);
                
                const scoreEl = document.getElementById('obj-progress');
                if (scoreEl) scoreEl.innerText = '[HYPERSPACE] Derelict Freighter warped right above you!';
            } else {
                const remaining = Math.ceil((30 * 1000 - (now - lastFreighterSummonTime)) / 1000);
                const scoreEl = document.getElementById('obj-progress');
                if (scoreEl) scoreEl.innerText = `[!] Freighter Jump on Cooldown: ${remaining}s left`;
            }
        }
        break;
      case 'KeyK':
        if (!activeBoss && !isInsideDungeon) {
            let closestPlanet = planets[0];
            let minDist = Infinity;
            for (let p of planets) {
              const dist = yawObject.position.distanceTo(p.position);
              if (dist < minDist) { minDist = dist; closestPlanet = p; }
            }
            if (minDist < closestPlanet.radius + 600) {
                activeBoss = { segments: [], health: 500, planet: closestPlanet };
                const bossMaterial = new THREE.MeshStandardMaterial({color: 0x8b4513, roughness: 0.9});
                
                const headGeo = new THREE.CylinderGeometry(8, 6, 20, 16);
                headGeo.rotateX(Math.PI / 2); // point forward
                
                const dir = new THREE.Vector3();
                camera.getWorldDirection(dir);
                let headPos = yawObject.position.clone().add(dir.multiplyScalar(400));
                
                const headMesh = new THREE.Mesh(headGeo, bossMaterial);
                headMesh.position.copy(headPos);
                headMesh.userData.isBoss = true; // For raycaster hits
                scene.add(headMesh);
                activeBoss.segments.push(headMesh);
                
                const bodyGeo = new THREE.SphereGeometry(6, 12, 12);
                for (let i = 1; i <= 20; i++) {
                    const bodyMesh = new THREE.Mesh(bodyGeo, bossMaterial);
                    bodyMesh.position.copy(headPos);
                    scene.add(bodyMesh);
                    activeBoss.segments.push(bodyMesh);
                }
                const scoreEl = document.getElementById('obj-progress');
                if (scoreEl) scoreEl.innerText = '[⚠️] SEISMIC WORM ANOMALY DETECTED!';
            }
        }
        break;
      case 'KeyP':
        // Manual Pirate Spawn
        if (pirates.length < 5) {
            const pirate = createPirateShip();
            
            const camDir = new THREE.Vector3();
            camera.getWorldDirection(camDir);
            
            // Spawn directly in front of the player
            const spawnPos = yawObject.position.clone().add(camDir.multiplyScalar(600));
            pirate.position.copy(spawnPos);
            pirate.lookAt(yawObject.position); 
            scene.add(pirate);
            const offset = new THREE.Vector3((Math.random() - 0.5) * 300, (Math.random() - 0.5) * 150, 0);
            pirates.push({ mesh: pirate, offset: offset, nextFire: Math.random() * 2 });
            
            const scoreEl = document.getElementById('obj-progress');
            if (scoreEl) scoreEl.innerText = '[!] MANUALLY SUMMONED PIRATE!';
        }
        break;
    }
  }

  function onKeyUp(e) {
    let code = e.code || "";
    let key = (e.key || "").toLowerCase();
    
    if (code === 'ArrowUp' || code === 'KeyW' || key === 'w') keys.w = false;
    if (code === 'ArrowLeft' || code === 'KeyA' || key === 'a') keys.a = false;
    if (code === 'ArrowDown' || code === 'KeyS' || key === 's') keys.s = false;
    if (code === 'ArrowRight' || code === 'KeyD' || key === 'd') keys.d = false;
    if (code === 'Space' || key === ' ') keys.space = false;
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
    
    // Natural Pirate Spawns in Space
    if (isFlying && Math.random() < 0.002) {
        if (pirates.length < 3) { // Limit number of active pirates
            const pirate = createPirateShip();
            
            const camDir = new THREE.Vector3();
            camera.getWorldDirection(camDir);
            
            const spawnPos = yawObject.position.clone().add(camDir.multiplyScalar(800));
            
            pirate.position.copy(spawnPos);
            pirate.lookAt(yawObject.position);
            scene.add(pirate);
            const offset = new THREE.Vector3((Math.random() - 0.5) * 300, (Math.random() - 0.5) * 150, 0);
            pirates.push({ mesh: pirate, offset: offset, nextFire: Math.random() * 2 });
            
            const scoreEl = document.getElementById('obj-progress');
            if (scoreEl) scoreEl.innerText = '[!] SPACE PIRATE INTERCEPTED!';
        }
    }
    
    // Boss Sandworm Slithering & Combat
    if (activeBoss) {
        let head = activeBoss.segments[0];
        const wormDist = head.position.distanceTo(yawObject.position);
        const center = activeBoss.planet.position;
        
        // 1. Move head
        const headDir = yawObject.position.clone().sub(head.position).normalize();
        const wave = Math.sin(Date.now() * 0.002) * 50; 
        const upVec = head.position.clone().sub(center).normalize();
        
        const terrainRadius = getTerrainHeight(activeBoss.planet, upVec);
        const surfaceRadius = terrainRadius + 10 + wave; // Dive in and out of sand
        
        head.position.add(headDir.multiplyScalar(60 * dt));
        head.lookAt(yawObject.position);
        
        // Terrain Snap Head
        const currentDistCenter = head.position.distanceTo(center);
        const targetRadius = activeBoss.planet.radius + surfaceRadius;
        if (currentDistCenter !== targetRadius) {
            const deficit = targetRadius - currentDistCenter;
            head.position.add(upVec.multiplyScalar(deficit * dt * 5)); // smooth snap
        }

        // Damage the player
        if (wormDist < 25) {
             playerHealth -= 20 * dt;
             const hpBar = document.getElementById('nms-health-bar');
             if(hpBar) hpBar.style.width = Math.max(0, playerHealth) + '%';
             
             if (Math.random() > 0.8) {
                 document.body.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
                 setTimeout(() => { document.body.style.backgroundColor = "transparent"; }, 50);
             }

             if (playerHealth <= 0) {
                 const scoreEl = document.getElementById('obj-progress');
                 if (scoreEl) scoreEl.innerText = '[☠️] EATEN BY SANDWORM!';
                 yawObject.position.set(0, 150, 0); // Origin respawn
                 playerHealth = 100;
                 if (!isFlying) toggleFlightMode();
             }
        }

        // 2. Chaining segments
        for (let i = 1; i < activeBoss.segments.length; i++) {
            let seg = activeBoss.segments[i];
            let leader = activeBoss.segments[i-1];
            
            const segDist = seg.position.distanceTo(leader.position);
            if (segDist > 10) { // Keep segments glued smoothly
                const dirToLeader = leader.position.clone().sub(seg.position).normalize();
                seg.position.copy(leader.position.clone().sub(dirToLeader.multiplyScalar(10)));
                seg.lookAt(leader.position);
            }
        }
    }

    // Evaluate Asteroid Collisions
    if (isFlying && asteroidPositions.length > 0) {
        for (let i = 0; i < asteroidPositions.length; i++) {
            if (yawObject.position.distanceTo(asteroidPositions[i]) < 18) {
                // Hard Bounce Calculation
                const bounceDir = yawObject.position.clone().sub(asteroidPositions[i]).normalize();
                yawObject.position.add(bounceDir.multiplyScalar(30));
                
                // Damage Ship
                playerHealth -= 20;
                const hpBar = document.getElementById('nms-health-bar');
                if(hpBar) hpBar.style.width = Math.max(0, playerHealth) + '%';
                
                const scoreEl = document.getElementById('obj-progress');
                if (scoreEl) scoreEl.innerText = '[!] HULL BREACH: ASTEROID COLLISION!';
                
                if (playerHealth <= 0) {
                    playerHealth = 100;
                    if(hpBar) hpBar.style.width = '100%';
                    yawObject.position.set(0, 102, 0);
                    toggleFlightMode();
                }
            }
        }
    }
    
    // Update Lasers
    for (let i = lasers.length - 1; i >= 0; i--) {
        let l = lasers[i];
        l.mesh.position.add(l.dir.clone().multiplyScalar(1000 * dt)); // Fast lasers
        l.life -= 100 * dt;
        
        let removed = false;
        if (l.life <= 0) {
            scene.remove(l.mesh);
            lasers.splice(i, 1);
            removed = true;
        }
        
        if (!removed && activeBoss) {
            if (l.mesh.position.distanceTo(activeBoss.segments[0].position) < 25) {
                scene.remove(l.mesh);
                lasers.splice(i, 1);
                
                activeBoss.health -= 25;
                if (activeBoss.health <= 0) {
                     for(let seg of activeBoss.segments) scene.remove(seg);
                     activeBoss = null;
                     credits += 10000;
                     document.getElementById('trade-credits').innerText = credits + ' ¢';
                     const scoreEl = document.getElementById('obj-progress');
                     if (scoreEl) scoreEl.innerText = '[$$$] SLAIN THE PLANETARY TITAN!';
                } else {
                     const scoreEl = document.getElementById('obj-progress');
                     if (scoreEl) scoreEl.innerText = `[⚠️] Boss HP: ${activeBoss.health}`;
                }
            }
        }
    }

    // Update Enemy Lasers
    for (let i = enemyLasers.length - 1; i >= 0; i--) {
        let l = enemyLasers[i];
        l.mesh.position.add(l.dir.clone().multiplyScalar(400 * dt));
        l.life -= 100 * dt;
        
        if (l.mesh.position.distanceTo(yawObject.position) < 20) {
            playerHealth -= 5;
            const hpBar = document.getElementById('nms-health-bar');
            if(hpBar) hpBar.style.width = Math.max(0, playerHealth) + '%';
            
            scene.remove(l.mesh);
            enemyLasers.splice(i, 1);
            
            if (playerHealth <= 0) {
                playerHealth = 100;
                if(hpBar) hpBar.style.width = '100%';
                yawObject.position.set(0, 102, 0);
                if (isFlying) toggleFlightMode();
            }
            continue;
        }
        
        if (l.life <= 0) {
            scene.remove(l.mesh);
            enemyLasers.splice(i, 1);
        }
    }

    // Update Pirates
    for (let i = pirates.length - 1; i >= 0; i--) {
        let pData = pirates[i];
        let p = pData.mesh;
        
        const distToPlayer = p.position.distanceTo(yawObject.position);
        const toPlayer = yawObject.position.clone().sub(p.position).normalize();
        
        // Formation and Movement
        if (distToPlayer > 300) {
            const right = new THREE.Vector3().crossVectors(toPlayer, new THREE.Vector3(0,1,0)).normalize();
            if (right.lengthSq() < 0.1) right.set(1,0,0); // Fallback if pointing straight up/down
            const up = new THREE.Vector3(0, 1, 0);
            const formationTarget = yawObject.position.clone()
                .add(right.multiplyScalar(pData.offset.x))
                .add(up.multiplyScalar(pData.offset.y));
                
            const toTarget = formationTarget.sub(p.position).normalize();
            p.position.add(toTarget.multiplyScalar(220 * dt)); // faster intercept
        } else {
            // Strafe orbit within close range
            const right = new THREE.Vector3().crossVectors(toPlayer, new THREE.Vector3(0,1,0)).normalize();
            if (right.lengthSq() < 0.1) right.set(1,0,0);
            p.position.add(right.multiplyScalar(pData.offset.x > 0 ? 80 * dt : -80 * dt));
        }
        p.lookAt(yawObject.position);
        
        // Combat: Shooting Red Lasers
        pData.nextFire -= dt;
        if (pData.nextFire <= 0 && distToPlayer < 400 && isFlying) {
            pData.nextFire = 1.5 + Math.random() * 2; // Fire every 1.5 to 3.5 seconds
            
            const eLaserGeo = new THREE.CylinderGeometry(0.8, 0.8, 6, 8);
            eLaserGeo.rotateX(Math.PI / 2);
            const eLaserMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const eLaser = new THREE.Mesh(eLaserGeo, eLaserMat);
            
            eLaser.position.copy(p.position);
            eLaser.lookAt(yawObject.position);
            
            const laserDir = yawObject.position.clone().sub(p.position).normalize();
            scene.add(eLaser);
            enemyLasers.push({ mesh: eLaser, dir: laserDir, life: 100 });
        }
        
        // Check hits against player's lasers
        let hit = false;
        for (let j = lasers.length - 1; j >= 0; j--) {
            if (p.position.distanceTo(lasers[j].mesh.position) < 25) {
                scene.remove(lasers[j].mesh);
                lasers.splice(j, 1);
                hit = true;
                
                const scoreEl = document.getElementById('obj-progress');
                if (scoreEl) {
                    scoreEl.innerText = '[-] Pīřåțë Đεšťrøýed! (+1 Pirate Scrap)';
                    inventory['Pirate Scrap'] = (inventory['Pirate Scrap'] || 0) + 1;
                    const mineObj = document.getElementById('obj-mine');
                    if (mineObj) mineObj.innerText = `[ ] Resources: ${inventory['Pirate Scrap']}x Pirate Scrap`;
                }
                break;
            }
        }
        
        // Check direct crashes against player
        if (!hit && p.position.distanceTo(yawObject.position) < 80) {
            playerHealth -= 15;
            const hpBar = document.getElementById('nms-health-bar');
            if(hpBar) hpBar.style.width = Math.max(0, playerHealth) + '%';
            scene.remove(p);
            pirates.splice(i, 1);
            if (playerHealth <= 0) {
                playerHealth = 100;
                yawObject.position.set(0, 102, 0);
                if (isFlying) toggleFlightMode();
            }
            continue;
        }
        
        if (hit) {
            scene.remove(p);
            pirates.splice(i, 1);
        }
    }
    
    const direction = new THREE.Vector3(0,0,0);
    if(keys.w) direction.z -= 1;
    if(keys.s) direction.z += 1;
    if(keys.a) direction.x -= 1;
    if(keys.d) direction.x += 1;
    direction.normalize();
    direction.normalize();

    // Flight mode travels 10x faster, Riding travels 6x faster
    const speed = isFlying ? (400 * engineMultiplier) : (isRiding ? 120 : 20);

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

    if (isBuildMode && buildHologram) {
        raycaster.setFromCamera(new THREE.Vector2(0,0), camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        let validHit = null;
        for (let pt of intersects) {
            if (pt.object !== buildHologram && pt.object.parent !== placedBasesGroup && !pt.object.userData.isFauna && !pt.object.userData.isTreasure && !pt.object.userData.isDrone) {
                validHit = pt;
                break;
            }
        }
        if (validHit && validHit.distance < 80) {
            buildHologram.visible = true;
            buildHologram.position.copy(validHit.point);
            
            const groundUp = validHit.face ? validHit.face.normal.clone().transformDirection(validHit.object.matrixWorld).normalize() : yawObject.position.clone().sub(center).normalize();
            buildHologram.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), groundUp);
            
            if (buildPartIndex === 0) buildHologram.translateY(5); // Wall
            else if (buildPartIndex === 1) buildHologram.translateY(0.5); // Floor
            else if (buildPartIndex === 3) buildHologram.translateY(4); // Light
            
            if (buildPartIndex === 3 && buildHologram.children.length === 0) {
                const pl = new THREE.PointLight(0xffffaa, 1.5, 100);
                pl.position.set(0, 3, 0);
                buildHologram.add(pl);
            }
        } else {
            buildHologram.visible = false;
        }
    }

    // Planet Proximity UI updates
    const distToSurface = minDist - closestPlanet.radius;
    
    // Dungeon Docking & Escape UI
    if (dungeon) {
        const distToDung = yawObject.position.distanceTo(dungeon.position);
        let promptEl = document.getElementById('nms-planet-info');
        if (!isInsideDungeon && distToDung < 300) {
             if (promptEl) {
                 promptEl.style.display = 'block';
                 promptEl.style.opacity = '1';
                 document.getElementById('nms-planet-name').innerText = 'Derelict Freighter';
                 document.getElementById('nms-planet-resource').innerText = 'Press G to Board';
             }
        } else if (isInsideDungeon) {
            const relPos = yawObject.position.clone().sub(dungeon.position);
            if (relPos.z > 70) { // Near airlock
                if (promptEl) {
                     promptEl.style.display = 'block';
                     promptEl.style.opacity = '1';
                     document.getElementById('nms-planet-name').innerText = 'Freighter Airlock';
                     document.getElementById('nms-planet-resource').innerText = 'Press G to Return to Ship';
                }
            } else {
                if (promptEl) promptEl.style.opacity = '0';
            }
        } else if (!isInsideDungeon && distToDung >= 300 && distToDung < 400) {
             // Only clear if space station isn't active
             if (!spaceStation || yawObject.position.distanceTo(spaceStation.position) >= 300) {
                 if (promptEl) promptEl.style.opacity = '0';
             }
        }
    }

    // Space Station Docking
    if (spaceStation && !isInsideDungeon) {
        spaceStation.rotation.z += 0.1 * dt; // slow spin
        const distToStation = yawObject.position.distanceTo(spaceStation.position);
        
        let promptEl = document.getElementById('nms-planet-info');
        if (distToStation < 300) {
           if (promptEl) {
               promptEl.style.display = 'block';
               promptEl.style.opacity = '1';
               document.getElementById('nms-planet-name').innerText = 'Galactic Trade Station';
               document.getElementById('nms-planet-resource').innerText = 'Press T to Dock & Trade';
           }
        } else if (distToStation >= 300 && distToStation < 350) {
           if (promptEl) promptEl.style.opacity = '0';
        }
    }
    
    if (distToSurface < 600 && hudPlanetInfo && !isTrading && !isInsideDungeon && (!spaceStation || yawObject.position.distanceTo(spaceStation.position) > 350)) {
       hudPlanetInfo.style.display = 'block';
       hudPlanetInfo.style.opacity = '1';
       hudPlanetName.innerText = closestPlanet.name || 'Unknown Planet';
       hudPlanetResource.innerText = `Scans detect: ${closestPlanet.resource || 'Generic Crystals'}`;
       window.currentPlanetResource = closestPlanet.resource;
    } else if (hudPlanetInfo) {
       hudPlanetInfo.style.opacity = '0';
       window.currentPlanetResource = null;
    }

    // Weather & Atmospheric Fog Effects
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
    
    // Day/Night Orbit
    if (sunLight) {
        const time = Date.now() * 0.0001; // slow orbit
        sunLight.position.x = Math.cos(time) * 4000;
        sunLight.position.y = Math.sin(time) * 4000;
        sunLight.position.z = Math.cos(time) * 4000;
    }
    
    // Bioluminescence calculations
    if (closestPlanet.floraMat && sunLight) {
        const upVec = yawObject.position.clone().sub(center).normalize();
        const sunDir = sunLight.position.clone().normalize();
        const dot = upVec.dot(sunDir);
        
        // If dot < -0.1 (sun is completely below horizon by a margin), it's glowing nighttime!
        if (dot < -0.1) {
            closestPlanet.floraMat.emissiveIntensity += 0.5 * dt;
            if (closestPlanet.floraMat.emissiveIntensity > 0.8) closestPlanet.floraMat.emissiveIntensity = 0.8;
        } else {
            closestPlanet.floraMat.emissiveIntensity -= 0.5 * dt;
            if (closestPlanet.floraMat.emissiveIntensity < 0) closestPlanet.floraMat.emissiveIntensity = 0;
        }
    }

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

    if (isInsideDungeon) {
        // Simple internal movement bypasses the sphere physics wrapper
        direction.set(0,0,0);
        if(keys.w) direction.z -= 1;
        if(keys.s) direction.z += 1;
        if(keys.a) direction.x -= 1;
        if(keys.d) direction.x += 1;
        direction.normalize();
        
        const camQuat = new THREE.Quaternion();
        camera.getWorldQuaternion(camQuat);
        // Cancel vertical flight in dungeon
        const euler = new THREE.Euler().setFromQuaternion(camQuat, 'YXZ');
        euler.x = 0; euler.z = 0;
        const flatQuat = new THREE.Quaternion().setFromEuler(euler);
        direction.applyQuaternion(flatQuat);
        
        yawObject.position.add(direction.multiplyScalar(40 * dt));
        
        // Corridor constraints
        const relPos = yawObject.position.clone().sub(dungeon.position);
        let constrain = false;
        if (relPos.x > 9) { relPos.x = 9; constrain = true; }
        if (relPos.x < -9) { relPos.x = -9; constrain = true; }
        if (relPos.y > 9) { relPos.y = 9; constrain = true; }
        if (relPos.y < -9) { relPos.y = -9; constrain = true; }
        if (relPos.z > 85) { relPos.z = 85; constrain = true; }
        if (relPos.z < -85) { relPos.z = -85; constrain = true; }
        if (constrain) yawObject.position.copy(dungeon.position).add(relPos);
        
        // Drone AI combat inside the dungeon
        for (let i = dungeonDrones.length - 1; i >= 0; i--) {
            let droneObj = dungeonDrones[i];
            let drone = droneObj.mesh;
            
            if (!drone.parent) {
                dungeonDrones.splice(i, 1);
                continue;
            }
            
            let droneWP = new THREE.Vector3();
            drone.getWorldPosition(droneWP);
            const distToPlayer = droneWP.distanceTo(yawObject.position);
            
            if (distToPlayer < 50) {
                 const dir = yawObject.position.clone().sub(droneWP).normalize();
                 drone.position.add(dir.multiplyScalar(15 * dt)); 
                 
                 droneObj.nextFire -= dt;
                 if (droneObj.nextFire <= 0 && distToPlayer < 20) {
                     droneObj.nextFire = 1.0;
                     playerHealth -= 10;
                     const hpBar = document.getElementById('nms-health-bar');
                     if(hpBar) hpBar.style.width = playerHealth + '%';
                     document.body.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
                     setTimeout(() => { document.body.style.backgroundColor = "transparent"; }, 200);
                     
                     if (playerHealth <= 0) {
                         const scoreEl = document.getElementById('obj-progress');
                         if (scoreEl) scoreEl.innerText = '[☠️] DIED IN DUNGEON!';
                         yawObject.position.copy(dungeon.position).add(new THREE.Vector3(0,0,80)); // Spawn airlock
                         playerHealth = 100;
                     }
                 }
            }
        }
        
    } else if (isFlying) {
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

       // Recalculate 'up' to account for the horizontal walk offset!
       const newUp = yawObject.position.clone().sub(center).normalize();
       yawObject.position.copy(center).add(newUp.multiplyScalar(targetDist));  

        // Align Local Y perfectly to the planet's normal utilizing pure Quaternions to prevent Euler twisting
        yawObject.quaternion.normalize(); // Force float stabilization
        const currentUp = new THREE.Vector3(0,1,0).applyQuaternion(yawObject.quaternion).normalize();
        const alignQuat = new THREE.Quaternion().setFromUnitVectors(currentUp, newUp);
        yawObject.quaternion.premultiply(alignQuat);
        yawObject.quaternion.normalize(); // Guarantee safe rotational constraints
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
    
    if(debugPos) debugPos.innerText = `Pos: ${yawObject.position.x.toFixed(0)}, ${yawObject.position.y.toFixed(0)}, ${yawObject.position.z.toFixed(0)} | FixedStep: 3 | Keys: ${keys.w ? 'W' : '_'}${keys.s ? 'S' : '_'}${keys.a ? 'A' : '_'}${keys.d ? 'D' : '_'} | z:${direction.z.toFixed(2)}`;
    if(debugMode) {
        if (isFlying) debugMode.innerText = 'Mode: Spaceship \uD83D\uDE80';
        else if (isRiding) debugMode.innerText = 'Mode: Riding Beast \uD83E\uDD9A';
        else debugMode.innerText = 'Mode: Walking \uD83D\uDEB6';
    }
  }

  function animate() {
    nmsLoopId = requestAnimationFrame(animate);
    const now = performance.now();
    let dt = (now - lastTime) / 1000;
    // Cap dt aggressively to prevent massive jumps when tab is in background 
    if (dt > 0.1) dt = 0.016; 
    lastTime = now;
    
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
    const themeAudio = document.getElementById('game-audio');
    if (themeAudio && themeAudio.paused) {
        themeAudio.volume = 0.5;
        themeAudio.play().catch(e => console.warn("Theme autoplay blocked:", e));
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

  document.addEventListener('fullscreenchange', () => {
      const themeAudio = document.getElementById('game-audio');
      if (themeAudio) {
          if (document.fullscreenElement) {
              themeAudio.play().catch(e => console.warn("Audio blocked", e));
          } else {
              themeAudio.pause();
          }
      }
  });

  window.tradeSellScrap = function() {
      if (inventory['Pirate Scrap'] > 0) {
          credits += inventory['Pirate Scrap'] * 50;
          inventory['Pirate Scrap'] = 0;
          updateTradeUI('Sold all Pirate Scrap!');
      } else updateTradeUI('No Pirate Scrap to sell!');
  };
  window.tradeSellMinerals = function() {
      let sold = false;
      for (let key in inventory) {
          if (key !== 'Pirate Scrap' && inventory[key] > 0) {
              credits += inventory[key] * 20;
              inventory[key] = 0;
              sold = true;
          }
      }
      if (sold) updateTradeUI('Sold all Mined Minerals!');
      else updateTradeUI('No Minerals to sell!');
  };
  window.tradeRepairHull = function() {
      if (credits >= 100 && playerHealth < 100) {
          credits -= 100;
          playerHealth = 100;
          const hpBar = document.getElementById('nms-health-bar');
          if(hpBar) hpBar.style.width = '100%';
          updateTradeUI('Hull repaired to MAXIMUM!');
      } else if (playerHealth >= 100) updateTradeUI('Hull is already full!');
      else updateTradeUI('Not enough credits!');
  };
  window.tradeUpgradeEngine = function() {
      if (credits >= 500) {
          credits -= 500;
          engineMultiplier += 0.5;
          updateTradeUI('Engine Boosted! Speed Increased!');
      } else updateTradeUI('Not enough credits!');
  };
  window.tradeDualLasers = function() {
      if (credits >= 2000 && !hasDualLasers) {
          credits -= 2000;
          hasDualLasers = true;
          updateTradeUI('Ship Upgraded: DUAL LASERS INSTALLED!');
      } else if (hasDualLasers) updateTradeUI('Already installed Dual Lasers!');
      else updateTradeUI('Not enough credits!');
  };
  window.tradePaintJob = function() {
      if (credits >= 1000) {
          credits -= 1000;
          const newColor = Math.random() * 0xffffff;
          window.spaceshipGroup.children.forEach(child => {
             if (child.type === "Mesh" && child.geometry.type === "BoxGeometry") {
                 child.material = child.material.clone();
                 child.material.color.setHex(newColor);
             }
          });
          updateTradeUI('Applied fresh procedural Paint Job!');
      } else updateTradeUI('Not enough credits!');
  };
  window.undockStation = function() {
      document.getElementById('nms-trade-overlay').style.display = 'none';
      isTrading = false;
      container.requestPointerLock();
  };
  function updateTradeUI(msg) {
      document.getElementById('trade-credits').innerText = credits + ' ¢';
      document.getElementById('trade-feedback').innerText = msg;
      
      const mineObj = document.getElementById('obj-mine');
      if (mineObj) mineObj.innerText = `[ ] Cargo Empty`;
  }
})();
