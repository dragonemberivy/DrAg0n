import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';

// --- Global State & Upgrades ---
let playerGold = 0;
let playerHealth = 100;
let playerMaxHealth = 100;
let sailLevel = 0; 
let shipSpeed = 0;
let windDirection = new THREE.Vector3(1, 0, 0); 
let bountyLevel = 0;
let worldTime = 0;
const dayDuration = 120000; // 2 minutes per day
let crewCount = 5;
let lastPlayerFire = 0;

// Upgrades
let cannonDamage = 25;
let sailSpeedMultiplier = 1.0;
let baseReloadTime = 3000; // 3 seconds

// UI Elements
const healthUI = document.getElementById('health-ui');
const windUI = document.getElementById('wind-ui');
const goldUI = document.getElementById('gold-ui');
const bountyUI = document.getElementById('bounty-ui');
const sailsUI = document.getElementById('sails-ui');
const speedUI = document.getElementById('speed-ui');
const shopUI = document.getElementById('shop-ui');
const shopGold = document.getElementById('shop-gold');
const reloadUI = document.getElementById('reload-ui');
const crewUI = document.getElementById('crew-ui');
const minimapCanvas = document.getElementById('minimap');
const minimapCtx = minimapCanvas?.getContext('2d');

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.FogExp2(0x87CEEB, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 40, 120);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.minDistance = 20;
controls.maxDistance = 200;

const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(-100, 100, 50);
scene.add(directionalLight);

// --- Particle Systems ---
const particles = [];
const particleGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

// Wake Particles
const wakeParticles = [];
const wakeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });

function createExplosion(position) {
    for (let i = 0; i < 15; i++) {
        const p = new THREE.Mesh(particleGeometry, particleMaterial);
        p.position.copy(position);
        p.userData = {
            velocity: new THREE.Vector3((Math.random() - 0.5) * 2, Math.random() * 2, (Math.random() - 0.5) * 2),
            life: 1.0
        };
        scene.add(p);
        particles.push(p);
    }
}

function spawnWake(position, rotationY) {
    const p = new THREE.Mesh(particleGeometry, wakeMaterial);
    p.position.copy(position);
    p.position.y = 0;
    
    // Offset to back of ship
    const backVector = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY);
    p.position.addScaledVector(backVector, 15);
    
    p.userData = { life: 1.0 };
    scene.add(p);
    wakeParticles.push(p);
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.position.add(p.userData.velocity);
        p.userData.velocity.y -= 0.05;
        p.userData.life -= 0.02;
        p.scale.multiplyScalar(0.95);
        if (p.userData.life <= 0) { scene.remove(p); particles.splice(i, 1); }
    }
    
    for (let i = wakeParticles.length - 1; i >= 0; i--) {
        const p = wakeParticles[i];
        p.userData.life -= 0.02;
        p.scale.multiplyScalar(1.05);
        p.material.opacity = p.userData.life * 0.6;
        if (p.userData.life <= 0) { scene.remove(p); wakeParticles.splice(i, 1); }
    }
}

// --- Weather System ---
let isRaining = false;
let rainParticles = null;
let lastWeatherChange = 0;

function createRain() {
    const rainCount = 15000;
    const rainGeo = new THREE.BufferGeometry();
    const rainArray = new Float32Array(rainCount * 3);
    for(let i=0; i<rainCount*3; i++) {
        rainArray[i] = (Math.random() - 0.5) * 400; // x
        rainArray[i+1] = Math.random() * 200;       // y
        rainArray[i+2] = (Math.random() - 0.5) * 400; // z
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainArray, 3));
    const rainMat = new THREE.PointsMaterial({ color: 0xaaaaaa, size: 0.5, transparent: true });
    rainParticles = new THREE.Points(rainGeo, rainMat);
    scene.add(rainParticles);
}

