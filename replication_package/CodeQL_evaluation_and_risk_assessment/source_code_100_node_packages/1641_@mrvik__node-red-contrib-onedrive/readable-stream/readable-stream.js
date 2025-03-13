const fs=require("fs")
module.exports=RED=>{
    function CreateReadableStream(config){
        RED.nodes.createNode(this, config)
        this.on("input", msg=>{
            msg.payload=fs.createReadStream(msg.filename || config.filename)
            msg.payload.on("error", console.error)
            this.send(msg)
        })
    }
    RED.nodes.registerType("create-readable-stream", CreateReadableStream)
}
