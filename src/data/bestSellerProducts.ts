export type ProductReview = {
  user: string;
  rating: number;
  comment: string;
};

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
  characteristics: string[];
  details: {
    description: string;
    howToUse: string;
    ingredients: string;
  };
  reviews: ProductReview[];
};

export const bestSellerProducts: BestSellerProduct[] = [
  {
    id: "patrick-ta",
    brand: "Patrick Ta",
    name: "Major Dimension Essential Artistry Edit Eyeshadow Palette",
    description: "A soft matte eyeshadow palette with warm and cool neutral tones.",
    longDescription:
      "A talc-free matte eyeshadow palette with six essential neutrals that blend warm and cool tones, curated by Patrick Ta for your everyday looks.",
    image: "/images/best-sellers/eye-shadows.webp",
    price: 96,
    rating: 4.3,
    reviewCount: 200,
    size: "30ml",
    stock: 5,
    characteristics: ["gluten-free", "cruelty-free", "vegan"],
    details: {
      description:
        "A talc-free matte eyeshadow palette with six essential neutrals that blend warm and cool tones, curated by Patrick for your everyday looks.",
      howToUse:
        "Apply lighter shades as a base, medium shades to define the crease, and deeper shades along the lash line for intensity.",
      ingredients:
        "Key ingredients: Hyaluronic Acid and Squalane give the powder a soft texture and smooth glide. Treated pigments provide true color payoff, superior blendability, and color that lasts.",
    },
    reviews: [
      {
        user: "Sofia M.",
        rating: 5,
        comment: "The shades are wearable, soft and easy to blend.",
      },
      {
        user: "Camila R.",
        rating: 4,
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
    description: "A lightweight sunscreen for daily skincare protection.",
    longDescription:
      "A daily sunscreen designed to protect the skin while keeping a lightweight, comfortable finish.",
    image: "/images/best-sellers/sunscreen.webp",
    price: 70,
    rating: 5,
    reviewCount: 160,
    size: "50ml",
    stock: 8,
    characteristics: ["cruelty-free", "vegan"],
    details: {
      description:
        "A lightweight facial sunscreen made for everyday protection and skincare layering.",
      howToUse:
        "Apply generously as the last step of your morning skincare routine. Reapply throughout the day when needed.",
      ingredients:
        "Key ingredients: UV filters and skin-supporting ingredients designed for daily protection and a comfortable finish.",
    },
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
    description: "A liquid foundation with vitamins and SPF50 protection.",
    longDescription:
      "A liquid foundation that evens the complexion while providing skincare benefits and SPF protection.",
    image: "/images/best-sellers/clinique.webp",
    price: 80,
    rating: 5,
    reviewCount: 130,
    size: "30ml",
    stock: 6,
    characteristics: ["gluten-free", "cruelty-free"],
    details: {
      description:
        "A liquid foundation designed to even the complexion while adding a natural, polished finish.",
      howToUse:
        "Apply with fingers, brush, or sponge. Blend from the center of the face outward.",
      ingredients:
        "Key ingredients: Vitamins and complexion-supporting ingredients for a smooth finish and SPF protection.",
    },
    reviews: [
      {
        user: "Mariana G.",
        rating: 5,
        comment: "The finish looks natural and it has good coverage.",
      },
      {
        user: "Laura T.",
        rating: 4,
        comment: "I liked the texture and the SPF protection.",
      },
    ],
  },
];