function updateWeather() {
    const time = performance.now();
    if (time - lastWeatherChange > 30000) { // Change weather every 30s
        isRaining = Math.random() > 0.6;
        lastWeatherChange = time;
        
        if (isRaining && !rainParticles) createRain();
        if (!isRaining && rainParticles) { scene.remove(rainParticles); rainParticles = null; }
    }
    
    // Lerp fog and lighting based on weather
    const targetFogColor = isRaining ? new THREE.Color(0x444444) : new THREE.Color(0x87CEEB);
    const targetFogDensity = isRaining ? 0.005 : 0.002;
    const targetLightIntensity = isRaining ? 0.8 : 2.0;

    scene.fog.color.lerp(targetFogColor, 0.01);
    scene.background.lerp(targetFogColor, 0.01);
    scene.fog.density += (targetFogDensity - scene.fog.density) * 0.01;
    directionalLight.intensity += (targetLightIntensity - directionalLight.intensity) * 0.01;

    if (rainParticles) {
        rainParticles.position.copy(playerShip.position); // Follow player
        rainParticles.position.y = 0;
        const positions = rainParticles.geometry.attributes.position.array;
        for(let i=1; i<positions.length; i+=3) {
            positions[i] -= 2.0; // fall speed
            if(positions[i] < 0) positions[i] = 200;
        }
        rainParticles.geometry.attributes.position.needsUpdate = true;
    }
}

// --- Floating Loot System ---
const lootCrates = [];
const crateGeometry = new THREE.CylinderGeometry(2, 2, 4);
const crateMaterial = new THREE.MeshStandardMaterial({ color: 0x966F33 });

function spawnLoot(x, z) {
    const crate = new THREE.Mesh(crateGeometry, crateMaterial);
    crate.position.set(x, 0, z);
    scene.add(crate);
    lootCrates.push({ mesh: crate, phase: Math.random() * Math.PI * 2 });
}

function updateLoot() {
    const time = performance.now() * 0.001;
    
    // Spawn random loot
    if (lootCrates.length < 8 && Math.random() < 0.005) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 100 + Math.random() * 200;
        spawnLoot(playerShip.position.x + Math.cos(angle) * dist, playerShip.position.z + Math.sin(angle) * dist);
    }
    
    for (let i = lootCrates.length - 1; i >= 0; i--) {
        const crate = lootCrates[i];
        crate.mesh.rotation.y += 0.01;
        crate.mesh.rotation.z = Math.sin(time * 2 + crate.phase) * 0.2;
        crate.mesh.position.y = Math.sin(time * 3 + crate.phase) * 0.5;
        
        if (crate.mesh.position.distanceTo(playerShip.position) < 15) {
            // Collect
            scene.remove(crate.mesh);
            lootCrates.splice(i, 1);
            playerGold += 30; // Random gold amount
            updateUI();
        }
    }
}

// --- Core Systems ---
const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
const water = new Water(waterGeometry, {
    textureWidth: 512, textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg', function (texture) { texture.wrapS = texture.wrapT = THREE.RepeatWrapping; }),
    sunDirection: directionalLight.position.clone().normalize(),
    sunColor: 0xffffff, waterColor: 0x001e0f, distortionScale: 3.7, fog: true
});
water.rotation.x = -Math.PI / 2;
scene.add(water);

function createShipModel(hullColor, sailColor, isGalleon = false) {
    const shipGroup = new THREE.Group();
    const scale = isGalleon ? 1.5 : 1;
    
    const hullGeometry = new THREE.BoxGeometry(10 * scale, 5 * scale, 30 * scale);
    const hullMaterial = new THREE.MeshStandardMaterial({ color: hullColor });
    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    hull.position.y = 2.5 * scale;
    shipGroup.add(hull);

    const mastGeometry = new THREE.CylinderGeometry(0.5 * scale, 0.5 * scale, 20 * scale);
    const mastMaterial = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
    const mast = new THREE.Mesh(mastGeometry, mastMaterial);
    mast.position.y = 15 * scale;
    shipGroup.add(mast);

    const sailGeometry = new THREE.PlaneGeometry(15 * scale, 10 * scale);
    const sailMaterial = new THREE.MeshStandardMaterial({ color: sailColor, side: THREE.DoubleSide });
    const sail = new THREE.Mesh(sailGeometry, sailMaterial);
    sail.position.set(0, 15 * scale, 2 * scale);
    shipGroup.add(sail);

    return shipGroup;
}

