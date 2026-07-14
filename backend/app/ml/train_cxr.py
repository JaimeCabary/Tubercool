"""
CXR TB Classifier — MobileNetV2 Transfer Learning
===================================================
Dataset: TB_Chest_Radiography_Database
  Normal:       3,500 images
  Tuberculosis:   700 images

Architecture: MobileNetV2 (ImageNet pretrained) + custom head
Class imbalance handled via class_weight (5:1 ratio)
Saves model to: app/ml/models/cxr_mobilenet.keras
"""

import os, json, time, sys

# Force UTF-8 stdout so box-drawing chars don't crash on Windows cp1252 consoles
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"  # suppress TF info/warnings

import numpy as np
from pathlib import Path
from PIL import Image

import tensorflow as tf
from tensorflow.keras import layers, models, callbacks
from tensorflow.keras.applications import MobileNetV2
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

# ── Paths ──────────────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parent.parent.parent
DATA_DIR   = BASE_DIR / "TB_Chest_Radiography_Database"
MODEL_DIR  = Path(__file__).resolve().parent / "models"
MODEL_PATH = MODEL_DIR / "cxr_mobilenet.keras"
META_PATH  = MODEL_DIR / "cxr_meta.json"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# ── Config ─────────────────────────────────────────────────────────────────
IMG_SIZE   = 224          # MobileNetV2 native input
BATCH_SIZE = 32
EPOCHS_TOP = 10           # train head only
EPOCHS_FT  = 5            # fine-tune top MobileNetV2 layers
SEED       = 42

print(f"\n{'='*60}")
print("TB Chest X-ray Classifier — Training")
print(f"{'='*60}")
print(f"Dataset : {DATA_DIR}")
print(f"Output  : {MODEL_PATH}")
print(f"TF      : {tf.__version__}")
print(f"GPU     : {tf.config.list_physical_devices('GPU') or 'CPU only'}\n")

# ── Load image paths and labels ────────────────────────────────────────────
def load_dataset(data_dir: Path):
    paths, labels = [], []
    class_map = {"Normal": 0, "Tuberculosis": 1}
    for class_name, label in class_map.items():
        folder = data_dir / class_name
        if not folder.exists():
            raise FileNotFoundError(f"Missing folder: {folder}")
        imgs = list(folder.glob("*.png")) + list(folder.glob("*.jpg")) + list(folder.glob("*.jpeg"))
        print(f"  {class_name}: {len(imgs)} images")
        paths.extend(imgs)
        labels.extend([label] * len(imgs))
    return paths, labels

print("Loading image paths...")
all_paths, all_labels = load_dataset(DATA_DIR)
all_labels = np.array(all_labels)
total = len(all_paths)
print(f"  Total: {total} images\n")

# Train/val/test split: 70/15/15
X_temp, X_test, y_temp, y_test = train_test_split(
    all_paths, all_labels, test_size=0.15, stratify=all_labels, random_state=SEED
)
X_train, X_val, y_train, y_val = train_test_split(
    X_temp, y_temp, test_size=0.176, stratify=y_temp, random_state=SEED
)
print(f"Split: train={len(X_train)}  val={len(X_val)}  test={len(X_test)}\n")

# ── tf.data pipeline ───────────────────────────────────────────────────────
def preprocess(path_str, label):
    img = tf.io.read_file(path_str)
    img = tf.image.decode_png(img, channels=3)
    img = tf.image.resize(img, [IMG_SIZE, IMG_SIZE])
    img = tf.keras.applications.mobilenet_v2.preprocess_input(img)
    return img, label

def augment(img, label):
    img = tf.image.random_flip_left_right(img)
    img = tf.image.random_brightness(img, 0.15)
    img = tf.image.random_contrast(img, 0.85, 1.15)
    return img, label

def make_ds(paths, labels, training=False):
    path_strs = [str(p) for p in paths]
    ds = tf.data.Dataset.from_tensor_slices((path_strs, labels))
    ds = ds.map(preprocess, num_parallel_calls=tf.data.AUTOTUNE)
    if training:
        ds = ds.map(augment, num_parallel_calls=tf.data.AUTOTUNE)
        ds = ds.shuffle(512, seed=SEED)
    return ds.batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)

