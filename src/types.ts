export interface NamedResource { name: string; url: string }

export interface TypeData {
  damage_relations: {
    double_damage_from: NamedResource[];
    half_damage_from: NamedResource[];
    no_damage_from: NamedResource[];
    double_damage_to: NamedResource[];
    half_damage_to: NamedResource[];
    no_damage_to: NamedResource[];
  };
}

export interface Matchups {
  defense: Record<'4x' | '2x' | '0.5x' | '0.25x' | '0x', string[]>;
  offense: string[];
}

export interface PokemonStat { base_stat: number; stat: NamedResource }
export interface Variety { is_default: boolean; pokemon: NamedResource }
export interface Pokemon {
  id: number;
  name: string;
  korean_name: string;
  species: NamedResource;
  types: { slot: number; type: NamedResource }[];
  stats: PokemonStat[];
  sprites: {
    front_default: string | null;
    other?: { 'official-artwork'?: { front_default: string | null } };
  };
  varieties?: Variety[];
  matchups?: Matchups;
}

export interface Species {
  varieties: Variety[];
  evolution_chain: { url: string } | null;
}

export interface EvolutionLink {
  species: NamedResource;
  evolves_to: EvolutionLink[];
}
export interface EvolutionNode {
  id: string;
  name: string;
  korean_name: string;
  sprite: string;
  evolves_to: EvolutionNode[];
}
