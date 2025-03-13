'use strict';

module.exports = function(RED) {
  function ParamsSetup(config) {
    RED.nodes.createNode(this, config);

    this.inputFormat = config.inputFormat || '';
    this.inputParamsString = config.inputParamsString || '';
    this.inputSource = config.inputSource;
    this.outputParamsString = config.outputParamsString || '';
  }

  RED.nodes.registerType("princip-ffmpeg-thumbnail-params-setup", ParamsSetup);
}
