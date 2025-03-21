"use strict";
/* eslint-disable */
/* generated by definy. Do not edit! */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCodeAndWriteAsFileInServer = exports.generateCallDefinyRpcTypeScriptCode = exports.typeList = exports.functionListByNamePrivate = exports.functionListByName = exports.namespaceList = exports.name = void 0;
const a = __importStar(require("../../../deps/raw.githubusercontent.com/narumincho/definy/f662850e6a0cb9ec7a69e60f424624c07dd417fa/deno-lib/definyRpc/core/coreType.js"));
const b = __importStar(require("../../../deps/raw.githubusercontent.com/narumincho/definy/f662850e6a0cb9ec7a69e60f424624c07dd417fa/deno-lib/definyRpc/core/request.js"));
/**
 * サーバー名の取得
 */
const name = (parameter) => b.requestQuery({
    url: parameter.url ?? new globalThis.URL("http://localhost:2520"),
    namespace: a.FunctionNamespace.meta,
    name: "name",
    inputType: a.Unit.type(),
    outputType: a.String.type(),
    input: undefined,
    typeMap: new Map([
        [
            "*coreType.String",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "String",
                description: "文字列",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.string,
            }),
        ],
        [
            "*coreType.Unit",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "Unit",
                description: "値が1つだけ",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.unit,
            }),
        ],
    ]),
});
exports.name = name;
/**
 * get namespace list. namespace は API の公開非公開, コード生成のモジュールを分けるチャンク. JavaScriptのSetの仕様上, オブジェクトのSetはうまく扱えないので List にしている
 */
const namespaceList = (parameter) => b.requestQuery({
    url: parameter.url ?? new globalThis.URL("http://localhost:2520"),
    namespace: a.FunctionNamespace.meta,
    name: "namespaceList",
    inputType: a.Unit.type(),
    outputType: a.List.type(a.FunctionNamespace.type()),
    input: undefined,
    typeMap: new Map([
        [
            "*coreType.String",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "String",
                description: "文字列",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.string,
            }),
        ],
        [
            "*coreType.Unit",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "Unit",
                description: "値が1つだけ",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.unit,
            }),
        ],
        [
            "*coreType.List",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "List",
                description: "リスト",
                parameter: [
                    a.TypeParameterInfo.from({
                        name: "element",
                        description: "要素の型",
                    }),
                ],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.list,
            }),
        ],
        [
            "*coreType.FunctionNamespace",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "FunctionNamespace",
                description: "出力されるAPI関数のモジュール名",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.sum([
                    a.Pattern.from({
                        name: "meta",
                        description: "APIがどんな構造で表現されているかを取得するためのAPI",
                        parameter: a.Maybe.nothing(),
                    }),
                    a.Pattern.from({
                        name: "local",
                        description: "definy RPC を利用するユーザーが定義したモジュール",
                        parameter: a.Maybe.just(a.List.type(a.String.type())),
                    }),
                ]),
            }),
        ],
    ]),
});
exports.namespaceList = namespaceList;
/**
 * 名前から関数を検索する (公開APIのみ)
 */
