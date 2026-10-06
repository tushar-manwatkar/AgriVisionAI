import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, Shield, Stethoscope } from 'lucide-react';
import { Prediction, TreatmentInfo, formatDiseaseName, getConfidenceColor } from '../api/api';

interface PredictionResultsProps {
  primaryPrediction: Prediction;
  treatment: TreatmentInfo;
}

type CareTab = 'overview' | 'treatment' | 'prevention';

const PredictionResults = ({ primaryPrediction, treatment }: PredictionResultsProps) => {
  const [activeTab, setActiveTab] = useState<CareTab>('overview');
  const isHealthy = primaryPrediction.disease.toLowerCase().includes('healthy');
  const confidencePercent = Math.round(primaryPrediction.confidence * 100);
  const isUncertain = primaryPrediction.confidence < 0.6;
  const tabs: { id: CareTab; label: string; icon: typeof Info }[] = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'treatment', label: 'Care steps', icon: Stethoscope },
    { id: 'prevention', label: 'Prevention', icon: Shield },
  ];

  return (
    <section className="diagnosis-panel">
      <div className={`diagnosis-banner ${isUncertain ? 'is-uncertain' : isHealthy ? 'is-healthy' : 'is-disease'}`}>
        <div className="diagnosis-icon">{isHealthy && !isUncertain ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}</div>
        <div className="diagnosis-copy">
          <span className="diagnosis-kicker">{isUncertain ? 'POSSIBLE MATCH' : isHealthy ? 'LEAF HEALTH CHECK' : 'PREDICTED CONDITION'}</span>
          <h2>{formatDiseaseName(primaryPrediction.disease)}</h2>
          <p>{isUncertain ? 'The image match is uncertain. Use the suggestions below and consider taking another photo.' : isHealthy ? 'No disease pattern was identified in this image.' : 'Review the signs and care guidance below.'}</p>
        </div>
        <div className="diagnosis-score">
          <strong>{confidencePercent}%</strong><span>confidence</span>
        </div>
        <div className="diagnosis-meter"><span className={getConfidenceColor(primaryPrediction.confidence)} style={{ width: `${confidencePercent}%` }} /></div>
      </div>

      {isUncertain ? (
        <div className="uncertain-note"><AlertTriangle size={18} /><div><strong>Low confidence — treat this as a suggestion.</strong><span>Try a close-up photo of one leaf in natural light. Disease-specific guidance is withheld for uncertain matches.</span></div></div>
      ) : (
        <div className="care-panel">
          <div className="care-tabs" role="tablist" aria-label="Plant care guidance">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" role="tab" aria-selected={activeTab === id} className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}>
                <Icon size={16} />{label}
              </button>
            ))}
          </div>
          <div className="care-content" role="tabpanel">
            {activeTab === 'overview' && <div className="care-overview"><span className="care-label">WHAT TO LOOK FOR</span><p>{treatment.description || 'No additional condition details are available for this result.'}</p><div className="care-disclaimer"><Info size={15} /> A visual prediction is a starting point. Confirm serious concerns with a local agricultural expert.</div></div>}
            {activeTab === 'treatment' && <CareList items={isHealthy ? ['Continue regular monitoring for changes in leaf colour or texture.', 'Maintain balanced watering and nutrition for the crop.'] : treatment.treatment} emptyText="No specific care steps are available for this result." />}
            {activeTab === 'prevention' && <CareList items={treatment.prevention} emptyText="No prevention notes are available for this result." />}
          </div>
        </div>
      )}
    </section>
  );
};

const CareList = ({ items, emptyText }: { items: string[]; emptyText: string }) => (
  <div className="care-list-wrap">
    <span className="care-label">PRACTICAL NEXT STEPS</span>
    {items.length ? <ol className="care-list">{items.map((item, index) => <li key={`${index}-${item}`}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p></li>)}</ol> : <p className="care-empty">{emptyText}</p>}
  </div>
);

export default PredictionResults;

export const PredictionSuggestions = ({ predictions }: { predictions: Prediction[] }) => (
  <section className="card p-5 prediction-suggestions" aria-label="Top three suggestions">
    <div className="suggestions-heading"><div><span className="eyebrow">MODEL ALTERNATIVES</span><h3>Other possible matches</h3></div><span className="suggestions-count">Top {Math.min(predictions.length, 3)}</span></div>
    <div className="suggestions-list">
      {predictions.slice(0, 3).map((prediction, index) => {
        const percent = Math.round(prediction.confidence * 100);
        return <div className={`suggestion-row ${index === 0 ? 'is-leading' : ''}`} key={prediction.disease}>
          <span className="suggestion-rank">0{index + 1}</span><span className="suggestion-name">{formatDiseaseName(prediction.disease)}</span>
          <span className="suggestion-track" aria-hidden="true"><span className={`suggestion-fill ${getConfidenceColor(prediction.confidence)}`} style={{ width: `${percent}%` }} /></span><span className="suggestion-percent">{percent}%</span>
        </div>;
      })}
    </div>
  </section>
);
