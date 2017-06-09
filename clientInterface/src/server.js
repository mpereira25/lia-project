import http from 'http';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { match, RouterContext } from 'react-router'
import routes from './routes';
import fs from 'fs';
import MainModel from './model/MainModel';
import MainModelController from './model/controller/MainModelController';
import DatasEvent from './model/evt/DatasEvent';


http.createServer(function(req, res) {

    if (req.url == '/main.js') {

        res.setHeader('Content-Type', 'text/javascript');

        fs.readFile('./dist/main.js', 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            res.end(data);
        });

    } else if (req.url == '/css/main.css') {

        res.setHeader('Content-Type', 'text/css');
        fs.readFile('./dist/css/main.css', 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            res.end(data);
        });

    } else if (req.url.indexOf('.jpg') != -1) {

        var img = fs.readFileSync('./dist/' + req.url);
        res.writeHead(200, {'Content-Type': 'image/jpg' });
        res.end(img, 'binary');

    } else {

        match({ routes: routes, location: req.url }, (err, redirect, props) => {
          // in here we can make some decisions all at once
          if (err) {
            // there was an error somewhere during route matching
            res.end(err.message);
          } else if (redirect) {
            // we haven't talked about `onEnter` hooks on routes, but before a
            // route is entered, it can redirect. Here we handle on the server.
            res.redirect(redirect.pathname + redirect.search)
          } else if (props) {
              // get datas
              var _ref = this;
              var htmlStr = '';
              fs.readFile('./src/index.html', 'utf8', function (err, data) {
                  if (err) {
                      return console.log(err);
                  }
                  htmlStr = data;

                  var reactToInject = ReactDOMServer.renderToString(<RouterContext {...props}/>);

                  htmlStr = htmlStr.replace('<!-- reactDom -->', reactToInject);
                  htmlStr = htmlStr.replace('<!-- model object server -->', '<script type="text/javascript"> var ModelServer = \'' + JSON.stringify(MainModel.toObject()) + '\';</script>');

                  res.end(htmlStr);
              });

          } else {
            // no errors, no redirect, we just didn't match anything
            res.end('');
          }
        })

    }

// The http server listens on port 3000
}).listen(3000, function(err) {
    if (err) throw err
    console.log('Listening on 3000...')
});
