from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
import sys
import sqlite3
import json
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(dotenv_path)

# Ensure the back_end folder is in the import path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Prevent OpenBLAS memory allocation errors on Windows
os.environ["OPENBLAS_NUM_THREADS"] = "1"

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "aquaculture.db")

# 1. MENGIMPOR ML ASLI (Pastikan folder aquaculture_ml ada di sebelah main.py)
from aquaculture_ml.src.evaluate_fish import load_model, evaluate_fish

app = FastAPI(title="API Akuakultur Cerdas")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Koneksi ke Groq LLM
client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"), 
    base_url="https://api.groq.com/openai/v1"
)

# 2. MEMUAT MODEL ML SAAT SERVER MENYALA
ml_model, label_encoder = load_model()

from typing import List, Optional, Dict, Any

class WaterData(BaseModel):
    species: str
    ph: float
    temperature: float
    turbidity: float
    local_status: str = "cocok"
    details: Optional[List[Dict[str, Any]]] = None

@app.get("/")
def read_root():
    return {"status": "success", "message": "Backend berjalan lancar!"}

@app.post("/api/recommendation")
def get_ai_recommendation(data: WaterData):
    # Menyusun data air sesuai permintaan ML temanmu
    water_condition = {
        "ph": data.ph,
        "temperature": data.temperature,
        "turbidity": data.turbidity
    }
    
    # 3. MEMANGGIL KECERDASAN ML LOKAL (SCIKIT-LEARN)
    ml_result = evaluate_fish(
        model=ml_model, 
        le=label_encoder, 
        fish_name=data.species, 
        water_condition=water_condition
    )
    
    # Jika ikan tidak ada di model, kembalikan error
    if ml_result["status"] == "error":
        return ml_result

    # Mengambil hasil analisis penting dari ML
    eval_data = ml_result["evaluation"]
    station_data = ml_result["station"]
    
    water_quality = station_data["water_quality_status"] # good / warning / critical
    top_alternatives = eval_data["top_alternatives"] # Daftar ikan alternatif
    
    # Menyelaraskan status dari frontend (rule-based)
    if data.local_status == "cocok":
        recommendation_status = "recommended"
    elif data.local_status == "kurang_ideal":
        recommendation_status = "possible"
    else:
        recommendation_status = "not_recommended"
        
    # Ambil 1 rekomendasi ikan alternatif terbaik (jika ada)
    best_alternative = top_alternatives[0]["fish"] if top_alternatives else "Tidak ada"

    # 4. MEMBANGUN ANALISIS BIOLOGIS & STRATEGI TINDAKAN SOLUTIF UNTUK ORANG AWAM (Tanpa Jargon Rumit)
    bio_analysis = []
    solutions = []
    
    if data.details:
        for detail in data.details:
            param = detail.get("param", "")
            val = detail.get("value", 0)
            p_min = detail.get("idealMin", 0)
            p_max = detail.get("idealMax", 0)
            in_range = detail.get("inRange", False)
            
            p_label = "pH" if param == "ph" else "Suhu" if param == "temp" else "Kekeruhan"
            p_unit = " °C" if param == "temp" else " NTU" if param == "turbidity" else ""
            
            if in_range:
                bio_analysis.append(f"- **{p_label}** ({val}{p_unit}): Berada dalam rentang optimal ({p_min} - {p_max}). Kebutuhan hidup ikan terpenuhi dengan sangat baik.")
            else:
                bio_analysis.append(f"- **{p_label}** ({val}{p_unit}): Kondisi kurang ideal! (idealnya {p_min} - {p_max}). Dapat membuat ikan stres.")
                
                # Solusi praktis
                if param == "ph":
                    if val < p_min:
                        solutions.append(
                            f"- **Air Terlalu Asam (pH {val})**:\n"
                            f"  * *Tindakan Cepat*: Taburkan Kapur Pertanian (Dolomit) sebanyak 10-20 gram untuk setiap 1.000 liter (1 meter kubik) air kolam. Larutkan kapur dalam ember berisi air terlebih dahulu, lalu tebar air larutan tersebut secara merata ke seluruh kolam pada sore hari.\n"
                            f"  * *Tindakan Penunjang*: Lakukan pergantian air kolam sebanyak 10-20% menggunakan air bersih yang sudah diendapkan selama minimal 24 jam."
                        )
                    else:
                        solutions.append(
                            f"- **Air Terlalu Basa/Alkali (pH {val})**:\n"
                            f"  * *Tindakan Cepat*: Masukkan Daun Ketapang kering yang diikat atau dimasukkan ke dalam karung jaring (sekitar 5-10 lembar untuk tiap 1.000 liter air kolam). Asam organik alami dari daun ketapang akan menurunkan pH secara perlahan dan aman bagi ikan.\n"
                            f"  * *Tindakan Penunjang*: Tambahkan air baru yang bersih atau manfaatkan air rendaman pelepah pisang untuk membantu menetralkan tingkat kebiasan air."
                        )
                elif param == "temp":
                    if val < p_min:
                        solutions.append(
                            f"- **Suhu Air Terlalu Dingin ({val}°C)**:\n"
                            f"  * *Tindakan Cepat*: Pangkas dahan atau ranting pohon rindang di sekitar kolam, serta kurangi tanaman air mengapung (seperti eceng gondok atau kangkung) agar sinar matahari pagi dan siang dapat menyinari permukaan air kolam secara langsung untuk menghangatkannya.\n"
                            f"  * *Tindakan Penunjang*: Hindari melakukan pengisian air baru pada malam hari karena suhu air baru cenderung dingin dan dapat memicu stres mendadak (shock suhu) pada ikan."
                        )
                    else:
                        solutions.append(
                            f"- **Suhu Air Terlalu Panas ({val}°C)**:\n"
                            f"  * *Tindakan Cepat*: Pasang jaring paranet hitam (tingkat peneduh 65-75%) di atas kolam untuk meredam terik matahari langsung pada siang hari.\n"
                            f"  * *Tindakan Penunjang*: Nyalakan pompa pancuran air atau kincir angin kolam pada siang hingga sore hari untuk menciptakan efek sirkulasi pendinginan air sekaligus menambah suplai oksigen terlarut yang menurun akibat suhu tinggi."
                        )
                elif param == "turbidity":
                    if val < p_min:
                        solutions.append(
                            f"- **Air Kolam Terlalu Jernih/Bening ({val} NTU)**:\n"
                            f"  * *Tindakan Cepat*: Lakukan pemupukan alami dengan memasukkan pupuk kandang matang/organik yang dibungkus karung berpori (sekitar 50 gram per meter persegi kolam) dan gantungkan di pinggir kolam. Ini merangsang tumbuhnya jentik plankton hijau (air kolam menjadi kehijauan sehat) yang berfungsi sebagai pakan alami sekaligus pelindung dari sinar matahari langsung.\n"
                            f"  * *Tindakan Penunjang*: Batasi frekuensi penggantian air kolam agar ekosistem plankton alami tidak terbuang sia-sia."
                        )
                    else:
                        solutions.append(
                            f"- **Air Kolam Terlalu Keruh/Kotor ({val} NTU)**:\n"
                            f"  * *Tindakan Cepat*: Segera kurangi porsi pemberian pakan harian hingga setengahnya (50%) selama 3-5 hari ke depan. Pakan berlebih yang membusuk di dasar kolam adalah penyebab utama air menjadi keruh, bau, dan mengandung gas beracun.\n"
                            f"  * *Tindakan Penunjang*: Pasang saringan sirkulasi sederhana (isi dengan busa filter atau ijuk) pada aliran air kolam, serta bersihkan atau sedot (siphon) lumpur sisa kotoran yang menumpuk di dasar kolam secara rutin."
                        )
    else:
        # Fallback jika details tidak dikirim
        for param, details in station_data["parameter_analysis"].items():
            status = details["status"]
            val = details["value"]
            p_min = details["optimal_range"]["min"]
            p_max = details["optimal_range"]["max"]
            p_label = "pH" if param == "ph" else "Suhu" if param == "temp" else "Kekeruhan"
            p_unit = " °C" if param == "temp" else " NTU" if param == "turbidity" else ""
            
            if status == "optimal":
                bio_analysis.append(f"- **{p_label}** ({val}{p_unit}): Berada dalam rentang optimal ({p_min} - {p_max}).")
            else:
                bio_analysis.append(f"- **{p_label}** ({val}{p_unit}): Kondisi tidak ideal! (idealnya {p_min} - {p_max}).")
                
                if param == "ph":
                    if val < p_min:
                        solutions.append(
                            f"- **Air Terlalu Asam (pH {val})**:\n"
                            f"  * *Tindakan Cepat*: Tebarkan kapur dolomit pertanian 15 gram per meter kubik air kolam (larutkan terlebih dahulu) untuk menetralkan pH air."
                        )
                    else:
                        solutions.append(
                            f"- **Air Terlalu Basa (pH {val})**:\n"
                            f"  * *Tindakan Cepat*: Rendam daun ketapang kering (5 lembar per 1.000 liter) atau tambahkan air baru untuk menurunkan keasaman/kebasaan air."
                        )
                elif param == "temp":
                    if val < p_min:
                        solutions.append(
                            f"- **Suhu Air Terlalu Dingin ({val}°C)**:\n"
                            f"  * *Tindakan Cepat*: Biarkan cahaya matahari menyinari permukaan kolam tanpa terhalang peneduh."
                        )
                    else:
                        solutions.append(
                            f"- **Suhu Air Terlalu Panas ({val}°C)**:\n"
                            f"  * *Tindakan Cepat*: Buat jaring peneduh paranet di atas kolam atau tambah debit air dingin dari sumur."
                        )
                elif param == "turbidity":
                    if val < p_min:
                        solutions.append(
                            f"- **Air Terlalu Jernih ({val} NTU)**:\n"
                            f"  * *Tindakan Cepat*: Lakukan pemupukan ringan dengan pupuk kandang dalam karung untuk memicu pertumbuhan pakan alami hijau."
                        )
                    else:
                        solutions.append(
                            f"- **Air Terlalu Keruh/Kotor ({val} NTU)**:\n"
                            f"  * *Tindakan Cepat*: Kurangi pemberian pakan sisa, saring aliran air kolam, dan buang lumpur dasar kolam."
                        )

    # Gabungkan solusi
    if not solutions:
        solutions.append("- **Kondisi Kolam Sangat Baik**: Pertahankan kondisi air dengan memantau pH dan suhu secara berkala seminggu sekali, serta bersihkan lumut jika terlalu tebal.")
        
    if recommendation_status == "not_recommended":
        solutions.append(f"- **Rekomendasi Spesies**: Karena air kolam saat ini sangat tidak cocok untuk {data.species}, sangat disarankan beralih memelihara **{best_alternative}** yang terbukti jauh lebih tahan banting dan cocok dengan kondisi kolam Anda.")

    bio_text = "\n".join(bio_analysis)
    recommendation_text = "\n".join(solutions)
    
    ai_message = (
        "**Analisis Kualitas Air (Kondisi Kolam Anda)**:\n"
        f"{bio_text}\n\n"
        "**Solusi Praktis Penanganan Kolam (Panduan Mudah)**:\n"
        f"{recommendation_text}"
    )

    # 5. MENGGABUNGKAN HASIL ML DAN AI UNTUK FRONTEND
    return {
        "status": "success",
        "input_data": data,
        "machine_learning_result": ml_result,
        "ai_interpretation": ai_message
    }

