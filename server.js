const express = require('express');
const exphbs = require('express-handlebars');

const app = express();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});
app.get('/travelagency', (req, res) => {
    res.sendFile(__dirname + '/views/travelagency.html');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