const functionListByName = (parameter) => b.requestQuery({
    url: parameter.url ?? new globalThis.URL("http://localhost:2520"),
    namespace: a.FunctionNamespace.meta,
    name: "functionListByName",
    inputType: a.Unit.type(),
    outputType: a.List.type(a.FunctionDetail.type()),
    input: undefined,
    typeMap: new Map([
        [
            "*coreType.String",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "String",
                description: "文字列",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.string,
            }),
        ],
        [
            "*coreType.Unit",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "Unit",
                description: "値が1つだけ",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.unit,
            }),
        ],
        [
            "*coreType.Bool",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "Bool",
                description: "Bool. boolean. 真偽値. True か False",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.boolean,
            }),
        ],
        [
            "*coreType.List",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "List",
                description: "リスト",
                parameter: [
                    a.TypeParameterInfo.from({
                        name: "element",
                        description: "要素の型",
                    }),
                ],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.list,
            }),
        ],
        [
            "*coreType.Namespace",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "Namespace",
                description: "名前空間. ユーザーが生成するものがこっちが用意するものか",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.sum([
                    a.Pattern.from({
                        name: "local",
                        description: "ユーザーが作ったAPIがあるところ",
                        parameter: a.Maybe.just(a.List.type(a.String.type())),
                    }),
                    a.Pattern.from({
                        name: "coreType",
                        description: "definyRpc 共通で使われる型",
                        parameter: a.Maybe.nothing(),
                    }),
                    a.Pattern.from({
                        name: "typedJson",
                        description: "型安全なJSONのコーデック",
                        parameter: a.Maybe.nothing(),
                    }),
                    a.Pattern.from({
                        name: "request",
                        description: "HTTP経路でAPI呼ぶときに使うコード",
                        parameter: a.Maybe.nothing(),
                    }),
                    a.Pattern.from({
                        name: "meta",
                        description: "各サーバーにアクセスし型情報を取得する",
                        parameter: a.Maybe.nothing(),
                    }),
                ]),
            }),
        ],
        [
            "*coreType.Type",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "Type",
                description: "型",
                parameter: [],
                attribute: a.Maybe.just(a.TypeAttribute.asType),
                body: a.TypeBody.product([
                    a.Field.from({
                        name: "namespace",
                        description: "名前空間",
                        type: a.Namespace.type(),
                    }),
                    a.Field.from({
                        name: "name",
                        description: "型の名前",
                        type: a.String.type(),
                    }),
                    a.Field.from({
                        name: "parameters",
                        description: "型パラメータ",
                        type: a.List.type(a.Type.type()),
                    }),
                ]),
            }),
        ],
        [
            "*coreType.FunctionNamespace",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "FunctionNamespace",
                description: "出力されるAPI関数のモジュール名",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.sum([
                    a.Pattern.from({
                        name: "meta",
                        description: "APIがどんな構造で表現されているかを取得するためのAPI",
                        parameter: a.Maybe.nothing(),
                    }),
                    a.Pattern.from({
                        name: "local",
                        description: "definy RPC を利用するユーザーが定義したモジュール",
                        parameter: a.Maybe.just(a.List.type(a.String.type())),
                    }),
                ]),
            }),
        ],
        [
            "*coreType.FunctionDetail",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "FunctionDetail",
                description: "関数のデータ functionByNameの結果",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.product([
                    a.Field.from({
                        name: "namespace",
                        description: "名前空間",
                        type: a.FunctionNamespace.type(),
                    }),
                    a.Field.from({
                        name: "name",
                        description: "api名",
                        type: a.String.type(),
                    }),
                    a.Field.from({
                        name: "description",
                        description: "説明文",
                        type: a.String.type(),
                    }),
                    a.Field.from({
                        name: "input",
                        description: "入力の型",
                        type: a.Type.type(),
                    }),
                    a.Field.from({
                        name: "output",
                        description: "出力の型",
                        type: a.Type.type(),
                    }),
                    a.Field.from({
                        name: "needAuthentication",
                        description: "認証が必要かどうか (キャッシュしなくなる)",
                        type: a.Bool.type(),
                    }),
                    a.Field.from({
                        name: "isMutation",
                        description: "単なるデータの取得ではなく, 変更するようなものか",
                        type: a.Bool.type(),
                    }),
                ]),
            }),
        ],
    ]),
});
exports.functionListByName = functionListByName;
/**
 * 名前から関数を検索する (非公開API)
 */
