# Model Training Guide

This guide covers the training tools included with AgriVisionAI. Training is optional: the web app can use the existing model files without retraining.

## 1. Prepare the dataset

Use a labeled leaf image dataset with one folder per class. Place the class folders under `backend/data/color/`:

```text
backend/data/color/
├── Apple___Apple_scab/
│   ├── image-001.jpg
│   └── image-002.jpg
├── Apple___healthy/
└── ...
```

The repository does not include a dataset. If you use PlantVillage, obtain it from a trusted source and review its terms and citation requirements before using or redistributing it.

## 2. Install backend dependencies

In PowerShell, start from the project folder:

```powershell
Set-Location backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If PowerShell prevents activation, use the Python executable inside `.venv` directly or follow your organization’s PowerShell policy for activating local environments.

## 3. Create the training and validation splits

With the terminal still in `backend/`, run:

```powershell
python setup_dataset.py
```

The script reads class folders from `data/color/` and copies their images into an 80/20 split:

```text
backend/data/train/<class>/
backend/data/val/<class>/
```

The source images remain in `data/color/`. Before training, confirm that both split folders contain the same class directories and that each class has images in both splits.

## 4. Train the recommended model

Still in `backend/`, run:

```powershell
python model/train_fixed.py
```

The script trains an EfficientNetB0 classifier in two phases. It expects `data/train/` and `data/val/` relative to the backend directory and uses TensorFlow/Keras EfficientNet `preprocess_input`, matching the preprocessing used by `model/predict.py`.

Training can take a long time and use substantial memory. The batch size and epoch counts are set near the top of `model/train_fixed.py`. Lowering the batch size can reduce memory use, though it may affect training speed and results.

## 5. Review the training outputs

Training artifacts are written to `backend/model/saved_models/`:

- `best_model.keras` — model checkpoint with the best validation score.
- `class_names.json` — class labels in the model’s output order.
- `training_log.csv` — per-epoch training and validation metrics.

Keep `best_model.keras` and `class_names.json` from the same training run. The backend loads them from these paths. After replacing either file, restart the backend and check `GET /api/model/info`; `model_loaded` should be `true`.

## Preprocessing must match

The predictor and training scripts use TensorFlow/Keras EfficientNet `preprocess_input`. Keep this preprocessing consistent when training or changing the inference pipeline. Do not use `rescale=1./255` with the included scripts, because that would make training inputs inconsistent with prediction inputs.

## Troubleshooting

- **Dataset not found:** Run the commands from `backend/`. Check that the source class folders are in `backend/data/color/`, or that the generated `backend/data/train/` and `backend/data/val/` folders exist.
- **Different class folders between splits:** Check the source folders for empty, misspelled, or missing classes. Each split needs the same class names.
- **Training runs out of memory:** Reduce `BATCH_SIZE` in the selected training script. Training on a CPU is supported but can take considerably longer.
- **The model does not load:** Keep the `.keras` file paired with the `class_names.json` generated in the same run, and use a compatible TensorFlow/Keras environment.
