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
	const tours = getToursFromJson()
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
function getToursFromJson() {
	try {
		const fileContent = fs.readFileSync(__dirname + '/tours.json', 'utf8')
		const jsonData = JSON.parse(fileContent)
		return jsonData
	} catch (error) {
		console.error('Error reading the file:', error.message)
	}
}

async function fetchWeather(city) {
	try {
	  let apiKey = 'f0b917381c4240aaa45111118241701';
	  let link = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;
	  const response = await axios.get(link);
  
	  const weatherData = {
		location: response.data.location.name,
		temperature: response.data.current.temp_c,
		feelsLike: response.data.current.feelslike_c,
		windSpeed: response.data.current.wind_kph,
	  };
  
	  return weatherData;
	} catch (error) {
	  console.error('Error fetching weather data:', error.message);
	  throw new Error('Internal Server Error');
	}
  }
  
  
app.get('/tour/:id', async (req, res) => {
	try {
	  const tourId = parseInt(req.params.id);
	  const tours = getToursFromJson();
  
	  if (!tours) {
		return res.status(500).send('Tours data not found');
	  }
  
	  const chosenTour = tours.tours.find(tour => tour.id == tourId);
  
	  if (!chosenTour) {
		return res.status(404).send('Tour not found');
	  }
  
	  let weatherData = {};
  
	  try {
		const weatherResponse = await fetchWeather(chosenTour.city);
  
		weatherData = {
		  location: weatherResponse.location,
		  temperature: weatherResponse.temperature,
		  feelsLike : weatherResponse.feelsLike,
		  windSpeed: weatherResponse.windSpeed,
		};
  
		console.log('Weather API response:', weatherData);
	  } catch (error) {
		console.error('Error fetching weather data:', error.message);
	  }
  
	  const tourHtmlPath = path.join(__dirname, 'views', 'tourPage.html');
	  const fileContent = fs.readFileSync(tourHtmlPath, 'utf8');
  
	  const updatedHtml = replacePlaceholders(fileContent, chosenTour, weatherData);
	  res.send(updatedHtml);
	} catch (err) {
	  console.error('Error handling request:', err.message);
	  res.status(500).send('Request failed');
	}
  });
  
  
  function replacePlaceholders(content, tour, weather) {
	return content
	  .replace('{{img}}', tour.img)
	  .replace('{{country}}', tour.country)
	  .replace('{{city}}', tour.city)
	  .replace('{{hotel}}', tour.hotel)
	  .replace('{{dateArrival}}', tour.dateArrival)
	  .replace('{{dateDeparture}}', tour.dateDeparture)
	  .replace('{{adults}}', tour.adults)
	  .replace('{{children}}', tour.children)
	  .replace('{{price}}', tour.price)
	  .replace('{{id}}', tour.id)
	  .replace('{{weatherLocation}}', weather.location)
	  .replace('{{weatherTemperature}}', weather.temperature)
	  .replace('{{weatherFeelsLike}}', weather.feelsLike)
	  .replace('{{weatherWindSpeed}}', weather.windSpeed);
  }
  
  



const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
