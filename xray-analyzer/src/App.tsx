import React, { useState, useRef } from 'react';
import { UploadCloud, ShieldCheck, Activity, AlertCircle, FileText, CheckCircle, Clock, Sun, Contrast, Layers, Download, SquareDashed, Ruler } from 'lucide-react';
import './App.css';

interface DiagnosticReport {
  overall_status: 'Normal' | 'Abnormal' | 'Critical';
  findings: string[];
  description: string;
  confidence: number;
  bbox?: { top: number, left: number, width: number, height: number }[];
}

const mockChestDiagnoses: DiagnosticReport[] = [
  {
    overall_status: 'Abnormal',
    findings: ['Infiltration', 'Mild Pleural Effusion'],
    description: 'Bilateral lung fields show patchy opacities suggestive of infiltration. Blunting of the costophrenic angle indicates mild pleural effusion. Heart size remains within normal limits. Recommend clinical correlation for infectious etiology.',
    confidence: 89,
    bbox: [{ top: 55, left: 65, width: 15, height: 15 }]
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
    bbox: [{ top: 25, left: 30, width: 20, height: 20 }]
  }
];

const mockBoneDiagnoses: DiagnosticReport[] = [
  {
    overall_status: 'Abnormal',
    findings: ['Fracture', 'Displacement'],
    description: 'There is a transverse fracture through the midshaft of the radius. Mild dorsal displacement of the distal fracture fragment is observed. No intra-articular extension. Adjacent soft tissues demonstrate swelling.',
    confidence: 95,
    bbox: [{ top: 50, left: 45, width: 10, height: 10 }]
  },
  {
    overall_status: 'Normal',
    findings: ['Normal Joint', 'No Fracture'],
    description: 'Bones and joints are in normal anatomic alignment. No acute fracture, subluxation, or dislocation is identified. Joint spaces are preserved. The regional soft tissues are unremarkable.',
    confidence: 98,
  },
  {
    overall_status: 'Abnormal',
    findings: ['Osteoarthritis', 'Joint Space Narrowing'],
    description: 'Moderate narrowing of the medial compartment joint space is noted. There is marginal osteophyte formation and subchondral sclerosis. Findings are consistent with moderate osteoarthritis. No acute osseous injury.',
    confidence: 92,
    bbox: [{ top: 40, left: 50, width: 30, height: 15 }]
  }
];

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [scanType, setScanType] = useState<'chest' | 'bone'>('chest');
  
  // Advanced Radiology Tool States
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [invert, setInvert] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [showRuler, setShowRuler] = useState(false);

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
      resetTools();
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
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          const diagnosisList = scanType === 'chest' ? mockChestDiagnoses : mockBoneDiagnoses;
          const randomReport = diagnosisList[Math.floor(Math.random() * diagnosisList.length)];
          setReport(randomReport);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const resetTools = () => {
    setBrightness(100);
    setContrast(100);
    setInvert(false);
    setShowHeatmap(false);
    setShowBoundingBox(true);
    setShowRuler(false);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setReport(null);
    setIsScanning(false);
    setScanProgress(0);
    resetTools();
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <div className="app-container">
      <nav className="navbar hide-on-print">
        <div className="navbar-content">
          <div className="logo">
            <Activity className="logo-icon" />
            <h1>MedGemma <span>Omni-XRay AI</span></h1>
          </div>
          <div className="nav-badges">
            <span className="badge safe"><ShieldCheck size={16}/> HIPPA Compliant</span>
            <span className="badge research"><Clock size={16}/> MURA & NIH PEFT</span>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <header className="page-header hide-on-print">
          <h2>Radiological Diagnostic Center</h2>
          <p>Upload a Chest X-Ray or Musculoskeletal (Bone/Joint) radiograph. Select the routing model below.</p>
        </header>

        <div className="scan-type-selector hide-on-print">
          <button 
            className={`type-btn ${scanType === 'chest' ? 'active' : ''}`}
            onClick={() => { setScanType('chest'); reset(); }}
          >
            Chest & Pulmonary
          </button>
          <button 
            className={`type-btn ${scanType === 'bone' ? 'active' : ''}`}
            onClick={() => { setScanType('bone'); reset(); }}
          >
            Bones & Joints (MURA)
          </button>
        </div>

        <div className="workspace">
          {/* Upload Panel */}
          <div className={`upload-panel ${preview ? 'has-image' : ''} hide-on-print`}>
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
                <h3>Drop your {scanType === 'chest' ? 'Chest' : 'Bone'} X-Ray here</h3>
                <p>or click to browse from your computer</p>
                <span className="file-types">Supports JPG, PNG, DICOM (Converted)</span>
              </div>
            ) : (
              <div className="image-viewer">
                <div className="image-preview-container">
                  <img 
                    src={preview} 
                    alt="X-Ray Preview" 
                    className="preview-image" 
                    style={{
                      filter: `brightness(${brightness}%) contrast(${contrast}%) ${invert ? 'invert(100%)' : ''}`
                    }}
                  />
                  {report && showHeatmap && (
                    <div 
                      className="heatmap-overlay"
                      style={{
                        background: scanType === 'chest' 
                          ? 'radial-gradient(circle at 60% 40%, rgba(255, 0, 0, 0.5) 0%, transparent 50%)' 
                          : 'radial-gradient(circle at 50% 50%, rgba(255, 0, 0, 0.5) 0%, transparent 40%)',
                      }}
                    ></div>
                  )}

                  {report && showBoundingBox && report.bbox && report.bbox.map((box, idx) => (
                    <div 
                      key={idx}
                      className="bounding-box"
                      style={{
                        top: `${box.top}%`,
                        left: `${box.left}%`,
                        width: `${box.width}%`,
                        height: `${box.height}%`,
                      }}
                    >
                      <span className="bbox-label">Target Area {idx + 1}</span>
                    </div>
                  ))}

                  {report && showRuler && (
                    <div className="ruler-tool-overlay">
                      <div className="ruler-line">
                        <span className="ruler-label">4.2cm</span>
                      </div>
                    </div>
                  )}

                  {isScanning && (
                    <div className="scanning-overlay">
                      <div className="scan-line"></div>
                      <div className="scan-progress-box">
                        <p>Running {scanType === 'chest' ? 'Pulmonary' : 'Musculoskeletal'} Analysis...</p>
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
                      <button className="btn-primary" onClick={startDiagnosis}>Run {scanType === 'chest' ? 'Chest' : 'Bone'} Diagnosis</button>
                    </div>
                  )}
                </div>
                
                {/* Advanced Toolbox */}
                {!isScanning && report && (
                  <div className="image-tools">
                    <div className="tool-group">
                      <Sun size={14} />
                      <input type="range" min="30" max="200" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} />
                    </div>
                    <div className="tool-group">
                      <Contrast size={14} />
                      <input type="range" min="30" max="250" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} />
                    </div>
                    <div className="tool-buttons">
                      <button className={`micro-btn ${showBoundingBox ? 'active' : ''}`} onClick={() => setShowBoundingBox(!showBoundingBox)}>
                        <SquareDashed size={14}/> BBox
                      </button>
                      <button className={`micro-btn ${showRuler ? 'active' : ''}`} onClick={() => setShowRuler(!showRuler)}>
                        <Ruler size={14}/> Measure
                      </button>
                      <button className={`micro-btn ${invert ? 'active' : ''}`} onClick={() => setInvert(!invert)}>
                        Invert
                      </button>
                      <button className={`micro-btn ${showHeatmap ? 'active' : ''}`} onClick={() => setShowHeatmap(!showHeatmap)}>
                        <Layers size={14}/> Grad-CAM
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Report Panel */}
          {report && (
            <div className="report-panel slide-in printable">
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
                  <span className="meta-label">Study Type</span>
                  <span className="meta-value" style={{textTransform: 'capitalize'}}>{scanType} X-Ray</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Model Engine</span>
                  <span className="meta-value">{scanType === 'chest' ? 'MedGemma-NIH-LoRA' : 'MedGemma-MURA'}</span>
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
                <AlertCircle size={14} className="hide-on-print" />
                <p>This report was generated autonomously by a fine-tuned Artificial Intelligence agent. It is intended for research and educational purposes only and DOES NOT constitute professional medical advice.</p>
              </div>

              <div className="report-actions hide-on-print">
                <button className="btn-secondary" onClick={exportPDF}>
                  <Download size={16} /> Export PDF
                </button>
                <button className="btn-primary" onClick={reset}>Scan Another</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
