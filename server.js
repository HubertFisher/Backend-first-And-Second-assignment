const express = require('express');
const app = express();
const fs = require('fs')
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
          return ['Sydney'];
      case 'Brazil':
          return ['Rio de Janeiro' ];
      case 'Kazakhstan':
          return ['Almaty', 'Astana']; 
      case 'Italy':
          return ['Rome'];
      case 'Japan':
          return ['Tokyo'];
      case 'France':
          return ['Paris'];
      case 'United States':
          return ['New York'];
      default:
          return [];
  }
}

app.get('/api/tours', (req, res) => {
	const tours = getToursFromFile()
	const { country, cityName, minPrice, maxPrice,id } = req.query
	let filteredTours = tours.tours

	if (id) {
		const foundTour = tours.tours.find(tour => tour.id == id)

		if (foundTour) {
			res.json(foundTour)
		} else {
			res.status(404).json({ error: 'Tour not found' })
		}
	} else {
		if (country) {
			filteredTours = filteredTours.filter(tour =>
				tour.country.toLowerCase().includes(country.toLowerCase())
			)
		}

		if (id) {
			const foundTour = filteredTours.find(
				tour => tour.id.toString() === id.toString()
			)
			if (foundTour) {
				res.json({ tours: [foundTour] })
			} else {
				res.json({ tours: [] })
			}
			return
		}

		if (cityName) {
			filteredTours = filteredTours.filter(tour =>
				tour.city.toLowerCase().includes(cityName.toLowerCase())
			)
		}

		if (minPrice) {
			filteredTours = filteredTours.filter(
				tour => tour.price >= parseInt(minPrice, 10)
			)
		}

		if (maxPrice) {
			filteredTours = filteredTours.filter(
				tour => tour.price <= parseInt(maxPrice, 10)
			)
		}
		res.json({ tours: filteredTours })
	}
})
function getToursFromFile() {
	try {
		const fileContent = fs.readFileSync(__dirname + '/tours.json', 'utf8')
		const jsonData = JSON.parse(fileContent)
		return jsonData
	} catch (error) {
		console.error('Error reading the file:', error.message)
	}
}
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
