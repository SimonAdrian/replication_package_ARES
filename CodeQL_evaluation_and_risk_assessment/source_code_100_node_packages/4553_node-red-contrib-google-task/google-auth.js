module.exports = function(RED) {
    "use strict";
    const crypto = require("crypto");
    const request = require('request');
    const url = require('url');
    const { google } = require('googleapis');
    const keyNodeAuth = "GOOGLE_AUTH";

    function GoogleNode(n) {
        RED.nodes.createNode(this, n);
        this.displayName = n.displayName;
    }

    RED.nodes.registerType("google-credentials", GoogleNode, {
        credentials: {
            token: { type: "text" },
            displayName: { type: "text" },
            clientId: { type: "text" },
            clientSecret: { type: "password" },
            accessToken: { type: "password" },
            refreshToken: { type: "password" },
            expireTime: { type: "password" }
        }
    });

    RED.httpAdmin.get('/credentials/google-credentials', function(req, res) {
        let credentials = RED.nodes.getCredentials(keyNodeAuth);
        if (credentials) {
            res.send({
                accessToken: credentials.accessToken
            });
        } else {
            res.send({
                accessToken: null
            });
        }
    });

    RED.httpAdmin.get('/google-credentials/auth', function(req, res) {
        console.log('google-credentials/auth');
        if (!req.query.clientId || !req.query.clientSecret ||
            !req.query.id || !req.query.callback) {
            res.send(400);
            return;
        }
        const node_id = req.query.id;
        const callback = req.query.callback;
        const credentials = {
            clientId: req.query.clientId,
            clientSecret: req.query.clientSecret
        };
        const scopes = req.query.scopes;

        const csrfToken = crypto.randomBytes(18).toString('base64').replace(/\//g, '-').replace(/\+/g, '_');
        credentials.csrfToken = csrfToken;
        credentials.callback = callback;
        res.cookie('csrf', csrfToken);
        res.redirect(url.format({
            protocol: 'https',
            hostname: 'accounts.google.com',
            pathname: '/o/oauth2/auth',
            query: {
                access_type: 'offline',
                approval_prompt: 'force',
                scope: scopes,
                response_type: 'code',
                client_id: credentials.clientId,
                redirect_uri: callback,
                state: node_id + ":" + csrfToken,
            }
        }));
        RED.nodes.addCredentials(node_id, credentials);
    });

    RED.httpAdmin.get('/google-credentials/auth/callback', function(req, res) {
        console.log('google-credentials/auth/callback');
        if (req.query.error) {
            return res.send("google.error.error", { error: req.query.error, description: req.query.error_description });
        }
        var state = req.query.state.split(':');
        var node_id = state[0];
        var credentials = RED.nodes.getCredentials(node_id);
        if (!credentials || !credentials.clientId || !credentials.clientSecret) {
            console.log("credentials not present?");
            return res.send("google.error.no-credentials");
        }
        if (state[1] !== credentials.csrfToken) {
            return res.status(401).send("google.error.token-mismatch");
        }

        const oAuth2Client = new google.auth.OAuth2(
            credentials.clientId,
            credentials.clientSecret,
            credentials.callback
        );
        var code = req.query.code;
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            credentials.token = token;
            RED.nodes.addCredentials(node_id, credentials);
            RED.nodes.addCredentials(keyNodeAuth, credentials);
            return res.send('Authorized');
        });
    });

    // call api get task list
    RED.httpAdmin.get('/tasklist', function(req, res) {
        let credentials = RED.nodes.getCredentials(keyNodeAuth);
        var access_token = credentials.token.access_token
        var data = {};
        const postdata = {
            url: 'https://tasks.googleapis.com/tasks/v1/users/@me/lists',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': "Bearer " + access_token
            }
        };
        request.get(postdata, (error, response, body) => {
            if (error) {
                callback(error);
            } else {
                data = JSON.parse(body)
                data = data.items;
                res.json(data)
            }
        });
    });

};