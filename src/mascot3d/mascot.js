// 3D 羊毛毡「本人卡通形象 × 小白龙」双人实时立体互动剧场（无扭曲刚体 3D + 精准瞳孔眼神追踪版）
import * as THREE from 'three';

function createFeltPropMaterial(colorHex, emissiveHex = 0x221008) {
  return new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: emissiveHex,
    roughness: 0.92,
    metalness: 0.02,
  });
}

function createHeartMesh(mat) {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.18);
  shape.bezierCurveTo(-0.02, -0.18, -0.22, -0.02, -0.22, 0.10);
  shape.bezierCurveTo(-0.22, 0.22, -0.05, 0.25, 0, 0.12);
  shape.bezierCurveTo(0.05, 0.25, 0.22, 0.22, 0.22, 0.10);
  shape.bezierCurveTo(0.22, -0.02, 0.02, -0.18, 0, -0.18);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 0.045,
    bevelThickness: 0.045,
  });
  geo.center();
  return new THREE.Mesh(geo, mat);
}

function createStarMesh(mat) {
  const shape = new THREE.Shape();
  const outer = 0.16, inner = 0.055;
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / 8) * Math.PI * 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.05,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.03,
    bevelThickness: 0.03,
  });
  geo.center();
  return new THREE.Mesh(geo, mat);
}

