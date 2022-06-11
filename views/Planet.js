import * as THREE from 'three'
import Biome from './Biome.js'
import Atmosphere from './Atmosphere.js'
import NoiseMap from './NoiseMap.js'
import TextureMap from './TextureMap.js'
import NormalMap from './NormalMap.js'
import RoughnessMap from './RoughnessMap.js'
import Clouds from './Clouds.js'
import Stars from './Stars.js'
import Nebula from './Nebula.js'
import Sun from './Sun.js'
import Glow from './Glow.js'
import NebulaeGradient from './NebulaeGradient.js'
import seedrandom from '../lib/seedrandom.js'



class Planet {

  constructor() {

    this.seedString = "Scarlett";
    this.initSeed();

    this.view = new THREE.Object3D();

    this.materials = [];
    this.roughness = 0.8;
    this.metalness = 0.5;
    this.normalScale = 3.0;
    this.resolution = 1024;
    this.size = 1000;
    this.waterLevel = 0.0;
    // this.waterLevel = 0.5;

    this.heightMaps = [];
    this.moistureMaps = [];
    this.textureMaps = [];
    this.normalMaps = [];
    this.roughnessMaps = [];

    this.displayMap = "textureMap";
    this.showBiomeMap = false;
    this.showNebulaMap = false;

    this.biome = new Biome();
    this.nebulaeGradient = new NebulaeGradient();

    this.createScene();
    this.createStars();
    this.createNebula();
    this.createSun();

    this.createAtmosphere();
    this.renderScene();

    this.rotate = true;
    this.autoGenerate = false;
    this.autoGenCountCurrent = 0;
    this.autoGenTime = 3*60;
    this.autoGenCountMax = this.autoGenTime * 60;

  }

  update() {
    if (this.rotate) {
      this.ground.rotation.y += 0.0005;
      this.stars.view.rotation.y += 0.0003;
      this.nebula.view.rotation.y += 0.0003;
      // this.clouds.view.rotation.y += 0.0007;
    }

    this.atmosphere.update();

    this.stars.view.position.copy(window.camera.position);
    this.nebula.view.position.copy(window.camera.position);

  }

  initSeed() {
    window.rng = seedrandom(this.seedString);
    console.log(seedrandom);
    console.log(window.rng);
  }


