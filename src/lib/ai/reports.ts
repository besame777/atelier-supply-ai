/**
 * Local mock "AI" report generation for the MVP.
 * No real AI API is connected yet — these functions produce realistic,
 * deterministic preliminary reports from user input. They will be replaced
 * by a real AI backend later; the AIReport shape is the contract.
 *
 * Main rule: everything here is a PRELIMINARY ESTIMATE, never a final quote.
 */
import type { Locale } from "@/i18n/config";
import type {
  AIReport,
  ProjectEstimateInput,
  QualityTier,
  RoomConceptInput,
} from "@/lib/types";
import { getProcurementPreviewImage } from "@/lib/ai/design-preview";
import { paletteSwatches } from "@/lib/data/palettes";


/** USD per m², [min, max] by quality tier. */
const RATES: Record<QualityTier, [number, number]> = {
  economy: [180, 270],
  balanced: [300, 450],
  premium: [520, 800],
};

const TIMELINES: Record<QualityTier, Record<Locale, string>> = {
  economy: { ru: "8–11 недель", en: "8–11 weeks" },
  balanced: { ru: "10–14 недель", en: "10–14 weeks" },
  premium: { ru: "12–16 недель", en: "12–16 weeks" },
};

const TIER_LABELS: Record<QualityTier, Record<Locale, string>> = {
  economy: { ru: "рациональный", en: "sensible" },
  balanced: { ru: "оптимальный", en: "optimal" },
  premium: { ru: "премиум", en: "premium" },
};

type L = Record<Locale, string>;
type LL = Record<Locale, string[]>;

const ROOMS_BY_OBJECT: Record<string, LL> = {
  apartment: {
    ru: ["Гостиная", "Кухня-столовая", "Спальня", "Детская / кабинет", "Прихожая", "Санузлы"],
    en: ["Living room", "Kitchen / dining", "Bedroom", "Kids room / study", "Hallway", "Bathrooms"],
  },
  house: {
    ru: ["Гостиная", "Кухня-столовая", "Мастер-спальня", "Гостевые спальни", "Кабинет", "Терраса", "Санузлы"],
    en: ["Living room", "Kitchen / dining", "Master bedroom", "Guest bedrooms", "Study", "Terrace", "Bathrooms"],
  },
  hotel: {
    ru: ["Типовые номера", "Люксы", "Лобби и ресепшн", "Коридоры", "Ресторан / завтраки"],
    en: ["Standard rooms", "Suites", "Lobby and reception", "Corridors", "Restaurant / breakfast area"],
  },
  office: {
    ru: ["Рабочие зоны", "Переговорные", "Лаунж", "Ресепшн", "Кухня для сотрудников"],
    en: ["Work areas", "Meeting rooms", "Lounge", "Reception", "Staff kitchen"],
  },
  restaurant: {
    ru: ["Основной зал", "Барная зона", "Веранда", "Санузлы", "Входная группа"],
    en: ["Main hall", "Bar area", "Veranda", "Restrooms", "Entrance area"],
  },
};

const FURNITURE: LL = {
  ru: ["Мягкая мебель (диваны, кресла)", "Корпусная мебель и хранение", "Столы и стулья", "Кровати и матрасы", "Мебель по индивидуальным размерам"],
  en: ["Upholstery (sofas, armchairs)", "Case goods and storage", "Tables and chairs", "Beds and mattresses", "Custom-sized furniture"],
};

const LIGHTING_DECOR: LL = {
  ru: ["Подвесные и потолочные светильники", "Торшеры и настольные лампы", "Зеркала и настенный декор", "Текстиль: шторы, ковры, подушки", "Предметы декора и вазы"],
  en: ["Pendant and ceiling lights", "Floor and table lamps", "Mirrors and wall decor", "Textiles: curtains, rugs, cushions", "Decor objects and vases"],
};

const MATERIALS: LL = {
  ru: ["Натуральный шпон и массив", "Камень и спечённые поверхности", "Металл: латунь, нержавеющая сталь", "Контрактные ткани и кожа", "Стекло и керамика"],
  en: ["Natural veneer and solid wood", "Stone and sintered surfaces", "Metal: brass, stainless steel", "Contract fabrics and leather", "Glass and ceramics"],
};