const functionListByNamePrivate = (parameter) => b.requestQuery({
    url: parameter.url ?? new globalThis.URL("http://localhost:2520"),
    namespace: a.FunctionNamespace.meta,
    name: "functionListByNamePrivate",
    inputType: a.Unit.type(),
    outputType: a.List.type(a.FunctionDetail.type()),
    input: undefined,
    typeMap: new Map([
        [
            "*coreType.String",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "String",
                description: "文字列",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.string,
            }),
        ],
        [
            "*coreType.Unit",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "Unit",
                description: "値が1つだけ",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.unit,
            }),
        ],
        [
            "*coreType.Bool",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "Bool",
                description: "Bool. boolean. 真偽値. True か False",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.boolean,
            }),
        ],
        [
            "*coreType.List",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "List",
                description: "リスト",
                parameter: [
                    a.TypeParameterInfo.from({
                        name: "element",
                        description: "要素の型",
                    }),
                ],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.list,
            }),
        ],
        [
            "*coreType.Namespace",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "Namespace",
                description: "名前空間. ユーザーが生成するものがこっちが用意するものか",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.sum([
                    a.Pattern.from({
                        name: "local",
                        description: "ユーザーが作ったAPIがあるところ",
                        parameter: a.Maybe.just(a.List.type(a.String.type())),
                    }),
                    a.Pattern.from({
                        name: "coreType",
                        description: "definyRpc 共通で使われる型",
                        parameter: a.Maybe.nothing(),
                    }),
                    a.Pattern.from({
                        name: "typedJson",
                        description: "型安全なJSONのコーデック",
                        parameter: a.Maybe.nothing(),
                    }),
                    a.Pattern.from({
                        name: "request",
                        description: "HTTP経路でAPI呼ぶときに使うコード",
                        parameter: a.Maybe.nothing(),
                    }),
                    a.Pattern.from({
                        name: "meta",
                        description: "各サーバーにアクセスし型情報を取得する",
                        parameter: a.Maybe.nothing(),
                    }),
                ]),
            }),
        ],
        [
            "*coreType.Type",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "Type",
                description: "型",
                parameter: [],
                attribute: a.Maybe.just(a.TypeAttribute.asType),
                body: a.TypeBody.product([
                    a.Field.from({
                        name: "namespace",
                        description: "名前空間",
                        type: a.Namespace.type(),
                    }),
                    a.Field.from({
                        name: "name",
                        description: "型の名前",
                        type: a.String.type(),
                    }),
                    a.Field.from({
                        name: "parameters",
                        description: "型パラメータ",
                        type: a.List.type(a.Type.type()),
                    }),
                ]),
            }),
        ],
        [
            "*coreType.FunctionNamespace",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "FunctionNamespace",
                description: "出力されるAPI関数のモジュール名",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.sum([
                    a.Pattern.from({
                        name: "meta",
                        description: "APIがどんな構造で表現されているかを取得するためのAPI",
                        parameter: a.Maybe.nothing(),
                    }),
                    a.Pattern.from({
                        name: "local",
                        description: "definy RPC を利用するユーザーが定義したモジュール",
                        parameter: a.Maybe.just(a.List.type(a.String.type())),
                    }),
                ]),
            }),
        ],
        [
            "*coreType.FunctionDetail",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "FunctionDetail",
                description: "関数のデータ functionByNameの結果",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.product([
                    a.Field.from({
                        name: "namespace",
                        description: "名前空間",
                        type: a.FunctionNamespace.type(),
                    }),
                    a.Field.from({
                        name: "name",
                        description: "api名",
                        type: a.String.type(),
                    }),
                    a.Field.from({
                        name: "description",
                        description: "説明文",
                        type: a.String.type(),
                    }),
                    a.Field.from({
                        name: "input",
                        description: "入力の型",
                        type: a.Type.type(),
                    }),
                    a.Field.from({
                        name: "output",
                        description: "出力の型",
                        type: a.Type.type(),
                    }),
                    a.Field.from({
                        name: "needAuthentication",
                        description: "認証が必要かどうか (キャッシュしなくなる)",
                        type: a.Bool.type(),
                    }),
                    a.Field.from({
                        name: "isMutation",
                        description: "単なるデータの取得ではなく, 変更するようなものか",
                        type: a.Bool.type(),
                    }),
                ]),
            }),
        ],
    ]),
    accountToken: parameter.accountToken,
});
exports.functionListByNamePrivate = functionListByNamePrivate;
/**
 * 型のリストを返す
 */
