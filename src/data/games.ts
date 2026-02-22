import game1 from "@/assets/game1.jpg";
import game2 from "@/assets/game2.jpg";
import game3 from "@/assets/game3.jpg";
import game4 from "@/assets/game4.jpg";
import game5 from "@/assets/game5.jpg";
import game6 from "@/assets/game6.jpg";
import game7 from "@/assets/game7.jpg";
import game8 from "@/assets/game8.jpg";
import game9 from "@/assets/game9.jpg";
import game10 from "@/assets/game10.jpg";
import game11 from "@/assets/game11.jpg";
import game12 from "@/assets/game12.jpg";
import game1ss1 from "@/assets/game1-ss1.jpg";
import game2ss1 from "@/assets/game2-ss1.jpg";

export type Platform = "PC" | "Mobile" | "PlayStation";

export interface Game {
  id: string;
  title: string;
  image: string;
  screenshots: string[];
  price: string;
  originalPrice?: string;
  rating: number;
  genre: string;
  platforms: Platform[];
  description: string;
  releaseDate: string;
  developer: string;
  publisher: string;
  features: string[];
}

export const games: Game[] = [
  {
    id: "shadow-blade",
    title: "Shadow Blade: Reckoning",
    image: game1,
    screenshots: [game1, game1ss1],
    price: "$39.99",
    originalPrice: "$59.99",
    rating: 5,
    genre: "Action RPG",
    platforms: ["PC", "PlayStation"],
    description: "Embark on a dark journey through a world consumed by shadows. As the last wielder of the ancient Shadow Blade, you must fight through hordes of corrupted creatures, master devastating combat techniques, and unravel the mystery behind the shadow plague that threatens to engulf all of existence. Features a deep crafting system, branching storylines, and over 100 hours of gameplay.",
    releaseDate: "2025-11-15",
    developer: "DarkForge Studios",
    publisher: "HASHEEM Publishing",
    features: ["Open World", "Co-op Multiplayer", "4K Support", "Ray Tracing", "Controller Support"],
  },
  {
    id: "cyber-warfare",
    title: "Cyber Warfare 2087",
    image: game2,
    screenshots: [game2, game2ss1],
    price: "$49.99",
    rating: 4,
    genre: "FPS Shooter",
    platforms: ["PC", "PlayStation", "Mobile"],
    description: "In the neon-soaked streets of New Shanghai, corporate armies wage war for control. You are Agent Zero, an elite operative caught between megacorporations in a deadly game of espionage. Featuring hyper-realistic gunplay, cybernetic augmentations, and a gripping 20-hour campaign with branching endings.",
    releaseDate: "2026-01-20",
    developer: "NeonByte Interactive",
    publisher: "HASHEEM Publishing",
    features: ["Online Multiplayer", "4K Support", "Ray Tracing", "HDR", "Cross-Platform"],
  },
  {
    id: "neon-velocity",
    title: "Neon Velocity",
    image: game3,
    screenshots: [game3],
    price: "$29.99",
    originalPrice: "$44.99",
    rating: 4,
    genre: "Racing",
    platforms: ["PC", "PlayStation", "Mobile"],
    description: "Push the limits of speed in the most exhilarating racing experience ever created. Race through neon-lit cityscapes, treacherous mountain passes, and futuristic highways at breakneck speeds. Customize your vehicle with hundreds of parts and compete online against racers worldwide.",
    releaseDate: "2025-09-01",
    developer: "Velocity Games",
    publisher: "HASHEEM Publishing",
    features: ["Online Multiplayer", "Split-Screen", "4K Support", "Controller Support", "VR Compatible"],
  },
  {
    id: "last-corridor",
    title: "The Last Corridor",
    image: game4,
    screenshots: [game4],
    price: "$19.99",
    rating: 5,
    genre: "Horror Survival",
    platforms: ["PC", "Mobile"],
    description: "You wake up in an abandoned research facility with no memory of how you got there. Something lurks in the corridors — something that reacts to sound, light, and your fear. With limited resources and no weapons, your only option is to survive. Every playthrough generates new scares.",
    releaseDate: "2025-10-31",
    developer: "Nightmare Factory",
    publisher: "HASHEEM Publishing",
    features: ["Procedural Generation", "VR Compatible", "Surround Sound", "Controller Support"],
  },
  {
    id: "kingdoms-of-ash",
    title: "Kingdoms of Ash",
    image: game5,
    screenshots: [game5, game1ss1],
    price: "$59.99",
    rating: 5,
    genre: "Open World",
    platforms: ["PC", "PlayStation"],
    description: "Rule or ruin. In a vast medieval fantasy world torn apart by war, forge your own path as a warrior, diplomat, or conqueror. Build your kingdom from the ground up, command armies in massive real-time battles, and shape the fate of millions. The world reacts to every decision you make.",
    releaseDate: "2026-03-15",
    developer: "Epic Realm Studios",
    publisher: "HASHEEM Publishing",
    features: ["Open World", "Base Building", "4K Support", "Ray Tracing", "Mod Support"],
  },
  {
    id: "titan-command",
    title: "Titan Command",
    image: game6,
    screenshots: [game6],
    price: "$44.99",
    originalPrice: "$59.99",
    rating: 4,
    genre: "Strategy",
    platforms: ["PC", "Mobile"],
    description: "Command massive armies of mechs, drones, and infantry in the ultimate sci-fi strategy experience. Build your base, research devastating weapons, and lead your forces to victory across 50+ campaign missions or test your tactical prowess online against players worldwide.",
    releaseDate: "2025-08-10",
    developer: "Iron Grid Games",
    publisher: "HASHEEM Publishing",
    features: ["Online Multiplayer", "Base Building", "Mod Support", "LAN Support"],
  },
  {
    id: "arena-legends",
    title: "Arena Legends",
    image: game7,
    screenshots: [game7],
    price: "$0.00",
    rating: 4,
    genre: "Battle Royale",
    platforms: ["PC", "PlayStation", "Mobile"],
    description: "Drop into a world of chaos. 100 warriors enter, only one leaves. With mythological weapons, elemental abilities, and a shrinking battlefield of destruction, Arena Legends redefines the battle royale genre. Free to play with seasonal battle passes and cosmetics.",
    releaseDate: "2025-06-01",
    developer: "Storm Interactive",
    publisher: "HASHEEM Publishing",
    features: ["Free to Play", "Cross-Platform", "Online Multiplayer", "Seasonal Content", "Controller Support"],
  },
  {
    id: "netrunner",
    title: "Netrunner: Ghost Protocol",
    image: game8,
    screenshots: [game8],
    price: "$54.99",
    rating: 5,
    genre: "Cyberpunk RPG",
    platforms: ["PC", "PlayStation"],
    description: "Hack the planet. As an elite netrunner, infiltrate the most secure systems in the world, manipulate corporations from the shadows, and uncover a conspiracy that could reshape civilization. Features deep character customization, branching narratives, and a fully explorable cyberpunk metropolis.",
    releaseDate: "2026-02-14",
    developer: "NeonByte Interactive",
    publisher: "HASHEEM Publishing",
    features: ["Open World", "4K Support", "Ray Tracing", "HDR", "Controller Support"],
  },
  {
    id: "striker-pro",
    title: "Striker Pro 2026",
    image: game9,
    screenshots: [game9],
    price: "$49.99",
    rating: 4,
    genre: "Sports",
    platforms: ["PlayStation", "PC", "Mobile"],
    description: "The beautiful game, perfected. With hyper-realistic physics, intelligent AI teammates, and the most authentic football experience ever created. Featuring licensed leagues, clubs, and over 20,000 real players. Build your ultimate team and dominate online.",
    releaseDate: "2025-09-15",
    developer: "GoalPost Games",
    publisher: "HASHEEM Publishing",
    features: ["Online Multiplayer", "Cross-Platform", "4K Support", "Controller Support", "Licensed Content"],
  },
  {
    id: "stellar-frontier",
    title: "Stellar Frontier",
    image: game10,
    screenshots: [game10],
    price: "$44.99",
    rating: 5,
    genre: "Sci-Fi Exploration",
    platforms: ["PC", "Mobile"],
    description: "Explore a procedurally generated universe with billions of unique planets. Mine resources, build space stations, trade with alien civilizations, and chart your own course through the cosmos. The universe is yours to discover in this breathtaking space exploration adventure.",
    releaseDate: "2025-12-01",
    developer: "Cosmos Interactive",
    publisher: "HASHEEM Publishing",
    features: ["Open World", "Base Building", "Co-op Multiplayer", "VR Compatible", "Mod Support"],
  },
  {
    id: "iron-fist",
    title: "Iron Fist Championship",
    image: game11,
    screenshots: [game11],
    price: "$39.99",
    rating: 4,
    genre: "Fighting",
    platforms: ["PlayStation", "PC"],
    description: "Enter the arena. 40+ unique fighters, each with their own fighting style, backstory, and devastating special moves. Master complex combos, counter attacks, and finishing moves in the most intense fighting game ever created. Compete online in ranked tournaments.",
    releaseDate: "2025-07-20",
    developer: "Fury Games",
    publisher: "HASHEEM Publishing",
    features: ["Online Multiplayer", "Local Multiplayer", "Controller Support", "Ranked Mode", "Seasonal Content"],
  },
  {
    id: "dead-zone",
    title: "Dead Zone: Outbreak",
    image: game12,
    screenshots: [game12],
    price: "$34.99",
    originalPrice: "$49.99",
    rating: 5,
    genre: "Zombie Survival",
    platforms: ["PC", "PlayStation", "Mobile"],
    description: "The dead have risen. Survive in a massive open world overrun by the undead. Scavenge for supplies, build fortified shelters, team up with other survivors, and fight back against increasingly dangerous zombie mutations. Every night brings new horrors.",
    releaseDate: "2025-10-13",
    developer: "Nightmare Factory",
    publisher: "HASHEEM Publishing",
    features: ["Open World", "Co-op Multiplayer", "Base Building", "Crafting System", "Day/Night Cycle"],
  },
];

export function getGameById(id: string): Game | undefined {
  return getGameByIdFromList(games, id);
}

export function getGamesByPlatform(platform: Platform | "All"): Game[] {
  return getGamesByPlatformFromList(games, platform);
}

export function getGameByIdFromList(list: Game[], id: string): Game | undefined {
  return list.find((game) => game.id === id);
}

export function getGamesByPlatformFromList(
  list: Game[],
  platform: Platform | "All",
): Game[] {
  if (platform === "All") {
    return list;
  }

  return list.filter((game) => game.platforms.includes(platform));
}