@app.get("/api/locations")
def get_locations():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, shortName, cx, cy, ph, temp, turbidity, description, ecosystem, color FROM locations")
    rows = cursor.fetchall()
    conn.close()
    
    locations = []
    for row in rows:
        locations.append({
            "id": row[0],
            "name": row[1],
            "shortName": row[2],
            "cx": row[3],
            "cy": row[4],
            "params": {
                "ph": row[5],
                "temp": row[6],
                "turbidity": row[7]
            },
            "description": row[8],
            "ecosystem": row[9],
            "color": row[10]
        })
    return locations

@app.get("/api/fishes")
def get_fishes():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, scientific, category, habitat, bg, image, ph_json, temp_json, turbidity_json, story, habitat_detail, diet, fact, conservation FROM fishes")
    rows = cursor.fetchall()
    conn.close()
    
    fishes = []
    for row in rows:
        fishes.append({
            "id": row[0],
            "name": row[1],
            "scientific": row[2],
            "category": row[3],
            "habitat": row[4],
            "bg": row[5],
            "image": row[6],
            "params": {
                "ph": json.loads(row[7]) if row[7] else [6.5, 8.5],
                "temp": json.loads(row[8]) if row[8] else [25, 32],
                "turbidity": json.loads(row[9]) if row[9] else [5, 25]
            },
            "story": row[10],
            "habitat_detail": row[11],
            "diet": row[12],
            "fact": row[13],
            "conservation": row[14]
        })
    return fishes