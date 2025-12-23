import React, { useState, useRef } from "react";
import {
  Heart, Wind, Moon, MessageSquare, ShieldAlert, Users,
  Mic, Search, Play, Activity, BrainCircuit, Bell,
  LayoutDashboard, Send, Sparkles, Phone, TrendingUp,
  Pause, Info, CheckCircle, Zap, Download, Volume2, Calendar, Stethoscope
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const App = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [vitals, setVitals] = useState({ hr: 74, br: 18, anxiety: 22, status: "Calm" });
  const [intel] = useState({ drift: 0.12, confidence: 94, recoveryHalfLife: 42, cognitive_load: 28 });
  const [history] = useState([42, 58, 32, 88, 62, 48, 22]);

  const runAnalysis = (hr, br) => {
    const anxiety = Math.min(100, Math.round(hr * 0.6 + br * 0.4 - 40));
    setVitals({ hr, br, anxiety, status: anxiety > 70 ? "Critical" : anxiety > 45 ? "Anxious" : "Calm" });
  };

  return (
    <div className={`aura-platform aura-${vitals.status.toLowerCase()}`}>
      <aside className="aura-sidebar">
        <div className="brand"><BrainCircuit size={28} color="#6366f1" /> <span>SILENT SIGNAL</span></div>
        <nav className="nav-mesh">
          <SideBtn id="dashboard" icon={<LayoutDashboard />} label="Dashboard" active={activeTab} set={setActiveTab} />
          <SideBtn id="pacer" icon={<Wind />} label="Relief Pacer" active={activeTab} set={setActiveTab} />
          <SideBtn id="chat" icon={<BrainCircuit />} label="Gemini AI (Mesh)" active={activeTab} set={setActiveTab} />
          <SideBtn id="health-bot" icon={<MessageSquare />} label="Health Assistant" active={activeTab} set={setActiveTab} />
          <SideBtn id="experts" icon={<Users />} label="Expert Nodes" active={activeTab} set={setActiveTab} />
        </nav>
        <button className="sos-action" onClick={() => setShowSOS(true)}><ShieldAlert size={20} /> SOS REPORT</button>
      </aside>

      <main className="aura-viewport">
        <header className="aura-header">
           <div className="search-pill"><Search size={16} /><input placeholder="Search health mesh..." /></div>
           <div className="header-right">
             <div className="tracer-pill"><Sparkles size={14} /> Anxiety Tracer: {vitals.anxiety}%</div>
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Abhinav" alt="avatar" className="avatar-pro" />
           </div>
        </header>

        <section className="aura-stage">
          {activeTab === "dashboard" && <DashboardView vitals={vitals} intel={intel} history={history} />}
          {activeTab === "pacer" && <PacerView onScan={runAnalysis} intel={intel} />}
          {activeTab === "chat" && <GeminiAura vitals={vitals} intel={intel} />}
          {activeTab === "health-bot" && <HealthChatbot vitals={vitals} />}
          {activeTab === "experts" && <ExpertNodes />}
        </section>

        <footer className="aura-player">
          <div className="track-meta"><strong>Delta Sleep</strong> • deep recovery</div>
          <div className="controls"><button className="play-btn" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</button></div>
        </footer>
      </main>
      {showSOS && <SOSModal vitals={vitals} onClose={() => setShowSOS(false)} />}
    </div>
  );
};

/* --- NEW FEATURE: HEALTH & MENTAL HEALTH BOT --- */
const HealthChatbot = ({ vitals }) => (
  <div className="fade-in health-bot-stage">
    <div className="bot-header">
      <div className="bot-icon-pro"><Stethoscope size={24} color="white" /></div>
      <div className="bot-meta"><h3>Health Specialist AI</h3><p>Medical & Mental Wellness Support</p></div>
    </div>
    <div className="chat-window-pro">
      <div className="bubble-bot">Hello Abhinav. I'm your health-specific assistant. Based on your current {vitals.status} status, how can I help you today?</div>
    </div>
    <div className="chat-input-pill">
      <input placeholder="Ask about symptoms, diet, or mental health..." /><Send size={20} />
    </div>
  </div>
);

/* --- NEW FEATURE: EXPERT NODES WITH SCHEDULING --- */
const ExpertNodes = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const experts = [
    { name: "Dr. Kavita Sharma", role: "Sr. Psychiatrist", match: "98%" },
    { name: "Dr. R. Mehta", role: "Mental Health Lead", match: "92%" }
  ];

  return (
    <div className="fade-in expert-stage">
      <div className="expert-grid">
        {experts.map((exp, i) => (
          <div key={i} className="expert-card-pro">
            <div className="e-head"><h4>{exp.name}</h4><span className="match-tag">{exp.match} Match</span></div>
            <p className="e-role">{exp.role}</p>
            <div className="appointment-box">
              <label><Calendar size={14}/> Select Consultation Date</label>
              <input type="date" className="date-input" onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <button className="connect-btn" disabled={!selectedDate}>
              {selectedDate ? `Book for ${selectedDate}` : "Select Date to Connect"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* --- EXISTING COMPONENTS (REFINED) --- */
const DashboardView = ({ vitals, intel, history }) => (
  <div className="fade-in">
    <div className="aura-card-grid">
      <div className="aura-stat-card rose"><Heart /><span>Heart Rate</span><strong>{vitals.hr} <small>BPM</small></strong></div>
      <div className="aura-stat-card cyan"><Wind /><span>Breathing</span><strong>{vitals.br} <small>RPM</small></strong></div>
      <div className="aura-stat-card purple"><Activity /><span>Cognitive Load</span><strong>{intel.cognitive_load}% <small>EST</small></strong></div>
    </div>
    <div className="history-glass">
       <h3>7-Day Trend (Event Correlation Active)</h3>
       <div className="aura-bars">
         {history.map((h, i) => (
           <div key={i} className="bar-wrapper"><div className={`bar ${h > 70 ? 'alert' : ''}`} style={{height: `${h}%`}} /><span>D{i+1}</span></div>
         ))}
       </div>
    </div>
  </div>
);

const GeminiAura = ({ vitals, intel }) => (
  <div className="chat-aura-stage fade-in">
     <div className={`neural-orb-pro ${vitals.status.toLowerCase()}`}><div className="orb-inner" /></div>
     <div className="chat-window-pro"><div className="bubble-bot">Neural mesh synced. monitoring your behavioral rhythm.</div></div>
     <div className="chat-input-pill"><Mic size={20} /><input placeholder="Analyze mesh signals..." /><Send size={20} /></div>
  </div>
);

const PacerView = ({ onScan, intel }) => {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const start = async () => {
    setScanning(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    setTimeout(() => { onScan(106, 24); stream.getTracks().forEach(t => t.stop()); setScanning(false); }, 5000);
  };
  return (
    <div className="pacer-stage fade-in">
      <div className="pacer-head"><h3>Biometric Scanner</h3><button onClick={start} className="scan-trigger">Start Scan</button></div>
      <div className="aura-scanner"><video ref={videoRef} autoPlay muted />{scanning && <div className="medical-line" />}</div>
    </div>
  );
};

const SideBtn = ({ id, icon, label, active, set }) => (
  <div className={`nav-item-pro ${active === id ? "active" : ""}`} onClick={() => set(id)}>{icon} <span>{label}</span></div>
);
const SOSModal = ({vitals, onClose}) => (
  <div className="sos-overlay"><div className="sos-modal"><ShieldAlert size={48} color="#ef4444" /><h2>SOS Active</h2><QRCodeSVG value={`SOS-${vitals.anxiety}`} size={160}/><button onClick={onClose}>Dismiss</button></div></div>
);

export default App;
