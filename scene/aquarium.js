import * as THREE from 'three';

// An intentionally self-contained scene: the surrounding page owns its welcome
// copy and Enter button, and can retire this renderer as soon as they are used.
export function initAquarium({ canvas, container }) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const smallScreen = window.matchMedia('(max-width: 700px)');
  const mobile = smallScreen.matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.setClearColor(0x056985);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x065267, 0.029);
  const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 100);
  camera.position.set(0, 2.7, 19);
  camera.lookAt(0, 1.5, -1);

  const resources = new Set();
  const track = resource => { resources.add(resource); return resource; };
  const geometry = value => track(value);
  const material = value => track(value);
  const time = { value: 0 };
  let width = 1, height = 1, halfWidth = 10, paused = false, disposed = false, raf = 0;
  let elapsed = 0, previousTime = 0;
  const pointer = new THREE.Vector2();
  const cameraDrift = new THREE.Vector2();

  // Deterministic placement keeps the first visit as composed as every refresh.
  let seed = 84017;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const between = (min, max) => min + random() * (max - min);

  scene.add(new THREE.HemisphereLight(0xb7e9e3, 0x183743, 1.45));
  const sun = new THREE.DirectionalLight(0xd7fff4, 2.65);
  sun.position.set(-7, 16, 9);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0x259be7, 1.15);
  fill.position.set(10, 3, -6);
  scene.add(fill);
  const warm = new THREE.DirectionalLight(0xffdfa5, 2.4);
  warm.position.set(3, 6, 13);
  scene.add(warm);

  // A light-filled water column rather than a flat clear colour.
  const waterMaterial = material(new THREE.ShaderMaterial({
    uniforms: { uTime: time },
    depthWrite: false,
    vertexShader: `varying vec2 vUv;
      void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec2 vUv; uniform float uTime;
      void main(){
        vec2 p=vUv;
        vec3 deep=vec3(.003,.032,.080);
        vec3 middle=vec3(.005,.105,.16);
        vec3 surface=vec3(.05,.48,.49);
        vec3 c=mix(deep,middle,smoothstep(.02,.54,p.y));
        c=mix(c,surface,smoothstep(.47,1.,p.y));
        float glow=exp(-length((p-vec2(.43,.94))*vec2(2.5,2.1))*3.2);
        c+=vec3(.03,.12,.12)*glow;
        float edge=pow(abs(p.x-.5)*2.,1.7);
        c*=1.-.43*edge;
        c+=.008*sin(p.x*27.+p.y*18.+uTime*.1);
        gl_FragColor=vec4(c,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  }));
  const water = new THREE.Mesh(geometry(new THREE.PlaneGeometry(90, 55)), waterMaterial);
  water.position.set(0, 4, -26);
  scene.add(water);

  // Fine sand with refracted, slowly travelling light. The shader is deliberately
  // analytic so this scene needs neither downloaded textures nor render passes.
  const sandMaterial = material(new THREE.ShaderMaterial({
    uniforms: { uTime: time }, transparent: true, depthWrite: false,
    vertexShader: `varying vec3 vWorld; varying vec2 vUv;
      void main(){vUv=uv;vWorld=(modelMatrix*vec4(position,1.)).xyz;
        gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}`,
    fragmentShader: `varying vec3 vWorld; varying vec2 vUv; uniform float uTime;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float caustic(vec2 p){
        vec2 q=p;
        q+=vec2(sin(p.y*1.17+uTime*.23),cos(p.x*1.03-uTime*.17))*.42;
        float a=sin(q.x*2.1+q.y*.8+uTime*.13);
        float b=sin(q.y*2.5-q.x*.7-uTime*.19);
        float c=sin(q.x*1.3-q.y*1.6+uTime*.12);
        return pow(1.-abs((a+b+c)/3.),17.);
      }
      void main(){
        vec2 p=vWorld.xz;
        float grain=hash(p*150.)*.06;
        float ripples=sin(p.y*8.+sin(p.x*.55)*1.4)*.035;
        vec3 sand=vec3(.22,.34,.29)+grain+ripples;
        float light=caustic(p*.57)+caustic(p*.41+19.)*.55;
        sand+=vec3(.17,.30,.22)*light;
        sand*=.77+.23*exp(-length(p-vec2(-4.,3.))*.07);
        float depth=1.-smoothstep(-10.,5.,vWorld.z);
        sand=mix(sand,vec3(.005,.10,.135),depth*.88);
        gl_FragColor=vec4(sand,smoothstep(-10.,-6.5,vWorld.z));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  }));
  const sandGeometry = geometry(new THREE.PlaneGeometry(75, 34, 65, 35));
  const sandPositions = sandGeometry.attributes.position;
  for (let i = 0; i < sandPositions.count; i++) {
    const x = sandPositions.getX(i), y = sandPositions.getY(i);
    sandPositions.setZ(i, Math.sin(x * .3 + y * .13) * .13 + Math.sin(y * .7) * .035);
  }
  sandGeometry.computeVertexNormals();
  const sand = new THREE.Mesh(sandGeometry, sandMaterial);
  sand.rotation.x = -Math.PI / 2;
  sand.position.set(0, -4.25, 7);
  scene.add(sand);

  // Water surface: a distant ceiling of light with soft, wavering rays beneath.
  const surfaceMaterial = material(new THREE.ShaderMaterial({
    uniforms: { uTime: time }, side: THREE.DoubleSide, transparent: true, depthWrite: false,
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec2 vUv;uniform float uTime;
      void main(){vec2 p=vUv*22.;
        float wave=sin(p.x+sin(p.y+uTime*.13))*sin(p.y*.8+cos(p.x*.7-uTime*.18));
        float line=pow(1.-abs(wave),9.);
        gl_FragColor=vec4(.59,.94,.85,.06+line*.17);}`
  }));
  const surface = new THREE.Mesh(geometry(new THREE.PlaneGeometry(65, 50)), surfaceMaterial);
  surface.rotation.x = Math.PI / 2;
  surface.position.set(0, 10.6, -5);
  scene.add(surface);

  const rayMaterial = material(new THREE.ShaderMaterial({
    uniforms: { uTime: time }, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec2 vUv;uniform float uTime;
      void main(){float feather=pow(sin(vUv.x*3.14159),2.);
        float fade=pow(vUv.y,.7)*(1.-smoothstep(.85,1.,vUv.y));
        float shimmer=.8+.2*sin(uTime*.2+vUv.y*4.);
        gl_FragColor=vec4(.37,.82,.77,feather*fade*.075*shimmer);}`
  }));
  for (let i = 0; i < 6; i++) {
    const ray = new THREE.Mesh(geometry(new THREE.PlaneGeometry(between(.8, 2.7), 23)), rayMaterial);
    ray.position.set(-12 + i * 4.7, 3, -10 - (i % 3) * 2);
    ray.rotation.z = -.23;
    scene.add(ray);
  }

  // Ribbon leaves have a shallow folded cross-section, catching a real rim of
  // light. Vertex motion grows towards the tip, leaving every root planted.
  function leafGeometry(leafHeight, breadth, bend, phase) {
    const positions = [], normals = [], uvs = [], indices = [];
    const rows = 12;
    for (let row = 0; row <= rows; row++) {
      const t = row / rows;
      const taper = Math.pow(Math.sin(Math.PI * t), .65) * .93 + .055;
      const centerX = bend * t * t + Math.sin(t * 3.8 + phase) * .12 * t;
      for (let side = 0; side < 3; side++) {
        positions.push(centerX + (side - 1) * breadth * taper, t * leafHeight,
          Math.sin(t * 3. + phase) * .28 * t + (side === 1 ? .065 : 0));
        normals.push(0, 0, 1);
        uvs.push(side / 2, t);
      }
    }
    for (let row = 0; row < rows; row++) {
      for (let side = 0; side < 2; side++) {
        const a = row * 3 + side, b = a + 3;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const g = geometry(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(indices);g.computeVertexNormals();
    return g;
  }
  const leafMaterials = [0x236f59, 0x318b5f, 0x5b9863, 0x175d58, 0x6c9c63].map(tint => {
    const m = material(new THREE.MeshPhongMaterial({ color: tint, specular: 0x73c296, shininess: 42, side: THREE.DoubleSide }));
    m.onBeforeCompile = shader => {
      shader.uniforms.uAquariumTime = time;
      shader.vertexShader = 'uniform float uAquariumTime;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
        #include <begin_vertex>
        float strength=uv.y*uv.y;
        transformed.x+=sin(uAquariumTime*.48+position.y*.6+position.x*3.)*.19*strength;
        transformed.z+=cos(uAquariumTime*.32+position.y*.8)*.15*strength;
      `);
    };
    return m;
  });
  const rockMaterials = [0x466e70, 0x38575e, 0x5b7b75, 0x334e5c].map(tint => material(new THREE.MeshPhongMaterial({ color: tint, shininess: 18, specular: 0x496d77 })));
  const stoneGeometry = geometry(new THREE.IcosahedronGeometry(1, 2));
  const stonePositions = stoneGeometry.attributes.position;
  for (let i = 0; i < stonePositions.count; i++) {
    const x = stonePositions.getX(i), y = stonePositions.getY(i), z = stonePositions.getZ(i);
    const n = 1 + .1 * Math.sin(x * 8 + z * 5) * Math.cos(y * 7);
    stonePositions.setXYZ(i, x * n, y * n, z * n);
  }
  stoneGeometry.computeVertexNormals();
  const gardens = [];
  for (const side of [-1, 1]) {
    const garden = new THREE.Group();
    garden.position.y = -4.16;
    garden.position.z = -.8;
    garden.userData.side = side;
    scene.add(garden);gardens.push(garden);
    const leafCount = mobile ? 31 : 52;
    for (let i = 0; i < leafCount; i++) {
      const h = between(.9, 5.9) * (i % 9 === 0 ? 1.22 : 1);
      const leaf = new THREE.Mesh(leafGeometry(h, between(.065, .21), between(-1.05, 1.05), between(0, 6)), leafMaterials[i % leafMaterials.length]);
      leaf.position.set(between(-2.6, 2.6), -.03, between(-3.4, 2.));
      leaf.rotation.y = between(-.9, .9);
      leaf.rotation.z = between(-.2, .2);
      garden.add(leaf);
    }
    for (let i = 0; i < (mobile ? 8 : 13); i++) {
      const rock = new THREE.Mesh(stoneGeometry, rockMaterials[i % rockMaterials.length]);
      const size = between(.32, 1.);
      rock.scale.set(size * between(1., 1.7), size * between(.4, .85), size);
      rock.position.set(between(-2.5, 2.5), size * .24 - .12, between(-1.2, 2.2));
      rock.rotation.set(between(0, 1), between(0, 6), between(-.2, .2));
      garden.add(rock);
    }
  }

  // A tapered ring mesh gives the fish actual volume, including a narrow tail
  // peduncle and a rounded snout. Their fins are separate articulated surfaces.
  function bodyGeometry() {
    const vertices = [], uvs = [], indices = [];
    const rings = 23, sides = 18;
    for (let i = 0; i <= rings; i++) {
      const u = i / rings, x = u * 2 - 1;
      const profile = .045 + Math.pow(Math.sin(Math.PI * Math.pow(u, .77)), .85) * .43;
      for (let j = 0; j <= sides; j++) {
        const a = j / sides * Math.PI * 2;
        vertices.push(x, Math.cos(a) * profile, Math.sin(a) * profile * .53);
        uvs.push(u, j / sides);
      }
    }
    for (let i = 0; i < rings; i++) for (let j = 0; j < sides; j++) {
      const a = i * (sides + 1) + j, b = a + sides + 1;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
    const g = geometry(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(indices);g.computeVertexNormals();return g;
  }
  const fishBodyGeometry = bodyGeometry();
  function finGeometry(points) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
    shape.closePath();return geometry(new THREE.ShapeGeometry(shape));
  }
  const tailGeometry = finGeometry([[0, 0], [-.67, .55], [-.53, .15], [-.57, -.18], [-.67, -.5]]);
  const dorsalGeometry = finGeometry([[.6, .26], [.24, .68], [-.39, .7], [-.79, .15], [-.38, .38]]);
  const lowerGeometry = finGeometry([[.22, -.33], [-.3, -.62], [-.63, -.27]]);
  const sideFinGeometry = finGeometry([[0, 0], [-.44, -.04], [-.60, -.29], [-.18, -.2]]);
  const eyeGeometry = geometry(new THREE.SphereGeometry(1, 10, 8));
  const eyeRimMaterial = material(new THREE.MeshPhongMaterial({ color: 0x9c814b, shininess: 110 }));
  const eyeMaterial = material(new THREE.MeshPhongMaterial({ color: 0x071a20, shininess: 150, specular: 0xb6eded }));
  const palettes = [
    { body: 0xf5a23b, fin: 0xffbd63, specular: 0xffe2ac },
    { body: 0xd7e6d3, fin: 0xc6e4d2, specular: 0xffffff },
    { body: 0x438f9e, fin: 0x72b8ba, specular: 0xb8eeed },
    { body: 0xf28d3e, fin: 0xffb264, specular: 0xffd7a1 }
  ];
  const fishMaterials = palettes.map(p => ({
    body: material(new THREE.MeshPhongMaterial({ color: p.body, specular: p.specular, shininess: 75 })),
    fin: material(new THREE.MeshPhongMaterial({ color: p.fin, specular: p.specular, shininess: 85, side: THREE.DoubleSide, transparent: true, opacity: .64, depthWrite: false }))
  }));
  for (const materials of fishMaterials) {
    materials.body.onBeforeCompile = shader => {
      shader.vertexShader = 'varying vec3 vFishPoint;\nvarying vec2 vFishUv;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
        #include <begin_vertex>
        vFishPoint=position;vFishUv=uv;
      `);
      shader.fragmentShader = 'varying vec3 vFishPoint;\nvarying vec2 vFishUv;\n' + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
        #include <color_fragment>
        float belly=1.-smoothstep(-.3,.13,vFishPoint.y);
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.85,.86,.67),belly*.23);
        diffuseColor.rgb*=1.-smoothstep(.1,.43,vFishPoint.y)*.20;
        float scales=sin(vFishUv.x*180.+sin(vFishUv.y*95.)*1.5)*sin(vFishUv.y*95.);
        diffuseColor.rgb*=1.+scales*.035;
      `);
    };
    materials.fin.onBeforeCompile = shader => {
      shader.vertexShader = 'varying vec3 vFinPoint;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
        #include <begin_vertex>
        vFinPoint=position;
      `);
      shader.fragmentShader = 'varying vec3 vFinPoint;\n' + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
        #include <color_fragment>
        float ribs=pow(abs(sin(atan(vFinPoint.y,vFinPoint.x)*24.)),14.);
        diffuseColor.rgb*=.92+ribs*.15;
        diffuseColor.a*=.77+ribs*.23;
      `);
    };
  }
  function createFish(palette, scale, slender = 1) {
    const detailed = scale > .4;
    const fish = new THREE.Group();
    const body = new THREE.Mesh(fishBodyGeometry, fishMaterials[palette].body);
    body.scale.y = slender;
    fish.add(body);
    const tail = new THREE.Group();tail.position.x = -.96;
    const tailFin = new THREE.Mesh(tailGeometry, fishMaterials[palette].fin);
    tailFin.scale.y = slender;
    tail.add(tailFin);fish.add(tail);
    const dorsal = new THREE.Mesh(dorsalGeometry, fishMaterials[palette].fin);
    dorsal.scale.y = slender;fish.add(dorsal);
    if (detailed) {
      const lower = new THREE.Mesh(lowerGeometry, fishMaterials[palette].fin);
      lower.scale.y = slender;fish.add(lower);
    }
    const pectorals = [];
    for (const side of detailed ? [-1, 1] : []) {
      const fin = new THREE.Mesh(sideFinGeometry, fishMaterials[palette].fin);
      fin.position.set(.34, -.07, side * .215);
      fin.rotation.y = side * .65;
      fish.add(fin);pectorals.push(fin);
      const rim = new THREE.Mesh(eyeGeometry, eyeRimMaterial);
      rim.position.set(.68, .11 * slender, side * .153);
      rim.scale.set(.055, .055, .019);
      fish.add(rim);
      const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      eye.position.set(.692, .116 * slender, side * .166);
      eye.scale.set(.032, .034, .014);
      fish.add(eye);
    }
    fish.scale.setScalar(scale * (mobile ? .77 : 1));
    fish.userData = { tail, pectorals };
    scene.add(fish);return fish;
  }
  const swimmers = [];
  // Normalized x positions form two loose groups flanking the welcome copy.
  const heroFish = [
    { x: -.69, y: 3.5, z: 1.4, size: 1.14, palette: 0, direction: 1, phase: .4 },
    { x: .77, y: 1.2, z: 2.1, size: 1.18, palette: 1, direction: -1, phase: 2.1 },
    { x: -.79, y: -.6, z: -.9, size: .84, palette: 2, direction: 1, phase: 4.2 },
    { x: .61, y: 5.3, z: -2.8, size: .71, palette: 0, direction: -1, phase: 1.4 },
    { x: .91, y: -1.4, z: -3.6, size: .73, palette: 3, direction: -1, phase: 3.3 },
    { x: -.37, y: 6.4, z: -5.9, size: .49, palette: 1, direction: 1, phase: 5.3 }
  ];
  for (const spec of heroFish.slice(0, mobile ? 4 : 6)) {
    const fish = createFish(spec.palette, spec.size, spec.palette === 1 ? 1.16 : .88);
    swimmers.push({ ...spec, fish, school: false });
  }
  for (let i = 0; i < (mobile ? 7 : 15); i++) {
    const left = i < 8;
    const spec = { x: (left ? -1 : 1) * between(.25, .95), y: between(3.2, 5.9), z: between(-9, -5), size: between(.19, .32), palette: i % 3 === 0 ? 0 : 1, direction: left ? 1 : -1, phase: i * 1.6 };
    const fish = createFish(spec.palette, spec.size, .66);
    swimmers.push({ ...spec, fish, school: true });
  }

  const particleCount = mobile ? 85 : 165;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleSeeds = [];
  for (let i = 0; i < particleCount; i++) {
    particleSeeds.push({ x: between(-1.2, 1.2), y: between(-4, 12), z: between(-14, 8), speed: between(.025, .085), phase: between(0, 6) });
  }
  const particleGeometry = geometry(new THREE.BufferGeometry());
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMaterial = material(new THREE.ShaderMaterial({
    uniforms: { uPixelRatio: { value: renderer.getPixelRatio() } }, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `uniform float uPixelRatio;varying float vAlpha;
      void main(){vec4 mv=modelViewMatrix*vec4(position,1.);
        gl_PointSize=clamp(31./-mv.z,1.,3.)*uPixelRatio;
        vAlpha=.16+.16*clamp(1.-(-mv.z)/30.,0.,1.);
        gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `varying float vAlpha;
      void main(){float d=length(gl_PointCoord-.5)*2.;
        gl_FragColor=vec4(.66,.96,.92,(1.-smoothstep(.1,1.,d))*vAlpha);}`
  }));
  scene.add(new THREE.Points(particleGeometry, particleMaterial));

  // Sparse clear bubbles hug the planted edges so the central type stays calm.
  const bubbleGeometry = geometry(new THREE.SphereGeometry(1, 12, 10));
  const bubbleMaterial = material(new THREE.MeshPhongMaterial({ color: 0x9fece5, specular: 0xffffff, shininess: 160, transparent: true, opacity: .17, depthWrite: false }));
  const bubbles = [];
  for (let i = 0; i < (mobile ? 8 : 15); i++) {
    const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
    bubble.scale.setScalar(between(.025, .075));
    const spec = { mesh: bubble, x: (i % 2 ? -1 : 1) * between(.78, 1.04), y: between(-4, 9), z: between(-3, 3), speed: between(.17, .34), phase: between(0, 6) };
    bubbles.push(spec);scene.add(bubble);
  }

  function updateScene(seconds) {
    time.value = seconds;
    for (const spec of swimmers) {
      const speed = spec.school ? .105 : .145;
      const drift = Math.sin(seconds * speed + spec.phase) - Math.sin(spec.phase);
      const amplitude = Math.min(halfWidth * .2, spec.school ? 1.9 : 1.65);
      let x = spec.x * halfWidth + drift * amplitude;
      // Near fish can cruise naturally, but their bodies never cross the type.
      if (!spec.school) x = Math.sign(spec.x) * Math.max(Math.abs(x), halfWidth * .57);
      const y = spec.y + Math.sin(seconds * .25 + spec.phase) * (spec.school ? .18 : .48);
      spec.fish.position.set(x, y, spec.z + Math.sin(seconds * .17 + spec.phase) * .8);
      // Keeping a side profile with small banking turns makes the body volume
      // readable without sending fish through the title's central safe zone.
      const heading = spec.direction === 1 ? 0 : Math.PI;
      spec.fish.rotation.set(0, heading + Math.sin(seconds * .27 + spec.phase) * .34, Math.cos(seconds * .25 + spec.phase) * .065 * spec.direction);
      spec.fish.userData.tail.rotation.y = Math.sin(seconds * 3.7 + spec.phase) * .35;
      spec.fish.userData.pectorals.forEach((fin, index) => {
        fin.rotation.y = (index ? 1 : -1) * (.55 + Math.sin(seconds * 2.8 + spec.phase) * .22);
      });
    }
    for (let i = 0; i < particleSeeds.length; i++) {
      const p = particleSeeds[i];
      particlePositions[i * 3] = p.x * halfWidth * 1.4 + Math.sin(seconds * .12 + p.phase) * .14;
      particlePositions[i * 3 + 1] = ((p.y + 4 + seconds * p.speed) % 16) - 4;
      particlePositions[i * 3 + 2] = p.z;
    }
    particleGeometry.attributes.position.needsUpdate = true;
    for (const b of bubbles) {
      b.mesh.position.set(b.x * halfWidth + Math.sin(seconds * .8 + b.phase) * .09, ((b.y + 4 + seconds * b.speed) % 14) - 4, b.z);
    }
    cameraDrift.lerp(pointer, .035);
    camera.position.x = cameraDrift.x * .36;
    camera.position.y = 2.7 + cameraDrift.y * .2;
    camera.lookAt(cameraDrift.x * .13, 1.5 + cameraDrift.y * .07, -1);
  }

  function render() {
    if (disposed) return;
    updateScene(reducedMotion.matches ? 0 : elapsed);
    renderer.render(scene, camera);
  }
  function canAnimate() { return !disposed && !paused && !document.hidden && !reducedMotion.matches; }
  function animate(timestamp) {
    raf = 0;
    if (!canAnimate()) return;
    if (previousTime) elapsed += Math.min((timestamp - previousTime) / 1000, .05);
    previousTime = timestamp;
    render();raf = requestAnimationFrame(animate);
  }
  function syncAnimation() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;previousTime = 0;
    if (canAnimate()) raf = requestAnimationFrame(animate);
    else if (!disposed && !document.hidden) render();
  }
  function resize() {
    if (disposed) return;
    const bounds = container.getBoundingClientRect();
    width = Math.max(bounds.width, 1);height = Math.max(bounds.height, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // A wider vertical view preserves the floor and surface on portrait screens.
    camera.fov = camera.aspect < .8 ? 49 : 43;
    camera.updateProjectionMatrix();
    halfWidth = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 19 * camera.aspect;
    for (const garden of gardens) {
      garden.position.x = garden.userData.side * (halfWidth * .94 + .65);
      garden.scale.setScalar(camera.aspect < .8 ? .7 : 1);
    }
    render();
  }
  function onPointer(event) {
    if (reducedMotion.matches || event.pointerType === 'touch') return;
    const bounds = container.getBoundingClientRect();
    pointer.set(((event.clientX - bounds.left) / width - .5) * 2, -((event.clientY - bounds.top) / height - .5) * 2);
  }
  function clearPointer() { pointer.set(0, 0); }
  function onMotionChange() { pointer.set(0, 0);cameraDrift.set(0, 0);syncAnimation(); }
  function onContextLost(event) {
    event.preventDefault();
    paused = true;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    container.dispatchEvent(new CustomEvent('aquarium:error'));
  }
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  container.addEventListener('pointermove', onPointer, { passive: true });
  container.addEventListener('pointerleave', clearPointer);
  document.addEventListener('visibilitychange', syncAnimation);
  reducedMotion.addEventListener('change', onMotionChange);
  canvas.addEventListener('webglcontextlost', onContextLost);
  resize();
  syncAnimation();
  container.dispatchEvent(new CustomEvent('aquarium:ready'));

  return {
    setPaused(value) { paused = Boolean(value);syncAnimation(); },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      container.removeEventListener('pointermove', onPointer);
      container.removeEventListener('pointerleave', clearPointer);
      document.removeEventListener('visibilitychange', syncAnimation);
      reducedMotion.removeEventListener('change', onMotionChange);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      for (const resource of resources) resource.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      scene.clear();
    }
  };
}
