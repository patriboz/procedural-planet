import * as THREE from 'three';
import metaversefile from 'metaversefile';

import shaderVertAtmosphere from 'https://patriboz.github.io/procedural-planet/shaders/planet.vert.js'
import shaderFragAtmosphere from 'https://patriboz.github.io/procedural-planet/shaders/atmos.frag.js'
import fragShaderNoiseMap from 'https://patriboz.github.io/procedural-planet/shaders/flowNoiseMap.frag.js'
import fragShaderTextureMap from 'https://patriboz.github.io/procedural-planet/shaders/textureMap.frag.js'
import vertShaderNormalMap from 'https://patriboz.github.io/procedural-planet/shaders/normalMap.vert.js'
import fragShaderNormalMap from 'https://patriboz.github.io/procedural-planet/shaders/normalMap.frag.js'
import fragShaderRoughnessMap from 'https://patriboz.github.io/procedural-planet/shaders/roughnessMap.frag.js'
import fragShaderCloudMap from 'https://patriboz.github.io/procedural-planet/shaders/cloudMap.frag.js'
import fragShaderStarMap from 'https://patriboz.github.io/procedural-planet/shaders/stars.frag.js'
import fragShaderNebulaMap from 'https://patriboz.github.io/procedural-planet/shaders/nebula.frag.js'
import shaderVertGlow from 'https://patriboz.github.io/procedural-planet/shaders/glow.vert.js'
import shaderFragGlow from 'https://patriboz.github.io/procedural-planet/shaders/glow.frag.js'

import vertShaderTexture from 'https://patriboz.github.io/procedural-planet/shaders/texture.vert.js'

import {prng_arc4} from '//cdn.jsdelivr.net/npm/esm-seedrandom/esm/arc4.min.mjs'


import RenderQueue from 'https://patriboz.github.io/procedural-planet/views/RenderQueue.js'
const {useApp, useFrame, useLoaders, usePhysics, useCleanup} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');


class Biome {

  constructor() {

    this.canvas = document.createElement("canvas");
    this.canvas.id = "biomeCanvas";
    this.canvas.width = 512;
    this.canvas.height = 512;
    this.canvas.style.width = "200px";
    this.canvas.style.height = "200px";
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.ctx = this.canvas.getContext("2d");

    document.body.appendChild(this.canvas);
    this.toggleCanvasDisplay(false);

  }

  generateTexture(props) {

    this.waterLevel = props.waterLevel;

    let h = this.randRange(0.0, 1.0);
    let s = this.randRange(0.0, 0.7);
    let l = this.randRange(0.0, 0.6);
    this.baseColor = new THREE.Color().setHSL(h, s, l);
    this.colorAngle = this.randRange(0.2, 0.4)
    this.satRange = this.randRange(0.3, 0.5);
    this.lightRange = this.randRange(0.3, 0.5);
    this.circleSize = this.randRange(30, 250);
    // this.circleSize = 100;


    this.drawBase();

    // circles
    let numCircles = Math.round(this.randRange(50, 100));
    numCircles = 100;
    for (let i=0; i<numCircles; i++) {
      this.randomGradientCircle();
    }

    this.drawDetail();
    this.drawInland();
    this.drawBeach();
    this.drawWater();


    this.texture = new THREE.CanvasTexture(this.canvas);
  }

  toggleCanvasDisplay(value) {
    if (value) {
      this.canvas.style.display = "block";
    } else {
      this.canvas.style.display = "none";
    }
  }

  drawBase() {
    this.fillBaseColor();

    for (let i=0; i<5; i++) {
      let x = 0;
      let y =0;
      let width = this.width;
      let height = this.height;
      this.randomGradientRect(x, y, width, height);
    }
  }

  drawDetail() {
    // land detail
    let landDetail = Math.round(this.randRange(0, 5));
    // landDetail = 20;
    // console.log("landDetail = " + landDetail);
    for (let i=0; i<landDetail; i++) {
      let x1 = this.randRange(0, this.width);
      let y1 = this.randRange(0, this.height);
      let x2 = this.randRange(0, this.width);
      let y2 = this.randRange(0, this.height);
      let width = x2-x1;
      let height = y2-y1;

      // this.randomGradientStrip(0, 0, this.width, this.height);
      this.randomGradientStrip(x1, y1, width, height);
    }
  }

  drawRivers() {
    // rivers
    let c = this.randomColor();
    this.ctx.strokeStyle = "rgba("+c.r+", "+c.g+", "+c.b+", 0.5)";

    let x = this.randRange(0, this.width);
    let y = this.randRange(0, this.height);
    let prevX = x;
    let prevY = y;

    for (let i=0; i<5; i++) {
      x = this.randRange(0, this.width);
      y = this.randRange(0, this.height);

      this.ctx.moveTo(prevX, prevY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();

      prevX = x;
      prevY = y;
    }
  }

  randomCircle() {
    let x = this.randRange(0, this.width);
    let y = this.randRange(0, this.height);
    let rad = this.randRange(0, 10);
    // rad = 3;

    let c = this.randomColor();
    this.ctx.fillStyle = "rgba("+c.r+", "+c.g+", "+c.b+", 0.5)";
    // this.ctx.lineWidth = 1;

    this.ctx.beginPath();
    this.ctx.arc(x, y, rad, 0, 2*Math.PI);
    this.ctx.fill();
  }

  randomGradientStrip(x, y, width, height) {
    let x1 = this.randRange(0, this.width);
    let y1 = this.randRange(0, this.height);
    let x2 = this.randRange(0, this.width);
    let y2 = this.randRange(0, this.height);

    let gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    let c = this.randomColor();
    gradient.addColorStop(this.randRange(0, 0.5), "rgba("+c.r+", "+c.g+", "+c.b+", 0.0)");
    gradient.addColorStop(0.5, "rgba("+c.r+", "+c.g+", "+c.b+", 0.8)");
    gradient.addColorStop(this.randRange(0.5, 1.0), "rgba("+c.r+", "+c.g+", "+c.b+", 0.0)");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, width, height);
  }

  blackWhiteGradient() {
    let x1 = 0;
    let y1 = 0;
    let x2 = this.width;
    let y2 = this.height;

    let gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);


    gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 1.0)");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  fillBaseColor() {
    this.ctx.fillStyle = this.toCanvasColor(this.baseColor);
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  randomGradientRect(x, y, width, height) {
    let x1 = this.randRange(0, this.width);
    let y1 = this.randRange(0, this.height);
    let x2 = this.randRange(0, this.width);
    let y2 = this.randRange(0, this.height);

    let gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    let c = this.randomColor();
    gradient.addColorStop(0, "rgba("+c.r+", "+c.g+", "+c.b+", 0.0)");
    gradient.addColorStop(1, "rgba("+c.r+", "+c.g+", "+c.b+", 1.0)");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, width, height);
  }

  drawWater() {
    let x1 = 0;
    let y1 = this.height - (this.height * this.waterLevel);
    let x2 = 0;
    let y2 = this.height;

    let gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    // let c = this.randomColor();
    let c = this.randomWaterColor();

    let falloff = 1.3;
    let falloff2 = 1.0;
    let falloff3 = 0.7;
    let opacity = 0.9;
    // gradient.addColorStop(0.0, "rgba("+cr+", "+cg+", "+cb+", "+0+")");
    gradient.addColorStop(0.0, "rgba("+Math.round(c.r*falloff)+", "+Math.round(c.g*falloff)+", "+Math.round(c.b*falloff)+", "+opacity+")");
    gradient.addColorStop(0.2, "rgba("+Math.round(c.r*falloff2)+", "+Math.round(c.g*falloff2)+", "+Math.round(c.b*falloff2)+", "+opacity+")");
    gradient.addColorStop(0.8, "rgba("+Math.round(c.r*falloff3)+", "+Math.round(c.g*falloff3)+", "+Math.round(c.b*falloff3)+", "+opacity+")");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x1, y1, this.width, this.height);
  }

  drawBeach() {
    this.beachSize = 7;

    let x1 = 0;
    let y1 = this.height - (this.height * this.waterLevel) - this.beachSize;
    let x2 = 0;
    let y2 = this.height - (this.height * this.waterLevel);

    let gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    let c = this.randomColor();
    let falloff = 1.0;
    let falloff2 = 1.0;
    // gradient.addColorStop(0.0, "rgba("+cr+", "+cg+", "+cb+", "+0+")");
    gradient.addColorStop(0.0, "rgba("+Math.round(c.r*falloff)+", "+Math.round(c.g*falloff)+", "+Math.round(c.b*falloff)+", "+0.0+")");
    gradient.addColorStop(1.0, "rgba("+Math.round(c.r*falloff2)+", "+Math.round(c.g*falloff2)+", "+Math.round(c.b*falloff2)+", "+0.3+")");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x1, y1, this.width, this.beachSize);
  }

  drawInland() {
    this.inlandSize = 100;

    let x1 = 0;
    let y1 = this.height - (this.height * this.waterLevel) - this.inlandSize;
    let x2 = 0;
    let y2 = this.height - (this.height * this.waterLevel);

    let gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    let c = this.randomColor();
    let falloff = 1.0;
    let falloff2 = 1.0;
    // gradient.addColorStop(0.0, "rgba("+cr+", "+cg+", "+cb+", "+0+")");
    gradient.addColorStop(0.0, "rgba("+Math.round(c.r*falloff)+", "+Math.round(c.g*falloff)+", "+Math.round(c.b*falloff)+", "+0.0+")");
    gradient.addColorStop(1.0, "rgba("+Math.round(c.r*falloff2)+", "+Math.round(c.g*falloff2)+", "+Math.round(c.b*falloff2)+", "+0.5+")");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x1, y1, this.width, this.inlandSize);
  }

  randomGradientCircle() {
    let x1 = this.randRange(0, this.width);
    let y1 = this.randRange(0, this.height) - this.height * this.waterLevel;
    let size = this.randRange(10, this.circleSize);
    let x2 = x1;
    let y2 = y1;
    let r1 = 0;
    let r2 = size;

    let gradient = this.ctx.createRadialGradient(x1,y1,r1,x2,y2,r2);

    let c = this.randomColor();

    gradient.addColorStop(0, "rgba("+c.r+", "+c.g+", "+c.b+", 1.0)");
    gradient.addColorStop(1, "rgba("+c.r+", "+c.g+", "+c.b+", 0.0)");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  randomWaterColor() {
    let newColor = this.baseColor.clone();

    let hOffset = 0.0;
    let range = 0.1;
    let n = this.randRange(0,1);
    if (n < 0.33) {
      hOffset = 0.0 + this.randRange(-range, range);
    } else if (n < 0.66) {
      hOffset = this.colorAngle + this.randRange(-range, range);
    } else {
      hOffset = -this.colorAngle + this.randRange(-range, range);
    }

    // let sOffset = this.randRange(-this.satRange, this.satRange);
    // let lOffset = this.randRange(-this.lightRange, this.lightRange);

    let c = newColor.getHSL();
    c.h += hOffset;
    c.s = this.randRange(0.0, 0.6);
    // console.log("sat = " + c.s);
    c.l = this.randRange(0.1, 0.4);

    newColor.setHSL(c.h, c.s, c.l);

    // newColor.offsetHSL(hOffset, sOffset, lOffset);

    return {r: Math.round(newColor.r*255),
            g: Math.round(newColor.g*255),
            b: Math.round(newColor.b*255)};
  }

  randomColor() {

    let newColor = this.baseColor.clone();

    let hOffset = 0.0;
    let range = 0.1;
    let n = this.randRange(0,1);
    if (n < 0.33) {
      hOffset = 0.0 + this.randRange(-range, range);
    } else if (n < 0.66) {
      hOffset = this.colorAngle + this.randRange(-range, range);
    } else {
      hOffset = -this.colorAngle + this.randRange(-range, range);
    }

    let sOffset = this.randRange(-this.satRange, this.satRange);
    let lOffset = this.randRange(-this.lightRange, this.lightRange);

    let c = newColor.getHSL();
    c.h += hOffset;
    c.s += sOffset;
    c.l += lOffset;
    if (c.l < 0) {
      c.l = Math.abs(c.l) * 0.3;
    }
    // if (c.l > 0.7) {
    //   let diff = c.l - 0.7;
    //   c.l = 0.7 - diff;
    // }

    // c.s = this.randRange(0.0, 0.7);
    // c.l = this.randRange(0.0, 1.0);

    newColor.setHSL(c.h, c.s, c.l);

    // newColor.offsetHSL(hOffset, sOffset, lOffset);

    return {r: Math.round(newColor.r*255),
            g: Math.round(newColor.g*255),
            b: Math.round(newColor.b*255)};

  }

  // randomColor() {
  //
  //   let newColor = this.baseColor.clone();
  //
  //   let hOffset = 0.0;
  //   let range = 0.1;
  //   let n = this.randRange(0,1);
  //   if (n < 0.33) {
  //     hOffset = 0.0 + this.randRange(-range, range);
  //   } else if (n < 0.66) {
  //     hOffset = this.colorAngle + this.randRange(-range, range);
  //   } else {
  //     hOffset = -this.colorAngle + this.randRange(-range, range);
  //   }
  //
  //   newColor.offsetHSL(hOffset, 0, 0);
  //   let c = newColor.getHSL();
  //   newColor.setHSL(c.h, this.randRange(0.0, 0.8), this.randRange(0.0, 0.6));
  //
  //   return {r: Math.round(newColor.r*255),
  //           g: Math.round(newColor.g*255),
  //           b: Math.round(newColor.b*255)};
  //
  // }

  toCanvasColor(c) {
    return "rgba("+Math.round(c.r*255)+", "+Math.round(c.g*255)+", "+Math.round(c.b*255)+", 1.0)";
  }

  randRange(low, high) {
    let range = high - low;
    let n = window.rng() * range;
    return low + n;
  }

  mix(v1, v2, amount) {
    let dist = v2 - v1;
    return v1 + (dist * amount);
  }

}
// Biome --------------------------

