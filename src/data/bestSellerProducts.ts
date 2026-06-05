import { type Product } from "@/types/products";

export const bestSellerProducts: Product[] = [
  {
    id: "patrick-ta",
    brand: "Patrick Ta",
    name: "Major Dimension Essential Artistry Edit Eyeshadow Palette",
    category: "eyeshadow",
    description: "A talc-free matte eyeshadow palette with six essential neutrals that blend warm and cool tones, curated by Patrick for your everyday looks.",
    imageUrl: "/images/best-sellers/eye-shadows.webp",
    price: 96,
    rating: 4.6,
    size: "30ml",
    stock: 5,
    characteristics: ["gluten-free", "cruelty-free", "vegan"],
    howToUse: "Apply lighter shades as a base, medium shades to define the crease, and deeper shades along the lash line for intensity.",
    ingredients: "Key ingredients: Hyaluronic Acid and Squalane give the powder a soft texture and smooth glide. Treated pigments provide true color payoff, superior blendability, and color that lasts.",
    reviews: [
      {
        user: "Sofia M.",
        rating: 5,
        comment: "The shades are wearable, soft and easy to blend.",
      },
      {
        user: "Camila R.",
        rating: 5,
        comment: "Beautiful neutral palette with a very polished finish.",
      },
      {
        user: "Nicole A.",
        rating: 4,
        comment: "The packaging feels premium and the colors are useful.",
      },
    ],
  },
  {
    id: "the-ordinary-sunscreen",
    brand: "The Ordinary",
    name: "Sunscreen SPF 45",
    category: "foundation",
    description:
      "A daily sunscreen designed to protect the skin while keeping a lightweight, comfortable finish.",
    imageUrl: "/images/best-sellers/sunscreen.webp",
    price: 70,
    rating: 5,
    size: "50ml",
    stock: 8,
    characteristics: ["cruelty-free", "vegan"],
    howToUse:
      "Apply generously as the last step of your morning skincare routine. Reapply throughout the day when needed.",
    ingredients:
      "Key ingredients: UV filters and skin-supporting ingredients designed for daily protection and a comfortable finish.",
    reviews: [
      {
        user: "Isabella C.",
        rating: 5,
        comment: "It feels light on the skin and does not leave my face greasy.",
      },
      {
        user: "Valeria P.",
        rating: 5,
        comment: "Very comfortable for daily use before makeup.",
      },
    ],
  },
  {
    id: "clinique-foundation",
    brand: "Clinique",
    name: "Clinique Even Better Liquid Foundation with Vitamins SPF50 30ml",
    category: "foundation",
    description: "A liquid foundation with vitamins and SPF50 protection.",
    imageUrl: "/images/best-sellers/clinique.webp",
    price: 80,
    rating: 5,
    size: "30ml",
    stock: 6,
    characteristics: ["gluten-free", "cruelty-free"],
    howToUse:
      "Apply with fingers, brush, or sponge. Blend from the center of the face outward.",
    ingredients:
      "Key ingredients: Vitamins and complexion-supporting ingredients for a smooth finish and SPF protection.",
    reviews: [
      {
        user: "Mariana G.",
        rating: 5,
        comment: "The finish looks natural and it has good coverage.",
      },
      {
        user: "Laura T.",
        rating: 5,
        comment: "I liked the texture and the SPF protection.",
      },
    ],
  },
];