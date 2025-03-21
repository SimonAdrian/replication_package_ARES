---
title: The main uibuilder node
description: |
  Usage and configuration.
created: 2023-02-05 16:31:39
updated: 2024-06-28 14:43:57
---

> [!note]
> This page is about configuring an individual uibuilder node in the Node-RED Editor. If you are looking for how to configure uibuilder as a whole, please refer to the [Configuring uibuilder](uib-configuration.md) page.

A uibuilder node that has been added to a flow is configured using its Editor configuration panel. Open this by double-clicking on the node you want to configure.

> [!tip]
> When setting up a new uibuilder node, you will note that you cannot change many settings until you have set the URL and deployed the change. This is to ensure that the node has the server folder to work with. Once the folder exists, you can make other changes.

The panel is split into several tabs: Core, Files, Libraries, and Advanced.

## Node configuration

### Core Tab

![uibuilder node configuration panel >](../images/uibuilder-config-core.jpg)

This is the main tab.

#### URL

The URL field defines the last part of the URL for this uibuilder instance. 

A URL of `test` will result in a full URL that looks something like `http://localhost:1880/test`. (Yours may look different depending on the configuration of Node-RED's settings).

The Open button just below the URL will open this default location. The actual file that is opened is `/test/index.html`.

The URL **MUST** be unique across all URL's whether they belong to uibuilder or not. The input box will not let you type an entry that already exists in another uibuilder instance. However, it cannot check all the possible URL's Node-RED is capable of supporting so please take some care when choosing an appropriate name here. 

Setting the `httpNodeRoot` property in `settings.js` will help avoid name clashes as will using a custom server for uibuilder (see below).

The URL also defines the folder on your server's filing system where all of the front-end code will live. It creates a sub-folder under the `<uibRoot>` folder which is typically `~/.node-red/uibuilder` but may be moved anywhere by using the `uibuilder.uibRoot` settings in your `settings.js` file.

If you have deployed the node with a specific name and then later change it, uibuilder will automatically rename the server folder as well. If you delete the node, uibuilder will offer to delete the folder but you may choose to keep it if you wish.

URL's have some other requirements that must be met, if you don't meet the requirements, you will see one or more errors listed underneath the field and you will not be able to press the "Done" button until they are corrected.

If copying and pasting a uibuilder node or a flow containing a node, upon pasting, the URL is reset to blank. Since this is an error, the node will be marked with a red triangle and attempting to deploy will give an error.

#### Buttons

The buttons below the URL field will each open a new browser tab. The Open button has already been described.

The `uibuilder Details` button opens a page showing the full configuration of uibuilder along with all of the admin and user-facing ExpressJS web server routes that have been mounted by all instances of uibuilder nodes.

The `Instance Details` button opens a page with a summary of the configuration and web routes for this instance.

The `Docs` button opens the local copy of this documentation.

#### Info panel

Under the buttons is the information panel. This shows you the detail for the webserver that uibuilder is currently using. This ensures that you know what URL prefix to use in front of the URL defined above.

#### Name and Topic

These are optional. If you set a Name, it will show in the icon in the flow along side the URL. This is the standard Node-RED name field.

The Topic string will be added to messages being sent to the front-end if the inbound message to the node does not contain a topic field. So consider it a default entry.

#### Template Settings

> [!NOTE]
> Changing the template overwrites existing files with the same names in your `<uibRoot>/<url>` server folder. So make sure you take copies before pressing the Load button if you don't want to loose them.

uibuilder Templates let you have a rapid prototype for your front-end code. The Templates load a complete set of front-end files along with a README and an npm style `package.json` file. This allows a template to be a complete working model, ready to go.

As at uibuilder v5, there are 4 built-in Templates plus the ability to load external templates from GitHub and elsewhere. More information on templates can be found in the [Configuring uibuilder](uib-configuration?id=ltuibrootgtltinstance-urlgt) page and in the [Creating Templates](creating-templates) page.

### Files Tab

tbc.

### Libraries Tab

tbc.

### Advanced Tab

tbc.

## Message inputs

Any message sent to a uibuilder node input will be forwarded direct to connected clients. With a few exceptions:

* Control messages - Any control message received by a uibuilder node is assumed to be in error and is ignored. If you send a message and it is being ignored, check that it does not have a `msg.uibuilderCtrl` property.

Messages for clients should have the same structure as other Node-RED messages. However, there are some specific formats that the uibuilder client will recognise and automatically process for you. See the [Standard Messages page](pre-defined-msgs) for details. 

Most notably, any message containing a `msg._ui` property will not make it through to front-end user code. It is processed automatically by the uibuilder front-end library. That is the standard property used by uibuilder's [low-code capability](client-docs/config-driven-ui.md).

## Message outputs

uibuilder nodes have two output ports. 

### Standard messages
The upper port (#1) outputs "standard" messages. Typically these are messages that come from client activities such as button presses or form inputs. Any front-end process or code that use either the `uibuilder.eventSend(event)` or the `uibuilder.send({...})` functions.

If the advanced flag "Include msg._uib in standard msg output." is on, uibuilder automatically adds client details to the output under `msg._uib`. Those details may be used for identity and access management flows.

### Control messages

The lower port (#2) outputs "control" messages. These are described in the [Standard messages documentation](pre-defined-msgs#control-message-overview). The messages include client connect and disconnect and visibility change messages.

The most common use of control messages is to loop back to a `uib-cache` nodes so that the cache is replayed to new or reloading clients.

![Example of using uib-cache](uib-cache-example.png)

But they can also be used for doing authentication and authorisation controls.
