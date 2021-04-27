'use strict';

const fs = require('fs');
const util = require('util');
const EventEmitter = require('events');
const http = require('http');
const url = require('url');

const chat = require('./chat');

const hostname = '127.0.0.5';
const port = 3005;
const server = http.createServer((request, response) => {

    if (request.url == '/favicon.ico') {
        sendFavicon(request.url, response);
        return;
    }
    if (request.url.endsWith('.css')) {
        sendCSS(request.url, response);
        return;
    }
    if (request.url.endsWith('.js')) {
        sendJS(request.url, response);
        return;
    }

    switch (request.url) {
        case '/':
            sendFile('index.html', response);
            break;
        case '/subscribe':
            chat.subscribe(request, response);
            break;
        // A POST request from a client    
        case '/publish': 
            let body = '';
            request
                .on('readable', () => {
                    // A message from a client as JSON
                    body += request.read() || ''; // Cleaning null

                    if (body.length > 1e4) {
                        response.statusCode = 413;
                        body = ''; // Cleaning of the long message
                        response.end('Your message is too big for my small chat');
                    }
                })
                .on('end', () => {
                    console.log('end');
                    try {
                        body = JSON.parse(body);
                    } catch (err) {
                       response.statusCode = 400;
                       response.end('Bad request');
                       return; 
                    }
                    // A dispatch of messages to everyone who was subscribed
                    chat.publish(body.message);
                    response.end('ok');
                });

            
            break;

        default:
            response.statusCode = 404;
            response.end('Not Found');
            break;
    }

});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});



function sendFile(file, response) {
    // Отправляем файл в поток ответа
    const fileStream = fs.createReadStream(file);
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setCode = 200;
    // Если с потоком что-то произошло, тогда обрабатываем ошибку
    fileStream
        .on('error', (err) => {
            response.setCode = 500;
            response.end("Server Error");
            console.error(err);
        })
        .pipe(response) // A dispatch pieces of file to the clients
        .on('close', () => { // A file was sent, we close the file stream
            fileStream.destroy();
        });
    
}

function sendCSS(pathToCSS, response) {
    fs.readFile(pathToCSS.slice(1), (err, cssFile) => {
        if (err) throw err;
        response.setHeader('Content-Type', 'text/css');
        response.statusCode = 200;
        response.end(cssFile);
    });
}
function sendJS(pathToJS, response) {
    fs.readFile(pathToJS.slice(1), (err, jsFile) => {
        if (err) throw err;
        response.setHeader('Content-Type', 'application/javascript');
        response.statusCode = 200;
        response.end(jsFile);
    });
}
function sendFavicon(pathToFavicon, response) {
    fs.readFile(pathToFavicon.slice(1), (err, favicon) => {
        if (err) console.error('favicon.ico not found');
        response.setHeader('Content-Type', 'image/x-icon');
        response.statusCode = 200;
        response.end(favicon);
    });
}