process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const axios = require('axios');
const resources = require('../resources/resources.json');
const Support = require('./support');

module.exports = function (RED) {
  function MarketingMailchimpNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    // reset status
    node.status({});

    node.on('input', async (msg, send, done) => {
      let resourceAction = {};

      resources[config.resourceName].forEach((action) => {
        if (action.name == config.resource) {
          resourceAction = action;
        }
      });

      const pathParams = [];
      resourceAction.pathParams.forEach((param) => {
        pathParams.push({
          name: param.name,
          value: config[param.name],
        });
      });

      try {
        if (resourceAction.bodyParams) {
          const data = msg[config.bodyPost];
          if (!data) {
            node.status({ fill: 'red', shape: 'dot', text: 'bodyPost must have value' });
            done(new Error('bodyPost must have value'));
            return;
          }
        }

        const result = await Support.sendRequest(resourceAction, pathParams, msg[config.bodyPost], config);
        msg.payload = result;
        msg.statusCode = result.status;
        node.status({ fill: 'green', shape: 'dot', text: 'success' });
        node.send(msg);
      } catch (error) {
        node.status({ fill: 'red', shape: 'dot', text: 'error' });
        done(error);
      }
    });
  }

  RED.httpAdmin.get('/resources', RED.auth.needsPermission('marketingMailchimp.read'), (req, res) => {
    res.json(resources);
  });

  RED.nodes.registerType('marketingMailchimp', MarketingMailchimpNode, {});
};
