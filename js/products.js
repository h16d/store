const PRODUCTS = [
  {
    id: 1,
    name: "ساعت هوشمند",
    description: "نمایشگر لمسی، پایش ضربان قلب و باتری ۷ روزه — مناسب ورزش و کار روزانه.",
    price: 1850000,
    emoji: "⌚",
    gradient: "linear-gradient(135deg, #667eea, #764ba2)"
  },
  {
    id: 2,
    name: "هدفون بی‌سیم",
    description: "کیفیت صدای بالا با نویزکنسلینگ فعال و میکروفن مکالمه — تا ۳۰ ساعت پخش.",
    price: 2400000,
    emoji: "🎧",
    gradient: "linear-gradient(135deg, #f093fb, #f5576c)"
  },
  {
    id: 3,
    name: "کیف چرمی",
    description: "چرم طبیعی با دوخت دست و گارانتی یک‌ساله — بادوام و شیک برای روزمره.",
    price: 980000,
    emoji: "👜",
    gradient: "linear-gradient(135deg, #fa709a, #fee140)"
  }
];

const CURRENCY = "تومان";

function formatPrice(price) {
  return new Intl.NumberFormat("fa-IR").format(price);
}