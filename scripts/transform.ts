import products from "../src/data/products.json" with { type: "json" };

// Transform function
const updated = products.map((p) => {
    // p = {
    //     ...p,
    // }

    delete p.info;

    return p;
});

Bun.write("../src/data/products.json", JSON.stringify(updated, null, 2) + "\n");