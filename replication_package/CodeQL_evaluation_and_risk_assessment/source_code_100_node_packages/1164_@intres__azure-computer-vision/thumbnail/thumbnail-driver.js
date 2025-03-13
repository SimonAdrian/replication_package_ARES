const axios = require('axios').default;
const ImageAnalysisBase = require('../utilities/image-analysis-base');

class ThumbnailDriver extends ImageAnalysisBase {

    constructor(node, key, region) {
        super(node, key, region);
        this.baseUrl = `https://${this.getRegion()}.api.cognitive.microsoft.com/vision/v3.2/generateThumbnail`;
    }

    preProcess(options) {}

    async analyzeInternal({ width, height, smartCropping, modelVersion, config, data }) {
        this.setStatus({ fill: 'green', shape: 'dot', text: 'Cropping' });
        // Need to specify response type to arraybuffer to handle binary image
        config = {
            ...config,
            responseType: 'arraybuffer'
        };
        const res = await axios.post(`${this.baseUrl}?width=${width}&height=${height}&smartCropping=${smartCropping}&modelVersion=${modelVersion}`, data, config);
        return res.data
    }
}

module.exports = ThumbnailDriver;