train_ds = make_ds(X_train, y_train, training=True)
val_ds   = make_ds(X_val,   y_val)
test_ds  = make_ds(X_test,  y_test)

# ── Class weights (handle 5:1 imbalance) ───────────────────────────────────
n_normal = int((all_labels == 0).sum())
n_tb     = int((all_labels == 1).sum())
w0 = total / (2 * n_normal)
w1 = total / (2 * n_tb)
class_weights = {0: w0, 1: w1}
print(f"Class weights — Normal: {w0:.3f}  TB: {w1:.3f}\n")

# ── Build model ────────────────────────────────────────────────────────────
base = MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    include_top=False,
    weights="imagenet",
)
base.trainable = False   # freeze for phase 1

inputs  = layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
x       = base(inputs, training=False)
x       = layers.GlobalAveragePooling2D()(x)
x       = layers.Dropout(0.3)(x)
x       = layers.Dense(128, activation="relu")(x)
x       = layers.Dropout(0.3)(x)
outputs = layers.Dense(1, activation="sigmoid")(x)
model   = models.Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-3),
    loss="binary_crossentropy",
    metrics=["accuracy", tf.keras.metrics.AUC(name="auc")],
)
model.summary(line_length=80)

# ── Phase 1: Train head ────────────────────────────────────────────────────
print(f"\n{'─'*60}")
print("Phase 1: Training classification head (base frozen)")
print(f"{'─'*60}")

# Checkpoint the GLOBAL best model (across both phases) by validation AUC.
# save_best_only + this single checkpoint object persisting its `best` across
# both fit() calls guarantees we keep the best weights ever seen, so a bad
# fine-tune epoch can never overwrite a good head-only model.
ckpt = callbacks.ModelCheckpoint(
    str(MODEL_PATH), monitor="val_auc", save_best_only=True, mode="max", verbose=1
)

cb1 = [
    ckpt,
    callbacks.EarlyStopping(monitor="val_auc", patience=4, restore_best_weights=True, mode="max"),
    callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2, verbose=1),
]

t0 = time.time()
h1 = model.fit(
    train_ds, epochs=EPOCHS_TOP,
    validation_data=val_ds,
    class_weight=class_weights,
    callbacks=cb1,
    verbose=1,
)
print(f"\nPhase 1 done in {(time.time()-t0)/60:.1f} min")

# ── Phase 2: Fine-tune top layers ──────────────────────────────────────────
print(f"\n{'─'*60}")
print("Phase 2: Fine-tuning top MobileNetV2 layers")
print(f"{'─'*60}")

base.trainable = True
# Unfreeze only the last 20 conv layers, and CRITICALLY keep every
# BatchNormalization layer frozen. Un-freezing BN lets its running mean/var
# update on our tiny batches and destroys the ImageNet feature statistics —
# that is exactly what collapsed val_auc 1.00 -> 0.74 in the first run.
for layer in base.layers[:-20]:
    layer.trainable = False
for layer in base.layers:
    if isinstance(layer, layers.BatchNormalization):
        layer.trainable = False

n_trainable = sum(1 for l in base.layers if l.trainable)
print(f"Fine-tuning {n_trainable} base layers (all BatchNorm frozen)")

model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-5),  # very low LR for gentle fine-tune
    loss="binary_crossentropy",
    metrics=["accuracy", tf.keras.metrics.AUC(name="auc")],
)

cb2 = [
    ckpt,  # same checkpoint — only overwrites if phase 2 beats phase 1's best AUC
    callbacks.EarlyStopping(monitor="val_auc", patience=3, restore_best_weights=True, mode="max"),
]

t1 = time.time()
h2 = model.fit(
    train_ds, epochs=EPOCHS_FT,
    validation_data=val_ds,
    class_weight=class_weights,
    callbacks=cb2,
    verbose=1,
)
print(f"\nPhase 2 done in {(time.time()-t1)/60:.1f} min")

# ── Reload the GLOBAL best checkpoint before evaluating ─────────────────────
# The in-memory model may be a worse fine-tune state; the file on disk is the
# best-AUC model across both phases. Always evaluate/ship that one.
print("\nReloading best checkpoint from disk for evaluation...")
model = tf.keras.models.load_model(str(MODEL_PATH))

