const express = require('express');
const app = express();

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/:pageName', (req, res) => {
  const pageName = req.params.pageName;

  switch (pageName) {
      case 'travelagency':
          res.sendFile(__dirname + '/views/travelagency.html');
          break;
      default:
          res.status(404).send('Page not found');
  }
});
 

app.get('/api/cities', async (req, res) => {
  console.log('Request to /api/cities:', req.query);
  const country = req.query.country;
  const cities = await getCitiesForCountry(country);
  res.send(cities);
});

async function getCitiesForCountry(country) {
 
  switch (country) {
      case 'Australia':
          return ['Sydney', 'Melbourne', 'Brisbane'];
      case 'Brazil':
          return ['Sao Paulo', 'Rio de Janeiro', 'Salvador'];

      default:
          return [];
  }
}


const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