const typeList = (parameter) => b.requestQuery({
    url: parameter.url ?? new globalThis.URL("http://localhost:2520"),
    namespace: a.FunctionNamespace.meta,
    name: "typeList",
    inputType: a.Unit.type(),
    outputType: a.List.type(a.DefinyRpcTypeInfo.type()),
    input: undefined,
    typeMap: new Map([
        [
            "*coreType.String",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "String",
                description: "文字列",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.string,
            }),
        ],
        [
            "*coreType.Unit",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "Unit",
                description: "値が1つだけ",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.unit,
            }),
        ],
        [
            "*coreType.List",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "List",
                description: "リスト",
                parameter: [
                    a.TypeParameterInfo.from({
                        name: "element",
                        description: "要素の型",
                    }),
                ],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.list,
            }),
        ],
        [
            "*coreType.Maybe",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "Maybe",
                description: "",
                parameter: [
                    a.TypeParameterInfo.from({
                        name: "element",
                        description: "justのときに入る値の型",
                    }),
                ],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.sum([
                    a.Pattern.from({
                        name: "just",
                        description: "",
                        parameter: a.Maybe.just(a.Type.from({
                            namespace: a.Namespace.coreType,
                            name: "element",
                            parameters: [],
                        })),
                    }),
                    a.Pattern.from({
                        name: "nothing",
                        description: "",
                        parameter: a.Maybe.nothing(),
                    }),
                ]),
            }),
        ],
        [
            "*coreType.Namespace",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "Namespace",
                description: "名前空間. ユーザーが生成するものがこっちが用意するものか",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.sum([
                    a.Pattern.from({
                        name: "local",
                        description: "ユーザーが作ったAPIがあるところ",
                        parameter: a.Maybe.just(a.List.type(a.String.type())),
                    }),
                    a.Pattern.from({
                        name: "coreType",
                        description: "definyRpc 共通で使われる型",
                        parameter: a.Maybe.nothing(),
                    }),
                    a.Pattern.from({
                        name: "typedJson",
                        description: "型安全なJSONのコーデック",
                        parameter: a.Maybe.nothing(),
                    }),
                    a.Pattern.from({
                        name: "request",
                        description: "HTTP経路でAPI呼ぶときに使うコード",
                        parameter: a.Maybe.nothing(),
                    }),
                    a.Pattern.from({
                        name: "meta",
                        description: "各サーバーにアクセスし型情報を取得する",
                        parameter: a.Maybe.nothing(),
                    }),
                ]),
            }),
        ],
        [
            "*coreType.DefinyRpcTypeInfo",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "DefinyRpcTypeInfo",
                description: "definy RPC 型の構造",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.product([
                    a.Field.from({
                        name: "namespace",
                        description: "型が所属する名前空間",
                        type: a.Namespace.type(),
                    }),
                    a.Field.from({
                        name: "name",
                        description: "型の名前",
                        type: a.String.type(),
                    }),
                    a.Field.from({
                        name: "description",
                        description: "説明文. コメントなどに出力される",
                        type: a.String.type(),
                    }),
                    a.Field.from({
                        name: "parameter",
                        description: "パラメーター",
                        type: a.List.type(a.TypeParameterInfo.type()),
                    }),
                    a.Field.from({
                        name: "attribute",
                        description: "特殊な扱いをする",
                        type: a.Maybe.type(a.TypeAttribute.type()),
                    }),
                    a.Field.from({
                        name: "body",
                        description: "型の構造を表現する",
                        type: a.TypeBody.type(),
                    }),
                ]),
            }),
        ],
        [
            "*coreType.TypeParameterInfo",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "TypeParameterInfo",
                description: "型パラメータ名と説明文",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.product([
                    a.Field.from({
                        name: "name",
                        description: "型パラメーター名",
                        type: a.String.type(),
                    }),
                    a.Field.from({
                        name: "description",
                        description: "型パラメーター説明",
                        type: a.String.type(),
                    }),
                ]),
            }),
        ],
        [
            "*coreType.TypeAttribute",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "TypeAttribute",
                description: "型をどのような特殊な扱いをするかどうか",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.sum([
                    a.Pattern.from({
                        name: "asType",
                        description: "型のデータ. 型パラメータを付与する",
                        parameter: a.Maybe.nothing(),
                    }),
                ]),
            }),
        ],
        [
            "*coreType.TypeBody",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "TypeBody",
                description: "型の構造を表現する",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.sum([
                    a.Pattern.from({
                        name: "string",
                        description: "string",
                        parameter: a.Maybe.nothing(),
                    }),
                    a.Pattern.from({
                        name: "number",
                        description: "number",
                        parameter: a.Maybe.nothing(),
                    }),
                    a.Pattern.from({
                        name: "boolean",
                        description: "boolean",
                        parameter: a.Maybe.nothing(),
                    }),
                    a.Pattern.from({
                        name: "unit",
                        description: "unit",
                        parameter: a.Maybe.nothing(),
                    }),
                    a.Pattern.from({
                        name: "list",
                        description: "list",
                        parameter: a.Maybe.nothing(),
                    }),
                    a.Pattern.from({
                        name: "set",
                        description: "set",
                        parameter: a.Maybe.nothing(),
                    }),
                    a.Pattern.from({
                        name: "map",
                        description: "map",
                        parameter: a.Maybe.nothing(),
                    }),
                    a.Pattern.from({
                        name: "url",
                        description: "url",
                        parameter: a.Maybe.nothing(),
                    }),
                    a.Pattern.from({
                        name: "product",
                        description: "product",
                        parameter: a.Maybe.just(a.List.type(a.Field.type())),
                    }),
                    a.Pattern.from({
                        name: "sum",
                        description: "sum",
                        parameter: a.Maybe.just(a.List.type(a.Pattern.type())),
                    }),
                ]),
            }),
        ],
        [
            "*coreType.Field",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "Field",
                description: "product 直積型で使う",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.product([
                    a.Field.from({
                        name: "name",
                        description: "フィールド名",
                        type: a.String.type(),
                    }),
                    a.Field.from({
                        name: "description",
                        description: "フィールドの説明",
                        type: a.String.type(),
                    }),
                    a.Field.from({
                        name: "type",
                        description: "型",
                        type: a.Type.type(),
                    }),
                ]),
            }),
        ],
        [
            "*coreType.Pattern",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "Pattern",
                description: "直和型の表現",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.product([
                    a.Field.from({
                        name: "name",
                        description: "パターン名",
                        type: a.String.type(),
                    }),
                    a.Field.from({
                        name: "description",
                        description: "説明",
                        type: a.String.type(),
                    }),
                    a.Field.from({
                        name: "parameter",
                        description: "パラメーター",
                        type: a.Maybe.type(a.Type.type()),
                    }),
                ]),
            }),
        ],
        [
            "*coreType.Type",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "Type",
                description: "型",
                parameter: [],
                attribute: a.Maybe.just(a.TypeAttribute.asType),
                body: a.TypeBody.product([
                    a.Field.from({
                        name: "namespace",
                        description: "名前空間",
                        type: a.Namespace.type(),
                    }),
                    a.Field.from({
                        name: "name",
                        description: "型の名前",
                        type: a.String.type(),
                    }),
                    a.Field.from({
                        name: "parameters",
                        description: "型パラメータ",
                        type: a.List.type(a.Type.type()),
                    }),
                ]),
            }),
        ],
    ]),
});
exports.typeList = typeList;
/**
 * 名前空間「definyRpc」のApiFunctionを呼ぶ TypeScript のコードを生成する
 */
