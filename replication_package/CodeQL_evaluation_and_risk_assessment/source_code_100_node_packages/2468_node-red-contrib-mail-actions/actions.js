module.exports = function (RED) {
  function MailActions(config) {

    RED.nodes.createNode(this, config);

    this.name = config.name;
    this.inserver = config.server || "imap.gmail.com";
    this.inport = config.port || "993";
    this.box = config.box || "INBOX";
    this.outbox = config.outbox || "Processed";
    this.tag = config.tag || "";
    this.useSSL = config.useSSL;
    this.protocol = config.protocol || "IMAP";

    var flag = false;

    if (this.credentials && this.credentials.hasOwnProperty("userid")) {
      this.userid = this.credentials.userid;
    } else {
      this.error("No userid specified.");
    }
    if (this.credentials && this.credentials.hasOwnProperty("password")) {
      this.password = this.credentials.password;
    } else {
      this.error("No password specified.");
    }
    if (flag) {
      RED.nodes.addCredentials(n.id, {
        userid: this.userid,
        password: this.password,
        global: true
      });
    }

    var node = this;

    function addLabel(connection, id, label) {
      return new Promise(function (resolve, reject) {
        if (label != null && label != "") {
          connection.addMessageLabel(id, label, function (error) {
            if (error == null) {
              resolve();
            } else {
              reject(error);
            }
          });
        } else {
          // nothing to do. 
          resolve();
        }
      });
    }

    function moveMessage(connection, id, outbox) {
      return new Promise(function (resolve, reject) {
        if (outbox != null && outbox != "") {
          connection.moveMessage(id, outbox, function (moveError) {
            if (moveError == null) {
              resolve();
            } else {
              reject(moveError);
            }
          });
        } else {
          // nothing to do. 
          resolve();
        }
      });
    }


    node.on('input', function (msg) {
      node.status({
        fill: "green",
        shape: "dot",
        text: "Connecting"
      });
      var imaps = require('imap-simple');
      var config = {
        imap: {
          user: node.userid,
          password: node.password,
          host: node.inserver,
          port: node.inport,
          tls: node.useSSL,
          authTimeout: 3000
        }
      };
      imaps.connect(config).then(function (connection) {
        if (connection != null) {
          node.status({
            fill: "green",
            shape: "dot",
            text: "Connected"
          });
          connection.openBox(node.box).then(function (error) {
            var searchCriteria = [
              ['HEADER', 'message-id', msg.header["message-id"]]
            ];
            var fetchOptions = {
              bodies: ['HEADER', 'TEXT'],
              markSeen: false
            };
            node.status({
              fill: "green",
              shape: "dot",
              text: "Opened Inbox"
            });
            connection.search(searchCriteria, fetchOptions).then(function (results) {
              if (results.length == 1) {
                node.status({
                  fill: "green",
                  shape: "dot",
                  text: "Found Email"
                });
                var email = results[0];
                var id = email.attributes.uid;
                var tag = node.tag;
                if (msg.email != null && msg.email.label) {
                  tag = msg.email.label;
                }
                var folder = node.outbox;
                if (msg.email != null && msg.email.folder) {
                  folder = msg.email.folder;
                }

                addLabel(connection, id, tag).then(function () {
                  // success
                  moveMessage(connection, id, folder).then(function () {
                    // successs
                    connection.end();
                    node.status({
                      fill: "green",
                      shape: "dot",
                      text: "Completed."
                    });
                    // send on the original message.
                    msg._email = email;
                    node.send(msg);
                  }, function (moveMessageError) {
                    node.status({
                      fill: "red",
                      shape: "ring",
                      text: "Error - " + moveMessageError
                    });
                    node.error(moveMessageError);
                  }).catch(function (e1) {
                    node.status({
                      fill: "red",
                      shape: "ring",
                      text: "Error"
                    });
                    node.error("E1 : " + e1);
                  });
                }, function (addLabelError) {
                  node.status({
                    fill: "red",
                    shape: "ring",
                    text: "Error - " + addLabelError
                  });
                  node.error(addLabelError);
                }).catch(function (e2) {
                  node.status({
                    fill: "red",
                    shape: "ring",
                    text: "Error - " + e2
                  });
                  node.error("E2 : " + e2);
                });
              } else {
                node.status({
                  fill: "red",
                  shape: "ring",
                  text: "Error - multiple emails."
                });
                node.error("Unable to proceed. Search found " + results.length + " emails matching message-id of '" + msg.header["message-id"] + "'.");
              }
            });
          });
        } else {
          node.status({
            fill: "red",
            shape: "ring",
            text: "Error - no connection."
          });
          node.error("Unable to proceed. Cannot connect to IMAP server.");
        }
      });
    });
  }

  RED.nodes.registerType("mailactions", MailActions, {
    credentials: {
      userid: {
        type: "text"
      },
      password: {
        type: "password"
      },
      global: {
        type: "boolean"
      }
    }
  });

}
