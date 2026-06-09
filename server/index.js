const { chickens, getExpectedEggs, getEggsInStock, resetChickens, removeStock, getProducers } = require('./chicken_store');

const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/reset', (req, res) => {
    var resetState = resetChickens(req.body);
    res.status(205).json(resetState);
});

//stock endpoints

app.get('/stock', (req, res) => {
    var eggsInStock = getEggsInStock();
    res.send('eggs: ' + Math.round(eggsInStock));
});

app.get('/stock/:days', (req, res) => {
    var days = Number(req.params.days);
    var eggsInStock = getExpectedEggs(days);
    res.json({ eggs: Math.round(eggsInStock) });
});

//order endpoints

app.post('/order/:eggs', (req, res) => {
    var eggs = req.params.eggs;
    var eggsInStock = getEggsInStock();
    if (eggsInStock >= eggs) {
        removeStock(eggs);
        res.send('Order successful');
    } else {
        res.send('Order failed');
    }
});

// fetch chickens endpoints

app.get('/producers', (req, res) => {
    res.json(getProducers());
});