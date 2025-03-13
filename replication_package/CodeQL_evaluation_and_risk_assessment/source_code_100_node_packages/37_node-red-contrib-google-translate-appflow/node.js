module.exports = function (RED) {
  "use strict";
  var translate = require("@vitalets/google-translate-api");
  var { HttpProxyAgent } = require("http-proxy-agent");

  function GoogleTranslateNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var agent;
    if (config.host && config.port) {
      agent = new HttpProxyAgent(`http://${config.host}:${config.port}`);
    }
    this.on("input", function (msg) {
      const conf = {
        from: config.from === "prog" ? msg.payload.from : config.from,
        to: config.from === "prog" ? msg.payload.to : config.to,
      };
      if (agent) conf.fetchOptions = { agent };

      const phrase = msg.payload?.phrase ?? msg.payload;

      translate
        .translate(phrase + "", conf)
        .then(function (res) {
          msg.payload = res.text;
          node.send(msg);
        })
        .catch(function (err) {
          node.error(err);
        });
    });
  }

  RED.nodes.registerType("google-translate", GoogleTranslateNode);
};
