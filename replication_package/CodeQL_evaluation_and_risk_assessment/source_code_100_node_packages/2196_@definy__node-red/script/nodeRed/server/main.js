"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const urlFromString_js_1 = require("../client/urlFromString.js");
const request_js_1 = require("../../definyRpc/core/request.js");
const namespace_js_1 = require("../../definyRpc/codeGen/namespace.js");
const meta_js_1 = require("../../definyRpc/example/generated/meta.js");
const createdServer = new Map();
// Node.js 内で動作
function default_1(RED) {
    const generateNode = (parameter) => {
        return function (config) {
            RED.nodes.createNode(this, config);
            this.on("input", (msg, send) => {
                try {
                    (0, request_js_1.requestQuery)({
                        url: new URL(parameter.url),
                        input: msg.payload,
                        namespace: parameter.functionDetail.namespace,
                        name: parameter.functionDetail.name,
                        inputType: parameter.functionDetail.input,
                        outputType: parameter.functionDetail.output,
                        typeMap: new Map(createdServer.get(parameter.url.toString())?.typeList.map((type) => [
                            (0, namespace_js_1.namespaceToString)(type.namespace) + "." + type.name,
                            type,
                        ]) ?? []),
                    }).then((json) => {
                        send({ payload: json });
                    });
                }
                catch (e) {
                    console.error(e);
                }
            });
        };
    };
    const generateNodesFromUrl = (urlText, setStatus) => {
        const url = (0, urlFromString_js_1.urlFromString)(urlText);
        if (url === undefined) {
            setStatus({
                shape: "ring",
                fill: "red",
                text: urlText + " は不正なURLです",
            });
            return;
        }
        setStatus({
            shape: "ring",
            fill: "grey",
            text: "APIの情報を取得中...",
        });
        Promise.all([
            (0, meta_js_1.name)({ url }),
            (0, meta_js_1.functionListByName)({ url }),
            (0, meta_js_1.typeList)({ url }),
        ]).then(([name, functionList, typeList]) => {
            if (name.type === "error" || functionList.type === "error" ||
                typeList.type === "error") {
                setStatus({
                    shape: "ring",
                    fill: "red",
                    text: urlText + " は definy RPC のサーバーではないか, エラーが発生しました..." +
                        JSON.stringify({
                            name: name.value,
                            functionList: functionList.value,
                            typeList: typeList.value,
                        }),
                });
                return;
            }
            const status = {
                name: name.value,
                functionList: functionList.value,
                typeList: typeList.value,
            };
            console.log(createdServer, url.toString());
            if (!createdServer.has(url.toString())) {
                createdServer.set(url.toString(), { typeList: status.typeList });
                for (const func of status.functionList) {
                    RED.nodes.registerType("definy-" + (0, namespace_js_1.functionNamespaceToString)(func.namespace) + "." +
                        func.name, generateNode({ url, functionDetail: func }));
                }
            }
            setStatus({
                shape: "dot",
                fill: "green",
                text: JSON.stringify(status),
            });
        });
    };
    function CreateDefinyRpcNode(config) {
        RED.nodes.createNode(this, config);
        generateNodesFromUrl(config.url, (e) => this.status(e));
    }
    RED.nodes.registerType("create-definy-rpc-node", CreateDefinyRpcNode);
}
exports.default = default_1;