const playerShip = createShipModel(0x8b4513, 0xffffff);
scene.add(playerShip);

const islands = [];
const islandMaterial = new THREE.MeshStandardMaterial({ color: 0x2e8b57 }); 
const sandMaterial = new THREE.MeshStandardMaterial({ color: 0xeedd82 }); 

function spawnIsland(x, z, isOutpost = false) {
    const radius = Math.random() * 50 + 40;
    const islandGroup = new THREE.Group();
    
    const sandGeo = new THREE.CylinderGeometry(radius + 10, radius + 20, 5, 32);
    const sand = new THREE.Mesh(sandGeo, sandMaterial);
    sand.position.y = -1;
    islandGroup.add(sand);

    const islandGeometry = new THREE.CylinderGeometry(radius, radius + 10, 8, 32);
    const island = new THREE.Mesh(islandGeometry, islandMaterial);
    island.position.y = 2;
    islandGroup.add(island);

    for(let i = 0; i < 5; i++) {
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 10), new THREE.MeshStandardMaterial({color: 0x5c4033}));
        trunk.position.y = 5;
        const leaves = new THREE.Mesh(new THREE.ConeGeometry(5, 10, 8), new THREE.MeshStandardMaterial({color: 0x00ff00}));
        leaves.position.y = 12;
        tree.add(trunk); tree.add(leaves);
        tree.position.set((Math.random() - 0.5) * radius * 1.2, 5, (Math.random() - 0.5) * radius * 1.2);
        islandGroup.add(tree);
    }
    
    if (isOutpost) {
        const fort = new THREE.Mesh(new THREE.BoxGeometry(15, 15, 15), new THREE.MeshStandardMaterial({color: 0x888888}));
        fort.position.set(0, 10, 0);
        islandGroup.add(fort);
    }

    islandGroup.position.set(x, 0, z);
    scene.add(islandGroup);
    islands.push({ group: islandGroup, radius: radius, isOutpost: isOutpost });
}

spawnIsland(150, -200, true); 
spawnIsland(-400, -100, false);
spawnIsland(300, 400, false);
spawnIsland(-200, 500, true);

// 4. Sea Monster (The Shark)
const shark = {
    mesh: new THREE.Group(),
    state: 'stalking',
    angle: 0,
    dist: 100,
    health: 200,
    lastAttack: 0
};
const fin = new THREE.Mesh(new THREE.ConeGeometry(3, 8, 4), new THREE.MeshStandardMaterial({color: 0x333333}));
fin.rotation.x = Math.PI / 2;
shark.mesh.add(fin);
scene.add(shark.mesh);

// 5. The Kraken
const kraken = {
    isActive: false,
    tentacles: [],
    lastSlap: 0,
    health: 0
};

function spawnKraken() {
    if (kraken.isActive) return;
    kraken.isActive = true;
    kraken.health = 5; // Kill 5 tentacles
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const tentacleGroup = new THREE.Group();
        const base = new THREE.Mesh(new THREE.CylinderGeometry(2, 5, 30, 8), new THREE.MeshStandardMaterial({color: 0x800080}));
        base.position.y = 5; // Mostly underwater
        tentacleGroup.add(base);
        
        tentacleGroup.position.set(
            playerShip.position.x + Math.cos(angle) * 60,
            -20, // Start deep
            playerShip.position.z + Math.sin(angle) * 60
        );
        tentacleGroup.userData = { angle, health: 50, phase: Math.random() * Math.PI };
        scene.add(tentacleGroup);
        kraken.tentacles.push(tentacleGroup);
    }
    bountyUI.innerText = "KRAKEN ATTACK!";
    bountyUI.style.color = "#ff00ff";
}

