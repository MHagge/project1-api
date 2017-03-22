const http = require('http');

const url = require('url');

const query = require('querystring');

const responseHandler = require('./response.js');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  '/': responseHandler.getIndex,
  '/style.css': responseHandler.getStyle,
  '/getNote': responseHandler.getNote,
  '/addNote': responseHandler.addNote,
  notFound: responseHandler.whenNotFound,
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);
  // grab the query parameters and put em in an object
  // const params = query.parse(parsedUrl.query);


  if (request.method === 'POST') {
    const body = [];


    request.on('error', (err) => {
      console.dir(err);
      const res = response;
      res.statusCode = 400;
      res.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });


    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();

      const bodyParams = query.parse(bodyString);

        // pass to our addUser function
      responseHandler.addNote(request, response, bodyParams);
    });
  }


  if (request.method !== 'POST') {
    if (urlStruct[parsedUrl.pathname]) {
      urlStruct[parsedUrl.pathname](request, response);
    } else {
      urlStruct.notFound(request, response);
    }
  }
};

http.createServer(onRequest).listen(PORT);
console.log(`Listening on 127.0.0.1: ${PORT}`);
