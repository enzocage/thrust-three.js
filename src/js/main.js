import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.139.0/build/three.module.js';

// Konstanten
const GRAVITY = 0.005;
const THRUST_POWER = 0.01;
const ROTATION_SPEED = 0.05;
const FRICTION = 0.99;
const FUEL_CONSUMPTION = 0.2;
const INITIAL_LIVES = 3;
const INITIAL_FUEL = 100;

// Spielzustand
let gameState = {
    lives: INITIAL_LIVES,
    fuel: INITIAL_FUEL,
    score: 0,
    level: 1,
    isGameOver: false,
    isLevelComplete: false,
    capsuleAttached: false,
    inverseGravity: false,
    invisibleWalls: false
};

// Hauptklassen
class Spaceship {
    constructor() {
        const geometry = new THREE.ConeGeometry(0.5, 1, 4);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.z = -Math.PI / 2; // Spitze zeigt nach rechts
        this.velocity = new THREE.Vector2(0, 0);
        this.rotation = 0;
        this.thrust = false;
        this.shield = false;
        
        // Thruster-Effekt
        this.thrusterGeometry = new THREE.ConeGeometry(0.3, 0.6, 4);
        this.thrusterMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600, wireframe: true });
        this.thruster = new THREE.Mesh(this.thrusterGeometry, this.thrusterMaterial);
        this.thruster.position.x = -0.8;
        this.thruster.rotation.z = Math.PI / 2;
        this.thruster.visible = false;
        this.mesh.add(this.thruster);
        
        // Schild-Effekt
        const shieldGeometry = new THREE.CircleGeometry(0.8, 16);
        const shieldMaterial = new THREE.MeshBasicMaterial({ color: 0x3399ff, transparent: true, opacity: 0.5, wireframe: true });
        this.shieldMesh = new THREE.Mesh(shieldGeometry, shieldMaterial);
        this.shieldMesh.visible = false;
        this.mesh.add(this.shieldMesh);
    }
    
    update() {
        if (gameState.isGameOver) return;
        
        // Physik-Update
        if (this.thrust && gameState.fuel > 0) {
            const angle = this.mesh.rotation.z + Math.PI / 2;
            this.velocity.x += Math.cos(angle) * THRUST_POWER;
            this.velocity.y += Math.sin(angle) * THRUST_POWER;
            gameState.fuel -= FUEL_CONSUMPTION;
            this.thruster.visible = true;
        } else {
            this.thruster.visible = false;
        }
        
        // Schwerkraft anwenden
        const gravityDirection = gameState.inverseGravity ? 1 : -1;
        this.velocity.y += GRAVITY * gravityDirection;
        
        // Reibung
        this.velocity.x *= FRICTION;
        this.velocity.y *= FRICTION;
        
        // Position aktualisieren
        this.mesh.position.x += this.velocity.x;
        this.mesh.position.y += this.velocity.y;
        
        // Schild-Update
        this.shieldMesh.visible = this.shield;
    }
    
    rotateLeft() {
        this.mesh.rotation.z += ROTATION_SPEED;
    }
    
    rotateRight() {
        this.mesh.rotation.z -= ROTATION_SPEED;
    }
    
    activateShield() {
        this.shield = true;
    }
    
    deactivateShield() {
        this.shield = false;
    }
    
    shoot() {
        if (gameState.isGameOver) return null;
        
        const angle = this.mesh.rotation.z + Math.PI / 2;
        const bullet = new Bullet(
            this.mesh.position.x, 
            this.mesh.position.y,
            Math.cos(angle) * 0.3,
            Math.sin(angle) * 0.3
        );
        return bullet;
    }
}

class Bullet {
    constructor(x, y, vx, vy) {
        const geometry = new THREE.CircleGeometry(0.1, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, 0);
        this.velocity = new THREE.Vector2(vx, vy);
        this.lifespan = 60; // Frames, bis die Kugel verschwindet
    }
    
    update() {
        this.mesh.position.x += this.velocity.x;
        this.mesh.position.y += this.velocity.y;
        this.lifespan--;
        return this.lifespan > 0;
    }
}

