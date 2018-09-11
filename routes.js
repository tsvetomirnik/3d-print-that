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
        const calculatePrice = (weight) => {
            return (0.4 + (weight * 0.2)).toFixed(2);
        };

        const NodeStl = require("node-stl");
        var filePath = __dirname + `/uploads/${req.params.name}`;
        var stl = NodeStl(filePath);
        const PLAdensity = 1.25;
        const weight = stl.volume * PLAdensity;
        const price = calculatePrice(stl.volume * PLAdensity);

        res.json({
            volume: stl.volume, // cm^3
            weight: weight, // gm
            boundingBox: stl.boundingBox, // mm,
            area: stl.area, // m
            price: {
                value: price,
                currency: 'BGN'
            }
        });

        // Weight is volume * density of material.
        // It looks like the calculation is using a density of 1.04.
        // PLA has a density of 1.25 g/cm^3.
        // ABS has a density of 1.06 g/cm^3.
    });
}