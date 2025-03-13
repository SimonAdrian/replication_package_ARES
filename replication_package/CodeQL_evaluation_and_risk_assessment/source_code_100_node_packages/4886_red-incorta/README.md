node-red-incorta
=====================
<a href="http://nodered.org" target="_new">Node-RED</a> nodes to read and write to a <a href="https://github.com/incorta" target="_new">Incorta database</a>.

Pre-requisites
--------------

These modules are installed as part of a <a href="http://nodered.org" target="_new">Node-RED</a> environment. Node-RED is a tool for wiring together hardware devices, APIs and online services in new and interesting ways, these incorta nodes allow Node-Red to use Incorta as a datasource.

Installation of the Node-Red environment is described here : <a href="http://nodered.org/docs/getting-started/" target="_new">Node-Red Getting Started</a>.

You will need a Incorta Database to connect to, this is available here: <a href="https://github.com/incorta" target="_new">Incorta database</a>.

Connection to the incorta will require jdbc and java modules. These will be installed by npm in the following "Install" step.

Install
-------

To install from the npm website, run the following command in the Node-RED install home directory of your user, typically ~/.nodered

    npm install node-red-incorta
    
To install from a local zip file, run the following command in theNode-RED install home directory of your user:

    npm install {path to file}/node-red-incorta-0.1.1.tgz

The postgresql_nov.jar file containing the JDBC driver is part of the Incorta database installation (usually found in {incorta-install-directory}/libs). This should be copied into <b>{node-red-user-directory}/node_modules/node-red-incorta/jars</b>.

Usage
-----

Allows basic access to a Incorta database using the JDBC protocol

This node uses SQL to query or update the configured database. By it's very nature it allows SQL injection... so <i>be careful out there...</i>

The result rows can be sent together as an array or as individual messages.

A Server configuration specifies the server, database and credentials to access.

Node Red Nodes
--------------

There are one node red nodes:

  * incorta sql - executes any sql query within the Incorta environment, allows complex queries.
  

incorta sql
---------

Queries a Incorta database based on a configured SQL query string.

The Query can be specified as a template including "mustache" format tags, which are then substituted for values from the input message.

e.g. SELECT * FROM {{{payload.table}}} WHERE ID = '{{{payload.id}}}'
substitutes msg.payload.table and msg.payload.id into the query.

e.g. {{{msg.sql}}}
will execute the SQL specified in the sql property of the incoming message, allowing the node red flow to formulate the query.

The result is returned in the outgoing message payload. The results can be returned as individual messages or a single array in one message.

Server configurations
---------------------

Each Incorta node has a link to a shared Server configuration. A number of Server configurations can be set to allow access to multiple Incorta databases. Each Server configuration specifies the server, database and credentials to access.