class FuelCapsule {
    constructor(x, y) {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xff3300, wireframe: true });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, 0);
        this.mesh.rotation.z = Math.PI / 2;
        this.attached = false;
        this.tractorBeam = null;
    }
    
    update(spaceship) {
        if (this.attached && spaceship) {
            // Erstelle Traktorstrahl, wenn noch nicht vorhanden
            if (!this.tractorBeam) {
                const beamGeometry = new THREE.CylinderGeometry(0.05, 0.05, 5, 4);
                const beamMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 });
                this.tractorBeam = new THREE.Mesh(beamGeometry, beamMaterial);
                scene.add(this.tractorBeam);
            }
            
            // Berechne Abstand und Position
            const dx = spaceship.mesh.position.x - this.mesh.position.x;
            const dy = spaceship.mesh.position.y - this.mesh.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Aktualisiere Traktorstrahl
            this.tractorBeam.position.x = (spaceship.mesh.position.x + this.mesh.position.x) / 2;
            this.tractorBeam.position.y = (spaceship.mesh.position.y + this.mesh.position.y) / 2;
            this.tractorBeam.scale.y = distance / 5;
            this.tractorBeam.rotation.z = Math.atan2(dy, dx) - Math.PI / 2;
            
            // Kapsel folgt dem Raumschiff mit Verzögerung
            this.mesh.position.x += dx * 0.05;
            this.mesh.position.y += dy * 0.05;
        }
    }
    
    attach(spaceship) {
        this.attached = true;
    }
    
    detach() {
        this.attached = false;
        if (this.tractorBeam) {
            scene.remove(this.tractorBeam);
            this.tractorBeam = null;
        }
    }
}

class Turret {
    constructor(x, y) {
        const baseGeometry = new THREE.BoxGeometry(1, 0.5, 1);
        const baseMaterial = new THREE.MeshBasicMaterial({ color: 0x666666, wireframe: true });
        this.base = new THREE.Mesh(baseGeometry, baseMaterial);
        this.base.position.set(x, y, 0);
        
        const gunGeometry = new THREE.BoxGeometry(0.8, 0.3, 0.3);
        const gunMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        this.gun = new THREE.Mesh(gunGeometry, gunMaterial);
        this.gun.position.set(0.5, 0.3, 0);
        this.base.add(this.gun);
        
        this.fireRate = 120; // Frames zwischen Schüssen
        this.fireCounter = Math.random() * this.fireRate;
        this.active = true;
    }
    
    update(spaceship) {
        if (!this.active || gameState.isGameOver) return null;
        
        // Auf Raumschiff zielen
        if (spaceship) {
            const dx = spaceship.mesh.position.x - this.base.position.x;
            const dy = spaceship.mesh.position.y - this.base.position.y;
            this.gun.rotation.z = Math.atan2(dy, dx);
        }
        
        // Feuern
        this.fireCounter++;
        if (this.fireCounter >= this.fireRate) {
            this.fireCounter = 0;
            return this.shoot();
        }
        
        return null;
    }
    
    shoot() {
        const angle = this.gun.rotation.z;
        const x = this.base.position.x + Math.cos(angle) * 0.8;
        const y = this.base.position.y + Math.sin(angle) * 0.8;
        
        const bullet = new Bullet(x, y, Math.cos(angle) * 0.15, Math.sin(angle) * 0.15);
        bullet.mesh.material.color.set(0xff0000);
        return bullet;
    }
    
    deactivate() {
        this.active = false;
        this.gun.material.color.set(0x333333);
    }
}

class PowerPlant {
    constructor(x, y) {
        const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const material = new THREE.MeshBasicMaterial({ color: 0x0066ff, wireframe: true });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, 0);
        
        this.health = 3;
        this.meltdown = false;
        this.meltdownTimer = 600; // 10 Sekunden bei 60 FPS
    }
    
    hit() {
        this.health--;
        
        if (this.health <= 0) {
            this.startMeltdown();
            return true;
        }
        
        // Farbe ändert sich mit Gesundheit
        switch(this.health) {
            case 2:
                this.mesh.material.color.set(0xff9900);
                break;
            case 1:
                this.mesh.material.color.set(0xff0000);
                break;
        }
        
        return false;
    }
    
    startMeltdown() {
        this.meltdown = true;
        this.mesh.material.color.set(0xff00ff);
    }
    
    update() {
        if (this.meltdown) {
            this.meltdownTimer--;
            
            // Pulsieren während Kernschmelze
            const scale = 1 + 0.1 * Math.sin(Date.now() * 0.01);
            this.mesh.scale.set(scale, scale, scale);
            
            return this.meltdownTimer <= 0;
        }
        return false;
    }
}

