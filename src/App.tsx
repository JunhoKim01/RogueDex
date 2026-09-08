import React, { useState, useEffect } from 'react';
import { Search, Info, AlertCircle, Loader2, Dna, BookOpen, Package, Map, ArrowRight, Layers, Users, Plus, Trash2, CheckCircle, ChevronDown, RefreshCw } from 'lucide-react';

import type { EvolutionLink, EvolutionNode, Matchups, Pokemon, PokemonStat, Species, TypeData, Variety } from './types';

// 속성별 색상 및 한글 이름 매핑
const TYPE_INFO: Record<string, { name: string; color: string }> = {
  normal: { name: '노말', color: '#A8A77A' },
  fire: { name: '불꽃', color: '#EE8130' },
  water: { name: '물', color: '#6390F0' },
  electric: { name: '전기', color: '#F7D02C' },
  grass: { name: '풀', color: '#7AC74C' },
  ice: { name: '얼음', color: '#96D9D6' },
  fighting: { name: '격투', color: '#C22E28' },
  poison: { name: '독', color: '#A33EA1' },
  ground: { name: '땅', color: '#E2BF65' },
  flying: { name: '비행', color: '#A98FF3' },
  psychic: { name: '에스퍼', color: '#F95587' },
  bug: { name: '벌레', color: '#A6B91A' },
  rock: { name: '바위', color: '#B6A136' },
  ghost: { name: '고스트', color: '#735797' },
  dragon: { name: '드래곤', color: '#6F35FC' },
  dark: { name: '악', color: '#705746' },
  steel: { name: '강철', color: '#B7B7CE' },
  fairy: { name: '페어리', color: '#D685AD' }
};

// 포케로그 아이템 설명, 팁, 유스케이스 확장 데이터베이스
const ITEMS_DB = {
  "leftovers": {
    name: "먹다남은음식",
    sprite: "leftovers",
    tier: "로그",
    desc: "[소지품] 매 턴 종료 시 최대 체력의 1/16(6.25%)을 회복합니다.",
    tip: "보스전이나 장기전에서 체력이 높은 고내구 탱커들과 최고의 궁합을 자랑합니다. 최대 4개까지 중첩하여 들려주면 매 턴 25%라는 말도 안 되는 유지력을 확보할 수 있으며, 특히 '방어'나 '씨뿌리기' 기술과 조합 시 생존력이 극대화됩니다.",
    useCase: "무한 모드 캐리 에이스나 파티의 핵심 탱커(예: 콜로솔트, 너트령, 잠만보)에게 최우선으로 몰아줍니다."
  },
  "exp_share": {
    name: "학습장치",
    sprite: "exp-share",
    tier: "슈퍼",
    desc: "[핵심] 전투에 직접 참여하지 않은 대기 멤버들에게도 경험치를 10%씩 분배합니다.",
    tip: "클래식 모드 극초반부터 빠르게 획득할수록 좋습니다. 최대 5개까지 중첩이 가능해지며, 5개 중첩 시 대기 멤버들도 배틀 참가 멤버와 사실상 동일한 경험치를 획득하게 되므로 파티 레벨 밸런싱이 완벽해집니다.",
    useCase: "전투 능력이 낮아 레벨업이 어려운 유틸 셔틀(예: 특성 '픽업'을 가진 직구리나 나옹) 혹은 새로 포획한 저레벨 고성능 포켓몬을 육성할 때 최고의 효율을 냅니다."
  },
  "kings_rock": {
    name: "왕의징표석",
    sprite: "kings-rock",
    tier: "로그",
    desc: "[소지품] 공격 적중 시 10% 확률로 상대를 풀죽게 만듭니다.",
    tip: "다단 히트 기술(예: 물수리검, 고드름침, 씨기관총 등)과 결합할 때 포케로그 최강의 사기 아이템으로 돌변합니다. 공격당 10% 확률이 개별 계산되므로, 5번 타격 시 거의 확정 풀죽음을 이끌어내며 최대 3개 중첩(30%)까지 쌓을 수 있습니다.",
    useCase: "연속 타격기를 자속으로 난사하는 에이스 딜러(예: 파르셀, 개굴닌자, 치라치노, 메가헤라크로스)에게 쥐여주면 적 보스를 허수아비로 만들 수 있습니다."
  },
  "focus_band": {
    name: "기합의머리띠",
    sprite: "focus-band",
    tier: "로그",
    desc: "[소지품] 기절할 듯한 피해를 입어도 10% 확률로 HP 1을 남기고 버팁니다.",
    tip: "특성 '옹골참'이 없는 포켓몬에게 확률적 불사를 부여하는 귀중한 유지력 템입니다. 최대 3개까지 중첩하여 확률을 30%까지 끌어올릴 수 있어, 무한 모드 후반부 적들의 무시무시한 공격을 버티고 역관광을 보내는 기반이 됩니다.",
    useCase: "방어/특방이 극단적으로 낮아 기습 한 방에 터지기 쉬운 고스피드 유리대포형 에이스(예: 팬텀, 후딘, 마스카나)에게 장착합니다."
  },
  "quick_claw": {
    name: "선제공격손톱",
    sprite: "quick-claw",
    tier: "슈퍼",
    desc: "[소지품] 매 턴 10% 확률로 적의 스피드와 상관없이 선제 공격합니다.",
    tip: "스피드가 한 끗 차이로 밀려 선공을 내주고 한 방에 기절하는 딜레마를 극복시켜 줍니다. 최대 5개(50% 확률)까지 스택이 가능하여 고난이도 웨이브에서 확률 기반 선공 변수를 설계하기 좋습니다.",
    useCase: "화력은 최상급이지만 스피드가 느려 늘 선공을 뺏기는 무거운 초고체급 물리/특수 딜탱 포켓몬(예: 메가마기라스, 거대코뿌리, 콜로솔트)에게 유용합니다."
  },
  "soothe_bell": {
    name: "평온의방울",
    sprite: "soothe-bell",
    tier: "슈퍼",
    desc: "[소지품] 포켓몬의 친밀도 획득량을 1.5배(50%) 증가시킵니다.",
    tip: "친밀도로 진화하는 포켓몬의 진화 시점을 극적으로 당겨주어 초반 스노우볼을 굴리는 데 핵심적인 역할을 합니다. 친밀도 비례 물리 기술인 '은혜갚기'나 '화풀이'의 위력을 빠르게 올릴 때도 사용됩니다.",
    useCase: "친밀도 진화가 핵심인 스타팅 포켓몬(예: 옹골참을 지닌 토게피 계열, 루카리오, 크로뱃, 누리레느)에게 초반 배분 최우선 순위입니다."
  },
  "amulet_coin": {
    name: "부적금화",
    sprite: "amulet-coin",
    tier: "로그",
    desc: "[소지품] 배틀 승리 시 얻는 상금이 20% 증가합니다.",
    tip: "포케로그 후반부로 갈수록 상점 리롤(새로고침) 비용과 소비 아이템 가격이 살인적으로 비싸지므로, 자금 회전을 활성화하기 위해 중첩해두어야 합니다. 최대 5개까지 중첩하여 골드 획득량을 무려 2배(100%)까지 폭증시킬 수 있습니다.",
    useCase: "초반 라운드에 상점에서 이 아이템이 보인다면 메인 전투원에 쥐어주고 상금을 꾸준히 뻥튀기하는 데 주력해야 합니다."
  },
  "exp_balance": {
    name: "경험치부적",
    sprite: "oval-charm",
    tier: "마스터",
    desc: "[핵심] 전투 완료 시 획득하는 전체 경험치 획득량이 대폭 증가합니다.",
    tip: "마스터 볼 등급의 최상위 수동 유틸리티입니다. 이 아이템이 몇 개 쌓여있느냐에 따라 이상한 사탕에 돈을 낭비하지 않고도 적 우두머리 포켓몬과의 레벨 격차를 앞서나갈 수 있게 됩니다.",
    useCase: "무한 모드 중반 이후 몬스터들의 살벌한 레벨 스케일링을 따라잡기 위해 상점에서 마스터 등급이 떴을 때 무조건 최우선 선택해야 하는 압도적 효율의 아이템입니다."
  },
  "sharp_beak": {
    name: "예리한부리",
    sprite: "sharp-beak",
    tier: "일반",
    desc: "[소지품] 비행 타입 기술의 공격 위력이 20% 증가합니다.",
    tip: "포케로그의 일반 등급 대표 타입 증폭템입니다. 다른 전력 보강 템처럼 여러 개 중첩하여 장착할 수 있으며(최대 5개, 100% 위력 증가), 비행 속성 주력기를 장착한 날개 달린 포켓몬들의 고점을 기하급수적으로 끌어올립니다.",
    useCase: "폭풍을 난사하는 메가리자몽Y나 브레이브버드를 보유한 파이어로, 왕의징표석과 궁합이 좋은 에어슬래시를 쓰는 토게키스 등 비행 타입 핵심 에이스들에게 장착합니다."
  },
  "lucky_egg": {
    name: "행복의알",
    sprite: "lucky-egg",
    tier: "슈퍼",
    desc: "[소지품] 이 아이템을 소지한 포켓몬이 획득하는 경험치가 50% 증가합니다.",
    tip: "학습장치와 다르게 '특정 한 마리'에게 성장을 집중시키는 강력한 개별 장비입니다. 최대 99개까지 엄청나게 중첩시킬 수 있어 최후반 무한 모드에서 1레벨 에이스를 신속하게 레벨 10,000+ 상태로 폭풍 성장시키는 용도로 쓰입니다.",
    useCase: "파티의 메인 에이스 한 마리에게 행복의 알을 몰아주어, 다른 파티원들보다 레벨을 20~50단계 이상 오버하여 찍어두는 '원맨 캐리' 전략에 완벽합니다."
  },
  "sitrus": {
    name: "자뭉열매",
    sprite: "sitrus-berry",
    tier: "슈퍼",
    desc: "[소모품] 체력이 절반(50%) 이하로 떨어지면 최대 체력의 25%를 즉시 회복합니다.",
    tip: "보스전에서 적의 위력적인 한 방 공격을 기합의띠로 견뎌낸 후, 즉시 자뭉열매가 발동되면서 25%의 체력을 복구하여 기절을 변칙적으로 모면하는 콤보 유지력을 제공합니다.",
    useCase: "약점이 찔려 의문사하기 쉬운 아군 에이스 딜러, 혹은 체력이 무조건 100%여야 능력이 발동하는 특성(예: 멀티스케일 망나뇽)을 가진 포켓몬에게 보험으로 들려줍니다."
  },
  "lum": {
    name: "리샘열매",
    sprite: "lum-berry",
    tier: "슈퍼",
    desc: "[소모품] 마비, 화상, 독, 수면, 빙결, 혼란 등 모든 상태이상을 즉시 1회 치료합니다.",
    tip: "포케로그의 각종 까다로운 상태이상 날빌(수면가루, 마비가루, 화염방사 화상 등)을 완벽하게 무력화합니다. 메인 딜러가 마비나 혼란, 수면에 걸려 공격 기회를 잃으면 즉시 아군 파티가 붕괴하기 때문에 언제나 넉넉히 들고 있어야 합니다.",
    useCase: "어떤 상황에서도 턴을 빼앗기면 안 되는 파티 최고의 에이스 딜러 포켓몬에게 항상 2개 이상 상시 보유하도록 강제 세팅해야 하는 인공호흡기입니다."
  },
  "enigma": {
    name: "의문열매",
    sprite: "enigma-berry",
    tier: "로그",
    desc: "[소모품] 효과가 굉장한(약점) 공격을 받았을 때 체력을 25% 회복합니다.",
    tip: "약점을 찔려 체력이 위태로울 때 목숨을 부지하고 턴을 반전시켜 주는 귀중한 자원입니다. 약점을 한 대 맞아도 25% 보정이 들어가 다음 턴에 약점 상성을 찌르는 카운터 공격을 날릴 틈을 열어줍니다.",
    useCase: "약점이 5~6개 이상으로 매우 많지만 기본적인 방어 체급이 준수해 한 방은 버티는 이중 타입 고스펙 포켓몬(예: 마기라스, 삼삼드래, 메가설카타 등)에게 들려주면 대역전승을 설계할 수 있습니다."
  },
  "leppa": {
    name: "과사열매",
    sprite: "leppa-berry",
    tier: "슈퍼",
    desc: "[소모품] 기술의 PP가 0이 되면 해당 기술의 PP를 즉시 10 회복시킵니다.",
    tip: "포케로그는 매 층마다 체력과 PP를 완전히 회복시켜주지 않고 상점이나 자원 소비에 의존해야 합니다. 강력한 광역기나 초고위력 전용기는 PP가 5~10 정도로 매우 낮아 쉽게 고갈되므로 이를 예방해 주는 가뭄의 단비입니다.",
    useCase: "분화, 해수스파우팅, 용성군, 무한다이빔 등 극딜 사냥을 위해 저PP 고위력 광역 공격기를 난사해야 하는 에이스 포켓몬에게 필수 장착입니다."
  },
  "liechi": {
    name: "치리열매",
    sprite: "liechi-berry",
    tier: "로그",
    desc: "[소모품] 체력이 25% 이하일 때 물리 공격력을 1랭크 상승시킵니다.",
    tip: "옹골참 특성이나 기합의띠 아이템으로 실피(HP 1) 상태가 되었을 때 폭발적인 랭크업 역습 화력을 가해 주는 도구입니다. 이 조건에서 선공기(예: 신속, 야습, 기습)와 조합하면 선공으로 적을 쓸어 담는 역스윕 쇼를 연출할 수 있습니다.",
    useCase: "랭크업 버프가 생명인 물리형 칼춤 딜러 및 고위력 물리 선공기를 채용한 어태커(예: 핫삼, 한카리아스, 불카모스)에게 강추합니다."
  },
  "petaya": {
    name: "야타비열매",
    sprite: "petaya-berry",
    tier: "로그",
    desc: "[소모품] 체력이 25% 이하일 때 특수공격을 1랭크 상승시킵니다.",
    tip: "치리열매의 특수 어태커 전용 버전입니다. 위태로운 상황에서 최후의 한 방 특수 고위력 공격을 뿜어낼 수 있게 보정해 주며, 특히 적 보스 몬스터의 실드를 확정 철거하는 불도저급 위력을 더해줍니다.",
    useCase: "특수공격 위주의 폭발적인 고스펙 특수 어태커(예: 메가팬텀, 뮤츠, 타오르는불꽃 특성의 샹델라)가 일발역전을 도모하기에 매우 유용합니다."
  },
  "salac": {
    name: "캄라열매",
    sprite: "salac-berry",
    tier: "로그",
    desc: "[소모품] 체력이 25% 이하일 때 스피드를 1랭크 상승시킵니다.",
    tip: "중속 딜러들의 생명 연장 장비입니다. 피가 깎였을 때 스피드가 1.5배로 뛰어 오르므로, 선공을 쥐고 적을 완벽하게 선제 킬로 잡아낼 수 있게 해 줍니다. 상성의 불리함을 스피드 선공으로 찍어 누를 기회를 제공합니다.",
    useCase: "공격력은 압도적이나 스피드가 70~90대로 어중간해 애매한 강캐 계열(예: 메가이상해꽃, 대검귀, 한카리아스)에게 강력 처방하는 도구입니다."
  },
  "starf": {
    name: "스타열매",
    sprite: "starf-berry",
    tier: "로그",
    desc: "[소모품] 체력이 25% 이하일 때 무작위 능력치 중 하나가 2랭크 대폭 상승합니다.",
    tip: "판도를 완전히 뒤바꾸는 초대박 로또 열매입니다. 공격력, 스피드, 혹은 방어력 중 하나가 2단계(200%) 올라가기 때문에, 운이 좋은 경우 버티면서 적 전체를 모조리 쓸어버리는 난세의 영웅급 위력을 보장합니다.",
    useCase: "클래식 200층 보스전이나 무한 모드 보스의 위협 속에서 변수를 창출해야 하는 극한 상황에 처했을 때 모든 포켓몬에게 비상 보험용으로 채워줍니다."
  }
};

