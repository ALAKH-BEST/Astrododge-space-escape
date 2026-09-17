export const shipIds = ["vanguard", "phantom", "titan", "nova"] as const;
export type ShipId = (typeof shipIds)[number];

export type ShipDefinition = {
  id: ShipId;
  name: string;
  price: number;
  role: string;
  speed: number;
  handling: number;
  shield: number;
  ability: string;
  abilityDescription: string;
  color: string;
};

export const ships: Record<ShipId, ShipDefinition> = {
  vanguard: {
    id: "vanguard",
    name: "VANGUARD V1",
    price: 0,
    role: "Balanced starter ship",
    speed: 3,
    handling: 4,
    shield: 2,
    ability: "NONE",
    abilityDescription: "Reliable and ready for every mission.",
    color: "#818cf8",
  },
  phantom: {
    id: "phantom",
    name: "PHANTOM X",
    price: 1000,
    role: "Speed / agility",
    speed: 5,
    handling: 5,
    shield: 1,
    ability: "PHASE SHIFT",
    abilityDescription: "Become invulnerable to collisions for 3 seconds.",
    color: "#22d3ee",
  },
  titan: {
    id: "titan",
    name: "TITAN MK II",
    price: 2500,
    role: "Tank / survival",
    speed: 2,
    handling: 2,
    shield: 5,
    ability: "FORTRESS",
    abilityDescription: "Absorb up to 3 asteroid collisions.",
    color: "#f59e0b",
  },
  nova: {
    id: "nova",
    name: "NOVA",
    price: 5000,
    role: "High-risk / high-reward",
    speed: 4,
    handling: 4,
    shield: 3,
    ability: "OVERDRIVE",
    abilityDescription: "Boost movement speed and double your score for 5 seconds.",
    color: "#f472b6",
  },
};

export function isShipId(value: string): value is ShipId {
  return shipIds.includes(value as ShipId);
}
