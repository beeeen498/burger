export interface Ingredient {
  id: string;
  label: string;
  description: string;
  color: string;
  meshName: string;
  explodedOffset: [number, number, number];
  explodedRotation: [number, number, number];
  explodedScale: number;
  // Manual Y nudge for the label — positive = up, negative = down
  labelOffsetY: number;
  // Length of the connecting line in px
  lineLength: number;
}

const INGREDIENTS: Ingredient[] = [
  {
    id: "top-bun",
    label: "Brioche Bun",
    description: "Toasted. Buttered. Non-negotiable.",
    color: "#E8A020",
    meshName: "top_bun",
    explodedOffset: [0, 145, 0],
    explodedRotation: [-0.3, 0, 0.3],
    explodedScale: 0.60,
    labelOffsetY: 60,
    lineLength: 480,
  },
  {
    id: "lettuce",
    label: "Iceberg Lettuce",
    description: "Crisp. Cold. Crunchy.",
    color: "#4A7C3F",
    meshName: "lettuce",
    explodedOffset: [0, 100, 0],
    explodedRotation: [-0.30, 0, 0.3],
    explodedScale: 0.60,
    labelOffsetY: 40,
    lineLength: 300,
  },
  {
    id: "tomato",
    label: "Heirloom Tomato",
    description: "Thick-cut. Vine-ripened. Juicy.",
    color: "#C0392B",
    meshName: "tomato",
    explodedOffset: [0, 65, 0],
    explodedRotation: [0.2, 0, 0.04],
    explodedScale: 0.60,
    labelOffsetY: 30,
    lineLength: 480,
  },
  {
    id: "onions",
    label: "Onions",
    description: "Raw. Sharp. Cuts through the richness.",
    color: "#C8A870",
    meshName: "onions",
    explodedOffset: [0, 30, 0],
    explodedRotation: [0.2, 0, -0.05],
    explodedScale: 0.60,
    labelOffsetY: 25,
    lineLength: 700,
  },
  {
    id: "cheese",
    label: "American Cheese",
    description: "Double-stacked. Melted to the edge.",
    color: "#F5C518",
    meshName: "cheese",
    explodedOffset: [0, 0.5, 0],
    explodedRotation: [-0.1, 0, -0.05],
    explodedScale: 0.60,
    labelOffsetY: 20,
    lineLength: 400,
  },
  {
    id: "patty",
    label: "Smash Patty",
    description: "80/20 chuck. Pressed hard. Twice.",
    color: "#4A2810",
    meshName: "patty",
    explodedOffset: [0, -40, 0],
    explodedRotation: [-0.1, 0, 0.1],
    explodedScale: 0.60,
    labelOffsetY: 0,
    lineLength: 600,
  },
  {
    id: "pickles",
    label: "Dill Pickles",
    description: "Brined. Crunchy. Non-negotiable.",
    color: "#6B8F3E",
    meshName: "pickles",
    explodedOffset: [0, -75, 0],
    explodedRotation: [-0.1, 0, -0.15],
    explodedScale: 0.60,
    labelOffsetY: 0,
    lineLength: 280,
  },
  {
    id: "sauce",
    label: "House Sauce",
    description: "Secret recipe. We'll never tell.",
    color: "#E8C87A",
    meshName: "sauce",
    explodedOffset: [0, -120, 0],
    explodedRotation: [-0.2, 0, 0.07],
    explodedScale: 0.60,
    labelOffsetY: 0,
    lineLength: 580,
  },
  {
    id: "bottom-bun",
    label: "The Base",
    description: "The foundation. Slightly toasted.",
    color: "#E8A020",
    meshName: "bottom_bun",
    explodedOffset: [0, -165, 0],
    explodedRotation: [-0.3, 0, 0.05],
    explodedScale: 0.60,
    labelOffsetY: -20,
    lineLength: 480,
  },
];

export default INGREDIENTS;