const STRATEGY: Record<QualityTier, LL> = {
  economy: {
    ru: ["Готовые коллекции проверенных фабрик среднего сегмента", "Консолидация заказа у 3–4 поставщиков для снижения логистики", "Стандартные размеры вместо индивидуального производства"],
    en: ["Ready collections from vetted mid-range factories", "Order consolidation across 3–4 suppliers to reduce logistics", "Standard dimensions instead of custom production"],
  },
  balanced: {
    ru: ["Сочетание готовых коллекций и позиций под заказ", "Фабрики, выпускающие OEM для европейских брендов", "Выборочные инспекции ключевых позиций до отгрузки"],
    en: ["A mix of ready collections and made-to-order items", "Factories producing OEM for European brands", "Selective pre-shipment inspections of key items"],
  },
  premium: {
    ru: ["Производство по индивидуальным чертежам на люксовых фабриках", "Образцы материалов и отделки на согласование до запуска", "Полные инспекции каждой партии с фото- и видеоотчетами"],
    en: ["Production to custom drawings at luxury-tier factories", "Material and finish samples approved before production", "Full inspections of every batch with photo and video reports"],
  },
};

const RISKS: LL = {
  ru: [
    "Точный состав и цены зависят от детальной спецификации — текущий расчет основан на типовых составах",
    "Сроки производства могут сдвигаться в период китайских праздников (Новый год, Золотая неделя)",
    "Курс валют и тарифы на логистику фиксируются на момент финальной сметы",
  ],
  en: [
    "The exact line-up and prices depend on a detailed specification — this estimate is based on typical line-ups",
    "Production timelines may shift around Chinese holidays (New Year, Golden Week)",
    "Currency rates and logistics tariffs are fixed at the moment of the final quote",
  ],
};

const NEXT_STEPS: LL = {
  ru: [
    "Оставьте контакты — менеджер свяжется в течение рабочего дня",
    "Менеджер проверит расчет и уточнит детали проекта",
    "Вы получите финальную смету с фиксацией цен и сроков",
  ],
  en: [
    "Leave your contacts — a manager will reach out within one business day",
    "The manager verifies the estimate and clarifies project details",
    "You receive a final quote with fixed prices and timelines",
  ],
};

const SEC = {
  rooms: { ru: "Распознанные помещения", en: "Detected rooms" } as L,
  furniture: { ru: "Категории мебели", en: "Furniture categories" } as L,
  lighting: { ru: "Свет и декор", en: "Lighting and decor" } as L,
  materials: { ru: "Материалы и категории", en: "Materials and categories" } as L,
  strategy: { ru: "Стратегия закупки из Китая", en: "China sourcing strategy" } as L,
  risks: { ru: "Риски и допущения", en: "Risks and assumptions" } as L,
  next: { ru: "Рекомендуемые шаги", en: "Recommended next steps" } as L,
  styleDir: { ru: "Стилевое направление", en: "Style direction" } as L,
  layout: { ru: "Идея планировки", en: "Layout idea" } as L,
  furnitureList: { ru: "Список мебели", en: "Furniture list" } as L,
  lightingList: { ru: "Освещение", en: "Lighting" } as L,
  decor: { ru: "Декор", en: "Decor suggestions" } as L,
  sourcing: { ru: "Потенциал закупки из Китая", en: "China sourcing potential" } as L,
};

const HL = {
  budget: { ru: "Предварительный бюджет", en: "Preliminary budget" } as L,
  timeline: { ru: "Предварительный срок", en: "Preliminary timeline" } as L,
  area: { ru: "Площадь", en: "Area" } as L,
  tier: { ru: "Уровень качества", en: "Quality tier" } as L,
  style: { ru: "Стиль", en: "Style" } as L,
  room: { ru: "Комната", en: "Room" } as L,
};

