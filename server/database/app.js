const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3030;

app.use(cors());
app.use(require('body-parser').urlencoded({ extended: false }));

// Carga de datos iniciales
const reviews_data = JSON.parse(fs.readFileSync('reviews.json', 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync('dealerships.json', 'utf8'));

// Conexión a MongoDB
mongoose.connect('mongodb://mongo_db:27017/', { dbName: 'dealershipsDB' });

// Modelos
const Reviews = require('./review');
const Dealerships = require('./dealership');

// Semilla de datos (limpia e inserta)
try {
  Reviews.deleteMany({}).then(() => {
    Reviews.insertMany(reviews_data['reviews']);
  });
  Dealerships.deleteMany({}).then(() => {
    Dealerships.insertMany(dealerships_data['dealerships']);
  });
} catch (error) {
  console.error('Seeding error:', error);
}

// Home
app.get('/', async (req, res) => {
  res.send('Welcome to the Mongoose API');
});

// --- REVIEWS ---

// Todas las reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find({});
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Reviews por dealer (id)
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const dealerId = parseInt(req.params.id, 10);
    const documents = await Reviews.find({ dealership: dealerId });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Insertar review
app.post('/insert_review', express.raw({ type: '*/*' }), async (req, res) => {
  const data = JSON.parse(req.body);
  const documents = await Reviews.find().sort({ id: -1 });
  const new_id = documents.length ? documents[0]['id'] + 1 : 1;

  const review = new Reviews({
    id: new_id,
    name: data['name'],
    dealership: data['dealership'],
    review: data['review'],
    purchase: data['purchase'],
    purchase_date: data['purchase_date'],
    car_make: data['car_make'],
    car_model: data['car_model'],
    car_year: data['car_year'],
  });

  try {
    const savedReview = await review.save();
    res.json(savedReview);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

// --- DEALERSHIPS ---

// Todos los dealers
app.get('/fetchDealers', async (req, res) => {
  try {
    const documents = await Dealerships.find({});
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Dealers por estado
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const state = req.params.state;
    const documents = await Dealerships.find({ state: new RegExp(`^${state}$`, 'i') });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Dealer por id
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const document = await Dealerships.findOne({ id });
    if (!document) return res.status(404).json({ error: 'Not found' });
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching document' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
