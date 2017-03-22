const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);

const style = fs.readFileSync(`${__dirname}/../client/style.css`);

const notes = {};
let noteInt = 0;

const crypto = require('crypto');

let etag = crypto.createHash('sha1').update(JSON.stringify(notes));

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

const getNote = (request, response) => {
  // for now get all notes? wip
  if (request.headers['if-none-match'] === digest) {
    return respond(request, response, 304, header, JSON.stringify(notes));
  }
  return respond(request, response, 200, header, JSON.stringify(notes));
};

const addNote = (request, response, params) => {
  if (params.note === '') {
    const responseJSON = {
      message: '<br />No note was entered. Enter a note first!',
      id: 'resJSON',
    };
    return respond(request, response, 400, header, JSON.stringify(responseJSON));
  }
  let responseJSON = {
    message: '<br />Note Added!',
    id: 'resJSON',
  };

  // check if note with title and author already exists
  const keys = Object.keys(notes);

  for (let i = 0; i < keys.length; i++) {
    // const currentNote = `note${noteInt}`;

    // console.log(`notes keys .nots ${notes[keys[i]].note}`);
    // console.log(params.note);
    if (notes[keys[i]].note === params.note) {
      responseJSON = {
        message: '<br />This note already exists!',
        id: 'resJSON',
      };
      return respond(request, response, 204, header, JSON.stringify(responseJSON));
    }
  }

  // add note to note object
  notes[`note${noteInt}`] = { title: params.title, note: params.note, author: params.author, date: params.date };
  /*
  notes{
    note1{
      title: Title,
      note: Note,
      author: Author
    },
  }
  */

  noteInt++;

  etag = crypto.createHash('sha1').update(JSON.stringify(notes));
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
  getNote,
  addNote,
  whenNotFound,
};

