'use strict';

var pfstb = require('princip-ffmpeg-stream-to-buffer');
var utils = require('../../utils');

module.exports = function(RED) {
  function Thumbnail(config) {
    RED.nodes.createNode(this, config);

    var node = this;
    this.on('input',function(msg) {
      if (node.useParamsFromPayload) {
        node.params = msg.payload;
      } else {
        node.params = RED.nodes.getNode(config.params);
      }

      var inputSource = node.params.inputSource || '';
      if (!inputSource) {
        node.error(`Input source is needed.`);
        return;
      }

      var processes = utils.getProcesses(node);

      utils.updateInputParamsString(node);
      node.params.outputFormat = 'image2pipe';
      node.params.outputParamsString = node.params.outputParamsString.replace('-t 1', '').replace(/(^\s+|\s+$)/g, "");
      node.params.outputParamsString = (!node.params.outputParamsString) ? '-t 1' : node.params.outputParamsString + ' -t 1';
      node.params.onProcessClose = function(buffer) {
        var processes = utils.getProcesses(node);
        utils.setProcesses(node, processes);
        node.send({payload: buffer});
      }

      try {
        var proc = pfstb.stream(node.params);
        processes.push({params: node.params, proc: proc});
      } catch(err) {
        utils.setProcesses(node, processes);
        node.error(`Can\'t create process for input source ${node.params.inputSource}. Details: ${err}`);
      }
    });
  }

  RED.nodes.registerType("princip-ffmpeg-thumbnail", Thumbnail);
}
