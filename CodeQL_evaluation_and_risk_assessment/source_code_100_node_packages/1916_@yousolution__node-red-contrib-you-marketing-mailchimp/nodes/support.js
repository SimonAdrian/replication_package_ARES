process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const mailchimp = require('@mailchimp/mailchimp_marketing');

async function sendRequest(resourceAction, pathParams, bodyPost, config) {
  const entity = resourceAction.entity;
  const method = resourceAction.method;
  const params = pathParams.map(param => param.value);

  mailchimp.setConfig({
    accessToken: config.token,
    server: config.server,
  });

  try {
    const response = await mailchimp[entity][method](...params, bodyPost);
    return response;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  sendRequest: sendRequest,
};