// 6. Enemy Spawner & AI
const enemies = [];
function spawnEnemy(x, z, isGalleon = false) {
    const enemyModel = createShipModel(isGalleon ? 0x222222 : 0x444444, 0x111111, isGalleon);
    enemyModel.position.set(x, 0, z);
    scene.add(enemyModel);
    enemies.push({
        model: enemyModel,
        health: isGalleon ? 150 : 50,
        speed: isGalleon ? 0.2 : 0.4,
        lastFired: 0,
        isGalleon: isGalleon,
        reward: isGalleon ? 250 : 100
    });
}

spawnEnemy(-150, -150);
spawnEnemy(200, 150);
let lastSpawnTime = performance.now();

const cannonballs = [];

function fireCannon(sourcePosition, sourceRotation, isPlayer = false) {
    const ballGeometry = new THREE.SphereGeometry(0.8, 8, 8);
    const ballMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    
    ball.position.copy(sourcePosition);
    ball.position.y += 5;
    
    const sideVector = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), sourceRotation);
    ball.position.addScaledVector(sideVector, 8);
    ball.userData = {
        velocity: sideVector.clone().multiplyScalar(4).add(new THREE.Vector3(0, 1.2, 0)),
        isPlayer: isPlayer,
        damage: isPlayer ? cannonDamage : 15
    };
    
    scene.add(ball);
    cannonballs.push(ball);
}

// --- Input Handling ---
const keys = { w: false, a: false, s: false, d: false, e: false, space: false };
let shopOpen = false;

window.addEventListener('keydown', (e) => {
    let key = e.key.toLowerCase();
    
    // Map Arrow keys to WASD
    if (key === 'arrowup') key = 'w';
    if (key === 'arrowdown') key = 's';
    if (key === 'arrowleft') key = 'a';
    if (key === 'arrowright') key = 'd';

    if(keys.hasOwnProperty(key)) keys[key] = true;
    if(e.code === 'Space' && !keys.space) {
        keys.space = true;
        const reloadTime = baseReloadTime - (crewCount * 200);
        if(playerHealth > 0 && !shopOpen && performance.now() - lastPlayerFire > reloadTime) {
            fireCannon(playerShip.position, playerShip.rotation.y, true); 
            fireCannon(playerShip.position, playerShip.rotation.y + Math.PI, true); 
            lastPlayerFire = performance.now();
        }
    }
    if (key === 'e') checkShopInteraction();
});
window.addEventListener('keyup', (e) => {
    let key = e.key.toLowerCase();
    
    // Map Arrow keys to WASD
    if (key === 'arrowup') key = 'w';
    if (key === 'arrowdown') key = 's';
    if (key === 'arrowleft') key = 'a';
    if (key === 'arrowright') key = 'd';

    if(keys.hasOwnProperty(key)) keys[key] = false;
    if(e.code === 'Space') keys.space = false;
});

// --- Shop Logic ---
document.getElementById('close-shop-btn').addEventListener('click', () => { shopUI.style.display = 'none'; shopOpen = false; });
document.getElementById('repair-btn').addEventListener('click', () => {
    if (playerGold >= 50 && playerHealth < playerMaxHealth) { playerGold -= 50; playerHealth = playerMaxHealth; updateUI(); }
});
document.getElementById('upgrade-hull-btn').addEventListener('click', () => {
    if (playerGold >= 150) { playerGold -= 150; playerMaxHealth += 50; playerHealth += 50; updateUI(); }
});
document.getElementById('upgrade-cannon-btn').addEventListener('click', () => {
    if (playerGold >= 200) { playerGold -= 200; cannonDamage += 15; updateUI(); }
});
document.getElementById('upgrade-sail-btn').addEventListener('click', () => {
    if (playerGold >= 150) { playerGold -= 150; sailSpeedMultiplier += 0.2; updateUI(); }
});
document.getElementById('hire-crew-btn').addEventListener('click', () => {
    if (playerGold >= 100 && crewCount < 12) { playerGold -= 100; crewCount++; updateUI(); }
});

