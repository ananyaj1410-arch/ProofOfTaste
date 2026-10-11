const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "ProofOfTaste API is running!"
    });
});

// Restaurant data
const restaurants = [
    {
        id: 1,
        name: "Spice Garden",
        cuisine: "Indian",
        rating: 4.5
    },
    {
        id: 2,
        name: "Pizza Corner",
        cuisine: "Italian",
        rating: 4.2
    },
    {
        id: 3,
        name: "Sushi House",
        cuisine: "Japanese",
        rating: 4.7
    }
];

// Get all restaurants
app.get("/api/restaurants", (req, res) => {
    res.json(restaurants);
});

app.listen(PORT, () => {
    console.log(`ProofOfTaste server running at http://localhost:${PORT}`);
});