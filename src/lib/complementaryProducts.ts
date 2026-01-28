/**
 * Complementary Products Mapping
 * 
 * Maps product IDs to arrays of complementary product IDs
 * Used by the Upsell modal to suggest related items
 * 
 * Logic:
 * - Teddy Bears → Flowers, Candles, Chocolate
 * - Flowers → Teddy Bears, Framed Photo, Candles  
 * - Perfumes → Gift Sets, Jewelry
 * - Money Bouquets → Teddy Bears, Flowers
 * - Cakes → Flowers, Teddy Bears, Candles
 * - Personalized Items → Flowers, Candles
 */

// Product ID references (from test.products.json)
const PRODUCT_IDS = {
  // Teddy Bears
  TEDDY_25CM: '69715614b42b07874767e9b9',
  TEDDY_35CM: '69715615b42b07874767e9bc',
  TEDDY_60CM: '69715618b42b07874767e9bf',
  TEDDY_MEDIUM: '6971561bb42b07874767e9c8',
  TEDDY_LOVE_HEART: '6971561ab42b07874767e9c5',
  TEDDY_120CM: '6971560fb42b07874767e9b0',
  TEDDY_160CM: '69715611b42b07874767e9b3',
  TEDDY_200CM: '69715613b42b07874767e9b6',
  
  // Flowers
  FRESH_ROSES: '69765e3b2b7787e55975e7d8',
  FAUX_FLOWER: '69723aea53bf522c9aef2e92',
  SCENTED_FAUX: '69765da02b7787e55975e7ba',
  
  // Candles
  SCENTED_CANDLES: '69723b55bee2dbe3153d5241',
  HEART_CANDLE: '6978a10a2b9d7f1eaebe5413',
  
  // Personalized
  FRAMED_PHOTO: '69765e3a2b7787e55975e7d5',
  CUSTOMIZED_JOURNAL: '69723ae853bf522c9aef2e8c',
  CUSTOMIZED_NEWSPAPER: '69765db82b7787e55975e7cf',
  PHOTO_BOUQUET: '69765d9c2b7787e55975e7b7',
  CUSTOMIZED_JERSEY: '69765d7f2b7787e55975e7ae',
  
  // Money Bouquets
  MONEY_BOUQUET: '69723aed53bf522c9aef2e98',
  BIG_BOYZ_MONEY: '69723ae753bf522c9aef2e89',
  DOLLAR_BOUQUET: '69723ae953bf522c9aef2e8f',
  MONEY_TOWER: '69765e3d2b7787e55975e7db',
  
  // Perfumes
  VSA_PERFUME_3IN1: '69723ad653bf522c9aef2e5e',
  RED_DIAMOND: '6979f59a2e097364f58fc568',
  PERFUME_4IN1: '6979f59d2e097364f58fc56b',
  AVENTOS_BLUE: '6979f59e2e097364f58fc56e',
  
  // Gift Sets & Gadgets
  CHELSEA_MEN_SET: '69723ad753bf522c9aef2e64',
  SMART_WATCH: '69723ad653bf522c9aef2e61',
  LAPTOP_BAG: '69723ad553bf522c9aef2e5b',
  HAIR_DRYER: '69723ad453bf522c9aef2e56',
  STANLEY_CUP: '69723ae153bf522c9aef2e80',
  
  // Jewelry
  CUBAN_BRACELET: '69723ad953bf522c9aef2e6c',
  ROLEX_BRACELET: '69723ade53bf522c9aef2e78',
  LABUBU_KEYCHAIN: '69715618b42b07874767e9c2',
  
  // Food & Cake
  CHOCOLATE_TREAT: '69723b54bee2dbe3153d523e',
  CUPID_CAKE: '69765da22b7787e55975e7bd',
  CAKE_6IN1: '69765d5c2b7787e55975e7a8',
  
  // Room Decor
  ROOM_DECOR_150K: '69765d3f2b7787e55975e79f',
  ROOM_DECOR_200K: '69765d502b7787e55975e7a2',
};

