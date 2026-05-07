export type BestSellerProduct = {
  id: string;
  brand: string;
  name: string;
  description: string;
  longDescription: string;
  image: string;
  price: number;
  rating: number;
  reviewCount: number;
  size: string;
  stock: number;
  badges: string[];
  details: {
    whatItIs: string;
    howToUse: string;
    ingredients: string;
  };
};

export const bestSellerProducts: BestSellerProduct[] = [
  {
    id: "patrick-ta",
    brand: "Patrick Ta",
    name: "Major Dimension Essential Artistry Edit Eyeshadow Palette",
    description: "A soft matte eyeshadow palette with warm and cool neutral tones.",
    longDescription:
      "A talc-free matte eyeshadow palette with six essential neutrals that blend warm and cool tones, curated by Patrick Ta for everyday looks.",
    image: "/images/best-sellers/eye-shadows.webp",
    price: 96,
    rating: 4.3,
    reviewCount: 200,
    size: "30ml",
    stock: 5,
    badges: ["Gluten Free", "Cruelty Free", "Vegan"],
    details: {
      whatItIs:
        "A matte eyeshadow palette designed for soft definition, everyday glam, and buildable eye looks.",
      howToUse:
        "Apply lighter shades as a base, medium shades to define the crease, and deeper shades along the lash line for intensity.",
      ingredients:
        "Key ingredients include hyaluronic acid and squalane for a smooth, comfortable texture.",
    },
  },
  {
    id: "the-ordinary-sunscreen",
    brand: "The Ordinary",
    name: "Sunscreen SPF 45",
    description: "A lightweight sunscreen for daily skincare protection.",
    longDescription:
      "A daily sunscreen designed to protect the skin while keeping a lightweight, comfortable finish.",
    image: "/images/best-sellers/sunscreen.webp",
    price: 70,
    rating: 5,
    reviewCount: 160,
    size: "50ml",
    stock: 8,
    badges: ["SPF 45", "Daily Use", "Skincare"],
    details: {
      whatItIs:
        "A lightweight facial sunscreen made for everyday protection and skincare layering.",
      howToUse:
        "Apply generously as the last step of your morning skincare routine. Reapply throughout the day.",
      ingredients:
        "Includes UV filters and skin-supporting ingredients for daily protection.",
    },
  },
  {
    id: "clinique-foundation",
    brand: "Clinique",
    name: "Clinique Even Better Liquid Foundation with Vitamins SPF50 30ml",
    description: "A liquid foundation with vitamins and SPF50 protection.",
    longDescription:
      "A liquid foundation that evens the complexion while providing skincare benefits and SPF protection.",
    image: "/images/best-sellers/clinique.webp",
    price: 80,
    rating: 5,
    reviewCount: 130,
    size: "30ml",
    stock: 6,
    badges: ["SPF 50", "Vitamins", "Foundation"],
    details: {
      whatItIs:
        "A foundation designed to even skin tone while adding a natural, polished finish.",
      howToUse:
        "Apply with fingers, brush, or sponge. Blend from the center of the face outward.",
      ingredients:
        "Formulated with vitamins and complexion-supporting ingredients.",
    },
  },
];