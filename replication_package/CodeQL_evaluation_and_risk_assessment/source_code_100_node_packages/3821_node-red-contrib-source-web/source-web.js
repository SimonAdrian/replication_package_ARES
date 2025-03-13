const express = require('express');
const fs = require('fs');
const session = require('express-session');
module.exports = RED => {
  // 输入节点
  RED.nodes.registerType('source-web', class {
    constructor (config) {
      const node = this
      RED.nodes.createNode(node, config)
      const web_config = RED.nodes.getNode(config.webconfig)
      const app = express();
      var path = web_config.path;
      var conf_psd = web_config.pwd;
      var historyurl = '';
      fs.readdir(path,function (err,files){
        if(err){
          return node.log('folder is not exist!');
        }
        app.use(session({
            //session的秘钥，防止session劫持。 这个秘钥会被循环使用，秘钥越长，数量越多，破解难度越高。
            secret: 'sourceweb',
            //session过期时间，不易太长。php默认20分钟
            resave:false,
            //可以改变浏览器cookie的名字
            saveUninitialized: true,
            cookie:{
                maxAge: 1000*60*60*24 // default session expiration is set to 24 hour
            }
        }));
        /*拦截器*/
        app.use(function (req, res, next) {    
            if(conf_psd == null || conf_psd == ''){
              return next();
            }             
            if (req.session.login==1) {
                //用户登录过
                return next();
            } else {
                //解析用户请求路径
                var arr = req.url.split('/');            
                //去除get请求携带的参数
                for (var i = 0; i < arr.length; i++) {
                    arr[i] = arr[i].split('?')[0];
                }

                if (arr.length > 1) {                    
                    if (arr[1] == 'checkLogin' || arr[1] == 'favicon.ico') {                   
                        return next();
                    }
                    else {
                        historyurl = req.url;                    
                        res.sendFile( __dirname + "/password.html" );  // 将用户重定向到登录页面                        
                    }
                }
            }
        });
        app.get('/checkLogin',function (req,res) { 
            var password = req.query.password;             
            if(password == conf_psd){
                req.session.login = '1';
                return res.redirect(historyurl);            
            }else {
                res.send('验证失败!');
            }
        });

        app.use(express.static(path));
        app.get(path+'/*', function (req, res) {
            res.sendFile( __dirname + "/" + req.url );
            console.log("Request for " + req.url + " received.");
        })       
        //如果访问网页和本地同名，可以使用以下版本
        app.get(path+'/*.html', function (req, res) {
           res.sendFile( __dirname + "/" + req.url );
           console.log("Request for " + req.url + " received.");
        })    
        // 404
        app.use((req, res, next) => {
          res.status(404).end('')
        })

      })

      const server = app.listen(web_config.port, () => {
        node.status({ text: `port: ${web_config.port}`, fill: 'green', shape: 'dot' })
        node.log(`listening on port ${web_config.port}`)
      })
      server.on('error', ({ message }) => { node.status({ text: message, fill: 'red', shape: 'ring' }) })
      node.on('close', () => server.close())
    }
  })
}
