const { initialChickens } = require('./constants');

var chickens = JSON.parse(JSON.stringify(initialChickens));

var chicken_year = 100;
var chicken_death_age = 10;

function buildMetadataLookup() {
    var lookup = {};
    initialChickens.forEach(function (chicken) {
        lookup[chicken.name] = chicken;
    });
    return lookup;
}

function mergeChickenWithMetadata(inputChicken, metadata) {
    return {
        id: metadata.id || inputChicken.name,
        name: inputChicken.name,
        age: inputChicken.age,
        sex: inputChicken.sex,
        eggs: metadata.eggs !== undefined ? metadata.eggs : 0,
        story: metadata.story || '',
        imageUrl: metadata.imageUrl || ''
    };
}

function formatDisplayName(slug) {
    return slug
        .split("-")
        .map(function (part) {
            return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join(" ");
}

function isChickenAlive(chicken, days) {
    return chicken.age + (days / chicken_year) < chicken_death_age;
}

function getExpectedEggs(days) {
    var daysAhead = Number(days);
    if (!Number.isFinite(daysAhead) || daysAhead < 0) {
        throw new Error('Invalid day count');
    }

    var projectedNewEggs = 1 + daysAhead * 0.01;
    var expected_stock = 0;

    chickens.forEach(function (chicken) {
        if (chicken.sex !== "f") {
            return;
        }

        if (isChickenAlive(chicken, daysAhead)) {
            expected_stock += chicken.eggs + projectedNewEggs;
            return;
        }

        // Dead by day T: keep eggs already in the nest, but no new laying
        expected_stock += chicken.eggs;
    });

    return expected_stock;
}

function getEggsInStock() {
    var eggs_in_stock = 0;
    chickens.forEach(chicken => {
        if (chicken.sex === "f") {
            eggs_in_stock += chicken.eggs;
        }
    });
    return eggs_in_stock;
}

function removeStock(eggsToRemove) {
    var amount = Number(eggsToRemove);
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Invalid egg quantity');
    }

    var stock = getEggsInStock();
    if (stock < amount) {
        throw new Error('Not enough eggs in stock');
    }

    var remaining = amount;
    chickens.forEach(function (chicken) {
        if (chicken.sex !== "f" || remaining <= 0) {
            return;
        }
        var take = Math.min(chicken.eggs, remaining);
        chicken.eggs -= take;
        remaining -= take;
    });

    return getEggsInStock();
}

function getProducers() {
    return chickens
        .filter(function (chicken) {
            return chicken.sex === "f";
        })
        .map(function (chicken) {
            return {
                id: chicken.id,
                name: formatDisplayName(chicken.name),
                age: chicken.age,
                story: chicken.story,
                imageUrl: chicken.imageUrl,
                eggsInNest: chicken.eggs
            };
        });
}

function toResetResponse(chickenList) {
    return chickenList.map(function (chicken) {
        return {
            name: chicken.name,
            age: chicken.age,
            sex: chicken.sex
        };
    });
}

function resetChickens(inputChickens) {
    var metadataByName = buildMetadataLookup();
    var source = Array.isArray(inputChickens) && inputChickens.length > 0
        ? inputChickens
        : initialChickens;

    var resetState = source.map(function (inputChicken) {
        var metadata = metadataByName[inputChicken.name] || {};
        return mergeChickenWithMetadata(inputChicken, metadata);
    });

    chickens.length = 0;
    resetState.forEach(function (chicken) {
        chickens.push(chicken);
    });

    return toResetResponse(resetState);
}

module.exports = {
    chickens,
    getExpectedEggs,
    getEggsInStock,
    resetChickens,
    removeStock,
    getProducers
};