class Atmosphere {

  constructor() {
    this.view = new THREE.Object3D();

    this.time = 0.0;

    this.atmo1 = 0.5;
    this.atmo2 = 0.5;
    this.atmo3 = 1.0;
    this.atmo4 = 0.5;
    this.atmo5 = 0.1;

    // this.atmo1 = 0.23;
    // this.atmo2 = 0.55;
    // this.atmo3 = 2.0;
    // this.atmo4 = 0.46;
    // this.atmo5 = 0.36;

    // this.randomizeColor();
    this.color = new THREE.Color(0x00ffff);
    this.size = 1002;
    this.atmosphere = 0.3;
    // window.gui.add(this, "atmosphere", 0.0, 1.0).step(0.01);

    // window.gui.add(this, "atmo1", 0.0, 3.0);
    // window.gui.add(this, "atmo2", 0.0, 3.0);
    // window.gui.add(this, "atmo3", 0.0, 3.0);
    // window.gui.add(this, "atmo4", 0.0, 3.0);
    // window.gui.add(this, "atmo5", 0.0, 3.0);

    this.mat = new THREE.ShaderMaterial({
      vertexShader: shaderVertAtmosphere,
      fragmentShader: shaderFragAtmosphere,
      uniforms: {
        "time" : {type: "f", value: this.time},
        "atmo1" : {type: "f", value: this.atmo1},
        "atmo2" : {type: "f", value: this.atmo2},
        "atmo3" : {type: "f", value: this.atmo3},
        "atmo4" : {type: "f", value: this.atmo4},
        "atmo5" : {type: "f", value: this.atmo5},
        "alpha" : {type: "f", value: this.atmosphere},
        "color" : {type: "c", value: this.color}
      }
    });

    this.mat.transparent = true;
    this.mat.blending = THREE.AdditiveBlending;
    // this.mat.side = THREE.DoubleSide;

    // this.mat = new THREE.MeshStandardMaterial({color: 0xFFFFFF});

    this.geo = new THREE.IcosahedronBufferGeometry(1, 6);
    this.sphere = new THREE.Mesh(this.geo, this.mat);
    this.sphere.scale.set(this.size, this.size, this.size);
    this.view.add(this.sphere);
  }

  update() {
    this.time += this.speed;
    this.mat.uniforms.time.value = this.time;
    this.mat.uniforms.atmo1.value = this.atmo1;
    this.mat.uniforms.atmo2.value = this.atmo2;
    this.mat.uniforms.atmo3.value = this.atmo3;
    this.mat.uniforms.atmo4.value = this.atmo4;
    this.mat.uniforms.atmo5.value = this.atmo5;
    this.mat.uniforms.alpha.value = this.atmosphere;
    this.mat.uniforms.color.value = this.color;
  }

  randomize() {
    this.randomizeColor();

  }

  randomizeColor() {
    this.color = new THREE.Color();

    this.color.r = this.randRange(0.5, 1.0);
    this.color.g = this.randRange(0.5, 1.0);
    this.color.b = this.randRange(0.5, 1.0);

    this.mat.uniforms.color.value = this.color;
  }

  randRange(low, high) {
    let range = high - low;
    let n = window.rng() * range;
    return low + n;
  }
}

// Atmosphere -----------------------------------------------------------

class Map {

  constructor() {
    //
  }

  setup() {
    this.maps = [];
    this.textures = [];
    this.textureCameras = [];
    this.textureScenes = [];
    this.planes = [];
    this.geos = [];

    for (let i = 0; i < 6; i++) {
      let tempRes = 1000;
      this.textures[i] = new THREE.WebGLRenderTarget(tempRes, tempRes, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat});
  		this.textureCameras[i] = new THREE.OrthographicCamera(-tempRes/2, tempRes/2, tempRes/2, -tempRes/2, -100, 100);
  		this.textureCameras[i].position.z = 10;

  		this.textureScenes[i] = new THREE.Scene();
      this.geos[i] = new THREE.PlaneGeometry(1, 1);
  		this.planes[i] = new THREE.Mesh(this.geos[i], this.mats[i]);
  		this.planes[i].position.z = -10;
  		this.textureScenes[i].add(this.planes[i]);
  		// window.renderer.render(textureScene, textureCamera, texture, true);
  		this.maps.push(this.textures[i].texture);
    }
  }

  render(props) {
    let resolution = props.resolution;

    for (let i = 0; i < 6; i++) {

      window.renderQueue.addAction(() => {
        this.textures[i].setSize(resolution, resolution);
        this.textures[i].needsUpdate = true;
        this.textureCameras[i].left = -resolution/2;
        this.textureCameras[i].right = resolution/2;
        this.textureCameras[i].top = resolution/2;
        this.textureCameras[i].bottom = -resolution/2;
        this.textureCameras[i].updateProjectionMatrix();
        this.geos[i] = new THREE.PlaneGeometry(resolution, resolution);
        this.planes[i].geometry = this.geos[i];
    		window.renderer.render(this.textureScenes[i], this.textureCameras[i], this.textures[i], true);
        this.geos[i].dispose();

      });

    }
  }

}
// Map ----------------------------------------------------------------------------------------------
class NoiseMap extends Map {