function budgetRange(area: number, tier: QualityTier): string {
  const [min, max] = RATES[tier];
  const lo = Math.round((area * min) / 500) * 500;
  const hi = Math.round((area * max) / 500) * 500;
  return `${"$" + lo.toLocaleString("en-US")} – ${"$" + hi.toLocaleString("en-US")}`;
}

export function generateEstimateReport(
  input: ProjectEstimateInput,
  locale: Locale
): AIReport {
  const rooms = ROOMS_BY_OBJECT[input.objectType] ?? ROOMS_BY_OBJECT.apartment;
  const tier = TIER_LABELS[input.quality][locale];
  const summary =
    locale === "ru"
      ? `Предварительный расчет комплектации объекта площадью ${input.area} м² (уровень «${tier}») с доставкой: ${input.city || "—"}. Это ориентир на основе типовых составов — финальную смету подготовит менеджер после проверки проекта.`
      : `Preliminary procurement estimate for a ${input.area} m² project (tier: ${tier}) with delivery to ${input.city || "—"}. This is an estimate based on typical line-ups — the final quote is prepared by a manager.`;

  return {
    kind: "estimate",
    summary,
    preview: {
      variant: "procurement",
      image: getProcurementPreviewImage(),
    },
    highlights: [
      { label: HL.budget[locale], value: budgetRange(input.area, input.quality) },
      { label: HL.timeline[locale], value: TIMELINES[input.quality][locale] },
      { label: HL.area[locale], value: `${input.area} ${locale === "ru" ? "м²" : "m²"}` },
      { label: HL.tier[locale], value: tier },
    ],
    sections: [
      { title: SEC.rooms[locale], items: rooms[locale] },
      { title: SEC.furniture[locale], items: FURNITURE[locale] },
      { title: SEC.lighting[locale], items: LIGHTING_DECOR[locale] },
      { title: SEC.materials[locale], items: MATERIALS[locale] },
      { title: SEC.strategy[locale], items: STRATEGY[input.quality][locale] },
      { title: SEC.risks[locale], items: RISKS[locale] },
      { title: SEC.next[locale], items: NEXT_STEPS[locale] },
    ],
  };
}

/* ----------------------------- Room concept ----------------------------- */

