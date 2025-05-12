// 1. Настройка сцены, камеры и рендерера
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020308); 
scene.fog = new THREE.FogExp2(0x020308, 0.001);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Фоновые звезды
const createStarTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(32, 32, 32, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
};

const starsGeometry = new THREE.BufferGeometry();
const starsCount = 8000;
const starsPositions = new Float32Array(starsCount * 3);

for (let i = 0; i < starsCount * 3; i++) {
  let pos = (Math.random() - 0.5) * 3300;
  starsPositions[i] = Math.abs(pos) < 200 ? pos * 2 : pos;
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
const starsMaterial = new THREE.PointsMaterial({
  map: createStarTexture(),
  size: 2.0,
  transparent: true,
  opacity: 1,
  sizeAttenuation: true,
  blending: THREE.AdditiveBlending
});
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// 3. Загрузка текстур
const textureLoader = new THREE.TextureLoader();
const textures = {
  sun: textureLoader.load('Images/sun2.jpg'),
  mercury: textureLoader.load('Images/mercury.jpg'),
  venus: textureLoader.load('Images/venus.jpg'),
  earth: textureLoader.load('Images/earth.jpg'),
  mars: textureLoader.load('Images/mars.jpg'),
  jupiter: textureLoader.load('Images/jupiter.jpg'),
  saturn: textureLoader.load('Images/saturn.jpg'),
  uranus: textureLoader.load('Images/uranus.jpg'),
  neptune: textureLoader.load('Images/neptune.jpg'),
  saturn_ring: textureLoader.load('Images/saturn_ring.png', function(texture) {
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
  })
};

// 4. Астероидный пояс с анимацией
const createAsteroidTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 48;
  canvas.height = 48;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(24, 24, 0, 24, 24, 24);
  gradient.addColorStop(0, 'rgba(180,180,180,1)');
  gradient.addColorStop(0.8, 'rgba(150,150,150,0.8)');
  gradient.addColorStop(1, 'rgba(150,150,150,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(24, 24, 24, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
};

const asteroidBelt = new THREE.Group();
const asteroidsCount =  6000;
const beltInnerRadius = 40;
const beltOuterRadius = 44;
const beltHeight = 0.6;

const asteroidMaterial = new THREE.PointsMaterial({
  map: createAsteroidTexture(),
  size: 0.05,
  transparent: true,
  opacity: 0.95,
  sizeAttenuation: true,
  alphaTest: 0.01,
  blending: THREE.AdditiveBlending
});

const asteroidsGeometry = new THREE.BufferGeometry();
const asteroidsPositions = new Float32Array(asteroidsCount * 3);
const asteroidsSpeeds = new Float32Array(asteroidsCount); // Массив скоростей для каждого астероида

for (let i = 0; i < asteroidsCount; i++) {
  const radius = beltInnerRadius + Math.random() * (beltOuterRadius - beltInnerRadius);
  const angle = Math.random() * Math.PI * 2;
  
  asteroidsPositions[i * 3] = radius * Math.cos(angle);
  asteroidsPositions[i * 3 + 1] = (Math.random() - 0.5) * beltHeight;
  asteroidsPositions[i * 3 + 2] = radius * Math.sin(angle);
  
  asteroidsSpeeds[i] = 0.00004 + Math.random() * 0.00005;
}

asteroidsGeometry.setAttribute('position', new THREE.BufferAttribute(asteroidsPositions, 3));
const asteroids = new THREE.Points(asteroidsGeometry, asteroidMaterial);
asteroidBelt.add(asteroids);
scene.add(asteroidBelt);

// 5. Создание Солнца
const sunGeometry = new THREE.SphereGeometry(3, 64, 64);
const sunMaterial = new THREE.MeshBasicMaterial({ 
  map: textures.sun,
  color: 0xffffff
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// 6. Источник света
const sunLight = new THREE.PointLight(0xffffee, 1.2, 500);
sun.add(sunLight);
scene.add(new THREE.AmbientLight(0x222222));

// 7. Цвета орбит
const orbitColors = [
  0xAAAAAA, 0xAAAAAA, 0xAAAAAA, 0xAAAAAA,
  0xAAAAAA, 0xAAAAAA, 0xAAAAAA, 0xAAAAAA
];

// 8. Данные планет
const planetData = [
  { name: 'mercury', radius: 0.38, distance: 16, texture: textures.mercury },
  { name: 'venus', radius: 0.95, distance: 19, texture: textures.venus },
  { name: 'earth', radius: 1.0, distance: 22, texture: textures.earth },
  { name: 'mars', radius: 0.53, distance: 27, texture: textures.mars },
  { name: 'jupiter', radius: 2.5, distance: 55, texture: textures.jupiter },
  { name: 'saturn', radius: 2.1, distance: 70, texture: textures.saturn, hasRings: true },
  { name: 'uranus', radius: 1.7, distance: 95, texture: textures.uranus },
  { name: 'neptune', radius: 1.6, distance: 115, texture: textures.neptune }
];

// 9. Создание планет и орбит
const planets = [];
const orbits = [];

planetData.forEach((planet, index) => {
  const orbitGeometry = new THREE.TorusGeometry(planet.distance, 0.1, 2, 100);
  const orbitMaterial = new THREE.MeshBasicMaterial({ 
    color: orbitColors[index],
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5
  });
  const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
  orbit.rotation.x = Math.PI / 2;
  orbit.userData.planetIndex = index;
  scene.add(orbit);
  orbits.push(orbit);

  const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
  const material = new THREE.MeshPhongMaterial({
    map: planet.texture,
    specular: 0x111111,
    shininess: 30
  });
  
  const planetMesh = new THREE.Mesh(geometry, material);
  const angle = (index / planetData.length) * Math.PI * 2;
  planetMesh.position.x = planet.distance * Math.cos(angle);
  planetMesh.position.z = planet.distance * Math.sin(angle);
  planetMesh.userData.isPlanet = true;
  planetMesh.userData.planetIndex = index;
  
  scene.add(planetMesh);
  planets.push(planetMesh);

  if (planet.hasRings) {
    const ringGeometry = new THREE.RingGeometry(1.5, 2.5, 64);
    const ringMaterial = new THREE.MeshPhongMaterial({
      map: textures.saturn_ring,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      alphaTest: 0.1,
      specular: 0x111111,
      shininess: 10
    });
    const rings = new THREE.Mesh(ringGeometry, ringMaterial);
    rings.rotation.x = Math.PI / 2;
    rings.rotation.y = Math.PI / 4;
    planetMesh.add(rings);
  }
});

// 10. Настройка камеры
camera.position.set(0, 10, 50);

// 11. OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 10;
controls.maxDistance = 500;

// 12. Система выбора планет
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedPlanetIndex = null;
let isPlanetSelected = false;
let currentTween = null;
const planetInfo = document.getElementById('planetInfo');
const closeBtnImg = document.querySelector('.close-btn-img');

// Информация о планетах
const planetsInfo = {
  2: { 
    name: 'Земля',
    description: 'Земля находится на расстоянии около 150 миллионов километров от Солнца. Она вращается вокруг своей оси, что приводит к смене дня и ночи. Атмосфера планеты состоит из азота, кислорода и аргона, что делает её пригодной для жизни. Разнообразие живых организмов на Земле впечатляет, включая растения, животные и микроорганизмы. Климатические условия варьируются от тропиков до арктических регионов. Земля имеет магнитное поле, защищающее её от солнечной радиации. На Земле насчитывается около 1,5 миллиона известных видов организмов. Земля также является третьей планетой от Солнца и имеет единственный естественный спутник - Луну. а планете существуют различные экосистемы, от тропических лесов до пустынь, каждая из которых играет важную роль в глобальном балансе. Человечество активно исследует космос, и на данный момент Земля остаётся единственным известным местом, где существует жизнь.',
    image: 'Images/zem.jpg',
  }
  // Добавьте информацию для других планет по аналогии
};

function showPlanetInfo(planetIndex) {
  const info = planetsInfo[planetIndex];
  if (!info) return;
  
  planetInfo.querySelector('h2').textContent = info.name;
  planetInfo.querySelector('p').textContent = info.description;
  planetInfo.querySelector('.planet-images img').src = info.image;
  planetInfo.style.display = 'block';
}

function onMouseClick(event) {
  if (currentTween) currentTween.stop();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);

  if (intersects.length > 0) {
    const planet = intersects[0].object;
    const newPlanetIndex = planet.userData.planetIndex;

    if (selectedPlanetIndex !== null && selectedPlanetIndex !== newPlanetIndex) {
      orbits[selectedPlanetIndex].visible = true;
    }

    selectedPlanetIndex = newPlanetIndex;
    isPlanetSelected = true;
    orbits[selectedPlanetIndex].visible = false;

    // Показываем информацию о планете
    showPlanetInfo(newPlanetIndex);

    const planetRadius = planet.geometry.parameters.radius;
    const planetPosition = planet.position.clone();
    const cameraOffset = new THREE.Vector3(0, planetRadius * 0.5, -planetRadius * 3);
    const targetPosition = planetPosition.clone().add(cameraOffset);

    currentTween = new TWEEN.Tween({
      camX: camera.position.x,
      camY: camera.position.y,
      camZ: camera.position.z,
      targetX: controls.target.x,
      targetY: controls.target.y,
      targetZ: controls.target.z
    })
    .to({
      camX: targetPosition.x,
      camY: targetPosition.y,
      camZ: targetPosition.z,
      targetX: planetPosition.x,
      targetY: planetPosition.y,
      targetZ: planetPosition.z
    }, 1500)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(function(obj) {
      camera.position.set(obj.camX, obj.camY, obj.camZ);
      controls.target.set(obj.targetX, obj.targetY, obj.targetZ);
      controls.update();
    })
    .onComplete(() => {
      controls.minDistance = planetRadius * 1.5;
      controls.maxDistance = planetRadius * 10;
    })
    .start();

  } else if (!isPlanetSelected) {
    orbits.forEach(orbit => orbit.visible = true);
    selectedPlanetIndex = null;
    isPlanetSelected = false;
    controls.minDistance = 10;
    controls.maxDistance = 500;
    planetInfo.style.display = 'none';
  }
}

// Обработчик закрытия окна по клику на изображение
closeBtnImg.addEventListener('click', (e) => {
  e.stopPropagation();
  planetInfo.style.display = 'none';
});

window.addEventListener('click', onMouseClick, false);

// 13. Анимация
function animate() {
  requestAnimationFrame(animate);
  
  // Вращение Солнца и планет
  sun.rotation.y += 0.005;
  planets.forEach(planet => planet.rotation.y += 0.01);
  
  // Анимация астероидного пояса
  const positions = asteroidsGeometry.attributes.position.array;
  for (let i = 0; i < asteroidsCount; i++) {
    const angle = Math.atan2(positions[i * 3 + 2], positions[i * 3]);
    const radius = Math.sqrt(positions[i * 3] * positions[i * 3] + positions[i * 3 + 2] * positions[i * 3 + 2]);
    
    const newAngle = angle + asteroidsSpeeds[i];
    positions[i * 3] = radius * Math.cos(newAngle);
    positions[i * 3 + 2] = radius * Math.sin(newAngle);
  }
  asteroidsGeometry.attributes.position.needsUpdate = true;
  
  controls.update();
  TWEEN.update();
  renderer.render(scene, camera);
}
animate();

// 14. Реакция на изменение размера окна
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});