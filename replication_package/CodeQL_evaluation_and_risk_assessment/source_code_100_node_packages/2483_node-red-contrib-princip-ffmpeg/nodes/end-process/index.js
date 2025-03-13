'use strict';

var utils = require('../../utils');

module.exports = function(RED) {
  function EndProcess(config) {
    RED.nodes.createNode(this, config);

    var node = this;
    this.on('input', function(msg) {
      if (node.useParamsFromPayload) {
        node.params = msg.payload;
      } else {
        node.params = RED.nodes.getNode(config.params);
      }

      var processes = node.context().global.get('princip-ffmpeg-processes') || [];
      for (var index in processes) {
        var rec = processes[index];
        if (rec.params.inputSource == node.params.inputSource) {
          var proc = rec.proc;

          processes.splice(index, 1);

          var buffer = utils.killChildProcess(node, proc);
          node.send({payload: buffer});
        }
      }

      utils.setProcesses(node, processes);
    });
  }

  RED.nodes.registerType("princip-ffmpeg-end-process", EndProcess);
}