function checkShopInteraction() {
    if (shopOpen) { shopUI.style.display = 'none'; shopOpen = false; return; }
    for(let island of islands) {
        if (island.isOutpost && playerShip.position.distanceTo(island.group.position) < island.radius + 60) {
            shopUI.style.display = 'block'; shopOpen = true;
            shopGold.innerText = playerGold;
            return;
        }
    }
}

function updateUI() {
    healthUI.innerText = `Hull: ${playerHealth}/${playerMaxHealth}`;
    goldUI.innerText = `Gold: ${playerGold}`;
    bountyUI.innerText = kraken.isActive ? "KRAKEN ATTACK!" : `Bounty Level: ${bountyLevel}`;
    bountyUI.style.color = kraken.isActive ? "#ff00ff" : "#fff";
    sailsUI.innerText = `${sailLevel}%`;
    speedUI.innerText = `${Math.round(shipSpeed * 100)}`;
    crewUI.innerText = `Crew: ${crewCount}`;

    const reloadTime = baseReloadTime - (crewCount * 200);
    const progress = Math.min(1, (performance.now() - lastPlayerFire) / reloadTime);
    reloadUI.innerText = progress < 1 ? `Reloading: ${Math.round(progress * 100)}%` : "Cannons: READY";
    reloadUI.style.color = progress < 1 ? "#aaa" : "#0f0";
    
    let dir = "East";
    if (windDirection.x < -0.5) dir = "West";
    else if (windDirection.z > 0.5) dir = "South";
    else if (windDirection.z < -0.5) dir = "North";
    windUI.innerText = `Wind: ${dir}`;

    if (shopOpen) shopGold.innerText = playerGold;
    if (playerHealth <= 0) { healthUI.innerText = "DESTROYED. Game Over."; healthUI.style.color = "red"; }
}

function updateDayNight() {
    worldTime = (performance.now() % dayDuration) / dayDuration;
    const sunAngle = worldTime * Math.PI * 2;
    
    directionalLight.position.set(
        Math.cos(sunAngle) * 100,
        Math.sin(sunAngle) * 100,
        50
    );
    
    const isNight = Math.sin(sunAngle) < 0;
    const intensity = isNight ? 0.2 : 2.0;
    directionalLight.intensity += (intensity - directionalLight.intensity) * 0.01;
    
    const nightColor = new THREE.Color(0x000011);
    const dayColor = isRaining ? new THREE.Color(0x444444) : new THREE.Color(0x87CEEB);
    const currentColor = isNight ? nightColor : dayColor;
    
    scene.background.lerp(currentColor, 0.01);
    scene.fog.color.lerp(currentColor, 0.01);
    ambientLight.intensity = isNight ? 0.5 : 1.5;
}

function updateShark() {
    const time = performance.now();
    const distToPlayer = shark.mesh.position.distanceTo(playerShip.position);
    
    if (shark.state === 'stalking') {
        shark.angle += 0.01;
        shark.mesh.position.set(
            playerShip.position.x + Math.cos(shark.angle) * shark.dist,
            -2, // Fin just above water
            playerShip.position.z + Math.sin(shark.angle) * shark.dist
        );
        shark.mesh.lookAt(playerShip.position);
        
        if (distToPlayer < 150 && time - shark.lastAttack > 10000) {
            shark.state = 'charging';
        }
    } else if (shark.state === 'charging') {
        const dir = playerShip.position.clone().sub(shark.mesh.position).normalize();
        shark.mesh.position.addScaledVector(dir, 1.2);
        shark.mesh.lookAt(playerShip.position);
        
        if (distToPlayer < 15) {
            playerHealth -= 20;
            createExplosion(shark.mesh.position);
            shark.state = 'stalking';
            shark.lastAttack = time;
            updateUI();
        }
        if (distToPlayer > 200) shark.state = 'stalking';
    }
}

