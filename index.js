import * as THREE from 'three';
import metaversefile from 'metaversefile';
import Planet from './views/Planet.js'
import RenderQueue from './views/RenderQueue.js'
const {useApp, useFrame, useLoaders, usePhysics, useCleanup} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

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