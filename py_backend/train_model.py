import os; os.chdir(os.path.dirname(os.path.abspath(__file__)))
import re, string, pickle
import pandas as pd
import xgboost as xgb
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
import nltk

nltk.download('stopwords')

# GPU Detection
def gpu_available():
    try:
        import cupy
        return cupy.cuda.runtime.getDeviceCount() > 0
    except Exception:
        return False

USE_GPU = gpu_available()

if USE_GPU:
    print("GPU detected — using XGBoost with CUDA cores!")
    tree_method = "gpu_hist"
    predictor = "gpu_predictor"
else:
    print("No GPU found — falling back to CPU.")
    tree_method = "hist"
    predictor = "cpu_predictor"

# Load Dataset
path = "data/news_data.json"
if not os.path.exists(path):
    raise FileNotFoundError(f"File not found: {os.path.abspath(path)}")

df = pd.read_json(path, lines=True)
df = df[['headline', 'category']].dropna()

# Balance Dataset (req min samples per category)
category_counts = df['category'].value_counts()
valid_categories = category_counts[category_counts >= 2].index
df = df[df['category'].isin(valid_categories)].copy()

if df.empty:
    raise ValueError("No categories meet the minimum sample threshold."
                     " Consider collecting more data or lowering the threshold.")

# text cleaning
ps = PorterStemmer()
stop_words = set(stopwords.words('english'))

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = re.sub(r'\d+', '', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = ' '.join([ps.stem(w) for w in text.split() if w not in stop_words])
    return text

df['clean'] = df['headline'].apply(clean_text)

# Encode Categories
label_encoder = LabelEncoder()
df['encoded_category'] = label_encoder.fit_transform(df['category'])

# Vectorization
vectorizer = TfidfVectorizer(max_features=8000, ngram_range=(1, 2))
X = vectorizer.fit_transform(df['clean'])
y = df['encoded_category']

# Train/Test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = xgb.XGBClassifier(
    tree_method=tree_method,
    predictor=predictor,
    n_estimators=300,
    max_depth=10,
    learning_rate=0.2,
    subsample=0.8,
    colsample_bytree=0.8,
    n_jobs=-1,
    verbosity=0,
)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
report = classification_report(
    y_test,
    y_pred,
    labels=range(len(label_encoder.classes_)),
    target_names=label_encoder.classes_,
)
print("\nClassification Report:\n", report)

# Save
os.makedirs("model", exist_ok=True)
model.save_model("model/topic_model.json")

with open("model/vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)
with open("model/label_encoder.pkl", "wb") as f:
    pickle.dump(label_encoder, f)

print(f"Model trained and saved successfully! ({'GPU' if USE_GPU else 'CPU'} mode)")
print(f"Total samples: {len(df)} | Categories: {df['category'].nunique()}")