function updateMinimap() {
    if (!minimapCtx) return;
    minimapCtx.clearRect(0, 0, 150, 150);
    const center = 75;
    const scale = 0.15;
    
    // Draw player
    minimapCtx.fillStyle = '#ffffff';
    minimapCtx.beginPath();
    minimapCtx.arc(center, center, 3, 0, Math.PI * 2);
    minimapCtx.fill();
    
    // Draw islands
    minimapCtx.fillStyle = '#2e8b57';
    islands.forEach(island => {
        const dx = (island.group.position.x - playerShip.position.x) * scale;
        const dz = (island.group.position.z - playerShip.position.z) * scale;
        if (Math.hypot(dx, dz) < 70) {
            minimapCtx.beginPath();
            minimapCtx.arc(center + dx, center + dz, island.radius * scale, 0, Math.PI * 2);
            minimapCtx.fill();
        }
    });
    
    // Draw enemies
    minimapCtx.fillStyle = '#ff0000';
    enemies.forEach(enemy => {
        const dx = (enemy.model.position.x - playerShip.position.x) * scale;
        const dz = (enemy.model.position.z - playerShip.position.z) * scale;
        if (Math.hypot(dx, dz) < 70) {
            minimapCtx.fillRect(center + dx - 2, center + dz - 2, 4, 4);
        }
    });
}

// --- Game Loop Logic ---
function updatePlayerShip() {
    if (playerHealth <= 0) return;

    if (keys.w) sailLevel = Math.min(100, sailLevel + 1);
    if (keys.s) sailLevel = Math.max(0, sailLevel - 1);
    
    const turnSpeed = 0.02 * (shipSpeed > 0.1 ? 1 : 0.5);
    if (keys.a) playerShip.rotation.y += turnSpeed;
    if (keys.d) playerShip.rotation.y -= turnSpeed;

    const shipForward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerShip.rotation.y);
    const windAlignment = shipForward.dot(windDirection.clone().normalize());
    
    const maxSpeed = 1.0 * (sailLevel / 100) * sailSpeedMultiplier;
    const targetSpeed = Math.max(0, maxSpeed * (0.4 + 0.6 * windAlignment));
    
    shipSpeed += (targetSpeed - shipSpeed) * 0.01;
    playerShip.translateZ(-shipSpeed);

    if (shipSpeed > 0.1 && Math.random() < 0.3) {
        spawnWake(playerShip.position, playerShip.rotation.y);
    }

    const time = performance.now() * 0.001;
    playerShip.position.y = Math.sin(time * 2) * 0.5;
    playerShip.rotation.z = Math.sin(time * 1.5) * 0.05;
    playerShip.rotation.x = Math.sin(time * 1.2) * 0.05;

    camera.position.x = playerShip.position.x;
    camera.position.z = playerShip.position.z + 120;
    controls.target.copy(playerShip.position);
    
    if (Math.random() < 0.001) windDirection.applyAxisAngle(new THREE.Vector3(0,1,0), (Math.random() - 0.5));
    
    updateUI();

    // Random Kraken chance
    if (!kraken.isActive && bountyLevel >= 3 && Math.random() < 0.0005) {
        spawnKraken();
    }
}

function updateKraken() {
    if (!kraken.isActive) return;
    const time = performance.now() * 0.001;

    for (let i = kraken.tentacles.length - 1; i >= 0; i--) {
        const tentacle = kraken.tentacles[i];
        // Bobbing up and down
        tentacle.position.y = Math.sin(time + tentacle.userData.phase) * 10 - 5;
        tentacle.rotation.x = Math.sin(time * 0.5 + tentacle.userData.phase) * 0.3;
        
        const dist = tentacle.position.distanceTo(playerShip.position);
        if (dist < 40 && performance.now() - kraken.lastSlap > 4000) {
            playerHealth -= 15;
            createExplosion(playerShip.position);
            kraken.lastSlap = performance.now();
            updateUI();
        }

        if (tentacle.userData.health <= 0) {
            createExplosion(tentacle.position);
            scene.remove(tentacle);
            kraken.tentacles.splice(i, 1);
            kraken.health--;
        }
    }

    if (kraken.health <= 0) {
        kraken.isActive = false;
        playerGold += 1000;
        bountyLevel = 0; // Reset bounty after boss
        updateUI();
    }
}

