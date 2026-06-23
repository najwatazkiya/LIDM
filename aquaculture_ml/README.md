# 🐟 Aquaculture ML — Fish Recommendation System

Sistem rekomendasi ikan berbasis kualitas air menggunakan Machine Learning dan simulasi IoT.

## Deskripsi

Fitur ini mengevaluasi apakah jenis ikan tertentu **cocok atau tidak** dengan kondisi air di suatu titik kolam (stasiun IoT), berdasarkan parameter pH, suhu, dan turbiditas.

**Flow:**
```
User pilih stasiun kolam → ambil kondisi air (simulasi IoT)
→ User drag & drop ikan → model evaluasi → return JSON ke FE/BE
```

## Dataset

| Dataset | Sumber | Fungsi |
|---|---|---|
| `realfishdataset.csv` | [Kaggle](https://www.kaggle.com/datasets/monirmukul/realtime-pond-water-dataset-for-fish-farming) | Training model klasifikasi ikan |
| `pondsdata.csv` | [Kaggle](https://www.kaggle.com/datasets/apgopi/pondsdata) | Simulasi data IoT per stasiun (3 kolam) |

> Dataset disimpan di Google Drive, tidak di-push ke GitHub.

## Struktur Project

```
aquaculture_ml/
├── notebooks/
│   └── fish_recommendation.ipynb   ← jalankan di Google Colab
├── src/
│   ├── train_model.py              ← training Random Forest
│   ├── simulate_iot.py             ← simulasi data per stasiun
│   └── evaluate_fish.py            ← evaluasi ikan → JSON output
├── outputs/
│   └── evaluation_result.json      ← contoh output
├── .gitignore
├── requirements.txt
└── README.md
```

## Cara Menjalankan (Google Colab)

1. Upload semua file `src/` ke `MyDrive/aquaculture_ml/src/`
2. Buka `notebooks/fish_recommendation.ipynb` di Google Colab
3. Jalankan cell secara berurutan (Cell 1 → Cell 9)

## Contoh Output JSON

```json
{
  "status": "success",
  "timestamp": "2024-01-15T10:30:00Z",
  "station": {
    "station_id": "pond_1",
    "name": "Pond Station 1",
    "water_condition": {
      "pH": 7.2,
      "temperature": 28.5,
      "turbidity": 12.3
    },
    "water_quality_status": "good",
    "parameter_analysis": {
      "pH":          {"value": 7.2,  "status": "optimal"},
      "temperature": {"value": 28.5, "status": "optimal"},
      "turbidity":   {"value": 12.3, "status": "optimal"}
    }
  },
  "evaluation": {
    "fish_queried":    "Tilapia",
    "recommendation":  "recommended",
    "confidence_score": 0.87,
    "confidence_label": "Very High",
    "top_alternatives": [
      {"fish": "Catfish", "confidence": 0.06}
    ]
  }
}
```

## Label Rekomendasi

| Label | Confidence | Arti |
|---|---|---|
| `recommended` | ≥ 65% | Ikan sangat cocok di kondisi air ini |
| `possible` | 35–64% | Ikan mungkin bisa bertahan, tapi kurang ideal |
| `not_recommended` | < 35% | Kondisi air tidak cocok untuk ikan ini |
