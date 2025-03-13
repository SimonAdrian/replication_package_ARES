module.exports = function (RED) {
    function RadwagGetMassNode(config) {
        RED.nodes.createNode(this, config);
        this.host = config.host || null;
        this.port = config.port * 1;
        this.interval = config.interval * 1;
        var node = this;

        var net = require('net');
        var client = new net.Socket();
        var intervalConnect = false;

        node.status({
            fill: "red",
            shape: "ring",
            text: "disconnected"
        });

        function connect() {
            client.connect({
                port: node.port,
                host: node.host

            })
        }

        function launchIntervalConnect() {
            if (intervalConnect)
                return
                intervalConnect = setInterval(connect, 5000)
                    node.status({
                    fill: "red",
                    shape: "ring",
                    text: "disconnected"
                });
        }

        function clearIntervalConnect() {
            if (false == intervalConnect)
                return
                clearInterval(intervalConnect)
                intervalConnect = false
        }

        function SendData(text) {
            var msg = {
                payload: text
            }
            node.send(msg);
        }

        client.on('connect', () => {

            clearIntervalConnect();

            node.status({
                fill: "green",
                shape: "dot",
                text: "connected"
            });
        })

        client.on('error', (err) => {
            launchIntervalConnect()
        })
        client.on('close', launchIntervalConnect)
        client.on('end', launchIntervalConnect)

        function sendNT() {
            try {
                client.write('NT\r\n');
            } catch (err) {}
        }

        setInterval(sendNT, node.interval);

        this.on('close', function (done) {			
            clearInterval(sendNT);
			client = undefined;
			done();
        });

        client.on('data', function (data) {
            data = data.toString();
            try {
                var mass = parseFloat(data.substr(8, 10))
                    var unit = data.substr(19, 3).trim()
                    var tare = parseFloat(data.substr(23, 9))
                    var stab = data[3] == ' '
                    var zero = data[4] == 'Z'
                    var range = data[5]
                    var digit = data[6]
                    var hidden = data[37]
                    var result = {
                    mass: mass,
                    unit: unit,
                    tare: tare,
                    stab: stab,
                    zero: zero,
                    range: range,
                    digit: digit,
                    hidden: hidden
                }
                SendData(result)

            } catch (err) {

                SendData(err)
            }

        });
        connect();
    }
    RED.nodes.registerType("radwag-mass", RadwagGetMassNode);
}
