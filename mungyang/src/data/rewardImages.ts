import type { LearningUnit } from './curriculum';
import type { RewardRarity } from './rewards';

const BASE = '/gacha/items/generated-v2/';

const IMAGE_POOLS: Record<RewardRarity, Record<string, string[]>> = {
  basic: {
    service: [
      'basic-service-10f0-14v8-zix-13ic.webp',
      'basic-service-1168-128x-108s-119k.webp',
      'basic-service-11bp-1224-14s4-zq4.webp',
      'basic-service-1260-158h-14yc-13eg.webp',
    ],
    ticket: [
      'basic-ticket-123h-125c-13ec-10n8-14s4-zq4.webp',
      'basic-ticket-12gp-14bs-ya4.webp',
      'basic-ticket-13ip-12c8-118o-16bc-15y4.webp',
      'basic-ticket-1599-12ho-12gp-14bs-14s4-zq4.webp',
    ],
    food: [
      'basic-food-122k-xz5-yf4-115x.webp',
      'basic-food-13ip-12ho-15eo-1568.webp',
      'basic-food-y4k-108w-14i0-115x.webp',
    ],
    safety: [
      'basic-safety-10p4-12g4-1564.webp',
      'basic-safety-zic-139c-1384-14fh-14s4-zq4.webp',
    ],
    shopping: [
      'basic-shopping-12bg-164x-1169.webp',
      'basic-shopping-xz4-y3t-15y4-1598-yd4.webp',
    ],
    stay: [
      'basic-stay-10jc-157o.webp',
      'basic-stay-1354-14f0-12c8-y2c.webp',
    ],
    drink: [
      'basic-drink-10zg-14vp.webp',
      'basic-drink-zix-13ic-15eo-1568.webp',
    ],
  },
  bronze: {
    service: [
      'bronze-service-10vd-13i9-13uo-10t0-10vc.webp',
      'bronze-service-132s-16c4-11c9-15ik.webp',
      'bronze-service-y28-10oc-15y4-13uo-15ow.webp',
      'bronze-service-y5k-10vd-12yw-ywk-15y4-13uo.webp',
      'bronze-service-y8g-16c8-12hs-14fh-1258.webp',
    ],
    ticket: [
      'bronze-ticket-10f0-14v8-133o-12ao.webp',
      'bronze-ticket-130c-158g-13ec-1528-15v4.webp',
      'bronze-ticket-162s-10og-15mg-1348-130d-118o-16bc.webp',
      'bronze-ticket-1630-10a3-15vg-12yw-ywk-15y4.webp',
      'bronze-ticket-zg0-13ec-15bk-1630-109o-14s4-zq4.webp',
    ],
    food: [
      'bronze-food-10co-13ek-14i0-115x.webp',
      'bronze-food-12ys-13uo-14i0-115x.webp',
      'bronze-food-14c8-14rc-14i0-115x.webp',
      'bronze-food-1564-10os-15os-12g4-158g.webp',
      'bronze-food-165n-12g4-ywl.webp',
    ],
    safety: [
      'bronze-safety-10vd-14t0-zro.webp',
      'bronze-safety-13tp-122p-10t0-10vc.webp',
    ],
    shopping: [
      'bronze-shopping-10pw-13fp-1528-15v4-11fl.webp',
      'bronze-shopping-13v4-13it-10oc-15os-138w-14rc.webp',
    ],
    stay: [
      'bronze-stay-122w-xzx-12hw-157o.webp',
      'bronze-stay-1260-13j0-14td-12fk.webp',
    ],
    drink: ['bronze-drink-108s-zwc.webp', 'bronze-drink-z21-14bs-14t0.webp'],
  },
  silver: {
    service: [
      'silver-service-10tw-1260-1258-10m0.webp',
      'silver-service-12c8-1654-10zg-1598-yd4.webp',
      'silver-service-14lw-14f0-10iw-15mg-14s4-zq4.webp',
    ],
    ticket: [
      'silver-ticket-13lc-12hp-ya4.webp',
      'silver-ticket-1599-12ho-1341-12c8-13tp.webp',
      'silver-ticket-164c-15ol-15o0-14wj.webp',
    ],
    food: [
      'silver-food-114o-128c-118k-15bk-108s-10t4.webp',
      'silver-food-130c-157o-15eo-10oc.webp',
      'silver-food-14lw-14f0-1260-15mg.webp',
    ],
    safety: [
      'silver-safety-122p-11l0-130d.webp',
      'silver-safety-13us-10i4-14s4-zq4.webp',
    ],
    shopping: [
      'silver-shopping-15v0-13fp-135w-14mh-13fw.webp',
      'silver-shopping-yeo-162s-15mg-14s4-zq4.webp',
    ],
    stay: ['silver-service-y2c-13lc-yeo-15eo-1568.webp'],
    drink: ['silver-drink-10pc-14bs-108s-zwc.webp', 'silver-drink-165n-14v8-164c-118k-15mk.webp'],
  },
  gold: {
    service: [
      'gold-service-11bo-168o-135h-126w-1258-10m0.webp',
      'gold-service-13ed-13ek-1168-128x-115h-12g4.webp',
      'gold-service-y5c-xzx-1264-15bk-115g-138w-14ew.webp',
    ],
    ticket: [
      'gold-ticket-10tw-1260-1341-12c8-13tp.webp',
      'gold-ticket-13uo-133h-15pk-12g4-1528-15v4.webp',
      'gold-ticket-1658-13it-13d8-10i4-1528-15v4.webp',
    ],
    food: [
      'gold-food-1224-12ho-114o-10vc-zmo.webp',
      'gold-food-127k-162s-1630-10co-13ec-15mg.webp',
      'gold-food-zig-14yc-14ps-14bs-12fc-108s-10t4.webp',
    ],
    safety: [
      'gold-safety-130d-1224-14lw-14f0-1260-15mg.webp',
      'gold-safety-13es-12ho-16c5-13eg-13tp.webp',
    ],
    shopping: [
      'gold-shopping-1268-10cp-15mg-13fw-1587.webp',
      'gold-shopping-yeo-162s-15mg-15v0-13fp-10oc-11bs.webp',
    ],
    stay: [
      'gold-stay-12g4-13b8-15mg-157o.webp',
      'gold-stay-z20-14f0-xzx-12hw-14s4-zq4.webp',
    ],
    drink: ['gold-drink-12g4-15so-1270-11jo-10cs-zq4.webp'],
  },
  diamond: {
    service: [
      'diamond-service-14m4-ydk-16c5-13eg-11c9-15ik.webp',
      'diamond-service-y99-13j0-1168-128x-157o-15mg.webp',
    ],
    ticket: [
      'diamond-ticket-10sg-15o0-162s-10og-15mg-13ec-138p-15y4.webp',
      'diamond-ticket-13uo-133h-118k-12g4-15pk-12g4.webp',
      'diamond-ticket-y5x-165p-15mh-ydl-12gp-14bs-ya4.webp',
    ],
    food: [
      'diamond-food-127k-162s-12g4-15so-1270-15os-12g4-158g.webp',
      'diamond-food-1350-10p4-14s4-1260-14yc-12g4.webp',
      'diamond-food-zcw-131w-1630-10co-13ec-15mg.webp',
    ],
    safety: [
      'diamond-safety-11fo-12hw-10zg-13ip-12c8-13tp.webp',
      'diamond-safety-1350-1528-12g4-10oc-12c8-14fd.webp',
    ],
    shopping: [
      'diamond-shopping-15rw-12g4-yz4-14yc-zro-1260-15mg.webp',
      'diamond-shopping-1658-13it-15ow-14yc-zro.webp',
    ],
    stay: [
      'diamond-stay-10i4-14s8-xzx-12hw-12yw-ywk-13fp.webp',
      'diamond-stay-14vc-12ho-131w-13uo-15pk-12g4.webp',
    ],
    drink: ['diamond-drink-115g-10oc-12g4-158g-12ho-yd4-zbc-14ew.webp'],
  },
  xur: {
    service: [
      'xur-service-15mh-122p-14m4-ydk-16c5-13eg-11c9-15ik.webp',
      'xur-service-15mh-122p-y99-13j0-1168-128x-157o-15mg.webp',
    ],
    ticket: [
      'xur-ticket-15mh-122p-10sg-15o0-162s-10og-15mg-13ec-138p-15y4.webp',
      'xur-ticket-15mh-122p-13uo-133h-118k-12g4-15pk-12g4.webp',
    ],
    food: [
      'xur-food-15mh-122p-1350-10p4-14s4-1260-14yc-12g4.webp',
      'xur-food-15mh-122p-zcw-131w-1630-10co-13ec-15mg.webp',
    ],
    safety: [
      'xur-safety-15mh-122p-11fo-12hw-10zg-13ip-12c8-13tp.webp',
      'xur-safety-15mh-122p-1350-1528-12g4-10oc-12c8-14fd.webp',
    ],
    shopping: [
      'xur-shopping-15mh-122p-15rw-12g4-yz4-14yc-zro-1260-15mg.webp',
      'xur-shopping-15mh-122p-1658-13it-15ow-14yc-zro.webp',
    ],
    stay: [
      'xur-stay-15mh-122p-10i4-14s8-xzx-12hw-12yw-ywk-13fp.webp',
      'xur-stay-15mh-122p-14vc-12ho-131w-13uo-15pk-12g4.webp',
    ],
    drink: ['xur-drink-15mh-122p-115g-10oc-12g4-158g-12ho-yd4-zbc-14ew.webp'],
  },
};