  constructor() {
    super();
    this.setup();
    super.setup();
  }

  setup() {
    this.mats = [];

    for (let i = 0; i < 6; i++) {
      this.mats[i] = new THREE.ShaderMaterial({
        uniforms: {
          index: {type: "i", value: i},
          seed: {type: "f", value: 0},
          resolution: {type: "f", value: 0},
          res1: {type: "f", value: 0},
          res2: {type: "f", value: 0},
          resMix: {type: "f", value: 0},
          mixScale: {type: "f", value: 0},
          doesRidged: {type: "f", value: 0}
        },
        vertexShader: vertShaderTexture,
        fragmentShader: fragShaderNoiseMap,
        transparent: true,
        depthWrite: false
      });
    }
  }

  render(props) {
    // props.seed
    // props.resolution
    // props.res1
    // props.res2
    // props.resMix
    // props.mixScale

    let resolution = props.resolution;

    for (let i = 0; i < 6; i++) {
      this.mats[i].uniforms.seed.value = props.seed;
      this.mats[i].uniforms.resolution.value = props.resolution;
      this.mats[i].uniforms.res1.value = props.res1;
      this.mats[i].uniforms.res2.value = props.res2;
      this.mats[i].uniforms.resMix.value = props.resMix;
      this.mats[i].uniforms.mixScale.value = props.mixScale;
      this.mats[i].uniforms.doesRidged.value = props.doesRidged;
      this.mats[i].needsUpdate = true;
    }

    super.render(props);
  }

}
// Noisemap ---------------------------------------------------------------------

class TextureMap extends Map {

  constructor() {
    super();
    this.setup();
    super.setup();
  }

  setup() {
    this.mats = [];

    for (let i = 0; i < 6; i++) {
      this.mats[i] = new THREE.ShaderMaterial({
        uniforms: {
          biomeMap: {type: "t", value: new THREE.Texture()},
          heightMap: {type: "t", value: new THREE.Texture()},
          moistureMap: {type: "t", value: new THREE.Texture()}
        },
        vertexShader: vertShaderTexture,
        fragmentShader: fragShaderTextureMap,
        transparent: true,
        depthWrite: false
      });
    }
  }

  render(props) {
    // props.resolution
    // props.heightMaps[]
    // props.moistureMaps[]
    // props.biomeMap

    let resolution = props.resolution;

    for (let i = 0; i < 6; i++) {

      this.mats[i].uniforms.heightMap.value = props.heightMaps[i];
      this.mats[i].uniforms.moistureMap.value = props.moistureMaps[i];
      this.mats[i].uniforms.biomeMap.value = props.biomeMap;
      this.mats[i].needsUpdate = true;
    }

    super.render(props);
  }

}
// Texturemap -------------------------------------------------------
class NormalMap extends Map{

  constructor() {
    super();
    this.setup();
    super.setup();
  }

  setup() {
    this.mats = [];

    for (let i = 0; i < 6; i++) {
      this.mats[i] = new THREE.ShaderMaterial({
        uniforms: {
          resolution: {type: "f", value: 0},
          waterLevel: {type: "f", value: 0},
          heightMap: {type: "t", value: new THREE.Texture()},
          textureMap: {type: "t", value: new THREE.Texture()}
        },
        vertexShader: vertShaderNormalMap,
        fragmentShader: fragShaderNormalMap,
        transparent: true,
        depthWrite: false
      });
    }
  }

  render(props) {
    // props.resolution
    // props.heightMaps[]
    // props.textureMaps[]
    // props.waterLevel

    for (let i = 0; i < 6; i++) {
      this.mats[i].uniforms.resolution.value = props.resolution;
      this.mats[i].uniforms.waterLevel.value = props.waterLevel;
      this.mats[i].uniforms.heightMap.value = props.heightMaps[i];
      this.mats[i].uniforms.textureMap.value = props.textureMaps[i];
      this.mats[i].needsUpdate = true;
    }

    super.render(props);
  }

}
// Normalmap ------------------------------------------------------------------

class RoughnessMap extends Map {

  constructor() {
    super();
    this.setup();
    super.setup();
  }

  setup() {
    this.mats = [];

    for (let i = 0; i < 6; i++) {
      this.mats[i] = new THREE.ShaderMaterial({
        uniforms: {
          resolution: {type: "f", value: 0},
          waterLevel: {type: "f", value: 0},
          heightMap: {type: "t", value: new THREE.Texture()}
        },
        vertexShader: vertShaderTexture,
        fragmentShader: fragShaderRoughnessMap,
        transparent: true,
        depthWrite: false
      });
    }
  }

  render(props) {
    // props.resolution
    // props.heightMaps[]
    // props.waterLevel

    for (let i = 0; i < 6; i++) {
      this.mats[i].uniforms.resolution.value = props.resolution;
      this.mats[i].uniforms.waterLevel.value = props.waterLevel;
      this.mats[i].uniforms.heightMap.value = props.heightMaps[i];
      this.mats[i].needsUpdate = true;
    }

    super.render(props);
  }

}
// Roughnessmap -----------------------------------------------------

class CloudMap extends Map {

  constructor() {
    super();
    this.setup();
    super.setup();
  }

  setup() {
    this.mats = [];

    for (let i = 0; i < 6; i++) {
      this.mats[i] = new THREE.ShaderMaterial({
        uniforms: {
          index: {type: "i", value: i},
          seed: {type: "f", value: 0},
          resolution: {type: "f", value: 0},
          res1: {type: "f", value: 0},
          res2: {type: "f", value: 0},
          resMix: {type: "f", value: 0},
          mixScale: {type: "f", value: 0}
        },
        vertexShader: vertShaderTexture,
        fragmentShader: fragShaderCloudMap,
        transparent: true,
        depthWrite: false
      });
    }
  }

