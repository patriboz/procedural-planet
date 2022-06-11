class RenderQueue {

  constructor() {
    this.actions = [];
    this.callbacks = [];
    this.skipFrame = false;
    this.lastTime = 0;

    this.totalActions = 0;
  }

  start() {
    this.startFrame = true;
    this.lastTime = Date.now();
  }

  update() {
    if (this.startFrame == false) {
      if (this.actions.length > 0) {
        this.doNextAction();
      } else {
        this.checkCallbacks();
      }
    } else {
      this.startFrame = false;
      // first frame after actions added
      this.totalActions = this.actions.length;
    }
  }

  doNextAction() {

    let thisTime = Date.now();
    let totalTime = thisTime - this.lastTime;

    this.lastTime = thisTime;

    this.actions[0]();
    this.actions.shift();

    let progress = this.actions.length / this.totalActions;
    progress = 1.0 - progress;
  }

  addAction(action) {
    this.actions.push(action);
  }

  addCallback(callback) {
    this.callbacks.push(callback);
  }

  checkCallbacks() {
    if (this.callbacks.length > 0) {
      this.executeCallbacks();
    }
  }

  executeCallbacks() {
    for (let i=0; i<this.callbacks.length; i++) {
      this.callbacks[i]();
      // console.log("rendering complete");
    }

    this.callbacks = [];
  }

}

export default RenderQueue;
