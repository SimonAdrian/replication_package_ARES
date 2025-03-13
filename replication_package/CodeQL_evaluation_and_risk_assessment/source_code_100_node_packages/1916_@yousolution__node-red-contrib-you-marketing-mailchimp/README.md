# Unofficial Mailchimp API nodes for Node-RED.

[![Platform](https://img.shields.io/badge/platform-Node--RED-red)](https://nodered.org)

This module provides a set of nodes for Node-RED to quickly create integration flows with Mailchimp API.

# Installation

[![NPM](https://nodei.co/npm/node-red-contrib-you-sap-service-layer.png?downloads=true)](https://nodei.co/npm/node-red-contrib-you-sap-service-layer/)

You can install the nodes using node-red's "Manage palette" in the side bar.

Or run the following command in the root directory of your Node-RED installation

    npm install @yousolution/node-red-contrib-you-mailchimp --save

# Dependencies

The nodes are tested with `Node.js v12.22.6` and `Node-RED v2.0.6`.

- [mailchimp](https://github.com/mailchimp/mailchimp-marketing-node/)

# Changelog

Changes can be followed [here](/CHANGELOG.md).

# Usage

## Basics

### Authentication

To use this Mailchimp APIs, you need an OAuth2 token and the server name of the target.

### Marcheting API (node marketingMailchimp)

Use this node to execute Marketing API

1. Select a Resource to work with
2. Select an Action to operate on this Resouce
3. Add required PathParams
4. To manage results, add optional QueryParams
   Query options on resources:

| option          | description                                                                 |
| --------------- | --------------------------------------------------------------------------- |
| $fields         | Specify retur fields.                                                       |
| $exclude_fields | Specify fields to exclude.                                                  |
| $count          | The number of records to return.                                            |
| $offset         | Used for pagination.                                                        |

You can see how to use it in the example flows in the _/examples_ directory.\
_For more details see official [Mailchimp Marketing API](https://mailchimp.com/developer/marketing/api/root)_
