/* カラットシーク第一段の最小商品データベース。
   商品情報は2026-09-05に各蔵元公式ページで確認。価格は表示元の税込・税別区分を保持する。 */
window.CARAT_SAKE_DB = [
  {
    id:'nada-hakutsuru-daiginjo', region:'nada', brewery:'白鶴酒造', name:'白鶴 大吟醸', category:'大吟醸', volumeMl:720,
    price:{amount:1371,taxIncluded:true}, tags:['華やか','透明感','食中酒'],
    taste:{ja:'りんごを思わせる華やかな香りと、料理に合わせやすい透明感のある味わい。',en:'A bright apple-like aroma with a clear taste that pairs easily with food.',zh:'帶有蘋果般華麗香氣，口感清澈，容易搭配料理。'},
    sourceUrl:'https://www.hakutsuru.co.jp/product/sake/daiginjo/03836.html', sourceCheckedAt:'2026-09-05'
  },
  {
    id:'nada-hakutsuru-blanc', region:'nada', brewery:'白鶴酒造', name:'Hakutsuru Blanc', category:'純米酒', volumeMl:720,
    price:{amount:1518,taxIncluded:true}, tags:['フルーティー','甘酸っぱい','軽やか'],
    taste:{ja:'白ワインのように軽やか。フルーティーな香り、やわらかな甘味とすっきりした酸味。',en:'Light like white wine, with a fruity aroma, gentle sweetness and clean acidity.',zh:'如白葡萄酒般輕盈，帶有水果香、柔和甜味與清爽酸度。'},
    sourceUrl:'https://www.hakutsuru.co.jp/product/sake/others_sake/07266.html', sourceCheckedAt:'2026-09-05'
  },
  {
    id:'nada-bekkaku-komorebi', region:'nada', brewery:'白鶴酒造', name:'別鶴 木漏れ日のムシメガネ', category:'純米酒', volumeMl:720,
    price:null, tags:['甘酸っぱい','個性的','香り'],
    taste:{ja:'レモングラスを思わせる香りと、果物のような甘酸っぱさを持つ純米酒。',en:'A junmai sake with lemongrass-like aroma and fruit-like sweet-tart character.',zh:'帶有檸檬香茅般香氣與水果般酸甜感的純米酒。'},
    sourceUrl:'https://www.hakutsuru.co.jp/bekkaku/product/', sourceCheckedAt:'2026-09-05'
  },
  {
    id:'fushimi-nouvelle', region:'fushimi', brewery:'月桂冠', name:'ヌーベル月桂冠 純米吟醸', category:'純米吟醸', volumeMl:720,
    price:{amount:1326,taxIncluded:false}, tags:['華やか','フルーティー','すっきり'],
    taste:{ja:'華やかでフルーティーな香りと、すっきりしたキレのある後味。',en:'A floral, fruity aroma followed by a clean, crisp finish.',zh:'香氣華麗且富果香，尾韻清爽俐落。'},
    sourceUrl:'https://www.gekkeikan.co.jp/products/type01/nouvelle_junmai/', sourceCheckedAt:'2026-09-05'
  },
  {
    id:'fushimi-gekkeikan-josen', region:'fushimi', brewery:'月桂冠', name:'月桂冠 上撰', category:'普通酒', volumeMl:720,
    price:{amount:944,taxIncluded:false}, tags:['まろやか','旨味','やわらかい'],
    taste:{ja:'自然な香りと、まろやかな旨味が特徴。伏見伝統の四段仕込みを用いる。',en:'Natural aroma and mellow umami, made with Fushimi’s traditional four-stage method.',zh:'自然香氣與圓潤旨味是其特色，採用伏見傳統四段仕込み。'},
    sourceUrl:'https://www.gekkeikan.co.jp/products/type04/josen/', sourceCheckedAt:'2026-09-05'
  },
  {
    id:'fushimi-kizakura-junmaiginjo', region:'fushimi', brewery:'黄桜', name:'特撰 純米吟醸 黄桜', category:'純米吟醸', volumeMl:720,
    price:{amount:1500,taxIncluded:false}, tags:['ふくよか','濃厚','なめらか'],
    taste:{ja:'ふくよかな吟醸香、濃厚な旨味となめらかな味わい。',en:'A generous ginjo aroma, rich umami and a smooth palate.',zh:'吟釀香氣豐盈，旨味濃郁，口感滑順。'},
    sourceUrl:'https://kizakura.co.jp/ja/product_introduction/info.php?id=IC000086&type=items4', sourceCheckedAt:'2026-09-05'
  },
  {
    id:'hiroshima-kamotsuru-junmaiginjo', region:'hiroshima', brewery:'賀茂鶴酒造', name:'賀茂鶴 純米吟醸', category:'純米吟醸', volumeMl:720,
    price:{amount:1815,taxIncluded:true}, tags:['芳醇','米の旨味','幅広い温度'],
    taste:{ja:'ふくよかな香りと米の旨味。冷酒からぬる燗まで楽しめる。',en:'A full aroma and rice umami, enjoyable chilled through gently warmed.',zh:'香氣飽滿，能品出米旨味，冷飲至溫燗皆宜。'},
    sourceUrl:'https://shop.kamotsuru.jp/SHOP/junnmaiginjo720.html', sourceCheckedAt:'2026-09-05'
  },
  {
    id:'hiroshima-kamotsuru-itteki', region:'hiroshima', brewery:'賀茂鶴酒造', name:'純米吟醸 一滴入魂', category:'純米吟醸', volumeMl:720,
    price:{amount:1793,taxIncluded:true}, tags:['穏やかな香り','ほどよい酸味','やわらかい'],
    taste:{ja:'穏やかな香り、ほどよい酸味とやわらかな口当たり。',en:'A restrained aroma, balanced acidity and a soft mouthfeel.',zh:'香氣沉穩、酸度適中，口感柔和。'},
    sourceUrl:'https://shop.kamotsuru.jp/SHOP/itteki720.html', sourceCheckedAt:'2026-09-05'
  },
  {
    id:'hiroshima-kamotsuru-junmai', region:'hiroshima', brewery:'賀茂鶴酒造', name:'賀茂鶴 純米酒', category:'純米酒', volumeMl:720,
    price:{amount:1320,taxIncluded:true}, tags:['辛口','爽やか','米の旨味'],
    taste:{ja:'米の旨味と純米酒らしい酸味が調和した、爽やかな辛口。',en:'A refreshing dry sake balancing rice umami with junmai acidity.',zh:'米旨味與純米酒特有酸味協調，是一款清爽辛口酒。'},
    sourceUrl:'https://shop.kamotsuru.jp/SHOP/junmai720.html', sourceCheckedAt:'2026-09-05'
  }
];
