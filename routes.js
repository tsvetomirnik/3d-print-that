const express = require('express');
const router = express.Router();
const randomString = require('random-string');

module.exports = (app) => {

    // Set API prefix 
    app.use("/api", router);

    /**
     * GET file by name
     */
    router.get("/file/:name", function (req, res) {
        var path = __dirname + `/uploads/${req.params.name}`;
        res.sendFile(path);
    });

    /**
     * POST file
     */
    router.post("/file", function (req, res) {
        if (!req.files) {
            return res.status(400).send("No files were uploaded.");
        }

        let model = req.files.model;
        let name = randomString({ length: 20 }) + '.stl';
        var path = __dirname + `/uploads/${name}`;

        model.mv(path, function (err) {
            if (err) {
                return res.status(500).send(err);
            }

            res.json({
                name
            });
        });
    });

    /**
     * GET STL file details
     */
    router.get("/file/:name/details", function (req, res) {
        const calculateWeight = (volume, area) => {
            // Weight is volume * density of material.
            // It looks like the calculation is using a density of 1.04.
            // PLA has a density of 1.25 g/cm^3.
            // ABS has a density of 1.06 g/cm^3.

            const PLA_DENSITY = 1.25; // g/cm3
            const LAYER_SIZE = 0.1; // cm
            const FILL_DENSITY = 0.2;

            let highDenceVolume = area * LAYER_SIZE; // cm3
            let lowDenceVolume = volume - highDenceVolume; // cm3

            // HighDenceVolume is not correct because the layer in the botder is calculated in the twice (in the horizontal and vertical surfaceс)
            // For higher LAYER_SIZE will increase the error rate
            // Also the of high dencity layer is too thick
            // Sooo... it will charge more for complex models 👿
            if (lowDenceVolume < 0) {
                lowDenceVolume = 0;
            }

            console.log('area', area, 'g/cm3');
            console.log('totalVolume', volume);
            console.log('highDenceVolume', highDenceVolume);
            console.log('lowDenceVolume', lowDenceVolume);

            const weight = (lowDenceVolume * PLA_DENSITY * FILL_DENSITY) + (highDenceVolume * PLA_DENSITY);
            return weight;
        }

        const calculatePricePerWeight = (weight) => {
            const FIXED_PRICE = 0.4;
            const PRICE_PER_GRAM = 0.2;
            return (FIXED_PRICE + (weight * PRICE_PER_GRAM)).toFixed(2);
        };

        const NodeStl = require("node-stl");
        var filePath = __dirname + `/uploads/${req.params.name}`;
        var stl = NodeStl(filePath);
        const weight = calculateWeight(stl.volume, stl.area / 100);
        const price = calculatePricePerWeight(weight);

        res.json({
            volume: {
                value: stl.volume,
                unit: 'cm³'
            },
            area: {
                value: stl.area / 100,
                unit: 'cm²'
            },
            weight: {
                value: weight,
                unit: 'g'
            },
            price: {
                value: price,
                unit: { symbol: "лв.", format: "%v %s" }
            }
        });
    });
}