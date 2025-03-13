const axios = require('axios').default;
const ImageAnalysisBase = require('../utilities/image-analysis-base');

class ImageAnalysisGetInterest extends ImageAnalysisBase {

    constructor(node, key, region) {
        super(node, key, region);
        this.baseUrl = `https://${this.getRegion()}.api.cognitive.microsoft.com/vision/v3.2/areaOfInterest`
    }

    preProcess(options) {}

    async analyzeInternal({ modelVersion, config, data }) {
        this.setStatus({ fill: 'green', shape: 'dot', text: 'detecting' });
        const res = await axios.post(`${this.baseUrl}?model-version=${modelVersion}`, data, config);
        return res.data;
    }
}

module.exports = ImageAnalysisGetInterest;
