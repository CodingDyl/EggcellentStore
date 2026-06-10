const { getStockForecast, getEggsInStock, resetChickens, removeStock, getProducers } = require('./chicken_store');

const express = require('express');
const cors = require('cors');

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

app.post('/reset', (req, res) => {
    var resetState = resetChickens();
    res.status(205).json(resetState);
});

app.get('/stock', (req, res) => {
    res.json({ eggs: Math.round(getEggsInStock()) });
});

app.get('/stock/:days', (req, res) => {
    var days = Number(req.params.days);

    if (!Number.isFinite(days) || days < 0) {
        return res.status(400).json({ error: 'Invalid day count' });
    }

    try {
        var forecast = getStockForecast(days);
        res.json({
            predictedYield: Math.round(forecast.predictedYield),
            projectedForecast: Math.round(forecast.projectedForecast)
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/order/:orderId', (req, res) => {
    var eggs = Number(req.body && req.body.order && req.body.order.eggs);
    var orderResponse = { order: { eggs: eggs } };

    if (!Number.isFinite(eggs) || eggs <= 0) {
        return res.status(400).json({ error: 'Invalid order body. Expected { "order": { "eggs": N } }' });
    }

    if (getEggsInStock() < eggs) {
        return res.status(404).json(orderResponse);
    }

    removeStock(eggs);
    res.status(201).json(orderResponse);
});

app.get('/producers', (req, res) => {
    res.json(getProducers());
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
