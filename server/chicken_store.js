const { initialChickens, initialEggs } = require('./constants');

var chickens = JSON.parse(JSON.stringify(initialChickens));
var stock = initialEggs.count;

var chicken_year = 100;
var chicken_death_age = 10;

function formatDisplayName(slug) {
    return slug
        .split('-')
        .map(function (part) {
            return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join(' ');
}

// Days until this hen reaches chicken_death_age
function getMaxLayingDays(chicken) {
    return Math.max(0, (chicken_death_age - chicken.age) * chicken_year);
}

// Formula: a hen lays one egg every (1 + D × 0.01) days, where D = age in days
function getLayingInterval(chicken) {
    return 1 + chicken.age * chicken_year * 0.01;
}

// Eggs a single hen produces over 'days' days (capped by her remaining lifespan)
function getHenEggs(chicken, days) {
    if (chicken.sex !== 'f') return 0;
    var activeDays = Math.min(days, getMaxLayingDays(chicken));
    if (activeDays <= 0) return 0;
    return Math.floor(activeDays / getLayingInterval(chicken));
}

// Total new eggs from all hens across 'days' days
function getPredictedYield(days) {
    var daysAhead = Number(days);
    if (!Number.isFinite(daysAhead) || daysAhead < 0) {
        throw new Error('Invalid day count');
    }
    return chickens.reduce(function (total, chicken) {
        return total + getHenEggs(chicken, daysAhead);
    }, 0);
}

function getStockForecast(days) {
    var predictedYield = getPredictedYield(days);
    return {
        predictedYield: predictedYield,
        projectedForecast: getEggsInStock() + predictedYield
    };
}

function getEggsInStock() {
    return stock;
}

function removeStock(eggsToRemove) {
    var amount = Number(eggsToRemove);
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Invalid egg quantity');
    }
    if (stock < amount) {
        throw new Error('Not enough eggs in stock');
    }
    stock -= amount;
    return stock;
}

function getProducers() {
    return chickens
        .filter(function (chicken) {
            return chicken.sex === 'f';
        })
        .map(function (chicken) {
            return {
                id: chicken.id,
                name: formatDisplayName(chicken.name),
                age: chicken.age,
                story: chicken.story,
                imageUrl: chicken.imageUrl
            };
        });
}

function resetChickens() {
    chickens.length = 0;
    initialChickens.forEach(function (chicken) {
        chickens.push(Object.assign({}, chicken));
    });
    stock = initialEggs.count;
    return chickens.map(function (chicken) {
        return { name: chicken.name, age: chicken.age, sex: chicken.sex };
    });
}

module.exports = {
    getStockForecast,
    getEggsInStock,
    resetChickens,
    removeStock,
    getProducers
};
