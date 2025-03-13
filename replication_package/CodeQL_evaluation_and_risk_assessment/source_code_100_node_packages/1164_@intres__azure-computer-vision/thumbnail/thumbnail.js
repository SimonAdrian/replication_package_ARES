const ThumbnailDriver = require('./thumbnail-driver');

module.exports = function(RED) {
    function translation(config) {
        RED.nodes.createNode(this, config);
        this.on('input', async (msg) => {
            const SMART_CROPPING = {
                'yes': true,
                'false': false,
            };

            try {
                const options = {
                    inputMode: config.inputMode,
                    imageFilePath: config.imageFilePath,
                    imageUrl: config.imageUrl,
                    height: config.height,
                    width: config.width,
                    smartCropping: SMART_CROPPING[config.smartCropping] || SMART_CROPPING['yes'],
                    modelVersion: config.modelVersion || 'latest',
                };

                const driver = new ThumbnailDriver(this, this.credentials.key, this.credentials.region);

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

    RED.nodes.registerType("img-thumbnail", translation, {
        credentials: {
            key: { type: 'password' },
            region: { type: 'text' }
        },
    });
}