class FuelTank {
    constructor(x, y) {
        const geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.6, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, 0);
        this.mesh.rotation.z = Math.PI / 2;
        this.collected = false;
    }
}

class Door {
    constructor(x, y, width, height) {
        const geometry = new THREE.BoxGeometry(width, height, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, 0);
        
        this.open = false;
        this.timer = 0;
        this.closeTime = 300; // 5 Sekunden bei 60 FPS
    }
    
    hit() {
        this.open = true;
        this.timer = this.closeTime;
    }
    
    update() {
        if (this.open) {
            this.timer--;
            if (this.timer <= 0) {
                this.open = false;
            }
        }
        
        // Visuelles Feedback
        this.mesh.visible = !this.open;
    }
}

// Level-Designer-Klasse
class LevelDesigner {
    constructor() {
        this.levels = [];
        this.createLevels();
    }
    
    createLevels() {
        // Level 1
        const level1 = {
            walls: [
                { x: 0, y: -10, width: 30, height: 1 },  // Boden
                { x: 0, y: 10, width: 30, height: 1 },   // Decke
                { x: -15, y: 0, width: 1, height: 20 },  // Linke Wand
                { x: 15, y: 0, width: 1, height: 20 },   // Rechte Wand
                { x: -10, y: -5, width: 5, height: 1 },  // Plattform 1
                { x: 5, y: -3, width: 7, height: 1 }     // Plattform 2
            ],
            turrets: [
                { x: -10, y: -4 },
                { x: 10, y: -9 }
            ],
            powerPlants: [
                { x: -12, y: -8 }
            ],
            fuelTanks: [
                { x: 0, y: -9 }
            ],
            doors: [
                { x: 5, y: 0, width: 1, height: 5 }
            ],
            fuelCapsule: { x: 10, y: -5 },
            playerStart: { x: -13, y: 8 },
            inverseGravity: false,
            invisibleWalls: false
        };
        
        this.levels.push(level1);
        
        // Weitere Level hier hinzufügen...
    }
    
    getLevel(index) {
        if (index >= 0 && index < this.levels.length) {
            return this.levels[index];
        }
        return null;
    }
}

// Initialisierung von Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Spielobjekte
let spaceship;
let walls = [];
let bullets = [];
let turrets = [];
let powerPlants = [];
let fuelTanks = [];
let doors = [];
let fuelCapsule;
let levelDesigner;

// Steuerungszustand
const keys = {
    a: false,
    s: false,
    control: false,
    enter: false,
    space: false
};

// Initialisieren des Spiels
function init() {
    scene.background = new THREE.Color(0x000022);
    
    // Kamera-Position
    camera.position.z = 15;
    
    // Level-Designer erstellen
    levelDesigner = new LevelDesigner();
    
    // Raumschiff erstellen
    spaceship = new Spaceship();
    scene.add(spaceship.mesh);
    
    // Event-Listener
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Level laden
    loadLevel(1);
    
    // Animation starten
    animate();
}

// Level laden
function loadLevel(levelIndex) {
    // Szene zurücksetzen
    resetScene();
    
    // Level-Daten abrufen
    const levelData = levelDesigner.getLevel(levelIndex - 1);
    if (!levelData) {
        console.error('Level nicht gefunden:', levelIndex);
        return;
    }
    
    // Spielzustand aktualisieren
    gameState.level = levelIndex;
    gameState.inverseGravity = levelData.inverseGravity;
    gameState.invisibleWalls = levelData.invisibleWalls;
    
    // Raumschiff-Position
    spaceship.mesh.position.set(levelData.playerStart.x, levelData.playerStart.y, 0);
    spaceship.velocity.set(0, 0);
    
    // Wände erstellen
    levelData.walls.forEach(wallData => {
        const wall = createWall(wallData.x, wallData.y, wallData.width, wallData.height);
        walls.push(wall);
        scene.add(wall);
    });
    
    // Geschütztürme erstellen
    levelData.turrets.forEach(turretData => {
        const turret = new Turret(turretData.x, turretData.y);
        turrets.push(turret);
        scene.add(turret.base);
    });
    
    // Kraftwerke erstellen
    levelData.powerPlants.forEach(plantData => {
        const plant = new PowerPlant(plantData.x, plantData.y);
        powerPlants.push(plant);
        scene.add(plant.mesh);
    });
    
    // Treibstofftanks erstellen
    levelData.fuelTanks.forEach(tankData => {
        const tank = new FuelTank(tankData.x, tankData.y);
        fuelTanks.push(tank);
        scene.add(tank.mesh);
    });
    
    // Türen erstellen
    levelData.doors.forEach(doorData => {
        const door = new Door(doorData.x, doorData.y, doorData.width, doorData.height);
        doors.push(door);
        scene.add(door.mesh);
    });
    
    // Treibstoffkapsel erstellen
    fuelCapsule = new FuelCapsule(levelData.fuelCapsule.x, levelData.fuelCapsule.y);
    scene.add(fuelCapsule.mesh);
}

