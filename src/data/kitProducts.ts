import type { KitProduct } from "@/types/products";

export const kitProducts: KitProduct[] = [
  {
    id: "glow-essentials-kit",
    brand: "Lumière",
    name: "Glow Essentials Kit",
    description: "A complete set designed to create a soft glowing makeup look with essential products for face, cheeks and lips.",
    imageUrl: "/images/kits/kit1.svg",
    price: 120,
    rating: 5,
    size: "5 products",
    stock: 7,
    characteristics: ["soothing", "cruelty-free"],
    howToUse: "Start with complexion products, add color to the cheeks, define the eyes softly, and finish with the lip product.",
    ingredients: "Includes curated formulas with skin-friendly textures, soft pigments, and comfortable everyday finishes.",
    reviews: [
      {
        user: "Sofia M.",
        rating: 5,
        comment: "The kit feels complete and works really well for daily makeup.",
      },
      {
        user: "Camila R.",
        rating: 4,
        comment: "I liked the combination of products and the packaging.",
      },
      {
        user: "Nicole A.",
        rating: 5,
        comment: "It is very useful because it already has everything together.",
      },
    ],
  },
  {
    id: "soft-glam-set",
    brand: "Lumière",
    name: "Soft Glam Set",
    description: "A makeup set created for soft glam looks and polished finishes.",
    imageUrl: "/images/kits/kit2.svg",
    price: 98,
    rating: 4.5,
    size: "4 products",
    stock: 9,
    characteristics: ["cruelty-free", "vegan"],
    howToUse:
      "Apply the complexion product first, blend the blush or contour, define the eyes, and complete the look with lips.",
    ingredients:
      "Formulated with blendable pigments, lightweight textures, and comfortable finishes.",
    reviews: [
      {
        user: "Valeria P.",
        rating: 5,
        comment: "Perfect for a soft glam routine. The shades are very pretty.",
      },
      {
        user: "Mariana G.",
        rating: 4,
        comment: "It feels like a nice gift set and the products match well.",
      },
    ],
  },
  {
    id: "skin-prep-kit",
    brand: "The Ordinary",
    name: "Skin Prep Kit",
    description: "A skincare-focused kit to prepare the skin before makeup.",
    imageUrl: "/images/kits/kit3.svg",
    price: 86,
    rating: 4.7,
    size: "3 products",
    stock: 10,
    characteristics: ["moisturizer", "hypoallergenic"],
    howToUse:
      "Apply the products in order from lightest to richest texture. Let each layer absorb before makeup.",
    ingredients:
      "Includes hydrating and skin-supporting ingredients for a smoother makeup base.",
    reviews: [
      {
        user: "Laura T.",
        rating: 5,
        comment: "My makeup looks better when I prep my skin with this.",
      },
      {
        user: "Isabella C.",
        rating: 4,
        comment: "The products feel lightweight and comfortable.",
      },
    ],
  },
  {
    id: "lip-care-set",
    brand: "Lumière",
    name: "Lip Care Set",
    description: "A lip care set for soft, hydrated, glossy-looking lips.",
    imageUrl: "/images/kits/kit4.svg",
    price: 58,
    rating: 4.8,
    size: "3 products",
    stock: 12,
    characteristics: ["moisturizer", "soothing"],
    howToUse:
      "Apply the lip prep product first, then use the balm or gloss depending on the desired finish.",
    ingredients:
      "Includes nourishing textures and comfortable lip care formulas.",
    reviews: [
      {
        user: "Daniela R.",
        rating: 5,
        comment: "The set is cute and leaves the lips looking healthy.",
      },
      {
        user: "Paula M.",
        rating: 5,
        comment: "I loved the glossy finish and the soft texture.",
      },
    ],
  },
  {
    id: "full-routine-kit",
    brand: "Milk Makeup",
    name: "Full Routine Kit",
    description: "A full beauty routine kit with essentials for face, eyes, and lips.",
    imageUrl: "/images/kits/kit5.svg",
    price: 145,
    rating: 5,
    size: "6 products",
    stock: 5,
    characteristics: ["cruelty-free", "vegan"],
    howToUse:
      "Use the products step by step: prep, complexion, cheeks, eyes, and lips.",
    ingredients:
      "Includes a mix of skincare-inspired and makeup formulas selected for an easy complete routine.",
    reviews: [
      {
        user: "Antonia S.",
        rating: 5,
        comment: "This kit has everything I need. It feels very complete.",
      },
      {
        user: "Manuela C.",
        rating: 4,
        comment: "Great value and beautiful product selection.",
      },
    ],
  },
];