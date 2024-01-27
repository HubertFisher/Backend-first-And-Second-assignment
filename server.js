const express = require('express');
const app = express();
const path = require('path')
const axios = require('axios')
const fs = require('fs')
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/views'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/:pageName', (req, res) => {
  const pageName = req.params.pageName;

  switch (pageName) {
	case 'tourscart':
		res.sendFile(__dirname + '/views/tourCart.html');
		break;
      case 'travelagency':
          res.sendFile(__dirname + '/views/travelagency.html');
          break;
      default:
          res.status(404).send('Page not found');
  }
});
 

app.get('/api/cities', async (req, res) => {
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

app.get('/weather/api', async (req, res) => {
    try {
        let apiKey = 'f0b917381c4240aaa45111118241701';
        let city = req.query.city;
        let link = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;
        const response = await axios.get(
			link
		);

        const weatherData = {
            location: response.data.location.name,
            temperature: response.data.current.temp_c,
            feelsLike: response.data.current.feelslike_c,
            windSpeed: response.data.current.wind_kph,
        };

        // Send the weather data as JSON response to the client
        res.json(weatherData);
    } catch (error) {
        console.error('Error fetching weather:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
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

		const response = await fetch(`http://localhost:3000/weather/api?city=${chosenTour.city}`);
		const weatherResponse = await response.json();
		weatherData = {
		  location: weatherResponse.location,
		  temperature: weatherResponse.temperature,
		  feelsLike : weatherResponse.feelsLike,
		  windSpeed: weatherResponse.windSpeed,
		};
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
  
  
app.post('/api/addToCart', (req, res) => {
    const toursData = req.body;

    fs.readFile('toursCart.json', 'utf-8', (err, existingCartData) => {
        if (err) {
            console.error('Error reading existing cart data:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        let cartData;
        try {
            cartData = JSON.parse(existingCartData);
        } catch (parseError) {
            console.error('Error parsing existing cart data:', parseError);
            cartData = [];
        }

        if (!Array.isArray(cartData)) {
            console.error('Existing cart data is not an array:', cartData);
            cartData = [];
        }

        cartData.push(toursData);

        fs.writeFile('toursCart.json', JSON.stringify(cartData, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing to toursCart.json:', writeErr);
                return res.status(500).json({ success: false, message: 'Internal Server Error' });
            }

            res.json({ success: true, message: 'Tour added to cart successfully.' });
        });
    });
});

app.get('/api/cart', (req, res) => {
	fs.readFile('toursCart.json', 'utf-8', (err, cartData) => {
		if (err) {
			console.error('Error reading cart data:', err);
			return res.status(500).json({ success: false, message: 'Internal Server Error' });
		}

		let parsedCartData;
		try {
			parsedCartData = JSON.parse(cartData);
		} catch (parseError) {
			console.error('Error parsing cart data:', parseError);
			parsedCartData = [];
		}

		if (!Array.isArray(parsedCartData)) {
			console.error('Parsed cart data is not an array:', parsedCartData);
			parsedCartData = [];
		}

		res.json({ success: true, tours: parsedCartData });
	});

});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
