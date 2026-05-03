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

  // Cave System (Phase 6)
  let caveEntrances = []; // { mesh, position, planetPos }
  let isInsideCave = false;
  let activeCaveGroup = null;
  let homeCavePos = JSON.parse(localStorage.getItem('nmsWeb_homeCave') || 'null');

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
  let asteroidMesh;
  window.persistedBaseParts = [];
  let isThirdPerson = false;
  let tradeFleets = [];
  let boids = [];
  
  let ownsFreighter = false;
  let capitalFreighter = null;
  let isInsideFreighter = false;

  let wantedLevel = 0;
  let gpfDrones = [];
  let gpfSpawnTimer = 0;

  // Phase 6: Jetpack
  let jetpackFuel = 100;
  let isJetpacking = false;
  let jetpackVelocityY = 0;

  // Phase 6: Pulse Drive
  let pulseFuel = 100;
  let pulseDriveActive = false;

  // Phase 6: Day/Night
  let dayTime = 0; // 0-1 full day cycle

  // Phase 7: Survival & Sentinels
  let hazardProtection = 100;
  let currentHazardType = "None"; // "Toxic", "Heat", "Cold", "None"
  let naniteClusters = 0;
  
  // Phase 8 Buff States
  let speedMultiplier = 1.0;
  let speedBuffTimer = 0;
  let hazardImmunityTimer = 0;
  let resourceHighlightTimer = 0;
  let regenTimer = 0;
  let ironSkinTimer = 0;
  
  // Phase 9: Aquatic States
  let isSubmerged = false;
  let subDivingVelocity = 0;
  let underwaterFogColor = new THREE.Color(0x001133);
  let sentinels = []; // { mesh, state: 'idle'|'scanning'|'attacking', lastFire: 0 }
  let sentinelSpawnTimer = 0;
  let groundWantedLevel = 0;
  let closestPlanet = null;
  
  // Phase 11: Dynamic Storms
  let activeStorm = false;
  let stormTimer = 0;
  let nextStormIn = 45; // Starts soon for testing

  window.saveGameState = function() {
      const state = {
          inventory: inventory,
          credits: credits,
          hasDualLasers: hasDualLasers,
          bases: window.persistedBaseParts,
          lastSaveTime: Date.now()
      };
      localStorage.setItem('nmsWeb_saveState', JSON.stringify(state));
  };
  
  window.loadGameState = function() {
      const raw = localStorage.getItem('nmsWeb_saveState');
      if (raw) {
          try {
              const state = JSON.parse(raw);
              inventory = state.inventory || {};
              credits = state.credits || 0;
              hasDualLasers = !!state.hasDualLasers;
              if (state.bases) {
                  window.persistedBaseParts = state.bases;
                  state.bases.forEach(b => {
                      try {
                          const part = baseParts[b.type];
                          if (!part) return;
                          const newPart = new THREE.Mesh(part.geo, part.mat);
                          if (b.pos) newPart.position.set(b.pos.x, b.pos.y, b.pos.z);
                          if (b.quat) newPart.quaternion.set(b.quat.x, b.quat.y, b.quat.z, b.quat.w);
                          if (b.type === 3) {
                              const pl = new THREE.PointLight(0xffffaa, 1.5, 100);
                              pl.position.set(0, 3, 0);
                              newPart.add(pl);
                          }
                          placedBasesGroup.add(newPart);
                      } catch (err) {
                          console.warn("Skipping corrupted base part:", b, err);
                      }
                  });
                  
                  if (state.lastSaveTime) {
                      const now = Date.now();
                      const deltaSeconds = (now - state.lastSaveTime) / 1000;
                      let extractorCount = 0;
                      state.bases.forEach(b => { if(b.type === 4) extractorCount++; });
                      
                      if (extractorCount > 0 && deltaSeconds > 0) {
                          const extracted = Math.floor(deltaSeconds * extractorCount * 0.1); // 0.1 titanium per second per extractor
                          inventory['Titanium'] = (inventory['Titanium'] || 0) + extracted;
                          console.log(`Passive extractors generated ${extracted} Titanium while away.`);
                      }
                  }
              }
          } catch (e) {
              console.error("Save state corrupted: ", e);
          }
      }
      
      const crObj = document.getElementById('trade-credits');
      if(crObj) crObj.innerText = credits + ' ¢';
  };

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

    // Jetpack exhaust nozzles (hidden until jetpack fires)
    const exhaustGeo = new THREE.ConeGeometry(0.12, 0.6, 6);
    exhaustGeo.rotateX(Math.PI);
    const exhaustMat = new THREE.MeshBasicMaterial({ color: 0xff7700, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
    window.jetpackExhaustL = new THREE.Mesh(exhaustGeo, exhaustMat.clone());
    window.jetpackExhaustR = new THREE.Mesh(exhaustGeo, exhaustMat.clone());
    window.jetpackExhaustL.position.set(-0.4, 0.6, 0.85);
    window.jetpackExhaustR.position.set(0.4, 0.6, 0.85);
    window.astronautGroup.add(window.jetpackExhaustL);
    window.astronautGroup.add(window.jetpackExhaustR);

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
    
    const fireGeo = new THREE.ConeGeometry(2, 6, 8, 1, true);
    fireGeo.rotateX(Math.PI);
    const fireMat = new THREE.MeshBasicMaterial({ 
        color: 0xff4400, 
        transparent: true, 
        opacity: 0, 
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
    });
    window.reentryMesh = new THREE.Mesh(fireGeo, fireMat);
    window.reentryMesh.position.z = -3;
    window.spaceshipGroup.add(window.reentryMesh);

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
        { name: "Sodium Light", geo: new THREE.CylinderGeometry(0.5, 0.5, 8), mat: new THREE.MeshStandardMaterial({color: 0xffffee, emissive: 0xffffaa, emissiveIntensity: 1.0}) },
        { name: "Mineral Extractor", geo: new THREE.CylinderGeometry(2, 3, 5, 8), mat: new THREE.MeshStandardMaterial({color: 0x884400, metalness: 0.8, roughness: 0.2}) },
        { name: "Nutrient Processor", geo: new THREE.CylinderGeometry(1.5, 2, 4, 16), mat: new THREE.MeshStandardMaterial({color: 0x475569, metalness: 0.8}) }
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
    asteroidMesh = new THREE.InstancedMesh(astGeo, astMat, astCount);
    asteroidMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    
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
        asteroidMesh.setMatrixAt(i, dummy.matrix);
        asteroidPositions.push({ pos: pos.clone(), active: true, scale: new THREE.Vector3(sx, sy, sz) });
    }
    scene.add(asteroidMesh);

    // Call loadGameState after base geometries are populated!
    window.loadGameState();
    setInterval(window.saveGameState, 5000); // Autosave periodically 
    
    // Live Mineral Extraction Loop
    setInterval(() => {
        let extCount = 0;
        window.persistedBaseParts.forEach(b => { if(b.type === 4) extCount++; });
        if(extCount > 0) {
            inventory['Titanium'] = (inventory['Titanium'] || 0) + extCount;
            const objEl = document.getElementById('obj-progress');
            if (objEl) objEl.innerText = `[-] Extractors mined ${extCount} Titanium!`;
            const mineObj = document.getElementById('obj-mine');
            if (mineObj) mineObj.innerText = `[ ] Resources: ${inventory['Titanium']}x Titanium`;
        }
    }, 2000);

    spawnSolarSystem();
    const resizeObserver = new ResizeObserver(() => onResize());
    resizeObserver.observe(container);
    window.addEventListener('resize', onResize);

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    
    overlay.addEventListener('click', () => {
      if (!isLocked) {
          container.requestPointerLock();
      }
    });

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('pointerlockchange', () => {
      isLocked = document.pointerLockElement === container;
      if (isLocked) {
        // Force blur any active input so key commands aren't incorrectly blocked
        if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
        }
        overlay.style.display = 'none';
        crosshair.style.display = 'block';
        hud.style.display = 'block';
        if (objectivesPanel) objectivesPanel.style.display = 'block';
      } else {
        // Only show overlay if we aren't in a menu
        if (!isTrading && !document.getElementById('nms-cooking-overlay').style.display.includes('flex')) {
           overlay.style.display = 'flex';
        }
        crosshair.style.display = 'none';
        hud.style.display = 'none';
        if (objectivesPanel) objectivesPanel.style.display = 'none';
      }
    });

    document.addEventListener('mousemove', onMouseMove);
  }

  function createPlanet(x, y, z, radius, seed, colorSet, name, resource) {
    const lod = new THREE.LOD();
    const simplex = new SimplexNoise(seed);
    const biomeSimplex = new SimplexNoise(seed + "_biome2");

    // Determine Hazard Type (Moved up for use in atmosphere/fog)
    let hType = "None";
    let hIntensity = 0;
    if (seed === 'seed_gas' || name.toLowerCase().includes('toxic')) { hType = "Toxic"; hIntensity = 12; }
    else if (seed === 'seed_magma' || name.toLowerCase().includes('lava')) { hType = "Heat"; hIntensity = 15; }
    else if (seed === 'seed_ice' || name.toLowerCase().includes('ice')) { hType = "Cold"; hIntensity = 10; }
    else if (Math.random() < 0.2) { 
        const types = ["Toxic", "Heat", "Cold"];
        hType = types[Math.floor(Math.random()*types.length)];
        hIntensity = 8 + Math.random() * 8;
    }
    
    // Generate Complementary Biome Colors
    const colorSet2 = colorSet.map(hex => {
        const c = new THREE.Color(hex);
        const hsl = { h:0, s:0, l:0 };
        c.getHSL(hsl);
        hsl.h = (hsl.h + 0.3) % 1.0; 
        c.setHSL(hsl.h, hsl.s, hsl.l);
        return c.getHex();
    });
    
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

         if (noiseVal < 0 && seed !== 'seed_blackhole') {
             // Create deep basins matching getTerrainHeight logic
             if (!name?.includes('Deep Ocean')) {
                 noiseVal *= 15; 
             }
         }

         if (seed === 'seed_blackhole') {
            noiseVal = 0;
            colorObj.setHex(0x000000); // Pure absorbing black
         } else {
             let bNoise = biomeSimplex.noise3D(vertex.x * 0.015, vertex.y * 0.015, vertex.z * 0.015);
             let blendWeight = (bNoise + 1) / 2; // 0 to 1
             blendWeight = Math.min(Math.max((blendWeight - 0.4) * 5, 0), 1); // Sharpen transitions
    
             const getSetColor = (set, nVal, rad) => {
                 if (nVal < -10) return 0x000033; // Ultra Deep
                 if (nVal < -2) return 0x001144; // Deep
                 if (nVal <= 0) return set[0];   // Water level
                 if (nVal < 1.5 * (rad/100)) return set[1];
                 if (nVal < 4 * (rad/100)) return set[2];
                 if (nVal < 7 * (rad/100)) return set[3];
                 return set[4];
             };
             const c1 = new THREE.Color(getSetColor(colorSet, noiseVal, radius));
             const c2 = new THREE.Color(getSetColor(colorSet2, noiseVal, radius));
             colorObj.copy(c1).lerp(c2, blendWeight);
         }
         
         vertex.multiplyScalar(radius + noiseVal);
         positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
         colors.push(colorObj.r, colorObj.g, colorObj.b);
      }
      
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.computeVertexNormals();
      material.vertexColors = true;
      
      const mesh = new THREE.Mesh(geometry, material);

      if (seed !== 'seed_blackhole' && seed !== 'seed_ocean' && (!name || !name.includes('Deep Ocean'))) {
          const waterGeo = new THREE.SphereGeometry(radius - 1.0, level.res, level.res);
          const waterMat = new THREE.MeshStandardMaterial({ 
              color: colorSet[0] || 0x1e3a8a, 
              transparent: true, opacity: 0.85, 
              roughness: 0.1, metalness: 0.8 
          });
          const waterMesh = new THREE.Mesh(waterGeo, waterMat);
          mesh.add(waterMesh);
      }

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
            
            resMesh.position.copy(randVec).multiplyScalar(tHeight + 0.5);
            resMesh.lookAt(randVec.clone().multiplyScalar(tHeight + 5));
            mesh.add(resMesh);
         }
         
         // Spawn Procedural Flora
         for(let fl=0; fl<60; fl++) {
             const tree = createFlora(colorSet);
             const randVec = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
             
             let tHeight = radius;
             let noiseV = 0;
             let amp = 8 * (radius/100);
             let freq = 0.05 * (100/radius);
             for(let oct=0; oct<3; oct++) {
                let v = simplex.noise3D(randVec.x * freq, randVec.y * freq, randVec.z * freq);
                v = 1.0 - Math.abs(v);
                noiseV += v * amp;
                freq *= 2.0; amp *= 0.5;
             }
             noiseV -= 5 * (radius/100);
             
             if (noiseV <= 0) { 
                 const flora = createAquaticFlora();
                 flora.position.copy(randVec).multiplyScalar(radius + noiseV * 15); // Use deeper radius
                 flora.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), randVec);
                 mesh.add(flora);
                 continue; 
             }
             
             tHeight += noiseV;
             tree.position.copy(randVec).multiplyScalar(tHeight);
             tree.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), randVec);
             mesh.add(tree);
         }
         
         // Organic Swarming Boids Fauna!
         if (seed !== 'seed_moon' && seed !== 'seed_blackhole' && Math.random() > 0.1) {
             const critGeo = new THREE.ConeGeometry(0.8, 3, 4);
             critGeo.rotateX(Math.PI / 2);
             const critMat = new THREE.MeshStandardMaterial({ color: colorSet[4], metalness: 0.1, roughness: 0.8 });
             const fakePlanetObj = { radius: radius, simplex: simplex, name: name };
             
             for(let f = 0; f < 30; f++) {
                 const cMesh = new THREE.Mesh(critGeo, critMat);
                 const rVec = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
                 const tRad = getTerrainHeight(fakePlanetObj, rVec) + 1.0;
                 cMesh.position.copy(rVec).multiplyScalar(tRad);
                 mesh.add(cMesh); // Child of LOD 0 level
                 
                 boids.push({
                     mesh: cMesh,
                     velocity: new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize().multiplyScalar(5),
                     planetRad: radius,
                     simplex: simplex
                 });
             }
         }
         


         
         // Add glowing lava core just beneath surface if Magma planet
         if (seed === 'seed_magma') {
             const coreGeo = new THREE.SphereGeometry(radius - 0.2, 32, 32);
             const coreMat = new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xff2200, roughness: 0.1 });
             mesh.add(new THREE.Mesh(coreGeo, coreMat));
         }
      }

      lod.addLevel(mesh, level.dist);
    });

    lod.position.set(x, y, z);
    scene.add(lod);

    // Planet Aura / Atmosphere
    let auraColor = colorSet[1];
    if (hType === "Toxic") auraColor = 0x00ff00;
    else if (hType === "Heat") auraColor = 0xff4400;
    else if (hType === "Cold") auraColor = 0x60a5fa;

    const auraGeo = new THREE.SphereGeometry(radius * 1.15, 64, 64);
    const auraMat = new THREE.MeshBasicMaterial({
      color: auraColor, 
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    auraMesh.position.set(x, y, z);
    scene.add(auraMesh);

    // Planetary Rings
    if (seed === 'seed_gas' || seed === 'seed_magma' || seed === 'seed_desert') {
        const ringGeo = new THREE.RingGeometry(radius * 1.5, radius * 2.5, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: colorSet[2], side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(x, y, z);
        ringMesh.rotation.x = Math.PI / 2 + Math.random() * 0.4;
        ringMesh.rotation.y = Math.random() * 0.4;
        scene.add(ringMesh);
    }

    // Add Water Surface Mesh (Phase 9)
    if (seed !== 'seed_moon' && seed !== 'seed_blackhole' && seed !== 'seed_magma') {
        const waterGeo = new THREE.SphereGeometry(radius, 64, 64);
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x0044ff,
            transparent: true,
            opacity: 0.6,
            roughness: 0.1,
            metalness: 0.3
        });
        const waterMesh = new THREE.Mesh(waterGeo, waterMat);
        waterMesh.position.set(x, y, z);
        scene.add(waterMesh);
    }

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

    // Surface Outpost (NPC Settlement)
    const outGroup = new THREE.Group();
    const outPos = new THREE.Vector3(
         (Math.random()-0.5), (Math.random()-0.5), (Math.random()-0.5)
    ).normalize();
    
    // Evaluate procedural height 
    let tHeight = radius;
    let nVal = 0; let nAmp = 8 * (radius/100); let nFreq = 0.05 * (100/radius);
    for(let oct=0; oct<3; oct++) {
       let n = simplex.noise3D(outPos.x * nFreq, outPos.y * nFreq, outPos.z * nFreq);
       nVal += (1.0 - Math.abs(n)) * nAmp;
       nAmp *= 0.5; nFreq *= 2.0;
    }
    nVal -= 5 * (radius/100);
    if(nVal <= 0) nVal = 0;
    tHeight += nVal;
    
    outPos.multiplyScalar(tHeight);
    
    const domeGeo = new THREE.SphereGeometry(6, 16, 16, 0, Math.PI*2, 0, Math.PI/2);
    const domeMat = new THREE.MeshStandardMaterial({color: 0xcccccc, metalness: 0.8, transparent: true, opacity: 0.5});
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.copy(outPos);
    dome.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), outPos.clone().normalize());
    outGroup.add(dome);

    const termGeo = new THREE.BoxGeometry(1.5, 2.5, 1.5);
    const termMat = new THREE.MeshStandardMaterial({color: 0x111111, emissive: 0x00bbff, emissiveIntensity: 0.8});
    const terminal = new THREE.Mesh(termGeo, termMat);
    terminal.position.copy(outPos);
    terminal.quaternion.copy(dome.quaternion);
    terminal.userData.isLoreTerminal = true;
    outGroup.add(terminal);

    outGroup.position.set(x, y, z);
    scene.add(outGroup);

    // Cave Entrance (Phase 6)
    if (seed !== 'seed_ocean' && seed !== 'seed_gas' && seed !== 'seed_blackhole') {
        const cavePos = new THREE.Vector3(
            (Math.random()-0.5), (Math.random()-0.5), (Math.random()-0.5)
        ).normalize();
        
        let cHeight = radius;
        let cVal = 0; let cAmp = 8 * (radius/100); let cFreq = 0.05 * (100/radius);
        for(let oct=0; oct<3; oct++) {
           let n = simplex.noise3D(cavePos.x * cFreq, cavePos.y * cFreq, cavePos.z * cFreq);
           cVal += (1.0 - Math.abs(n)) * cAmp;
           cAmp *= 0.5; cFreq *= 2.0;
        }
        cVal -= 5 * (radius/100);
        if(cVal <= 0) cVal = 0;
        cHeight += cVal;
        
        cavePos.multiplyScalar(cHeight);
        
        const caveGeo = new THREE.TorusGeometry(3, 1.5, 16, 32);
        const caveMat = new THREE.MeshStandardMaterial({color: 0x1a1a1a, emissive: 0x220033, roughness: 1.0});
        const caveMesh = new THREE.Mesh(caveGeo, caveMat);
        caveMesh.position.copy(cavePos);
        caveMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1), cavePos.clone().normalize());
        caveMesh.position.add(cavePos.clone().normalize().multiplyScalar(-1.0)); // Sink it slightly
        
        const cg = new THREE.Group();
        cg.add(caveMesh);
        cg.position.set(x, y, z);
        scene.add(cg);
        
        caveEntrances.push({
            mesh: caveMesh,
            worldPos: new THREE.Vector3(x, y, z).add(cavePos),
            planetPos: new THREE.Vector3(x, y, z)
        });
    }

    planets.push({ 
        mesh: lod, 
        radius, 
        position: new THREE.Vector3(x, y, z), 
        colorSet: colorSet, 
        simplex: new SimplexNoise(seed), 
        faunaGroup: faunaGroup, 
        rideableGroup, 
        name: name, 
        resource: resource, 
        floraMat: primaryLeavesMat,
        hazardType: hType,
        hazardIntensity: hIntensity
    });
  }

  function spawnSolarSystem(offX = 0, offY = 0, offZ = 0) {
     planets.forEach(p => { 
        scene.remove(p.mesh); 
        if(p.faunaGroup) scene.remove(p.faunaGroup); 
        if(p.rideableGroup) scene.remove(p.rideableGroup);
     });
     planets = []; // Required if we reset
     tradeFleets.forEach(f => scene.remove(f.mesh));
     tradeFleets = [];
     boids = [];
     
     // Earth-like (Origin)
     createPlanet(0+offX, 0+offY, 0+offZ, 100, 'seed_earth', [0x1d4ed8, 0x3b82f6, 0x22c55e, 0x78716c, 0xf8fafc], 'Aethelgard IV (Origin World)', 'Iron');
     // Mars-like
     createPlanet(800+offX, 300+offY, -1200+offZ, 150, 'seed_mars', [0x7f1d1d, 0x991b1b, 0xd97706, 0xfcd34d, 0xfef3c7], 'Cygnus Prime (Desert Planet)', 'Platinum');
     // Small Ice planet
     createPlanet(-1000+offX, -500+offY, -500+offZ, 60, 'seed_ice', [0x0284c7, 0x38bdf8, 0xbae6fd, 0xf0f9ff, 0xffffff], 'Vespera Beta (Alien Ice World)', 'Gold');
     // Toxic gas giant
     createPlanet(500+offX, -800+offY, 1500+offZ, 250, 'seed_gas', [0x064e3b, 0x166534, 0x65a30d, 0x84cc16, 0xd9f99d], 'Romulus II (Toxic Gas Giant)', 'Titanium');
     
     // 6 New Planets
     createPlanet(2500+offX, 1000+offY, 500+offZ, 120, 'seed_magma', [0x450a0a, 0x7f1d1d, 0xb91c1c, 0xef4444, 0xfca5a5], 'Tholian Colony (Lava World)', 'Dilithium');
     createPlanet(-2500+offX, 1500+offY, 1000+offZ, 180, 'seed_pink', [0x831843, 0xbe185d, 0xdb2777, 0xf472b6, 0xfbcfe8], 'Qo\'noS Beta (Hostile Pink World)', 'Tritanium');
     createPlanet(0+offX, 2500+offY, -2000+offZ, 200, 'seed_desert', [0x78350f, 0x92400e, 0xb45309, 0xd97706, 0xfcd34d], 'Audet IX (Arid Alien Planet)', 'Uranium');
     createPlanet(-800+offX, -2500+offY, -1500+offZ, 90, 'seed_ocean', [0x1e3a8a, 0x1e40af, 0x1d4ed8, 0x2563eb, 0x3b82f6], 'Sarpeidon VII (Deep Ocean World)', 'Plutonium');
     createPlanet(1800+offX, -2000+offY, -2500+offZ, 140, 'seed_purple', [0x4c1d95, 0x5b21b6, 0x6d28d9, 0x7c3aed, 0xa78bfa], 'Atrea Alpha (Mystic Purple Planet)', 'Silver');
     createPlanet(-400+offX, 500+offY, -300+offZ, 30, 'seed_moon', [0x1c1917, 0x292524, 0x44403c, 0x57534e, 0x78716c], 'Coppelius IV (Desolate Moon)', 'Copper');
     
     // Black Hole
     createPlanet(5000+offX, -5000+offY, 5000+offZ, 300, 'seed_blackhole', [0x000000, 0x000000, 0x000000, 0x000000, 0x000000], 'Gargantua (Warp Singularity)', 'Antimatter');
     
     createSpaceStation(offX, offY, offZ);
     createTradeFleet(offX, offY, offZ);
     createDungeon(-2000+offX, 2000+offY, -2000+offZ);
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

  function createSpaceStation(offX = 0, offY = 0, offZ = 0) {
     const stGeo = new THREE.TorusGeometry(80, 15, 16, 100);
     const stMat = new THREE.MeshStandardMaterial({color: 0x8888aa, metalness: 0.8, roughness: 0.2});
     spaceStation = new THREE.Mesh(stGeo, stMat);
     
     const coreGeo = new THREE.CylinderGeometry(30, 30, 100, 16);
     const coreMat = new THREE.MeshStandardMaterial({color: 0x444455, metalness: 0.9});
     const coreMesh = new THREE.Mesh(coreGeo, coreMat);
     spaceStation.add(coreMesh);
     
     spaceStation.position.set(offX, 400 + offY, offZ); // High orbit above relative origin
     spaceStation.rotation.x = Math.PI / 2;
     scene.add(spaceStation);
  }

  function createCapitalFreighter() {
      capitalFreighter = new THREE.Group();
      
      const hullGeo = new THREE.CylinderGeometry(80, 80, 400, 16);
      hullGeo.rotateX(Math.PI / 2);
      const hullMat = new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.7, metalness: 0.6 });
      const hull = new THREE.Mesh(hullGeo, hullMat);
      capitalFreighter.add(hull);
      
      const bayGeo = new THREE.BoxGeometry(60, 40, 100);
      const bayMat = new THREE.MeshStandardMaterial({ color: 0x111122, side: THREE.BackSide });
      const bay = new THREE.Mesh(bayGeo, bayMat);
      bay.position.set(0, -40, 100); 
      capitalFreighter.add(bay);
      
      scene.add(capitalFreighter);
  }

  function spawnGPFDrone() {
      const droneGrp = new THREE.Group();
      const bodyGeo = new THREE.SphereGeometry(1.5, 8, 8);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x444466, emissive: 0x0000ff, emissiveIntensity: 0.5 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      droneGrp.add(body);
      
      const beamGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 8);
      const beamMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = -1.2;
      droneGrp.add(beam);
      
      // Spawn slightly away from player but nearby
      const dir = new THREE.Vector3(Math.random()-0.5, 0.5, Math.random()-0.5).normalize();
      droneGrp.position.copy(yawObject.position).add(dir.multiplyScalar(150));
      
      droneGrp.userData.isDrone = true; // Targets for Multi-Tool
      scene.add(droneGrp);
      gpfDrones.push({ mesh: droneGrp, health: 50, shootTimer: Math.random() * 2000 });
      
      const scoreEl = document.getElementById('obj-progress');
      if (scoreEl) scoreEl.innerText = '[!] GPF SENTINEL DRONE INBOUND!';
      document.body.style.backgroundColor = "rgba(0, 0, 255, 0.1)";
      setTimeout(() => { document.body.style.backgroundColor = "transparent"; }, 300);
  }

  function createFlora(colorSet) {
      const treeGrp = new THREE.Group();
      const trunkGeo = new THREE.CylinderGeometry(0.3, 0.8, 5, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 2.5;
      treeGrp.add(trunk);
      
      const leafGeo = new THREE.SphereGeometry(2.5, 8, 8);
      const leafMat = new THREE.MeshStandardMaterial({ color: colorSet[2] || 0x228b22 });
      const leaves = new THREE.Mesh(leafGeo, leafMat);
      leaves.position.y = 5.5;
      treeGrp.add(leaves);
      
      treeGrp.userData.isFlora = true;
      return treeGrp;
  }

  function createAquaticFlora() {
      const group = new THREE.Group();
      const type = Math.random() > 0.5 ? 'kelp' : 'coral';
      
      if (type === 'kelp') {
          const stemGeo = new THREE.CylinderGeometry(0.1, 0.2, 8, 8);
          const stemMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27, transparent: true, opacity: 0.8 });
          for(let i=0; i<3; i++) {
              const stem = new THREE.Mesh(stemGeo, stemMat);
              stem.position.set((Math.random()-0.5)*2, 4, (Math.random()-0.5)*2);
              stem.rotation.z = (Math.random()-0.5)*0.5;
              group.add(stem);
          }
      } else {
          const baseGeo = new THREE.SphereGeometry(1, 8, 8);
          const baseMat = new THREE.MeshStandardMaterial({ color: 0xff6b6b });
          const base = new THREE.Mesh(baseGeo, baseMat);
          group.add(base);
          
          const branchGeo = new THREE.CylinderGeometry(0.2, 0.4, 3, 8);
          for(let i=0; i<5; i++) {
              const branch = new THREE.Mesh(branchGeo, baseMat);
              branch.position.y = 1.5;
              branch.rotation.set(Math.random()*2, Math.random()*2, Math.random()*2);
              group.add(branch);
          }
      }
      group.userData.isFlora = true;
      return group;
  }

  // --- Phase 6: Procedural Cave Interiors ---
  function createCaveInterior() {
      const group = new THREE.Group();
      
      const shellGeo = new THREE.SphereGeometry(800, 32, 24);
      const shellMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, side: THREE.BackSide, roughness: 1.0 });
      const shell = new THREE.Mesh(shellGeo, shellMat);
      group.add(shell);
      
      const stalGeo = new THREE.ConeGeometry(16, 120, 6);
      const stalMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
      for(let i=0; i<60; i++) {
          const stal = new THREE.Mesh(stalGeo, stalMat);
          const rVec = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
          stal.position.copy(rVec).multiplyScalar(760);
          stal.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), rVec.negate());
          stal.userData.isStalactite = true; // Phase 8 harvesting
          group.add(stal);
      }
      
      const exitGeo = new THREE.TorusGeometry(20, 3.0, 8, 24);
      const exitMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
      const exit = new THREE.Mesh(exitGeo, exitMat);
      exit.position.set(0, -780, 0);
      exit.rotation.x = Math.PI/2;
      exit.userData.isCaveExit = true;
      group.add(exit);
      
      const light = new THREE.PointLight(0x60a5fa, 2, 400);
      light.position.set(0,0,0);
      group.add(light);
      
      return group;
  }

  function enterCave(entrance) {
      if (isInsideCave) return;
      isInsideCave = true;
      
      inventory['Cave Salts'] = (inventory['Cave Salts'] || 0) + 10;
      inventory['Glowing Moss'] = (inventory['Glowing Moss'] || 0) + 10;
      
      const pocketPos = new THREE.Vector3(100000, 100000, 100000);
      yawObject.position.copy(pocketPos);
      
      activeCaveGroup = createCaveInterior();
      activeCaveGroup.position.copy(pocketPos);
      scene.add(activeCaveGroup);
      
      // Stop flying if was flying (though usually entered on foot)
      if (isFlying) toggleFlightMode();
      
      const objEl = document.getElementById('obj-progress');
      if (objEl) objEl.innerText = "[CAVE] Underworld. Press 'H' to claim as HOME.";
  }

  function exitCave() {
      if (!isInsideCave) return;
      isInsideCave = false;
      
      scene.remove(activeCaveGroup);
      activeCaveGroup = null;
      
      // Return to safety in orbit or near the planet surface
      yawObject.position.set(0, 0, 1500);
      if (!isFlying) toggleFlightMode();
      
      const objEl = document.getElementById('obj-progress');
      if (objEl) objEl.innerText = "[CAVE] Surface reached.";
  }

  window.returnToHomeCave = function() {
      if (homeCavePos) {
          if (!isInsideCave) {
              enterCave(); // This actually spawns the cave interior at pocketPos
              const objEl = document.getElementById('obj-progress');
              if (objEl) objEl.innerText = "[HOME] Welcome back, Traveler.";
          }
      }
  };

  function spawnSentinel(pos) {
      const droneGrp = new THREE.Group();
      
      // Body
      const bodyGeo = new THREE.SphereGeometry(0.8, 12, 12);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      droneGrp.add(body);
      
      // Eye
      const eyeGeo = new THREE.SphereGeometry(0.3, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(0, 0, 0.6);
      droneGrp.add(eye);
      
      // Light
      const eyeLight = new THREE.PointLight(0x00f3ff, 1, 10);
      eyeLight.position.set(0, 0, 0.6);
      droneGrp.add(eyeLight);
      
      droneGrp.position.copy(pos);
      scene.add(droneGrp);
      
      sentinels.push({
          mesh: droneGrp,
          eye: eye,
          light: eyeLight,
          state: 'idle', // 'idle', 'scanning', 'attacking'
          lastFire: 0,
          health: 50,
          targetPos: pos.clone()
      });
  }

  function createTradeFleet(offX = 0, offY = 0, offZ = 0) {
      for (let i = 0; i < 6; i++) {
          const fleetGrp = new THREE.Group();
          const hullGeo = new THREE.CylinderGeometry(5, 5, 40, 8);
          hullGeo.rotateX(Math.PI / 2);
          const hullMat = new THREE.MeshStandardMaterial({ color: 0x55aa55, metalness: 0.8 });
          const hull = new THREE.Mesh(hullGeo, hullMat);
          fleetGrp.add(hull);
          
          const podGeo = new THREE.BoxGeometry(15, 10, 20);
          const podMat = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
          const pod = new THREE.Mesh(podGeo, podMat);
          fleetGrp.add(pod);
          
          fleetGrp.position.set(offX + (Math.random() - 0.5) * 4000, 400 + offY + (Math.random() - 0.5) * 1000, offZ + (Math.random() - 0.5) * 4000);
          const target = new THREE.Vector3(offX + (Math.random() - 0.5) * 10000, offY + (Math.random() - 0.5) * 2000, offZ + (Math.random() - 0.5) * 10000);
          fleetGrp.lookAt(target);
          
          scene.add(fleetGrp);
          tradeFleets.push({ mesh: fleetGrp, speed: 25 + Math.random() * 20 });
      }
  }

  function onMouseDown(e) {
    if (!isLocked) return;
    
    if (isBuildMode && buildHologram && buildHologram.visible) {
        let partCost = 10;
        if (buildPartIndex === 4) partCost = 500; // Mineral Extractor is expensive!
        
        if (credits >= partCost) {
            credits -= partCost;
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
            if (buildPartIndex === 5) { // Nutrient Processor logic
                newPart.userData.isProcessor = true;
                const pl = new THREE.PointLight(0x00ff88, 1, 10);
                pl.position.set(0, 2, 0);
                newPart.add(pl);
            }
            
            placedBasesGroup.add(newPart);
            
            // Persist the array representation and autosave
            window.persistedBaseParts.push({
                type: buildPartIndex,
                pos: { x: newPart.position.x, y: newPart.position.y, z: newPart.position.z },
                quat: { x: newPart.quaternion.x, y: newPart.quaternion.y, z: newPart.quaternion.z, w: newPart.quaternion.w }
            });
            window.saveGameState();
            
            const scoreEl = document.getElementById('obj-progress');
            if (scoreEl) scoreEl.innerText = `[-${partCost} ¢] Constructed Base Element!`;
        } else {
            document.body.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
            setTimeout(() => { document.body.style.backgroundColor = "transparent"; }, 150);
            const scoreEl = document.getElementById('obj-progress');
            if (scoreEl) scoreEl.innerText = `[!] NEED ${partCost} CREDITS TO BUILD!`;
        }
        return; // Prevents normal shooting raycaster code from running
    }
    
    // NPC Surface Outposts Interaction
    if (!isFlying && !isInsideDungeon) {
        raycaster.setFromCamera(new THREE.Vector2(0,0), camera);
        const hits = raycaster.intersectObjects(scene.children, true);
        if (hits.length > 0) {
            for (let point of hits) {
                if (point.object.userData.isLoreTerminal && point.distance < 80) {
                    const msgs = [
                        "The Atlas fell... we are all that remains...",
                        "16 / 16 / 16 / 16 / 16 / 16",
                        "Warning: Sentinels are scanning the sector.",
                        "It said there would be no glass..."
                    ];
                    const msg = msgs[Math.floor(Math.random() * msgs.length)];
                    const objEl = document.getElementById('obj-progress');
                    if(objEl) objEl.innerText = `[LOG] ${msg}`;
                    
                    document.body.style.backgroundColor = "rgba(0, 150, 255, 0.3)";
                    setTimeout(() => { document.body.style.backgroundColor = "transparent"; }, 200);
                    return; // intercept interaction
                }
            }
        }
    }
    
    if (isFlying) {
       // Starship Trading Intercept
       raycaster.setFromCamera(new THREE.Vector2(0,0), camera);
       const fleetHits = raycaster.intersectObjects(tradeFleets.map(f => f.mesh), true);
       if (fleetHits.length > 0 && fleetHits[0].distance < 300) {
           const shipCost = 15000;
           if (credits >= shipCost) {
               credits -= shipCost;
               document.getElementById('trade-credits').innerText = credits + ' ¢';
               
               while(window.spaceshipGroup.children.length > 0) {
                   window.spaceshipGroup.remove(window.spaceshipGroup.children[0]);
               }
               
               let fleetParent = fleetHits[0].object;
               while(fleetParent.parent && fleetParent.parent.type === "Group") {
                   fleetParent = fleetParent.parent;
               }
               
               fleetParent.children.forEach(child => {
                   const clone = child.clone();
                   clone.scale.set(0.1, 0.1, 0.1); 
                   clone.position.multiplyScalar(0.1);
                   window.spaceshipGroup.add(clone);
               });
               
               const glowGeo = new THREE.SphereGeometry(0.4, 8, 8);
               const glowMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
               const glow = new THREE.Mesh(glowGeo, glowMat);
               glow.position.set(0, 0, 2);
               window.spaceshipGroup.add(glow);
               
               const scoreEl = document.getElementById('obj-progress');
               if (scoreEl) scoreEl.innerText = `[-${shipCost} ¢] NEW STARSHIP ACQUIRED!`;
           } else {
               document.body.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
               setTimeout(() => { document.body.style.backgroundColor = "transparent"; }, 150);
               const scoreEl = document.getElementById('obj-progress');
               if (scoreEl) scoreEl.innerText = `[!] NEED ${shipCost} CREDITS FOR THIS SHIP!`;
           }
           return; // intercept interaction
       }

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
           if (pt.object.userData && (pt.object.userData.isResource || pt.object.userData.isFauna || pt.object.userData.isTreasure || pt.object.userData.isDrone || pt.object.userData.isStalactite || pt.object.userData.isFlora || pt.object.userData.isProcessor || pt.object.userData.isBoss)) {
               if (pt.object.userData.isResource) {
                   pt.object.parent.remove(pt.object);
                   minedCrystals++;
                   const scoreEl = document.getElementById('obj-mine');
                   if (scoreEl) {
                      const resName = window.currentPlanetResource || 'Crystal';
                      inventory[resName] = (inventory[resName] || 0) + 1;
                      
                      if(minedCrystals >= 10) scoreEl.innerText = '[x] Mine Crystals: 10/10';
                      else scoreEl.innerText = `[ ] Mined ${resName}: ${inventory[resName]} (Total: ${minedCrystals}/10)`;
                      
                      wantedLevel += 5; // Mining raises GPF suspicion
                      
                      // Phase 7: Alert Ground Sentinels
                      groundWantedLevel = Math.min(5, groundWantedLevel + 1);
                      sentinels.forEach(s => {
                          if (s.mesh.position.distanceTo(yawObject.position) < 150 && s.state === 'idle') {
                              s.state = 'scanning';
                          }
                      });
                   }
               }
               else if (pt.object.userData.isFauna) {
                   pt.object.parent.remove(pt.object);
                   wantedLevel += 15; 
                   groundWantedLevel = 5; 
                   sentinels.forEach(s => s.state = 'attacking');
                   
                   inventory['Raw Meat'] = (inventory['Raw Meat'] || 0) + 1;
                   if (Math.random() < 0.2) inventory['Bone Shards'] = (inventory['Bone Shards'] || 0) + 1;
                   
                   const scoreEl = document.getElementById('obj-progress');
                   if (scoreEl) scoreEl.innerText = '[-] Culled Biological Entity! (+Meat/Bones)';
               }
               else if (pt.object.userData.isFlora) {
                   const tree = pt.object.parent;
                   if (tree) {
                       scene.remove(tree);
                       inventory['Carbon'] = (inventory['Carbon'] || 0) + 5;
                       
                       if (Math.random() < 0.3) inventory['Sweet Berries'] = (inventory['Sweet Berries'] || 0) + 1;
                       if (Math.random() < 0.05) inventory['Wild Yeast'] = (inventory['Wild Yeast'] || 0) + 1;
                       
                       let closestP = planets[0];
                       let minDist = Infinity;
                       planets.forEach(p => {
                           const d = yawObject.position.distanceTo(p.position);
                           if (d < minDist) { minDist = d; closestP = p; }
                       });
                       
                       if (minDist < closestP.radius + 500 && closestP.hazardType) {
                           const ht = closestP.hazardType;
                           if (ht === 'Toxic' && Math.random() < 0.4) inventory['Toxic Fungus'] = (inventory['Toxic Fungus'] || 0) + 1;
                           if (ht === 'Inferno' && Math.random() < 0.4) inventory['Spicy Bulbs'] = (inventory['Spicy Bulbs'] || 0) + 1;
                           if (ht === 'Frozen' && Math.random() < 0.4) inventory['Crystalized Sap'] = (inventory['Crystalized Sap'] || 0) + 1;
                       }
                       
                       const scoreEl = document.getElementById('obj-progress');
                       if (scoreEl) scoreEl.innerText = '[-] HARVESTED FLORA SAMPLES';
                       wantedLevel += 1;
                   }
               }
               else if (pt.object.userData.isStalactite) {
                   pt.object.parent.remove(pt.object);
                   inventory['Cave Salts'] = (inventory['Cave Salts'] || 0) + 2;
                   if (Math.random() < 0.4) inventory['Glowing Moss'] = (inventory['Glowing Moss'] || 0) + 1;
                   const scoreEl = document.getElementById('obj-progress');
                   if (scoreEl) scoreEl.innerText = '[+] Harvested Cave Biologicals!';
               }
               else if (pt.object.userData.isProcessor) {
                   window.openCookingUI();
               }
               else if (pt.object.userData.isTreasure) {
                   pt.object.parent.remove(pt.object);
                   credits += 5000;
                   const scoreEl = document.getElementById('obj-progress');
                   if (scoreEl) scoreEl.innerText = '[$$$] LOOTED FREIGHTER VAULT!';
                   document.getElementById('trade-credits').innerText = credits + ' ¢';
               }
               else if (pt.object.userData.isDrone) {
                    // Find actual drone object in array
                    const droneIdx = gpfDrones.findIndex(d => d.mesh === pt.object || d.mesh.children.includes(pt.object));
                    if (droneIdx !== -1) {
                        gpfDrones[droneIdx].health -= 20;
                        if (gpfDrones[droneIdx].health <= 0) {
                            scene.remove(gpfDrones[droneIdx].mesh);
                            gpfDrones.splice(droneIdx, 1);
                            credits += 500;
                            wantedLevel -= 10; // Killing them reduces local presence but might trigger backup? For now just kill.
                            const scoreEl = document.getElementById('obj-progress');
                            if (scoreEl) scoreEl.innerText = '[-] GPF DRONE NEUTRALIZED!';
                        }
                    } else {
                        // Fallback if not in array but tagged
                        scene.remove(pt.object.parent || pt.object);
                    }
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
    const targetTag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : "";
    if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT' || targetTag === 'BUTTON' || (e.target && e.target.isContentEditable)) return;
    
    // Safety check for activeElement
    const active = document.activeElement;
    const activeTag = active ? active.tagName.toUpperCase() : "";
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT' || (active && active.isContentEditable)) return;

    let code = e.code || "";
    let key = (e.key || "").toLowerCase();
    
    if (code === 'ArrowUp' || code === 'KeyW' || key === 'w') keys.w = true;
    if (code === 'ArrowLeft' || code === 'KeyA' || key === 'a') keys.a = true;
    if (code === 'ArrowDown' || code === 'KeyS' || key === 's') keys.s = true;
    if (code === 'ArrowRight' || code === 'KeyD' || key === 'd') keys.d = true;
    if (code === 'Space' || key === ' ') keys.space = true;
    if (e.shiftKey || code === 'ShiftLeft' || code === 'ShiftRight') keys.shift = true;
    
    switch(code) {
      case 'KeyR':
        if(window.resetNMS) window.resetNMS();
        break;
      case 'KeyB':
        if (!isFlying && !isRiding && !isInsideDungeon) {
            isBuildMode = !isBuildMode;
            updateBuildHologram();
            const progressObj = document.getElementById('obj-progress');
            if (progressObj) {
                if (isBuildMode) progressObj.innerText = `[BUILD] Mode Active! Press 'B' to cancel, 1-4 to switch.`;
                else progressObj.innerText = ``;
            }
        }
        break;
      case 'Digit1': if(isBuildMode) { buildPartIndex = 0; updateBuildHologram(); } else if(!isFlying) window.consumeMeal('Nutrient Paste'); break;
      case 'Digit2': if(isBuildMode) { buildPartIndex = 1; updateBuildHologram(); } else if(!isFlying) window.consumeMeal('Sweet Jam'); break;
      case 'Digit3': if(isBuildMode) { buildPartIndex = 2; updateBuildHologram(); } else if(!isFlying) window.consumeMeal('Hazard Gulp'); break;
      case 'Digit4': if(isBuildMode) { buildPartIndex = 3; updateBuildHologram(); } break;
      case 'Digit5': if(isBuildMode) { buildPartIndex = 4; updateBuildHologram(); } break;
      case 'Digit6': if(isBuildMode) { buildPartIndex = 5; updateBuildHologram(); } break;
      case 'Digit7':
        if (!isFlying) {
            const lightObj = new THREE.Group();
            const geo = new THREE.CylinderGeometry(0.2, 0.2, 2);
            const mat = new THREE.MeshStandardMaterial({color: 0xffffee, emissive: 0xffffaa, emissiveIntensity: 1.0});
            const mesh = new THREE.Mesh(geo, mat);
            const pl = new THREE.PointLight(0xffffaa, 1.5, 100);
            pl.position.set(0, 1, 0);
            lightObj.add(mesh);
            lightObj.add(pl);
            lightObj.position.copy(yawObject.position);
            lightObj.quaternion.copy(yawObject.quaternion);
            scene.add(lightObj);
            const scoreEl = document.getElementById('obj-progress');
            if (scoreEl) scoreEl.innerText = "[+] Dropped a Light Flare!";
        }
        break;
      case 'KeyH':
        if (isFlying) {
           if (!ownsFreighter) {
               if (credits >= 50000) {
                   credits -= 50000;
                   document.getElementById('trade-credits').innerText = credits + ' ¢';
                   ownsFreighter = true;
                   
                   const scoreEl = document.getElementById('obj-progress');
                   if (scoreEl) scoreEl.innerText = "[-50000 ¢] CAPITAL FREIGHTER PURCHASED!";
               } else {
                   document.body.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
                   setTimeout(() => { document.body.style.backgroundColor = "transparent"; }, 150);
                   const scoreEl = document.getElementById('obj-progress');
                   if (scoreEl) scoreEl.innerText = "[!] 50000 CREDITS REQUIRED FOR FREIGHTER!";
                   break;
               }
           }
           
           if (ownsFreighter) {
               if (!capitalFreighter) {
                   createCapitalFreighter();
               }
               
               const dir = new THREE.Vector3();
               camera.getWorldDirection(dir);
               const spawnPos = yawObject.position.clone().add(dir.multiplyScalar(400)); 
               
               capitalFreighter.position.copy(spawnPos);
               capitalFreighter.lookAt(yawObject.position);
               
               const scoreEl = document.getElementById('obj-progress');
               if (scoreEl) scoreEl.innerText = "[+] CAPITAL FREIGHTER HAS ARRIVED IN SYSTEM.";
           }
        }
        break;
      case 'KeyG':
        if (dungeon && !isInsideDungeon && yawObject.position.distanceTo(dungeon.position) < 300 && isFlying) {
            isFlying = false;
            isRiding = false;
            isInsideDungeon = true;
            window.spaceshipGroup.visible = false;
            window.astronautGroup.visible = true;
            
            yawObject.quaternion.identity();
            yawObject.position.copy(dungeon.position).add(new THREE.Vector3(0, 0, 80));
            camera.rotation.x = 0;
            yawObject.rotation.y = Math.PI; // Face inward (-Z)
        } else if (capitalFreighter && !isInsideFreighter && yawObject.position.distanceTo(capitalFreighter.position) < 300 && isFlying) {
            isFlying = false;
            isRiding = false;
            isInsideFreighter = true;
            window.spaceshipGroup.visible = false;
            window.astronautGroup.visible = true;
            
            yawObject.quaternion.identity();
            const entrance = new THREE.Vector3(0, -40, 100);
            entrance.applyQuaternion(capitalFreighter.quaternion); 
            yawObject.position.copy(capitalFreighter.position).add(entrance);
            camera.rotation.x = 0;
            yawObject.rotation.y = capitalFreighter.rotation.y + Math.PI; 
            
            const scoreEl = document.getElementById('obj-progress');
            if (scoreEl) scoreEl.innerText = "[+] BOARDED CAPITAL FREIGHTER. FEEL FREE TO BUILD!";
        } else if (dungeon && isInsideDungeon) {
            const relPos = yawObject.position.clone().sub(dungeon.position);
            if (relPos.z > 70) { // Near the airlock
                isInsideDungeon = false;
                isFlying = true;
                window.spaceshipGroup.visible = true;
                window.astronautGroup.visible = false;
                
                yawObject.position.copy(dungeon.position).add(new THREE.Vector3(0, 0, 150));
                yawObject.rotation.y = 0;
            }
        } else if (capitalFreighter && isInsideFreighter) {
            const localPos = yawObject.position.clone().sub(capitalFreighter.position);
            localPos.applyQuaternion(capitalFreighter.quaternion.clone().invert());
            if (localPos.z > 95) {
                isInsideFreighter = false;
                isFlying = true;
                window.spaceshipGroup.visible = true;
                window.astronautGroup.visible = false;
                
                const exitVec = new THREE.Vector3(0, -100, 200).applyQuaternion(capitalFreighter.quaternion);
                yawObject.position.copy(capitalFreighter.position).add(exitVec);
                yawObject.quaternion.copy(capitalFreighter.quaternion);
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
      case 'KeyX':
        // Quick Recharge Shortcut
        if (!isFlying && !isInsideCave) {
            if (inventory['Carbon'] >= 20) {
                inventory['Carbon'] -= 20;
                hazardProtection = Math.min(100, hazardProtection + 50);
                const scoreEl = document.getElementById('obj-progress');
                if (scoreEl) scoreEl.innerText = "[+] Hazard Protection Recharged! (Used 20 Carbon)";
                document.body.style.backgroundColor = "rgba(251, 191, 36, 0.2)";
                setTimeout(() => { document.body.style.backgroundColor = "transparent"; }, 200);
            } else {
                const scoreEl = document.getElementById('obj-progress');
                if (scoreEl) scoreEl.innerText = "[!] NOT ENOUGH CARBON TO RECHARGE.";
            }
        }
        break;
      case 'KeyV':
        isThirdPerson = !isThirdPerson;
        break;
      case 'KeyF': 
        if (isRidingSub) toggleSubmarineMode();
        else toggleFlightMode();
        break;
      case 'KeyE':
        // Cave Interaction
        if (isInsideCave) {
            const distToExit = yawObject.position.distanceTo(activeCaveGroup.position.clone().add(new THREE.Vector3(0, -780, 0)));
            if (distToExit < 40) {
                exitCave();
                return;
            }
        } else {
            // Check for nearby cave entrance
            for (const entrance of caveEntrances) {
                if (yawObject.position.distanceTo(entrance.worldPos) < 15) {
                    enterCave(entrance);
                    return;
                }
            }
        }
        if (submarineMesh && yawObject.position.distanceTo(submarineMesh.position) < 15) {
            toggleSubmarineMode();
        } else {
            toggleRidingMode();
        }
        break;
      case 'KeyQ':
        if (!isFlying && !isRiding && !isRidingSub) window.summonSubmarine();
        break;
      case 'KeyU':
        if (!isFlying && !isInsideCave && closestPlanet) {
            const cavePos = yawObject.position.clone();
            const caveGeo = new THREE.TorusGeometry(3, 1.5, 16, 32);
            const caveMat = new THREE.MeshStandardMaterial({color: 0x1a1a1a, emissive: 0x220033, roughness: 1.0});
            const caveMesh = new THREE.Mesh(caveGeo, caveMat);
            
            const upVec = cavePos.clone().sub(closestPlanet.position).normalize();
            caveMesh.position.copy(cavePos);
            caveMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1), upVec);
            caveMesh.position.add(upVec.multiplyScalar(-1.0)); // Sink it slightly
            
            scene.add(caveMesh);
            
            caveEntrances.push({
                mesh: caveMesh,
                worldPos: cavePos.clone(),
                planetPos: closestPlanet.position.clone()
            });
            
            const scoreEl = document.getElementById('obj-progress');
            if (scoreEl) scoreEl.innerText = "[+] CAVE ENTRANCE SUMMONED! Press 'E' to enter.";
        }
        break;
      case 'KeyC':
        // --- Phase 10: Discovery Scanner ---
        if (!isFlying && !isInsideCave) {
            let newlyScanned = 0;
            let scanReward = 0;
            
            // Perform a spherical scan around player
            const scanRadius = 150;
            
            // Define a recursive function to check all children in scene
            scene.traverse((obj) => {
                if (obj.userData && !obj.userData.scanned) {
                    if (obj.userData.isFlora || obj.userData.isFauna || obj.userData.isResource || obj.userData.isStalactite) {
                        const dist = yawObject.position.distanceTo(obj.getWorldPosition(new THREE.Vector3()));
                        if (dist < scanRadius) {
                            obj.userData.scanned = true;
                            newlyScanned++;
                            
                            // Visual feedback - brief flash
                            if (obj.material) {
                                const origEmissive = obj.material.emissive ? obj.material.emissive.clone() : new THREE.Color(0x000000);
                                const origIntensity = obj.material.emissiveIntensity || 0;
                                obj.material.emissive = new THREE.Color(0x00ffff);
                                obj.material.emissiveIntensity = 1.0;
                                setTimeout(() => {
                                    if (obj.material) {
                                        obj.material.emissive = origEmissive;
                                        obj.material.emissiveIntensity = origIntensity;
                                    }
                                }, 500);
                            } else if (obj.children) {
                                obj.children.forEach(child => {
                                    if (child.material) {
                                        const origEmissive = child.material.emissive ? child.material.emissive.clone() : new THREE.Color(0x000000);
                                        const origIntensity = child.material.emissiveIntensity || 0;
                                        child.material.emissive = new THREE.Color(0x00ffff);
                                        child.material.emissiveIntensity = 1.0;
                                        setTimeout(() => {
                                            if (child.material) {
                                                child.material.emissive = origEmissive;
                                                child.material.emissiveIntensity = origIntensity;
                                            }
                                        }, 500);
                                    }
                                });
                            }
                        }
                    }
                }
            });
            
            const objEl = document.getElementById('obj-progress');
            if (newlyScanned > 0) {
                scanReward = newlyScanned * 15;
                credits += scanReward;
                const crObj = document.getElementById('trade-credits');
                if(crObj) crObj.innerText = credits + ' ¢';
                
                if (objEl) objEl.innerText = `[SCAN] Discovered ${newlyScanned} new lifeforms/minerals! +${scanReward} ¢`;
                
                // Scanner pulse visual effect
                const pulseGeo = new THREE.SphereGeometry(scanRadius, 32, 32);
                const pulseMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5, wireframe: true });
                const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
                pulseMesh.position.copy(yawObject.position);
                scene.add(pulseMesh);
                
                let scale = 0.1;
                const pulseAnim = setInterval(() => {
                    scale += 0.1;
                    pulseMesh.scale.set(scale, scale, scale);
                    pulseMat.opacity -= 0.05;
                    if (scale >= 1.0) {
                        clearInterval(pulseAnim);
                        scene.remove(pulseMesh);
                    }
                }, 30);
            } else {
                if (objEl) objEl.innerText = `[SCAN] No new discoveries nearby.`;
            }
        }
        break;
      case 'KeyH':
        if (isInsideCave) {
            homeCavePos = yawObject.position.clone();
            localStorage.setItem('nmsWeb_homeCave', JSON.stringify(homeCavePos));
            const objEl = document.getElementById('obj-progress');
            if (objEl) objEl.innerText = "[HOME] CAVE SET AS HOME BASE. Fast travel active.";
            const homeBtn = document.getElementById('nms-home-return');
            if (homeBtn) homeBtn.style.display = 'block';
            return;
        }
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
            closestPlanet = planets[0];
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
    const targetTag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : "";
    if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT' || (e.target && e.target.isContentEditable)) return;
    let code = e.code || "";
    let key = (e.key || "").toLowerCase();
    
    if (code === 'ArrowUp' || code === 'KeyW' || key === 'w') keys.w = false;
    if (code === 'ArrowLeft' || code === 'KeyA' || key === 'a') keys.a = false;
    if (code === 'ArrowDown' || code === 'KeyS' || key === 's') keys.s = false;
    if (code === 'ArrowRight' || code === 'KeyD' || key === 'd') keys.d = false;
    if (code === 'Space' || key === ' ') keys.space = false;
    if (code === 'ShiftLeft' || code === 'ShiftRight') keys.shift = false;
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
    closestPlanet = planets[0];
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
     const isOceanWorld = (planet.name && planet.name.includes('Deep Ocean')) || (planet.simplex && planet.simplex.seed === 'seed_ocean');
     noiseVal -= 5 * (planet.radius / 100); // Base sea level offset

     if (noiseVal < 0 && !isOceanWorld) {
        // Create very very deep lakes
        noiseVal *= 15; 
     }
     
     // Only ocean world and black hole should be strictly flat at water level
     if (noiseVal <= 0 && (isOceanWorld || (planet.name && planet.name.includes('Singularity')))) noiseVal = 0; 
     
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

  let globalOffsetX = 0;
  let globalOffsetY = 0;
  let globalOffsetZ = 0;
  let isWarping = false;

  function warpToNewGalaxy() {
      if (isWarping) return;
      isWarping = true;
      document.body.style.backgroundColor = "white";
      const scoreEl = document.getElementById('obj-progress');
      if (scoreEl) scoreEl.innerText = "[WARP] ANOMALY DETECTED! INITIATING GALAXY JUMP...";
      
      setTimeout(() => { 
          document.body.style.backgroundColor = "transparent"; 
          
          globalOffsetX += (Math.random() - 0.5) * 50000;
          globalOffsetY += (Math.random() - 0.5) * 50000;
          globalOffsetZ += (Math.random() - 0.5) * 50000;
          
          // Move Player
          yawObject.position.set(globalOffsetX, 102 + globalOffsetY, globalOffsetZ);
          
          spawnSolarSystem(globalOffsetX, globalOffsetY, globalOffsetZ);
          
          if (scoreEl) scoreEl.innerText = "ARRIVED IN UNCHARTED SPACE (NEW SEED)";
          setTimeout(() => { isWarping = false; }, 2000);
      }, 1500);
  }

  function innerUpdatePhysics(dt) {
    if(!camera || !renderer || !planets.length || !isLocked) return;
    
    // Ensure we have a valid closest planet and center at the start of the frame
    window.closestIdx = 0;
    window.minDist = Infinity;
    for (let i = 0; i < planets.length; i++) {
        const d = yawObject.position.distanceTo(planets[i].position);
        if (d < window.minDist) { window.minDist = d; window.closestIdx = i; }
    }
    closestPlanet = planets[window.closestIdx];
    const center = closestPlanet.position.clone();
    
    // Alias for local scope compatibility
    let closestIdx = window.closestIdx;
    let minDist = window.minDist;
    
    // Boid Flocking / Roaming Fauna
    boids.forEach(b => {
        let wander = new THREE.Vector3((Math.random()-0.5)*2, (Math.random()-0.5)*2, (Math.random()-0.5)*2);
        b.velocity.add(wander).normalize().multiplyScalar(2); // Movement speed
        
        b.mesh.position.add(b.velocity.clone().multiplyScalar(dt));
        
        // Snap strictly to procedural terrain altitude
        const upVec = b.mesh.position.clone().normalize();
        const targetRad = getTerrainHeight({radius: b.planetRad, simplex: b.simplex}, upVec) + 0.8;
        
        b.mesh.position.copy(upVec.multiplyScalar(targetRad));
        
        // Orient creature to face its own velocity projected on surface normal
        const lookTarget = b.mesh.position.clone().add(b.velocity.clone().projectOnPlane(upVec));
        b.mesh.up.copy(upVec);
        b.mesh.lookAt(lookTarget);
    });
    
    // --- Phase 8: Buff Timers ---
    if (speedBuffTimer > 0) {
        speedBuffTimer -= dt * 1000;
        speedMultiplier = 1.5;
        if (speedBuffTimer <= 0) speedMultiplier = 1.0;
    }
    if (hazardImmunityTimer > 0) hazardImmunityTimer -= dt * 1000;
    if (resourceHighlightTimer > 0) {
        resourceHighlightTimer -= dt * 1000;
    }
    if (regenTimer > 0) {
        regenTimer -= dt * 1000;
        playerHealth = Math.min(100, playerHealth + 5 * dt);
        const hpBar = document.getElementById('nms-health-bar');
        if (hpBar) hpBar.style.width = playerHealth + '%';
    }
    if (ironSkinTimer > 0) ironSkinTimer -= dt * 1000;
    // ----------------------------
    
    // Check Warp Core Anomaly (Black Hole) distance
    if (isFlying && !isWarping) {
        const bh = planets.find(p => p.simplex.seed === 'seed_blackhole');
        if (bh && yawObject.position.distanceTo(bh.position) < bh.radius * 2.0) {
            warpToNewGalaxy();
        }
        
        // Update Trade Fleets
        tradeFleets.forEach(fleet => {
            const dir = new THREE.Vector3();
            fleet.mesh.getWorldDirection(dir);
            fleet.mesh.position.add(dir.multiplyScalar(fleet.speed * dt));
            if (Math.random() < 0.05) {
                fleet.mesh.rotateY((Math.random() - 0.5) * 0.05);
            }
        });
    }
    
    // Natural Pirate Spawns in Space
    if (isFlying && Math.random() < 0.002) {
        if (pirates.length < 3) {
            spawnPirate();
        }
    }
    
    // --- GPF (Galactic Police Force) Logic ---
    if (wantedLevel > 0) wantedLevel -= 0.05 * dt; // Slow decay
    if (wantedLevel < 0) wantedLevel = 0;
    
    if (wantedLevel > 50) {
        gpfSpawnTimer -= dt * 1000;
        if (gpfSpawnTimer <= 0 && gpfDrones.length < (wantedLevel / 50)) {
            spawnGPFDrone();
            gpfSpawnTimer = 5000; // 5 seconds between spawns
        }
    }
    
    // Show/hide bribe button based on active drones
    const bribeBtn = document.getElementById('nms-gpf-bribe');
    if (bribeBtn) bribeBtn.style.display = gpfDrones.length > 0 ? 'block' : 'none';

    for (let i = gpfDrones.length - 1; i >= 0; i--) {

        const d = gpfDrones[i];
        
        // Follow Player
        const distToPlayer = d.mesh.position.distanceTo(yawObject.position);
        const targetPos = yawObject.position.clone();
        if (distToPlayer > 30) {
            const moveDir = targetPos.sub(d.mesh.position).normalize();
            d.mesh.position.add(moveDir.multiplyScalar(40 * dt));
        }
        d.mesh.lookAt(yawObject.position);
        
        // Shoot Player
        if (!isWarping) {
            d.shootTimer -= dt * 1000;
            if (d.shootTimer <= 0 && distToPlayer < 200) {
                // Fire Red Laser
                const lDir = yawObject.position.clone().sub(d.mesh.position).normalize();
                const lGeo = new THREE.CylinderGeometry(0.1, 0.1, 5, 8);
                lGeo.rotateX(Math.PI/2);
                const lMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                const lMesh = new THREE.Mesh(lGeo, lMat);
                lMesh.position.copy(d.mesh.position);
                lMesh.lookAt(yawObject.position);
                scene.add(lMesh);
                lasers.push({ mesh: lMesh, dir: lDir, life: 60 });
                d.shootTimer = 2000 + Math.random() * 2000;
                
                // Damage Player (Iron Skin check)
                if (distToPlayer < 50 && ironSkinTimer <= 0) {
                   playerHealth -= 2; // GPF is dangerous!
                   const hpBar = document.getElementById('nms-health-bar');
                   if(hpBar) hpBar.style.width = Math.max(0, playerHealth) + '%';
                }
            }
        }
    }
    // -----------------------------------------

    
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

        // Damage the player (Iron Skin check)
        if (wormDist < 25 && ironSkinTimer <= 0) {
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
            if (!asteroidPositions[i].active) continue;
            if (yawObject.position.distanceToSquared(asteroidPositions[i].pos) < 324) { // 18*18
                const bounceDir = yawObject.position.clone().sub(asteroidPositions[i].pos).normalize();
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
            if (ironSkinTimer <= 0) playerHealth -= 5;
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
            if (p.position.distanceToSquared(lasers[j].mesh.position) < 625) { // 25*25
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
    
    // Check hits for Asteroid Mining
    if (lasers.length > 0 && asteroidPositions.length > 0 && asteroidMesh) {
        const dummyMatrix = new THREE.Matrix4();
        for (let j = lasers.length - 1; j >= 0; j--) {
            let laserHit = false;
            for (let i = 0; i < asteroidPositions.length; i++) {
                if (!asteroidPositions[i].active) continue;
                
                const distSq = lasers[j].mesh.position.distanceToSquared(asteroidPositions[i].pos);
                if (distSq < 400) { // roughly 20 unit hit radius
                    laserHit = true;
                    asteroidPositions[i].active = false;
                    
                    // Shrink matrix to zero to "destroy" fragment
                    dummyMatrix.makeScale(0, 0, 0);
                    asteroidMesh.setMatrixAt(i, dummyMatrix);
                    asteroidMesh.instanceMatrix.needsUpdate = true;
                    
                    inventory['Titanium'] = (inventory['Titanium'] || 0) + 3;
                    const objEl = document.getElementById('obj-progress');
                    if (objEl) objEl.innerText = '[-] Escaped Asteroid Mined! (+3 Titanium)';
                    const mineObj = document.getElementById('obj-mine');
                    if (mineObj) mineObj.innerText = `[ ] Resources: ${inventory['Titanium']}x Titanium`;
                    
                    break;
                }
            }
            if (laserHit) {
                scene.remove(lasers[j].mesh);
                lasers.splice(j, 1);
            }
        }
    }
    
    // Check hits for GPF Drones
    if (lasers.length > 0 && gpfDrones.length > 0) {
        for (let j = lasers.length - 1; j >= 0; j--) {
            let laserHit = false;
            for (let i = gpfDrones.length - 1; i >= 0; i--) {
                const drone = gpfDrones[i];
                const distSq = lasers[j].mesh.position.distanceToSquared(drone.mesh.position);
                if (distSq < 150) { // hit radius
                    laserHit = true;
                    drone.health -= 25;
                    if (drone.health <= 0) {
                        scene.remove(drone.mesh);
                        gpfDrones.splice(i, 1);
                        credits += 500;
                        wantedLevel -= 5;
                        const scoreEl = document.getElementById('obj-progress');
                        if (scoreEl) scoreEl.innerText = '[-] GPF DRONE NEUTRALIZED!';
                    }
                    break;
                }
            }
            if (laserHit) {
                scene.remove(lasers[j].mesh);
                lasers.splice(j, 1);
            }
        }
    }

    const direction = new THREE.Vector3(0,0,0);
    if(keys.w) direction.z -= 1;
    if(keys.s) direction.z += 1;
    if(keys.a) direction.x -= 1;
    if(keys.d) direction.x += 1;
    direction.normalize();
    direction.normalize();

    // --- Phase 6: Jetpack ---
    if (!isFlying && !isRiding) {
        if (keys.space && jetpackFuel > 0) {
            isJetpacking = true;
            jetpackVelocityY += 80 * dt;
            jetpackFuel = Math.max(0, jetpackFuel - 35 * dt);
        } else {
            isJetpacking = false;
            jetpackVelocityY = Math.max(0, jetpackVelocityY - 60 * dt); // gravity drain
        }
        if (!keys.space) {
            jetpackFuel = Math.min(100, jetpackFuel + 20 * dt); // recharge on ground
        }
        yawObject.position.y += jetpackVelocityY * dt;

        // Exhaust VFX
        const exOpacity = isJetpacking ? (0.6 + Math.sin(Date.now() * 0.05) * 0.3) : 0;
        if (window.jetpackExhaustL) window.jetpackExhaustL.material.opacity = exOpacity;
        if (window.jetpackExhaustR) window.jetpackExhaustR.material.opacity = exOpacity;

        // Update HUD fuel bar
        const jBar = document.getElementById('nms-jetpack-bar');
        if (jBar) jBar.style.width = jetpackFuel + '%';
    }

    // --- Phase 6: Pulse Drive ---
    if (isFlying) {
        pulseDriveActive = keys.shift && pulseFuel > 0;
        if (pulseDriveActive) {
            pulseFuel = Math.max(0, pulseFuel - 25 * dt);
        } else {
            pulseFuel = Math.min(100, pulseFuel + 10 * dt);
        }
        // Cyan tint on re-entry mesh during pulse
        if (window.reentryMesh) {
            if (pulseDriveActive) window.reentryMesh.material.color.set(0x00ffff);
            else window.reentryMesh.material.color.set(0xff4400);
        }
        const pBar = document.getElementById('nms-pulse-bar');
        if (pBar) pBar.style.width = pulseFuel + '%';
    }

    // --- Phase 6: Day/Night Cycle ---
    dayTime = (dayTime + dt * 0.008) % 1.0;
    if (sunLight) {
        const angle = dayTime * Math.PI * 2;
        sunLight.position.set(Math.cos(angle) * 5000, Math.sin(angle) * 5000, 2000);
        sunLight.intensity = Math.max(0.1, Math.sin(angle));
    }
    if (scene.background instanceof THREE.Color) {
        const nightBlend = 1.0 - Math.max(0, Math.sin(dayTime * Math.PI * 2));
        scene.background.setRGB(nightBlend * 0.03, nightBlend * 0.03, nightBlend * 0.07 + 0.01);
    }

    // Flight mode travels 10x faster, Riding travels 6x faster
    const pulseMultiplier = (isFlying && pulseDriveActive) ? 4 : 1;
    const speed = isFlying ? (400 * engineMultiplier * pulseMultiplier) : (isRiding ? 120 : 20 * speedMultiplier);



    // --- Phase 7: Hazard Drain Logic ---
    const hBarCont = document.getElementById('nms-hazard-container');
    const hBar = document.getElementById('nms-hazard-bar');
    const hStatus = document.getElementById('nms-hazard-status');
    
    if (minDist < (closestPlanet.radius + 20) && !isFlying && closestPlanet.hazardType !== "None") {
        currentHazardType = closestPlanet.hazardType;
        if (hBarCont) hBarCont.style.display = 'block';
        if (hStatus) {
            hStatus.style.display = 'block';
            hStatus.innerText = `Hazard detected: ${currentHazardType}`;
        }
        
        // Drain protection (Phase 8: Hazard Immunity check, Phase 11: Storm modifier)
        if (hazardImmunityTimer <= 0) {
            hazardProtection = Math.max(0, hazardProtection - closestPlanet.hazardIntensity * dt * 0.1 * (activeStorm ? 5.0 : 1.0));
        }
        if (hBar) hBar.style.width = hazardProtection + '%';
        
        // If protection is 0, drain health
        if (hazardProtection <= 0) {
            playerHealth = Math.max(0, playerHealth - 4 * dt);
            const healthBar = document.getElementById('nms-health-bar');
            if (healthBar) healthBar.style.width = playerHealth + '%';
            if (Math.random() < 0.05) {
                const scoreEl = document.getElementById('obj-progress');
                if (scoreEl) scoreEl.innerText = "[!] EXOSUIT PROTECTION DEPLETED. Critical damage!";
            }
        }
    } else {
        if (hBarCont) hBarCont.style.display = 'none';
        if (hStatus) hStatus.style.display = 'none';
        // Slowly recharge hazard protection when in ship or on safe world
        hazardProtection = Math.min(100, hazardProtection + 5 * dt);
        if (hBar) hBar.style.width = hazardProtection + '%';
    }
    
    // Atmospheric Re-entry Logic
    if (isFlying && window.reentryMesh) {
       const distToSurface = minDist - closestPlanet.radius;
       if (distToSurface < 100 && distToSurface > 0) {
           const intensity = Math.max(0, 1.0 - (distToSurface / 100));
           window.reentryMesh.material.opacity = intensity * (0.4 + Math.sin(Date.now() * 0.02) * 0.2);
           window.reentryMesh.scale.set(1 + intensity, 1 + intensity, 1);
       } else {
           window.reentryMesh.material.opacity = 0;
       }
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
    // --- Phase 9: Aquatic System (Submarine & Submerged Survival) ---
    isSubmerged = (minDist < closestPlanet.radius);
    
    if (isSubmerged) {
        if (scene.fog) {
            scene.fog.color.set(0x002244);
            scene.fog.density = 0.08;
            scene.background = scene.fog.color;
        }
        
        // Hazard Bar as Oxygen Bar
        if (!isRidingSub && !isFlying) {
            hazardProtection = Math.max(0, hazardProtection - 5 * dt);
            const hBar = document.getElementById('nms-hazard-bar');
            if (hBar) hBar.style.width = hazardProtection + '%';
            
            const hStatus = document.getElementById('nms-hazard-status');
            if (hStatus) {
                hStatus.style.display = 'block';
                hStatus.innerText = "CRITICAL: OXYGEN DEPLETING";
                hStatus.style.color = "#ff4444";
            }
        }
    } else {
        // Restore standard fog
        if (scene.fog) {
            scene.fog.color.set(0x050510);
            scene.fog.density = 0;
            scene.background = scene.fog.color;
        }
        
        // Oxygen Recharge at surface or in sub
        if (isRidingSub || !isSubmerged) {
            hazardProtection = Math.min(100, hazardProtection + 10 * dt);
            const hStatus = document.getElementById('nms-hazard-status');
            if (hStatus && !isSubmerged) hStatus.style.display = 'none';
        }
    }

    if (isRidingSub && submarineMesh) {
        // Submarine Vertical Control
        if (keys.space) subDivingVelocity = 40;
        else if (keys.shift) subDivingVelocity = -40;
        else subDivingVelocity = 0;
        
        const upVec = submarineMesh.position.clone().sub(closestPlanet.position).normalize();
        submarineMesh.position.add(upVec.clone().multiplyScalar(subDivingVelocity * dt));
        
        // Snap Horizontal movement
        const subDir = new THREE.Vector3();
        submarineMesh.getWorldDirection(subDir);
        if (keys.w) submarineMesh.position.add(subDir.clone().multiplyScalar(80 * dt));
        if (keys.s) submarineMesh.position.add(subDir.clone().multiplyScalar(-80 * dt));
        if (keys.a) submarineMesh.rotateOnAxis(new THREE.Vector3(0,1,0), 2 * dt);
        if (keys.d) submarineMesh.rotateOnAxis(new THREE.Vector3(0,1,0), -2 * dt);
        
        // Terrain & Surface Clipping
        const currentRadius = submarineMesh.position.distanceTo(closestPlanet.position);
        const terrH = getTerrainHeight(closestPlanet, upVec);
        
        if (currentRadius > closestPlanet.radius) {
            submarineMesh.position.copy(closestPlanet.position.clone().add(upVec.multiplyScalar(closestPlanet.radius)));
        } else if (currentRadius < terrH + 2) {
            submarineMesh.position.copy(closestPlanet.position.clone().add(upVec.multiplyScalar(terrH + 2)));
        }
        
        yawObject.position.copy(submarineMesh.position);
        
        // Fix Orientation: Align with surface but allow yaw
        const currentYaw = submarineMesh.rotation.y; 
        submarineMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVec);
        submarineMesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), currentYaw);
    }
    // -----------------------------------------------------------------

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
       
       // Phase 11: Dynamic Storm Processing
       if (closestPlanet.hazardType !== "None" && !isInsideCave) {
           if (!activeStorm) {
               nextStormIn -= dt;
               if (nextStormIn <= 0) {
                   activeStorm = true;
                   stormTimer = Math.random() * 30 + 20; // 20-50 second storm
                   const objEl = document.getElementById('obj-progress');
                   if (objEl) objEl.innerText = `[WARNING] EXTREME ${closestPlanet.hazardType.toUpperCase()} STORM DETECTED!`;
               }
           } else {
               stormTimer -= dt;
               if (stormTimer <= 0) {
                   activeStorm = false;
                   nextStormIn = Math.random() * 60 + 60; // Next storm in 60-120 seconds
                   const objEl = document.getElementById('obj-progress');
                   if (objEl) objEl.innerText = `[WEATHER] Extreme storm clearing...`;
               }
           }
       } else {
           activeStorm = false;
       }
       
       if (weatherSystem) {
          weatherSystem.material.opacity = Math.min(0.6, intensity) * (activeStorm ? 1.5 : 1.0);
          weatherSystem.material.color.setHex(closestPlanet.colorSet[4] || 0xffffff); // Use planet's lightest color 
          weatherSystem.rotation.y += (activeStorm ? 1.0 : 0.1) * dt;
          weatherSystem.rotation.x -= (activeStorm ? 0.5 : 0.05) * dt;
       }
       
       // Dynamic volumetric fog to hide planet curvature
       if (scene.fog) {
          const targetColor = new THREE.Color(closestPlanet.colorSet[4] || 0xffffff); // Use bright atmospheric color!
          const spaceColor = new THREE.Color(0x050510);
          
          scene.fog.color = spaceColor.lerp(targetColor, Math.pow(intensity, 2));
          scene.background = scene.fog.color; // Sky MUST match fog color to complete flat illusion
          scene.fog.density = intensity * (0.06 * Math.sqrt(100 / closestPlanet.radius)) * (activeStorm ? 3.0 : 1.0); 
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

        closestPlanet.faunaGroup.rotation.y -= 0.1 * dt; // Entire flock orbits planet slowly
        
        closestPlanet.faunaGroup.children.forEach((boid, idx) => {
            const distToPlayer = boid.position.distanceTo(localPlayer);
            
            // Seek and Destroy Player (Aggro behavior)
            if (distToPlayer < 25 && !isFlying) {
               const dir = localPlayer.clone().sub(boid.position).normalize();
               boid.position.add(dir.multiplyScalar(4 * dt)); // Rush player bounds (Slowed down)
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
    // Calculate up vector for gravity and orientation
    const up = yawObject.position.clone().sub(center).normalize();
    if (up.lengthSq() < 0.1) up.set(0, 1, 0); 
    const currentDistCenter = yawObject.position.distanceTo(center);
    
    // Evaluate procedural noise exactly at player's latitude/longitude
    const terrainRadius = getTerrainHeight(closestPlanet, up);
    // +3 allows the capsule mesh (-2 downward span) to rest precisely on the ground without clipping
    const surfaceRadius = terrainRadius + 3;

    if (isInsideCave) {
        // Flat movement bypasses planet wrapper
        direction.set(0,0,0);
        if(keys.w) direction.z -= 1;
        if(keys.s) direction.z += 1;
        if(keys.a) direction.x -= 1;
        if(keys.d) direction.x += 1;
        direction.normalize();
        
        const camQuat = new THREE.Quaternion();
        camera.getWorldQuaternion(camQuat);
        const euler = new THREE.Euler().setFromQuaternion(camQuat, 'YXZ');
        euler.x = 0; euler.z = 0;
        const flatQuat = new THREE.Quaternion().setFromEuler(euler);
        direction.applyQuaternion(flatQuat);
        
        yawObject.position.add(direction.multiplyScalar(speed * dt));

        const caveCenter = activeCaveGroup.position;
        const caveRadius = 800; // 4x size
        
        // Gravity pulls to the bottom of the cave (local -Y, which is global -Y since no rotation was applied to activeCaveGroup)
        yawObject.position.y -= 80 * dt; 
        
        // Constrain to the sphere's inner shell
        const relPos = yawObject.position.clone().sub(caveCenter);
        if (relPos.length() > caveRadius - 3) {
             relPos.normalize().multiplyScalar(caveRadius - 3);
             yawObject.position.copy(caveCenter).add(relPos);
        }
        
        // Align upright (normal of inner shell points to center)
        yawObject.quaternion.normalize();
        const currentUp = new THREE.Vector3(0,1,0).applyQuaternion(yawObject.quaternion).normalize();
        const targetUp = relPos.clone().normalize().negate(); 
        
        const alignQuat = new THREE.Quaternion().setFromUnitVectors(currentUp, targetUp);
        yawObject.quaternion.premultiply(alignQuat);
        yawObject.quaternion.normalize();
        
    } else if (isInsideDungeon) {
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
       if (!visitedPlanets.has(closestIdx)) {
           visitedPlanets.add(closestIdx);
           
           const resName = closestPlanet.resource || 'Crystal';
           inventory[resName] = (inventory[resName] || 0) + 10;
           
           if (closestPlanet.hazardType) {
               const ht = closestPlanet.hazardType;
               if (ht === 'Toxic') inventory['Toxic Fungus'] = (inventory['Toxic Fungus'] || 0) + 10;
               if (ht === 'Inferno') inventory['Spicy Bulbs'] = (inventory['Spicy Bulbs'] || 0) + 10;
               if (ht === 'Frozen') inventory['Crystalized Sap'] = (inventory['Crystalized Sap'] || 0) + 10;
           }
           
           const el = document.getElementById('obj-progress');
           if(el) el.innerText = `[+] Discovered new biome! +10 ${resName}`;
       }
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
    if (isFlying && isThirdPerson) { targetZ = 35; targetY = 12; }
    
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

  function updatePhysics(dt) {
    if(!camera || !renderer) return;
    try {
        innerUpdatePhysics(dt);
    } catch (e) {
        console.error("Physics Crash Prevented:", e);
        const debugPos = document.getElementById('nms-debug-pos');
        if (debugPos) {
            debugPos.innerText = "CRASH: " + e.message;
            debugPos.style.color = "red";
        }
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
    
    if (!scene || !camera || !renderer) return;
    
    for (let p of planets) {
      if (p.mesh && p.mesh.isLOD) p.mesh.update(camera);
    }
    
    // --- Phase 6: Cave Interaction Prompt & Home Button ---
    const homeBtn = document.getElementById('nms-home-return');
    if (homeBtn) homeBtn.style.display = (homeCavePos && !isInsideCave) ? 'block' : 'none';
    
    if (!isInsideCave) {
        let nearEntrance = false;
        for (const entrance of caveEntrances) {
            if (yawObject.position.distanceTo(entrance.worldPos) < 20) {
                const objEl = document.getElementById('obj-progress');
                if (objEl) objEl.innerText = "[CAVE] Entrance Detected. Press 'E' to enter the underworld.";
                nearEntrance = true;
                break;
            }
        }
    } else {
        const distToExit = yawObject.position.distanceTo(activeCaveGroup.position.clone().add(new THREE.Vector3(0, -780, 0)));
        if (distToExit < 40) {
            const objEl = document.getElementById('obj-progress');
            if (objEl) objEl.innerText = "[CAVE] Exit Portal. Press 'E' to return to space.";
        }
    }

    // --- Phase 7: Sentinel AI & Ground Combat ---
    sentinelSpawnTimer -= dt;
    if (sentinelSpawnTimer <= 0 && !isFlying && !isInsideCave && closestPlanet && groundWantedLevel > 0) {
        sentinelSpawnTimer = 15;
        const sPos = yawObject.position.clone().add(new THREE.Vector3(
            (Math.random()-0.5)*100,
            20,
            (Math.random()-0.5)*100
        ));
        spawnSentinel(sPos);
    }

    for (let i = sentinels.length - 1; i >= 0; i--) {
        const s = sentinels[i];
        const dist = s.mesh.position.distanceTo(yawObject.position);
        
        // 1. Movement AI (Smooth Follow/Patrol)
        const target = yawObject.position.clone().add(new THREE.Vector3(0, 5, 0));
        const dirToTarget = target.sub(s.mesh.position).normalize();
        
        if (s.state === 'idle') {
            if (dist > 30) s.mesh.position.add(dirToTarget.multiplyScalar(15 * dt));
            s.eye.material.color.set(0x00f3ff);
            s.light.color.set(0x00f3ff);
        } else if (s.state === 'scanning') {
            s.mesh.position.add(dirToTarget.multiplyScalar(4 * dt));
            s.eye.material.color.set(0xff7700);
            s.light.color.set(0xff7700);
            s.light.intensity = 2 + Math.sin(Date.now() * 0.01) * 2;
            if (dist < 15) {
                // Settle into attack mode
                s.state = 'attacking';
            }
        } else if (s.state === 'attacking') {
            s.eye.material.color.set(0xff0000);
            s.light.color.set(0xff0000);
            if (dist > 25) s.mesh.position.add(dirToTarget.multiplyScalar(25 * dt));
            
            s.lastFire -= dt;
            if (s.lastFire <= 0 && dist < 60) {
                s.lastFire = 2.0;
                // Fire Ground Laser
                const lGeo = new THREE.CylinderGeometry(0.2, 0.2, 10, 8);
                lGeo.rotateX(Math.PI/2);
                const lMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                const lMesh = new THREE.Mesh(lGeo, lMat);
                lMesh.position.copy(s.mesh.position);
                lMesh.lookAt(yawObject.position);
                scene.add(lMesh);
                enemyLasers.push({ mesh: lMesh, dir: yawObject.position.clone().sub(s.mesh.position).normalize(), life: 100 });
            }
        }
        
        s.mesh.lookAt(yawObject.position);

        // Check for hits from player lasers
        for (let j = lasers.length - 1; j >= 0; j--) {
            if (s.mesh.position.distanceTo(lasers[j].mesh.position) < 5) {
                s.health -= 25;
                s.state = 'attacking'; // Retaliate
                scene.remove(lasers[j].mesh);
                lasers.splice(j, 1);
            }
        }

        if (s.health <= 0) {
            naniteClusters += 15 + Math.floor(Math.random() * 20);
            const naniteEl = document.getElementById('nms-nanites');
            if (naniteEl) naniteEl.innerText = `Nanites: ${naniteClusters}`;
            
            const scoreEl = document.getElementById('obj-progress');
            if (scoreEl) scoreEl.innerText = `[+] Sentinel Neutralized. Salvaged Nanite Clusters!`;
            scene.remove(s.mesh);
            sentinels.splice(i, 1);
        }
    }

    if(renderer && scene && camera) renderer.render(scene, camera);
  }

  window.bribeGPF = function() {
      if (credits >= 200) {
          credits -= 200;
          // Despawn all GPF drones
          for (const d of gpfDrones) {
              scene.remove(d.mesh);
          }
          gpfDrones.length = 0;
          wantedLevel = 0;
          gpfSpawnTimer = 0;
          const scoreEl = document.getElementById('obj-progress');
          if (scoreEl) scoreEl.innerText = '[✓] GPF BRIBED — CHARGES DROPPED. STAY CLEAN.';
          const bribeBtn = document.getElementById('nms-gpf-bribe');
          if (bribeBtn) bribeBtn.style.display = 'none';
      } else {
          const scoreEl = document.getElementById('obj-progress');
          if (scoreEl) scoreEl.innerText = '[!] NOT ENOUGH CREDITS — GPF requires 200¢!';
      }
  };

  window.startNMS = function() {
    if (!scene) {
        init();
        animate();
    }
    
    if (overlay) overlay.style.display = 'none';
    const startUI = document.getElementById('nms-start-ui');
    if (startUI) startUI.style.display = 'none';
    if (hud) hud.style.display = 'block';
    
    if (!isLocked && container) {
       container.requestPointerLock();
    }
    
    const themeAudio = document.getElementById('game-audio');
    if (themeAudio && themeAudio.paused) {
        themeAudio.volume = 0.5;
        themeAudio.play().catch(e => console.warn("Theme autoplay blocked:", e));
    }
  };

  window.resetNMS = function() {
      if (!document.fullscreenElement) {
          const scoreEl = document.getElementById('obj-progress');
          if (scoreEl) scoreEl.innerText = "[!] YOU MUST BE IN FULLSCREEN TO RESET UNIVERSE.";
          return;
      }
      
      if (document.pointerLockElement) {
          document.exitPointerLock();
      }
      setTimeout(() => {
          if(confirm("Are you sure you want to reset your universe? This will clear all inventory, credits, and bases!")) {
              localStorage.removeItem('nmsWeb_saveState');
              localStorage.removeItem('nmsWeb_homeCave');
              window.location.reload();
          }
      }, 100);
  };

  // Pre-initialize the massive planetary math so it doesn't block the play button Event Loop!
  setTimeout(() => {
    if (!scene && container) {
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


  // --- Phase 8: Culinary Arts Functions ---
  // Define recipes globally so UI can access them
  window.cookingRecipes = {
      'Nutrient Paste': { ingredients: { 'Raw Meat': 1, 'Carbon': 1 }, effect: 'Heal 30', desc: 'Basic survival food.' },
      'Sweet Jam': { ingredients: { 'Sweet Berries': 1, 'Carbon': 1 }, effect: 'Jetpack Refill', desc: 'Provides a burst of energy.' },
      'Hazard Gulp': { ingredients: { 'Sweet Berries': 1, 'Cave Salts': 1 }, effect: 'Hazard Refill', desc: 'Restores environmental shielding.' },
      'Spicy Stew': { ingredients: { 'Raw Meat': 1, 'Spicy Bulbs': 1 }, effect: 'Speed Boost', desc: 'Increases movement speed.' },
      'Frozen Sorbet': { ingredients: { 'Sweet Berries': 1, 'Crystalized Sap': 1 }, effect: 'Hazard Immunity', desc: 'Prevents hazard drain.' },
      'Fungal Risotto': { ingredients: { 'Raw Meat': 1, 'Toxic Fungus': 1 }, effect: 'Big Heal', desc: 'Significantly restores health.' },
      'Glowing Salad': { ingredients: { 'Glowing Moss': 1, 'Wild Yeast': 1 }, effect: 'Resource Highlight', desc: 'Reveals nearby resources.' },
      'Bone Broth': { ingredients: { 'Bone Shards': 1, 'Cave Salts': 1 }, effect: 'Health Regen', desc: 'Heals over time.' },
      'Wild Cake': { ingredients: { 'Sweet Berries': 1, 'Wild Yeast': 1, 'Carbon': 5 }, effect: 'Full Restore', desc: 'Restores all vitals.' },
      'Nanite Infusion': { ingredients: { 'Raw Meat': 1, 'Nanites': 50 }, effect: 'Iron Skin', desc: 'Reduces all incoming damage.' }
  };

  window.openCookingUI = function() {
      document.exitPointerLock();
      const overlay = document.getElementById('nms-cooking-overlay');
      if (overlay) overlay.style.display = 'flex';
      
      const invList = document.getElementById('cooking-inventory');
      if (invList) {
          invList.innerHTML = '';
          for (let item in inventory) {
              if (inventory[item] > 0) invList.innerHTML += `<div style="padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">${item}: <span style="color: #fbbf24">${inventory[item]}</span></div>`;
          }
          if (invList.innerHTML === '') invList.innerHTML = '<div style="color: #6b7280; font-style: italic;">No ingredients found.</div>';
      }

      const recList = document.getElementById('cooking-recipes');
      if (recList) {
          recList.innerHTML = '';
          for (let mealName in window.cookingRecipes) {
              const rec = window.cookingRecipes[mealName];
              
              // Check if user has ingredients
              let canCook = true;
              let ingHTML = '';
              for (let ing in rec.ingredients) {
                  const req = rec.ingredients[ing];
                  const has = (ing === 'Nanites') ? naniteClusters : (inventory[ing] || 0);
                  const color = has >= req ? '#34d399' : '#ef4444';
                  if (has < req) canCook = false;
                  ingHTML += `<span style="color: ${color}; margin-right: 8px;">${req}x ${ing}</span>`;
              }
              
              recList.innerHTML += `
                  <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px; display: flex; flex-direction: column; gap: 5px;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                          <strong style="color: #60a5fa">${mealName}</strong>
                          <span style="color: #a78bfa; font-size: 11px;">[${rec.effect}]</span>
                      </div>
                      <div style="font-size: 11px; display: flex; flex-wrap: wrap;">${ingHTML}</div>
                      <button onclick="window.cookMeal('${mealName}')" ${canCook ? '' : 'disabled'} style="margin-top: 5px; padding: 6px; background: ${canCook ? '#2563eb' : '#374151'}; color: ${canCook ? '#fff' : '#9ca3af'}; border: none; border-radius: 4px; cursor: ${canCook ? 'pointer' : 'not-allowed'}; font-family: monospace;">Cook</button>
                  </div>
              `;
          }
      }
  };

  window.cookMeal = function(mealName) {
      const recipe = window.cookingRecipes[mealName];
      if (!recipe) return;

      // Check Ingredients
      for (let ing in recipe.ingredients) {
          const has = (ing === 'Nanites') ? naniteClusters : (inventory[ing] || 0);
          if (has < recipe.ingredients[ing]) {
              const fb = document.getElementById('obj-progress');
              if (fb) fb.innerText = `[!] Missing: ${ing}`;
              return;
          }
      }

      // Consume Ingredients
      for (let ing in recipe.ingredients) {
          if (ing === 'Nanites') {
              // Handled below
          } else {
              inventory[ing] -= recipe.ingredients[ing];
          }
      }

      // Special case for Nanites if they are a separate var
      if (recipe.ingredients['Nanites']) {
          if (naniteClusters >= recipe.ingredients['Nanites']) {
              naniteClusters -= recipe.ingredients['Nanites'];
              const nEl = document.getElementById('nms-nanites');
              if (nEl) nEl.innerText = `Nanites: ${naniteClusters}`;
          } else {
              return; // Should have been caught by general check if nanites were in inventory, but handle for safety
          }
      }

      // Add to inventory
      inventory[mealName] = (inventory[mealName] || 0) + 1;
      
      const scoreEl = document.getElementById('obj-progress');
      if (scoreEl) scoreEl.innerText = `[+] COOKED: ${mealName}!`;
      window.openCookingUI(); // Refresh list
  };

  window.consumeMeal = function(mealName) {
      if (!inventory[mealName] || inventory[mealName] <= 0) return;
      inventory[mealName]--;
      
      const scoreEl = document.getElementById('obj-progress');
      if (scoreEl) scoreEl.innerText = `[MEAL] Consumed ${mealName}!`;
      
      document.body.style.backgroundColor = "rgba(34, 197, 94, 0.3)";
      setTimeout(() => { document.body.style.backgroundColor = "transparent"; }, 300);

      if (mealName === 'Nutrient Paste') playerHealth = Math.min(100, playerHealth + 30);
      if (mealName === 'Sweet Jam') jetpackFuel = 100;
      if (mealName === 'Hazard Gulp') hazardProtection = Math.min(100, hazardProtection + 50);
      if (mealName === 'Spicy Stew') { /* Speed boost handled in physics */ }
      if (mealName === 'Frozen Sorbet') { /* Immunity handled in hazard drain */ }
      if (mealName === 'Fungal Risotto') { 
          playerHealth = Math.min(100, playerHealth + 60);
          document.body.style.filter = "hue-rotate(90deg) saturate(2)";
          setTimeout(() => { document.body.style.filter = "none"; }, 5000);
      }
      if (mealName === 'Glowing Salad') { /* Resource highlight handled in physics */ }
      if (mealName === 'Bone Broth') { /* Regen handled in update */ }
      if (mealName === 'Wild Cake') { playerHealth = 100; hazardProtection = 100; }
      if (mealName === 'Nanite Infusion') { /* Iron Skin handled in damage logic */ }

      // Update HUD
      const hpBar = document.getElementById('nms-health-bar');
      if (hpBar) hpBar.style.width = playerHealth + '%';
  };

  // Refine consumeMeal with durations
  const originalConsumeMeal = window.consumeMeal;
  window.consumeMeal = function(mealName) {
      originalConsumeMeal(mealName);
      // Add durations
      if (mealName === 'Spicy Stew') speedBuffTimer = 30000;
      if (mealName === 'Frozen Sorbet') hazardImmunityTimer = 20000;
      if (mealName === 'Fungal Risotto') { /* vision already handled */ }
      if (mealName === 'Glowing Salad') resourceHighlightTimer = 45000;
      if (mealName === 'Bone Broth') regenTimer = 60000;
      if (mealName === 'Nanite Infusion') ironSkinTimer = 5000;
  };

  // --- Phase 9: The Nautilon (Submarine) ---
  let isRidingSub = false;
  let submarineMesh = null;
  let oxygenLevel = 100;
  
  window.createSubmarineMesh = function() {
      const group = new THREE.Group();
      
      // Main Hull (sleek sub shape)
      const hullGeo = new THREE.CapsuleGeometry(1.5, 4, 16, 16);
      hullGeo.rotateZ(Math.PI/2);
      const hullMat = new THREE.MeshStandardMaterial({color: 0x3b82f6, metalness: 0.8, roughness: 0.2});
      const hull = new THREE.Mesh(hullGeo, hullMat);
      group.add(hull);
      
      // Cockpit Window
      const cockGeo = new THREE.SphereGeometry(1.2, 16, 16, 0, Math.PI*2, 0, Math.PI/2);
      const cockMat = new THREE.MeshStandardMaterial({color: 0x00ffff, transparent: true, opacity: 0.6});
      const cock = new THREE.Mesh(cockGeo, cockMat);
      cock.position.set(2, 0.5, 0);
      cock.rotateZ(-Math.PI/2);
      group.add(cock);
      
      // Horizontal Fins
      const finGeo = new THREE.BoxGeometry(2, 0.2, 4);
      const finMat = new THREE.MeshStandardMaterial({color: 0x1e3a8a});
      const fins = new THREE.Mesh(finGeo, finMat);
      group.add(fins);
      
      // Propeller Housing
      const propGeo = new THREE.TorusGeometry(0.8, 0.1, 8, 16);
      const propMat = new THREE.MeshStandardMaterial({color: 0x111111});
      const prop = new THREE.Mesh(propGeo, propMat);
      prop.position.set(-3.5, 0, 0);
      prop.rotateY(Math.PI/2);
      group.add(prop);
      
      // Headlights
      const lightGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16);
      lightGeo.rotateZ(Math.PI/2);
      const lightMat = new THREE.MeshBasicMaterial({color: 0xffffff});
      const headlight = new THREE.Mesh(lightGeo, lightMat);
      headlight.position.set(3.2, -0.5, 0);
      group.add(headlight);
      
      const spotlight = new THREE.SpotLight(0xffffff, 5, 200, Math.PI/6, 0.5);
      spotlight.position.set(3.5, -0.5, 0);
      spotlight.target.position.set(10, -0.5, 0);
      group.add(spotlight);
      group.add(spotlight.target);
      
      return group;
  };

  window.summonSubmarine = function() {
      if (isFlying || isRiding) {
          const scoreEl = document.getElementById('obj-progress');
          if (scoreEl) scoreEl.innerText = "[!] Cannot summon Nautilon while in another vehicle.";
          return;
      }
      
      if (submarineMesh) scene.remove(submarineMesh);
      
      submarineMesh = createSubmarineMesh();
      
      // Place near player on the water level
      let closestP = planets[0];
      let minDist = Infinity;
      planets.forEach(p => {
          const d = yawObject.position.distanceTo(p.position);
          if (d < minDist) { minDist = d; closestP = p; }
      });
      
      // Water level is basically planet.radius
      const toPlayer = yawObject.position.clone().sub(closestP.position).normalize();
      submarineMesh.position.copy(closestP.position.clone().add(toPlayer.multiplyScalar(closestP.radius)));
      submarineMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), toPlayer);
      
      scene.add(submarineMesh);
      
      const scoreEl = document.getElementById('obj-progress');
      if (scoreEl) scoreEl.innerText = "[⚓] NAUTILON SUMMONED. Press E to board!";
  };

  window.toggleSubmarineMode = function() {
      if (!submarineMesh) return;
      
      const dist = yawObject.position.distanceTo(submarineMesh.position);
      if (dist < 15 && !isRidingSub) {
          isRidingSub = true;
          yawObject.add(camera);
          camera.position.set(0, 1.5, 0); // Position inside the sub
          
          const scoreEl = document.getElementById('obj-progress');
          if (scoreEl) scoreEl.innerText = "[⚓] NAUTILON CONTROLS ACTIVE. WASD: Propel, SPACE: Ascend, SHIFT: Descend.";
      } else if (isRidingSub) {
          isRidingSub = false;
          const scoreEl = document.getElementById('obj-progress');
          if (scoreEl) scoreEl.innerText = "[⚓] EXITING NAUTILON.";
      }
  };
})();
