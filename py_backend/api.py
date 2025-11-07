# api.py
from flask import Flask, request, jsonify
import pickle, re, string, xgboost as xgb
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
import numpy as np
import os

app = Flask(__name__)

ps = PorterStemmer()
stop_words = set(stopwords.words('english'))

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = re.sub(r'\d+', '', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = ' '.join([ps.stem(w) for w in text.split() if w not in stop_words])
    return text

# === GPU Detection ===
def gpu_available():
    try:
        import cupy
        if cupy.cuda.runtime.getDeviceCount() > 0:
            return True
    except Exception:
        pass
    return False

USE_GPU = gpu_available()

if USE_GPU:
    print("⚡ GPU detected! API will use CUDA for inference.")
    predictor = "gpu_predictor"
else:
    print("⚠️ No GPU detected. API running on CPU.")
    predictor = "cpu_predictor"

# === Load model/vectorizer ===
model = xgb.XGBClassifier()
model.load_model("model/topic_model.json")
model.set_params(predictor=predictor)

vectorizer = pickle.load(open("model/vectorizer.pkl", "rb"))

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    texts = data.get("headlines", [])
    if not texts:
        return jsonify({"error": "Missing 'headlines' list"}), 400
    
    cleaned = [clean_text(t) for t in texts]
    X = vectorizer.transform(cleaned)
    preds = model.predict(X)
    results = [{"headline": t, "category": str(p)} for t, p in zip(texts, preds)]
    return jsonify(results)

if __name__ == "__main__":
    app.run(port=5000)
