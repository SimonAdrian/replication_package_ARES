'use strict';

function killChildProcess(node, proc) {
  try {
    return proc.killProcess();
  } catch(err) {
    node.error(`Can\'t kill child process with pid ${proc.pid}! Details: ${err}`);
    return;
  }
}

module.exports = {
  killChildProcess: killChildProcess,

  getProcesses: function(node) {
    var processes = node.context().global.get('princip-ffmpeg-processes') || [];
    for (var index in processes) {
      var rec = processes[index];
      if (!rec.params) {
        processes.splice(index, 1);
        continue;
      }

      if (rec.params.inputSource == node.params.inputSource) {
        killChildProcess(node, rec.proc);
        processes.splice(index, 1);
      }
    }

    return processes;
  },

  setProcesses: function(node, processes) {
    node.context().global.set('princip-ffmpeg-processes', processes);
  },

  updateInputParamsString: function(node) {
    node.params.inputParamsString = node.params.inputParamsString.replace('-loglevel quiet', '').replace(/(^\s+|\s+$)/g, "");
    node.params.inputParamsString = (!node.params.inputParamsString) ? '-loglevel quiet' : node.params.inputParamsString + ' -loglevel quiet';
  }
}
