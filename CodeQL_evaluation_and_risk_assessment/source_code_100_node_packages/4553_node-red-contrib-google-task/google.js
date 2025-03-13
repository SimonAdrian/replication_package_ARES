module.exports = function(RED) {
    "use strict";
    const request = require('request');
    const { google } = require('googleapis');

    function GoogleNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.config = RED.nodes.getNode(config.google);
        node.scopes = config.scopes;

        const oauth2Client = new google.auth.OAuth2(
            node.config.credentials.clientId,
            node.config.credentials.clientSecret
        );
        oauth2Client.setCredentials({
            access_token: node.config.credentials.accessToken,
            refresh_token: node.config.credentials.refreshToken,
            token_type: node.config.credentials.tokenType,
            expiry_date: node.config.credentials.expireTime
        });
        oauth2Client.on('tokens', (tokens) => {
            if (tokens.refresh_token) {
                node.config.credentials.refreshToken = tokens.refresh_token;
                RED.nodes.addCredentials(config.google, node.config.credentials);
            }
        });

        oauth2Client.setCredentials(JSON.parse(node.config.credentials.token));

        node.on('input', function(msg) {
            // call api add task
            var accessToken = oauth2Client.credentials.access_token;
            // console.log("Access token: ", accessToken)
            var taskListId = config.taskListId
                // console.log("Task List Id: ", taskListId)
            var taskTitle = config.taskTitle
                // console.log("Title: ", taskTitle)
            const postdata = {
                url: `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`,
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Authorization': "Bearer " + accessToken
                },
                json: {
                    'title': taskTitle
                }

            };
            request.post(postdata, (error, response, body) => {
                if (!error) {
                    msg.payload = 'Add task success'
                } else {
                    msg.payload = 'Add task failed'
                }
                node.send(msg)
            });
        });
    }

    RED.nodes.registerType("google", GoogleNode);

};