  createScene() {
    this.heightMap = new NoiseMap();
    this.heightMaps = this.heightMap.maps;

    this.moistureMap = new NoiseMap();
    this.moistureMaps = this.moistureMap.maps;

    this.textureMap = new TextureMap();
    this.textureMaps = this.textureMap.maps;

    this.normalMap = new NormalMap();
    this.normalMaps = this.normalMap.maps;

    this.roughnessMap = new RoughnessMap();
    this.roughnessMaps = this.roughnessMap.maps;

    for (let i=0; i<6; i++) {
      let material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xFFFFFF)
      });
      this.materials[i] = material;
    }

    let geo = new THREE.BoxGeometry(1, 1, 1, 64, 64, 64);
    let radius = this.size;
    for (var i in geo.vertices) {
  		var vertex = geo.vertices[i];
  		vertex.normalize().multiplyScalar(radius);
  	}
    this.computeGeometry(geo);
    this.ground = new THREE.Mesh(geo, this.materials);
    this.view.add(this.ground);
  }


  renderScene() {

    this.initSeed();
    // this.updatePlanetName();

    this.seed = this.randRange(0, 1) * 1000.0;
    this.waterLevel = this.randRange(0.1, 0.5);
    // this.clouds.resolution = this.resolution;

    this.updateNormalScaleForRes(this.resolution);
    this.renderBiomeTexture();
    this.renderNebulaeGradient();

    this.stars.resolution = this.resolution;
    this.nebula.resolution = this.resolution;
    this.atmosphere.randomizeColor();
    // this.clouds.randomizeColor();
    // this.clouds.color = this.atmosphere.color;

    window.renderQueue.start();

    let resMin = 0.01;
    let resMax = 5.0;

    this.heightMap.render({
      seed: this.seed,
      resolution: this.resolution,
      res1: this.randRange(resMin, resMax),
      res2: this.randRange(resMin, resMax),
      resMix: this.randRange(resMin, resMax),
      mixScale: this.randRange(0.5, 1.0),
      doesRidged: Math.floor(this.randRange(0, 4))
      // doesRidged: 1
    });

    let resMod = this.randRange(3, 10);
    resMax *= resMod;
    resMin *= resMod;

    this.moistureMap.render({
      seed: this.seed + 392.253,
      resolution: this.resolution,
      res1: this.randRange(resMin, resMax),
      res2: this.randRange(resMin, resMax),
      resMix: this.randRange(resMin, resMax),
      mixScale: this.randRange(0.5, 1.0),
      doesRidged: Math.floor(this.randRange(0, 4))
      // doesRidged: 0
    });

    this.textureMap.render({
      resolution: this.resolution,
      heightMaps: this.heightMaps,
      moistureMaps: this.moistureMaps,
      biomeMap: this.biome.texture
    });

    this.normalMap.render({
      resolution: this.resolution,
      waterLevel: this.waterLevel,
      heightMaps: this.heightMaps,
      textureMaps: this.textureMaps
    });

    this.roughnessMap.render({
      resolution: this.resolution,
      heightMaps: this.heightMaps,
      waterLevel: this.waterLevel
    });

    // this.clouds.render({
    //   waterLevel: this.waterLevel
    // });

    this.stars.render({
      nebulaeMap: this.nebulaeGradient.texture
    });

    this.nebula.render({
      nebulaeMap: this.nebulaeGradient.texture
    });

    this.sun.render();


    window.renderQueue.addCallback(() => {
      this.updateMaterial();
    });
  }

  updateMaterial() {
    for (let i=0; i<6; i++) {
      let material = this.materials[i];
      material.roughness = this.roughness;
      material.metalness = this.metalness;

      if (this.displayMap == "textureMap") {
        material.map = this.textureMaps[i];
        material.normalMap = this.normalMaps[i];
        material.normalScale = new THREE.Vector2(this.normalScale, this.normalScale);
        material.roughnessMap = this.roughnessMaps[i];
        // material.metalnessMap = this.roughnessMaps[i];
      }
      else if (this.displayMap == "heightMap") {
        material.map = this.heightMaps[i];
        material.normalMap = null;
        material.roughnessMap = null;
      }
      else if (this.displayMap == "moistureMap") {
        material.map = this.moistureMaps[i];
        material.normalMap = null;
        material.roughnessMap = null;
      }
      else if (this.displayMap == "normalMap") {
        material.map = this.normalMaps[i];
        material.normalMap = null;
        material.roughnessMap = null;
      }
      else if (this.displayMap == "roughnessMap") {
        material.map = this.roughnessMaps[i];
        material.normalMap = null;
        material.roughnessMap = null;
      }

      material.needsUpdate = true;
    }
  }

  renderBiomeTexture() {
    this.biome.generateTexture({waterLevel: this.waterLevel});
  }

  renderNebulaeGradient() {
    this.nebulaeGradient.generateTexture();
  }

  createAtmosphere() {
    this.atmosphere = new Atmosphere();
    // this.atmosphere.color = this.glow.color;
    this.view.add(this.atmosphere.view);
  }

  createGlow() {
    this.glow = new Glow();
    // this.glow.color = this.atmosphere.color;
    this.view.add(this.glow.view);
  }

  createClouds() {
    this.clouds = new Clouds();
    this.view.add(this.clouds.view);
  }

  createStars() {
    this.stars = new Stars();
    this.view.add(this.stars.view);
  }

  createNebula() {
    this.nebula = new Nebula();
    this.view.add(this.nebula.view);
  }

  createSun() {
    this.sun = new Sun();
    this.view.add(this.sun.view);
  }

  updateNormalScaleForRes(value) {
    if (value == 256) this.normalScale = 0.25;
    if (value == 512) this.normalScale = 0.5;
    if (value == 1024) this.normalScale = 1.0;
    if (value == 2048) this.normalScale = 1.5;
    if (value == 4096) this.normalScale = 3.0;
  }

  randRange(low, high) {
    let range = high - low;
    let n = window.rng() * range;
    return low + n;
  }

  computeGeometry(geometry) {
  	// geometry.makeGroups();
  	geometry.computeVertexNormals()
  	geometry.computeFaceNormals();
  	geometry.computeMorphNormals();
  	geometry.computeBoundingSphere();
  	geometry.computeBoundingBox();
  	// geometry.computeLineDistances();

  	geometry.verticesNeedUpdate = true;
  	geometry.elementsNeedUpdate = true;
  	geometry.uvsNeedUpdate = true;
  	geometry.normalsNeedUpdate = true;
  	// geometry.tangentsNeedUpdate = true;
  	geometry.colorsNeedUpdate = true;
  	geometry.lineDistancesNeedUpdate = true;
  	// geometry.buffersNeedUpdate = true;
  	geometry.groupsNeedUpdate = true;
  }
}

export default Planet;