const DOMAIN_BY_UNIT: Record<string, string> = {
  P1: 'service',
  P2: 'ticket',
  P3: 'service',
  P4: 'service',
  P5: 'ticket',
  P6: 'shopping',
  P7: 'service',
  P8: 'food',
  P9: 'safety',
  P10: 'safety',
  P11: 'service',
  P12: 'service',
  P13: 'service',
  S1: 'service',
  S2: 'service',
  S3: 'ticket',
  S4: 'shopping',
  S5: 'stay',
  S6: 'safety',
  S7: 'ticket',
  S8: 'ticket',
  S9: 'ticket',
  S10: 'ticket',
  S11: 'ticket',
  S12: 'ticket',
  S13: 'ticket',
  S14: 'stay',
  S15: 'stay',
  S16: 'stay',
  S17: 'stay',
  S18: 'food',
  S19: 'food',
  S20: 'food',
  S21: 'food',
  S22: 'shopping',
  S23: 'food',
  S24: 'ticket',
  S25: 'ticket',
  S26: 'ticket',
  S27: 'shopping',
  S28: 'shopping',
  S29: 'shopping',
  S30: 'ticket',
  S31: 'service',
  S32: 'stay',
  S33: 'ticket',
  S34: 'service',
  S35: 'safety',
  S36: 'safety',
  S37: 'safety',
  S38: 'safety',
  S39: 'ticket',
  S40: 'safety',
  S41: 'ticket',
  S42: 'ticket',
  S43: 'ticket',
  J1: 'ticket',
  J2: 'food',
  J3: 'stay',
  J4: 'safety',
  J5: 'ticket',
};

