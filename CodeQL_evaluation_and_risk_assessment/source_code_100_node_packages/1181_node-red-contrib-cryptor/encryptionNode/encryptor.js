module.exports = function(RED) {
    
    var NodeName = 'encryptor';
    
    function EncryptionNode(config) {
        RED.nodes.createNode(this,config);
        
    
        
        // Nodejs encryption with CTR
        var crypto = require('crypto');
        var algorithm = 'aes-256-ctr';
        var password = config.cryptoPassword;
        
        function encrypt(text){
          var cipher = crypto.createCipher(algorithm,password);
          var crypted = cipher.update(text,'utf8','hex');
          crypted += cipher.final('hex');
          return crypted;
        }
         
        function decrypt(text){
          var decipher = crypto.createDecipher(algorithm,password);
          var dec = decipher.update(text,'hex','utf8');
          dec += decipher.final('utf8');
          return dec;
        }

        //node specific code goes here
        var node = this;
        this.on('input', function(msg) {
            msg.payload = encrypt(msg.payload);
            node.send(msg);
        });


    }
    RED.nodes.registerType(NodeName,EncryptionNode);
}