const STYLES: Record<string, { name: L; direction: LL; palette: { name: L; hex: string }[] }> = {
  modern: {
    name: { ru: "Современный", en: "Modern" },
    direction: {
      ru: ["Чистые линии и спокойная база с акцентными предметами", "Закрытое хранение, минимум визуального шума", "Контраст теплого дерева и графитовых деталей"],
      en: ["Clean lines and a calm base with statement pieces", "Closed storage, minimal visual noise", "Contrast of warm wood and graphite details"],
    },
    palette: [
      { name: { ru: "Теплый белый", en: "Warm white" }, hex: "#f1ede5" },
      { name: { ru: "Серо-бежевый", en: "Greige" }, hex: "#b8ab97" },
      { name: { ru: "Графит", en: "Graphite" }, hex: "#3a3a3a" },
      { name: { ru: "Орех", en: "Walnut" }, hex: "#6b4d35" },
    ],
  },
  minimalist: {
    name: { ru: "Минимализм", en: "Minimalist" },
    direction: {
      ru: ["Максимум воздуха: несколько крупных предметов вместо множества мелких", "Встроенное хранение в цвет стен", "Скрытый свет и чистые плоскости"],
      en: ["Maximum air: a few large pieces instead of many small ones", "Built-in storage matching the walls", "Concealed lighting and clean planes"],
    },
    palette: [
      { name: { ru: "Белый", en: "White" }, hex: "#f5f4f1" },
      { name: { ru: "Светло-серый", en: "Light grey" }, hex: "#d6d4cf" },
      { name: { ru: "Дуб", en: "Oak" }, hex: "#c2a684" },
      { name: { ru: "Черный акцент", en: "Black accent" }, hex: "#2b2b2b" },
    ],
  },
  japandi: {
    name: { ru: "Джапанди", en: "Japandi" },
    direction: {
      ru: ["Низкие силуэты мебели и природные материалы", "Тактильные ткани: лен, букле, шерсть", "Асимметрия и ручная керамика в декоре"],
      en: ["Low furniture silhouettes and natural materials", "Tactile fabrics: linen, bouclé, wool", "Asymmetry and handmade ceramics in decor"],
    },
    palette: [
      { name: { ru: "Рисовая бумага", en: "Rice paper" }, hex: "#f0e9dc" },
      { name: { ru: "Глина", en: "Clay" }, hex: "#b3917a" },
      { name: { ru: "Мох", en: "Moss" }, hex: "#7c7a5e" },
      { name: { ru: "Темное дерево", en: "Dark wood" }, hex: "#4a3a2e" },
    ],
  },
  classic: {
    name: { ru: "Премиум-классика", en: "Premium Classic" },
    direction: {
      ru: ["Симметричная композиция с центральным акцентом", "Мрамор, латунь и глубокие оттенки дерева", "Молдинги и многоуровневый свет"],
      en: ["A symmetric composition with a central focal point", "Marble, brass and deep wood tones", "Mouldings and layered lighting"],
    },
    palette: [
      { name: { ru: "Слоновая кость", en: "Ivory" }, hex: "#f2ecdf" },
      { name: { ru: "Латунь", en: "Brass" }, hex: "#b08d4f" },
      { name: { ru: "Глубокий синий", en: "Deep blue" }, hex: "#2e3a4d" },
      { name: { ru: "Темный орех", en: "Dark walnut" }, hex: "#5a3f2b" },
    ],
  },
  loft: {
    name: { ru: "Лофт", en: "Loft" },
    direction: {
      ru: ["Открытая планировка и грубые фактуры: бетон, металл, кожа", "Крупная мягкая мебель как центр композиции", "Трековый свет и винтажные акценты"],
      en: ["Open layout and raw textures: concrete, metal, leather", "Oversized soft furniture as the centerpiece", "Track lighting and vintage accents"],
    },
    palette: [
      { name: { ru: "Бетон", en: "Concrete" }, hex: "#c9c5bd" },
      { name: { ru: "Кирпич", en: "Brick" }, hex: "#9c5a3c" },
      { name: { ru: "Черный металл", en: "Black metal" }, hex: "#2e2c2a" },
      { name: { ru: "Коньячная кожа", en: "Cognac leather" }, hex: "#8a5a33" },
    ],
  },
  luxury: {
    name: { ru: "Современный люкс", en: "Contemporary Luxury" },
    direction: {
      ru: ["Глубокие тона, благородные материалы и статусные акценты", "Бархат, мрамор, латунь и тонированное стекло", "Сценарный свет и крупные дизайнерские предметы"],
      en: ["Deep tones, refined materials and statement pieces", "Velvet, marble, brass and tinted glass", "Scenic lighting and large designer pieces"],
    },
    palette: [
      { name: { ru: "Тёплый белый", en: "Warm white" }, hex: "#efe7da" },
      { name: { ru: "Шампань-латунь", en: "Champagne brass" }, hex: "#b89a63" },
      { name: { ru: "Эспрессо", en: "Espresso" }, hex: "#3a2c22" },
      { name: { ru: "Графит", en: "Charcoal" }, hex: "#2c2a28" },
    ],
  },
  boutique: {
    name: { ru: "Бутик-отель", en: "Boutique Hotel" },
    direction: {
      ru: ["Атмосфера бутик-отеля: уют, текстуры и продуманные детали", "Изголовье во всю стену, мягкий текстиль, приглушённый свет", "Локальные акценты и тактильные материалы"],
      en: ["A boutique-hotel feel: comfort, texture and considered details", "A full-wall headboard, soft textiles, dimmed light", "Local accents and tactile materials"],
    },
    palette: [
      { name: { ru: "Тёплый песок", en: "Warm sand" }, hex: "#e6dccb" },
      { name: { ru: "Таупе", en: "Taupe" }, hex: "#a9907a" },
      { name: { ru: "Глубокий зелёный", en: "Deep green" }, hex: "#3d4a3f" },
      { name: { ru: "Бронза", en: "Bronze" }, hex: "#7a5a3a" },
    ],
  },
  "light-european": {
    name: { ru: "Светло-европейская", en: "Light European" },
    direction: {
      ru: ["Светлая европейская база с воздушной композицией", "Светлое дерево, лён и матовые поверхности", "Много естественного света и минимум контраста"],
      en: ["A light European base with an airy composition", "Pale wood, linen and matte surfaces", "Plenty of natural light and minimal contrast"],
    },
    palette: [
      { name: { ru: "Слоновая кость", en: "Ivory" }, hex: "#f4efe6" },
      { name: { ru: "Песочный", en: "Sand" }, hex: "#d9c7af" },
      { name: { ru: "Мягкий таупе", en: "Soft taupe" }, hex: "#b7a98f" },
      { name: { ru: "Приглушённая олива", en: "Muted olive" }, hex: "#8d8a6f" },
    ],
  },
};

