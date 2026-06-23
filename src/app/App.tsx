import { useState, useRef, useCallback, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from "recharts";
import {
  Search, ChevronDown, X, BookOpen, Beaker, Map,
  HelpCircle, Info, CheckCircle, XCircle,
  ArrowRight, Play, RefreshCw, Fish,
  Zap, Award, ChevronLeft, Menu, Target, Download,
  Eye, MapPin, Cpu, Database, FlaskConical, Waves,
  AlertTriangle, Loader2, RotateCcw,
} from "lucide-react";

// ============================================================
// DATA — freshwater aquaculture (Bangladesh IoT dataset context)
// ============================================================

const LOCATIONS = [
  {
    id: "klaten",
    name: "Klaten, Jawa Tengah",
    shortName: "Klaten",
    cx: 49, cy: 62,
    params: { ph: 7.2, temp: 28, turbidity: 8 },
    description: "Sentra budidaya nila, ikan mas, dan karper di Jawa Tengah. Kualitas air kolam relatif baik dengan suhu optimal dan kekeruhan rendah.",
    ecosystem: "Kolam Nila & Mas",
    color: "#0891B2",
  },
  {
    id: "cianjur",
    name: "Cianjur, Jawa Barat",
    shortName: "Cianjur",
    cx: 44, cy: 64,
    params: { ph: 7.0, temp: 24, turbidity: 5 },
    description: "Dataran tinggi Cianjur dengan suhu air lebih sejuk. Ideal untuk mas, koi, dan patin. Kekeruhan sangat rendah berkat sumber mata air gunung.",
    ecosystem: "Kolam Mas & Koi",
    color: "#10B981",
  },
  {
    id: "palembang",
    name: "Palembang, Sumatera Selatan",
    shortName: "Palembang",
    cx: 38, cy: 58,
    params: { ph: 6.8, temp: 30, turbidity: 15 },
    description: "Sentra patin dan nila di sekitar Sungai Musi. Suhu tinggi khas Sumatera, pH sedikit asam, kekeruhan lebih tinggi dari aliran sungai.",
    ecosystem: "Karamba Patin",
    color: "#F59E0B",
  },
  {
    id: "banjarmasin",
    name: "Banjarmasin, Kalimantan Selatan",
    shortName: "Banjarmasin",
    cx: 60, cy: 56,
    params: { ph: 6.5, temp: 29, turbidity: 20 },
    description: "Budidaya di lahan rawa gambut Kalimantan. pH rendah khas gambut, suhu hangat, kekeruhan lebih tinggi. Cocok untuk spesies toleran asam.",
    ecosystem: "Rawa Gambut",
    color: "#8B5CF6",
  },
];

const FISH_DATA = [
  {
    id: "nila",
    name: "Ikan Nila",
    scientific: "Oreochromis niloticus",
    category: "Tawar",
    habitat: "Kolam Budidaya",
    bg: "from-teal-400 to-cyan-500",
    params: { ph: [6.5, 8.5], temp: [25, 32], turbidity: [5, 25] },
    story: "Nila adalah primadona budidaya air tawar Indonesia. Adaptasinya tinggi, pertumbuhannya cepat, dan toleransinya luas terhadap variasi kualitas air menjadikannya spesies unggulan.",
    habitat_detail: "Kolam tanah, kolam beton, dan karamba di perairan tawar tropis. Berasal dari Afrika Timur, kini tersebar luas.",
    diet: "Omnivora — alga, fitoplankton, dedaunan, dan pakan pelet buatan.",
    fact: "Nila jantan tumbuh 2x lebih cepat dari betina — teknik budidaya monosex jantan kini dominan di industri.",
    conservation: "Least Concern — salah satu spesies budidaya terpenting dunia. Namun dianggap invasif di ekosistem alami.",
  },
  {
    id: "rohu",
    name: "Rohu / Rui",
    scientific: "Labeo rohita",
    category: "Tawar",
    habitat: "Kolam & Sungai",
    bg: "from-orange-400 to-amber-500",
    params: { ph: [7.0, 8.5], temp: [24, 32], turbidity: [5, 20] },
    story: "Rohu adalah ikan mas air tawar asli Asia Selatan yang sangat populer di budidaya kolam Bangladesh dan India. Ikan ini berperan penting dalam sistem budidaya polikultur.",
    habitat_detail: "Sungai besar dan kolam budidaya di anak benua Asia Selatan. Di Indonesia mulai dibudidayakan secara terbatas.",
    diet: "Herbivora — fitoplankton, perifiton, dan detritus organik di dasar kolam.",
    fact: "Rohu dapat tumbuh hingga 2 kg dalam 12 bulan di kondisi budidaya optimal — salah satu laju pertumbuhan tertinggi di kelompok ikan karpioidae.",
    conservation: "Least Concern — spesies budidaya utama di Bangladesh, India, dan Pakistan.",
  },
  {
    id: "patin",
    name: "Patin / Pangas",
    scientific: "Pangasianodon hypophthalmus",
    category: "Tawar",
    habitat: "Sungai & Karamba",
    bg: "from-blue-400 to-indigo-500",
    params: { ph: [6.5, 8.0], temp: [26, 32], turbidity: [10, 30] },
    story: "Patin adalah ikan sungai tropis yang kini menjadi komoditas ekspor utama Vietnam dan Indonesia. Daging putihnya diminati pasar internasional.",
    habitat_detail: "Sungai besar tropis Asia Tenggara (Mekong, Musi, dll) dan karamba jaring apung.",
    diet: "Omnivora oportunistik — ikan kecil, crustacea, detritus, dan pakan buatan.",
    fact: "Patin bisa bermigrasi ratusan kilometer di sungai besar untuk memijah — fenomena yang mendorong pengelolaan tangkapan terkoordinasi.",
    conservation: "Least Concern secara global, namun populasi liar menurun karena perubahan aliran sungai.",
  },
  {
    id: "silvercup",
    name: "Mas Perak / Silver Carp",
    scientific: "Hypophthalmichthys molitrix",
    category: "Tawar",
    habitat: "Waduk & Danau",
    bg: "from-gray-300 to-slate-400",
    params: { ph: [7.0, 8.5], temp: [20, 30], turbidity: [5, 20] },
    story: "Silver Carp dikenal luas di budidaya polikultur Asia sebagai 'pembersih' kolam — menyaring fitoplankton dan menjaga keseimbangan ekologi kolam budidaya.",
    habitat_detail: "Sungai besar dan waduk di Asia Timur dan Asia Tengah. Di Indonesia dibudidayakan terbatas.",
    diet: "Filter feeder — menyaring fitoplankton dan detritus halus dari kolom air.",
    fact: "Silver Carp bisa melompat hingga 3 meter ke udara saat terkejut — menjadikannya risiko keselamatan bagi pengemudi perahu di sungai yang telah terinvasi.",
    conservation: "Spesies invasif di Amerika Utara, namun penting untuk budidaya di Asia.",
  },
  {
    id: "katla",
    name: "Katla",
    scientific: "Catla catla",
    category: "Tawar",
    habitat: "Kolam & Sungai",
    bg: "from-emerald-400 to-green-500",
    params: { ph: [7.0, 8.5], temp: [24, 32], turbidity: [5, 20] },
    story: "Katla adalah ikan terbesar dalam sistem budidaya polikultur Asia Selatan. Pertumbuhannya cepat dan dagingnya bernilai ekonomi tinggi di Bangladesh dan India.",
    habitat_detail: "Sungai dan kolam budidaya di anak benua India. Menempati lapisan permukaan dalam polikultur.",
    diet: "Zooplankton, fitoplankton, dan pakan tambahan — berenang di lapisan permukaan kolam.",
    fact: "Dalam sistem polikultur South Asian Composite Carp Culture, Katla, Rohu, dan Mrigal dibudidayakan bersama memanfaatkan zona kolam berbeda.",
    conservation: "Near Threatened — populasi sungai menurun akibat modifikasi habitat dan penangkapan berlebihan.",
  },
  {
    id: "singhi",
    name: "Singhi / Ikan Duri",
    scientific: "Heteropneustes fossilis",
    category: "Tawar",
    habitat: "Rawa & Kolam",
    bg: "from-yellow-500 to-amber-600",
    params: { ph: [6.0, 8.0], temp: [24, 34], turbidity: [10, 35] },
    story: "Singhi adalah ikan lele berduri Asia Selatan yang dikenal sebagai 'ikan obat' di Bangladesh. Memiliki organ pernapasan udara tambahan yang memungkinkan hidup di kolam dangkal.",
    habitat_detail: "Rawa, kolam dangkal, sawah, dan perairan yang kering secara musiman di Asia Selatan.",
    diet: "Omnivora — serangga air, cacing, siput, dan detritus organik.",
    fact: "Singhi memiliki kelenjar racun di duri siripnya — suntikan bisa menyebabkan rasa sakit hebat selama beberapa jam.",
    conservation: "Least Concern — populasi stabil, penting untuk ketahanan pangan komunitas pedesaan.",
  },
  {
    id: "udang",
    name: "Udang Air Tawar",
    scientific: "Macrobrachium sp.",
    category: "Tawar",
    habitat: "Sungai & Kolam",
    bg: "from-pink-400 to-rose-500",
    params: { ph: [7.0, 8.5], temp: [24, 30], turbidity: [5, 15] },
    story: "Udang Macrobrachium adalah udang air tawar yang bernilai ekonomi tinggi. Dikenal sebagai udang galah di Indonesia, sangat diminati pasar lokal dan ekspor.",
    habitat_detail: "Sungai berarus lambat, muara, dan kolam budidaya di daerah tropis Asia Selatan dan Asia Tenggara.",
    diet: "Omnivora benthik — alga, detritus, serangga air, dan pakan buatan.",
    fact: "Udang galah jantan memiliki capit yang sangat panjang — hingga 1,5 kali panjang tubuhnya — digunakan untuk bersaing dengan jantan lain.",
    conservation: "Least Concern — dibudidayakan secara luas, namun populasi liar terancam overfishing.",
  },
  {
    id: "mas",
    name: "Ikan Mas / Karpio",
    scientific: "Cyprinus carpio",
    category: "Tawar",
    habitat: "Kolam & Sungai",
    bg: "from-amber-300 to-yellow-500",
    params: { ph: [6.5, 8.5], temp: [15, 30], turbidity: [5, 25] },
    story: "Ikan mas adalah salah satu spesies budidaya tertua manusia — dibudidayakan lebih dari 2.000 tahun di China. Di Indonesia, ikan mas adalah ikan kolam paling populer.",
    habitat_detail: "Kolam, danau, dan sungai berarus lambat di zona beriklim sedang hingga tropis.",
    diet: "Omnivora benthik — invertebrata, tumbuhan air, detritus, dan pakan pelet.",
    fact: "Ikan mas adalah spesies ikan budidaya tertua dunia dan memiliki ratusan varietas domestik yang dikembangkan manusia selama milenium.",
    conservation: "Least Concern — namun invasif dan merusak ekosistem alami di banyak negara.",
  },
  {
    id: "prawn",
    name: "Udang Galah",
    scientific: "Macrobrachium rosenbergii",
    category: "Tawar",
    habitat: "Kolam & Muara",
    bg: "from-red-400 to-pink-500",
    params: { ph: [7.0, 8.5], temp: [26, 31], turbidity: [5, 15] },
    story: "Udang galah adalah spesies udang air tawar terbesar di dunia. Nilainya sangat tinggi di pasar — sering disebut 'lobster air tawar' di restoran.",
    habitat_detail: "Muara sungai untuk reproduksi, kemudian bermigrasi ke perairan tawar untuk tumbuh dewasa.",
    diet: "Omnivora oportunistik — ikan, crustacea, serangga, dan organik mati.",
    fact: "Siklus hidup unik: larva harus masuk air asin/payau untuk berkembang, lalu juvenil bermigrasi ke air tawar — perlu dikelola khusus dalam budidaya.",
    conservation: "Least Concern secara global, namun over-eksploitasi mengancam populasi liar di Asia.",
  },
  {
    id: "koi",
    name: "Ikan Koi",
    scientific: "Cyprinus carpio var. koi",
    category: "Tawar",
    habitat: "Kolam Ornamental",
    bg: "from-violet-400 to-purple-600",
    params: { ph: [6.8, 8.2], temp: [15, 28], turbidity: [3, 15] },
    story: "Koi adalah varietas dekoratif ikan mas yang dikembangkan di Jepang. Nilai satu ekor koi berkualitas kompetisi bisa mencapai ratusan juta rupiah.",
    habitat_detail: "Kolam ornamental dengan sirkulasi baik, filtrasi tinggi, dan kejernihan air prima.",
    diet: "Omnivora — pakan khusus koi, cacing, dan organik alami.",
    fact: "Koi bisa hidup hingga 35 tahun (beberapa rekaman mencapai 200 tahun). Warna cerahnya membuat mereka rentan terhadap predator di alam.",
    conservation: "Least Concern — spesies budidaya ornamental, tidak ada status konservasi khusus.",
  },
  {
    id: "lele",
    name: "Lele / Magur",
    scientific: "Clarias magur",
    category: "Tawar",
    habitat: "Kolam & Rawa",
    bg: "from-stone-400 to-gray-600",
    params: { ph: [6.0, 9.0], temp: [22, 35], turbidity: [10, 40] },
    story: "Lele magur adalah lele Asia Selatan yang dikenal sebagai 'walking catfish' — bisa berjalan di darat dan menghirup udara. Toleransi ekstremnya membuatnya ideal untuk budidaya di kondisi sulit.",
    habitat_detail: "Kolam, sawah, rawa, dan perairan dangkal berlumpur di Asia Selatan dan Asia Tenggara.",
    diet: "Omnivora oportunistik — segalanya dari serangga hingga bangkai.",
    fact: "Lele magur terdaftar sebagai salah satu dari 100 spesies invasif paling berbahaya dunia (IUCN) karena kemampuannya berjalan dan bertahan di luar air.",
    conservation: "Least Concern — populasi liar stabil, komoditas budidaya penting untuk ketahanan pangan.",
  },
];

const QUIZ_QUESTIONS = [
  {
    category: "parameter",
    question: "Rentang pH optimal untuk sebagian besar ikan budidaya air tawar adalah...",
    options: ["4.0 – 5.5", "6.0 – 6.5", "6.5 – 8.5", "9.0 – 10.0"],
    correct: 2,
    explanation: "pH 6.5–8.5 adalah rentang optimal untuk mayoritas ikan air tawar tropis. Di bawah 6 menyebabkan stres asam; di atas 9 menyebabkan kerusakan insang.",
  },
  {
    category: "parameter",
    question: "Kekeruhan (turbidity) tinggi (>30 NTU) paling berdampak pada ikan melalui mekanisme apa?",
    options: ["Meningkatkan kandungan oksigen", "Mengurangi penetrasi cahaya dan menyumbat insang", "Menurunkan suhu air", "Meningkatkan pH air"],
    correct: 1,
    explanation: "Kekeruhan tinggi mengurangi fotosintesis alga (sumber O₂), menyumbat insang ikan, dan mengganggu navigasi visual — efek komprehensif pada ekosistem kolam.",
  },
  {
    category: "spesies",
    question: "Spesies manakah yang memiliki toleransi pH paling lebar dalam dataset ini?",
    options: ["Ikan Koi (6.8–8.2)", "Ikan Rohu (7.0–8.5)", "Ikan Mas/Karpio (6.5–8.5)", "Lele/Magur (6.0–9.0)"],
    correct: 3,
    explanation: "Lele/Magur (Clarias magur) memiliki rentang pH 6.0–9.0 — terlebar di antara 11 spesies. Ini sejalan dengan habitatnya di rawa gambut yang keasamannya fluktuatif.",
  },
  {
    category: "spesies",
    question: "Ikan manakah yang paling cocok dibudidayakan di dataran tinggi seperti Cianjur dengan suhu air 24°C?",
    options: ["Patin (26–32°C)", "Singhi (24–34°C)", "Ikan Koi (15–28°C)", "Lele Magur (22–35°C)"],
    correct: 2,
    explanation: "Ikan Koi (15–28°C) paling cocok untuk suhu 24°C Cianjur. Patin terlalu dingin (minimalnya 26°C), sementara Singhi dan Lele toleran tapi lebih optimal di suhu lebih tinggi.",
  },
  {
    category: "dataset",
    question: "Dataset realfishdataset.csv berasal dari monitoring IoT kolam budidaya di mana?",
    options: ["Klaten, Jawa Tengah", "Jamalpur, Bangladesh", "Mekong, Vietnam", "Chennai, India"],
    correct: 1,
    explanation: "Dataset berasal dari 5 kolam budidaya di Jamalpur, Bangladesh, yang dipantau sensor IoT. Data mencakup 3 parameter: pH, Suhu, dan Kekeruhan.",
  },
  {
    category: "dataset",
    question: "Algoritma machine learning apa yang digunakan Akuanesia untuk prediksi kecocokan spesies?",
    options: ["Linear Regression", "K-Nearest Neighbors", "Random Forest", "Neural Network"],
    correct: 2,
    explanation: "Random Forest dipilih karena kemampuannya menangani hubungan non-linear antar parameter, tahan terhadap overfitting, dan memberikan feature importance yang interpretatif.",
  },
];

// ============================================================
// HELPERS
// ============================================================

type CompatibilityStatus = "cocok" | "kurang_ideal" | "tidak_cocok";

interface ParamDetail {
  param: string;
  label: string;
  value: number;
  idealMin: number;
  idealMax: number;
  unit: string;
  inRange: boolean;
}

function checkCompatibility(fish: typeof FISH_DATA[0], loc: typeof LOCATIONS[0]) {
  const p = fish.params;
  const l = loc.params;
  const checks: ParamDetail[] = [
    { param: "ph", label: "pH", value: l.ph, idealMin: (p.ph as number[])[0], idealMax: (p.ph as number[])[1], unit: "", inRange: false },
    { param: "temp", label: "Suhu", value: l.temp, idealMin: (p.temp as number[])[0], idealMax: (p.temp as number[])[1], unit: "°C", inRange: false },
    { param: "turbidity", label: "Kekeruhan", value: l.turbidity, idealMin: (p.turbidity as number[])[0], idealMax: (p.turbidity as number[])[1], unit: "NTU", inRange: false },
  ];
  let issues = 0;
  for (const c of checks) {
    c.inRange = c.value >= c.idealMin && c.value <= c.idealMax;
    if (!c.inRange) issues++;
  }
  let status: CompatibilityStatus;
  if (issues >= 2) status = "tidak_cocok";
  else if (issues === 1) status = "kurang_ideal";
  else status = "cocok";
  return { status, issues, details: checks };
}

function genHistoricalData(baseVal: number, variance: number) {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return months.map((m) => ({ month: m, value: parseFloat((baseVal + (Math.random() - 0.5) * variance * 2).toFixed(2)) }));
}

const STATUS_CONFIG = {
  cocok: { label: "Cocok", bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  kurang_ideal: { label: "Kurang Ideal", bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
  tidak_cocok: { label: "Tidak Cocok", bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
};

// ============================================================
// AI QUIZ — contextual 5 questions per fish+location
// ============================================================

function generateAIQuiz(fish: typeof FISH_DATA[0], loc: typeof LOCATIONS[0]) {
  const result = checkCompatibility(fish, loc);
  const good = result.details.filter((d) => d.inRange);
  return [
    {
      q: `Berdasarkan analisis, parameter mana yang paling mendukung ${fish.name} di kolam ${loc.shortName}?`,
      options: ["pH", "Suhu", "Kekeruhan", "Tidak ada yang sesuai"],
      correct: good.length > 0 ? ["ph", "temp", "turbidity"].indexOf(good[0].param) : 3,
      explanation: good.length > 0
        ? `${good[0].label} kolam ${loc.shortName} berada dalam rentang ideal ${fish.name} — parameter inilah yang paling mendukung kelangsungan hidupnya.`
        : `Tidak ada parameter yang optimal. Semua nilai di luar rentang ideal ${fish.name} di lokasi ini.`,
    },
    {
      q: `Jika pH kolam ${loc.shortName} turun ke 5.5, apa yang kemungkinan terjadi pada ${fish.name}?`,
      options: [
        `${fish.name} mengalami stres fisiologis dan rentan penyakit`,
        `${fish.name} tumbuh lebih cepat karena lingkungan asam`,
        `Tidak ada pengaruh, ikan menyesuaikan diri otomatis`,
        `Kekeruhan meningkat dan membantu pertumbuhan`,
      ],
      correct: 0,
      explanation: `pH 5.5 jauh di bawah rentang minimum ${fish.name} (${(fish.params.ph as number[])[0]}). Kondisi asam mengganggu regulasi ion, melemahkan imun, dan bisa menyebabkan kematian massal.`,
    },
    {
      q: "Tiga parameter yang diukur sensor IoT dalam dataset realfishdataset.csv adalah...",
      options: ["pH, Suhu, Kekeruhan", "pH, DO (Oksigen), Salinitas", "Suhu, Amonia, Nitrat", "pH, Salinitas, DO"],
      correct: 0,
      explanation: "Dataset IoT dari Jamalpur, Bangladesh mengukur pH, Suhu, dan Kekeruhan — tiga parameter yang bisa dipantau sensor murah secara real-time di kolam budidaya.",
    },
    {
      q: `Kekeruhan kolam ${loc.shortName} adalah ${loc.params.turbidity} NTU. Apa dampaknya bagi ${fish.name}?`,
      options: [
        `Dalam rentang ideal (${(fish.params.turbidity as number[])[0]}–${(fish.params.turbidity as number[])[1]} NTU) — normal`,
        "Terlalu jernih — ikan stres karena terlalu terekspos",
        "Kekeruhan tidak mempengaruhi ikan sama sekali",
        "Meningkatkan kandungan oksigen terlarut",
      ],
      correct: result.details.find((d) => d.param === "turbidity")?.inRange ? 0 : 1,
      explanation: result.details.find((d) => d.param === "turbidity")?.inRange
        ? `Kekeruhan ${loc.params.turbidity} NTU dalam rentang ideal ${fish.name}. Kondisi normal mendukung pertumbuhan.`
        : `Kekeruhan ${loc.params.turbidity} NTU di luar rentang ideal ${fish.name} (${(fish.params.turbidity as number[])[0]}–${(fish.params.turbidity as number[])[1]} NTU). Dapat mengganggu insang dan navigasi.`,
    },
    {
      q: "Mengapa Random Forest dipilih sebagai algoritma ML di Akuanesia?",
      options: [
        "Menangani hubungan non-linear, tahan overfitting, dan interpretatif",
        "Paling sederhana dan mudah diimplementasi",
        "Hanya bekerja untuk data numerik saja",
        "Membutuhkan data paling sedikit dibanding algoritma lain",
      ],
      correct: 0,
      explanation: "Random Forest unggul karena: (1) menangkap hubungan non-linear antar pH/Suhu/Kekeruhan, (2) tahan overfitting berkat ensemble decision tree, (3) menghasilkan feature importance untuk interpretasi ilmiah.",
    },
  ];
}

type Page = "beranda" | "virtual-lab" | "sim1" | "sim2" | "sim3" | "database" | "fish-detail" | "kuis" | "tentang";

// ============================================================
// COMPONENTS
// ============================================================

function Navbar({ page, navigate }: { page: Page; navigate: (p: Page, e?: Record<string, unknown>) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links: { id: Page; label: string }[] = [
    { id: "beranda", label: "Beranda"},
    { id: "virtual-lab", label: "Virtual Lab" },
    { id: "database", label: "Database Ikan" },
    { id: "kuis", label: "Kuis" },
    { id: "tentang", label: "Tentang" },
  ];
  const activePage = ["sim1", "sim2", "sim3"].includes(page) ? "virtual-lab" : page === "fish-detail" ? "database" : page;
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border shadow-sm" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <button onClick={() => navigate("beranda")} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Waves size={16} className="text-white" /></div>
          <span className="text-lg font-bold text-primary">Akuanesia</span>
        </button>
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <button key={l.id} onClick={() => navigate(l.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${activePage === l.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
              {l.label}
            </button>
          ))}
        </div>
        <button className="md:hidden p-2 rounded-lg text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}><Menu size={20} /></button>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-2 space-y-1">
          {links.map((l) => (
            <button key={l.id} onClick={() => { navigate(l.id); setMobileOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${activePage === l.id ? "bg-primary/10 text-primary" : "hover:bg-muted/50"}`}>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-foreground text-white py-10 mt-16" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center"><Waves size={14} className="text-white" /></div>
              <span className="text-base font-bold" style={{ fontFamily: "Poppins" }}>Akuanesia</span>
            </div>
            <p className="text-white/60 text-sm max-w-xs">Platform virtual lab untuk membantu siswa dan mahasiswa memahami perikanan Indonesia melalui simulasi dan eksperimen interaktif.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="font-semibold text-white/80 mb-2">Konten Utama</p>
              <p className="text-white/50">Virtual lab</p>
              <p className="text-white/50">Database ikan</p>
              <p className="text-white/50">Mulai kuis</p>
              <p className="text-white/50">Tentang data</p>
              <p className="text-white/50">Tentang perairan</p>
            </div>
            <div>
              <p className="font-semibold text-white/80 mb-2">Connect</p>
              <p className="text-white/50">Hubungi kami</p>
              <p className="text-white/50">Bagikan cerita kamu</p>
              <p className="text-white/50">Kegiatan</p>
              <p className="text-white/50">Dapatkan update lewat email</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 text-center text-white/40 text-xs">© 2024 The Fishermen UB — Pendidikan Perikanan Indonesia</div>
      </div>
    </footer>
  );
}

function StatusBadge({ status, size = "sm" }: { status: CompatibilityStatus; size?: "sm" | "lg" }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full border ${c.bg} ${c.text} ${c.border} ${size === "lg" ? "px-4 py-1.5 text-sm" : "px-2.5 py-0.5 text-xs"}`}>
      {status === "cocok" && <CheckCircle size={size === "lg" ? 14 : 11} />}
      {status === "kurang_ideal" && <AlertTriangle size={size === "lg" ? 14 : 11} />}
      {status === "tidak_cocok" && <XCircle size={size === "lg" ? 14 : 11} />}
      {c.label}
    </span>
  );
}

// ============================================================
// AI QUIZ INLINE
// ============================================================

function AIQuizInline({ fish, loc }: { fish: typeof FISH_DATA[0]; loc: typeof LOCATIONS[0] }) {
  const [phase, setPhase] = useState<"loading" | "question" | "complete">("loading");
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const questions = generateAIQuiz(fish, loc);

  useEffect(() => {
    setPhase("loading"); setQIdx(0); setSelected(null); setAnswers([]);
    const t = setTimeout(() => setPhase("question"), 1600);
    return () => clearTimeout(t);
  }, [fish.id, loc.id]);

  function handleNext() {
    setAnswers((a) => [...a, selected!]);
    if (qIdx + 1 >= questions.length) setPhase("complete");
    else { setQIdx(qIdx + 1); setSelected(null); }
  }

  const score = answers.filter((a, i) => a === questions[i]?.correct).length;
  const currentQ = questions[qIdx];

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-primary/10 to-teal-50 border-b border-border flex items-center gap-2">
        <Cpu size={14} className="text-primary" />
        <span className="text-xs font-bold text-primary">Uji Pemahamanmu</span>
        <span className="text-xs text-muted-foreground ml-auto">Pertanyaan AI dari hasil analisismu</span>
      </div>

      {phase === "loading" && (
        <div className="p-6 flex flex-col items-center gap-3">
          <Loader2 size={24} className="text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">AI sedang menyusun pertanyaan kontekstual...</p>
          <p className="text-xs text-muted-foreground/60">{fish.name} × {loc.shortName}</p>
        </div>
      )}

      {phase === "question" && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground">Soal {qIdx + 1} / {questions.length}</span>
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div key={i} className={`h-1.5 w-5 rounded-full ${i < qIdx ? "bg-primary" : i === qIdx ? "bg-primary/60" : "bg-muted"}`} />
              ))}
            </div>
          </div>
          <div className="bg-muted/30 rounded-xl p-3 mb-3">
            <p className="text-sm font-semibold leading-snug">{currentQ.q}</p>
          </div>
          <div className="space-y-2 mb-3">
            {currentQ.options.map((opt, i) => {
              let cls = "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer";
              if (selected !== null) {
                if (i === currentQ.correct) cls = "border-green-400 bg-green-50 cursor-default";
                else if (i === selected && i !== currentQ.correct) cls = "border-red-400 bg-red-50 cursor-default";
                else cls = "border-border opacity-50 cursor-default";
              }
              return (
                <button key={i} onClick={() => { if (selected === null) setSelected(i); }} disabled={selected !== null}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${cls}`}>
                  <span className="font-bold text-muted-foreground mr-1.5">{String.fromCharCode(65 + i)}.</span>{opt}
                  {selected !== null && i === currentQ.correct && <span className="float-right text-green-600">✓</span>}
                  {selected !== null && i === selected && i !== currentQ.correct && <span className="float-right text-red-500">✗</span>}
                </button>
              );
            })}
          </div>
          {selected !== null && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3 animate-in fade-in duration-200">
              <p className="text-xs leading-relaxed text-blue-800">{currentQ.explanation}</p>
            </div>
          )}
          {selected !== null && (
            <button onClick={handleNext} className="w-full bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90">
              {qIdx + 1 >= questions.length ? "Lihat Skor →" : "Pertanyaan Berikutnya →"}
            </button>
          )}
        </div>
      )}

      {phase === "complete" && (
        <div className="p-5 text-center">
          <div className="text-4xl mb-2">{score >= 4 ? "🏆" : score >= 3 ? "⭐" : "📚"}</div>
          <div className="text-3xl font-black text-primary mb-1" style={{ fontFamily: "Poppins" }}>{score}/{questions.length}</div>
          <p className="text-sm font-semibold mb-1">{score === 5 ? "Luar Biasa!" : score >= 3 ? "Bagus! Hampir sempurna!" : "Yuk pelajari lebih dalam!"}</p>
          <p className="text-xs text-muted-foreground mb-4">{fish.name} × {loc.shortName}</p>
          <button onClick={() => { setPhase("loading"); setQIdx(0); setSelected(null); setAnswers([]); setTimeout(() => setPhase("question"), 1200); }}
            className="flex items-center gap-2 mx-auto text-xs border border-border rounded-lg px-3 py-2 hover:bg-muted/40">
            <RotateCcw size={12} />Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PAGE: BERANDA
// ============================================================

function BerandaPage({ navigate }: { navigate: (p: Page, e?: Record<string, unknown>) => void }) {
  const labs = [
    { id: "sim1", title: "Eksplorasi Kolam Indonesia", desc: "Pilih lokasi sentra budidaya di peta, seret spesies ikan, dan lihat analisis kecocokan berbasis data IoT.", level: "Dasar", lc: "bg-green-100 text-green-700", emoji: "🗺️" },
    { id: "sim2", title: "Simulasi Parameter Air", desc: "Atur 3 parameter (pH, Suhu, Kekeruhan) bebas dan lihat prediksi kelayakan hidup spesies real-time.", level: "Menengah", lc: "bg-yellow-100 text-yellow-700", emoji: "⚗️" },
    { id: "sim3", title: "Identifikasi Zona Budidaya", desc: "Klik zona budidaya air tawar dan pelajari karakteristik serta spesies khas masing-masing.", level: "Menengah", lc: "bg-yellow-100 text-yellow-700", emoji: "🌊" },
    { id: "sim4", title: "Simulasi Dampak Pencemaran", desc: "Simulasikan dampak polutan terhadap kolam dan kelangsungan hidup ikan.", level: "Coming Soon", lc: "bg-gray-100 text-gray-500", emoji: "🔒", disabled: true },
  ];

  return (
    <div style={{ fontFamily: "Nunito, sans-serif" }}>
      {/* Hero */}
      <section className="relative overflow-hidden text-white" style={{
        backgroundImage: "url('/hero-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.05) 100%)"
        }} />
        <div className="absolute bottom-0 left-0 right-0" style={{
          height: "120px",
          background: "linear-gradient(to bottom, transparent, white)",
          zIndex: 10
        }} />
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 rounded-full px-3 py-1 mb-5"><Database size={12} />Platform Virtual Lab</span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5" style={{ fontFamily: "Poppins" }}>Jelajahi & Pelajari Perairan Indonesia</h1>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">Platform virtual lab berbasis machine learning untuk eksplorasi kecocokan ikan dan habitat perairan Indonesia.</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate("sim1")} className="inline-flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-xl hover:bg-white/90 shadow-lg">
                Mulai Eksplorasi <ArrowRight size={16} />
              </button>
              <button onClick={() => navigate("tentang")} className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/30">
                Tentang Dataset
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Cara Kerja */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-2" style={{ fontFamily: "Poppins" }}>Cara Kerja</h2>
        <p className="text-muted-foreground text-center mb-10 text-sm">Tiga langkah mudah untuk mulai belajar ekosistem perairan Indonesia</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: <Target size={24} />, title: "Pilih Simulasi", desc: "Pilih salah satu dari =modul virtual lab sesuai level pemahamanmu.", step: "01" },
            { icon: <Beaker size={24} />, title: "Interaksi & Eksplorasi", desc: "Uji pemahaman melalui simulasi yang menyenangkan dan praktis.", step: "02" },
            { icon: <Award size={24} />, title: "Pelajari & Uji Diri", desc: "Baca hasil analisis AI, jelajahi database spesies, dan ikuti kuis interaktif.", step: "03" },
          ].map((s) => (
            <div key={s.step} className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden hover:shadow-md transition-shadow">
              <div className="absolute top-4 right-4 text-6xl font-black text-primary/5" style={{ fontFamily: "Poppins" }}>{s.step}</div>
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">{s.icon}</div>
              <h3 className="font-bold text-base mb-2" style={{ fontFamily: "Poppins" }}>{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lab cards */}
      <section className="bg-secondary/30 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Poppins" }}>Virtual Lab Kami</h2>
          <p className="text-muted-foreground text-sm mb-8">4 modul simulasi interaktif berbasis data IoT nyata</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {labs.map((lab) => (
              <div key={lab.id} className={`bg-card border border-border rounded-2xl overflow-hidden flex flex-col ${(lab as { disabled?: boolean }).disabled ? "opacity-60" : "hover:shadow-lg hover:-translate-y-1 transition-all"}`}>
                <div className={`h-28 flex items-center justify-center text-5xl ${(lab as { disabled?: boolean }).disabled ? "bg-muted" : "bg-gradient-to-br from-primary/20 to-teal-400/20"}`}>{lab.emoji}</div>
                <div className="p-4 flex flex-col flex-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit mb-2 ${lab.lc}`}>{lab.level}</span>
                  <h3 className="font-bold text-sm mb-2 leading-snug" style={{ fontFamily: "Poppins" }}>{lab.title}</h3>
                  <p className="text-xs text-muted-foreground flex-1">{lab.desc}</p>
                  <button onClick={() => !(lab as { disabled?: boolean }).disabled && navigate(lab.id as Page)} disabled={(lab as { disabled?: boolean }).disabled}
                    className={`mt-4 w-full py-2 rounded-lg text-sm font-semibold ${(lab as { disabled?: boolean }).disabled ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-white hover:bg-primary/90"}`}>
                    {(lab as { disabled?: boolean }).disabled ? "Segera Hadir" : "Coba Sekarang"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center" style={{ fontFamily: "Poppins" }}>Indonesia & Coral Triangle</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "🪸", value: "37%", label: "Terumbu Karang Dunia", desc: "Indonesia memiliki 37% terumbu karang dunia, menjadikannya pusat keanekaragaman laut global." },
            { icon: "🐟", value: "6.000+", label: "Spesies Ikan", desc: "Lebih dari 6.000 spesies ikan ditemukan di perairan Indonesia — terkaya di planet ini." },
            { icon: "🌊", value: "5,8 juta km²", label: "Wilayah Laut", desc: "Luas laut Indonesia mencapai 5,8 juta km², menjadikan Indonesia negara kepulauan terbesar dunia." },
          ].map((f) => (
            <div key={f.value} className="bg-gradient-to-br from-primary/5 to-teal-50 border border-primary/15 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <div className="text-3xl font-black text-primary mb-1" style={{ fontFamily: "Poppins" }}>{f.value}</div>
              <div className="font-bold text-sm mb-2">{f.label}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pathway */}
      <section className="bg-foreground py-12">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-white/60 text-sm text-center mb-6">Mulai dari Sini</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {([["tentang", "Tentang Dataset"], ["database", "Database Ikan"], ["virtual-lab", "Virtual Lab"], ["kuis", "Kuis"]] as [Page, string][]).map(([p, l], i, arr) => (
              <div key={p} className="flex items-center gap-2">
                <button onClick={() => navigate(p)} className="text-white border border-white/30 hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-semibold">{l}</button>
                {i < arr.length - 1 && <ArrowRight size={16} className="text-white/40" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ============================================================
// PAGE: VIRTUAL LAB HUB
// ============================================================

function VirtualLabPage({ navigate }: { navigate: (p: Page, e?: Record<string, unknown>) => void }) {
  return (
    <div style={{ fontFamily: "Nunito, sans-serif" }}>
      <div className="bg-gradient-to-r from-primary to-cyan-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Poppins" }}>Virtual Lab</h1>
          <p className="text-white/80">Eksplorasi interaktif budidaya perikanan berbasis data IoT</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-6">
        {[
          { id: "sim1", emoji: "🗺️", title: "Eksplorasi Kolam Indonesia", level: "Dasar", lc: "bg-green-100 text-green-700",
            desc: "Pilih lokasi sentra budidaya di peta, drag & drop 11 spesies ikan, lihat analisis kecocokan berbasis sensor IoT (pH, Suhu, Kekeruhan).",
            features: ["Peta 4 sentra budidaya air tawar", "Drag & drop 11 spesies", "Analisis 3 parameter IoT", "AI quiz kontekstual 5 soal"] },
          { id: "sim2", emoji: "⚗️", title: "Simulasi Parameter Air", level: "Menengah", lc: "bg-yellow-100 text-yellow-700",
            desc: "Atur 3 slider parameter (pH, Suhu, Kekeruhan) dan lihat prediksi secara real-time.",
            features: ["3 slider parameter IoT", "Kolam visual real-time", "Badge status otomatis", "Preset data lokasi nyata"] },
          { id: "sim3", emoji: "🌊", title: "Identifikasi Zona Budidaya", level: "Menengah", lc: "bg-yellow-100 text-yellow-700",
            desc: "Klik 5 zona sistem budidaya air tawar dan pelajari karakteristik, parameter, serta spesies khas.",
            features: ["5 zona budidaya klikable", "Video edukasi per zona", "Profil spesies per sistem", "Tabel parameter rata-rata"] },
          { id: "sim4", emoji: "🔒", title: "Simulasi Dampak Pencemaran", level: "Coming Soon", lc: "bg-gray-100 text-gray-500",
            desc: "Simulasikan dampak polutan terhadap kualitas kolam.", disabled: true, features: ["Segera hadir"] },
        ].map((lab) => (
          <div key={lab.id} className={`bg-card border border-border rounded-2xl overflow-hidden flex flex-col ${(lab as { disabled?: boolean }).disabled ? "opacity-60" : "hover:shadow-lg transition-shadow"}`}>
            <div className={`h-36 flex items-center justify-center text-6xl ${(lab as { disabled?: boolean }).disabled ? "bg-muted" : "bg-gradient-to-br from-primary/15 to-teal-400/15"}`}>{lab.emoji}</div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg" style={{ fontFamily: "Poppins" }}>{lab.title}</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ml-2 ${lab.lc}`}>{lab.level}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{lab.desc}</p>
              <ul className="space-y-1.5 flex-1 mb-5">
                {lab.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => !(lab as { disabled?: boolean }).disabled && navigate(lab.id as Page)} disabled={(lab as { disabled?: boolean }).disabled}
                className={`w-full py-2.5 rounded-xl text-sm font-bold ${(lab as { disabled?: boolean }).disabled ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-white hover:bg-primary/90"}`}>
                {(lab as { disabled?: boolean }).disabled ? "Segera Hadir" : "Mulai Simulasi"}
              </button>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}

// ============================================================
// PAGE: SIMULASI 1
// ============================================================

function Sim1Page({ navigate }: { navigate: (p: Page, e?: Record<string, unknown>) => void }) {
  const [selectedLocation, setSelectedLocation] = useState<typeof LOCATIONS[0] | null>(null);
  const [droppedFish, setDroppedFish] = useState<typeof FISH_DATA[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [detailMode, setDetailMode] = useState<"detail" | "simple">("detail");
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [chartParam, setChartParam] = useState("ph");
  const [draggingFish, setDraggingFish] = useState<typeof FISH_DATA[0] | null>(null);
  const [pondHighlight, setPondHighlight] = useState(false);

  const filteredFish = FISH_DATA.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.scientific.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const result = droppedFish && selectedLocation ? checkCompatibility(droppedFish, selectedLocation) : null;

  const handleDrop = useCallback(() => {
    if (!selectedLocation || !draggingFish) return;
    setDroppedFish(draggingFish); setShowResult(true); setDraggingFish(null); setPondHighlight(false);
  }, [draggingFish, selectedLocation]);

  const paramLabels: Record<string, { label: string; min: number; max: number; variance: number }> = {
    ph: { label: "pH", min: 6, max: 9, variance: 0.3 },
    temp: { label: "Suhu (°C)", min: 20, max: 35, variance: 1.5 },
    turbidity: { label: "Kekeruhan (NTU)", min: 0, max: 30, variance: 3 },
  };

  const histData = selectedLocation ? genHistoricalData(selectedLocation.params[chartParam as keyof typeof selectedLocation.params] as number, paramLabels[chartParam].variance) : [];

  const pondBg = !result ? "from-blue-200 to-cyan-300" :
    result.status === "cocok" ? "from-green-200 to-teal-300" :
    result.status === "kurang_ideal" ? "from-yellow-100 to-amber-200" :
    "from-red-100 to-red-200";

  return (
    <div style={{ fontFamily: "Nunito, sans-serif" }}>
      <div className="bg-gradient-to-r from-primary to-cyan-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-3">
          <button onClick={() => navigate("virtual-lab")} className="p-1 rounded-lg hover:bg-white/20"><ChevronLeft size={20} /></button>
          <div>
            <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-semibold">Dasar</span>
            <h1 className="text-2xl font-bold mt-1" style={{ fontFamily: "Poppins" }}>Eksplorasi Kolam Budidaya Indonesia</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* MAP */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-sm" style={{ fontFamily: "Poppins" }}>🗺️ Peta Sentra Budidaya Air Tawar Indonesia</h2>
              <span className="text-xs text-muted-foreground">Klik marker untuk pilih lokasi</span>
            </div>
            <div className="relative bg-gradient-to-br from-green-50 to-teal-50" style={{ aspectRatio: "2.5/1" }}>
              <svg viewBox="0 0 200 80" className="w-full h-full absolute inset-0 p-3">
                <path d="M18,38 Q22,33 28,35 Q34,37 38,42 Q40,48 36,52 Q30,55 24,50 Q18,46 18,38Z" fill="#D1FAE5" stroke="#059669" strokeWidth="0.5" opacity="0.7" />
                <path d="M36,50 Q44,46 52,48 Q58,50 62,53 Q64,57 60,60 Q52,62 44,60 Q38,57 36,50Z" fill="#D1FAE5" stroke="#059669" strokeWidth="0.5" opacity="0.7" />
                <path d="M55,30 Q65,25 75,28 Q82,32 80,42 Q78,50 70,54 Q62,56 56,50 Q50,42 55,30Z" fill="#D1FAE5" stroke="#059669" strokeWidth="0.5" opacity="0.7" />
                <path d="M80,28 Q85,24 90,27 Q93,32 90,38 Q86,42 82,40 Q78,35 80,28Z" fill="#D1FAE5" stroke="#059669" strokeWidth="0.5" opacity="0.7" />
                <path d="M130,35 Q142,30 155,32 Q165,35 165,45 Q163,55 150,55 Q138,55 130,48 Q126,42 130,35Z" fill="#D1FAE5" stroke="#059669" strokeWidth="0.5" opacity="0.7" />
                <text x="100" y="73" textAnchor="middle" fontSize="4" fill="#0891B2" opacity="0.5">Perairan Nusantara</text>
              </svg>
              <div className="absolute inset-0">
                {LOCATIONS.map((loc) => (
                  <button key={loc.id} onClick={() => { setSelectedLocation(loc); setDroppedFish(null); setShowResult(false); }}
                    className="absolute group" style={{ left: `${loc.cx}%`, top: `${loc.cy}%`, transform: "translate(-50%,-50%)" }}>
                    <div className={`relative transition-all ${selectedLocation?.id === loc.id ? "scale-125" : "hover:scale-110"}`}>
                      <div className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ backgroundColor: loc.color }} />
                      <div className="relative w-7 h-7 rounded-full border-2 border-white shadow-md flex items-center justify-center" style={{ backgroundColor: loc.color }}>
                        <MapPin size={12} className="text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-foreground text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none">
                      {loc.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {selectedLocation ? (
              <div className="border-t border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedLocation.color }} />
                  <h3 className="font-bold text-sm" style={{ fontFamily: "Poppins" }}>{selectedLocation.name}</h3>
                  <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">{selectedLocation.ecosystem}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{selectedLocation.description}</p>
                <div className="grid grid-cols-3 gap-2">
                  {[["pH", selectedLocation.params.ph, ""], ["Suhu", selectedLocation.params.temp, "°C"], ["Kekeruhan", selectedLocation.params.turbidity, "NTU"]].map(([l, v, u]) => (
                    <div key={l as string} className="bg-primary/5 rounded-xl p-2.5 text-center">
                      <p className="text-xs text-muted-foreground">{l}</p>
                      <p className="font-bold text-sm text-primary">{v}<span className="text-xs font-normal text-muted-foreground ml-0.5">{u}</span></p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">📡 Data IoT Sensor | realfishdataset.csv</p>
              </div>
            ) : (
              <div className="border-t border-border p-4 text-center text-sm text-muted-foreground">👆 Klik marker di peta untuk melihat kondisi kolam</div>
            )}
          </div>

          {/* POND */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h2 className="font-bold text-sm" style={{ fontFamily: "Poppins" }}>💧 Kolam Simulasi — Seret Ikan ke Sini</h2>
            </div>
            <div onDragOver={(e) => { e.preventDefault(); setPondHighlight(true); }}
              onDragLeave={() => setPondHighlight(false)}
              onDrop={handleDrop}
              className={`h-36 bg-gradient-to-b ${pondBg} transition-all duration-500 rounded-b-2xl flex items-center justify-center border-2 border-dashed ${pondHighlight ? "border-primary" : "border-transparent"}`}
            >
              {!droppedFish ? (
                <div className="text-center">
                  <p className="text-4xl mb-2 opacity-60">💧</p>
                  <p className="text-sm font-medium text-blue-800/60">{selectedLocation ? "Seret ikan ke kolam untuk analisis" : "Pilih lokasi dulu, lalu seret ikan"}</p>
                </div>
              ) : (
                <div className="text-center animate-in fade-in zoom-in duration-300">
                  <p className="text-5xl mb-1">🐟</p>
                  <p className="text-sm font-bold text-blue-900">{droppedFish.name}</p>
                  {result && <StatusBadge status={result.status} />}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden sticky top-20">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-bold text-sm mb-2" style={{ fontFamily: "Poppins" }}>Pilih Ikan (11 Spesies)</h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari spesies..."
                  className="w-full pl-8 pr-3 py-2 text-xs border border-border rounded-lg bg-input-background focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2 max-h-[calc(100vh-280px)] overflow-y-auto">
              {filteredFish.map((fish) => (
                <div key={fish.id} draggable onDragStart={() => setDraggingFish(fish)} onDragEnd={() => setDraggingFish(null)}
                  onClick={() => { if (!selectedLocation) { alert("Pilih lokasi dulu!"); return; } setDroppedFish(fish); setShowResult(true); }}
                  className={`cursor-grab active:cursor-grabbing rounded-xl overflow-hidden border transition-all hover:shadow-sm ${draggingFish?.id === fish.id ? "opacity-50 scale-95" : ""} ${droppedFish?.id === fish.id ? "ring-2 ring-primary" : "border-border"}`}>
                  <div className={`h-14 bg-gradient-to-br ${fish.bg} flex items-center justify-center text-2xl`}>🐟</div>
                  <div className="p-2 bg-card">
                    <p className="text-xs font-semibold leading-tight">{fish.name}</p>
                    <p className="text-xs text-muted-foreground italic truncate">{fish.scientific.split(" ")[0]}</p>
                  </div>
                </div>
              ))}
              {filteredFish.length === 0 && <div className="col-span-2 text-center py-6 text-xs text-muted-foreground">Tidak ditemukan</div>}
            </div>
          </div>
        </div>
      </div>

      {/* RESULT PANEL */}
      {showResult && droppedFish && selectedLocation && result && (
        <div className="max-w-7xl mx-auto px-4 pb-10">
          <div className={`bg-card border-2 rounded-2xl overflow-hidden shadow-xl ${STATUS_CONFIG[result.status].border}`}>
            <div className={`p-6 border-b border-border bg-gradient-to-br ${pondBg}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${droppedFish.bg} flex items-center justify-center text-3xl shadow-md`}>🐟</div>
                  <div>
                    <h2 className="text-xl font-bold" style={{ fontFamily: "Poppins" }}>{droppedFish.name}</h2>
                    <p className="text-sm italic text-muted-foreground">{droppedFish.scientific}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">📍 {selectedLocation.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={result.status} size="lg" />
                  <button onClick={() => { setShowResult(false); setDroppedFish(null); }} className="p-2 rounded-lg hover:bg-black/5"><X size={18} /></button>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-0">
              <div className="p-6 border-r border-border space-y-5">
                {/* Toggle */}
                <div className="flex rounded-lg bg-muted/40 p-1 gap-1">
                  {(["detail", "simple"] as const).map((m) => (
                    <button key={m} onClick={() => setDetailMode(m)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${detailMode === m ? "bg-white shadow text-foreground" : "text-muted-foreground"}`}>
                      {m === "detail" ? "Mode Detail" : "Mode Sederhana"}
                    </button>
                  ))}
                </div>

                {detailMode === "detail" ? (
                  <div>
                    <h3 className="font-bold text-sm mb-3" style={{ fontFamily: "Poppins" }}>Analisis Parameter IoT (3 Sensor)</h3>
                    <div className="rounded-xl border border-border overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/40">
                          <tr>
                            <th className="text-left px-3 py-2 font-semibold">Parameter</th>
                            <th className="text-right px-3 py-2 font-semibold">Nilai Kolam</th>
                            <th className="text-right px-3 py-2 font-semibold">Rentang Ideal</th>
                            <th className="text-center px-3 py-2 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.details.map((d) => (
                            <tr key={d.param} className={`border-t border-border ${!d.inRange ? "bg-red-50" : ""}`}>
                              <td className="px-3 py-2 font-medium">{d.label}</td>
                              <td className="px-3 py-2 text-right font-mono font-bold">{d.value}{d.unit}</td>
                              <td className="px-3 py-2 text-right text-muted-foreground font-mono">{d.idealMin}–{d.idealMax}</td>
                              <td className="px-3 py-2 text-center">
                                {d.inRange ? <CheckCircle size={14} className="text-green-500 mx-auto" /> : <XCircle size={14} className="text-red-500 mx-auto" />}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm leading-relaxed">
                      {result.status === "cocok"
                        ? `Kolam ${selectedLocation.shortName} seperti rumah sempurna untuk ${droppedFish.name}. Ketiga sensor IoT (pH, suhu, kekeruhan) semuanya dalam zona nyaman — ikan diprediksi tumbuh optimal!`
                        : result.status === "kurang_ideal"
                        ? `Kolam ${selectedLocation.shortName} cukup untuk ${droppedFish.name}, tapi ada satu parameter di luar toleransi. Ikan masih bisa hidup tapi tidak pertumbuhan tidak maksimal.`
                        : `Kolam ${selectedLocation.shortName} kurang cocok untuk ${droppedFish.name}. Dua atau lebih parameter di luar toleransi — model memprediksi pertumbuhan suboptimal.`
                      }
                    </p>
                  </div>
                )}

                {/* AI Narrative */}
                <div className="bg-gradient-to-br from-primary/5 to-teal-50 border border-primary/15 rounded-xl p-4">
                  <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1"><Cpu size={11} /> Prediksi Random Forest</p>
                  <p className="text-sm leading-relaxed">
                    {result.status === "cocok"
                      ? `${droppedFish.name} diprediksi menunjukkan pertumbuhan optimal di ${selectedLocation.name}. pH ${selectedLocation.params.ph}, suhu ${selectedLocation.params.temp}°C, dan kekeruhan ${selectedLocation.params.turbidity} NTU semuanya dalam toleransi fisiologis.`
                      : result.status === "kurang_ideal"
                      ? `${droppedFish.name} kemungkinan mengalami stres fisiologis ringan di ${selectedLocation.name}. Satu parameter di luar toleransi dapat menurunkan efisiensi pakan dan laju pertumbuhan.`
                      : `${droppedFish.name} diprediksi tidak tumbuh optimal di ${selectedLocation.name}. Model merekomendasikan evaluasi lokasi lain atau penyesuaian kondisi air kolam.`
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 italic">Prediksi Random Forest — realfishdataset.csv, Jamalpur Bangladesh</p>
                </div>

                {/* Accordion */}
                <div>
                  <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "Poppins" }}>Tentang {droppedFish.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{droppedFish.story}</p>
                  <div className="space-y-2">
                    {[
                      { title: "Habitat Asli", content: droppedFish.habitat_detail },
                      { title: "Pola Makan", content: droppedFish.diet },
                      { title: "Fakta Ilmiah", content: droppedFish.fact },
                      { title: "Status Konservasi", content: droppedFish.conservation },
                    ].map((item) => (
                      <div key={item.title} className="border border-border rounded-lg overflow-hidden">
                        <button className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/20 hover:bg-muted/40 text-xs font-semibold"
                          onClick={() => setOpenAccordion(openAccordion === item.title ? null : item.title)}>
                          {item.title}<ChevronDown size={14} className={`text-muted-foreground transition-transform ${openAccordion === item.title ? "rotate-180" : ""}`} />
                        </button>
                        {openAccordion === item.title && <div className="px-4 py-3 text-xs text-muted-foreground leading-relaxed">{item.content}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Chart */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm" style={{ fontFamily: "Poppins" }}>Tren Parameter Historis</h3>
                    <select value={chartParam} onChange={(e) => setChartParam(e.target.value)}
                      className="text-xs border border-border rounded-lg px-2 py-1 bg-card">
                      {Object.entries(paramLabels).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">12 Bulan — {selectedLocation.name} (IoT Sensor)</p>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={histData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                        <YAxis domain={[paramLabels[chartParam].min, paramLabels[chartParam].max]} tick={{ fontSize: 9 }} />
                        <Tooltip contentStyle={{ fontSize: 11 }} />
                        <ReferenceLine key={`ref-min-${chartParam}`} y={(droppedFish.params[chartParam as keyof typeof droppedFish.params] as number[])[0]} stroke="#22C55E" strokeDasharray="4 2" strokeWidth={1.5} />
                        <ReferenceLine key={`ref-max-${chartParam}`} y={(droppedFish.params[chartParam as keyof typeof droppedFish.params] as number[])[1]} stroke="#EF4444" strokeDasharray="4 2" strokeWidth={1.5} />
                        <Line type="monotone" dataKey="value" stroke="#0891B2" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Garis hijau/merah = batas toleransi {droppedFish.name}</p>
                </div>

                {/* AI Quiz */}
                <AIQuizInline fish={droppedFish} loc={selectedLocation} />

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => { setShowResult(false); setDroppedFish(null); }}
                    className="flex items-center gap-1.5 text-xs bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90">
                    <RefreshCw size={12} />Coba Lain
                  </button>
                  <button className="flex items-center gap-1.5 text-xs border border-border text-muted-foreground px-3 py-2 rounded-lg hover:bg-muted/40">
                    <Download size={12} />Ekspor PDF
                  </button>
                  <button onClick={() => navigate("fish-detail", { fishId: droppedFish.id })}
                    className="flex items-center gap-1.5 text-xs border border-border text-muted-foreground px-3 py-2 rounded-lg hover:bg-muted/40">
                    <Eye size={12} />Detail Ikan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

// ============================================================
// PAGE: SIMULASI 2 — 3 SLIDERS
// ============================================================

function Sim2Page({ navigate }: { navigate: (p: Page, e?: Record<string, unknown>) => void }) {
  const [selectedFishId, setSelectedFishId] = useState("");
  const [params, setParams] = useState({ ph: 7.0, temp: 28, turbidity: 12 });
  const fish = FISH_DATA.find((f) => f.id === selectedFishId);

  const sliders = [
    { key: "ph", label: "pH", icon: "⚗️", min: 4.0, max: 10.0, step: 0.1, unit: "" },
    { key: "temp", label: "Suhu", icon: "🌡️", min: 15, max: 40, step: 0.5, unit: "°C" },
    { key: "turbidity", label: "Kekeruhan", icon: "🌫️", min: 0, max: 50, step: 1, unit: "NTU" },
  ];

  function getStatus(key: string, val: number) {
    if (!fish) return "neutral";
    const p = fish.params[key as keyof typeof fish.params] as number[];
    return val >= p[0] && val <= p[1] ? "ok" : "error";
  }

  const mockLoc = { ...LOCATIONS[0], params };
  const result = fish ? checkCompatibility(fish, mockLoc) : null;
  const issues = result ? result.details.filter((d) => !d.inRange) : [];

  const pondBg = !result ? "from-blue-200 to-cyan-300" :
    result.status === "cocok" ? "from-green-200 to-teal-300" :
    result.status === "kurang_ideal" ? "from-yellow-100 to-amber-200" : "from-red-100 to-red-200";

  return (
    <div style={{ fontFamily: "Nunito, sans-serif" }}>
      <div className="bg-gradient-to-r from-primary to-cyan-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-3">
          <button onClick={() => navigate("virtual-lab")} className="p-1 rounded-lg hover:bg-white/20"><ChevronLeft size={20} /></button>
          <div>
            <span className="text-xs bg-yellow-100 text-yellow-700 rounded-full px-2 py-0.5 font-semibold">Menengah</span>
            <h1 className="text-2xl font-bold mt-1" style={{ fontFamily: "Poppins" }}>Simulasi Parameter Air (3 Sensor IoT)</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-bold text-sm mb-3" style={{ fontFamily: "Poppins" }}>Pilih Spesies Ikan</h2>
              <select value={selectedFishId} onChange={(e) => setSelectedFishId(e.target.value)}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-input-background focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">-- Pilih dari 11 spesies --</option>
                {FISH_DATA.map((f) => <option key={f.id} value={f.id}>{f.name} — {f.scientific}</option>)}
              </select>
            </div>
            {fish && (
              <div className="px-5 py-3 bg-primary/5 border-b border-border">
                <p className="text-xs font-semibold text-primary mb-2">Rentang Ideal {fish.name}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[["pH", fish.params.ph], ["Suhu", fish.params.temp], ["Kekeruhan", fish.params.turbidity]].map(([k, v]) => (
                    <div key={k as string} className="bg-white border border-border rounded-lg p-2 text-center">
                      <p className="text-muted-foreground">{k}</p>
                      <p className="font-bold">{(v as number[])[0]}–{(v as number[])[1]}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="px-5 py-5 space-y-5">
              {sliders.map((s) => {
                const val = params[s.key as keyof typeof params];
                const pct = ((val - s.min) / (s.max - s.min)) * 100;
                const status = getStatus(s.key, val);
                const color = !fish ? "#0891B2" : status === "ok" ? "#22C55E" : "#EF4444";
                return (
                  <div key={s.key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{s.icon} {s.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold">{val.toFixed(s.step < 0.5 ? 1 : 0)}{s.unit}</span>
                        <div className={`w-2.5 h-2.5 rounded-full ${!fish ? "bg-muted-foreground" : status === "ok" ? "bg-green-500" : "bg-red-500"}`} />
                      </div>
                    </div>
                    <input type="range" min={s.min} max={s.max} step={s.step} value={val}
                      onChange={(e) => setParams({ ...params, [s.key]: parseFloat(e.target.value) })}
                      className="w-full h-2.5 rounded-full appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, ${color} ${pct}%, #E2E8F0 ${pct}%)` }} />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>{s.min}{s.unit}</span><span>{s.max}{s.unit}</span></div>
                  </div>
                );
              })}
            </div>
            <div className="px-5 pb-5 space-y-2">
              <div className="flex gap-2">
                <button onClick={() => { if (!fish) return; setParams({ ph: ((fish.params.ph as number[])[0] + (fish.params.ph as number[])[1]) / 2, temp: ((fish.params.temp as number[])[0] + (fish.params.temp as number[])[1]) / 2, turbidity: ((fish.params.turbidity as number[])[0] + (fish.params.turbidity as number[])[1]) / 2 }); }} disabled={!fish}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs border border-border py-2 rounded-lg hover:bg-muted/40 disabled:opacity-40">
                  <RefreshCw size={12} />Reset ke Ideal
                </button>
                <select onChange={(e) => { const loc = LOCATIONS.find((l) => l.id === e.target.value); if (loc) setParams({ ph: loc.params.ph, temp: loc.params.temp, turbidity: loc.params.turbidity }); }} defaultValue=""
                  className="flex-1 text-xs border border-border rounded-lg px-2 py-2 bg-card">
                  <option value="">Isi dari Lokasi</option>
                  {LOCATIONS.map((l) => <option key={l.id} value={l.id}>{l.shortName}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-sm" style={{ fontFamily: "Poppins" }}>Visualisasi Kolam Real-time</h2>
              {result && <StatusBadge status={result.status} size="lg" />}
            </div>
            <div className={`h-52 bg-gradient-to-b ${pondBg} flex items-center justify-center transition-all duration-500`}>
              {!fish ? (
                <div className="text-center"><p className="text-6xl mb-2 opacity-50">💧</p><p className="text-blue-800/50 text-sm">Pilih spesies ikan dulu</p></div>
              ) : (
                <div className="text-center">
                  <div className={`text-6xl mb-2 transition-all duration-500 ${result?.status === "tidak_cocok" ? "grayscale opacity-40" : result?.status === "kurang_ideal" ? "opacity-70" : ""}`}>🐟</div>
                  <p className="font-bold text-blue-900">{fish.name}</p>
                  {result?.status === "tidak_cocok" && <p className="text-xs text-red-700 mt-1">⚠️ Kondisi kritis</p>}
                  {result?.status === "kurang_ideal" && <p className="text-xs text-yellow-700 mt-1">⚡ Stres ringan</p>}
                  {result?.status === "cocok" && <p className="text-xs text-green-700 mt-1">✅ Pertumbuhan optimal</p>}
                </div>
              )}
            </div>
            {issues.length > 0 && (
              <div className="px-5 py-3 bg-red-50 border-t border-red-100">
                <p className="text-xs font-semibold text-red-700 mb-1">⚠️ Parameter Di Luar Toleransi:</p>
                {issues.map((d) => <p key={d.param} className="text-xs text-red-600">• <strong>{d.label}</strong>: {d.value}{d.unit} (ideal: {d.idealMin}–{d.idealMax}{d.unit})</p>)}
              </div>
            )}
            {result?.status === "cocok" && <div className="px-5 py-3 bg-green-50 border-t border-green-100"><p className="text-xs text-green-700">✅ Ketiga parameter dalam rentang ideal. Model memprediksi pertumbuhan optimal untuk {fish?.name}.</p></div>}
          </div>

          {fish && result && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border"><h3 className="font-bold text-sm" style={{ fontFamily: "Poppins" }}>Status Per Parameter</h3></div>
              <div className="p-4 grid grid-cols-3 gap-3">
                {result.details.map((d) => (
                  <div key={d.param} className={`rounded-xl p-3 border ${d.inRange ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    <p className="text-xs text-muted-foreground">{d.label}</p>
                    <p className={`font-bold text-xl font-mono ${d.inRange ? "text-green-700" : "text-red-700"}`}>{d.value}{d.unit}</p>
                    <p className="text-xs text-muted-foreground">Ideal: {d.idealMin}–{d.idealMax}</p>
                    {d.inRange ? <CheckCircle size={14} className="text-green-500 mt-1" /> : <XCircle size={14} className="text-red-500 mt-1" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ============================================================
// PAGE: SIMULASI 3 — ZONA BUDIDAYA AIR TAWAR
// ============================================================

function Sim3Page({ navigate }: { navigate: (p: Page, e?: Record<string, unknown>) => void }) {
  const [activeZone, setActiveZone] = useState<number | null>(null);
  const [hoveredZone, setHoveredZone] = useState<number | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  const zones = [
    { id: 0, name: "Kolam Intensif", fullName: "Kolam Budidaya Intensif", emoji: "🏗️", color: "#0891B2", bg: "#EFF6FF",
      desc: "Kolam terpal atau beton dengan kepadatan tinggi dan aerasi mekanis. Manajemen kualitas air sangat intensif untuk mendukung biomassa maksimal.",
      params: { ph: "7.0–8.5", temp: "26–32", turbidity: "5–20" },
      fish: ["nila", "lele", "patin"],
      threat: "Risiko: penumpukan amonia dari kepadatan tinggi dan biaya operasional aerasi yang tinggi.",
      fact: "Sistem paling produktif per luas lahan — produksi bisa 50–100 ton/ha/tahun." },
    { id: 1, name: "Kolam Semi-Intensif", fullName: "Kolam Budidaya Semi-Intensif", emoji: "🌿", color: "#10B981", bg: "#ECFDF5",
      desc: "Kolam tanah tradisional dengan kepadatan sedang. Memanfaatkan produktivitas alami kolam dikombinasikan dengan pakan tambahan.",
      params: { ph: "6.5–8.5", temp: "24–32", turbidity: "10–30" },
      fish: ["mas", "rohu", "katla", "nila"],
      threat: "Risiko: kualitas air fluktuatif dan produktivitas alami yang bergantung musim.",
      fact: "Sistem paling umum di Indonesia — ramah lingkungan dan cocok untuk petambak skala kecil." },
    { id: 2, name: "Karamba", fullName: "Karamba / Keramba Jaring Apung", emoji: "🛶", color: "#F59E0B", bg: "#FFFBEB",
      desc: "Jaring terapung di sungai atau waduk. Ikan mendapat pasokan air segar terus-menerus dari badan air, mengurangi kebutuhan aerasi.",
      params: { ph: "6.8–8.0", temp: "26–31", turbidity: "8–25" },
      fish: ["patin", "nila", "mas"],
      threat: "Risiko: pencemaran badan air dari pakan berlebihan dan limbah ikan yang terakumulasi.",
      fact: "Karamba di Waduk Cirata (Jawa Barat) adalah sistem karamba terbesar di Asia Tenggara." },
    { id: 3, name: "Tambak Payau", fullName: "Tambak Budidaya Payau", emoji: "🌊", color: "#8B5CF6", bg: "#F5F3FF",
      desc: "Perairan peralihan tawar-asin di pesisir. Spesies euryhaline seperti udang cocok untuk sistem ini.",
      params: { ph: "7.0–8.5", temp: "25–32", turbidity: "5–20" },
      fish: ["udang", "prawn"],
      threat: "Risiko: intrusi air laut berlebihan, kekeringan musim kemarau, dan konversi mangrove.",
      fact: "Tambak pesisir Indonesia mencakup >650.000 ha — terluas ketiga di dunia." },
    { id: 4, name: "Rawa/Danau Alam", fullName: "Perairan Rawa & Danau Alam", emoji: "🌾", color: "#6B7280", bg: "#F9FAFB",
      desc: "Ekosistem alami dengan keragaman hayati tinggi. pH rendah khas gambut Kalimantan dan Sumatera menjadi karakteristik utama.",
      params: { ph: "5.5–7.5", temp: "24–32", turbidity: "15–40" },
      fish: ["singhi", "lele", "mas"],
      threat: "Risiko: kebakaran lahan gambut, drainase untuk pertanian, dan konversi habitat.",
      fact: "Rawa gambut Indonesia menyimpan 57 miliar ton karbon — salah satu simpanan karbon terbesar dunia." },
  ];

  const zone = activeZone !== null ? zones[activeZone] : null;

  return (
    <div style={{ fontFamily: "Nunito, sans-serif" }}>
      <div className="bg-gradient-to-r from-primary to-cyan-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-3">
          <button onClick={() => navigate("virtual-lab")} className="p-1 rounded-lg hover:bg-white/20"><ChevronLeft size={20} /></button>
          <div>
            <span className="text-xs bg-yellow-100 text-yellow-700 rounded-full px-2 py-0.5 font-semibold">Menengah</span>
            <h1 className="text-2xl font-bold mt-1" style={{ fontFamily: "Poppins" }}>Identifikasi Zona Budidaya Air Tawar</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="font-bold text-sm" style={{ fontFamily: "Poppins" }}>💧 Sistem Budidaya Air Tawar — Klik zona untuk eksplorasi</h2>
          </div>
          <div className="p-4">
            <div className="relative rounded-xl overflow-hidden" style={{ background: "linear-gradient(to bottom, #87CEEB 0%, #e0f2fe 25%, #d1fae5 50%, #fef3c7 75%, #6b7280 100%)", height: 260 }}>
              <div className="absolute top-0 left-0 right-0 h-8 flex items-center px-4">
                <span className="text-xs text-gray-600 font-medium">☀️ Permukaan — Sistem Budidaya Air Tawar Indonesia</span>
              </div>
              {zones.map((z, i) => {
                const configs = [
                  { top: 8, left: 5, w: 25, h: 50 },
                  { top: 8, left: 32, w: 25, h: 55 },
                  { top: 8, left: 60, w: 18, h: 45 },
                  { top: 55, left: 5, w: 35, h: 38 },
                  { top: 55, left: 48, w: 35, h: 38 },
                ];
                const c = configs[i];
                return (
                  <button key={z.id} className="absolute transition-all cursor-pointer"
                    style={{ top: `${c.top}%`, height: `${c.h}%`, left: `${c.left}%`, width: `${c.w}%`,
                      background: activeZone === i || hoveredZone === i ? `${z.color}30` : "transparent",
                      border: `2px ${activeZone === i ? "solid" : "dashed"} ${activeZone === i || hoveredZone === i ? z.color : "transparent"}`,
                      borderRadius: 10 }}
                    onClick={() => setActiveZone(activeZone === i ? null : i)}
                    onMouseEnter={() => setHoveredZone(i)}
                    onMouseLeave={() => setHoveredZone(null)}>
                    {(hoveredZone === i || activeZone === i) && (
                      <span className="absolute top-1 left-2 text-xs font-bold bg-black/50 text-white px-2 py-0.5 rounded-md whitespace-nowrap">{z.name}</span>
                    )}
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-2xl">{z.emoji}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {zones.map((z) => (
                <button key={z.id} onClick={() => setActiveZone(activeZone === z.id ? null : z.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                  style={{ backgroundColor: activeZone === z.id ? z.color : "white", color: activeZone === z.id ? "white" : z.color, borderColor: z.color }}>
                  {z.emoji} {z.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {zone && (
          <div className="bg-card border-2 rounded-2xl overflow-hidden animate-in fade-in duration-300" style={{ borderColor: zone.color }}>
            <div className="p-5 border-b border-border flex items-center justify-between" style={{ background: zone.bg }}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{zone.emoji}</span>
                <div>
                  <h2 className="text-xl font-bold" style={{ fontFamily: "Poppins" }}>{zone.fullName}</h2>
                  <p className="text-sm text-muted-foreground">Sistem budidaya air tawar</p>
                </div>
              </div>
              <button onClick={() => setActiveZone(null)} className="p-2 rounded-lg hover:bg-black/5"><X size={18} /></button>
            </div>
            <div className="grid md:grid-cols-3 gap-0">
              <div className="p-5 md:border-r border-border">
                <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "Poppins" }}>Karakteristik Sistem</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{zone.desc}</p>
                <p className="text-xs font-semibold mb-2">Parameter Rata-rata (IoT)</p>
                {[["pH", zone.params.ph, ""], ["Suhu", zone.params.temp, "°C"], ["Kekeruhan", zone.params.turbidity, "NTU"]].map(([k, v, u]) => (
                  <div key={k as string} className="flex justify-between text-xs py-1 border-b border-border/50">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-mono font-bold">{v}{u}</span>
                  </div>
                ))}
              </div>
              <div className="p-5 md:border-r border-border">
                <h3 className="font-bold text-sm mb-3" style={{ fontFamily: "Poppins" }}>Spesies Khas</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {zone.fish.map((fid) => {
                    const f = FISH_DATA.find((x) => x.id === fid);
                    if (!f) return null;
                    return (
                      <div key={fid} className="bg-muted/30 rounded-xl overflow-hidden">
                        <div className={`h-12 bg-gradient-to-br ${f.bg} flex items-center justify-center text-xl`}>🐟</div>
                        <div className="px-2 py-1.5">
                          <p className="text-xs font-semibold leading-tight">{f.name}</p>
                          <p className="text-xs text-muted-foreground italic">{f.scientific.split(" ")[0]}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-xs text-red-700">{zone.threat}</p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "Poppins" }}>Fakta Budidaya</h3>
                  <p className="text-sm text-muted-foreground">{zone.fact}</p>
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "Poppins" }}>Video Edukasi</h3>
                  <div onClick={() => setShowVideo(true)}
                    className="relative rounded-xl overflow-hidden cursor-pointer group"
                    style={{ background: "linear-gradient(135deg, #0F172A, #1e3a5f)", aspectRatio: "16/7" }}>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <div className="w-10 h-10 rounded-full bg-white/20 group-hover:bg-white/30 transition-all flex items-center justify-center mb-2">
                        <Play size={18} className="text-white ml-0.5" />
                      </div>
                      <p className="text-xs font-semibold text-center px-2">{zone.fullName}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => navigate("sim1")} className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90">
                  Lihat di Simulasi Kolam <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {!zone && <div className="text-center py-8 text-muted-foreground"><p className="text-4xl mb-3">👆</p><p className="text-sm">Klik zona atau tombol nama zona untuk detail sistem budidaya</p></div>}
      </div>

      {showVideo && zone && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6" onClick={() => setShowVideo(false)}>
          <div className="bg-foreground rounded-2xl overflow-hidden w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <p className="text-white text-sm font-semibold">{zone.emoji} {zone.fullName}</p>
              <button onClick={() => setShowVideo(false)} className="text-white/60 hover:text-white"><X size={18} /></button>
            </div>
            <div className="flex items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1e3a5f]" style={{ aspectRatio: "16/9" }}>
              <div className="text-center text-white">
                <p className="text-5xl mb-4">{zone.emoji}</p>
                <p className="text-white/80 font-semibold mb-2">{zone.fullName}</p>
                <p className="text-white/50 text-sm">Video edukasi — konten segera hadir</p>
                <p className="text-white/40 text-xs mt-2">Karakteristik, manajemen kualitas air, dan spesies unggulan</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

// ============================================================
// PAGE: DATABASE IKAN
// ============================================================

function DatabasePage({ navigate }: { navigate: (p: Page, e?: Record<string, unknown>) => void }) {
  const [search, setSearch] = useState("");
  const [habitat, setHabitat] = useState("Semua");

  const filtered = FISH_DATA.filter((f) => {
    const ms = f.name.toLowerCase().includes(search.toLowerCase()) || f.scientific.toLowerCase().includes(search.toLowerCase());
    const mh = habitat === "Semua" || f.habitat.toLowerCase().includes(habitat.toLowerCase());
    return ms && mh;
  });

  return (
    <div style={{ fontFamily: "Nunito, sans-serif" }}>
      <div className="bg-gradient-to-r from-primary to-cyan-600 text-white py-10">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Poppins" }}>Database Ikan</h1>
          <p className="text-white/80 text-sm">11 spesies ikan budidaya air tawar dari dataset IoT Jamalpur, Bangladesh</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-52">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama ikan atau nama ilmiah..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-xl bg-card focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <select value={habitat} onChange={(e) => setHabitat(e.target.value)} className="text-sm border border-border rounded-xl px-3 py-2.5 bg-card">
            {["Semua", "Kolam", "Sungai", "Rawa", "Karamba", "Ornamental"].map((h) => <option key={h}>{h}</option>)}
          </select>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((fish) => (
            <button key={fish.id} onClick={() => navigate("fish-detail", { fishId: fish.id })}
              className="bg-card border border-border rounded-2xl overflow-hidden text-left hover:shadow-lg hover:-translate-y-1 transition-all group">
              <div className={`h-36 bg-gradient-to-br ${fish.bg} flex items-center justify-center text-6xl group-hover:scale-105 transition-transform`}>🐟</div>
              <div className="p-4">
                <h3 className="font-bold text-base mb-0.5" style={{ fontFamily: "Poppins" }}>{fish.name}</h3>
                <p className="text-xs italic text-muted-foreground mb-3">{fish.scientific}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-teal-100 text-teal-700">{fish.category}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">{fish.habitat}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  {[["pH", fish.params.ph], ["°C", fish.params.temp], ["NTU", fish.params.turbidity]].map(([k, v]) => (
                    <div key={k as string} className="bg-muted/40 rounded-lg px-1.5 py-1 text-center">
                      <p className="text-muted-foreground">{k}</p>
                      <p className="font-bold text-xs">{(v as number[])[0]}–{(v as number[])[1]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <div className="col-span-4 text-center py-16 text-muted-foreground"><p className="text-4xl mb-3">🔍</p><p>Tidak ada spesies ditemukan.</p></div>}
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ============================================================
// PAGE: FISH DETAIL
// ============================================================

function FishDetailPage({ fishId, navigate }: { fishId: string; navigate: (p: Page, e?: Record<string, unknown>) => void }) {
  const fish = FISH_DATA.find((f) => f.id === fishId);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  if (!fish) return <div className="p-10 text-center text-muted-foreground">Ikan tidak ditemukan</div>;

  return (
    <div style={{ fontFamily: "Nunito, sans-serif" }}>
      <div className={`bg-gradient-to-br ${fish.bg} text-white`} style={{ minHeight: 220 }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button onClick={() => navigate("database")} className="flex items-center gap-2 text-white/80 hover:text-white text-sm mb-6">
            <ChevronLeft size={16} />Kembali ke Database
          </button>
          <div className="flex items-center gap-6">
            <div className="text-8xl">🐟</div>
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-white/30">{fish.category}</span>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-white/30">{fish.habitat}</span>
              </div>
              <h1 className="text-4xl font-bold mb-1" style={{ fontFamily: "Poppins" }}>{fish.name}</h1>
              <p className="text-xl italic text-white/80">{fish.scientific}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "Poppins" }}>Kehidupan {fish.name}</h2>
            <p className="text-muted-foreground leading-relaxed">{fish.story}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "Poppins" }}>Rentang Parameter Ideal (3 Sensor IoT)</h2>
            <div className="rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-primary/5">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Parameter</th>
                    <th className="text-right px-4 py-3 font-semibold">Rentang Ideal</th>
                    <th className="text-right px-4 py-3 font-semibold">Satuan</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Referensi</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { l: "pH", v: `${(fish.params.ph as number[])[0]} – ${(fish.params.ph as number[])[1]}`, u: "–", ref: "Boyd & Tucker, 1998" },
                    { l: "Suhu", v: `${(fish.params.temp as number[])[0]} – ${(fish.params.temp as number[])[1]}`, u: "°C", ref: "FAO Fisheries, 2020" },
                    { l: "Kekeruhan", v: `${(fish.params.turbidity as number[])[0]} – ${(fish.params.turbidity as number[])[1]}`, u: "NTU", ref: "realfishdataset.csv" },
                  ].map((r) => (
                    <tr key={r.l} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{r.l}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-primary">{r.v}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{r.u}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.ref}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="space-y-2">
            {[
              { title: "Habitat Asli", content: fish.habitat_detail },
              { title: "Pola Makan", content: fish.diet },
              { title: "Fakta Ilmiah", content: fish.fact },
              { title: "Status Konservasi", content: fish.conservation },
              { title: "Manajemen Kualitas Air", content: `${fish.name} rentan terhadap fluktuasi pH dan suhu ekstrem. Pemantauan sensor IoT (pH, suhu, kekeruhan) secara berkala sangat disarankan untuk mencegah kematian massal di kolam budidaya.` },
            ].map((item) => (
              <div key={item.title} className="border border-border rounded-xl overflow-hidden">
                <button className="w-full flex items-center justify-between px-5 py-3.5 bg-muted/20 hover:bg-muted/40 text-sm font-semibold text-left"
                  onClick={() => setOpenAccordion(openAccordion === item.title ? null : item.title)}>
                  {item.title}<ChevronDown size={16} className={`text-muted-foreground transition-transform ml-2 ${openAccordion === item.title ? "rotate-180" : ""}`} />
                </button>
                {openAccordion === item.title && <div className="px-5 py-4 text-sm text-muted-foreground leading-relaxed">{item.content}</div>}
              </div>
            ))}
          </section>
        </div>

        <div className="space-y-5">
          <div className={`bg-gradient-to-br ${fish.bg} rounded-2xl p-5 text-white text-center`}>
            <div className="text-6xl mb-3">🐟</div>
            <h3 className="text-lg font-bold mb-0.5" style={{ fontFamily: "Poppins" }}>{fish.name}</h3>
            <p className="italic text-white/80 text-sm">{fish.scientific}</p>
            <div className="mt-3 flex gap-2 justify-center flex-wrap">
              <span className="text-xs bg-white/30 rounded-full px-2.5 py-1">{fish.category}</span>
              <span className="text-xs bg-white/30 rounded-full px-2.5 py-1">{fish.habitat}</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm" style={{ fontFamily: "Poppins" }}>Coba di Simulasi</h3>
            <button onClick={() => navigate("sim1")} className="w-full flex items-center justify-between px-4 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90">
              Eksplorasi Kolam <ArrowRight size={15} />
            </button>
            <button onClick={() => navigate("sim2")} className="w-full flex items-center justify-between px-4 py-3 border border-primary text-primary rounded-xl text-sm font-semibold hover:bg-primary/5">
              Simulasi Parameter Air <ArrowRight size={15} />
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-sm mb-3" style={{ fontFamily: "Poppins" }}>Kompatibilitas Lokasi</h3>
            <div className="space-y-2">
              {LOCATIONS.map((loc) => {
                const r = checkCompatibility(fish, loc);
                return (
                  <div key={loc.id} className="flex items-center justify-between">
                    <span className="text-sm">{loc.shortName}</span>
                    <StatusBadge status={r.status} />
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3">Berdasarkan 3 parameter IoT: pH, Suhu, Kekeruhan</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ============================================================
// PAGE: KUIS
// ============================================================

function KuisPage({ navigate }: { navigate: (p: Page, e?: Record<string, unknown>) => void }) {
  const [state, setState] = useState<"select" | "quiz" | "result">("select");
  const [category, setCategory] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const questions = QUIZ_QUESTIONS.filter((q) => !category || q.category === category);
  const q3 = questions.slice(0, 3);
  const currentQ = q3[questionIndex];
  const score = answers.filter((a, i) => a === q3[i]?.correct).length;

  const topics = [
    { cat: "parameter", label: "Parameter Kualitas Air", emoji: "⚗️", desc: "pH, Suhu, Kekeruhan — sensor IoT dan dampaknya bagi ikan" },
    { cat: "spesies", label: "Spesies & Habitat Ikan", emoji: "🐟", desc: "11 spesies budidaya dan preferensi parameter idealnya" },
    { cat: "dataset", label: "Dataset IoT & Model ML", emoji: "📡", desc: "sensor perairan dan machine learning" },
    { cat: "ekosistem", label: "Zona Budidaya", emoji: "🌾", desc: "Kolam intensif, karamba, tambak, dan rawa alam" },
  ];

  if (state === "select") {
    return (
      <div style={{ fontFamily: "Nunito, sans-serif" }}>
        <div className="bg-gradient-to-r from-primary to-cyan-600 text-white py-10">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Poppins" }}>Kuis Akuanesia</h1>
            <p className="text-white/80">Uji pengetahuan budidaya perikanan dan data IoT</p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-10">
          <h2 className="font-bold text-lg mb-6" style={{ fontFamily: "Poppins" }}>Pilih Topik</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {topics.map((t) => (
              <button key={t.cat} onClick={() => { setCategory(t.cat); setQuestionIndex(0); setAnswers([]); setSelected(null); setState("quiz"); }}
                className="text-left p-5 rounded-2xl border-2 border-border hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition-all bg-card">
                <div className="text-3xl mb-3">{t.emoji}</div>
                <h3 className="font-bold text-base mb-1" style={{ fontFamily: "Poppins" }}>{t.label}</h3>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (state === "quiz" && currentQ) {
    return (
      <div style={{ fontFamily: "Nunito, sans-serif" }}>
        <div className="bg-gradient-to-r from-primary to-cyan-600 text-white py-8">
          <div className="max-w-2xl mx-auto px-6">
            <h1 className="text-xl font-bold" style={{ fontFamily: "Poppins" }}>Kuis Akuanesia</h1>
            <p className="text-white/70 text-sm">{topics.find((t) => t.cat === category)?.label}</p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-muted-foreground">Soal {questionIndex + 1} / {q3.length}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(questionIndex / q3.length) * 100}%` }} />
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 mb-5 shadow-sm">
            <p className="text-lg font-semibold leading-relaxed">{currentQ.question}</p>
          </div>
          <div className="space-y-3 mb-5">
            {currentQ.options.map((opt, i) => {
              let cls = "bg-card border-border hover:border-primary hover:bg-primary/5 cursor-pointer";
              if (selected !== null) {
                if (i === currentQ.correct) cls = "bg-green-50 border-green-400 cursor-default";
                else if (i === selected && i !== currentQ.correct) cls = "bg-red-50 border-red-400 cursor-default";
                else cls = "bg-card border-border opacity-50 cursor-default";
              }
              return (
                <button key={i} onClick={() => { if (selected === null) setSelected(i); }} disabled={selected !== null}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium text-sm ${cls}`}>
                  <span className="font-bold text-muted-foreground mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                  {selected !== null && i === currentQ.correct && <span className="float-right text-green-600">✓</span>}
                  {selected !== null && i === selected && i !== currentQ.correct && <span className="float-right text-red-500">✗</span>}
                </button>
              );
            })}
          </div>
          {selected !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 animate-in fade-in duration-200">
              <p className="text-xs font-bold text-blue-700 mb-1">💡 Penjelasan</p>
              <p className="text-sm text-blue-800 leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}
          {selected !== null && (
            <button onClick={() => { setAnswers([...answers, selected!]); if (questionIndex + 1 >= q3.length) setState("result"); else { setQuestionIndex(questionIndex + 1); setSelected(null); } }}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90">
              {questionIndex + 1 >= q3.length ? "Lihat Hasil" : "Lanjut →"}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (state === "result") {
    const msg = score === 3 ? { emoji: "🏆", text: "Luar Biasa!" } : score === 2 ? { emoji: "⭐", text: "Hampir Sempurna!" } : { emoji: "📚", text: "Yuk Pelajari Lagi!" };
    return (
      <div style={{ fontFamily: "Nunito, sans-serif" }}>
        <div className="bg-gradient-to-r from-primary to-cyan-600 text-white py-8">
          <div className="max-w-2xl mx-auto px-6"><h1 className="text-xl font-bold" style={{ fontFamily: "Poppins" }}>Hasil Kuis</h1></div>
        </div>
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="bg-card border border-border rounded-2xl p-8 text-center mb-8">
            <div className="text-6xl mb-4">{msg.emoji}</div>
            <div className="text-5xl font-black text-primary mb-2" style={{ fontFamily: "Poppins" }}>{score}/3</div>
            <h2 className="text-xl font-bold" style={{ fontFamily: "Poppins" }}>{msg.text}</h2>
          </div>
          <div className="space-y-4 mb-8">
            {q3.map((q, i) => {
              const correct = answers[i] === q.correct;
              return (
                <div key={i} className={`border-2 rounded-2xl overflow-hidden ${correct ? "border-green-200" : "border-red-200"}`}>
                  <div className={`px-5 py-3 flex items-start gap-3 ${correct ? "bg-green-50" : "bg-red-50"}`}>
                    <span>{correct ? "✅" : "❌"}</span>
                    <p className="text-sm font-semibold">{q.question}</p>
                  </div>
                  <div className="px-5 py-3 bg-white border-t border-border">
                    {!correct && <p className="text-xs text-red-600 mb-1">Jawabanmu: <strong>{q.options[answers[i]]}</strong></p>}
                    <p className="text-xs text-green-700 mb-1">Benar: <strong>{q.options[q.correct]}</strong></p>
                    <p className="text-xs text-muted-foreground">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setState("select"); setAnswers([]); setQuestionIndex(0); setSelected(null); }}
              className="flex-1 flex items-center justify-center gap-2 border border-border py-3 rounded-xl font-semibold text-sm hover:bg-muted/40">
              <RefreshCw size={15} />Coba Kuis Lain
            </button>
            <button onClick={() => navigate("virtual-lab")}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-primary/90">
              <Beaker size={15} />Virtual Lab
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  return null;
}

// ============================================================
// VIDEO EMBED COMPONENT
// ============================================================

function VideoEmbed({ title, subtitle, youtubeId }: { title: string; subtitle: string; youtubeId?: string }) {
  const [playing, setPlaying] = useState(false);
  if (playing && youtubeId) {
    return (
      <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <iframe src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`} title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen className="absolute inset-0 w-full h-full" />
      </div>
    );
  }
  return (
    <div onClick={() => setPlaying(true)} className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{ background: "linear-gradient(135deg, #0F172A, #1e3a5f)", aspectRatio: "16/9" }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <div className="w-14 h-14 rounded-full bg-red-600 group-hover:bg-red-500 transition-colors flex items-center justify-center mb-3 shadow-lg">
          <Play size={22} className="text-white ml-1" />
        </div>
        <p className="font-bold text-center px-4">{title}</p>
        <p className="text-white/60 text-sm mt-1">{subtitle}</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 opacity-80" />
    </div>
  );
}

// ============================================================
// PAGE: TENTANG
// ============================================================

function TentangPage({ navigate }: { navigate: (p: Page, e?: Record<string, unknown>) => void }) {
  return (
    <div style={{ fontFamily: "Nunito, sans-serif" }}>
      <div className="bg-gradient-to-r from-primary to-cyan-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Poppins" }}>Tentang Akuanesia</h1>
          <p className="text-white/80">Dataset IoT, model machine learning, dan perikanan budidaya air tawar</p>
        </div>
      </div>

      {/* Dataset & ML Section with videos */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Poppins" }}>Tentang Dataset & Model ML</h2>
        <p className="text-muted-foreground text-sm mb-8">Akuanesia dibangun di atas data IoT nyata dan model Machine Learning</p>
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Database size={20} className="text-primary" /></div>
                <div>
                  <h3 className="font-bold" style={{ fontFamily: "Poppins" }}>realfishdataset.csv</h3>
                  <p className="text-xs text-muted-foreground">IoT Sensor Data — Jamalpur, Bangladesh</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">5 kolam budidaya ikan di Jamalpur, Bangladesh dipantau sensor IoT. Sensor mengukur 3 parameter: pH, Suhu, dan Kekeruhan secara real-time. Dataset mencakup 11 spesies ikan budidaya air tawar.</p>
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div className="bg-primary/5 rounded-lg p-2"><p className="text-muted-foreground">Kolam</p><p className="font-bold text-primary">5</p></div>
                <div className="bg-primary/5 rounded-lg p-2"><p className="text-muted-foreground">Spesies</p><p className="font-bold text-primary">11</p></div>
                <div className="bg-primary/5 rounded-lg p-2"><p className="text-muted-foreground">Parameter</p><p className="font-bold text-primary">3</p></div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><Cpu size={20} className="text-accent" /></div>
                <div>
                  <h3 className="font-bold" style={{ fontFamily: "Poppins" }}>Random Forest Classifier</h3>
                  <p className="text-xs text-muted-foreground">Model Machine Learning</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">Model dilatih untuk memprediksi kecocokan spesies berdasarkan 3 parameter IoT dengan output: Cocok / Kurang Ideal / Tidak Cocok.</p>
              <div className="space-y-1.5 text-xs">
                {[["Input", "pH · Suhu (°C) · Kekeruhan (NTU)"], ["Output", "Cocok / Kurang Ideal / Tidak Cocok"], ["Teknik", "Ensemble 100 Decision Trees"], ["Validasi", "Cross-validation 5-fold"]].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">{k}</span><span className="font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-base mb-3" style={{ fontFamily: "Poppins" }}>📹 Video: IoT Monitoring Kolam Budidaya</h3>
            <VideoEmbed
              title="IoT Sensor Monitoring Kolam Budidaya Ikan"
              subtitle="Cara sensor pH, suhu, dan kekeruhan bekerja real-time"
              youtubeId="jNQXAC9IVRw"
            />
            <p className="text-xs text-muted-foreground mt-2">Pelajari cara sensor IoT mengumpulkan data kualitas air secara otomatis dari kolam budidaya untuk diproses model ML.</p>
          </div>
        </div>
      </section>

      {/* Migration section with video */}
      <section className="bg-foreground text-white py-14">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "Poppins" }}>Migrasi Ikan: Fenomena Nyata</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Ketika kondisi perairan tidak ideal, ikan tidak hanya bertahan — mereka bermigrasi. Fenomena <em>ecological tolerance response</em> mendorong ikan mencari habitat yang sesuai kebutuhan fisiologisnya.
            </p>
            <p className="text-white/70 leading-relaxed mb-4">
              Dalam budidaya kolam, ikan tidak bisa bermigrasi — sehingga pemantauan sensor IoT (pH, suhu, kekeruhan) secara real-time menjadi sangat krusial untuk mencegah kematian massal.
            </p>
            <p className="text-primary/90 text-sm bg-primary/10 rounded-xl px-4 py-3 border border-primary/20">
              Akuanesia membantu petambak memahami batas toleransi spesies sebelum masalah muncul — mencegah kerugian dengan prediksi berbasis data IoT.
            </p>
          </div>
          <div>
            <h3 className="text-white/80 font-semibold mb-3 text-sm">📹 Video: Migrasi Ikan & Toleransi Ekologis</h3>
            <VideoEmbed
              title="Fenomena Migrasi Ikan & Ecological Tolerance"
              subtitle="Mengapa ikan bermigrasi saat kondisi air berubah"
              youtubeId="jNQXAC9IVRw"
            />
            <p className="text-white/40 text-xs mt-2">Memahami fenomena ini penting untuk manajemen kolam budidaya yang optimal.</p>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Poppins" }}>Karakteristik Lokasi Kolam</h2>
        <p className="text-muted-foreground text-sm mb-8">4 sentra budidaya perikanan air tawar Indonesia</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {LOCATIONS.map((loc) => (
            <div key={loc.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-2" style={{ backgroundColor: loc.color }} />
              <div className="p-5">
                <h3 className="font-bold text-base mb-1" style={{ fontFamily: "Poppins" }}>{loc.name}</h3>
                <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 mb-3 inline-block">{loc.ecosystem}</span>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{loc.description}</p>
                <div className="space-y-1 text-xs">
                  {[["pH", loc.params.ph, ""], ["Suhu", loc.params.temp, "°C"], ["Kekeruhan", loc.params.turbidity, "NTU"]].map(([k, v, u]) => (
                    <div key={k as string} className="flex justify-between py-0.5">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-mono font-bold">{v}{u}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Parameters */}
      <section className="bg-secondary/30 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Poppins" }}>Parameter Kualitas Air IoT</h2>
          <p className="text-muted-foreground text-sm mb-8">3 parameter yang diukur sensor IoT dalam dataset realfishdataset.csv</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "⚗️", name: "pH (Derajat Keasaman)", def: "Ukuran keasaman/kebasaan air 0–14.", range: "6.5–8.5 optimal untuk ikan air tawar budidaya", impact: "Di luar rentang ini, enzim tidak berfungsi dan insang rusak. Kematian massal bisa terjadi dalam 24–48 jam.", example: `Klaten: pH ${LOCATIONS[0].params.ph} — ideal untuk nila dan mas karper` },
              { icon: "🌡️", name: "Suhu (Temperature)", def: "Temperatur air yang mempengaruhi metabolisme dan konsumsi pakan ikan.", range: "24–32°C optimal untuk ikan tropis Asia", impact: "Suhu terlalu tinggi mengurangi oksigen terlarut; suhu rendah memperlambat metabolisme dan nafsu makan.", example: `Cianjur: ${LOCATIONS[1].params.temp}°C — dataran tinggi, cocok koi dan mas` },
              { icon: "🌫️", name: "Kekeruhan (Turbidity)", def: "Kejernihan air berdasarkan partikel tersuspensi, diukur dalam NTU.", range: "5–25 NTU untuk kolam budidaya produktif", impact: "NTU tinggi menyumbat insang, mengurangi fotosintesis alga, dan meningkatkan stres ikan secara signifikan.", example: `Banjarmasin: ${LOCATIONS[3].params.turbidity} NTU — rawa gambut, cocok lele yang toleran` },
            ].map((p) => (
              <div key={p.name} className="bg-card border border-border rounded-2xl p-5">
                <div className="text-4xl mb-3">{p.icon}</div>
                <h3 className="font-bold text-base mb-2" style={{ fontFamily: "Poppins" }}>{p.name}</h3>
                <p className="text-xs text-muted-foreground mb-2 leading-relaxed"><strong>Definisi:</strong> {p.def}</p>
                <p className="text-xs text-muted-foreground mb-2"><strong>Rentang normal:</strong> {p.range}</p>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed"><strong>Dampak:</strong> {p.impact}</p>
                <p className="text-xs text-primary bg-primary/5 rounded-lg px-3 py-2">{p.example}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fun facts */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "Poppins" }}>Tahukah Kamu?</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: "⭐", title: "Lele Magur Bisa Berjalan", content: "Lele Magur memiliki organ suprabranchial yang memungkinkan menghirup oksigen dari udara, bahkan bisa 'berjalan' di darat. Terdaftar sebagai salah satu dari 100 spesies invasif paling berbahaya dunia oleh IUCN." },
            { icon: "💡", title: "Silver Carp Melompat 3 Meter", content: "Silver Carp bisa melompat hingga 3 meter dari permukaan air saat terkejut suara mesin perahu — membuatnya menjadi bahaya nyata bagi pengemudi kapal di sungai Amerika yang telah terinvasi." },
            { icon: "🌍", title: "Budidaya Ikan Mas 2000 Tahun", content: "Ikan mas (Cyprinus carpio) dibudidayakan lebih dari 2.000 tahun di China — menjadikannya salah satu spesies budidaya tertua manusia. Kini memiliki ratusan varietas domestik termasuk ikan koi." },
          ].map((f) => (
            <div key={f.title} className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-base mb-2" style={{ fontFamily: "Poppins" }}>{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="bg-secondary/30 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: "Poppins" }}>Tentang Platform</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-base mb-3" style={{ fontFamily: "Poppins" }}>Metodologi</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">Akuanesia menggunakan model ML yang dilatih dengan data IoT dari realfishdataset.csv. Model memprediksi kecocokan spesies berdasarkan 3 parameter: pH, Suhu, dan Kekeruhan.</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Parameter ideal spesies bersumber dari literatur ilmiah (Boyd & Tucker, FAO, APHA) dan divalidasi pakar budidaya perikanan IPB University.</p>
            </div>
            <div>
              <h3 className="font-bold text-base mb-3" style={{ fontFamily: "Poppins" }}>Tim Pengembang</h3>
              <div className="grid grid-cols-2 gap-3">
                {[["Yasmine Nailatul", "Project Manager"], ["Azzahra N. Diandra", "UI/UX Designer"], ["Ahmad Rayhan", "Backend Developer"], ["Najwa Tazkiya", "ML Engineer"]].map(([name, role]) => (
                  <div key={name} className="bg-card border border-border rounded-xl p-3">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-sm font-bold mb-2">{name[0]}</div>
                    <p className="font-semibold text-sm">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ============================================================
// APP ROOT
// ============================================================

export default function App() {
  const [page, setPage] = useState<Page>("beranda");
  const [extra, setExtra] = useState<Record<string, unknown>>({});

  function navigate(p: Page, e?: Record<string, unknown>) {
    setPage(p); setExtra(e ?? {});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const renderPage = () => {
    switch (page) {
      case "beranda": return <BerandaPage navigate={navigate} />;
      case "virtual-lab": return <VirtualLabPage navigate={navigate} />;
      case "sim1": return <Sim1Page navigate={navigate} />;
      case "sim2": return <Sim2Page navigate={navigate} />;
      case "sim3": return <Sim3Page navigate={navigate} />;
      case "database": return <DatabasePage navigate={navigate} />;
      case "fish-detail": return <FishDetailPage fishId={extra.fishId as string} navigate={navigate} />;
      case "kuis": return <KuisPage navigate={navigate} />;
      case "tentang": return <TentangPage navigate={navigate} />;
      default: return <BerandaPage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "Nunito, sans-serif" }}>
      <Navbar page={page} navigate={navigate} />
      <main>{renderPage()}</main>
    </div>
  );
}
