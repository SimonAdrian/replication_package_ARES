/*
Apache-2.0

Copyright (c) 2024  Vahdettin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
*/
'use strict'
const library = require("./lib/library")
function casBE(RED) {

    const debug = false;
    /**
     * Log to console
     * @param {string} msg - Text message
     * @param {object} obj - Optional object to be sent to console
     */
    function d(msg, obj = null) {
        try {
            if (debug === true) console.log(msg);
            if (debug && obj) console.log(obj);
        } catch (err) {
            console.warn(new Error(err));
        }
    }
    /**
     * Error handler
     * @param {object} err - Error object
     * @param {number} status - HTTP response code
     * @param {object} res - Response if any
     * @param {string} message - Additional message text
     */
    function handle(err,status = 500,res,message = "Unknown"){
        if(err && status && res){
            console.warn(message);
            res.status(status);
            res.end(JSON.stringify({error: message}));
        } else {
            res.end(JSON.stringify({error: "unknown_error"}));
        }

    }
    RED.httpAdmin.get('/caseta/data/library', function (req, res) {
        d("GET /caseta/data/library");
        let result = {};
        try {
            for(const l in library){
                if(library.hasOwnProperty(l) && !library[l].hidden){
                    result[l] = library[l];
                }
            }
            res.end(JSON.stringify(result));
        } catch (err){
            console.warn(err);
            handle(err,500,res);
        }
    });
    console.log("node-red-contrib-caseta backend started.");
}

module.exports.casBE = casBE;

