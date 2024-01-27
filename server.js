const express = require('express');
const app = express();
const path = require('path')
const axios = require('axios')
const fs = require('fs')

app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/views'));

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
app.get('/weather/api', async (req, res) => {
  try {
      // Replace 'YOUR_API_KEY' with your actual WeatherAPI API key
      let apiKey = 'f0b917381c4240aaa45111118241701' //bd5e378503939ddaee76f12ad7a97608
      let city = req.query.city // Get the city from the query parameters
      let link = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`
      // Make a request to the WeatherAPI
      const response = await axios.get(link)

      const weatherData = {
          location: response.data.location.name,
          temperature: response.data.current.temp_c,
          condition: response.data.current.condition.text,
      }
      res.json(weatherData)
      
  } catch (error) {
      // Handle errors
      console.error('Error fetching weather data:', error.message)
      res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.get('/tour/:id', (req, res) => {
	const tourId = parseInt(req.params.id)
	const toursData = getToursFromFile()

	if (!toursData) {
		return res.status(500).send('Internal Server Error')
	}
	const selectedTour = toursData.tours.find(tour => tour.id == tourId)
	if (!selectedTour) {
		return res.status(404).send('Tour not found')
	}
	const tourHtmlPath = path.join(__dirname, 'views', 'tour.html')
	fs.readFile(tourHtmlPath, 'utf8', (err, fileContent) => {
		if (err) {
			console.error('Error reading the file:', err.message)
			return res.status(500).send('Internal Server Error')
		}
		const updatedHtml = fileContent
			.replace('{{img}}', selectedTour.img)
			.replace('{{country}}', selectedTour.country)
			.replace('{{city}}', selectedTour.city)
			.replace('{{hotel}}', selectedTour.hotel)
			.replace('{{dateArrival}}', selectedTour.dateArrival)
			.replace('{{dateDeparture}}', selectedTour.dateDeparture)
			.replace('{{adults}}', selectedTour.adults)
			.replace('{{children}}', selectedTour.children)
			.replace('{{price}}', selectedTour.price)
			.replace('{{id}}', selectedTour.id)
		res.send(updatedHtml)
	})
}) 
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
