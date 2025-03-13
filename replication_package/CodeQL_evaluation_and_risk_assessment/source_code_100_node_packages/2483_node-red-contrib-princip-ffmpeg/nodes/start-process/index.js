'use strict';

var pfstb = require('princip-ffmpeg-stream-to-buffer');
var utils = require('../../utils');

module.exports = function(RED) {
  function StartProcess(config) {
    RED.nodes.createNode(this, config);

    var node = this;
    this.on('input', function(msg) {
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

      try {
        var proc = pfstb.stream(node.params);
        processes.push({params: node.params, proc: proc});
      } catch(err) {
        node.error(`Can\'t create process for input source ${node.params.inputSource}. Details: ${err}`);
      }

      utils.setProcesses(node, processes);
    });
  }

  RED.nodes.registerType("princip-ffmpeg-start-process", StartProcess);
}
