const axios = require('axios').default;
const ImageAnalysisBase = require('../utilities/image-analysis-base');

class ReadDriver extends ImageAnalysisBase {

    constructor(node, key, region) {
        super(node, key, region);
        this.baseUrl = `https://${this.getRegion()}.api.cognitive.microsoft.com/vision/v3.2/read/analyze`;
    }

    preProcess(options) {}

    async analyzeInternal({ language, pages, readingOrder, modelVersion, config, data }) {
        this.setStatus({ fill: 'green', shape: 'dot', text: 'Reading' });

        const languageQuery = language ? `&language=${language}` : '';
        const pagesQuery = pages ? `&pages=${pages}` : '';

        const res = await axios.post(`${this.baseUrl}?modelVersion=${modelVersion}&readingOrder=${readingOrder}${languageQuery}${pagesQuery}`, data, config);
        // console.log();
        return res.headers['operation-location'];
    }
}

module.exports = ReadDriver;