# ── Threshold tuning on VALIDATION set (sensitivity-first) ──────────────────
# This is a TB SCREENING tool: a false negative (missed TB) is far costlier
# than a false positive. We pick the highest decision threshold that still
# achieves >= TARGET_RECALL sensitivity on validation, then maximise
# specificity subject to that. Threshold is chosen on val, never on test.
TARGET_RECALL = 0.95
print(f"\n{'─'*60}")
print(f"Tuning decision threshold for TB sensitivity >= {TARGET_RECALL:.2f} (val set)")
print(f"{'─'*60}")

val_prob = model.predict(val_ds, verbose=0).flatten()
y_val_arr = np.array(y_val)

best_thr, best_spec = 0.5, -1.0
for thr in np.linspace(0.01, 0.99, 99):
    pred = (val_prob >= thr).astype(int)
    tp = int(((pred == 1) & (y_val_arr == 1)).sum())
    fn = int(((pred == 0) & (y_val_arr == 1)).sum())
    tn = int(((pred == 0) & (y_val_arr == 0)).sum())
    fp = int(((pred == 1) & (y_val_arr == 0)).sum())
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    spec   = tn / (tn + fp) if (tn + fp) else 0.0
    # highest threshold meeting recall target, tie-broken by specificity
    if recall >= TARGET_RECALL and spec >= best_spec:
        best_spec, best_thr = spec, float(thr)

print(f"Chosen threshold : {best_thr:.3f}  (val specificity {best_spec:.3f})")

# ── Evaluate on held-out test set ──────────────────────────────────────────
print(f"\n{'─'*60}")
print("Test set evaluation")
print(f"{'─'*60}")

loss, acc, auc = model.evaluate(test_ds, verbose=0)
print(f"Test loss     : {loss:.4f}")
print(f"Test accuracy : {acc*100:.2f}%")
print(f"Test AUC      : {auc:.4f}")

y_pred_prob = model.predict(test_ds, verbose=0).flatten()

print(f"\n── At default threshold 0.50 ──")
y_pred_05 = (y_pred_prob >= 0.5).astype(int)
print(classification_report(y_test, y_pred_05, target_names=["Normal", "TB"]))
print(confusion_matrix(y_test, y_pred_05))

print(f"\n── At tuned threshold {best_thr:.3f} (sensitivity-first) ──")
y_pred = (y_pred_prob >= best_thr).astype(int)
print(classification_report(y_test, y_pred, target_names=["Normal", "TB"]))
cm = confusion_matrix(y_test, y_pred)
print(cm)

# Report test sensitivity/specificity at the shipped threshold
tn, fp, fn, tp = cm.ravel()
test_sensitivity = tp / (tp + fn) if (tp + fn) else 0.0
test_specificity = tn / (tn + fp) if (tn + fp) else 0.0
print(f"\nTest sensitivity (TB recall) : {test_sensitivity:.4f}")
print(f"Test specificity             : {test_specificity:.4f}")

# ── Save metadata ──────────────────────────────────────────────────────────
meta = {
    "model_version": "MobileNetV2-CXR-v1",
    "img_size": IMG_SIZE,
    "classes": ["Normal", "Tuberculosis"],
    "threshold": round(best_thr, 4),
    "threshold_policy": f"sensitivity-first, TB recall >= {TARGET_RECALL} on validation",
    "test_accuracy": float(acc),
    "test_auc": float(auc),
    "test_sensitivity": round(float(test_sensitivity), 4),
    "test_specificity": round(float(test_specificity), 4),
    "train_samples": len(X_train),
    "val_samples":   len(X_val),
    "test_samples":  len(X_test),
    "dataset": "TB_Chest_Radiography_Database (3500 Normal / 700 TB)",
    "paper_ref": "Ibegbulem C.R. (2026) FUTO PhD Proposal",
}
META_PATH.write_text(json.dumps(meta, indent=2))
print(f"\nModel saved : {MODEL_PATH}")
print(f"Meta saved  : {META_PATH}")
print(f"\nTotal training time: {(time.time()-t0)/60:.1f} min")
print("Done!")