export const COMPLEMENTARY_PRODUCTS: Record<string, string[]> = {
  // === TEDDY BEARS ===
  // 25cm teddy → Candles, Fresh roses, Faux flower
  [PRODUCT_IDS.TEDDY_25CM]: [
    PRODUCT_IDS.SCENTED_CANDLES,
    PRODUCT_IDS.FRESH_ROSES,
    PRODUCT_IDS.FAUX_FLOWER,
  ],
  
  // Medium teddy → Fresh roses, Candles, Framed photo
  [PRODUCT_IDS.TEDDY_MEDIUM]: [
    PRODUCT_IDS.FRESH_ROSES,
    PRODUCT_IDS.SCENTED_CANDLES,
    PRODUCT_IDS.FRAMED_PHOTO,
  ],
  
  // Love heart teddy → Fresh roses, Photo bouquet, Candles
  [PRODUCT_IDS.TEDDY_LOVE_HEART]: [
    PRODUCT_IDS.FRESH_ROSES,
    PRODUCT_IDS.PHOTO_BOUQUET,
    PRODUCT_IDS.SCENTED_CANDLES,
  ],
  
  // Large teddy (120cm+) → Faux flower, Framed photo, Chocolate
  [PRODUCT_IDS.TEDDY_120CM]: [
    PRODUCT_IDS.FAUX_FLOWER,
    PRODUCT_IDS.FRAMED_PHOTO,
    PRODUCT_IDS.CHOCOLATE_TREAT,
  ],
  
  // 60cm teddy → Candles, Fresh roses, Stanley cup
  [PRODUCT_IDS.TEDDY_60CM]: [
    PRODUCT_IDS.SCENTED_CANDLES,
    PRODUCT_IDS.FRESH_ROSES,
    PRODUCT_IDS.STANLEY_CUP,
  ],
  
  // === FLOWERS ===
  // Fresh roses → Small teddy, Candles, Framed photo
  [PRODUCT_IDS.FRESH_ROSES]: [
    PRODUCT_IDS.TEDDY_25CM,
    PRODUCT_IDS.SCENTED_CANDLES,
    PRODUCT_IDS.FRAMED_PHOTO,
  ],
  
  // Faux flower → Medium teddy, Candles, Journal
  [PRODUCT_IDS.FAUX_FLOWER]: [
    PRODUCT_IDS.TEDDY_MEDIUM,
    PRODUCT_IDS.SCENTED_CANDLES,
    PRODUCT_IDS.CUSTOMIZED_JOURNAL,
  ],
  
  // === CANDLES ===
  // Scented candles → Faux flower, Fresh roses, Stanley cup
  [PRODUCT_IDS.SCENTED_CANDLES]: [
    PRODUCT_IDS.FAUX_FLOWER,
    PRODUCT_IDS.FRESH_ROSES,
    PRODUCT_IDS.STANLEY_CUP,
  ],
  
  // Heart candle → Faux flower, Small teddy, Fresh roses
  [PRODUCT_IDS.HEART_CANDLE]: [
    PRODUCT_IDS.FAUX_FLOWER,
    PRODUCT_IDS.TEDDY_25CM,
    PRODUCT_IDS.FRESH_ROSES,
  ],
  
  // === PERSONALIZED ===
  // Framed photo → Fresh roses, Candles, Medium teddy
  [PRODUCT_IDS.FRAMED_PHOTO]: [
    PRODUCT_IDS.FRESH_ROSES,
    PRODUCT_IDS.SCENTED_CANDLES,
    PRODUCT_IDS.TEDDY_MEDIUM,
  ],
  
  // Photo bouquet → Medium teddy, Candles, Faux flower
  [PRODUCT_IDS.PHOTO_BOUQUET]: [
    PRODUCT_IDS.TEDDY_MEDIUM,
    PRODUCT_IDS.SCENTED_CANDLES,
    PRODUCT_IDS.FAUX_FLOWER,
  ],
  
  // Customized journal → Candles, Faux flower, Small teddy
  [PRODUCT_IDS.CUSTOMIZED_JOURNAL]: [
    PRODUCT_IDS.SCENTED_CANDLES,
    PRODUCT_IDS.FAUX_FLOWER,
    PRODUCT_IDS.TEDDY_25CM,
  ],
  
  // Customized newspaper → Framed photo, Candles, Fresh roses
  [PRODUCT_IDS.CUSTOMIZED_NEWSPAPER]: [
    PRODUCT_IDS.FRAMED_PHOTO,
    PRODUCT_IDS.SCENTED_CANDLES,
    PRODUCT_IDS.FRESH_ROSES,
  ],
  
  // Customized jersey → Perfume, Framed photo, Smart watch
  [PRODUCT_IDS.CUSTOMIZED_JERSEY]: [
    PRODUCT_IDS.VSA_PERFUME_3IN1,
    PRODUCT_IDS.FRAMED_PHOTO,
    PRODUCT_IDS.SMART_WATCH,
  ],
  
  // === MONEY BOUQUETS ===
  // Money bouquet → Medium teddy, Fresh roses, Candles
  [PRODUCT_IDS.MONEY_BOUQUET]: [
    PRODUCT_IDS.TEDDY_MEDIUM,
    PRODUCT_IDS.FRESH_ROSES,
    PRODUCT_IDS.SCENTED_CANDLES,
  ],
  
  // Big boyz money → Large teddy, Faux flower, Chocolate
  [PRODUCT_IDS.BIG_BOYZ_MONEY]: [
    PRODUCT_IDS.TEDDY_120CM,
    PRODUCT_IDS.FAUX_FLOWER,
    PRODUCT_IDS.CHOCOLATE_TREAT,
  ],
  
  // Dollar bouquet → Large teddy, Faux flower, Framed photo
  [PRODUCT_IDS.DOLLAR_BOUQUET]: [
    PRODUCT_IDS.TEDDY_120CM,
    PRODUCT_IDS.FAUX_FLOWER,
    PRODUCT_IDS.FRAMED_PHOTO,
  ],
  
  // Money tower → Medium teddy, Fresh roses, Candles
  [PRODUCT_IDS.MONEY_TOWER]: [
    PRODUCT_IDS.TEDDY_MEDIUM,
    PRODUCT_IDS.FRESH_ROSES,
    PRODUCT_IDS.SCENTED_CANDLES,
  ],
  
  // === PERFUMES ===
  // 3in1 VSA Perfume → Chelsea set, Bracelet, Framed photo
  [PRODUCT_IDS.VSA_PERFUME_3IN1]: [
    PRODUCT_IDS.CHELSEA_MEN_SET,
    PRODUCT_IDS.CUBAN_BRACELET,
    PRODUCT_IDS.FRAMED_PHOTO,
  ],
  
  // Aventos blue → Chelsea set, Watch, Bracelet
  [PRODUCT_IDS.AVENTOS_BLUE]: [
    PRODUCT_IDS.CHELSEA_MEN_SET,
    PRODUCT_IDS.SMART_WATCH,
    PRODUCT_IDS.ROLEX_BRACELET,
  ],
  
  // === GIFT SETS ===
  // Chelsea men set → Perfume, Bracelet, Framed photo
  [PRODUCT_IDS.CHELSEA_MEN_SET]: [
    PRODUCT_IDS.VSA_PERFUME_3IN1,
    PRODUCT_IDS.CUBAN_BRACELET,
    PRODUCT_IDS.FRAMED_PHOTO,
  ],
  
  // Smart watch → Jersey, Perfume, Bracelet
  [PRODUCT_IDS.SMART_WATCH]: [
    PRODUCT_IDS.CUSTOMIZED_JERSEY,
    PRODUCT_IDS.VSA_PERFUME_3IN1,
    PRODUCT_IDS.CUBAN_BRACELET,
  ],
  
  // Stanley cup → Candles, Faux flower, Journal
  [PRODUCT_IDS.STANLEY_CUP]: [
    PRODUCT_IDS.SCENTED_CANDLES,
    PRODUCT_IDS.FAUX_FLOWER,
    PRODUCT_IDS.CUSTOMIZED_JOURNAL,
  ],
  
  // Hair dryer → Stanley cup, Candles, Faux flower
  [PRODUCT_IDS.HAIR_DRYER]: [
    PRODUCT_IDS.STANLEY_CUP,
    PRODUCT_IDS.SCENTED_CANDLES,
    PRODUCT_IDS.FAUX_FLOWER,
  ],
  
  // === JEWELRY ===
  // Cuban bracelet → Perfume, Chelsea set, Watch
  [PRODUCT_IDS.CUBAN_BRACELET]: [
    PRODUCT_IDS.VSA_PERFUME_3IN1,
    PRODUCT_IDS.CHELSEA_MEN_SET,
    PRODUCT_IDS.SMART_WATCH,
  ],
  
  // Rolex bracelet → Perfume, Chelsea set, Framed photo
  [PRODUCT_IDS.ROLEX_BRACELET]: [
    PRODUCT_IDS.VSA_PERFUME_3IN1,
    PRODUCT_IDS.CHELSEA_MEN_SET,
    PRODUCT_IDS.FRAMED_PHOTO,
  ],
  
  // Labubu keychain → Small teddy, Candles, Fresh roses
  [PRODUCT_IDS.LABUBU_KEYCHAIN]: [
    PRODUCT_IDS.TEDDY_25CM,
    PRODUCT_IDS.SCENTED_CANDLES,
    PRODUCT_IDS.FRESH_ROSES,
  ],
  
  // === FOOD & CAKE ===
  // Chocolate treat → Medium teddy, Fresh roses, Candles
  [PRODUCT_IDS.CHOCOLATE_TREAT]: [
    PRODUCT_IDS.TEDDY_MEDIUM,
    PRODUCT_IDS.FRESH_ROSES,
    PRODUCT_IDS.SCENTED_CANDLES,
  ],
  
  // Cakes → Medium teddy, Fresh roses, Candles
  [PRODUCT_IDS.CUPID_CAKE]: [
    PRODUCT_IDS.TEDDY_MEDIUM,
    PRODUCT_IDS.FRESH_ROSES,
    PRODUCT_IDS.SCENTED_CANDLES,
  ],
  
  [PRODUCT_IDS.CAKE_6IN1]: [
    PRODUCT_IDS.TEDDY_MEDIUM,
    PRODUCT_IDS.FRESH_ROSES,
    PRODUCT_IDS.FAUX_FLOWER,
  ],
  
  // === ROOM DECOR ===
  // Room decor → Large teddy, Faux flower, Photo bouquet
  [PRODUCT_IDS.ROOM_DECOR_150K]: [
    PRODUCT_IDS.TEDDY_120CM,
    PRODUCT_IDS.FAUX_FLOWER,
    PRODUCT_IDS.PHOTO_BOUQUET,
  ],
  
  [PRODUCT_IDS.ROOM_DECOR_200K]: [
    PRODUCT_IDS.TEDDY_160CM,
    PRODUCT_IDS.FAUX_FLOWER,
    PRODUCT_IDS.FRAMED_PHOTO,
  ],
};

// Default recommendations if product not in mapping
export const DEFAULT_RECOMMENDATIONS = [
  PRODUCT_IDS.SCENTED_CANDLES,
  PRODUCT_IDS.FRESH_ROSES,
  PRODUCT_IDS.TEDDY_25CM,
];

/**
 * Get complementary products for a given product ID
 */
export function getComplementaryProducts(productId: string): string[] {
  return COMPLEMENTARY_PRODUCTS[productId] || DEFAULT_RECOMMENDATIONS;
}

/**
 * Filter out products already in cart
 */
export function filterExistingProducts(
  recommendations: string[],
  cartProductIds: string[]
): string[] {
  return recommendations.filter(id => !cartProductIds.includes(id));
}
