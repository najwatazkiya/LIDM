import sqlite3
import json
import os

def init_db():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "aquaculture.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create locations table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS locations (
            id TEXT PRIMARY KEY,
            name TEXT,
            shortName TEXT,
            cx REAL,
            cy REAL,
            ph REAL,
            temp REAL,
            turbidity REAL,
            description TEXT,
            ecosystem TEXT,
            color TEXT
        )
    ''')

    # Create fishes table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS fishes (
            id TEXT PRIMARY KEY,
            name TEXT,
            scientific TEXT,
            category TEXT,
            habitat TEXT,
            bg TEXT,
            image TEXT,
            ph_json TEXT,
            temp_json TEXT,
            turbidity_json TEXT,
            story TEXT,
            habitat_detail TEXT,
            diet TEXT,
            fact TEXT,
            conservation TEXT
        )
    ''')
    
    # Clear existing data just in case it's run multiple times
    cursor.execute("DELETE FROM locations")
    cursor.execute("DELETE FROM fishes")

    locations_data = [
      {
        "id": "surabaya",
        "name": "Surabaya, Jawa Timur",
        "shortName": "Surabaya",
        "cx": 38.0, "cy": 74.8,
        "ph": 7.4, "temp": 31.0, "turbidity": 12.0,
        "description": "Kawasan pesisir Surabaya dengan suhu air hangat khas pantai utara Jawa. Sangat potensial untuk budidaya bandeng, patin, dan nila salin.",
        "ecosystem": "Tambak Pesisir",
        "color": "#0891B2",
      },
      {
        "id": "malang",
        "name": "Malang, Jawa Timur",
        "shortName": "Malang",
        "cx": 37.6, "cy": 76.5,
        "ph": 7.1, "temp": 23.0, "turbidity": 4.0,
        "description": "Daerah dataran tinggi Malang dengan suhu air sejuk dan jernih. Sangat cocok untuk budidaya ikan mas, koi, dan nila merah.",
        "ecosystem": "Kolam Air Deras",
        "color": "#10B981",
      },
      {
        "id": "blitar",
        "name": "Blitar, Jawa Timur",
        "shortName": "Blitar",
        "cx": 36.6, "cy": 76.6,
        "ph": 7.3, "temp": 26.5, "turbidity": 6.0,
        "description": "Sentra budidaya ikan hias Koi terbesar di Indonesia. Kualitas air sangat stabil dengan kandungan mineral optimal dari pegunungan.",
        "ecosystem": "Kolam Koi & Nila",
        "color": "#F59E0B",
      },
      {
        "id": "probolinggo",
        "name": "Probolinggo, Jawa Timur",
        "shortName": "Probolinggo",
        "cx": 39.5, "cy": 75.2,
        "ph": 6.9, "temp": 29.5, "turbidity": 14.0,
        "description": "Budidaya perikanan air tawar dan payau di Probolinggo. Suhu air cenderung hangat dengan kekeruhan sedang dari aliran sungai daerah lereng.",
        "ecosystem": "Kolam Nila & Patin",
        "color": "#8B5CF6",
      },
    ]

    fish_data = [
      {
        "id": "nila",
        "name": "Ikan Nila",
        "scientific": "Oreochromis niloticus",
        "category": "Tawar",
        "habitat": "Kolam Budidaya",
        "bg": "from-teal-400 to-cyan-500",
        "image": "/Tilapia fish.webp",
        "params": { "ph": [6.5, 8.5], "temp": [25, 32], "turbidity": [5, 25] },
        "story": "Nila adalah primadona budidaya air tawar Indonesia. Adaptasinya tinggi, pertumbuhannya cepat, dan toleransinya luas terhadap variasi kualitas air menjadikannya spesies unggulan.",
        "habitat_detail": "Kolam tanah, kolam beton, dan karamba di perairan tawar tropis. Berasal dari Afrika Timur, kini tersebar luas.",
        "diet": "Omnivora — alga, fitoplankton, dedaunan, dan pakan pelet buatan.",
        "fact": "Nila jantan tumbuh 2x lebih cepat dari betina — teknik budidaya monosex jantan kini dominan di industri.",
        "conservation": "Least Concern — salah satu spesies budidaya terpenting dunia. Namun dianggap invasif di ekosistem alami.",
      },
      {
        "id": "rohu",
        "name": "Rohu / Rui",
        "scientific": "Labeo rohita",
        "category": "Tawar",
        "habitat": "Kolam & Sungai",
        "bg": "from-orange-400 to-amber-500",
        "image": "/Rohu fish.png",
        "params": { "ph": [7.0, 8.5], "temp": [24, 32], "turbidity": [5, 20] },
        "story": "Rohu adalah ikan mas air tawar asli Asia Selatan yang sangat populer di budidaya kolam Bangladesh dan India. Ikan ini berperan penting dalam sistem budidaya polikultur.",
        "habitat_detail": "Sungai besar dan kolam budidaya di anak benua Asia Selatan. Di Indonesia mulai dibudidayakan secara terbatas.",
        "diet": "Herbivora — fitoplankton, perifiton, dan detritus organik di dasar kolam.",
        "fact": "Rohu dapat tumbuh hingga 2 kg dalam 12 bulan di kondisi budidaya optimal — salah satu laju pertumbuhan tertinggi di kelompok ikan karpioidae.",
        "conservation": "Least Concern — spesies budidaya utama di Bangladesh, India, dan Pakistan.",
      },
      {
        "id": "patin",
        "name": "Patin / Pangas",
        "scientific": "Pangasianodon hypophthalmus",
        "category": "Tawar",
        "habitat": "Sungai & Karamba",
        "bg": "from-blue-400 to-indigo-500",
        "image": "/patin.jpg",
        "params": { "ph": [6.5, 8.0], "temp": [26, 32], "turbidity": [10, 30] },
        "story": "Patin adalah ikan sungai tropis yang kini menjadi komoditas ekspor utama Vietnam dan Indonesia. Daging putihnya diminati pasar internasional.",
        "habitat_detail": "Sungai besar tropis Asia Tenggara (Mekong, Musi, dll) dan karamba jaring apung.",
        "diet": "Omnivora oportunistik — ikan kecil, crustacea, detritus, dan pakan buatan.",
        "fact": "Patin bisa bermigrasi ratusan kilometer di sungai besar untuk memijah — fenomena yang mendorong pengelolaan tangkapan terkoordinasi.",
        "conservation": "Least Concern secara global, namun populasi liar menurun karena perubahan aliran sungai.",
      },
      {
        "id": "silvercup",
        "name": "Mas Perak / Silver Carp",
        "scientific": "Hypophthalmichthys molitrix",
        "category": "Tawar",
        "habitat": "Waduk & Danau",
        "bg": "from-gray-300 to-slate-400",
        "image": "/Silver cup fish.jpg",
        "params": { "ph": [7.0, 8.5], "temp": [20, 30], "turbidity": [5, 20] },
        "story": "Silver Carp dikenal luas di budidaya polikultur Asia sebagai 'pembersih' kolam — menyaring fitoplankton dan menjaga keseimbangan ekologi kolam budidaya.",
        "habitat_detail": "Sungai besar dan waduk di Asia Timur dan Asia Tengah. Di Indonesia dibudidayakan terbatas.",
        "diet": "Filter feeder — menyaring fitoplankton dan detritus halus dari kolom air.",
        "fact": "Silver Carp bisa melompat hingga 3 meter ke udara saat terkejut — menjadikannya risiko keselamatan bagi pengemudi perahu di sungai yang telah terinvasi.",
        "conservation": "Spesies invasif di Amerika Utara, namun penting untuk budidaya di Asia.",
      },
      {
        "id": "katla",
        "name": "Katla",
        "scientific": "Catla catla",
        "category": "Tawar",
        "habitat": "Kolam & Sungai",
        "bg": "from-emerald-400 to-green-500",
        "image": "/Katla fish.jpg",
        "params": { "ph": [7.0, 8.5], "temp": [24, 32], "turbidity": [5, 20] },
        "story": "Katla adalah ikan terbesar dalam sistem budidaya polikultur Asia Selatan. Pertumbuhannya cepat dan dagingnya bernilai ekonomi tinggi di Bangladesh dan India.",
        "habitat_detail": "Sungai dan kolam budidaya di anak benua India. Menempati lapisan permukaan dalam polikultur.",
        "diet": "Zooplankton, fitoplankton, dan pakan tambahan — berenang di lapisan permukaan kolam.",
        "fact": "Dalam sistem polikultur South Asian Composite Carp Culture, Katla, Rohu, dan Mrigal dibudidayakan bersama memanfaatkan zona kolam berbeda.",
        "conservation": "Near Threatened — populasi sungai menurun akibat modifikasi habitat dan penangkapan berlebihan.",
      },
      {
        "id": "singhi",
        "name": "Singhi / Ikan Duri",
        "scientific": "Heteropneustes fossilis",
        "category": "Tawar",
        "habitat": "Rawa & Kolam",
        "bg": "from-yellow-500 to-amber-600",
        "image": "/Stinging catfish.jpeg",
        "params": { "ph": [6.0, 8.0], "temp": [24, 34], "turbidity": [10, 35] },
        "story": "Singhi adalah ikan lele berduri Asia Selatan yang dikenal sebagai 'ikan obat' di Bangladesh. Memiliki organ pernapasan udara tambahan yang memungkinkan hidup di kolam dangkal.",
        "habitat_detail": "Rawa, kolam dangkal, sawah, dan perairan yang kering secara musiman di Asia Selatan.",
        "diet": "Omnivora — serangga air, cacing, siput, dan detritus organik.",
        "fact": "Singhi memiliki kelenjar racun di duri siripnya — suntikan bisa menyebabkan rasa sakit hebat selama beberapa jam.",
        "conservation": "Least Concern — populasi stabil, penting untuk ketahanan pangan komunitas pedesaan.",
      },
      {
        "id": "udang",
        "name": "Udang Air Tawar",
        "scientific": "Macrobrachium sp.",
        "category": "Tawar",
        "habitat": "Sungai & Kolam",
        "bg": "from-pink-400 to-rose-500",
        "image": "/shrimp.jpeg",
        "params": { "ph": [7.0, 8.5], "temp": [25, 31], "turbidity": [0, 15] },
        "story": "Udang galah dan udang air tawar lainnya merupakan komoditas ekspor andalan karena harganya yang tinggi. Sangat sensitif terhadap perubahan kualitas air.",
        "habitat_detail": "Dasar sungai, danau, dan kolam tanah air tawar. Sensitif terhadap pencemaran pestisida dan logam berat.",
        "diet": "Omnivora bentik — memakan sisa pakan, detritus, dan mikroorganisme di dasar perairan.",
        "fact": "Udang galah jantan dominan (blue-claw) memiliki capit berwarna biru yang panjangnya bisa melebihi ukuran tubuhnya sendiri.",
        "conservation": "Least Concern secara umum, namun habitat alaminya banyak yang rusak karena pencemaran.",
      },
      {
        "id": "mas",
        "name": "Ikan Mas",
        "scientific": "Cyprinus carpio",
        "category": "Tawar",
        "habitat": "Kolam, Danau",
        "bg": "from-amber-200 to-orange-400",
        "image": "/Karpio.jpeg",
        "params": { "ph": [6.5, 8.5], "temp": [22, 30], "turbidity": [5, 30] },
        "story": "Ikan Mas adalah salah satu spesies tertua yang dibudidayakan manusia. Sangat populer di seluruh dunia baik untuk konsumsi maupun ikan hias (Koi).",
        "habitat_detail": "Danau, sungai lambat, dan kolam budidaya di berbagai zona iklim.",
        "diet": "Omnivora — memakan hewan bentik, tanaman air, dan sisa organik di dasar perairan (bottom feeder).",
        "fact": "Ikan mas diketahui mengaduk-aduk dasar lumpur untuk mencari makan, yang seringkali menyebabkan peningkatan kekeruhan kolam.",
        "conservation": "Vulnerable di habitat aslinya (Eurasia), namun spesies invasif di banyak negara lain.",
      },
      {
        "id": "prawn",
        "name": "Udang Galah / Prawn",
        "scientific": "Macrobrachium rosenbergii",
        "category": "Tawar",
        "habitat": "Sungai & Kolam",
        "bg": "from-red-400 to-rose-600",
        "image": "/udang galah.webp",
        "params": { "ph": [7.0, 8.5], "temp": [26, 31], "turbidity": [0, 15] },
        "story": "Giant Freshwater Prawn (Udang Galah) adalah spesies udang air tawar terbesar. Bernilai ekonomi sangat tinggi namun membutuhkan pengelolaan kualitas air yang ketat.",
        "habitat_detail": "Air tawar hingga estuari (membutuhkan air payau untuk fase larva). Budi daya di kolam tanah.",
        "diet": "Omnivora oportunistik — sisa pakan, materi organik kecil, cacing, dan siput air.",
        "fact": "Fase larva udang galah harus dipelihara di air payau (salinitas 12-14 ppt), baru setelah menjadi post-larva (PL) dipindah ke air tawar murni.",
        "conservation": "Least Concern, tapi terancam oleh pembangunan bendungan yang menghambat migrasi reproduksinya ke estuari.",
      },
      {
        "id": "koi",
        "name": "Ikan Koi",
        "scientific": "Cyprinus rubrofuscus",
        "category": "Hias",
        "habitat": "Kolam Beton/Hias",
        "bg": "from-red-500 to-orange-600",
        "image": "/KOI.jpeg",
        "params": { "ph": [7.0, 8.5], "temp": [15, 28], "turbidity": [0, 5] },
        "story": "Koi adalah varietas hias dari ikan mas yang diseleksi untuk warna-warni indahnya. Sangat dihargai di Jepang dan seluruh dunia sebagai simbol keberuntungan dan kekuatan.",
        "habitat_detail": "Kolam buatan yang terkontrol ketat. Kualitas air jernih mutlak diperlukan untuk menonjolkan warna ikan.",
        "diet": "Omnivora — pakan pelet khusus tinggi protein dan penambah warna (spirulina, astaxanthin).",
        "fact": "Koi dapat hidup sangat lama — seekor Koi legendaris bernama 'Hanako' diyakini hidup hingga usia 226 tahun.",
        "conservation": "Tidak dievaluasi secara spesifik (domesticated variety).",
      },
      {
        "id": "lele",
        "name": "Lele / Magur",
        "scientific": "Clarias batrachus",
        "category": "Tawar",
        "habitat": "Kolam & Rawa",
        "bg": "from-slate-700 to-gray-900",
        "image": "/walking fish.jpeg",
        "params": { "ph": [6.0, 8.5], "temp": [25, 34], "turbidity": [15, 45] },
        "story": "Lele (Walking Catfish / Magur) terkenal karena ketahanannya yang luar biasa terhadap kondisi air buruk. Memiliki organ labirin yang memungkinkannya menghirup udara dari atmosfer.",
        "habitat_detail": "Rawa, sungai, selokan, dan kolam budidaya intensif. Sangat toleran terhadap kondisi miskin oksigen.",
        "diet": "Karnivora/Omnivora agresif — cacing, serangga, ikan kecil, dan pakan buatan.",
        "fact": "Lele dapat 'berjalan' di darat menggunakan sirip dadanya saat hujan untuk berpindah antar perairan.",
        "conservation": "Least Concern — dibudidayakan secara ekstensif, namun dianggap invasif di Florida, AS.",
      }
    ]

    for loc in locations_data:
        cursor.execute('''
            INSERT INTO locations (id, name, shortName, cx, cy, ph, temp, turbidity, description, ecosystem, color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (loc['id'], loc['name'], loc['shortName'], loc['cx'], loc['cy'], loc['ph'], loc['temp'], loc['turbidity'], loc['description'], loc['ecosystem'], loc['color']))

    for fish in fish_data:
        cursor.execute('''
            INSERT INTO fishes (id, name, scientific, category, habitat, bg, image, ph_json, temp_json, turbidity_json, story, habitat_detail, diet, fact, conservation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (fish['id'], fish['name'], fish['scientific'], fish['category'], fish['habitat'], fish['bg'], fish['image'], 
              json.dumps(fish['params']['ph']), json.dumps(fish['params']['temp']), json.dumps(fish['params']['turbidity']),
              fish['story'], fish['habitat_detail'], fish['diet'], fish['fact'], fish['conservation']))

    conn.commit()
    conn.close()
    print("Database aquaculture.db created and populated successfully.")

if __name__ == "__main__":
    init_db()
