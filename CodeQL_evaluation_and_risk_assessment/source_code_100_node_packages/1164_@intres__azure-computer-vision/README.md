# azure-computer-vision
## Introduction
**azure-computer-vision** is a collection of nodes that perform computer vision services from [Microsoft Azure Computer Vision Services](https://azure.microsoft.com/en-us/services/cognitive-services/computer-vision/).

### About us
The [Internet of Things Research (INTRES) Group](https://github.com/UWTINTRES)
at the University of Washington Tacoma (UWT) developed and maintains this package to promote Internet of Things (IoT) research and teaching. This package seeks to accelerate the adoption of IoT concepts by developing a simple mechanism to increase the productivity of researchers, software engineers, developers, and data scientists.

### Features:
These features are currently supported:
1. Analyze images with multiple features(Tags, Color... etc.)
2. Describe image.
3. Detect objects.
4. Get area of interest.
5. Image optical character recognition(OCR).
6. Get thumbnail.
7. Read complex image/pdf file.

Most of the parameters of these nodes are supported. For more information about all the settings and output format, please refer to the individual tab of the service in [official API document](https://westus.dev.cognitive.microsoft.com/docs/services/computer-vision-v3-2/operations/56f91f2e778daf14a499f21b).

## Installation
`npm install @intres/azure-computer-vision`
## Example usage
The example flow is as follows:

![Example flow](https://github.com/uwtintres/azure-computer-vision/blob/main/img/example.png?raw=true)

In this example, The node will output the corresponding objects of the chosen service. The chosen service here is "analyze image", and the features we want to include
is "Tags,Colors". Features should be comma separated if more than one is provided.

![Example flow](https://github.com/uwtintres/azure-computer-vision/blob/main/img/response.png?raw=true)

The output format is exactly from the official API document and is passed to the next node for further usage.

## Example usage of read/get-read-result
The example flow is as follows:

![Example flow](https://github.com/uwtintres/azure-computer-vision/blob/main/img/read.png?raw=true)

The config of the read node is as follows:

![Read config](https://github.com/uwtintres/azure-computer-vision/blob/main/img/read-config.png?raw=true)

In this example, read node accepts an image url and will output another URL for further query as its msg.payload.

![url](https://github.com/uwtintres/azure-computer-vision/blob/main/img/operationurl.png?raw=true)

This url should be recorded and passed to get-read-result node as input. The reason why the returned url should be kept instead of being passed to get-read-result node directly is that
the reading process is usually not completed when the url is returned, and thus the result is not available. The url should be recorded and be used later. The time one should wait depends on the input file.


#### Disclaimer
INTRES and UWT are not responsible for the usage or utilization of these packages. They are meant to promote IoT research and education. IoT service providers may require additional verification steps to utilize the features outlined in these packages. We are not in any way responsible for the misuse of these packages. For more details on the service agreement and terms, please click [here](https://azure.microsoft.com/en-us/support/legal/).