const generateCallDefinyRpcTypeScriptCode = (parameter) => b.requestQuery({
    url: parameter.url ?? new globalThis.URL("http://localhost:2520"),
    namespace: a.FunctionNamespace.meta,
    name: "generateCallDefinyRpcTypeScriptCode",
    inputType: a.Unit.type(),
    outputType: a.String.type(),
    input: undefined,
    typeMap: new Map([
        [
            "*coreType.String",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "String",
                description: "文字列",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.string,
            }),
        ],
        [
            "*coreType.Unit",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "Unit",
                description: "値が1つだけ",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.unit,
            }),
        ],
    ]),
});
exports.generateCallDefinyRpcTypeScriptCode = generateCallDefinyRpcTypeScriptCode;
/**
 * サーバーが実行している環境でコードを生成し, ファイルとして保存する.
 *  保存先:file:///C:/Users/narum/Documents/GitHub/definy/deno-lib/definyRpc/example/generated/
 */
const generateCodeAndWriteAsFileInServer = (parameter) => b.requestQuery({
    url: parameter.url ?? new globalThis.URL("http://localhost:2520"),
    namespace: a.FunctionNamespace.meta,
    name: "generateCodeAndWriteAsFileInServer",
    inputType: a.Unit.type(),
    outputType: a.Unit.type(),
    input: undefined,
    typeMap: new Map([
        [
            "*coreType.Unit",
            a.DefinyRpcTypeInfo.from({
                namespace: a.Namespace.coreType,
                name: "Unit",
                description: "値が1つだけ",
                parameter: [],
                attribute: a.Maybe.nothing(),
                body: a.TypeBody.unit,
            }),
        ],
    ]),
});
exports.generateCodeAndWriteAsFileInServer = generateCodeAndWriteAsFileInServer;
