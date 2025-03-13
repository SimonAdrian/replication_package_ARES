'use strict';

var pfstb = require('princip-ffmpeg-stream-to-buffer');
var util = require('util');
var utils = require('../../utils');

module.exports = function(RED) {
  function ConverToGif(config) {
    RED.nodes.createNode(this, config);

    var node = this;
    this.on('input', function(msg) {
      if (node.useParamsFromPayload) {
        node.params = msg.payload;
      } else {
        node.params = RED.nodes.getNode(config.params);
      }

      var isArray = util.isArray(msg.inputData);
      var isBuffer = Buffer.isBuffer(msg.inputData);

      if (isArray || isBuffer) {
        node.params.inputSource = 'pipe:0';

        if (!msg.inputData) {
          node.error(`Input data is needed.`);
          return;
        }
      }

      if (!node.params.inputSource) {
        node.error(`Input source is needed.`);
        return;
      }

      var processes = utils.getProcesses(node);

      var speed = `-filter:v setpts=${node.params.speed}*PTS`;

      utils.updateInputParamsString(node);
      node.params.outputFormat = 'gif';
      node.params.outputParamsString = (!node.params.outputParamsString) ? speed : node.params.outputParamsString + ' ' + speed;
      node.params.onProcessClose = function(buffer) {
        var processes = utils.getProcesses(node);
        utils.setProcesses(node, processes);
        node.send({payload: buffer});
      }

      try {
        var proc = pfstb.stream(node.params);
        processes.push({params: node.params, proc: proc});

        if (isBuffer) {
          proc.writeToInput(msg.inputData);
          proc.endWritingToInput();
        } else if (isArray) {
          for (var chunk of msg.inputData) {
            proc.writeToInput(chunk);
          }
          proc.endWritingToInput();
        }

      } catch(err) {
        utils.setProcesses(node, processes);
        node.error(`Can\'t create process for input source ${node.params.inputSource}. Details: ${err}`);
      }
    });
  }

  RED.nodes.registerType("princip-ffmpeg-conver-to-gif", ConverToGif);
}
