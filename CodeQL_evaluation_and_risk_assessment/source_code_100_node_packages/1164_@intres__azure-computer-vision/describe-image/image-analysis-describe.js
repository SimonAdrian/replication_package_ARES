const axios = require('axios').default;
const ImageAnalysisBase = require('../utilities/image-analysis-base');

class ImageAnalysisDescribe extends ImageAnalysisBase {

    constructor(node, key, region) {
        super(node, key, region);
        this.baseUrl = `https://${this.getRegion()}.api.cognitive.microsoft.com/vision/v3.2/describe`
    }

    preProcess(options) {}

    async analyzeInternal({ maxCandidate, language, modelVersion, config, data }) {
        this.setStatus({ fill: 'green', shape: 'dot', text: 'recognizing' });
        const res = await axios.post(`${this.baseUrl}?maxCandidate=${maxCandidate}&language=${language}&modelVersion=${modelVersion}`, data, config);
        return res.data;
    }
}

module.exports = ImageAnalysisDescribe;
