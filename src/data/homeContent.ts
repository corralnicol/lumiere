import { categories } from "./categories";
import products from "./products.json";

export const homeBanners = [
  {
    id: "loreal",
    src: "/images/banner/loreal.png",
    alt: "L'Oreal Panorama Mascara",
    imageClassName: "hero-image-loreal",
  },
  {
    id: "san-valentin",
    src: "/images/banner/SanValentin.png",
    alt: "San Valentin beauty collection",
    imageClassName: "hero-image-sanvalentin",
  },
  {
    id: "clinique",
    src: "/images/banner/Clinique.avif",
    alt: "Clinique beauty campaign",
    imageClassName: "hero-image-clinique",
  },
];

export const brandLogos = [
  {
    id: "rare-beauty",
    name: "Rare Beauty",
    src: "/images/brands/rare-beauty.svg",
    href: "https://www.rarebeauty.com/",
    className: "logo-rarebeauty",
  },
  {
    id: "sheglam",
    name: "SHEGLAM",
    src: "/images/brands/sheglam.svg",
    href: "https://www.sheglam.com/",
    className: "logo-sheglam",
  },
  {
    id: "the-ordinary",
    name: "The Ordinary",
    src: "/images/brands/the-ordinary.svg",
    href: "https://theordinary.com/en-us",
    className: "logo-theordinary",
  },
  {
    id: "milk-makeup",
    name: "Milk Makeup",
    src: "/images/brands/milk-makeup.svg",
    href: "https://milkmakeup.com/",
    className: "logo-milkmakeup",
  },
];

export const homeCategories2 = categories.map((category) => ({
  ...category,
  searchTarget: `${category.label.toLowerCase()} ${category.id}`,
  imageClassName: `category-img-${category.id}`,
}));

export const homeCategories = [
  {
    id: "foundation",
    label: "Foundation",
    src: "/images/categories/foundation.png",
    alt: "Foundation",
    searchTarget: "base complexion products foundation",
    imageClassName: "category-img-foundation",
  },
  {
    id: "concealer",
    label: "Concealer",
    src: "/images/categories/concealer.png",
    alt: "Concealer",
    searchTarget: "concealer under eye skin tone",
    imageClassName: "category-img-concealer",
  },
  {
    id: "blush",
    label: "Blush",
    src: "/images/categories/blush.png",
    alt: "Blush",
    searchTarget: "blush cheeks color glow",
    imageClassName: "category-img-blush",
  },
  {
    id: "contour",
    label: "Contour",
    src: "/images/categories/contour.png",
    alt: "Contour",
    searchTarget: "contour sculpt face definition",
    imageClassName: "category-img-contour",
  },
  {
    id: "eyelash",
    label: "Eyelash",
    src: "/images/categories/eyelash.png",
    alt: "Eyelash",
    searchTarget: "eyelash lashes volume mascara",
    imageClassName: "category-img-eyelash",
  },
  {
    id: "eyeliner",
    label: "Eyeliner",
    src: "/images/categories/eyeliner.png",
    alt: "Eyeliner",
    searchTarget: "eyeliner eyes precision",
    imageClassName: "category-img-eyeliner",
  },
  {
    id: "eyeshadow",
    label: "Eyeshadow",
    src: "/images/categories/eyeshadow.png",
    alt: "Eyeshadow",
    searchTarget: "eyeshadow palette eye color",
    imageClassName: "category-img-eyeshadow",
  },
  {
    id: "lip",
    label: "Lip",
    src: "/images/categories/lip.png",
    alt: "Lip",
    searchTarget: "lip lipstick gloss tint",
    imageClassName: "category-img-lip",
  },
];

export const homeBestSellers = [
  { id: "2c284d14-ddd5-4da7-836a-195f2dc179c1", imageClassName: "best-card-image-eyeshadow" },
  { id: "923b5572-01f8-4589-8d45-0a110f294fe9", imageClassName: "best-card-image-serum" },
  { id: "075a7574-12cb-4ab7-9494-30f523852e37", imageClassName: "best-card-image-foundation" },
];

export const homeKits = products.filter((product) => product.category === null);

export const footerSocialLinks = [
  {
    id: "twitter",
    name: "Twitter",
    src: "/images/footer/twiter.png",
    href: "https://x.com/",
  },
  {
    id: "instagram",
    name: "Instagram",
    src: "/images/footer/insta.png",
    href: "https://www.instagram.com/",
  },
  {
    id: "facebook",
    name: "Facebook",
    src: "/images/footer/facebook.png",
    href: "https://www.facebook.com/",
  },
  {
    id: "github",
    name: "GitHub",
    src: "/images/footer/github.png",
    href: "https://github.com/corralnicol/lumiere",
  },
];

export const footerPayments = [
  {
    id: "visa",
    name: "Visa",
    src: "/images/footer/visa.png",
  },
  {
    id: "mastercard",
    name: "Mastercard",
    src: "/images/footer/mastercard.png",
  },
  {
    id: "paypal",
    name: "PayPal",
    src: "/images/footer/paypal.png",
  },
  {
    id: "apple",
    name: "Apple Pay",
    src: "/images/footer/apple.png",
  },
  {
    id: "google",
    name: "Google Pay",
    src: "/images/footer/google.png",
  },
];