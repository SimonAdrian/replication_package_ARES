'use strict';

module.exports = function(RED) {
  function ParamsSetup(config) {
    RED.nodes.createNode(this, config);

    this.inputFormat = config.inputFormat || '';
    this.inputParamsString = config.inputParamsString || '';
    this.inputSource = config.inputSource;
    this.outputFormat = config.outputFormat || 'gif';
    this.outputParamsString = config.outputParamsString || '';
  }

  RED.nodes.registerType("princip-ffmpeg-params-setup", ParamsSetup);
}
