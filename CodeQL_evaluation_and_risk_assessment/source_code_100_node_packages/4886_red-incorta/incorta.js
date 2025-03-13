/**
 * Copyright 2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function (RED) {
    "use strict";
    var mustache = require("mustache");
    var path = require("path");

    // releases a connection and handles any error encountered
    function releaseConnection(node, connectionObject) {
        node.IncortaConfig.jdbc.release(connectionObject, function (err) {
            if (err) {
                node.error(err.message);
            }
        });
    }

    // This function processes a SQL statement, is used by all three Incorta nodes, providing
    // common connection handling and error processing. The "type" should be "Query" or "Update" 
    // the resultAction is a function provided to handle a successful query result.
    function processSQLStatement(type, node, sql, resultAction, msg) {
        node.IncortaConfig.jdbc.reserve(function (err, connObj) {

            var queryHandler = function (err, resultset) {
                if (err) {
                    node.status({fill: "red", shape: "ring", text: "failed"});
                    node.error(err.message);
                    releaseConnection(node, connObj);
                } else {
                    //the query succeeded
                    node.status({fill: "green", shape: "dot", text: "connected"});
                    resultAction(node, resultset, connObj, msg);
                }
            };

            if (err) {
                // connection failed.
                node.status({fill: "red", shape: "ring", text: "disconnected"});
                node.error("Could not connect to incorta database.");
            } else if (connObj) {
                // we got a connection from the pool, but it could still be "unusable" if the database is now unreachable. 
                var conn = connObj.conn;
                conn.createStatement(function (err, statement) {
                    if (err) {
                        // connection failed when we try to create statement - possibly if the incorta is shutdown.
                        node.status({fill: "red", shape: "ring", text: "disconnected"});
                        node.error(err.message);
                        releaseConnection(node, connObj);
                        node.IncortaConfig.jdbc.purge(function (err) {
                            if (err) {
                                node.error(err.message);
                            }
                        });
                    } else {
                        // Connection and statement are OK, now try and execute the sql.
                        if (type == "Query") {
                            statement.executeQuery(sql, queryHandler);
                        } else if (type == "Update") {
                            statement.executeUpdate(sql, queryHandler);
                        }
                    }
                });
            }
        });
    }


    // Test a database connection for a flow node, setting the "connected" or "disconnected" status icon of the node.
    function testConnection(node, jdbc) {
        jdbc.reserve(function (err, connObj) {

            if (err) {
                // connection failed.
                node.status({fill: "red", shape: "ring", text: "disconnected"});
                node.error(err.message);
            } else if (connObj) {
                // we got a connection from the pool, but it could still be "unusable" if the database is now unreachable. 
                var conn = connObj.conn;
                conn.createStatement(function (err, statement) {
                    if (err) {
                        // connection failed when we try to create statement - possibly if the incorta is shutdown.
                        node.status({fill: "red", shape: "ring", text: "disconnected"});
                        node.error(err.message);
                    } else {
                        // the connection succeeded
                        node.status({fill: "green", shape: "dot", text: "connected"});
                    }
                    releaseConnection(node, connObj);
                });
            }
        });
    }

    // Test connection on a configuration  node, setting the "connected" flag true or false.
    function testConfigConnection(configNode) {
        configNode.jdbc.reserve(function (err, connObj) {

            if (err) {
                // connection failed.
                configNode.connected = false;
            } else if (connObj) {
                // we got a connection from the pool, but it could still be "unusable" if the database is now unreachable. 
//                            console.log("Using connection: " + connObj.uuid);
                var conn = connObj.conn;
                conn.createStatement(function (err, statement) {
                    if (err) {
                        // connection failed when we try to create statement - possibly if the incorta is shutdown.
                        configNode.connected = false;
                        node.error(err.message);

                    } else {
                        //the connection succeeded
                        configNode.connected = true;

                    }
                    configNode.jdbc.release(connObj, function (err) {
                    });
                });
            }
        });
    }

    // Sets the connection status icon on a flow node based on the status of the config.
    // this doesn't work initially though as the asyncronous callbacks mean that the 
    // connection is not made before the flow nodes are created.
    function setInitialConnectionStatus(node) {
        if (node.IncortaConfig.connected) {
            node.status({fill: "green", shape: "dot", text: "connected"});
        } else {
            node.status({fill: "red", shape: "ring", text: "disconnected"});
        }
    }

    // define a function to handle successful query results.
    var queryResultAction = function (node, resultset, connObj, msg) {
        resultset.toObjArray(function (err, results) {
            try {
                console.log(results);
                msg.payload = results;
                node.send(msg);
            } catch (err) {
                console.log(err);
            }
            finally {
                releaseConnection(node, connObj);
            }
        })
    };

    // define a function to handle successful update results.
    var updateResultAction = function (node, count, connObj) {
        node.send({"payload": {"count": count}});
        releaseConnection(node, connObj);
    };

    // Define the server configuration node, handling connection details to a Incorta database.
    function IncortaNode(config) {

        RED.nodes.createNode(this, config);
        this.hostname = config.hostname;
        this.port = config.port;
        this.ssl = config.ssl;
        this.db = config.db;
        this.name = config.name;

        var jdbc = require('jdbc');
        var jinst = require('jdbc/lib/jinst');

        // check that the jar file exists!
        try {
            var fs = require('fs');
            fs.accessSync(path.join(__dirname, 'jars', 'postgresql_nov.jar'), fs.F_OK);
            // OK, no problem
        } catch (e) {
            // It isn't accessible, log an error and return
            this.error("postgresql_nov.jar file is missing");
            return;
        }


        // add in the derby class jar into the jvm classpath.
        if (!jinst.isJvmCreated()) {
            jinst.addOption("-Xrs");
            jinst.setupClasspath([path.join(__dirname, 'jars', 'postgresql_nov.jar')]);
        }

        this.url = "jdbc:postgresql://" + this.hostname + ":" + this.port + "/" + this.db;

        if (this.credentials && this.credentials.user && this.credentials.password) {

            this.jdbcconfig = {
                drivername: 'org.postgresql.Driver',
                minpoolsize: 1,
                maxpoolsize: 100,
                url: this.url,
                user: this.credentials.user,
                password: this.credentials.password,
                properties: {}
            };

            // initiate connection details to this database instance. Actual connections will be 
            // created by the individual flow nodes.
            this.jdbc = new jdbc(this.jdbcconfig);

            this.jdbc.initialize(function (err) {
                if (err) {
                    console.log(err);
                }
            });

            testConfigConnection(this);
        } else {
            node.warn("Please provide incorta logon credentials.")
        }


    }

    RED.nodes.registerType("incorta", IncortaNode, {
        credentials: {
            user: {type: "text"},
            password: {type: "password"}
        }
    });


    // Define the Incorta SQL node, handling general SQL query statements to a Incorta database.
    function IncortaSQLNode(config) {
        RED.nodes.createNode(this, config);
        this.query = config.query;
        this.multi = config.multi || "individual";
        this.incorta = config.incorta;
        this.IncortaConfig = RED.nodes.getNode(this.incorta);

        if (this.IncortaConfig) {
            var node = this;

            // function defining the actions when each node red message is received.
            // we extract relevant details and execute a database query.
            node.on("input", function (msg) {

                //establish the query string
                var query;
                if (node.query) {
                    query = node.query;
                } else if (msg.payload) {
                    query = msg.payload;
                } else {
                    node.warn("No query defined");
                    return;
                }

                // resolve any "mustache" tags in the query, potentially substituting elements of the message (msg) into the query.
                var sql = mustache.render(query, msg);

                // now process the SQL statement, with necessary error handling.
                processSQLStatement("Query", node, sql, queryResultAction, msg)
            });

        } else {
            // This can happen if the Incorta configuration node cannot be created for some reason.
            this.status({fill: "red", shape: "ring", text: "disconnected"});
            this.error("No connection to incorta.");
        }

    }

    RED.nodes.registerType("incorta sql", IncortaSQLNode);
}
