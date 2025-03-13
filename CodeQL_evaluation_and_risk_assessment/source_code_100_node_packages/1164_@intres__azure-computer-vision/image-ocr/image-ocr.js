const ImageOcrDriver = require('./image-ocr-driver');

module.exports = function(RED) {
    function translation(config) {
        RED.nodes.createNode(this, config);
        this.on('input', async (msg) => {
            try {
                const options = {
                    inputMode: config.inputMode,
                    imageFilePath: config.imageFilePath,
                    imageUrl: config.imageUrl,
                    language: config.language || 'unk',
                    modelVersion: config.modelVersion || 'latest',
                };

                const driver = new ImageOcrDriver(this, this.credentials.key, this.credentials.region);

                const res = await driver.run(options);
                this.status({});
                this.send({ payload: res });
            } catch (e) {
                // Clear status in the node
                this.status({});
                // Send error to catch node, original msg object must be provided
                this.error(e.message, msg);
            }
        });
    }

    RED.nodes.registerType("img-ocr", translation, {
        credentials: {
            key: { type: 'password' },
            region: { type: 'text' }
        },
    });
}