function updateEnemies() {
    const time = performance.now();
    if (time - lastSpawnTime > 15000 && enemies.length < 5 + bountyLevel) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 300 + Math.random() * 200;
        const isGalleon = bountyLevel > 2 && Math.random() > 0.5;
        spawnEnemy(playerShip.position.x + Math.cos(angle) * dist, playerShip.position.z + Math.sin(angle) * dist, isGalleon);
        lastSpawnTime = time;
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const distToPlayer = enemy.model.position.distanceTo(playerShip.position);
        
        if (distToPlayer < 300 && playerHealth > 0) {
            enemy.model.lookAt(playerShip.position);
            enemy.model.translateZ(enemy.speed);
            
            if (distToPlayer < 100 && time - enemy.lastFired > (enemy.isGalleon ? 2000 : 3500)) {
                const dirToPlayer = playerShip.position.clone().sub(enemy.model.position).normalize();
                const enemyRight = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0,1,0), enemy.model.rotation.y);
                const fireRotation = enemy.model.rotation.y + (dirToPlayer.dot(enemyRight) > 0 ? 0 : Math.PI);
                fireCannon(enemy.model.position, fireRotation, false);
                enemy.lastFired = time;
            }
            if (enemy.speed > 0.1 && Math.random() < 0.2) spawnWake(enemy.model.position, enemy.model.rotation.y);
        } else {
            enemy.model.rotation.y += 0.005;
            enemy.model.translateZ(enemy.speed * 0.5);
        }
        
        enemy.model.position.y = Math.sin(time * 0.001 * 2 + i) * 0.5;
        
        if (enemy.health <= 0) {
            createExplosion(enemy.model.position);
            scene.remove(enemy.model);
            enemies.splice(i, 1);
            playerGold += enemy.reward;
            bountyLevel++;
            updateUI();
        }
    }
}

function updateCannonballs() {
    const playerBox = new THREE.Box3();
    if (playerHealth > 0) playerBox.setFromObject(playerShip);

    for (let i = cannonballs.length - 1; i >= 0; i--) {
        const ball = cannonballs[i];
        ball.position.add(ball.userData.velocity);
        ball.userData.velocity.y -= 0.05; 
        
        let hit = false;
        const ballBox = new THREE.Box3().setFromObject(ball);
        
        if (ball.userData.isPlayer) {
            for (let j = 0; j < enemies.length; j++) {
                const enemyBox = new THREE.Box3().setFromObject(enemies[j].model);
                if (ballBox.intersectsBox(enemyBox)) {
                    enemies[j].health -= ball.userData.damage;
                    createExplosion(ball.position);
                    hit = true; break;
                }
            }
            // Kraken hit
            if (kraken.isActive) {
                for (let j = 0; j < kraken.tentacles.length; j++) {
                    const tentacle = kraken.tentacles[j];
                    if (ball.position.distanceTo(tentacle.position) < 15) {
                        tentacle.userData.health -= ball.userData.damage;
                        createExplosion(ball.position);
                        hit = true; break;
                    }
                }
            }
        } else {
            if (playerHealth > 0 && ballBox.intersectsBox(playerBox)) {
                playerHealth -= ball.userData.damage;
                createExplosion(ball.position);
                hit = true; updateUI();
            }
        }
        
        for(let j=0; j<islands.length; j++) {
             if (ball.position.distanceTo(islands[j].group.position) < islands[j].radius) {
                 hit = true; createExplosion(ball.position);
             }
        }

        if (hit || ball.position.y <= 0) {
            scene.remove(ball);
            cannonballs.splice(i, 1);
        }
    }
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

function animate() {
    requestAnimationFrame(animate);
    water.material.uniforms['time'].value += 1.0 / 60.0;
    
    if (!shopOpen) {
        updateDayNight();
        updateShark();
        updateKraken();
        updateMinimap();
        updateWeather();
        updateLoot();
        updatePlayerShip();
        updateEnemies();
        updateCannonballs();
        updateParticles();
    }
    
    controls.update();
    renderer.render(scene, camera);
}

animate();
