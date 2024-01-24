const express = require('express');
const router = express.Router();

// Sample data structure to store selected tours
const selectedTours = [];

router.get('/', (req, res) => {
    res.render('travelAgency');
});

router.post('/travelagency', (req, res) => {
    // Handle form data, calculate tour cost, fetch weather, and store data
    // Example logic (modify as needed)
    const tourData = req.body;
    // ... (perform calculations, API calls, and data storage)
    selectedTours.push({ data: tourData, timestamp: new Date() });
    // Render the result page with calculated data
    res.render('travelAgencyResult', { result: calculatedResult });
});

module.exports = router;
