# node-red-contrib-caseta

This collection can be used to monitor and control a Caseta network. A Smart Hub Pro is required.

VERSION 3 CONTAINS MAJOR CHANGES THAT MAY BREAK YOUR CURRENT FLOWS. Some flows may require reconfiguration.  Check the help docs for details but the most important things to be aware of are below.

- Control node no longer produces message output.
- Query node no longer produces message output.

To process the response/result of a Control or Query command, a React node must be configured to receive the output from the Smart Hub.

## General Concept

The following nodes are available in this collection.  All nodes share a common bridge configuration.

- Control - Send commands to control devices or emulate button pushes on a remote.
- React - Listen for and act on device activity including remotes.
- Query - Get the state of a device.

If a command is sent from a Control or Query node and you want to see the output from the hub, you must set up a React node for the same device.

Note: Lutron has recently renamed the SmartBridge to Smart Hub.  The text "SmartBridge", "Smart Hub", "Bridge", or "Hub" all refer to the same thing.

## Quick Start

1. Use the Lutron app on your phone to send yourself a copy of your integration report.
2. Drag any one of the node types onto the palette and open it.
3. Define a new Smart Hub by clicking the edit button.
4. Provide a name and the IP address (or hostname) of your Smart Hub.
5. Copy the contents of the integration report into the Report field and click the [Import] button located under the device and/or scene editor.
6. Review the imported devices and make sure the type is correct.
7. Click [Update] and then [Deploy].

Feel free to tag the author shown below in the official Node-RED forums or email if any help is needed.  If sending email, be sure to include "node-red-contrib-caseta" in the subject to ensure the spam filters don't block it.

## Release Notes

Version 3.2.0

- Fixed a major issue that made setting a device level to 0 (off) impossible.
- Fixed issue when calculating required configuration items on React node.
- Added Diva lighting paddle remote to library.  (untested as the developer does not have one)
- Added Diva shades paddle remote to library. (untested as the developer does not have one)
- Updated NPM dependencies.

Version 3.0.0

- Control nodes generate no message output and must be paired with a React node to process the Smart Hub response.
- Query nodes generate no message output and must be paired with a React node to process the Smart Hub response.
- Palette status now only reflects the connection state from that particular node to the Smart Hub and not the overall system.
- Added ability to force a reconnection of the Smart Hub connection when sending a command via Control or Query.
- Improved button hold performance.
- Added Diva dimmer to library.
- Added Claro switch to library.
- Added ELV dimmer to library.
- Greatly improved error handling.  

Version 2.2.2

- A hostname can now be used for the bridge address.

- Fixed an issue with importing an integration report that only contained remotes.
- Added some tips on what to do in the event a bridge needs to be replaced due to failure.
- Updated suggestion logic for device types.
- Changed many UI references from "Smart Bridge" to "Smart Hub".
- Slight changes to how the devices are presented in dropdowns.

- Fixed an issue with importing an integration report that only contained remotes.
- Addressed inaccuracies in documentation.

- Known issue: Text can sometimes appear on the right side of the device editor where it doesn't belong.

Version 2.1.1

- Scenes and Devices are now imported separately.
- The Control node can now be configured to emulate the delayed release of a button push.
- Bridge timeouts no longer show as warnings on the palette as they do not cause any real problems.
- Fixed an issue with general handling of bridge traffic.
- Addressed inaccuracies in documentation.
 
## Additional Resources

Contextual help is available in Node-RED itself.

## Authors

Created by:  Vahdettin [https://discourse.nodered.org/u/Vahdettin](https://discourse.nodered.org/u/Vahdettin) [vahdettin_in_beta@icloud.com](vahdettin_in_beta@icloud.com)


## Copyright and license

Copyright Vahdettin under [the Apache 2.0 license](LICENSE).
