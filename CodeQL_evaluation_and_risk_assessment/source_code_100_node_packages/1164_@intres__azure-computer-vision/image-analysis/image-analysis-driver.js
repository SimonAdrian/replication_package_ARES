const axios = require('axios').default;
const ImageAnalysisBase = require('../utilities/image-analysis-base');

class ImageAnalysisDriver extends ImageAnalysisBase {
    #supportedFeatures;

    constructor(node, key, region) {
        super(node, key, region);
        this.#supportedFeatures = new Set([
            'Adult',
            'Brands',
            'Categories',
            'Color',
            'Description',
            'Faces',
            'ImageType',
            'Objects',
            'Tags',
        ]);
    }

    checkFeatures(features) {
        const featuresArr = features.split(',');
        const supportedFeatures = Array.from(this.#supportedFeatures).join(', ');

        for (let i = 0; i < featuresArr.length; i++) {
            featuresArr[i] = featuresArr[i].trim();
            if (this.#supportedFeatures.has(featuresArr[i])) continue;
            throw new Error(`Feature ${featuresArr[i]} is not supported, supported features are: ${supportedFeatures}`);
        }

        return featuresArr.join(',');
    }

    preProcess(options) {
        options.features = this.checkFeatures(options.features);
    }

    async analyzeInternal({ features, details, modelVersion, config, data }) {
        let url = `https://${this.getRegion()}.api.cognitive.microsoft.com/vision/v3.2/analyze?visualFeatures=${features}`;

        if (details) url = `${url}&details=${details}`;

        url = `${url}&model-version=${modelVersion}`;
        this.setStatus({ fill: 'green', shape: 'dot', text: 'analyzing' });
        const res = await axios.post(url, data, config);
        return res.data;
    }
}

module.exports = ImageAnalysisDriver;
