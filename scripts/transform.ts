import products from "../src/data/products.json" with { type: "json" };
import path from "path";

// An item in the products.json file has the following structure:
type ProductEntry = typeof products[number];

function transform(p: ProductEntry) {
    p = {
        ...p,
    }
    
    // delete p.isVegan;

    return p;
}

// Transform function
const updated = products.map(transform);

Bun.write("products.json", JSON.stringify(updated, null, 2) + "\n");
