'use strict';

// clients contains current connections
const clients = [];

// An addition of an object of a response into the clients
exports.subscribe = function(req, res) {
    console.log('subscribe');
    clients.push(res);
};

exports.publish = function(message) {
    console.log('publish', message);
    clients.forEach((res) => {
        // For each response, we'll give back its message 
        res.end(message);
    });
};
