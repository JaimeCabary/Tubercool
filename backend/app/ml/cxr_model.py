"""
CXR inference wrapper — loads trained MobileNetV2 once and reuses it.
Called by predictor.py when a chest X-ray image path is provided.
"""

from __future__ import annotations
import json
import os
from pathlib import Path
from typing import Optional

# Suppress TF logs
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

MODEL_DIR  = Path(__file__).resolve().parent / "models"
MODEL_PATH = MODEL_DIR / "cxr_mobilenet.keras"
META_PATH  = MODEL_DIR / "cxr_meta.json"

_model = None
_meta: dict = {}


def _load():
    global _model, _meta
    if _model is not None:
        return
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"CXR model not found at {MODEL_PATH}. "
            "Run: uv run --system-certs python -m app.ml.train_cxr"
        )
    import tensorflow as tf
    _model = tf.keras.models.load_model(str(MODEL_PATH))
    if META_PATH.exists():
        _meta = json.loads(META_PATH.read_text())


def predict_cxr(image_bytes: bytes) -> dict:
    """
    Run CXR classification on raw image bytes.
    Returns {probability_tb, label, confidence, model_version}.
    """
    _load()
    import numpy as np
    import tensorflow as tf
    from PIL import Image
    import io

    img_size = _meta.get("img_size", 224)

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((img_size, img_size))
    arr = np.array(img, dtype=np.float32)
    arr = tf.keras.applications.mobilenet_v2.preprocess_input(arr)
    arr = np.expand_dims(arr, 0)

    prob_tb = float(_model.predict(arr, verbose=0)[0][0])
    threshold = _meta.get("threshold", 0.5)
    label = "Tuberculosis" if prob_tb >= threshold else "Normal"

    if prob_tb >= 0.80 or prob_tb <= 0.20:
        confidence = "HIGH"
    elif prob_tb >= 0.65 or prob_tb <= 0.35:
        confidence = "MEDIUM"
    else:
        confidence = "LOW"

    return {
        "probability_tb": round(prob_tb, 4),
        "probability_normal": round(1.0 - prob_tb, 4),
        "label": label,
        "confidence": confidence,
        "model_version": _meta.get("model_version", "MobileNetV2-CXR-v1"),
        "test_auc": _meta.get("test_auc"),
    }


def model_ready() -> bool:
    return MODEL_PATH.exists()