// Wand erstellen
function createWall(x, y, width, height) {
    const geometry = new THREE.BoxGeometry(width, height, 1);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        wireframe: true,
        visible: !gameState.invisibleWalls
    });
    const wall = new THREE.Mesh(geometry, material);
    wall.position.set(x, y, 0);
    return wall;
}

// Szene zurücksetzen
function resetScene() {
    // Alte Objekte entfernen
    walls.forEach(wall => scene.remove(wall));
    turrets.forEach(turret => scene.remove(turret.base));
    powerPlants.forEach(plant => scene.remove(plant.mesh));
    fuelTanks.forEach(tank => scene.remove(tank.mesh));
    doors.forEach(door => scene.remove(door.mesh));
    if (fuelCapsule) {
        fuelCapsule.detach();
        scene.remove(fuelCapsule.mesh);
    }
    bullets.forEach(bullet => scene.remove(bullet.mesh));
    
    // Arrays zurücksetzen
    walls = [];
    turrets = [];
    powerPlants = [];
    fuelTanks = [];
    doors = [];
    bullets = [];
    fuelCapsule = null;
}

// Spielstatistiken aktualisieren
function updateStats() {
    const statsElement = document.getElementById('stats');
    statsElement.textContent = `Leben: ${Math.max(0, Math.floor(gameState.lives))} | Treibstoff: ${Math.max(0, Math.floor(gameState.fuel))} | Punkte: ${gameState.score}`;
}

// Kollisionserkennung zwischen zwei Objekten
function checkCollision(obj1, obj2) {
    const pos1 = obj1.position || obj1.mesh.position;
    const pos2 = obj2.position || obj2.mesh.position;
    
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < 1; // Einfache Abstandsprüfung
}

// Tastatursteuerung
function handleKeyDown(event) {
    switch(event.key.toLowerCase()) {
        case 'a': keys.a = true; break;
        case 's': keys.s = true; break;
        case 'control': case 'ctrl': keys.control = true; break;  // Beide Varianten unterstützen
        case 'enter': keys.enter = true; break;
        case ' ': keys.space = true; break;
    }
}

function handleKeyUp(event) {
    switch(event.key.toLowerCase()) {
        case 'a': keys.a = false; break;
        case 's': keys.s = false; break;
        case 'control': case 'ctrl': keys.control = false; break;  // Beide Varianten unterstützen
        case 'enter': keys.enter = false; break;
        case ' ': keys.space = false; break;
    }
}

