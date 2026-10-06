import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Leaf, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import Navbar from './components/Navbar';
import ImageUpload from './components/ImageUpload';
import PredictionResults, { PredictionSuggestions } from './components/PredictionResults';
import PredictionHistory from './components/PredictionHistory';
import { predictFromImage, fileToBase64, PredictionResponse, checkHealth } from './api/api';
import type { HistoryItem } from './types';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('darkMode');
    return saved === null ? false : JSON.parse(saved);
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('predictionHistory');
      return saved ? JSON.parse(saved).map((item: HistoryItem) => ({ ...item, timestamp: new Date(item.timestamp) })) : [];
    } catch { return []; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);
  useEffect(() => localStorage.setItem('predictionHistory', JSON.stringify(history.slice(0, 20))), [history]);
  useEffect(() => {
    checkHealth().then(() => setApiStatus('online')).catch(() => setApiStatus('offline'));
  }, []);

  const handleImageSelect = useCallback(async (file: File) => {
    setError(null);
    setPredictionResult(null);
    setSelectedFile(file);
    try { setSelectedImage(await fileToBase64(file)); }
    catch { setError('We could not read that image. Please try another file.'); }
  }, []);

  const handleClear = useCallback(() => {
    setSelectedImage(null);
    setSelectedFile(null);
    setPredictionResult(null);
    setError(null);
  }, []);

  const handlePredict = useCallback(async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await predictFromImage(selectedFile);
      setPredictionResult(result);
      if (selectedImage) {
        const item: HistoryItem = { id: Date.now().toString(), timestamp: new Date(), imageName: selectedFile.name, prediction: result.primary_prediction, imageData: selectedImage };
        setHistory((previous) => [item, ...previous.slice(0, 19)]);
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Prediction failed. Please try again.'); }
    finally { setIsProcessing(false); }
  }, [selectedFile, selectedImage]);

  const handleHistorySelect = useCallback((item: HistoryItem) => {
    setSelectedImage(item.imageData);
    setPredictionResult({ success: true, primary_prediction: item.prediction, all_predictions: [item.prediction], treatment: { description: 'Analyze this image again to see the complete condition details.', treatment: [], prevention: [] } });
    setSelectedFile(null);
  }, []);

  return (
    <div className="app-shell min-h-screen flex flex-col">
      <Navbar darkMode={darkMode} toggleDarkMode={() => setDarkMode((value: boolean) => !value)} />
      <main className="app-main flex-1 w-full">
        <header className="field-intro">
          <div className="hero-copy">
            <span className="intro-kicker"><i><Leaf size={15} /></i> PLANT HEALTH, MADE CLEARER</span>
            <h1>Give every leaf<br /><em>a closer look.</em></h1>
            <p>Upload a plant photo and get an AI-powered disease prediction, confidence score, and practical next steps.</p>
            <a href="#analyzer" className="hero-cta">Start with a leaf photo <span>↓</span></a>
          </div>
          <aside className="hero-note">
            <span className="hero-note-index">01 — 02</span>
            <i className="hero-note-rule" />
            <h2>A thoughtful first check.</h2>
            <p>Start with a clear leaf photo. Review the visual match and care notes before deciding what to do next.</p>
            <small><b /> Built for a closer look</small>
          </aside>
        </header>

        <section className="intro-stats" aria-label="Model details">
          <div className="intro-stat"><span className="stat-icon"><Leaf size={20} /></span><strong>38</strong><small>known conditions</small></div>
          <div className="intro-stat"><span className="stat-icon"><Sparkles size={20} /></span><strong>14</strong><small>plant categories</small></div>
          <div className="intro-stat"><span className="stat-icon"><ShieldCheck size={20} /></span><strong>224 × 224</strong><small>Image size used by the model</small></div>
          <div className="intro-status"><i />{apiStatus === 'checking' ? 'Connecting' : apiStatus === 'online' ? 'Analyzer ready' : 'Analyzer offline'}</div>
        </section>

        {apiStatus === 'offline' && <div className="api-banner"><AlertCircle size={18} /><span>The analyzer is offline. Start the backend, then refresh this page.</span></div>}

        <section id="analyzer" className="field-check">
          <div className="field-check-heading"><div><span className="section-kicker">{predictionResult ? 'YOUR RESULT' : 'PLANT CHECK'}</span><h2>{predictionResult ? 'Your leaf report' : 'Add a leaf photo'}</h2></div><p>{predictionResult ? 'Review the visual match and care notes.' : 'Choose a photo or take one with your camera.'}</p></div>

          <div className="capture-board">
            <ImageUpload onImageSelect={handleImageSelect} onClear={handleClear} selectedImage={selectedImage} isProcessing={isProcessing} />
            {selectedImage && !predictionResult && <div className="capture-board-bottom">
              <button onClick={handlePredict} disabled={isProcessing || apiStatus !== 'online'} className="analyze-button">
                {isProcessing ? <><RefreshCw size={17} className="animate-spin" /> Analyzing…</> : <><Sparkles size={16} /> Check this leaf</>}
              </button>
            </div>}
            {predictionResult && <div className="capture-board-bottom"><button onClick={handleClear} className="analyze-button secondary-button"><RefreshCw size={16} /> New check</button></div>}
          </div>

          {predictionResult && <div className="report-section"><PredictionResults primaryPrediction={predictionResult.primary_prediction} treatment={predictionResult.treatment} /><PredictionSuggestions predictions={predictionResult.all_predictions} /></div>}
          {!predictionResult && history.length > 0 && <div className="history-wrap"><PredictionHistory history={history} onClear={() => setHistory([])} onSelect={handleHistorySelect} /></div>}
        </section>
      </main>
      <div className="app-signoff"><span><Leaf size={15} /> AgriVisionAI</span><p>Visual guidance is a starting point; confirm serious concerns with a local agricultural expert.</p></div>
      {error && <div className="error-toast"><AlertCircle size={19} /><p>{error}</p><button onClick={() => setError(null)} aria-label="Dismiss error">×</button></div>}
    </div>
  );
}

export default App;
