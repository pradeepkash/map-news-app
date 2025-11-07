# test_model.py
import pickle
import re
import string
import xgboost as xgb
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

ps = PorterStemmer()
stop_words = set(stopwords.words('english'))

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = re.sub(r'\d+', '', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = ' '.join([ps.stem(w) for w in text.split() if w not in stop_words])
    return text

# Load
model = xgb.XGBClassifier()
model.load_model("model/topic_model.json")
vectorizer = pickle.load(open("model/vectorizer.pkl", "rb"))
label_encoder = pickle.load(open("model/label_encoder.pkl", "rb"))

# Predict
def predict_topic(title):
    text = clean_text(title)
    vec = vectorizer.transform([text])
    pred = model.predict(vec)
    return label_encoder.inverse_transform(pred)[0]

# Example
sample = "NASA launches new satellite to study global warming"
print("Predicted Category:", predict_topic(sample))
