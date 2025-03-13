const oneDriveAPI=require("onedrive-api").items

module.exports=RED=>{
    function UploadFileNode(config){
        RED.nodes.createNode(this, config)
        const credentials=this.credentials || {}
        this.on("input", msg=>{
            const params={
                accessToken: credentials.AccessToken || config.AccessToken,
                filename: msg.filename || config.Filename,
                parentPath: msg.parentPath || config.ParentPath,
                readableStream: msg.payload,
            }
            oneDriveAPI.uploadSimple(params).then(item=>{
                msg.upload=item
                this.send(msg)
            }).catch(e=>{
                msg={
                    ...msg,
                    ...e,
                }
                this.send(msg)
            })
        })
    }
    RED.nodes.registerType("onedrive-upload-file", UploadFileNode, {
        credentials: {
            AccessToken: {
                type: "text",
            },
        },
    })
}