// Animation
function animate() {
    requestAnimationFrame(animate);
    
    // Steuerung
    if (!gameState.isGameOver) {
        if (keys.a) spaceship.rotateLeft();
        if (keys.s) spaceship.rotateRight();
        spaceship.thrust = keys.control;
        
        if (keys.space) {
            spaceship.activateShield();
            
            // Prüfe auf Kapsel in der Nähe zum Sammeln
            if (fuelCapsule && !fuelCapsule.attached && checkCollision(spaceship.mesh, fuelCapsule.mesh)) {
                fuelCapsule.attach(spaceship);
                gameState.capsuleAttached = true;
            }
        } else {
            spaceship.deactivateShield();
        }
        
        // Schießen (nur einmal pro Tastendruck)
        if (keys.enter) {
            if (!lastShot) {
                const bullet = spaceship.shoot();
                if (bullet) {
                    bullets.push(bullet);
                    scene.add(bullet.mesh);
                }
                lastShot = true;
            }
        } else {
            lastShot = false;
        }
    }
    
    // Updates
    spaceship.update();
    
    if (fuelCapsule) {
        fuelCapsule.update(spaceship);
    }
    
    // Geschütztürme aktualisieren
    turrets.forEach(turret => {
        const bullet = turret.update(spaceship);
        if (bullet) {
            bullets.push(bullet);
            scene.add(bullet.mesh);
        }
    });
    
    // Kraftwerke aktualisieren
    let meltdownComplete = false;
    powerPlants.forEach(plant => {
        if (plant.update()) {
            meltdownComplete = true;
        }
    });
    
    // Kraftwerk-Kernschmelze beendet -> Level sofort beenden
    if (meltdownComplete) {
        gameState.isLevelComplete = true;
        gameState.score += 1000; // Bonuspunkte für Flucht während Kernschmelze
    }
    
    // Türen aktualisieren
    doors.forEach(door => {
        door.update();
    });
    
    // Projektile aktualisieren
    for (let i = bullets.length - 1; i >= 0; i--) {
        const alive = bullets[i].update();
        
        // Prüfe auf Kollision mit Wänden
        let hitWall = false;
        walls.forEach(wall => {
            if (checkCollision(bullets[i].mesh, wall)) {
                hitWall = true;
            }
        });
        
        // Prüfe auf Kollision mit Türen
        doors.forEach(door => {
            if (!door.open && checkCollision(bullets[i].mesh, door.mesh)) {
                door.hit();
                hitWall = true;
            }
        });
        
        // Prüfe auf Kollision mit Kraftwerken
        powerPlants.forEach(plant => {
            if (checkCollision(bullets[i].mesh, plant.mesh)) {
                plant.hit();
                hitWall = true;
                
                // Deaktiviere alle Geschütztürme bei Kernschmelze
                if (plant.meltdown) {
                    turrets.forEach(turret => turret.deactivate());
                }
            }
        });
        
        // Prüfe auf Kollision mit Raumschiff (nur Geschützturm-Projektile)
        if (bullets[i].mesh.material.color.getHex() === 0xff0000) {
            if (checkCollision(bullets[i].mesh, spaceship.mesh)) {
                if (!spaceship.shield) {
                    gameState.lives -= 1;
                    hitWall = true;
                    
                    if (gameState.lives <= 0) {
                        gameState.isGameOver = true;
                    }
                } else {
                    // Schild reflektiert das Projektil
                    bullets[i].velocity.x *= -1;
                    bullets[i].velocity.y *= -1;
                    bullets[i].mesh.material.color.set(0xffff00);
                }
            }
        }
        
        // Entferne Projektile, die nicht mehr leben oder an Wänden kollidiert sind
        if (!alive || hitWall) {
            scene.remove(bullets[i].mesh);
            bullets.splice(i, 1);
        }
    }
    
    // Prüfe auf Kollision mit Wänden
    walls.forEach(wall => {
        if (checkCollision(spaceship.mesh, wall)) {
            gameState.lives -= 0.5;
            
            // Zurückschleudern
            spaceship.velocity.x *= -0.5;
            spaceship.velocity.y *= -0.5;
            
            if (gameState.lives <= 0) {
                gameState.isGameOver = true;
            }
        }
    });
    
    // Prüfe auf Treibstofftanks
    for (let i = fuelTanks.length - 1; i >= 0; i--) {
        if (!fuelTanks[i].collected && checkCollision(spaceship.mesh, fuelTanks[i].mesh)) {
            gameState.fuel = Math.min(gameState.fuel + 50, 100);
            fuelTanks[i].collected = true;
            scene.remove(fuelTanks[i].mesh);
            fuelTanks.splice(i, 1);
        }
    }
    
    // Prüfe auf Level-Abschluss (Kapsel außerhalb des Spielfelds)
    if (gameState.capsuleAttached && 
        (spaceship.mesh.position.y > 11 || spaceship.mesh.position.y < -11 ||
         spaceship.mesh.position.x > 16 || spaceship.mesh.position.x < -16)) {
        gameState.isLevelComplete = true;
        gameState.score += 500;
    }
    
    // Level abgeschlossen
    if (gameState.isLevelComplete) {
        loadLevel(gameState.level + 1);
        gameState.isLevelComplete = false;
        gameState.capsuleAttached = false;
        gameState.fuel = INITIAL_FUEL;
    }
    
    // Game Over
    if (gameState.isGameOver) {
        document.getElementById('info').textContent = "GAME OVER - Drücke F5 zum Neustarten";
    }
    
    // Statistiken aktualisieren
    updateStats();
    
    renderer.render(scene, camera);
}

// Variable für die Schussmechanik
let lastShot = false;

// Spiel starten
init(); 