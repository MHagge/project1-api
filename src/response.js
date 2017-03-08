const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);

const style = fs.readFileSync(`${__dirname}/../client/style.css`);

const puns = {};
let punInt = 0;

const crypto = require('crypto');

let etag = crypto.createHash('sha1').update(JSON.stringify(puns));

let digest = etag.digest('hex');

const header = {
  'Content-Type': 'application/json',
  etag: digest,
};

const respond = (request, response, status, headers, content) => {
  response.writeHead(status, headers);
  response.write(content);
  response.end();
};

const getIndex = (request, response) => {
  /*
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
  */
  respond(request, response, 200, { 'Content-Type': 'text/html' }, index);
};

const getStyle = (request, response) => {
  /*
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(style);
  response.end();
  */
  respond(request, response, 200, { 'Content-Type': 'text/css' }, style);
};

const getPun = (request, response) => {
  // for now get all puns? wip
  if (request.headers['if-none-match'] === digest) {
    return respond(request, response, 304, header, JSON.stringify(puns));
  }
  return respond(request, response, 200, header, JSON.stringify(puns));
};

const addPun = (request, response, params) => {
  if (params.pun === '') {
    const responseJSON = {
      message: '<br />No joke was entered. <br />I guess the real joke is your sad inability to follow simple directions lmao get rekt',
      id: 'resJSON',
    };
    return respond(request, response, 400, header, JSON.stringify(responseJSON));
  }
  const responseJSON = {
    message: '<br />Pun Added!',
    id: 'resJSON',
  };

  // add pun to pun object
  // console.dir(params);
  // puns[params.pun] = { author: params.author };
    /*
    puns = {
      bad pun lol{ author: author, otherstuff: stuff}
    }
    */
  puns[`pun${punInt}`] = { pun: params.pun, author: params.author };
  punInt++;

  etag = crypto.createHash('sha1').update(JSON.stringify(puns));
  digest = etag.digest('hex');

  return respond(request, response, 201, header, JSON.stringify(responseJSON));
};

const whenNotFound = (request, response) => {
  // error message with a description and consistent error id
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'Not Found',
  };
  return respond(request, response, 404, header, JSON.stringify(responseJSON));
};

module.exports = {
  respond,
  getIndex,
  getStyle,
  getPun,
  addPun,
  whenNotFound,
};

