const axios = require('axios').default;
const ImageAnalysisBase = require('../utilities/image-analysis-base');

class GetReadResultDriver extends ImageAnalysisBase {
    constructor(node, key, region) {
        super(node, key, region);
    }

    // Overwrite to not check input mode
    checkInputMode() {}

    preProcess(options) {
        if (!options.operationUrl) throw new Error('msg.payload should contain an URL returned from read node.');
    }

    async analyzeInternal({ operationUrl, config }) {
        this.setStatus({ fill: 'green', shape: 'dot', text: 'Getting result' });
        const res = await axios.get(operationUrl, config);
        return res.data;
    }
}

module.exports = GetReadResultDriver;