const UNIT_IDS = [
  ...Array.from({ length: 13 }, (_, index) => `P${index + 1}`),
  ...Array.from({ length: 43 }, (_, index) => `S${index + 1}`),
  ...Array.from({ length: 5 }, (_, index) => `J${index + 1}`),
];

function rarityForUnitId(unitId: string): RewardRarity {
  if (unitId.startsWith('J')) return 'xur';
  const n = Number(unitId.slice(1));
  if (unitId.startsWith('P')) {
    if (n >= 11) return 'silver';
    if (n >= 7) return 'bronze';
    return 'basic';
  }
  if (n >= 41) return 'diamond';
  if (n >= 34) return 'gold';
  if (n >= 24) return 'silver';
  if (n >= 7) return 'bronze';
  return 'basic';
}

function buildUnitImageMap(): Record<string, string> {
  const usedByRarity: Record<RewardRarity, Set<string>> = {
    basic: new Set(),
    bronze: new Set(),
    silver: new Set(),
    gold: new Set(),
    diamond: new Set(),
    xur: new Set(),
  };
  const result: Record<string, string> = {};

  for (const unitId of UNIT_IDS) {
    const rarity = rarityForUnitId(unitId);
    const domain = DOMAIN_BY_UNIT[unitId] ?? 'service';
    const pools = IMAGE_POOLS[rarity];
    const domainPool = pools[domain] ?? pools.service;
    const flatPool = Object.values(pools).flat();
    const used = usedByRarity[rarity];
    const picked = domainPool.find((file) => !used.has(file)) ?? flatPool.find((file) => !used.has(file)) ?? flatPool[0];
    used.add(picked);
    result[unitId] = picked;
  }

  return result;
}

const UNIT_IMAGE_BY_ID = buildUnitImageMap();

export function rewardImageForUnit(unit: LearningUnit, rarity: RewardRarity): string {
  return `${BASE}${UNIT_IMAGE_BY_ID[unit.id] ?? IMAGE_POOLS[rarity].service[0]}`;
}

export function selectedRewardImageFiles(): string[] {
  return Array.from(new Set(Object.values(IMAGE_POOLS).flatMap((domains) => Object.values(domains).flat())));
}