const SOURCING_POTENTIAL: LL = {
  ru: [
    "Все категории списка доступны напрямую с фабрик Китая",
    "Ожидаемая экономия 30–50% против российской розницы",
    "Возможно производство нестандартных размеров без существенной наценки",
  ],
  en: [
    "Every category on the list is available directly from Chinese factories",
    "Expected savings of 30–50% versus local retail",
    "Non-standard sizes can be produced without a significant premium",
  ],
};

export function generateConceptReport(
  input: RoomConceptInput,
  locale: Locale
): AIReport {
  const style = STYLES[input.style] ?? STYLES.modern;
  const area = Math.max(1, Math.round(input.length * input.width * 10) / 10);
  const [min, max]: [number, number] = [420, 680]; // per m² for a single furnished room
  const lo = Math.round((area * min) / 250) * 250;
  const hi = Math.round((area * max) / 250) * 250;

  const layout: LL = {
    ru: [
      `Площадь ≈ ${area} м² (${input.length}×${input.width} м), потолок ${input.height} м`,
      input.windows > 0
        ? `Композиция строится от ${input.windows > 1 ? "окон" : "окна"} — основная зона у естественного света`
        : "Помещение без окон — упор на многоуровневый искусственный свет",
      "Крупная мебель — вдоль глухих стен, проходы не менее 70–80 см",
      input.constraints ? `Учтены ограничения: ${input.constraints}` : "Жестких ограничений не указано",
    ],
    en: [
      `Area ≈ ${area} m² (${input.length}×${input.width} m), ceiling ${input.height} m`,
      input.windows > 0
        ? `The composition is built from the window${input.windows > 1 ? "s" : ""} — the main zone sits by natural light`
        : "A windowless room — emphasis on layered artificial lighting",
      "Large furniture along solid walls, walkways at least 70–80 cm",
      input.constraints ? `Constraints considered: ${input.constraints}` : "No hard constraints specified",
    ],
  };

  const summary =
    locale === "ru"
      ? `AI-концепция комнаты ≈ ${area} м² в стиле «${style.name.ru}» с предварительным расчетом бюджета комплектации. Это ориентир — финальную смету подготовит менеджер после уточнения деталей.`
      : `An AI concept for a ≈ ${area} m² room in the ${style.name.en} style with a preliminary procurement budget estimate. It is a guide — the final quote is prepared by a manager after the details are confirmed.`;

  return {
    kind: "concept",
    summary,
    highlights: [
      { label: HL.budget[locale], value: `$${lo.toLocaleString("en-US")} – $${hi.toLocaleString("en-US")}` },
      { label: HL.timeline[locale], value: locale === "ru" ? "8–12 недель" : "8–12 weeks" },
      { label: HL.area[locale], value: `${area} ${locale === "ru" ? "м²" : "m²"}` },
      { label: HL.style[locale], value: style.name[locale] },
    ],
    palette: paletteSwatches(input.palette, locale),
    sections: [
      { title: SEC.styleDir[locale], items: style.direction[locale] },
      { title: SEC.layout[locale], items: layout[locale] },
      { title: SEC.sourcing[locale], items: SOURCING_POTENTIAL[locale] },
      { title: SEC.risks[locale], items: RISKS[locale] },
      { title: SEC.next[locale], items: NEXT_STEPS[locale] },
    ],
  };
}
