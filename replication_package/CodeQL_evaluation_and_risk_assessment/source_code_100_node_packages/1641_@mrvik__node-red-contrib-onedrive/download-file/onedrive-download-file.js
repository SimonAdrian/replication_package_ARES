const oneDriveAPI=require("onedrive-api").items
const fs=require("fs")

module.exports=RED=>{
    function DownloadFileNode(config){
        RED.nodes.createNode(this, config)
        const credentials=this.credentials || {}
        this.on("input", msg=>{
            const params={
                accessToken: credentials.AccessToken,
                itemId: config.ItemID || msg.itemID
            }
            const item=oneDriveAPI.download(params)
            const writeStream=fs.createWriteStream(config.Filename || msg.filename)
            item.pipe(writeStream)
            item.on("end", ()=>{
                this.send(msg)
            })
            item.on("error", err=>{
                throw err
            })
        })
    }
    RED.nodes.registerType("onedrive-download-file", DownloadFileNode, {
        credentials: {
            AccessToken: {
                type: "text",
            },
        },
    })
}
