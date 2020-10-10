const express = require('express');
const path = require('path');

const app = express();

// Serve static React app at route directory of server
// app.use is the middleware and applies to all, independent of call
// points to this folder for static files
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/hello-world', (req,res) => {
    res.send('<h1>Hello World!</h1>');
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`React Cloud Chat listening on ${port}`);
