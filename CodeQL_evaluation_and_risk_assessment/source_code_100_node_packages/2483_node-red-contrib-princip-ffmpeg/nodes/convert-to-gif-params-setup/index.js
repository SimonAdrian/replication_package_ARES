'use strict';

module.exports = function(RED) {
  function ParamsSetup(config) {
    RED.nodes.createNode(this, config);

    this.inputParamsString = config.inputParamsString || '';
    this.inputSource = config.inputSource;
    this.outputParamsString = config.outputParamsString || '';
    this.speed = config.speed || '5.0';
  }

  RED.nodes.registerType("princip-ffmpeg-conver-to-gif-params-setup", ParamsSetup);
}
