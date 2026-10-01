/**
 * JULIA & ALEX — single source of truth for the wedding microsite.
 *
 * A fictional couple used only to demonstrate the Modern Ivory editorial
 * direction. Replace these values with real wedding details in production.
 */
export const wedding = {
  partnerA: "Julia",
  partnerB: "Alex",
  couple: "Julia & Alex",
  monogram: "J & A",
  /** Display form used in the hero. */
  dateDisplay: "24.08.2027",
  /** Machine-readable moment everything counts down to (Jakarta time). */
  dateISO: "2027-08-24T10:00:00+07:00",
  city: "Jakarta, Indonesia",
} as const;

export const weddingNav = [
  { label: "Home", href: "#home" },
  { label: "Our Story", href: "#story" },
  { label: "Event", href: "#event" },
  { label: "Gallery", href: "#gallery" },
  { label: "RSVP", href: "#rsvp" },
] as const;

export const ceremony = {
  title: "Wedding Ceremony",
  date: "24 August 2027",
  time: "10:00 AM",
  venue: "The Glass Pavilion",
  place: "Jakarta, Indonesia",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Jakarta+Indonesia",
} as const;

export const reception = {
  title: "Reception",
  date: "24 August 2027",
  time: "18:00 PM",
  venue: "The Palm Courtyard",
  place: "Jakarta, Indonesia",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Jakarta+Indonesia",
} as const;

export type GalleryImage = {
  src: string;
  alt: string;
  /** Optional object-position, for crops that would otherwise cut a subject. */
  position?: string;
};

/**
 * The photo essay is read in three moves by <WeddingGallery />: a staggered
 * trio, one full-width plate, then a closing pair beside a line from the
 * invitation. Keep six images and keep the order.
 */
export const galleryImages: GalleryImage[] = [
  {
    src: "/images/wedding/g3.jpg",
    alt: "Julia and Alex holding hands, her ring catching the evening light",
  },
  {
    src: "/images/wedding/g6.jpg",
    alt: "The wedding bands resting on handmade paper and dried grasses",
  },
  {
    src: "/images/wedding/g2.jpg",
    alt: "Two chairs marked “I can’t” and “I always” waiting by the water",
  },
  {
    src: "/images/wedding/g5.jpg",
    alt: "The ceremony aisle leading to the arch, lined with garden roses",
  },
  {
    src: "/images/wedding/g4.jpg",
    alt: "Hands resting on the bridal bouquet just after the vows",
  },
  {
    src: "/images/wedding/rings.jpg",
    alt: "Julia and Alex beside the lake in autumn light",
    position: "38% 42%",
  },
];

export const dressCodeSwatches = [
  { name: "Ivory", hex: "#f1eadd" },
  { name: "Stone", hex: "#8b8177" },
  { name: "Olive", hex: "#5d6146" },
  { name: "Espresso", hex: "#3a2c22" },
] as const;

export const weddingDetails = [
  {
    title: "Dress Code",
    content:
      "Formal / garden elegant. Think flowing fabrics, soft neutrals and comfortable shoes for an evening that moves between the pavilion and the courtyard.",
  },
  {
    title: "Transportation",
    content:
      "Shuttle buses leave the city centre at 8:30 AM and return after the reception. Valet parking is available at both venues for guests who prefer to drive.",
  },
  {
    title: "Accommodation",
    content:
      "A small block of rooms is reserved near the venue under “Julia & Alex”. Please mention the wedding when booking before 24 July 2027.",
  },
  {
    title: "Gift Information",
    content:
      "Your presence is the greatest gift. Should you wish to give more, a small wishing box will be placed at the reception entrance.",
  },
  {
    title: "Contact",
    content:
      "For questions on the day, please reach Maya on WhatsApp — she will be coordinating arrivals, seating and transport for us.",
  },
] as const;