  render(props) {
    // props.seed
    // props.resolution
    // props.res1
    // props.res2
    // props.resMix
    // props.mixScale

    for (let i = 0; i < 6; i++) {
      this.mats[i].uniforms.seed.value = props.seed;
      this.mats[i].uniforms.resolution.value = props.resolution;
      this.mats[i].uniforms.res1.value = props.res1;
      this.mats[i].uniforms.res2.value = props.res2;
      this.mats[i].uniforms.resMix.value = props.resMix;
      this.mats[i].uniforms.mixScale.value = props.mixScale;
      this.mats[i].needsUpdate = true;
    }

    super.render(props);
  }


}
// Cloudmap ----------------------------------------------------------

class Clouds {

  constructor() {
    this.view = new THREE.Object3D();

    this.materials = [];
    this.roughness = 0.9;
    this.metalness = 0.5;
    this.normalScale = 5.0;
    this.clouds = 1.0;


    this.resolution = 1024;
    this.size = 1001;


    this.color = new THREE.Color(0xffffff);

    this.cloudColor = [this.color.r*255, this.color.g*255, this.color.b*255];

    this.cloudMaps = [];

    this.setup();


    let cloudControl = window.gui.add(this, "clouds", 0.0, 1.0);
    cloudControl.onChange(value => { this.updateMaterial(); });

    let colorControl = window.gui.addColor(this, "cloudColor");
    colorControl.onChange(value => {
      this.color.r = value[0] / 255;
      this.color.g = value[1] / 255;
      this.color.b = value[2] / 255;
      this.updateMaterial();
    });

  }

  update() {
    //
  }

  setup() {

    this.cloudMap = new CloudMap();
    this.cloudMaps = this.cloudMap.maps;

    for (let i=0; i<6; i++) {
      let material = new THREE.MeshStandardMaterial({
        color: this.color,
        transparent: true,
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
    this.sphere = new THREE.Mesh(geo, this.materials);
    this.view.add(this.sphere);
  }

  render(props) {
    this.seed = this.randRange(0, 1000);
    let cloudSize = this.randRange(0.5, 1.0);

    let mixScale = this.map_range(props.waterLevel*props.waterLevel, 0, 0.8, 0.0, 3.0);


    this.cloudMap.render({
      seed: this.seed,
      resolution: this.resolution,
      res1: this.randRange(0.1, 1.0),
      res2: this.randRange(0.1, 1.0),
      resMix: this.randRange(0.1, 1.0),
      mixScale: this.randRange(0.1, 1.0)
    });

    this.updateMaterial();
  }

  map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
  }

  updateMaterial() {
    for (let i=0; i<6; i++) {
      let material = this.materials[i];
      material.roughness = this.roughness;
      material.metalness = this.metalness;
      material.opacity = this.clouds;
      material.map = this.cloudMaps[i],
      // material.alphaMap = this.cloudMaps[i],
      // material.bumpMap = this.cloudMaps[i],
      // material.bumpScale = 1.0,
      material.color = this.color
    }
  }

  randomizeColor() {

    this.color.r = this.randRange(0.7, 1.0);
    this.color.g = this.randRange(0.7, 1.0);
    this.color.b = this.randRange(0.7, 1.0);

    this.updateMaterial();
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
// Clouds -------------------------------------

class StarMap extends Map {

  constructor() {
    super();
    this.setup();
    super.setup();
  }

  setup() {
    this.mats = [];

    for (let i = 0; i < 6; i++) {
      this.mats[i] = new THREE.ShaderMaterial({
        uniforms: {
          index: {type: "i", value: i},
          seed: {type: "f", value: 0},
          resolution: {type: "f", value: 0},
          res1: {type: "f", value: 0},
          res2: {type: "f", value: 0},
          resMix: {type: "f", value: 0},
          mixScale: {type: "f", value: 0},
          nebulaeMap: {type: "t", value: new THREE.Texture()}
        },
        vertexShader: vertShaderTexture,
        fragmentShader: fragShaderStarMap,
        transparent: true,
        depthWrite: false
      });
    }
  }

  render(props) {
    // props.seed
    // props.resolution
    // props.res1
    // props.res2
    // props.resMix
    // props.mixScale

    for (let i = 0; i < 6; i++) {
      this.mats[i].uniforms.seed.value = props.seed;
      this.mats[i].uniforms.resolution.value = props.resolution;
      this.mats[i].uniforms.res1.value = props.res1;
      this.mats[i].uniforms.res2.value = props.res2;
      this.mats[i].uniforms.resMix.value = props.resMix;
      this.mats[i].uniforms.mixScale.value = props.mixScale;
      this.mats[i].uniforms.nebulaeMap.value = props.nebulaeMap;
      this.mats[i].needsUpdate = true;
    }

    super.render(props);
  }


}
// Starmap ----------------------------------------------------------

class Stars {

  constructor() {
    this.view = new THREE.Object3D();

    this.materials = [];
    this.roughness = 0.8;
    this.metalness = 0.5;
    this.emissiveIntensity = 1.0;

    this.resolution = 1024;
    this.size = 50000;

    this.starMaps = [];

    this.setup();
    // this.render();

  }

  update() {
    //
  }

  setup() {

    this.starMap = new StarMap();
    this.starMaps = this.starMap.maps;

    for (let i=0; i<6; i++) {
      let material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xFFFFFF),
        side: THREE.BackSide,
      });
      this.materials[i] = material;
    }

    let geo = new THREE.BoxGeometry(1, 1, 1, 32, 32, 32);
    let radius = this.size;
    for (var i in geo.vertices) {
  		var vertex = geo.vertices[i];
  		vertex.normalize().multiplyScalar(radius);
  	}
    this.computeGeometry(geo);
    this.sphere = new THREE.Mesh(geo, this.materials);
    this.view.add(this.sphere);
  }

  render(props) {

    this.seed = this.randRange(0, 1000);

    this.starMap.render({
      seed: this.seed,
      resolution: this.resolution,
      res1: this.randRange(0.5, 2.0),
      res2: this.randRange(0.5, 2.0),
      resMix: this.randRange(0.5, 2.0),
      mixScale: 0.5,
      color1: this.color1,
      color2: this.color2,
      color3: this.color3,
      nebulaeMap: props.nebulaeMap
    });

    this.updateMaterial();
  }

  updateMaterial() {
    for (let i=0; i<6; i++) {
      let material = this.materials[i];
      material.map = this.starMaps[i];
    }
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
// Stars -------------------------------------

class NebulaMap extends Map {

  constructor() {
    super();
    this.setup();
    super.setup();
  }

  setup() {
    this.mats = [];

    for (let i = 0; i < 6; i++) {
      this.mats[i] = new THREE.ShaderMaterial({
        uniforms: {
          index: {type: "i", value: i},
          seed: {type: "f", value: 0},
          resolution: {type: "f", value: 0},
          res1: {type: "f", value: 0},
          res2: {type: "f", value: 0},
          resMix: {type: "f", value: 0},
          mixScale: {type: "f", value: 0},
          nebulaeMap: {type: "t", value: new THREE.Texture()}
        },
        vertexShader: vertShaderTexture,
        fragmentShader: fragShaderNebulaMap,
        transparent: true,
        depthWrite: false
      });
    }
  }

  render(props) {
    // props.seed
    // props.resolution
    // props.res1
    // props.res2
    // props.resMix
    // props.mixScale

    for (let i = 0; i < 6; i++) {
      this.mats[i].uniforms.seed.value = props.seed;
      this.mats[i].uniforms.resolution.value = props.resolution;
      this.mats[i].uniforms.res1.value = props.res1;
      this.mats[i].uniforms.res2.value = props.res2;
      this.mats[i].uniforms.resMix.value = props.resMix;
      this.mats[i].uniforms.mixScale.value = props.mixScale;
      this.mats[i].uniforms.nebulaeMap.value = props.nebulaeMap;
      this.mats[i].needsUpdate = true;
    }

    super.render(props);
  }


}
// Nebulamap --------------------------------------------

class Nebula {

  constructor() {
    this.view = new THREE.Object3D();

    this.materials = [];
    this.roughness = 0.8;
    this.metalness = 0.5;
    this.emissiveIntensity = 1.0;

    this.resolution = 1024;
    this.size = 45000;
    this.nebula = 1.0;

    this.skyMaps = [];

    this.setup();
    // this.render();

  }

  update() {
    //
  }

  setup() {

    this.skyMap = new NebulaMap();
    this.skyMaps = this.skyMap.maps;

    for (let i=0; i<6; i++) {
      let material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xFFFFFF),
        side: THREE.BackSide,
        transparent: true,
        opacity: this.nebula
      });
      this.materials[i] = material;
    }

    let geo = new THREE.BoxGeometry(1, 1, 1, 32, 32, 32);
    let radius = this.size;
    for (var i in geo.vertices) {
  		var vertex = geo.vertices[i];
  		vertex.normalize().multiplyScalar(radius);
  	}
    this.computeGeometry(geo);
    this.sphere = new THREE.Mesh(geo, this.materials);
    this.view.add(this.sphere);
  }

