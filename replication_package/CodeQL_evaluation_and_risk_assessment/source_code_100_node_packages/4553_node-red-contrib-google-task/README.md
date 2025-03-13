## How to Install

Run the following command in the root directory of your Node-RED install

```
npm install node-red-contrib-google-task
```
## Configuration

1. Generate OAuth credentials at [Google API Console](https://console.developers.google.com/apis/credentials/oauthclient).

  * Choose Web Application.
  * As `Authorized JavaScript origins` enter your Node-RED IP (_e.g. `http://localhost:1880`_)
  * As `Authorized redirect URIs` enter your Node-RED IP plus `/google-credentials/auth/callback` (_e.g. `http://localhost:1880/google-credentials/auth/callback`_)

2. Copy the `Client ID` and `Client secret` and paste them into the Config Node
