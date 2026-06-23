import { withBasePath } from "@/lib/base-path";
import type { Project } from "@/lib/types";

export const projects: Project[] = [
  {
    slug: "modern-apartment",
    tone: "beige",
    image: {
      src: withBasePath("/images/project-modern-apartment.webp"),
      alt: { ru: "Гостиная современной квартиры", en: "Modern apartment living room" },
    },
    title: { ru: "Современная квартира", en: "Modern apartment" },
    location: { ru: "Москва, Россия", en: "Moscow, Russia" },
    area: 142,
    budget: "$68 000 – $84 000",
    duration: { ru: "14 недель", en: "14 weeks" },
    summary: {
      ru: "Полная комплектация квартиры по дизайн-проекту: мебель, свет, текстиль и декор с шести фабрик Гуандуна.",
      en: "Full apartment procurement to a design project: furniture, lighting, textiles and decor from six Guangdong factories.",
    },
    description: {
      ru: [
        "Дизайн-проект предполагал мебель европейских брендов с бюджетом, вдвое превышающим ожидания клиента. Мы подобрали аналоги на фабриках, выпускающих продукцию для этих же брендов, сохранив материалы и геометрию.",
        "Вся партия консолидирована на складе в Фошане, прошла инспекцию и доставлена одним контейнером с растаможкой под ключ.",
      ],
      en: [
        "The design project specified European brand furniture at twice the client's budget. We sourced alternatives at factories producing for those same brands, preserving materials and geometry.",
        "The entire batch was consolidated at a Foshan warehouse, inspected and delivered in a single container with turnkey customs clearance.",
      ],
    },
    scope: {
      ru: ["Мягкая и корпусная мебель", "Освещение всех зон", "Текстиль и ковры", "Декор и зеркала"],
      en: ["Upholstery and case goods", "Lighting for all zones", "Textiles and rugs", "Decor and mirrors"],
    },
    tags: { ru: ["Квартира", "Под ключ"], en: ["Apartment", "Turnkey"] },
  },
  {
    slug: "luxury-villa",
    tone: "brown",
    image: {
      src: withBasePath("/images/project-luxury-villa.webp"),
      alt: { ru: "Интерьер загородной виллы", en: "Country villa interior" },
    },
    title: { ru: "Люксовая вилла", en: "Luxury villa" },
    location: { ru: "Подмосковье, Россия", en: "Moscow region, Russia" },
    area: 460,
    budget: "$210 000 – $260 000",
    duration: { ru: "20 недель", en: "20 weeks" },
    summary: {
      ru: "Премиальная комплектация виллы: мебель по индивидуальным размерам, каменные столешницы, дизайнерский свет.",
      en: "Premium villa procurement: custom-sized furniture, stone countertops, designer lighting.",
    },
    description: {
      ru: [
        "Проект уровня люкс с мебелью по индивидуальным чертежам: фабрики, работающие с итальянскими брендами, изготовили позиции под размеры и отделку проекта.",
        "Три инспекции на разных этапах производства, страхование груза и доставка с подъемом и расстановкой на объекте.",
      ],
      en: [
        "A luxury-tier project with furniture built to custom drawings: factories serving Italian brands produced items to the project's dimensions and finishes.",
        "Three inspections at different production stages, cargo insurance, and delivery with on-site placement.",
      ],
    },
    scope: {
      ru: ["Мебель по индивидуальным чертежам", "Каменные поверхности", "Дизайнерское освещение", "Наружная мебель"],
      en: ["Furniture to custom drawings", "Stone surfaces", "Designer lighting", "Outdoor furniture"],
    },
    tags: { ru: ["Вилла", "Премиум"], en: ["Villa", "Premium"] },
  },
  {
    slug: "minimalist-kitchen",
    tone: "sand",
    image: {
      src: withBasePath("/images/project-minimalist-kitchen.webp"),
      alt: { ru: "Минималистичная кухня", en: "Minimalist kitchen" },
    },
    title: { ru: "Минималистичная кухня", en: "Minimalist kitchen" },
    location: { ru: "Санкт-Петербург, Россия", en: "Saint Petersburg, Russia" },
    area: 28,
    budget: "$18 000 – $24 000",
    duration: { ru: "10 недель", en: "10 weeks" },
    summary: {
      ru: "Кухня под потолок с фасадами в суперматовой эмали, каменным островом и встроенным светом.",
      en: "Floor-to-ceiling kitchen with super-matte lacquer fronts, a stone island and integrated lighting.",
    },
    description: {
      ru: [
        "Кухня изготовлена на фабрике, выпускающей гарнитуры для немецких брендов: фасады в эмали, фурнитура Blum, столешница из спечённого камня.",
        "Контрольная сборка на фабрике до отгрузки исключила сюрпризы при монтаже.",
      ],
      en: [
        "The kitchen was produced at a factory making cabinetry for German brands: lacquer fronts, Blum hardware, a sintered stone countertop.",
        "A test assembly at the factory before shipment ruled out surprises during installation.",
      ],
    },
    scope: {
      ru: ["Кухонный гарнитур", "Остров и барные стулья", "Встроенный свет", "Смесители и мойка"],
      en: ["Kitchen cabinetry", "Island and bar stools", "Integrated lighting", "Faucets and sink"],
    },
    tags: { ru: ["Кухня", "Минимализм"], en: ["Kitchen", "Minimalist"] },
  },
  {
    slug: "boutique-hotel-room",
    tone: "charcoal",
    image: {
      src: withBasePath("/images/project-boutique-hotel-room.webp"),
      alt: { ru: "Номер бутик-отеля", en: "Boutique hotel room" },
    },
    title: { ru: "Номер бутик-отеля", en: "Boutique hotel room" },
    location: { ru: "Сочи, Россия", en: "Sochi, Russia" },
    area: 38,
    budget: "$14 000 – $17 000 / номер",
    duration: { ru: "16 недель", en: "16 weeks" },
    summary: {
      ru: "Тиражная комплектация 18 номеров: контрактная мебель, гостиничный текстиль, свет и декор.",
      en: "Serial procurement of 18 rooms: contract furniture, hospitality textiles, lighting and decor.",
    },
    description: {
      ru: [
        "FF&E-комплектация бутик-отеля: контрактные ткани, усиленные каркасы, гостиничные стандарты износостойкости.",
        "Пилотный номер собран и согласован до запуска тиража — стандартная практика для гостиничных проектов.",
      ],
      en: [
        "FF&E procurement for a boutique hotel: contract fabrics, reinforced frames, hospitality durability standards.",
        "A pilot room was assembled and approved before the production run — standard practice for hospitality projects.",
      ],
    },
    scope: {
      ru: ["Контрактная мебель", "Гостиничный текстиль", "Освещение номеров", "Декор и зеркала"],
      en: ["Contract furniture", "Hospitality textiles", "Room lighting", "Decor and mirrors"],
    },
    tags: { ru: ["Отель", "FF&E"], en: ["Hotel", "FF&E"] },
  },
  {
    slug: "premium-living-room",
    tone: "beige",
    image: {
      // No dedicated asset — reuse the warm hero living-room photograph.
      src: withBasePath("/images/hero-main.webp"),
      alt: { ru: "Премиальная гостиная", en: "Premium living room" },
    },
    title: { ru: "Премиальная гостиная", en: "Premium living room" },
    location: { ru: "Алматы, Казахстан", en: "Almaty, Kazakhstan" },
    area: 52,
    budget: "$32 000 – $40 000",
    duration: { ru: "12 недель", en: "12 weeks" },
    summary: {
      ru: "Гостиная в духе современной классики: модульный диван, мрамор, латунь и многоуровневый свет.",
      en: "A modern-classic living room: modular sofa, marble, brass and layered lighting.",
    },
    description: {
      ru: [
        "Клиент пришел с фотографиями-референсами из европейских шоурумов. Мы воспроизвели сцену с фабрик-производителей оригиналов: модульный диван, мраморные столики, латунные светильники.",
        "Экономия против розничных цен референсов составила 47% при идентичных материалах.",
      ],
      en: [
        "The client arrived with reference photos from European showrooms. We recreated the scene from the factories behind the originals: a modular sofa, marble side tables, brass lighting.",
        "Savings versus the references' retail prices reached 47% with identical materials.",
      ],
    },
    scope: {
      ru: ["Модульный диван и кресла", "Мраморные столики", "Латунный свет", "Ковер ручной работы"],
      en: ["Modular sofa and armchairs", "Marble tables", "Brass lighting", "Handmade rug"],
    },
    tags: { ru: ["Гостиная", "Классика"], en: ["Living room", "Classic"] },
  },
  {
    slug: "office-lounge",
    tone: "sand",
    image: {
      src: withBasePath("/images/project-office-lounge.webp"),
      alt: { ru: "Лаунж-зона офиса", en: "Office lounge area" },
    },
    title: { ru: "Офисный лаунж", en: "Office lounge" },
    location: { ru: "Москва, Россия", en: "Moscow, Russia" },
    area: 120,
    budget: "$45 000 – $55 000",
    duration: { ru: "12 недель", en: "12 weeks" },
    summary: {
      ru: "Лаунж-зона штаб-квартиры IT-компании: акустические панели, мягкие зоны, кофе-поинт и переговорные капсулы.",
      en: "An IT company HQ lounge: acoustic panels, soft seating zones, a coffee point and meeting pods.",
    },
    description: {
      ru: [
        "Комплектация общественной зоны офиса с упором на акустический комфорт: панели, мягкая мебель с высокими спинками, переговорные капсулы.",
        "Вся мебель сертифицирована для коммерческого использования; поставка выполнена в два этапа без остановки работы офиса.",
      ],
      en: [
        "Procurement of an office common area focused on acoustic comfort: panels, high-back soft seating, meeting pods.",
        "All furniture is certified for commercial use; delivery was completed in two stages without disrupting the office.",
      ],
    },
    scope: {
      ru: ["Мягкие зоны и капсулы", "Акустические панели", "Кофе-поинт", "Озеленение и кашпо"],
      en: ["Soft zones and pods", "Acoustic panels", "Coffee point", "Planting and planters"],
    },
    tags: { ru: ["Офис", "Коммерческое"], en: ["Office", "Commercial"] },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