  render(props) {

    this.seed = this.randRange(0, 1000);

    let min = 1.0;
    let max = 3.0;

    this.skyMap.render({
      seed: this.seed,
      resolution: this.resolution,
      res1: this.randRange(min, max),
      res2: this.randRange(min, max),
      resMix: this.randRange(min, max),
      mixScale: this.randRange(min, max),
      color1: this.color1,
      color2: this.color2,
      color3: this.color3,
      nebulaeMap: props.nebulaeMap
    });

    this.updateMaterial();
  }

  updateMaterial() {
    for (let i=0; i<6; i++) {
      let material = this.materials[i];
      material.map = this.skyMaps[i];
      material.opacity = this.nebula;
    }
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
// Nebula ----------------------------------------

class SunTexture {

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.id = "sunCanvas";
    this.width = 1024;
    this.height = 1024;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.width = "500px";
    this.canvas.style.height = "500px";
    this.ctx = this.canvas.getContext("2d");

    this.texture = new THREE.CanvasTexture(this.canvas);

    document.body.appendChild(this.canvas);
    this.toggleCanvasDisplay(false);
  }


  generateTexture() {

    let h = this.randRange(0.0, 1.0);
    let s = this.randRange(0.0, 0.5);
    let l = this.randRange(0.2, 0.5);
    this.baseColor = new THREE.Color().setHSL(h, s, l);

    this.baseHue = this.randRange(0.0, 1.0);


    this.clear();
    this.drawBaseGradient();
    this.drawStarGradient();
    this.drawBeams();
    this.drawHalo();
    // this.drawBaseGradient2();


    this.texture = new THREE.CanvasTexture(this.canvas);
  }

  clear() {
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawBaseGradient() {
    let x = this.width/2;
    let y = this.width/2;
    let r1 = 0;
    let r2 = this.width/2;

    let h = this.baseHue;
    let s = 0.8;
    let l = 0.1;
    // console.log("h = " + h);

    let gradient = this.ctx.createRadialGradient(x,y,r1,x,y,r2);
    this.addColorToGradient(0, {h:h, s:s, l:l, a:0.5}, gradient);
    this.addColorToGradient(0.4, {h:h, s:s, l:l, a:0.7}, gradient);
    this.addColorToGradient(0.6, {h:h-0.05, s:s, l:l, a:0.3}, gradient);
    this.addColorToGradient(0.9, {h:h, s:s, l:l, a:0}, gradient);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawStarGradient() {
    let x = this.width/2;
    let y = this.width/2;
    let r1 = 0;
    let r2 = this.width/2;

    let h = this.baseHue-0.1;
    let s = 0.6;
    let l = 0.4;
    // console.log("h = " + h);

    let size = 0.03;
    size = this.randRange(0.03, 0.07);

    let gradient = this.ctx.createRadialGradient(x,y,r1,x,y,r2);
    this.addColorToGradient(0, {h:h, s:s, l:1.0, a:1.0}, gradient);
    this.addColorToGradient(size, {h:h, s:s, l:0.9 , a:1.0}, gradient);
    this.addColorToGradient(size*2, {h:h, s:s, l:0.6, a:0.9}, gradient);
    this.addColorToGradient(size*6.0, {h:h, s:s, l:0.4, a:0.4}, gradient);
    this.addColorToGradient(size*11, {h:h, s:s, l:0.0, a:0.0}, gradient);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawBeams() {

    let x = this.width/2;
    let y = this.width/2;
    let r1 = 0;
    let r2 = this.width/2;

    let h = this.baseHue;
    let s = 1.0;
    let l = 0.9;
    // console.log("h = " + h);

    let dist = this.randRange(0.5, 1.0);
    dist = 1;
    let gradient = this.ctx.createRadialGradient(x,y,r1,x,y,r2);
    this.addColorToGradient(0, {h:h, s:s, l:l, a:0.1}, gradient);
    this.addColorToGradient(0.15, {h:h, s:s, l:l, a:0.025}, gradient);
    this.addColorToGradient(dist, {h:h, s:s, l:l , a:0.0}, gradient);

    let numBeams = Math.floor(this.randRange(1, 5));
    numBeams *= 2;
    let size = this.randRange(0.05, 0.2);
    let angleStep = Math.PI*2 / numBeams;
    for (let i=0; i<numBeams; i++) {
      let a = angleStep*i;

      for (let j=0; j<5; j++) {
        a += 0.02;
        this.ctx.beginPath();
        this.ctx.moveTo(x,y);
        this.ctx.arc(x,y,r2,a,a+size);
        this.ctx.lineTo(x,y);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
      }
    }

    // dist = this.randRange(0.9, 1.0);
    // numBeams = Math.floor(this.randRange(2, 8));
    // numBeams *= 2;
    // l = this.randRange(0.5, 1.0);
    size = this.randRange(0.01, 0.1);
    gradient = this.ctx.createRadialGradient(x,y,r1,x,y,r2);
    this.addColorToGradient(0, {h:h, s:s, l:l, a:0.1}, gradient);
    this.addColorToGradient(0.15, {h:h, s:s, l:l, a:0.025}, gradient);
    this.addColorToGradient(dist, {h:h, s:s, l:l , a:0.0}, gradient);
    let offset = this.randRange(0.1, Math.PI);
    for (let i=0; i<numBeams; i++) {
      let a = angleStep*i+offset;

      for (let j=0; j<3; j++) {
        a += 0.02;
        this.ctx.beginPath();
        this.ctx.moveTo(x,y);
        this.ctx.arc(x,y,r2,a,a+size);
        this.ctx.lineTo(x,y);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
      }
    }

  }

  drawHalo() {
    let x = this.width/2;
    let y = this.width/2;
    let r1 = 0;
    let r2 = this.width/2;

    let h = this.baseHue+this.randRange(-0.2, 0.2);

    // h = this.randRange(0,1);
    let s = 1.0;
    let l = 0.7;
    // console.log("h = " + h);

    let pos = 0.23;
    pos = this.randRange(0.1, 0.2);
    let width = 0.05;
    // width = this.randRange(0.01, 0.03);

    let gradient = this.ctx.createRadialGradient(x,y,r1,x,y,r2);
    this.addColorToGradient(pos-width, {h:h, s:s, l:l, a:0.0}, gradient);
    this.addColorToGradient(pos, {h:h, s:s, l:l, a:0.2}, gradient);
    this.addColorToGradient(pos+width, {h:h, s:s, l:l, a:0.0}, gradient);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  addColorToGradient(pos, color, gradient) {
    gradient.addColorStop(pos, this.getRGBAString(color));
  }

  getRGBAString(color) {
    let threeColor = new THREE.Color().setHSL(color.h, color.s, color.l)
    let c = {
      r: Math.round(threeColor.r*255),
      g: Math.round(threeColor.g*255),
      b: Math.round(threeColor.b*255)
    };
    let colorString = "rgba("+c.r+", "+c.g+", "+c.b+"," + color.a + ")";
    return colorString;
  }

  toggleCanvasDisplay(value) {
    if (value) {
      this.canvas.style.display = "block";
    } else {
      this.canvas.style.display = "none";
    }
  }

  randRange(low, high) {
    let range = high - low;
    let n = window.rng() * range;
    return low + n;
  }


}
// Suntexture -----------------------------------------------

class Sun {

  constructor() {
    this.view = new THREE.Object3D();
    this.setup();
  }

  setup() {
    let loader = new THREE.TextureLoader();
    this.textureFlare = loader.load( 'assets/textures/lenseFlareSun.jpg' );
    this.textureRing = loader.load( 'assets/textures/lenseFlareRing.jpg' );
    this.textureBlur = loader.load( 'assets/textures/lenseFlareBlur.jpg' );
    // this.textureSun = loader.load( 'assets/textures/lenseFlare.jpg' );

    this.sunTexture = new SunTexture();

  }

  createLenseFlare() {

    let h = this.randRange(0,1);
    let s = 1.0;
    let l = 1.0;
    var sunColor = new THREE.Color().setHSL(h, s, l);
    var sunColor2 = new THREE.Color().setHSL(this.randRange(0,1), s, 0.5);
    let sunSize = this.randRange(1000, 2000);
    sunSize = 1500;
    this.lensFlare = new THREE.LensFlare( this.sunTexture.texture, sunSize, 0.0, THREE.AdditiveBlending, sunColor );
    this.lensFlare.add(this.sunTexture.texture, sunSize*2, 0.1, THREE.AdditiveBlending, sunColor, 0.2);


    let numFlares = 15;
    for (let i=0; i<numFlares; i++) {
      let size = this.randRange(5, 200);
      // size = Math.pow(size, 2) * 200;
      let offset = this.randRange(0.05, 0.4);
      let color = this.randomColor();
      let alpha = this.randRange(0.1, 0.3);
      this.lensFlare.add(this.textureBlur, size, offset, THREE.AdditiveBlending, color, alpha);
    }

    numFlares = 5;
    for (let i=0; i<numFlares; i++) {
      let size = this.randRange(5, 200);
      // size = Math.pow(size, 2) * 200;
      let offset = this.randRange(-0.05, -0.2);
      let color = this.randomColor();
      let alpha = this.randRange(0.1, 0.3);
      this.lensFlare.add(this.textureBlur, size, offset, THREE.AdditiveBlending, color, alpha);
    }


    let numRings = 3;
    for (let i=0; i<numRings; i++) {
      let size = this.randRange(200, 400);
      // size = Math.pow(size, 2) * 200;
      let offset = this.randRange(-0.1, 0.2);
      let color = this.randomColor();
      let alpha = this.randRange(0, 0.1);
      this.lensFlare.add(this.textureRing, size, offset, THREE.AdditiveBlending, color, alpha);
    }

    this.lensFlare.position.set(-20000, 20000, 20000);
    this.view.add( this.lensFlare );
  }

  randomColor() {
    let h = this.randRange(0, 1);
    let s = this.randRange(0, 0.9);
    let l = 0.5;
    let color = new THREE.Color().setHSL(h, s, l);
    return color;
  }

  randRange(low, high) {
    let range = high - low;
    let n = Math.random() * range;
    return low + n;
  }

  render() {

    this.sunTexture.generateTexture();
    this.view.remove(this.lensFlare);
    this.createLenseFlare();

    // this.sunTexture.generateTexture();
    //
    // this.view.remove(this.lenseFlare);
    //
    // var flareColor = new THREE.Color( 0xffffff );
    // this.lensFlare = new THREE.LensFlare( this.sunTexture.texture, 700, 0.0, THREE.AdditiveBlending, flareColor );
    // this.lensFlare.position.set(-20000, 20000, 20000);
    // this.view.add( this.lensFlare );

    // this.lensFlare.texture = this.sunTexture.texture;
    // this.lenseFlare.texture.needsUpdate = true;
    // this.sunTexture.texture.needsUpdate = true;

    // this.view.remove(this.lenseFlare);

    // var textureFlare = new THREE.TextureLoader().load( 'assets/textures/lenseFlare.jpg' );

  }

}
// Sun --------------------------------------

class Glow {

  constructor() {
    this.view = new THREE.Object3D();

    this.randomizeColor();

    this.size = 1030;
    this.glow = 1.0;

    this.c = 1.0;
    this.p = 1.4;

    // window.gui.add(this, "glow", 0.0, 1.0);

    let glowFolder = window.gui.addFolder('Glow');
    glowFolder.add(this, "c", 0, 1).step(0.01);
    glowFolder.add(this, "p", 0, 6).step(0.01);



    this.mat = new THREE.ShaderMaterial({
      vertexShader: shaderVertGlow,
      fragmentShader: shaderFragGlow,
      uniforms: {
        "c":   { type: "f", value: 1.0 },
        "p":   { type: "f", value: 1.4 },
        glowColor: { type: "c", value: new THREE.Color(0x00ffff) },
        viewVector: { type: "v3", value: window.camera.position }
      }
    });

    this.mat.transparent = true;
    this.mat.blending = THREE.AdditiveBlending;
    this.mat.side = THREE.BackSide;

    // this.mat = new THREE.MeshStandardMaterial({color: 0xFFFFFF});

    this.geo = new THREE.IcosahedronBufferGeometry(1, 6);
    this.sphere = new THREE.Mesh(this.geo, this.mat);
    this.sphere.scale.set(this.size, this.size, this.size);
    this.view.add(this.sphere);
  }

  update() {
    this.mat.uniforms.c.value = this.c;
    this.mat.uniforms.p.value = this.p;
    this.mat.uniforms.viewVector.value = new THREE.Vector3().subVectors( window.camera.position, this.sphere.position );
  }

  randomize() {
    this.randomizeColor();
    this.mat.uniforms.color.value = this.color;
  }

  randomizeColor() {
    this.color = new THREE.Color();
    this.color.r = window.rng();
    this.color.g = window.rng();
    this.color.b = window.rng();
  }
}
// Glow --------------------------------------

class NebulaeGradient {

  constructor() {

    this.canvas = document.createElement("canvas");
    this.canvas.id = "nebulaeCanvas";
    this.canvas.width = 512;
    this.canvas.height = 512;
    this.canvas.style.width = "200px";
    this.canvas.style.height = "200px";
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.ctx = this.canvas.getContext("2d");

    document.body.appendChild(this.canvas);
    this.toggleCanvasDisplay(false);
  }

  generateTexture() {

    let h = this.randRange(0.0, 1.0);
    let s = this.randRange(0.2, 0.8);
    let l = this.randRange(0.2, 0.6);
    this.baseColor = new THREE.Color().setHSL(h, s, l);
    this.colorAngle = this.randRange(0.0, 0.5);

    this.fillBaseColor();
    this.drawShapes();

    this.texture = new THREE.CanvasTexture(this.canvas);

  }

  toggleCanvasDisplay(value) {
    if (value) {
      this.canvas.style.display = "block";
    } else {
      this.canvas.style.display = "none";
    }
  }

  fillBaseColor() {
    this.ctx.fillStyle = this.toCanvasColor(this.baseColor);
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawShapes() {
    let numCircles = Math.round(this.randRange(20, 50));
    for (let i=0; i<numCircles; i++) {
      this.randomGradientCircle();
    }
  }

  randomGradientCircle() {
    let x1 = this.randRange(0, this.width);
    let y1 = this.randRange(0, this.height);
    let size = this.randRange(100, 200);
    let x2 = x1;
    let y2 = y1;
    let r1 = 0;
    let r2 = size;

    let gradient = this.ctx.createRadialGradient(x1,y1,r1,x2,y2,r2);

    let c = this.randomColor();

    gradient.addColorStop(0, "rgba("+c.r+", "+c.g+", "+c.b+", 1.0)");
    gradient.addColorStop(1, "rgba("+c.r+", "+c.g+", "+c.b+", 0.0)");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }


  randomColor() {

    let newColor = this.baseColor.clone();

    let hOffset = 0.0;
    let range = 0.1;
    let n = this.randRange(0,1);
    if (n < 0.33) {
      hOffset = 0.0 + this.randRange(-range, range);
    } else if (n < 0.66) {
      hOffset = this.colorAngle + this.randRange(-range, range);
    } else {
      hOffset = -this.colorAngle + this.randRange(-range, range);
    }

    let sOffset = this.randRange(-0.4, 0.2);
    let lOffset = this.randRange(-0.4, 0.2);

    newColor.offsetHSL(hOffset, sOffset, lOffset);

    return {r: Math.round(newColor.r*255),
            g: Math.round(newColor.g*255),
            b: Math.round(newColor.b*255)};

  }

  toCanvasColor(c) {
    return "rgba("+Math.round(c.r*255)+", "+Math.round(c.g*255)+", "+Math.round(c.b*255)+", 1.0)";
  }

  randRange(low, high) {
    let range = high - low;
    let n = window.rng() * range;
    return low + n;
  }

  mix(v1, v2, amount) {
    let dist = v2 - v1;
    return v1 + (dist * amount);
  }

}
// Nebulaegradient -------------------------







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
    window.rng = prng_arc4(this.seedString); //seedrandom(this.seedString);
    
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
  	//geometry.computeFaceNormals();
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
// Planet ---------------------------------------------------------------------------















export default () => {
  const app = useApp();

  app.name = 'Procedural Planet';

  window.renderQueue = new RenderQueue();

  const planet = new Planet();
  app.add(planet.view);

  window.renderQueue.update();
  planet.update();

  useFrame(() => {

  });

  return app;
};