// 포케로그 공식 전체 바이옴 및 연결 루트 데이터베이스 (32개 완성형)
const BIOMES: Record<string, { name: string; type: string[]; next: string[] }> = {
  "Town": { name: "마을", type: ["normal"], next: ["Plains"] },
  "Plains": { name: "평원", type: ["normal", "flying"], next: ["Grass", "Metropolis"] },
  "Grass": { name: "풀숲", type: ["grass", "bug"], next: ["Tall Grass", "Fairy Cave"] },
  "Tall Grass": { name: "높은 풀숲", type: ["grass", "bug", "poison"], next: ["Forest", "Cave"] },
  "Forest": { name: "숲", type: ["grass", "bug"], next: ["Jungle", "Meadow"] },
  "Jungle": { name: "정글", type: ["grass", "bug", "poison"], next: ["Swamp", "Temple"] },
  "Swamp": { name: "늪지", type: ["water", "ghost", "poison"], next: ["Cemetery", "Wasteland"] },
  "Cemetery": { name: "공동묘지", type: ["ghost"], next: ["Abyss", "Wasteland"] },
  "Abyss": { name: "심연", type: ["ghost", "dark"], next: ["Space", "Wasteland"] },
  "Space": { name: "우주", type: ["psychic", "dragon", "ice"], next: ["Ruins", "Wasteland"] },
  "Meadow": { name: "목초지", type: ["normal", "fairy", "grass"], next: ["Fairy Cave", "Lake"] },
  "Lake": { name: "호수", type: ["water", "grass"], next: ["Beach", "Swamp"] },
  "Fairy Cave": { name: "페어리 동굴", type: ["fairy", "rock"], next: ["Ice Cave", "Space"] },
  "Cave": { name: "동굴", type: ["rock", "ground", "poison"], next: ["Badlands", "Mountain", "Ice Cave"] },
  "Mountain": { name: "산", type: ["rock", "flying", "fighting"], next: ["Volcano", "Wasteland"] },
  "Volcano": { name: "화산", type: ["fire", "rock", "ground"], next: ["Beach", "Ruins"] },
  "Beach": { name: "해변", type: ["water", "flying", "ground"], next: ["Sea"] },
  "Sea": { name: "바다", type: ["water", "flying"], next: ["Seabed", "Cave"] },
  "Seabed": { name: "해저", type: ["water", "rock", "ground"], next: ["Cave", "Volcano"] },
  "Badlands": { name: "황무지", type: ["ground", "rock", "fire"], next: ["Mountain", "Desert"] },
  "Desert": { name: "사막", type: ["ground", "rock"], next: ["Ruins"] },
  "Ruins": { name: "고대유적", type: ["ghost", "psychic", "dark"], next: ["Wasteland"] },
  "Wasteland": { name: "황폐해진 땅", type: ["poison", "ground", "steel"], next: ["Slum", "Badlands"] },
  "Ice Cave": { name: "얼음 동굴", type: ["ice", "rock"], next: ["Snowy Forest"] },
  "Snowy Forest": { name: "눈 덮인 숲", type: ["ice", "grass"], next: ["Ice Mountain", "Lake"] },
  "Ice Mountain": { name: "설산", type: ["ice", "rock", "flying"], next: ["Volcano"] },
  "Metropolis": { name: "대도시", type: ["normal", "electric", "poison"], next: ["Slum"] },
  "Slum": { name: "슬럼가", type: ["poison", "dark", "fighting"], next: ["Construction Site"] },
  "Construction Site": { name: "공사장", type: ["ground", "fighting", "rock"], next: ["Power Plant", "Desert"] },
  "Power Plant": { name: "발전소", type: ["electric", "steel", "poison"], next: ["Factory"] },
  "Factory": { name: "공장", type: ["steel", "electric"], next: ["Laboratory", "Plains"] },
  "Laboratory": { name: "연구소", type: ["steel", "electric", "psychic"], next: ["Space"] },
  "Temple": { name: "사원", type: ["psychic", "ghost", "dragon"], next: ["Ruins"] }
};

