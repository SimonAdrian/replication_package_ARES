thethingbox-node-sensortag
==========================

A node for <a href="http://thethingbox.io">TheThingBox</a>TheThingBox or <a href="http://nodered.org">Node-RED</a> to add a sensorTag node. 


Install
-------

You have to install the bluetooth library in your system :

	apt-get install bluetooth bluez-utils blueman libbluetooth-dev


Run the following command in the root directory of your Node-RED install (TheThingBox : /root/thethingbox/node_modules/node-red)

    npm install thethingbox-node-sensortag


Usage
-----

With this node, you will be able to get all data from the sensortag by bluetooth. You will find all the data in the msg.payload. Other informations about connection are available in msg.uuid and msg.state

