const axios = require('axios').default;
const ImageAnalysisBase = require('../utilities/image-analysis-base');

class ImageOcrDriver extends ImageAnalysisBase {

    constructor(node, key, region) {
        super(node, key, region);
        this.baseUrl = `https://${this.getRegion()}.api.cognitive.microsoft.com/vision/v3.2/ocr`;
    }

    preProcess(options) {}

    async analyzeInternal({ language, modelVersion, config, data }) {
        this.setStatus({ fill: 'green', shape: 'dot', text: 'detecting' });
        const res = await axios.post(`${this.baseUrl}?language=${language}&modelVersion=${modelVersion}`, data, config);
        return res.data;

    }
}

module.exports = ImageOcrDriver;