export default function App() {
  const [mode, setMode] = useState('team'); // 기본값 'team'으로 시작하여 유저 편의 극대화

  const [query, setQuery] = useState('');
  const [itemQuery, setItemQuery] = useState('');
  const [currentBiome, setCurrentBiome] = useState('Plains');
  const [targetBiome, setTargetBiome] = useState('');

  const [korNameMap, setKorNameMap] = useState<Record<string, string>>({});
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [evolutionChain, setEvolutionChain] = useState<EvolutionNode | null>(null);
  const [matchups, setMatchups] = useState<Matchups | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSingleType, setSelectedSingleType] = useState<string | null>(null);
  const [typeCache, setTypeCache] = useState<Record<string, TypeData>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapLoading, setMapLoading] = useState(true);

  // 팀 구성 상태
  const [team, setTeam] = useState<Pokemon[]>([]);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [isTeamLoading, setIsTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState('');

  // 아이템 아코디언 상태
  const [activeItem, setActiveItem] = useState<string | null>(null);

  // 폼 정보 상태 저장
  const [pokemonVarieties, setPokemonVarieties] = useState<Variety[]>([]);
  const [selectedVariety, setSelectedVariety] = useState('');

  // 파티 가득 찼을 때의 수동 교체 모달 상태
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [pendingPokemon, setPendingPokemon] = useState<Pokemon | null>(null);

  // 추가 시각적 피드백 상태
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    const fetchKoreanNames = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_species_names.csv');
        const csvText = await response.text();
        const lines = csvText.split('\n');
        const nameToId: Record<string, string> = {};
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',');
          if (parts.length >= 3) {
            const id = parts[0];
            const lang = parts[1];
            const name = parts[2].replace(/"/g, '');
            if (lang === '3') nameToId[name.trim()] = id;
          }
        }
        setKorNameMap(nameToId);
      } catch (err) {
        console.error("이름 맵핑 로드 실패", err);
      } finally {
        setMapLoading(false);
      }
    };
    fetchKoreanNames();
  }, []);

  // 포켓몬이 지정될 때 폼 Varieties 정보 로드
  useEffect(() => {
    if (!pokemon || !pokemon.species?.url) {
      setPokemonVarieties([]);
      setSelectedVariety('');
      return;
    }
    const fetchVarieties = async () => {
      try {
        const res = await fetch(pokemon.species.url);
        if (res.ok) {
          const speciesData: Species = await res.json();
          if (speciesData.varieties && speciesData.varieties.length > 0) {
            setPokemonVarieties(speciesData.varieties);
            const defaultVariety = speciesData.varieties.find(v => v.is_default);
            setSelectedVariety(defaultVariety ? defaultVariety.pokemon.name : speciesData.varieties[0].pokemon.name);
          }
        }
      } catch (err) {
        console.error("폼 목록을 가져오는 도중 오류 발생", err);
      }
    };
    fetchVarieties();
  }, [pokemon]);

  // 한글화 폼 포맷팅 함수
  const formatFormName = (varietyName: string, defaultKoreanName: string) => {
    const nameLower = varietyName.toLowerCase();
    if (nameLower.endsWith('-mega')) return `메가${defaultKoreanName}`;
    if (nameLower.endsWith('-mega-x')) return `메가${defaultKoreanName} X`;
    if (nameLower.endsWith('-mega-y')) return `메가${defaultKoreanName} Y`;
    if (nameLower.endsWith('-gmax')) return `거다이맥스 ${defaultKoreanName}`;
    if (nameLower.endsWith('-alola')) return `알로라 ${defaultKoreanName}`;
    if (nameLower.endsWith('-galar')) return `가라르 ${defaultKoreanName}`;
    if (nameLower.endsWith('-hisui')) return `히스이 ${defaultKoreanName}`;
    if (nameLower.endsWith('-paldea')) return `팔데아 ${defaultKoreanName}`;
    if (nameLower.endsWith('-origin')) return `오리진폼 ${defaultKoreanName}`;
    return defaultKoreanName;
  };

  // BST 등급 평가 헬퍼
  const getBSTLevel = (bst: number) => {
    if (bst >= 650) return { grade: "SSS", label: "신화급/초전설", color: "text-red-500", barColor: "bg-red-500" };
    if (bst >= 600) return { grade: "SS", label: "최정상급/600족", color: "text-purple-500", barColor: "bg-purple-500" };
    if (bst >= 540) return { grade: "S", label: "준전설 및 에이스급", color: "text-pink-500", barColor: "bg-pink-500" };
    if (bst >= 480) return { grade: "A", label: "실전급 딜러/탱커", color: "text-blue-400", barColor: "bg-blue-400" };
    if (bst >= 400) return { grade: "B", label: "유틸리티/서포터", color: "text-emerald-400", barColor: "bg-emerald-400" };
    return { grade: "C", label: "초반 육성/조커픽", color: "text-slate-400", barColor: "bg-slate-400" };
  };

  // 성격, 특성 가이드 및 추천 시스템
  const getRecommendedNatureAndTraits = (stats: PokemonStat[], korean_name: string) => {
    const hp = stats?.find(s=>s.stat.name==='hp')?.base_stat || 0;
    const atk = stats?.find(s=>s.stat.name==='attack')?.base_stat || 0;
    const def = stats?.find(s=>s.stat.name==='defense')?.base_stat || 0;
    const spa = stats?.find(s=>s.stat.name==='special-attack')?.base_stat || 0;
    const spd = stats?.find(s=>s.stat.name==='special-defense')?.base_stat || 0;
    const speed = stats?.find(s=>s.stat.name==='speed')?.base_stat || 0;

    let role = "밸런스형";
    let nature = "진지 (공격/방어 무보정)";
    let reason = "스탯 균형이 잘 어우러져 취향에 맞춰 고르게 선택하기 좋습니다.";
    let traits = ["-"];
    let passive = "해당 포켓몬의 스타팅 사탕 패시브 정보는 인게임 세팅에서 해금 후 확인하세요.";

    if (atk >= 100 && speed >= 90 && atk > spa) {
      role = "고스피드 물리 스위퍼";
      nature = "고집 (+물리공격/-특수공격) 또는 명랑 (+스피드/-특수공격)";
      reason = "높은 공격력과 스피드를 극대화해 먼저 치고 나가 적을 한 번에 제압하기 적합합니다.";
    } else if (spa >= 100 && speed >= 90 && spa > atk) {
      role = "고스피드 특수 스위퍼";
      nature = "조심 (+특수공격/-물리공격) 또는 겁쟁이 (+스피드/-물리공격)";
      reason = "높은 특수 공격력과 선제 스피드를 결합해 주력 광역 기술(분화, 해수스파우팅 등)을 퍼붓기 좋습니다.";
    } else if (atk >= 100 && atk > spa) {
      role = "물리 딜탱 어태커";
      nature = "고집 (+물리공격/-특수공격) 또는 신중 (+특수방어/-특수공격)";
      reason = "우수한 내구력을 바탕으로 버티며 상대 보스 실드 게이지를 효과적으로 깎아냅니다.";
    } else if (spa >= 100 && spa > atk) {
      role = "특수 딜탱 어태커";
      nature = "조심 (+특수공격/-물리공격) 또는 차분 (+특수방어/-물리공격)";
      reason = "특수 물리 반사나 고위력 저격 기술을 활용한 안정적인 전투 플랜에 어울립니다.";
    } else if (def + spd >= 220) {
      role = "극탱커 / 깔짝형 장막";
      nature = "대담 (+물리방어/-물리공격) 또는 장난꾸러기 (+물리방어/-특수공격)";
      reason = "씨뿌리기, 방어, 소금절이 같은 기믹형 도트뎀을 박아 넣고 안전하게 존버하기에 사기적입니다.";
    }

    if (korean_name.includes("콜로솔트")) {
      traits = ["정화의소금 (상태이상 원천 예방 + 고스트 타입 받는 피해 50% 감쇄)", "옹골참 (일격사 완벽 방어)"];
      passive = "패시브: 모래날림 (모래바람을 유발해 바위 타입 전반의 특방을 1.5배 보정해 생존력 보장)";
    } else if (korean_name.includes("너트령")) {
      traits = ["철가시 (상대 접촉 기술 피해를 12.5% 돌려줌)"];
      passive = "패시브: 필터 (상대에게 약점 속성으로 맞을 시 들어오는 데미지를 25% 경감시킴)";
    } else if (korean_name.includes("개굴닌자")) {
      traits = ["급류", "변환자재 (기술을 날릴 때마다 본인의 타입이 기술 속성으로 전환되어 자속 보정)"];
      passive = "패시브: 유대변화 (적을 하나 제거하면 스펙이 뻥튀기되는 지우개굴닌자로 전환)";
    } else if (korean_name.includes("망나뇽")) {
      traits = ["정신력 (풀죽지 않음)", "멀티스케일 (체력이 100%일 때 들어오는 대미지를 통째로 절반 반감)"];
      passive = "패시브: 긴장감 (상대방 보스가 나무열매 등을 먹는 귀찮은 복구 패턴을 사전 차단)";
    } else {
      traits = ["옹골참", "천하장사", "가속", "매직가드", "부유", "멀티스케일"];
      passive = "포켓몬 고유 특성 사전을 참조하세요. 사탕으로 해금하는 패시브는 해당 전용 시너지를 대폭 끌어올려 줍니다.";
    }

    return { role, nature, reason, traits, passive };
  };

  const calculateMultipliers = (typeDatas: TypeData[]): Matchups => {
    const multipliers: Record<string, number> = {};
    Object.keys(TYPE_INFO).forEach(type => { multipliers[type] = 1; });

    // 방어 상성 계산
    typeDatas.forEach(typeData => {
      const relations = typeData.damage_relations;
      relations.double_damage_from.forEach(t => {
        if (multipliers[t.name] !== undefined) multipliers[t.name] *= 2;
      });
      relations.half_damage_from.forEach(t => {
        if (multipliers[t.name] !== undefined) multipliers[t.name] *= 0.5;
      });
      relations.no_damage_from.forEach(t => {
        if (multipliers[t.name] !== undefined) multipliers[t.name] *= 0;
      });
    });

    const grouped: Matchups['defense'] = { '4x': [], '2x': [], '0.5x': [], '0.25x': [], '0x': [] };
    Object.entries(multipliers).forEach(([type, value]) => {
      if (value === 4) grouped['4x'].push(type);
      if (value === 2) grouped['2x'].push(type);
      if (value === 0.5) grouped['0.5x'].push(type);
      if (value === 0.25) grouped['0.25x'].push(type);
      if (value === 0) grouped['0x'].push(type);
    });

    const offensiveSet = new Set<string>();
    typeDatas.forEach(typeData => {
      typeData.damage_relations.double_damage_to.forEach(t => offensiveSet.add(t.name));
    });

    return { defense: grouped, offense: Array.from(offensiveSet) };
  };

  const parseEvolutionTree = (chain: EvolutionLink): EvolutionNode => {
    const speciesUrlParts = chain.species.url.split('/');
    const speciesId = speciesUrlParts[speciesUrlParts.length - 2];

    const node = {
      id: speciesId,
      name: chain.species.name,
      korean_name: Object.keys(korNameMap).find(key => korNameMap[key] === speciesId) || chain.species.name,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`,
      evolves_to: chain.evolves_to.map(evol => parseEvolutionTree(evol))
    };
    return node;
  };

  const executeSearch = async (searchStr: string) => {
    if (!searchStr.trim()) return;
    setLoading(true); setError(''); setPokemon(null); setMatchups(null); setEvolutionChain(null);
    setQuery(searchStr);
    try {
      const searchKey = searchStr.trim();
      const pokemonId = korNameMap[searchKey] || searchKey.toLowerCase();

      // 1. 포켓몬 기본 정보 가져오기
      const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
      if (!pokeRes.ok) throw new Error('포켓몬을 찾을 수 없습니다. (정확한 한글 이름을 입력해주세요)');
      const pokeData: Pokemon = await pokeRes.json();
      pokeData.korean_name = Object.keys(korNameMap).find(key => korNameMap[key] === pokeData.id.toString()) || pokeData.name;
      setPokemon(pokeData);

      // 2. 타입 상성 계산
      const typePromises = pokeData.types.map(t => fetch(t.type.url).then(res => res.json()));
      const typeDatas = await Promise.all(typePromises);
      setMatchups(calculateMultipliers(typeDatas));

      // 3. 진화체인 획득
      const speciesRes = await fetch(pokeData.species.url);
      if (speciesRes.ok) {
        const speciesData: Species = await speciesRes.json();
        if (speciesData.evolution_chain?.url) {
          const evoRes = await fetch(speciesData.evolution_chain.url);
          const evoData = await evoRes.json();
          setEvolutionChain(parseEvolutionTree(evoData.chain));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVarietyChange = async (varietyUrlName: string) => {
    if (!pokemon) return;
    setSelectedVariety(varietyUrlName);
    setLoading(true);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${varietyUrlName}`);
      if (res.ok) {
        const data: Pokemon = await res.json();
        const baseKoreanName = Object.keys(korNameMap).find(key => korNameMap[key] === pokemon.id.toString()) || pokemon.name;

        // 폼 변경 후 기존 이름 유지하되 한글명 전용 폼이름 적용
        data.korean_name = formatFormName(varietyUrlName, baseKoreanName);
        data.species = pokemon.species;

        // 타입 정보 재연동
        const typePromises = data.types.map(t => fetch(t.type.url).then(r => r.json()));
        const typeDatas = await Promise.all(typePromises);
        setMatchups(calculateMultipliers(typeDatas));

        setPokemon(data);
      }
    } catch (err) {
      setError('폼 정보를 변경하던 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const searchPokemon = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleAddTeamMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!teamSearchQuery.trim() || team.length >= 6) return;
    setIsTeamLoading(true); setTeamError('');
    try {
      const searchKey = teamSearchQuery.trim();
      const pokemonId = korNameMap[searchKey] || searchKey.toLowerCase();
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
      if (!res.ok) throw new Error('포켓몬을 찾을 수 없습니다.');
      const data: Pokemon = await res.json();
      data.korean_name = Object.keys(korNameMap).find(key => korNameMap[key] === data.id.toString()) || data.name;

      const typePromises = data.types.map(t => fetch(t.type.url).then(res => res.json()));
      const typeDatas = await Promise.all(typePromises);
      data.matchups = calculateMultipliers(typeDatas);

      // 종속 variety 상태 부여
      const speciesRes = await fetch(data.species.url);
      if (speciesRes.ok) {
        const speciesData: Species = await speciesRes.json();
        data.varieties = speciesData.varieties || [];
      }

      setTeam([...team, data]);
      setTeamSearchQuery('');
    } catch (err) {
      setTeamError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsTeamLoading(false);
    }
  };

  const handleRemoveTeamMember = (index: number) => {
    const newTeam = [...team];
    newTeam.splice(index, 1);
    setTeam(newTeam);
  };

  const handleAddCurrentToTeam = (pokemonToAdd: Pokemon) => {
    if (!pokemonToAdd) return;

    // 현재 도감에 설정되어 있는 타입 정보(matchups)와 폼 데이터 그대로 이식
    const newMember = {
      ...pokemonToAdd,
      matchups: matchups ?? undefined,
      varieties: pokemonVarieties
    };

    if (team.length < 6) {
      setTeam([...team, newMember]);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    } else {
      // 6마리 꽉 차 있을 때, 커스텀 모달 오픈용 임시 데이터 설정
      setPendingPokemon(newMember);
      setReplaceModalOpen(true);
    }
  };

  const handleReplaceTeamMember = (replaceIndex: number) => {
    if (!pendingPokemon) return;
    const newTeam = [...team];
    newTeam[replaceIndex] = pendingPokemon;
    setTeam(newTeam);
    setReplaceModalOpen(false);
    setPendingPokemon(null);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleTeamMemberFormChange = async (memberIndex: number, varietyUrlName: string) => {
    const member = team[memberIndex];
    if (!member) return;

    setIsTeamLoading(true);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${varietyUrlName}`);
      if (res.ok) {
        const data: Pokemon = await res.json();
        const baseId = member.id.toString();
        const baseKoreanName = Object.keys(korNameMap).find(key => korNameMap[key] === baseId) || member.name;

        data.korean_name = formatFormName(varietyUrlName, baseKoreanName);
        data.species = member.species;
        data.varieties = member.varieties;

        const typePromises = data.types.map(t => fetch(t.type.url).then(r => r.json()));
        const typeDatas = await Promise.all(typePromises);
        data.matchups = calculateMultipliers(typeDatas);

        const newTeam = [...team];
        newTeam[memberIndex] = data;
        setTeam(newTeam);
      }
    } catch (err) {
      setTeamError('파티원의 폼을 변경하는 도중 오류가 발생했습니다.');
    } finally {
      setIsTeamLoading(false);
    }
  };

  const handleGoToEncyclopedia = (koreanName: string) => {
    setMode('search');
    executeSearch(koreanName);
  };

  const analyzeSynergy = (targetData: Pokemon, targetMatchups: Matchups) => {
    if (!targetData || !targetMatchups) return null;
    if (team.length === 0) {
      return {
        grade: "추천",
        text: "파티가 비어있습니다. 우선 포획하여 전력을 보강하세요!",
        color: "text-emerald-400",
        pros: ["파티가 비어있어 무조건 도움이 됩니다."],
        cons: []
      };
    }

    let score = 50;
    const pros = [];
    const cons = [];

    // 1. 타입 중복 및 체급 비교
    const targetTypes = targetData.types.map(t => t.type.name);
    let hasOverlap = false;
    team.forEach(member => {
      member.types.forEach(mt => {
        if (targetTypes.includes(mt.type.name)) {
          hasOverlap = true;
          const targetBST = (targetData?.stats || []).reduce((a, b) => a + b.base_stat, 0);
          const memberBST = (member?.stats || []).reduce((a, b) => a + b.base_stat, 0);
          if (targetBST > memberBST + 20) {
            pros.push(`기존의 [${member.korean_name}]보다 체급(종족값)이 월등히 높아 방생 후 대체(교체) 멤버로 훌륭합니다.`);
            score += 15;
          } else {
            cons.push(`기존의 [${member.korean_name}]와(과) 타입이 겹치며, 성장이 부족해 굳이 교체할 메리트가 낮습니다.`);
            score -= 20;
          }
        }
      });
    });

    if (!hasOverlap) {
       pros.push("기존 파티원들과 타입이 겹치지 않아 상성 공격/방어 풀을 다채롭게 만들어 줍니다.");
       score += 15;
    }

    // 2. 파티 치명적 약점 보완 여부
    const weakCount: Record<string, number> = {};
    team.forEach(p => {
      if (!p.matchups) return;
      p.matchups.defense['2x'].forEach(t => { weakCount[t] = (weakCount[t] || 0) + 1; });
      p.matchups.defense['4x'].forEach(t => { weakCount[t] = (weakCount[t] || 0) + 2; });
    });

    let coversWeakness = false;
    Object.entries(weakCount).forEach(([type, count]) => {
      if (count >= 2) {
        if (targetMatchups.defense['0.5x'].includes(type) || targetMatchups.defense['0.25x'].includes(type) || targetMatchups.defense['0x'].includes(type)) {
          pros.push(`파티의 심각한 취약점인 [${TYPE_INFO[type]?.name || type}] 속성 공격을 안정적으로 대신 맞아줄 수 있습니다! (탱킹/교체 플레이에 완벽)`);
          score += 25;
          coversWeakness = true;
        }
      }
    });

    // 3. 풀 파티 패널티 (교체 강제 안내)
    if (team.length >= 6) {
       cons.push("현재 파티가 6마리로 꽉 차 있습니다. 포획하려면 기존 멤버 중 한 마리를 포기해야 합니다.");
       score -= 5;
    }

    let grade = "고민해볼 만함 (B)"; let color = "text-amber-400";
    if (score >= 70) { grade = "강력 추천! (S)"; color = "text-emerald-400"; }
    else if (score < 40) { grade = "비추천 (F)"; color = "text-red-400"; }

    return { grade, color, pros, cons };
  };

  const analyzeTeamOverall = () => {
    if (team.length === 0) return null;
    const warnings: string[] = [];
    const suggestions = [];
    let score = 100;

    // 1. 타입 중복 검사
    const typeCount: Record<string, Pokemon[]> = {};
    team.forEach(p => {
      p.types.forEach(t => {
        if (!typeCount[t.type.name]) typeCount[t.type.name] = [];
        typeCount[t.type.name].push(p);
      });
    });

    Object.entries(typeCount).forEach(([type, members]) => {
      if (members.length > 1) {
        score -= (members.length - 1) * 10;
        const bstList = members.map(m => ({
          name: m.korean_name,
          bst: (m?.stats || []).reduce((a, b) => a + b.base_stat, 0)
        })).sort((a, b) => b.bst - a.bst);

        const names = bstList.map(m => m.name).join(', ');
        const best = bstList[0].name;

        warnings.push(`[타입 중복] 파티에 ${TYPE_INFO[type]?.name || type} 타입(${names})이 겹칩니다. 종족값이 더 높은 "${best}"를 메인으로 남기고, 나머지는 방생을 고려해 보세요.`);
      }
    });

    // 2. 공통 치명적 약점 검사
    const weakCount: Record<string, number> = {};
    team.forEach(p => {
      if (!p.matchups) return;
      p.matchups.defense['2x'].forEach(t => { weakCount[t] = (weakCount[t] || 0) + 1; });
      p.matchups.defense['4x'].forEach(t => { weakCount[t] = (weakCount[t] || 0) + 2; });
    });

    Object.entries(weakCount).forEach(([type, count]) => {
      if (count >= 2.5) {
        score -= 15;
        const weakMembers = team.filter(p => p.matchups?.defense['2x'].includes(type) || p.matchups?.defense['4x'].includes(type)).map(m=>m.korean_name).join(', ');
        warnings.push(`[전멸 주의] 파티의 다수(${weakMembers})가 ${TYPE_INFO[type]?.name || type} 타입 공격에 찔립니다! 이를 받아줄 포켓몬 영입이 시급합니다.`);
      }
    });

    // 3. 역할군 검사
    let hasPhys = false, hasSpec = false, hasTank = false;
    team.forEach(p => {
      const atk = p.stats.find(s => s.stat.name === 'attack')?.base_stat || 0;
      const spa = p.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0;
      const def = p.stats.find(s => s.stat.name === 'defense')?.base_stat || 0;
      const spd = p.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0;
      if (atk >= 90 && atk >= spa * 1.1) hasPhys = true;
      if (spa >= 90 && spa >= atk * 1.1) hasSpec = true;
      if (def + spd >= 180) hasTank = true;
    });

    if (team.length >= 3) {
      if (!hasPhys) suggestions.push("💪 [물리 딜러 부재] 해피너스 등을 뚫어낼 물리 어태커가 필요합니다.");
      if (!hasSpec) suggestions.push("🔮 [특수 딜러 부재] 무장조 등을 돌파할 특수 어태커가 필요합니다.");
      if (!hasTank) suggestions.push("🛡️ [탱커/막이 부재] 적의 에이스를 막아낼 튼튼한 포켓몬이 없습니다.");
    }

    if (warnings.length === 0 && team.length >= 3 && score >= 90) {
      suggestions.push("✨ 완벽에 가깝습니다! 밸런스가 매우 훌륭한 파티입니다.");
    }

    let grade = "S"; let color = "text-emerald-400";
    if (score < 90) { grade = "A"; color = "text-blue-400"; }
    if (score < 75) { grade = "B"; color = "text-amber-400"; }
    if (score < 60) { grade = "C"; color = "text-orange-400"; }
    if (score < 40) { grade = "F"; color = "text-red-500"; }

    return { grade, color, warnings, suggestions, score };
  };

  // 'splicer' 모드: 다중 타입 상성 계산
  useEffect(() => {
    if (mode !== 'splicer') return;
    if (selectedTypes.length === 0) {
      setMatchups(null);
      return;
    }
    const computeSplicer = async () => {
      setLoading(true); setError('');
      try {
        const typeDatas = [];
        const newCacheUpdates: Record<string, TypeData> = {};
        for (const t of selectedTypes) {
          if (typeCache[t]) {
            typeDatas.push(typeCache[t]);
          } else if (newCacheUpdates[t]) {
            typeDatas.push(newCacheUpdates[t]);
          } else {
            const res = await fetch(`https://pokeapi.co/api/v2/type/${t}`);
            const data: TypeData = await res.json();
            newCacheUpdates[t] = data;
            typeDatas.push(data);
          }
        }
        if (Object.keys(newCacheUpdates).length > 0) {
          setTypeCache(prev => ({ ...prev, ...newCacheUpdates }));
        }
        setMatchups(calculateMultipliers(typeDatas));
      } catch (err) {
        setError('상성 계산 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    computeSplicer();
  }, [selectedTypes, mode]); // typeCache를 의존성 배열에서 제거하여 리렌더링 폭주 및 무한루프 방지

  const toggleSplicerType = (typeKey: string) => {
    if (selectedTypes.includes(typeKey)) {
      setSelectedTypes(selectedTypes.filter(t => t !== typeKey));
    } else {
      if (selectedTypes.length >= 2) {
        setSelectedTypes([selectedTypes[1], typeKey]);
      } else {
        setSelectedTypes([...selectedTypes, typeKey]);
      }
    }
  };

  // 'type' 모드: 단일 타입 클릭 처리
  const handleSingleTypeSelect = async (typeKey: string) => {
    setSelectedSingleType(typeKey);
    setError('');

    if (!typeCache[typeKey]) {
      setLoading(true);
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${typeKey}`);
        const data: TypeData = await res.json();
        setTypeCache(prev => ({ ...prev, [typeKey]: data }));
      } catch (err) {
        setError('타입 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  // 바이옴 탐색 로직
  const getPreviousBiomes = (targetBiomeId: string) => Object.keys(BIOMES).filter(key => BIOMES[key].next.includes(targetBiomeId));

  const findShortestPath = (start: string, end: string) => {
    if (!start || !end || start === end) return null;
    const queue = [[start]];
    const visited = new Set([start]);
    while (queue.length > 0) {
      const path = queue.shift()!;
      const current = path[path.length - 1];
      const neighbors = BIOMES[current]?.next || [];
      for (const neighbor of neighbors) {
        if (neighbor === end) return [...path, neighbor];
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
    return null;
  };

  const renderEvolutionTreeHorizontal = (node: EvolutionNode, currentId: string | null): React.ReactNode => {
    const isCurrent = currentId === node.id;
    const highlight = isCurrent
      ? 'ring-4 ring-emerald-500 scale-110 bg-slate-700 z-10'
      : 'ring-1 ring-slate-600 opacity-60 hover:opacity-100 hover:scale-105 bg-slate-800 cursor-pointer';

    return (
      <div key={node.id} className="flex items-center gap-2 sm:gap-4">
        {/* 개별 포켓몬 구체 */}
        <div className="flex flex-col items-center">
          <div
            onClick={() => !isCurrent && executeSearch(node.korean_name)}
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all ${highlight}`}
            title={node.korean_name}
          >
            <img src={node.sprite} alt={node.name} className="w-10 h-10 sm:w-14 sm:h-14 object-contain rendering-pixelated" />
          </div>
          <span className={`text-[10px] sm:text-xs font-bold mt-1 ${isCurrent ? 'text-emerald-400' : 'text-slate-500'}`}>
            {node.korean_name}
          </span>
        </div>

        {/* 후속 진화 분기 컨테이너 */}
        {node.evolves_to && node.evolves_to.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-4">
            {/* 가로 화살표 */}
            <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
            {/* 이브이 같은 다중 분기일 경우 상하로 분기들을 쌓아 수평 연장 */}
            <div className="flex flex-col gap-3">
              {node.evolves_to.map(child => renderEvolutionTreeHorizontal(child, currentId))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTypeBadge = (type: string, onClick: ((type: string) => void) | null = null, isSelected = false) => {
    const info = TYPE_INFO[type];
    if (!info) return null;
    return (
      <button
        key={type}
        onClick={onClick ? () => onClick(type) : undefined}
        disabled={!onClick}
        className={`px-2 sm:px-3 py-1 text-[10px] sm:text-sm font-bold text-white rounded-full shadow-sm transition-all whitespace-nowrap
          ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}
          ${onClick && !isSelected && (selectedTypes.length > 0 || selectedSingleType) ? 'opacity-40 hover:opacity-100 grayscale' : ''}
          ${isSelected ? 'ring-2 sm:ring-4 ring-white ring-opacity-50 scale-110' : ''}
        `}
        style={{ backgroundColor: info.color }}
      >
        {info.name}
      </button>
    );
  };

  const renderMatchupGroup = (title: string, types: string[], bgClass: string, textClass: string) => {
    if (!types || types.length === 0) return null;
    return (
      <div className={`p-4 rounded-xl ${bgClass} border border-opacity-20 flex flex-col gap-2 h-auto`}>
        <h4 className={`font-black text-sm ${textClass} flex items-center gap-2`}>
          {title}
        </h4>
        <div className="flex flex-wrap gap-2 mt-1">
          {types.map(t => renderTypeBadge(t))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200 p-2 sm:p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto bg-slate-800 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border border-slate-700 w-full">

        {/* Header Section */}
        <div className="bg-slate-900 p-4 sm:p-6 flex flex-col gap-4 border-b border-slate-700">
          <div className="flex items-center gap-3 text-white mb-2">
            <div className="w-8 h-8 rounded-full border-4 border-white bg-red-500 shadow-inner flex items-center justify-center"></div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">포케로그 올인원 도우미</h1>
          </div>

          {/* Mode Selection Tabs (Scrollable on small screens) */}
          <div className="overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 sm:overflow-visible sm:pb-0">
            <div className="flex sm:grid sm:grid-cols-6 gap-2 bg-slate-950 rounded-xl p-1 shadow-inner min-w-max sm:min-w-0">
              <button onClick={() => { setMode('team'); setError(''); }} className={`flex items-center justify-center gap-1.5 py-2.5 px-4 sm:px-0 rounded-lg font-bold text-sm transition-all ${mode === 'team' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                <Users className="w-4 h-4" /> 내 파티
              </button>
              <button onClick={() => { setMode('type'); setError(''); }} className={`flex items-center justify-center gap-1.5 py-2.5 px-4 sm:px-0 rounded-lg font-bold text-sm transition-all ${mode === 'type' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                <Layers className="w-4 h-4" /> 타입
              </button>
              <button onClick={() => { setMode('search'); setError(''); }} className={`flex items-center justify-center gap-1.5 py-2.5 px-4 sm:px-0 rounded-lg font-bold text-sm transition-all ${mode === 'search' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                <BookOpen className="w-4 h-4" /> 도감
              </button>
              <button onClick={() => { setMode('splicer'); setError(''); setPokemon(null); }} className={`flex items-center justify-center gap-1.5 py-2.5 px-4 sm:px-0 rounded-lg font-bold text-sm transition-all ${mode === 'splicer' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                <Dna className="w-4 h-4" /> 쐐기
              </button>
              <button onClick={() => { setMode('item'); setError(''); }} className={`flex items-center justify-center gap-1.5 py-2.5 px-4 sm:px-0 rounded-lg font-bold text-sm transition-all ${mode === 'item' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                <Package className="w-4 h-4" /> 아이템
              </button>
              <button onClick={() => { setMode('biome'); setError(''); }} className={`flex items-center justify-center gap-1.5 py-2.5 px-4 sm:px-0 rounded-lg font-bold text-sm transition-all ${mode === 'biome' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                <Map className="w-4 h-4" /> 바이옴
              </button>
            </div>
          </div>

          {/* Mode Specific Inputs */}
          {mode === 'type' && (
            <div className="mt-2 p-3 sm:p-4 bg-slate-800 rounded-xl animate-in fade-in duration-200 border border-slate-700">
              <p className="text-slate-300 text-xs sm:text-sm font-medium mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400"/> 궁금한 속성을 클릭하여 <b>공격 및 방어 상성</b>을 확인하세요.
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {Object.keys(TYPE_INFO).map(typeKey => renderTypeBadge(typeKey, handleSingleTypeSelect, selectedSingleType === typeKey))}
              </div>
            </div>
          )}

          {mode === 'search' && (
            <form onSubmit={searchPokemon} className="relative w-full mt-2 animate-in fade-in duration-200">
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="포켓몬 이름 입력 (예: 이상해씨...)" disabled={mapLoading} className="w-full px-4 sm:px-5 py-3 pl-10 sm:pl-12 rounded-xl border-0 shadow-lg text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-slate-500 transition-all bg-slate-800 text-white" />
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
              <button type="submit" disabled={loading || mapLoading} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-slate-600 hover:bg-slate-500 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-sm sm:text-base font-bold transition-colors disabled:opacity-50">검색</button>
            </form>
          )}

          {mode === 'splicer' && (
            <div className="mt-2 p-3 sm:p-4 bg-slate-800 rounded-xl animate-in fade-in duration-200 border border-slate-700">
              <p className="text-slate-300 text-xs sm:text-sm font-medium mb-3 flex items-center gap-2">
                <Dna className="w-4 h-4 text-purple-400"/> 융합할 포켓몬의 <b>타입 2개</b>를 선택하세요.
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {Object.keys(TYPE_INFO).map(typeKey => renderTypeBadge(typeKey, toggleSplicerType, selectedTypes.includes(typeKey)))}
              </div>
            </div>
          )}

          {mode === 'item' && (
            <div className="relative w-full mt-2 animate-in fade-in duration-200">
              <input type="text" value={itemQuery} onChange={(e) => setItemQuery(e.target.value)} placeholder="아이템 이름, 열매, 효과 검색 (예: 꿀팁, 경험치, 풀죽음)" className="w-full px-4 sm:px-5 py-3 pl-10 sm:pl-12 rounded-xl border-0 shadow-lg text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-amber-500 transition-all bg-slate-800 text-white" />
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          )}

          {mode === 'biome' && (
            <div className="mt-2 p-3 sm:p-4 bg-emerald-950/40 rounded-xl animate-in fade-in duration-200 border border-emerald-800/30">
              <div className="flex flex-col gap-3">
                <p className="text-emerald-100 text-xs sm:text-sm font-medium flex items-center gap-2">
                  <Map className="w-4 h-4"/> 맵을 탐색하고 목표까지의 루트를 확인하세요.
                </p>
                <div className="flex flex-row items-center gap-2 sm:gap-3 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1">
                    <span className="text-xs sm:text-sm font-bold text-emerald-300 whitespace-nowrap">현재:</span>
                    <select value={currentBiome} onChange={(e) => setCurrentBiome(e.target.value)} className="w-full bg-emerald-900 text-white border border-emerald-700 rounded-lg px-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      {Object.entries(BIOMES).map(([key, data]) => (
                        <option key={key} value={key}>{data.name}</option>
                      ))}
                    </select>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1">
                    <span className="text-xs sm:text-sm font-bold text-amber-300 whitespace-nowrap">목표:</span>
                    <select value={targetBiome} onChange={(e) => setTargetBiome(e.target.value)} className="w-full bg-amber-900/50 text-white border border-amber-700/50 rounded-lg px-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                      <option value="">- 없음 -</option>
                      {Object.entries(BIOMES).map(([key, data]) => (
                        <option key={key} value={key}>{data.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Body Section */}
        <div className="p-4 sm:p-6 min-h-[400px]">

          {/* Status Indicators */}
          {error && (
            <div className="bg-red-950/50 text-red-400 p-3 sm:p-4 rounded-xl flex items-start gap-3 border border-red-800/50 mb-6">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" />
              <div><p className="font-bold text-sm sm:text-base">오류 발생</p><p className="text-xs sm:text-sm mt-1">{error}</p></div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-slate-500" />
              <p className="font-medium animate-pulse text-sm sm:text-base">데이터를 불러오는 중입니다...</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Team Mode Content */}
              {}
              {mode === 'team' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700">
                    <Users className="w-5 h-5 text-pink-400" />
                    <h2 className="text-lg sm:text-xl font-black text-white">내 파티 구성</h2>
                    <span className="ml-auto text-xs sm:text-sm font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-full">{team.length} / 6 마리</span>
                  </div>

                  {teamError && (
                    <div className="mb-4 text-xs sm:text-sm text-red-400 bg-red-950/30 p-2 sm:p-3 rounded-lg border border-red-900/50 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {teamError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 mb-8">
                    {Array.from({ length: 6 }).map((_, i) => {
                      const member = team[i];
                      if (member) {
                        return (
                          <div
                            key={i}
                            onClick={() => handleGoToEncyclopedia(member.korean_name)}
                            className="relative bg-slate-800/80 rounded-xl sm:rounded-2xl border border-slate-600 p-2 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 shadow-lg group cursor-pointer hover:border-pink-500/50 hover:bg-slate-800/90 transition-all"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // 카드 클릭(도감 이동)이 방생 시 방해받지 않게 처리
                                handleRemoveTeamMember(i);
                              }}
                              className="absolute top-1 sm:top-2 right-1 sm:right-2 p-1 sm:p-1.5 bg-slate-700 text-slate-400 hover:bg-red-500 hover:text-white rounded-full transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                              title="방생하기"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <img src={member?.sprites?.front_default || member?.sprites?.other?.['official-artwork']?.front_default || ''} alt={member.korean_name} className="w-12 h-12 sm:w-16 sm:h-16 rendering-pixelated" />
                            <h4 className="font-bold text-white text-xs sm:text-sm text-center">{member.korean_name}</h4>
                            <div className="flex flex-wrap justify-center gap-1">
                              {member.types.map(t => renderTypeBadge(t.type.name))}
                            </div>

                            {/* 파티원 개별 폼 변환 기능 제공 */}
                            {member.varieties && member.varieties.length > 1 && (
                              <div className="w-full mt-2" onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={member.name}
                                  onChange={(e) => handleTeamMemberFormChange(i, e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[10px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-pink-500"
                                >
                                  {member.varieties.map(v => (
                                    <option key={v.pokemon.name} value={v.pokemon.name}>
                                      {formatFormName(v.pokemon.name, Object.keys(korNameMap).find(key => korNameMap[key] === member.id.toString()) || member.name)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return (
                        <div key={i} className="bg-slate-900/50 rounded-xl sm:rounded-2xl border border-slate-700 border-dashed p-2 sm:p-4 flex flex-col items-center justify-center min-h-[100px] sm:min-h-[140px]">
                          {i === team.length ? (
                            <form onSubmit={handleAddTeamMember} className="w-full flex flex-col items-center gap-2">
                              <input type="text" value={teamSearchQuery} onChange={e => {setTeamSearchQuery(e.target.value); setTeamError('');}} placeholder="이름 (예: 꼬부기)" disabled={isTeamLoading || mapLoading} className="w-full bg-slate-950 text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-pink-500 transition-colors text-center" />
                              <button type="submit" disabled={isTeamLoading || mapLoading} className="w-full flex items-center justify-center gap-1 bg-pink-600/20 hover:bg-pink-600/40 text-pink-300 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold border border-pink-500/30 transition-colors disabled:opacity-50">
                                {isTeamLoading ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Plus className="w-3 h-3 sm:w-4 sm:h-4" />} 추가
                              </button>
                            </form>
                          ) : (
                            <span className="text-slate-600 text-xs sm:text-sm font-bold flex items-center justify-center h-full">비어있음</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {team.length > 0 && (() => {
                    const report = analyzeTeamOverall();
                    if (!report) return null;
                    return (
                      <div className="p-4 sm:p-6 bg-slate-800/80 rounded-2xl border border-slate-600 shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-4">
                          <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">📊 파티 종합 진단</h3>
                          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-700">
                            <span className="text-xs sm:text-sm font-bold text-slate-400">등급</span>
                            <span className={`text-xl sm:text-2xl font-black ${report.color}`}>{report.grade}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:gap-4">
                          {report.warnings.length > 0 && (
                            <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-3 sm:p-4">
                              <h4 className="text-red-400 font-bold flex items-center gap-2 mb-2 sm:mb-3 text-sm sm:text-base">
                                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" /> 경고 (수정 권장)
                              </h4>
                              <ul className="space-y-2">
                                {report.warnings.map((w, idx) => (
                                  <li key={idx} className="text-xs sm:text-sm text-red-200/90 leading-relaxed pl-2 border-l-2 border-red-500/50">{w}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3 sm:p-4">
                            <h4 className="text-emerald-400 font-bold flex items-center gap-2 mb-2 sm:mb-3 text-sm sm:text-base">
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> 조언 및 추천
                            </h4>
                            <ul className="space-y-2">
                              {report.suggestions.length > 0 ? report.suggestions.map((s, idx) => (
                                <li key={idx} className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed pl-2 border-l-2 border-emerald-500/50">{s}</li>
                              )) : (
                                <li className="text-xs sm:text-sm text-slate-400">정확한 분석을 위해 3마리 이상 채워주세요.</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Placeholders */}
              {mode === 'type' && !selectedSingleType && (
                <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-slate-500 text-center gap-4">
                  <Layers className="w-12 h-12 sm:w-16 sm:h-16 opacity-20" />
                  <p className="text-sm sm:text-lg">위에서 속성을 선택하여<br/>상세 상성을 확인하세요.</p>
                </div>
              )}
              {mode === 'search' && !matchups && (
                <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-slate-500 text-center gap-4">
                  <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 opacity-20" />
                  <p className="text-sm sm:text-lg">상단 검색창에 포켓몬 이름을 입력하세요.</p>
                </div>
              )}
              {mode === 'splicer' && !matchups && (
                <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-slate-500 text-center gap-4">
                  <Dna className="w-12 h-12 sm:w-16 sm:h-16 opacity-20" />
                  <p className="text-sm sm:text-lg">쐐기로 합쳐진 포켓몬의<br/>타입 1~2개를 위에서 선택하세요.</p>
                </div>
              )}

              {/* Type Mode Content */}
              {}
              {mode === 'type' && selectedSingleType && typeCache[selectedSingleType] && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 mb-4 p-3 bg-slate-900 border border-slate-700 rounded-lg justify-center shadow-inner">
                    <span className="text-xs sm:text-sm text-slate-400 font-bold">공격자 (때리는 쪽)</span>
                    <ArrowRight className="w-4 h-4 text-slate-500 mx-2" />
                    <span className="text-xs sm:text-sm text-slate-400 font-bold">방어자 (맞는 쪽)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-slate-800/50 p-3 sm:p-5 rounded-2xl border border-blue-900/50 flex flex-col">
                      <h3 className="text-lg sm:text-xl font-black text-blue-400 mb-3 sm:mb-4 pb-2 border-b border-blue-900/50 flex items-center justify-between">
                        <span>⚔️ 내가 공격할 때</span>
                        <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded">사용 기술: {TYPE_INFO[selectedSingleType].name}</span>
                      </h3>
                      <div className="space-y-2 sm:space-y-4 flex-1 flex flex-col">
                        <div className="flex-1 min-h-0 bg-blue-950/30 rounded-xl border border-blue-900/30 p-2 sm:p-4 flex flex-row items-center">
                          <div className="flex-shrink-0 mr-2 sm:mr-4">{renderTypeBadge(selectedSingleType)}</div>
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500/50 mr-2 sm:mr-4 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-blue-300 mb-1 sm:mb-2">효과 굉장함 (2배)</h4>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {typeCache[selectedSingleType].damage_relations.double_damage_to.length > 0
                                ? typeCache[selectedSingleType].damage_relations.double_damage_to.map(t=>renderTypeBadge(t.name))
                                : <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">해당 없음</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 min-h-0 bg-slate-800/80 rounded-xl border border-slate-700 p-2 sm:p-4 flex flex-row items-center">
                          <div className="flex-shrink-0 mr-2 sm:mr-4">{renderTypeBadge(selectedSingleType)}</div>
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500/50 mr-2 sm:mr-4 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-400 mb-1 sm:mb-2">효과 별로... (0.5배)</h4>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {typeCache[selectedSingleType].damage_relations.half_damage_to.length > 0
                                ? typeCache[selectedSingleType].damage_relations.half_damage_to.map(t=>renderTypeBadge(t.name))
                                : <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">해당 없음</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 min-h-0 bg-slate-950 rounded-xl border border-slate-800 p-2 sm:p-4 flex flex-row items-center">
                          <div className="flex-shrink-0 mr-2 sm:mr-4">{renderTypeBadge(selectedSingleType)}</div>
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 mr-2 sm:mr-4 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-500 mb-1 sm:mb-2">효과 없음 (0배)</h4>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {typeCache[selectedSingleType].damage_relations.no_damage_to.length > 0
                                ? typeCache[selectedSingleType].damage_relations.no_damage_to.map(t=>renderTypeBadge(t.name))
                                : <span className="text-xs text-slate-600 bg-slate-900 px-2 py-1 rounded">해당 없음</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800/50 p-3 sm:p-5 rounded-2xl border border-red-900/50 flex flex-col">
                      <h3 className="text-lg sm:text-xl font-black text-red-400 mb-3 sm:mb-4 pb-2 border-b border-red-900/50 flex items-center justify-between">
                        <span>🛡️ 내가 방어할 때</span>
                        <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded">내 포켓몬: {TYPE_INFO[selectedSingleType].name}</span>
                      </h3>
                      <div className="space-y-2 sm:space-y-4 flex-1 flex flex-col">
                         <div className="flex-1 min-h-0 bg-red-950/30 rounded-xl border border-red-900/30 p-2 sm:p-4 flex flex-row items-center">
                          <div className="flex-1 min-w-0 text-right">
                            <h4 className="text-xs sm:text-sm font-bold text-red-300 mb-1 sm:mb-2">약점 (2배로 맞음)</h4>
                            <div className="flex flex-wrap gap-1 sm:gap-2 justify-end">
                              {typeCache[selectedSingleType].damage_relations.double_damage_from.length > 0
                                ? typeCache[selectedSingleType].damage_relations.double_damage_from.map(t=>renderTypeBadge(t.name))
                                : <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">해당 없음</span>}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-red-500/50 ml-2 sm:ml-4 mr-2 sm:mr-4 flex-shrink-0" />
                          <div className="flex-shrink-0">{renderTypeBadge(selectedSingleType)}</div>
                        </div>
                        <div className="flex-1 min-h-0 bg-emerald-950/30 rounded-xl border border-emerald-900/30 p-2 sm:p-4 flex flex-row items-center">
                          <div className="flex-1 min-w-0 text-right">
                            <h4 className="text-xs sm:text-sm font-bold text-emerald-400 mb-1 sm:mb-2">반감 (0.5배로 맞음)</h4>
                            <div className="flex flex-wrap gap-1 sm:gap-2 justify-end">
                              {typeCache[selectedSingleType].damage_relations.half_damage_from.length > 0
                                ? typeCache[selectedSingleType].damage_relations.half_damage_from.map(t=>renderTypeBadge(t.name))
                                : <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">해당 없음</span>}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500/50 ml-2 sm:ml-4 mr-2 sm:mr-4 flex-shrink-0" />
                          <div className="flex-shrink-0">{renderTypeBadge(selectedSingleType)}</div>
                        </div>
                        <div className="flex-1 min-h-0 bg-slate-950 rounded-xl border border-slate-800 p-2 sm:p-4 flex flex-row items-center">
                          <div className="flex-1 min-w-0 text-right">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-500 mb-1 sm:mb-2">효과 없음 (무효)</h4>
                            <div className="flex flex-wrap gap-1 sm:gap-2 justify-end">
                              {typeCache[selectedSingleType].damage_relations.no_damage_from.length > 0
                                ? typeCache[selectedSingleType].damage_relations.no_damage_from.map(t=>renderTypeBadge(t.name))
                                : <span className="text-xs text-slate-600 bg-slate-900 px-2 py-1 rounded">해당 없음</span>}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 ml-2 sm:ml-4 mr-2 sm:mr-4 flex-shrink-0" />
                          <div className="flex-shrink-0">{renderTypeBadge(selectedSingleType)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Matchups Result */}
              {}
              {matchups && (mode === 'search' || mode === 'splicer') && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {mode === 'search' && pokemon && (
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8 p-4 sm:p-6 bg-slate-800/50 rounded-2xl border border-slate-700 relative">
                      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 text-xs font-bold text-slate-500">
                        BST: {pokemon?.stats?.reduce((a,b)=>a+b.base_stat,0)} ({getBSTLevel(pokemon?.stats?.reduce((a,b)=>a+b.base_stat,0)).grade}급)
                      </div>

                      <div className="relative flex-shrink-0">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-700 rounded-full flex items-center justify-center shadow-md border-4 border-slate-600">
                          <img src={pokemon?.sprites?.other?.['official-artwork']?.front_default || pokemon?.sprites?.front_default || ''} alt={pokemon.korean_name} className="w-20 h-20 sm:w-28 sm:h-28 object-contain" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 sm:-right-0 bg-slate-900 text-slate-300 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full border-2 border-slate-600">
                          No.{pokemon.id}
                        </div>
                      </div>

                      <div className="flex flex-col items-center sm:items-start text-center sm:text-left w-full flex-1">
                        <p className="text-slate-400 font-bold uppercase tracking-wider text-xs sm:text-sm mb-1">{pokemon.name}</p>

                        {/* 도감 한글명 옆에 파티에 즉시 추가 단추 배치 */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full justify-center sm:justify-start mb-2">
                          <h2 className="text-2xl sm:text-3xl font-black text-white">{pokemon.korean_name}</h2>
                          <button
                            onClick={() => handleAddCurrentToTeam(pokemon)}
                            disabled={justAdded}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 duration-150 shrink-0 self-center ${
                              justAdded
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/10'
                                : 'bg-pink-600 hover:bg-pink-500 text-white hover:shadow-pink-500/10'
                            }`}
                          >
                            {justAdded ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" /> 추가 완료!
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" /> 파티에 추가
                              </>
                            )}
                          </button>
                        </div>

                        {/* 폼 선택 드롭다운 */}
                        {pokemonVarieties.length > 1 && (
                          <div className="mb-3 w-full max-w-xs">
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">상세 폼 선택</label>
                            <div className="relative">
                              <select
                                value={selectedVariety}
                                onChange={(e) => handleVarietyChange(e.target.value)}
                                className="w-full bg-slate-900 text-xs text-white border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-500 appearance-none pr-8 cursor-pointer font-bold"
                              >
                                {pokemonVarieties.map(v => (
                                  <option key={v.pokemon.name} value={v.pokemon.name}>
                                    {formatFormName(v.pokemon.name, Object.keys(korNameMap).find(key => korNameMap[key] === pokemon.id.toString()) || pokemon.name)}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                          {pokemon.types.map(t => renderTypeBadge(t.type.name))}
                        </div>

                        {/* 스마트 태그 */}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 w-full justify-center sm:justify-start">
                          {(() => {
                            const tags = [];
                            const atk = pokemon.stats.find(s=>s.stat.name==='attack')?.base_stat || 0;
                            const spa = pokemon.stats.find(s=>s.stat.name==='special-attack')?.base_stat || 0;
                            const def = pokemon.stats.find(s=>s.stat.name==='defense')?.base_stat || 0;
                            const spd = pokemon.stats.find(s=>s.stat.name==='special-defense')?.base_stat || 0;
                            const speed = pokemon.stats.find(s=>s.stat.name==='speed')?.base_stat || 0;

                            if (atk >= 90 && atk >= spa * 1.2) tags.push(<span key="atk" className="px-2 py-0.5 bg-red-900/40 text-red-300 border border-red-700/50 rounded text-xs font-bold">💪 물리형</span>);
                            if (spa >= 90 && spa >= atk * 1.2) tags.push(<span key="spa" className="px-2 py-0.5 bg-blue-900/40 text-blue-300 border border-blue-700/50 rounded text-xs font-bold">🔮 특수형</span>);
                            if (atk >= 80 && spa >= 80 && Math.abs(atk-spa) < 20) tags.push(<span key="dual" className="px-2 py-0.5 bg-purple-900/40 text-purple-300 border border-purple-700/50 rounded text-xs font-bold">⚔️ 쌍두형</span>);
                            if (speed >= 100) tags.push(<span key="spd" className="px-2 py-0.5 bg-yellow-900/40 text-yellow-300 border border-yellow-700/50 rounded text-xs font-bold">⚡ 고스피드</span>);
                            if (def + spd >= 180) tags.push(<span key="tank" className="px-2 py-0.5 bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 rounded text-xs font-bold">🛡️ 단단한내구</span>);

                            return tags.length > 0 ? tags : <span className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded text-xs font-bold">밸런스형</span>;
                          })()}
                        </div>

                        {/* 미니 종족값 그래프 */}
                        <div className="w-full max-w-sm mt-auto bg-slate-900/50 p-2 sm:p-3 rounded-lg border border-slate-700">
                           <div className="flex items-center gap-1 sm:gap-2 mb-1.5">
                              <span className="w-8 sm:w-10 text-[9px] sm:text-[10px] font-bold text-slate-400 text-right">HP</span>
                              <div className="flex-1 h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{width: `${Math.min(100, (pokemon.stats.find(s=>s.stat.name==='hp')?.base_stat || 0) / 2.5)}%`}}></div></div>
                              <span className="w-6 sm:w-8 text-[9px] sm:text-[10px] font-bold text-slate-300">{pokemon.stats.find(s=>s.stat.name==='hp')?.base_stat || 0}</span>
                           </div>
                           <div className="flex gap-2 sm:gap-4">
                             <div className="flex-1 flex flex-col gap-1.5">
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <span className="w-8 sm:w-10 text-[9px] sm:text-[10px] font-bold text-slate-400 text-right">공격</span>
                                  <div className="flex-1 h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-red-500" style={{width: `${Math.min(100, (pokemon.stats.find(s=>s.stat.name==='attack')?.base_stat || 0) / 2.5)}%`}}></div></div>
                                  <span className="w-6 sm:w-8 text-[9px] sm:text-[10px] font-bold text-slate-300">{pokemon.stats.find(s=>s.stat.name==='attack')?.base_stat || 0}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <span className="w-8 sm:w-10 text-[9px] sm:text-[10px] font-bold text-slate-400 text-right">방어</span>
                                  <div className="flex-1 h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-orange-400" style={{width: `${Math.min(100, (pokemon.stats.find(s=>s.stat.name==='defense')?.base_stat || 0) / 2.5)}%`}}></div></div>
                                  <span className="w-6 sm:w-8 text-[9px] sm:text-[10px] font-bold text-slate-300">{pokemon.stats.find(s=>s.stat.name==='defense')?.base_stat || 0}</span>
                                </div>
                             </div>
                             <div className="flex-1 flex flex-col gap-1.5">
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <span className="w-8 sm:w-10 text-[9px] sm:text-[10px] font-bold text-slate-400 text-right">특공</span>
                                  <div className="flex-1 h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{width: `${Math.min(100, (pokemon.stats.find(s=>s.stat.name==='special-attack')?.base_stat || 0) / 2.5)}%`}}></div></div>
                                  <span className="w-6 sm:w-8 text-[9px] sm:text-[10px] font-bold text-slate-300">{pokemon.stats.find(s=>s.stat.name==='special-attack')?.base_stat || 0}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <span className="w-8 sm:w-10 text-[9px] sm:text-[10px] font-bold text-slate-400 text-right">특방</span>
                                  <div className="flex-1 h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-indigo-400" style={{width: `${Math.min(100, (pokemon.stats.find(s=>s.stat.name==='special-defense')?.base_stat || 0) / 2.5)}%`}}></div></div>
                                  <span className="w-6 sm:w-8 text-[9px] sm:text-[10px] font-bold text-slate-300">{pokemon.stats.find(s=>s.stat.name==='special-defense')?.base_stat || 0}</span>
                                </div>
                             </div>
                           </div>
                           <div className="flex items-center gap-1 sm:gap-2 mt-1.5">
                              <span className="w-8 sm:w-10 text-[9px] sm:text-[10px] font-bold text-slate-400 text-right">스피드</span>
                              <div className="flex-1 h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-pink-400" style={{width: `${Math.min(100, (pokemon.stats.find(s=>s.stat.name==='speed')?.base_stat || 0) / 2.5)}%`}}></div></div>
                              <span className="w-6 sm:w-8 text-[9px] sm:text-[10px] font-bold text-slate-300">{pokemon.stats.find(s=>s.stat.name==='speed')?.base_stat || 0}</span>
                           </div>

                           {/* 종족값 종합 게이지 */}
                           {(() => {
                             const totalBst = pokemon.stats.reduce((a,b)=>a+b.base_stat, 0);
                             const levelInfo = getBSTLevel(totalBst);
                             return (
                               <div className="mt-3 pt-2.5 border-t border-slate-700/60">
                                 <div className="flex justify-between text-[10px] font-bold mb-1">
                                   <span className="text-slate-400">종족값 총합 (BST)</span>
                                   <span className={levelInfo.color}>{totalBst} ({levelInfo.label})</span>
                                 </div>
                                 <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                   <div className={`h-full ${levelInfo.barColor}`} style={{ width: `${Math.min(100, (totalBst / 720) * 100)}%` }}></div>
                                 </div>
                               </div>
                             );
                           })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 포케로그 전용 특성, 패시브 및 추천 정보 표기 개선 */}
                  {mode === 'search' && pokemon && (
                    (() => {
                      const analysis = getRecommendedNatureAndTraits(pokemon.stats, pokemon.korean_name);
                      return (
                        <div className="mb-6 p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-3.5">
                          <h3 className="text-sm font-black text-slate-200 flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-400" />
                            포케로그 빌드 가이드 & 최적화 정보
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                              <span className="text-[10px] font-bold text-blue-400 block mb-0.5">추천 성격</span>
                              <span className="text-sm font-bold text-white block mb-1">{analysis.nature}</span>
                              <p className="text-[11px] text-slate-300 leading-relaxed">{analysis.reason}</p>
                            </div>
                            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] font-bold text-pink-400 block mb-0.5">포지션 역할군</span>
                                <span className="text-sm font-black text-white">{analysis.role}</span>
                              </div>
                              <div className="mt-2.5 pt-2 border-t border-slate-700/50">
                                <span className="text-[10px] font-bold text-yellow-500 block mb-0.5">전용 패시브 (Passive)</span>
                                <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">{analysis.passive}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                            <span className="text-[10px] font-bold text-emerald-400 block mb-1">인게임 핵심 활약 특성</span>
                            <div className="flex flex-wrap gap-2">
                              {analysis.traits.map((trait, idx) => (
                                <span key={idx} className="bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs font-bold">
                                  {trait}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  )}

                  {/* 진화 체인 가로 표시 개선 */}
                  {mode === 'search' && evolutionChain && (
                    evolutionChain.evolves_to && evolutionChain.evolves_to.length > 0 ? (
                      <div className="mb-6 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-x-auto">
                        <h4 className="text-xs font-bold text-slate-500 mb-4 text-center tracking-widest">EVOLUTION CHAIN</h4>
                        <div className="flex justify-center items-center py-2 min-w-max">
                          {renderEvolutionTreeHorizontal(evolutionChain, pokemon && pokemon.id.toString())}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6 py-2.5 px-4 bg-slate-800/20 rounded-xl border border-slate-700/50 flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-400">
                        <Info className="w-4 h-4 text-slate-500" />
                        <span>진화 단계가 없는 단일 포켓몬입니다.</span>
                      </div>
                    )
                  )}

                  {}
                  {mode === 'splicer' && (
                    <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-slate-700 flex flex-col items-center justify-center text-center">
                      <p className="text-slate-400 text-xs sm:text-sm mb-2">선택된 융합 속성</p>
                      <div className="flex gap-2 sm:gap-3 justify-center mb-2">
                        {selectedTypes.map(t => renderTypeBadge(t))}
                      </div>
                    </div>
                  )}

                  <h3 className="text-lg sm:text-xl font-black text-white mb-3 sm:mb-4 flex items-center gap-2">🛡️ 상대방 방어 상성</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="space-y-3 sm:space-y-4">
                      {renderMatchupGroup("치명적 약점 (4배)", matchups.defense['4x'], "bg-red-950/30 border-red-900/50", "text-red-400")}
                      {renderMatchupGroup("약점 (2배)", matchups.defense['2x'], "bg-orange-950/30 border-orange-900/50", "text-orange-400")}
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      {renderMatchupGroup("반감 (0.5배)", matchups.defense['0.5x'], "bg-emerald-950/30 border-emerald-900/50", "text-emerald-400")}
                      {renderMatchupGroup("매우 튼튼함 (0.25배)", matchups.defense['0.25x'], "bg-teal-950/30 border-teal-900/50", "text-teal-400")}
                      {renderMatchupGroup("효과 없음 (0배)", matchups.defense['0x'], "bg-slate-950 border-slate-700", "text-slate-300")}
                    </div>
                  </div>

                  {/* 요주의 공격 타입 경고 */}
                  {matchups.offense && matchups.offense.length > 0 && (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-5 bg-orange-950/20 rounded-xl border border-orange-900/30">
                      <h4 className="text-sm sm:text-base font-black text-orange-400 mb-2 flex items-center gap-2">
                        ⚠️ 요주의 타입 (내 포켓몬 교체 주의)
                      </h4>
                      <p className="text-xs sm:text-sm text-orange-200/70 mb-3 leading-relaxed">
                        상대가 <b>자속 공격(자신의 속성과 같은 타입의 기술)</b>을 사용할 경우, 아래 속성의 내 포켓몬은 <b>2배 이상</b>의 치명적인 피해를 입습니다.
                      </p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {matchups.offense.map(t => renderTypeBadge(t))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex items-start gap-2 sm:gap-3">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      <b>주의:</b> 적 포켓몬의 <span className="text-amber-400 font-bold">패시브 특성</span>에 따라 상성이 무효화될 수 있으니 인게임에서 확인하세요.
                    </p>
                  </div>

                  {/* 야생 포켓몬 도감 검색 시 영입 시너지 분석 리포트 */}
                  {mode === 'search' && pokemon && matchups && team.length > 0 && (() => {
                    const synergy = analyzeSynergy(pokemon, matchups);
                    if (!synergy) return null;
                    return (
                      <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-slate-800/90 rounded-2xl border border-pink-500/30 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-pink-500"></div>
                        <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 mb-4">
                          🤔 이 녀석, 잡을까 말까? (파티 영입 시너지)
                        </h3>
                        <div className="flex items-center gap-3 mb-4 bg-slate-900/50 p-3 rounded-xl w-fit border border-slate-700">
                           <span className="text-sm text-slate-400 font-bold">AI 추천도</span>
                           <span className={`text-xl font-black ${synergy.color}`}>{synergy.grade}</span>
                        </div>
                        <div className="flex flex-col gap-3">
                          {synergy.pros.length > 0 && (
                            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-3 sm:p-4">
                              <h4 className="text-emerald-400 text-sm font-bold flex items-center gap-1.5 mb-2"><Plus className="w-4 h-4"/> 긍정적 요인</h4>
                              <ul className="space-y-1">
                                {synergy.pros.map((p, i) => <li key={i} className="text-xs sm:text-sm text-emerald-100/90 pl-2 border-l-2 border-emerald-500/50">{p}</li>)}
                              </ul>
                            </div>
                          )}
                          {synergy.cons.length > 0 && (
                            <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-3 sm:p-4">
                              <h4 className="text-red-400 text-sm font-bold flex items-center gap-1.5 mb-2"><AlertCircle className="w-4 h-4"/> 부정적 요인</h4>
                              <ul className="space-y-1">
                                {synergy.cons.map((c, i) => <li key={i} className="text-xs sm:text-sm text-red-100/90 pl-2 border-l-2 border-red-500/50">{c}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                </div>
              )}

              {/* Item Mode Content */}
              {}
              {mode === 'item' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {Object.entries(ITEMS_DB)
                      .filter(([_, item]) => {
                        if (!itemQuery) return true;
                        const q = itemQuery.toLowerCase();
                        return (
                          item.name.includes(q) ||
                          item.desc.includes(q) ||
                          item.tier.includes(q) ||
                          (item.tip && item.tip.includes(q)) ||
                          (item.useCase && item.useCase.includes(q))
                        );
                      })
                      .map(([key, item]) => {
                        const isOpen = activeItem === key;
                        return (
                          <div
                            key={key}
                            onClick={() => setActiveItem(isOpen ? null : key)}
                            className={`flex flex-col p-3 sm:p-4 bg-slate-800 rounded-xl border transition-all cursor-pointer select-none duration-300 ${
                              isOpen ? 'border-amber-500/80 shadow-lg shadow-amber-500/10' : 'border-slate-700 hover:border-slate-500'
                            }`}
                          >
                            <div className="flex gap-3 sm:gap-4 w-full">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-slate-900 rounded-lg flex items-center justify-center p-1.5 sm:p-2 border border-slate-600">
                                <img
                                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.sprite}.png`}
                                  alt={item.name}
                                  className="w-full h-full object-contain drop-shadow-md rendering-pixelated"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="font-extrabold text-white text-sm sm:text-base leading-tight">{item.name}</h4>
                                  <span className={`text-[9px] sm:text-xs px-1.5 py-0.5 rounded font-bold ${
                                    item.tier === '마스터' ? 'bg-purple-900/50 text-purple-300 border border-purple-700' :
                                    item.tier === '로그' ? 'bg-red-900/50 text-red-300 border border-red-700' :
                                    item.tier === '슈퍼' ? 'bg-blue-900/50 text-blue-300 border border-blue-700' :
                                    'bg-slate-700/50 text-slate-300 border border-slate-600'
                                  }`}>{item.tier}</span>
                                </div>
                                <p className="text-[10px] sm:text-xs text-slate-300 leading-snug">{item.desc}</p>
                              </div>
                            </div>

                            {/* Expandable detailed PokeRogue specific guide with anims */}
                            {isOpen && (
                              <div className="mt-3 pt-3 border-t border-slate-700/60 text-xs sm:text-sm space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="bg-slate-900/40 p-2 sm:p-3 rounded-lg border border-slate-700/40">
                                  <span className="font-extrabold text-amber-400 block mb-1">💡 포케로그 활용 꿀팁</span>
                                  <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">{item.tip}</p>
                                </div>
                                <div className="bg-slate-950/40 p-2 sm:p-3 rounded-lg border border-slate-800/40">
                                  <span className="font-extrabold text-emerald-400 block mb-1">🎯 추천 사용처 및 조합</span>
                                  <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">{item.useCase}</p>
                                </div>
                              </div>
                            )}

                            {!isOpen && (
                              <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-end w-full gap-1">
                                <span>상세 가이드 펼치기</span>
                                <ArrowRight className="w-2.5 h-2.5 rotate-90" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                  {Object.entries(ITEMS_DB).filter(([_, item]) => {
                    if (!itemQuery) return true;
                    const q = itemQuery.toLowerCase();
                    return (
                      item.name.includes(q) ||
                      item.desc.includes(q) ||
                      item.tier.includes(q) ||
                      (item.tip && item.tip.includes(q)) ||
                      (item.useCase && item.useCase.includes(q))
                    );
                  }).length === 0 && (
                    <div className="text-center text-slate-500 py-10 text-sm sm:text-base">검색 결과가 없습니다.</div>
                  )}
                </div>
              )}

              {/* Biome Mode Content */}
              {}
              {mode === 'biome' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4 sm:space-y-6">
                  {targetBiome && targetBiome !== currentBiome && (
                    <div className="p-3 sm:p-4 bg-slate-800/80 rounded-2xl border border-amber-500/30 shadow-lg">
                      <h4 className="text-amber-400 font-bold text-xs sm:text-sm mb-2 sm:mb-3 flex items-center gap-2">
                        <Map className="w-3 h-3 sm:w-4 sm:h-4" />
                        최단 루트 가이드
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        {findShortestPath(currentBiome, targetBiome)?.map((step, index, array) => (
                          <React.Fragment key={index}>
                            <div className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-sm font-bold shadow-sm ${
                              index === 0 ? 'bg-emerald-900 text-emerald-300 border border-emerald-700' :
                              index === array.length - 1 ? 'bg-amber-900 text-amber-300 border border-amber-700 scale-105' :
                              'bg-slate-700 text-slate-300 border border-slate-600'
                            }`}>
                              {BIOMES[step].name}
                            </div>
                            {index < array.length - 1 && (
                              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
                            )}
                          </React.Fragment>
                        )) || <span className="text-slate-400 text-xs sm:text-sm">경로가 없습니다.</span>}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row items-center md:items-stretch justify-center gap-3 sm:gap-4 w-full bg-slate-900/50 p-3 sm:p-4 rounded-2xl border border-slate-700">
                    <div className="flex flex-col gap-2 w-full md:w-1/3 order-1">
                      <h4 className="text-center font-bold text-slate-500 text-xs sm:text-sm mb-1 tracking-wider">이전 지역</h4>
                      {getPreviousBiomes(currentBiome).length > 0 ? (
                        getPreviousBiomes(currentBiome).map(prevKey => (
                          <button key={prevKey} onClick={() => setCurrentBiome(prevKey)} className="p-2 sm:p-3 bg-slate-800 border border-slate-600 rounded-xl shadow-sm text-center font-bold text-slate-300 hover:border-emerald-500 hover:bg-emerald-900/30 transition-all flex items-center justify-between group text-xs sm:text-base">
                            <span>{BIOMES[prevKey].name}</span>
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 group-hover:text-emerald-400" />
                          </button>
                        ))
                      ) : (
                        <div className="p-2 sm:p-3 bg-slate-800/50 rounded-xl text-center text-slate-500 text-xs sm:text-sm border border-slate-700 border-dashed">시작 지점</div>
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-center w-full md:w-1/3 p-4 sm:p-6 bg-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl shadow-lg order-2 my-2 md:my-0 scale-100 sm:scale-105 z-10 relative overflow-hidden">
                      <Map className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 mb-2 opacity-80" />
                      <p className="text-[10px] sm:text-xs font-black text-emerald-500 tracking-widest mb-1">현재 위치</p>
                      <h3 className="text-xl sm:text-2xl font-black text-white mb-3 sm:mb-4">{BIOMES[currentBiome].name}</h3>
                      <div className="w-full h-px bg-emerald-800/50 mb-3 sm:mb-4"></div>
                      <p className="text-[10px] sm:text-xs font-bold text-slate-400 mb-2">등장 포켓몬</p>
                      <div className="flex flex-wrap justify-center gap-1 sm:gap-1.5">
                        {BIOMES[currentBiome].type.map(t => renderTypeBadge(t))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-1/3 order-3">
                      <h4 className="text-center font-bold text-slate-500 text-xs sm:text-sm mb-1 tracking-wider">다음 지역</h4>
                      {BIOMES[currentBiome].next.map(nextKey => (
                        <button key={nextKey} onClick={() => setCurrentBiome(nextKey)} className="p-2 sm:p-3 bg-slate-800 border border-slate-600 rounded-xl shadow-sm text-center font-bold text-slate-300 hover:border-emerald-500 hover:bg-emerald-900/30 transition-all flex items-center justify-between group text-xs sm:text-base">
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 group-hover:text-emerald-400" />
                          <span>{BIOMES[nextKey].name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Replace Party Member Overlay Modal */}
      {}
      {replaceModalOpen && pendingPokemon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg sm:text-xl font-black text-white mb-2 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-pink-500 animate-spin" />
              대체할 파티원 선택
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-4 leading-relaxed">
              현재 파티가 가득 차 있습니다. 새로 추가한 <span className="text-pink-400 font-bold">[{pendingPokemon.korean_name}]</span>과(와) 교체할 멤버를 1명 골라주세요.
            </p>

            <div className="space-y-2 mb-6">
              {team.map((member, idx) => (
                <button
                  key={idx}
                  onClick={() => handleReplaceTeamMember(idx)}
                  className="w-full flex items-center gap-3 p-2.5 sm:p-3 bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700/60 rounded-xl text-left transition-colors font-bold group"
                >
                  <img src={member?.sprites?.front_default || ''} alt={member.korean_name} className="w-10 h-10 object-contain rendering-pixelated" />
                  <div className="flex-1 min-w-0">
                    <span className="text-white text-xs sm:text-sm block">{member.korean_name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">BST: {member.stats.reduce((a,b)=>a+b.base_stat,0)}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-pink-500 transition-colors" />
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setReplaceModalOpen(false);
                  setPendingPokemon(null);
                }}
                className="flex-1 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs sm:text-sm font-bold transition-colors"
              >
                영입 취소
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
