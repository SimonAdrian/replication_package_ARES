module.exports = function (RED) {
    function qywxNotice(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        node.on('input', function (msg) { // 接收上游节点接收消息
            try{
                var https = require('https');
                var querystring = require('querystring');
    
                var contents = JSON.stringify(msg.payload);
    
                var options = {
                    host: `qyapi.weixin.qq.com`,
                    method: 'POST',
                    path:`/cgi-bin/webhook/send?key=${config.token}&debug=1`,
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(contents)
                    }
                }
    
                var req = https.request(options, function(res) {
                    res.setEncoding('utf8');
                    res.on('data', function(data) {
                        
                        console.log("data 被调用",data);
    
                        node.send({ // 向下一个节点输出信息
                            payload: data
                        });
                    });
                });
    
                req.write(contents);
                req.end;
            }catch(ex){
                node.error(ex);
            }

            

        });
    }

    // 注册一个节点 sum,注册的节点不能重复也就是说同一个 node-red 项目不能有 2 个 registerType sum 节点
    RED.nodes.registerType("qywx-notice", qywxNotice);
}
