import React, { useState, useRef } from 'react';
import { UploadCloud, ShieldCheck, Activity, AlertCircle, FileText, CheckCircle, Clock } from 'lucide-react';
import './App.css';

interface DiagnosticReport {
  overall_status: 'Normal' | 'Abnormal' | 'Critical';
  findings: string[];
  description: string;
  confidence: number;
}

const mockDiagnoses: DiagnosticReport[] = [
  {
    overall_status: 'Abnormal',
    findings: ['Infiltration', 'Mild Pleural Effusion'],
    description: 'Bilateral lung fields show patchy opacities suggestive of infiltration. Blunting of the costophrenic angle indicates mild pleural effusion. Heart size remains within normal limits. Recommend clinical correlation for infectious etiology.',
    confidence: 89,
  },
  {
    overall_status: 'Normal',
    findings: ['No Finding'],
    description: 'The cardiomediastinal silhouette is normal in size and contour. Lungs are clear without focal consolidation, pneumothorax, or pleural effusion. Bony thorax is intact. No acute cardiopulmonary abnormalities detected.',
    confidence: 96,
  },
  {
    overall_status: 'Critical',
    findings: ['Mass', 'Atelectasis'],
    description: 'A well-defined opacity is observed in the upper right lobe, measuring approximately 3cm, highly concerning for a mass. Accompanying focal atelectasis in adjacent regions. Urgent follow-up via CT thorax is recommended.',
    confidence: 94,
  }
];

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (selectedFile: File) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
      setReport(null);
      setScanProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const startDiagnosis = () => {
    if (!file) return;
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate AI scanning progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          // Pick a random mock report
          const randomReport = mockDiagnoses[Math.floor(Math.random() * mockDiagnoses.length)];
          setReport(randomReport);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setReport(null);
    setIsScanning(false);
    setScanProgress(0);
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo">
            <Activity className="logo-icon" />
            <h1>MedGemma <span>X-Ray AI</span></h1>
          </div>
          <div className="nav-badges">
            <span className="badge safe"><ShieldCheck size={16}/> HIPPA Compliant</span>
            <span className="badge research"><Clock size={16}/> 1.5-4B Param PEFT</span>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <header className="page-header">
          <h2>Chest X-Ray Diagnostic Center</h2>
          <p>Upload a PA/AP chest radiograph to receive an instant preliminary MedGemma AI diagnostic report.</p>
        </header>

        <div className="workspace">
          {/* Upload Panel */}
          <div className={`upload-panel ${preview ? 'has-image' : ''}`}>
            {!preview ? (
              <div 
                className={`dropzone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  hidden 
                />
                <UploadCloud className="upload-icon" size={64} />
                <h3>Drop your X-Ray image here</h3>
                <p>or click to browse from your computer</p>
                <span className="file-types">Supports JPG, PNG, DICOM (Converted)</span>
              </div>
            ) : (
              <div className="image-preview-container">
                <img src={preview} alt="X-Ray Preview" className="preview-image" />
                {isScanning && (
                  <div className="scanning-overlay">
                    <div className="scan-line"></div>
                    <div className="scan-progress-box">
                      <p>Analyzing Image Factors...</p>
                      <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${scanProgress}%` }}></div>
                      </div>
                      <span>{scanProgress}%</span>
                    </div>
                  </div>
                )}
                {!isScanning && !report && (
                  <div className="preview-actions">
                    <button className="btn-secondary" onClick={reset}>Cancel</button>
                    <button className="btn-primary" onClick={startDiagnosis}>Run AI Diagnosis</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Report Panel */}
          {report && (
            <div className="report-panel slide-in">
              <div className="report-header">
                <FileText className="report-icon" />
                <h3>Automated Radiological Report</h3>
              </div>
              
              <div className="report-meta">
                <div className="meta-item">
                  <span className="meta-label">Patient ID</span>
                  <span className="meta-value">ANON-{Math.floor(Math.random()*10000)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Date</span>
                  <span className="meta-value">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Model</span>
                  <span className="meta-value">MedGemma-1.5-4b-it-LoRA</span>
                </div>
              </div>

              <div className={`status-banner status-${report.overall_status.toLowerCase()}`}>
                {report.overall_status === 'Normal' && <CheckCircle className="status-icon" />}
                {report.overall_status === 'Abnormal' && <AlertCircle className="status-icon" />}
                {report.overall_status === 'Critical' && <Activity className="status-icon" />}
                
                <div className="status-text">
                  <h4>{report.overall_status} Evaluation</h4>
                  <p>AI Confidence: {report.confidence}%</p>
                </div>
              </div>

              <div className="report-section">
                <h4>Detected Findings</h4>
                <div className="tags">
                  {report.findings.map((finding, idx) => (
                    <span key={idx} className="tag">{finding}</span>
                  ))}
                </div>
              </div>

              <div className="report-section">
                <h4>Impression / Narrative</h4>
                <p className="narrative-text">{report.description}</p>
              </div>

              <div className="disclaimer">
                <AlertCircle size={14} />
                <p>This report was generated autonomously by a fine-tuned Artificial Intelligence agent. It is intended for research and educational purposes only and DOES NOT constitute professional medical advice.</p>
              </div>

              <div className="report-actions">
                <button className="btn-primary" onClick={reset}>Scan Another Image</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
