# AgriVisionAI Project Status

## Implemented

- Flask API for health checks, disease classes, disease information, image predictions, and model details.
- React and TypeScript web app with image upload, camera capture, light and dark themes, and prediction results.
- Care and prevention guidance for supported conditions.
- Recent prediction history stored in the browser.
- EfficientNetB0 inference and matching preprocessing in the included training scripts.
- Local development configuration for Flask and Vite, plus Render and Vercel deployment configuration.

## Maintenance notes

- Keep `best_model.keras` paired with the `class_names.json` created in the same training run.
- Uploaded images are saved under `backend/uploads/`; the API does not currently delete them automatically.
- If the model cannot be loaded, the backend returns placeholder predictions. Confirm `model_loaded` is `true` at `GET /api/model/info` before using predictions.
- Keep the backend’s allowed browser origins current when changing the frontend deployment URL.

## Possible future improvements

- Add a retention policy for uploaded images.
- Improve confidence calibration and handling of uncertain predictions.
- Add automated checks for API behavior and frontend builds.
- Evaluate performance on field photos and crops beyond the training dataset.
