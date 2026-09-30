export type Faq = {
  question: string;
  answer: string;
};

/**
 * Shared by the homepage FAQ section and the product detail accordion.
 *
 * The product is an EDITABLE CANVA website template plus a setup guide PDF —
 * we are the storefront, Canva is the editor and publishing platform.
 */
export const faqs: Faq[] = [
  {
    question: "What exactly do I buy?",
    answer:
      "An editable Canva wedding website template and a step-by-step setup guide PDF. You open the template in Canva, replace the sample content with your own, and publish it as a real website from Canva. You are buying a design, not a website builder account.",
  },
  {
    question: "Do I need a Canva account?",
    answer:
      "Yes — a free Canva account is enough, and no paid Canva plan is required. Canva is where you edit the template and publish your website; we handle the storefront, the checkout and the delivery.",
  },
  {
    question: "Do you host my wedding website?",
    answer:
      "No. Your website is published by Canva, on your own Canva domain or a domain you connect. We are not a hosting provider and we do not keep your site running — it lives in your own Canva account.",
  },
  {
    question: "What does the sample content in the previews show?",
    answer:
      "The previews use fictional names, dates and photographs so you can see how the design looks filled in. That content is demo content only. Everything you see is replaced with your own when you open the template in Canva.",
  },
  {
    question: "How does delivery work?",
    answer:
      "Instantly. As soon as payment is confirmed you receive a secure purchase access page by email and on WhatsApp. From there you can open your Canva template and download the setup guide. Nothing is posted to you.",
  },
  {
    question: "What can I change in Canva?",
    answer:
      "Names, dates, wording, photographs, section order, colours and type styles are all editable in Canva. Sections you do not need can be hidden or deleted.",
  },
  {
    question: "Is the template mobile friendly?",
    answer:
      "Yes. Every design is built mobile-first and checked at phone, tablet and desktop widths, so guests see a considered page whatever they open your link on.",
  },
  {
    question: "Does the template collect RSVPs?",
    answer:
      "The template includes an RSVP section you can use or hide. Any replies are handled by the tools you connect in Canva — BLANC WEDDINGS does not run an RSVP database or guest list for you.",
  },
  {
    question: "Can I use my own photos?",
    answer:
      "Absolutely. Replace the sample imagery with your own photographs — the layouts hold portrait, landscape and square images gracefully.",
  },
  {
    question: "Can I use a template for paying clients?",
    answer:
      "Not without a separate licence. Each purchase covers one wedding for personal use. If you want to use a template for a client or resell it, contact the studio for a commercial licence.",
  },
];

/** Homepage "how it works" — mirrors the real post-purchase journey. */
export const howItWorksHome = [
  {
    number: "01",
    title: "Choose your design",
    text: "Browse the collections, open the public demo, and pick the palette and typography that feel like your celebration.",
  },
  {
    number: "02",
    title: "Purchase",
    text: "One payment. Your secure access page is generated and delivered the moment payment is confirmed.",
  },
  {
    number: "03",
    title: "Open in Canva",
    text: "Open your access page, launch the template, and Canva gives you your own editable copy. The original stays private.",
  },
  {
    number: "04",
    title: "Personalise and publish",
    text: "Replace the sample names, dates, words and photographs, then publish your website from Canva.",
  },
  {
    number: "05",
    title: "Share with guests",
    text: "Send one link to your guests. They view the published Canva website — we are not involved in hosting it.",
  },
];


/** Custom design page content. */
export const customDeliverables = [
  {
    title: "Bespoke art direction",
    text: "A palette, typographic voice and layout designed around your celebration — not adapted from a template.",
  },
  {
    title: "Every section you need",
    text: "Story, details, countdown, gallery, travel, dress code, registry, FAQ and RSVP — arranged and worded with you.",
  },
  {
    title: "Your domain, ready to publish",
    text: "Set up on your own domain and tested on phone, tablet and desktop before it goes live.",
  },
  {
    title: "Two rounds of refinement",
    text: "We revise together until it feels right, then hand over with a short walkthrough.",
  },
];

export const customProcess = [
  {
    number: "01",
    title: "Conversation",
    text: "A short call or email exchange about your day, your palette and what you want guests to feel.",
  },
  {
    number: "02",
    title: "Design direction",
    text: "You receive one clear direction — type, colour, layout and structure — agreed before anything is built.",
  },
  {
    number: "03",
    title: "Build",
    text: "Your website is designed and populated with your story, photographs and event details.",
  },
  {
    number: "04",
    title: "Refine and publish",
    text: "Two rounds of refinement, then it goes live on your domain with a walkthrough of how to edit it.",
  },
];

export const customTiers = [
  {
    name: "Single page",
    price: "$250",
    note: "One elegant page announcing your celebration, with details and RSVP.",
  },
  {
    name: "Full website",
    price: "$450",
    note: "The complete multi-section wedding website, designed for your day.",
  },
  {
    name: "Website + Save the Date",
    price: "$650",
    note: "Both websites in one continuous design — from announcement to final reply.",
  },
];

export const customTimeline =
  "Most projects are delivered within two to three weeks of the first conversation.";

/** Product detail "how it works" — the six steps the customer actually takes. */
export const howItWorksProduct = [
  {
    number: "01",
    title: "Purchase the template",
    text: "One payment. Your secure access page is generated as soon as payment is confirmed.",
  },
  {
    number: "02",
    title: "Receive your access",
    text: "We send your private access page by email and on WhatsApp. It links to your Canva template and your setup guide PDF.",
  },
  {
    number: "03",
    title: "Open the template in Canva",
    text: "Choose “Open Template”. Canva creates your own editable copy — the original template stays private to the studio.",
  },
  {
    number: "04",
    title: "Personalise your details",
    text: "Replace the sample names, dates, locations, wording and photographs with your own.",
  },
  {
    number: "05",
    title: "Publish your website",
    text: "Publish from Canva to your Canva domain, or connect a domain you already own.",
  },
  {
    number: "06",
    title: "Share the link with guests",
    text: "Send your published link. Canva serves the site — BLANC WEDDINGS is not involved in hosting it.",
  },
];

/** Custom design enquiry options — a service enquiry, never instant checkout. */
export const inquiryBudgets = [
  "Under $250",
  "$250 – $450",
  "$450 – $650",
  "$650+",
  "Not sure yet",
];

export const inquiryTimelines = [
  "Within 2 weeks",
  "1 – 2 months",
  "3 – 6 months",
  "Just exploring",
];
