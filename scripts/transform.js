#!/usr/bin/env node


import products from "../src/data/products.json" with { type: "json" };
import fs from "node:fs";
import path from "node:path";
import { productCharacteristics } from "../src/data/characteristics.ts";

function transform(product) {
    // Shuffle array
    const shuffled = productCharacteristics.sort(() => 0.5 - Math.random());

    // Get 1 or 2
    const count = Math.floor(Math.random() * 2) + 1;
    
    // Get sub-array of characteristics
    const selectedCharacteristics = shuffled.slice(0, count);

    return {
        ...product,
        characteristics: selectedCharacteristics
    }
}

function main() {
    const file = path.join(process.cwd(), "src", "data", "products.json");
    
    // Transform function
    const updated = products.map(transform);
    
    
    fs.writeFileSync(file, JSON.stringify(updated, null, 2) + "\n");
}

// Run with node scripts/transform.js
main();