// 边缘洪泛羽化抠图 + 摄影棚底色白平衡校准（100% 无缝融入 #f4f1ea 特种纸）
function buildSeamlessFeltTexture(img, extraSeeds, isSunglasses = false) {
  const w = img.width, h = img.height;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  const grad = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      const r = d[i], g = d[i + 1], bl = d[i + 2];
      const n1 = ((y - 1) * w + x) * 4, n2 = ((y + 1) * w + x) * 4;
      const n3 = (y * w + (x - 1)) * 4, n4 = (y * w + (x + 1)) * 4;
      grad[y * w + x] = Math.max(
        Math.abs(r - d[n1]) + Math.abs(g - d[n1 + 1]) + Math.abs(bl - d[n1 + 2]),
        Math.abs(r - d[n2]) + Math.abs(g - d[n2 + 1]) + Math.abs(bl - d[n2 + 2]),
        Math.abs(r - d[n3]) + Math.abs(g - d[n3 + 1]) + Math.abs(bl - d[n3 + 2]),
        Math.abs(r - d[n4]) + Math.abs(g - d[n4 + 1]) + Math.abs(bl - d[n4 + 2])
      );
    }
  }

  const isCoreInterior = (u, v) => {
    const boySweaterCore = Math.hypot((u - 0.30) / 0.085, (v - 0.76) / 0.14) < 1.0;
    const sleeveCore = !isSunglasses && Math.hypot((u - 0.43) / 0.032, (v - 0.63) / 0.032) < 1.0;
    const drgBellyCore = Math.hypot((u - 0.67) / 0.10, (v - 0.78) / 0.14) < 1.0;
    const drgHeadCore = Math.hypot((u - 0.67) / 0.11, (v - 0.51) / 0.13) < 1.0;
    return boySweaterCore || sleeveCore || drgBellyCore || drgHeadCore;
  };

  const visited = new Uint8Array(w * h);
  const isBg = new Uint8Array(w * h);
  const q = new Int32Array(w * h);
  let qH = 0, qT = 0;

  const push = (x, y) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const idx = y * w + x;
    if (visited[idx]) return;
    visited[idx] = 1;
    q[qT++] = idx;
  };

  for (let x = 0; x < w; x++) push(x, 0);
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  for (const [ux, uy] of extraSeeds) push(Math.floor(ux * w), Math.floor(uy * h));

  while (qH < qT) {
    const idx = q[qH++];
    const x = idx % w, y = (idx / w) | 0;
    const u = x / w, v = y / h;
    if (isCoreInterior(u, v)) continue;
    const i = idx * 4;
    const r = d[i], g = d[i + 1], bl = d[i + 2];
    const distBg = Math.abs(r - 238) + Math.abs(g - 231) + Math.abs(bl - 213);
    const yellowness = r - bl;

    const isOuterFloor = isSunglasses && (
      (v > 0.72 && u < 0.245) ||
      (v > 0.60 && u > 0.43 && u < 0.55) ||
      (v > 0.75 && u > 0.80) ||
      v > 0.93
    );
    const maxDist = isOuterFloor ? 95 : 32;
    const maxGrad = isOuterFloor ? 26 : 15;
    const minYellow = isOuterFloor ? 13 : 18;

    if (distBg < maxDist && yellowness >= minYellow && grad[idx] < maxGrad) {
      isBg[idx] = 1;
      push(x - 1, y); push(x + 1, y); push(x, y - 1); push(x, y + 1);
    }
  }

  const alpha = new Float32Array(w * h);
  const tmp = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) alpha[i] = isBg[i] ? 0.0 : 1.0;
  for (let pass = 0; pass < 4; pass++) {
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        tmp[idx] = (
          alpha[idx] * 4 +
          alpha[idx - 1] + alpha[idx + 1] +
          alpha[idx - w] + alpha[idx + w]
        ) * 0.125;
      }
    }
    alpha.set(tmp);
  }

  for (let i = 0; i < w * h; i++) {
    const y = (i / w) | 0;
    const r = d[i * 4], g = d[i * 4 + 1], bl = d[i * 4 + 2];
    const distBg = Math.abs(r - 238) + Math.abs(g - 231) + Math.abs(bl - 213);
    const bgSim = Math.max(0, Math.min(1, 1.0 - distBg / 38.0));

    const vBottomFade = y > h * 0.96 ? (h - 1 - y) / (h * 0.04) : 1.0;
    const a = Math.max(0, Math.min(1, ((alpha[i] - 0.12) / 0.88) * vBottomFade));
    const shift = Math.max(1.0 - a, bgSim * 0.85);
    d[i * 4] = Math.min(255, Math.round(r + (244 - r) * shift));
    d[i * 4 + 1] = Math.min(255, Math.round(g + (241 - g) * shift));
    d[i * 4 + 2] = Math.min(255, Math.round(bl + (234 - bl) * shift));
    d[i * 4 + 3] = Math.round(a * 255);
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

// 顶点着色器：移除会导致五官/眼镜拉伸变形的鼠标局部顶点剪切，仅保留自然呼吸、摸头小手微动与点击跳跃
const FELT_DUO_VERT = /* glsl */ `
uniform float uTime;
uniform float uMode;
uniform vec2 uPointer;
uniform float uHop;

varying vec2 vUv;
varying vec3 vNormal;
varying float vRelief;

float puff(vec2 uv, vec2 center, vec2 rad, float height) {
  vec2 d = (uv - center) / rad;
  float r2 = dot(d, d);
  if (r2 > 1.0) return 0.0;
  float w = 1.0 - r2;
  return height * w * sqrt(w);
}

// 仅用于计算柔和的 3D 表面法线光照，不产生破坏五官比例的高低起伏网格拉扯
float computeRelief(vec2 uv) {
  float z = 0.0;
  z = max(z, puff(uv, vec2(0.32, 0.60), vec2(0.22, 0.28), 0.35));
  z = max(z, puff(uv, vec2(0.30, 0.24), vec2(0.18, 0.28), 0.30));
  z = max(z, puff(uv, vec2(0.67, 0.48), vec2(0.20, 0.24), 0.35));
  z = max(z, puff(uv, vec2(0.68, 0.18), vec2(0.18, 0.22), 0.30));
  return z;
}

void main() {
  vUv = uv;
  float z = computeRelief(uv);
  vRelief = z;

  float eps = 0.01;
  float zx = computeRelief(uv + vec2(eps, 0.0)) - z;
  float zy = computeRelief(uv + vec2(0.0, eps)) - z;
  vec3 n = normalize(vec3(-zx * 12.0, -zy * 12.0, 1.0));

  vec3 p = position;

  float isBoy = smoothstep(0.52, 0.45, uv.x);
  float isDragon = smoothstep(0.47, 0.54, uv.x);

  // 1. 整体柔和呼吸律动（纯垂直整体起伏，五官与眼镜框保持 100% 刚性不变形）
  float boyBreath = sin(uTime * 2.2) * 0.015 * smoothstep(0.05, 0.30, uv.y) * isBoy;
  float drgBounce = sin(uTime * 2.8 - 0.6) * 0.018 * smoothstep(0.05, 0.30, uv.y) * isDragon;
  p.y += boyBreath + drgBounce;

  // 2. 模式 0：仅让搭在小白龙额头上的手掌与右侧龙鳍耳做轻柔微动，绝不拉扯脸部或眼睛
  float patWave = sin(uTime * 4.0);
  float patHandMask = exp(-dot((uv - vec2(0.50, 0.49)) / vec2(0.055, 0.065), (uv - vec2(0.50, 0.49)) / vec2(0.055, 0.065)));
  float earFinMask = exp(-dot((uv - vec2(0.84, 0.50)) / vec2(0.065, 0.075), (uv - vec2(0.84, 0.50)) / vec2(0.065, 0.075)));
  p.y += (1.0 - uMode) * patWave * 0.016 * patHandMask;
  p.y += sin(uTime * 5.2) * 0.018 * earFinMask;

  // 模式 1：仅让左侧竖起的大拇指轻微上下律动
  float thumbMask = exp(-dot((uv - vec2(0.18, 0.40)) / vec2(0.065, 0.080), (uv - vec2(0.18, 0.40)) / vec2(0.065, 0.080)));
  p.y += uMode * abs(sin(uTime * 4.4)) * 0.022 * thumbMask;

  // 3. 点击时的整体 Q 弹跳跃
  if (uHop > 0.001) {
    float jumpArc = sin(uHop * 3.14159265);
    p.y += jumpArc * 0.20;
  }

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  vNormal = normalize(normalMatrix * n);
  gl_Position = projectionMatrix * mvPosition;
}
`;

// 片段着色器：仅眼球内部瞳孔与星光跟随鼠标移动，眼眶、眼镜框与脸部轮廓 100% 不变形
const FELT_DUO_FRAG = /* glsl */ `
precision highp float;

uniform sampler2D uTexInteract;
uniform sampler2D uTexSunglasses;
uniform float uMode;
uniform float uTime;
uniform vec2 uPointer;
uniform float uBlinkBoy;
uniform float uBlinkDragon;

varying vec2 vUv;
varying vec3 vNormal;
varying float vRelief;

// 精准瞳孔视线追踪：仅对眼珠内部区域做平滑位移，不拉扯眼眶边缘或黑框眼镜
void shiftEyeGaze(
  inout vec2 sampleUv,
  vec2 uv,
  vec2 eyeCenter,
  vec2 eyeRadius,
  vec2 gazeShift,
  float blinkAmount
) {
  vec2 d = (uv - eyeCenter) / eyeRadius;
  float r2 = dot(d, d);
  if (r2 < 1.0) {
    // 三次平滑衰减，确保在眼珠边界处位移严格归零，绝不波及眼周皮肤与镜框
    float w = 1.0 - r2;
    float falloff = w * w * w;
    sampleUv -= gazeShift * falloff;
    if (blinkAmount > 0.01 && d.y > -0.5) {
      sampleUv.y += blinkAmount * 0.018 * falloff;
    }
  }
}

void main() {
  vec2 uvI = vUv;
  vec2 uvS = vUv;

  vec2 boyGaze = clamp(uPointer, -1.0, 1.0) * vec2(0.0065, 0.0050);
  vec2 drgGaze = clamp(uPointer, -1.0, 1.0) * vec2(0.0085, 0.0065);

  // 模式 0（摸摸头）4 只眼睛的精准内瞳孔半径（严格限制在眼珠内部，绝不触碰眼镜框）
  shiftEyeGaze(uvI, vUv, vec2(0.3017, 0.5759), vec2(0.023, 0.030), boyGaze, uBlinkBoy);
  shiftEyeGaze(uvI, vUv, vec2(0.4150, 0.5920), vec2(0.022, 0.029), boyGaze, uBlinkBoy);
  shiftEyeGaze(uvI, vUv, vec2(0.5733, 0.5022), vec2(0.020, 0.035), drgGaze, uBlinkDragon);
  shiftEyeGaze(uvI, vUv, vec2(0.6917, 0.4542), vec2(0.032, 0.036), drgGaze, uBlinkDragon);

  // 模式 1（墨镜比赞）男孩双眼坐标
  shiftEyeGaze(uvS, vUv, vec2(0.2917, 0.5871), vec2(0.023, 0.030), boyGaze, uBlinkBoy);
  shiftEyeGaze(uvS, vUv, vec2(0.4033, 0.5938), vec2(0.022, 0.029), boyGaze, uBlinkBoy);

  vec4 colI = texture2D(uTexInteract, uvI);
  vec4 colS = texture2D(uTexSunglasses, uvS);

  // 模式 1 下小白龙黑色墨镜的动态高光扫光
  float glassL = exp(-dot((vUv - vec2(0.58, 0.52)) / vec2(0.06, 0.05), (vUv - vec2(0.58, 0.52)) / vec2(0.06, 0.05)));
  float glassR = exp(-dot((vUv - vec2(0.72, 0.51)) / vec2(0.06, 0.05), (vUv - vec2(0.72, 0.51)) / vec2(0.06, 0.05)));
  float sheenBand = smoothstep(0.06, 0.0, abs((vUv.x + vUv.y * 0.65) - (0.95 + sin(uTime * 1.8) * 0.22 + uPointer.x * 0.12)));
  colS.rgb += vec3(1.0, 0.98, 0.92) * sheenBand * max(glassL, glassR) * 0.30;

  vec4 base = mix(colI, colS, uMode);
  if (base.a < 0.01) discard;

  // 3D 羊毛毡动态光影跟随鼠标移动（颜色与高光追踪鼠标，人物几何形状完全不扭曲）
  vec3 N = normalize(vNormal);
  vec3 L = normalize(vec3(uPointer.x * 0.70 - 0.20, uPointer.y * 0.60 + 0.45, 1.0));
  vec3 V = normalize(vec3(0.0, 0.0, 1.0));
  float diff = dot(N, L) * 0.5 + 0.5;
  float rim = pow(1.0 - max(0.0, dot(N, V)), 2.2) * smoothstep(0.05, 0.30, vRelief);
  float lightWeight = smoothstep(0.08, 0.28, vRelief);

  vec3 litColor = base.rgb * (1.0 + (diff - 0.5) * 0.09 * lightWeight) + vec3(1.0, 0.95, 0.86) * rim * 0.12;
  gl_FragColor = vec4(litColor, base.a);
}
`;

export function mountMascot3D(canvas, options = {}) {
  if (!canvas) return null;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
    premultipliedAlpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0xf4f1ea, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 4 / 3, 0.1, 30);
  camera.position.set(0, 0.0, 6.2);
  camera.lookAt(0, 0.0, 0);

  const hemi = new THREE.HemisphereLight(0xfff8ee, 0xd8cbb8, 1.35);
  scene.add(hemi);
  const dirLight = new THREE.DirectionalLight(0xfff2dd, 1.2);
  dirLight.position.set(-2.2, 3.0, 4.0);
  scene.add(dirLight);

  const stageGroup = new THREE.Group();
  scene.add(stageGroup);

  const shadowGeo = new THREE.PlaneGeometry(3.5, 0.55);
  const shadowMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `varying vec2 vUv; void main(){
      vec2 d = (vUv - 0.5) * 2.0;
      float a = smoothstep(1.0, 0.1, dot(d, d)) * 0.13;
      gl_FragColor = vec4(0.18, 0.14, 0.10, a);
    }`,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.set(0.02, -1.36, -0.1);
  stageGroup.add(shadowMesh);

  const dummyCanvas = document.createElement('canvas');
  dummyCanvas.width = 2; dummyCanvas.height = 2;
  const dummyTex = new THREE.CanvasTexture(dummyCanvas);

  const uniforms = {
    uTexInteract: { value: dummyTex },
    uTexSunglasses: { value: dummyTex },
    uTime: { value: 0 },
    uMode: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uHop: { value: 0 },
    uBlinkBoy: { value: 0 },
    uBlinkDragon: { value: 0 },
  };

  const reliefGeo = new THREE.PlaneGeometry(4.25, 3.16, 120, 90);
  const reliefMat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: FELT_DUO_VERT,
    fragmentShader: FELT_DUO_FRAG,
    transparent: true,
  });
  const reliefMesh = new THREE.Mesh(reliefGeo, reliefMat);
  reliefMesh.position.set(0, 0.04, 0);
  stageGroup.add(reliefMesh);

  // 3D 羊毛毡漂浮互动道具
  const heartMat = createFeltPropMaterial(0xff5238, 0x330804);
  const starMat = createFeltPropMaterial(0xffcf33, 0x332200);
  const mintStarMat = createFeltPropMaterial(0x5cd69c, 0x082818);

  const floatingProps = [];
  const mainHeart = createHeartMesh(heartMat);
  mainHeart.position.set(0.05, 0.56, 0.25);
  mainHeart.scale.setScalar(0.62);
  stageGroup.add(mainHeart);
  floatingProps.push({ mesh: mainHeart, basePos: mainHeart.position.clone(), baseScale: 0.62, speed: 2.6, phase: 0.0 });

  const starR = createStarMesh(starMat);
  starR.position.set(1.42, 0.72, 0.20);
  starR.scale.setScalar(0.58);
  stageGroup.add(starR);
  floatingProps.push({ mesh: starR, basePos: starR.position.clone(), baseScale: 0.58, speed: 2.1, phase: 1.5 });

  const starL = createStarMesh(mintStarMat);
  starL.position.set(-1.46, 0.68, 0.20);
  starL.scale.setScalar(0.50);
  stageGroup.add(starL);
  floatingProps.push({ mesh: starL, basePos: starL.position.clone(), baseScale: 0.50, speed: 2.4, phase: 3.1 });

  const basePath = options.assetBase || 'assets/';
  const loadImage = (url) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

  Promise.all([
    loadImage(`${basePath}duo_interact.jpg`),
    loadImage(`${basePath}duo_sunglasses.jpg`),
  ]).then(([img1, img2]) => {
    uniforms.uTexInteract.value = buildSeamlessFeltTexture(img1, [[0.46, 0.82], [0.55, 0.88]], false);
    uniforms.uTexSunglasses.value = buildSeamlessFeltTexture(img2, [[0.49, 0.80], [0.50, 0.96]], true);
    if (typeof options.onReady === 'function') options.onReady();
  }).catch(() => {
    Promise.all([
      loadImage('/assets/duo_interact.jpg'),
      loadImage('/assets/duo_sunglasses.jpg'),
    ]).then(([img1, img2]) => {
      uniforms.uTexInteract.value = buildSeamlessFeltTexture(img1, [[0.46, 0.82], [0.55, 0.88]], false);
      uniforms.uTexSunglasses.value = buildSeamlessFeltTexture(img2, [[0.49, 0.80], [0.50, 0.96]], true);
      if (typeof options.onReady === 'function') options.onReady();
    });
  });

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, rect.width || 560);
    const h = Math.max(1, rect.height || 420);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const pointerTarget = new THREE.Vector2(0, 0);
  const pointerCur = new THREE.Vector2(0, 0);
  let targetMode = 0;
  let curMode = 0;
  let hopTime = -1;

  let nextBoyBlink = 2.0;
  let boyBlinkStart = -1;
  let nextDrgBlink = 2.8;
  let drgBlinkStart = -1;

  function onMove(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.48;
    const nx = Math.max(-1, Math.min(1, (clientX - cx) / (window.innerWidth * 0.42)));
    const ny = Math.max(-1, Math.min(1, (cy - clientY) / (window.innerHeight * 0.42)));
    pointerTarget.set(nx, ny);
  }
  window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY), { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  function triggerHappy(toggleMode = true) {
    hopTime = 0.001;
    if (toggleMode) {
      targetMode = targetMode === 0 ? 1 : 0;
    }
    return targetMode;
  }

  const clock = new THREE.Clock();
  let rafId = 0;

  function tick() {
    rafId = requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    uniforms.uTime.value = t;

    pointerCur.lerp(pointerTarget, Math.min(1, dt * 7.5));
    uniforms.uPointer.value.copy(pointerCur);

    curMode += (targetMode - curMode) * Math.min(1, dt * 8.0);
    uniforms.uMode.value = curMode;

    // 取消会导致透视拉伸的旋转，保持人物比例在任何鼠标位置下 100% 端正不变形
    stageGroup.rotation.y = 0;
    stageGroup.rotation.x = 0;

    if (hopTime >= 0) {
      hopTime += dt * 1.9;
      if (hopTime >= 1.0) {
        hopTime = -1;
        uniforms.uHop.value = 0;
        stageGroup.rotation.z = 0;
      } else {
        uniforms.uHop.value = hopTime;
        stageGroup.rotation.z = Math.sin(hopTime * Math.PI * 2) * 0.03;
      }
    }

    if (t > nextBoyBlink && boyBlinkStart < 0) {
      boyBlinkStart = t;
      nextBoyBlink = t + 2.6 + Math.random() * 2.4;
    }
    if (boyBlinkStart >= 0) {
      const bp = (t - boyBlinkStart) / 0.16;
      if (bp >= 1) {
        boyBlinkStart = -1;
        uniforms.uBlinkBoy.value = 0;
      } else {
        uniforms.uBlinkBoy.value = Math.sin(bp * Math.PI);
      }
    }

    if (t > nextDrgBlink && drgBlinkStart < 0) {
      drgBlinkStart = t;
      nextDrgBlink = t + 2.2 + Math.random() * 2.5;
    }
    if (drgBlinkStart >= 0) {
      const dp = (t - drgBlinkStart) / 0.15;
      if (dp >= 1) {
        drgBlinkStart = -1;
        uniforms.uBlinkDragon.value = 0;
      } else {
        uniforms.uBlinkDragon.value = Math.sin(dp * Math.PI);
      }
    }

    const burst = hopTime > 0 ? Math.sin(hopTime * Math.PI) * 0.35 : 0;
    for (const item of floatingProps) {
      item.mesh.position.y = item.basePos.y + Math.sin(t * item.speed + item.phase) * 0.08 + burst;
      item.mesh.position.x = item.basePos.x + pointerCur.x * 0.06;
      item.mesh.rotation.y = Math.sin(t * 1.5 + item.phase) * 0.38 + pointerCur.x * 0.35;
      item.mesh.rotation.z = Math.cos(t * 1.8 + item.phase) * 0.16;
      const pulse = 1.0 + Math.sin(t * 3.2 + item.phase) * 0.08 + burst * 0.8;
      item.mesh.scale.setScalar(item.baseScale * pulse);
    }

    renderer.render(scene, camera);
  }
  tick();

  return {
    triggerHappy,
    setPointer(x, y) {
      pointerTarget.set(x, y);
      pointerCur.set(x, y);
    },
    setMode(m) {
      targetMode = m ? 1 : 0;
    },
    dispose() {
      cancelAnimationFrame(rafId);
      renderer.dispose();
    },
  };
}

if (typeof window !== 'undefined') {
  window.mountMascot3D = mountMascot3D;
  const autoCanvas = document.getElementById('mascot3d');
  if (autoCanvas && !window.__mascot) {
    window.__mascot = mountMascot3D(autoCanvas, {
      onReady() {
        document.body.classList.add('mascot-ready');
      },
    });
  }
}
