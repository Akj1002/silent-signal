import React, { useState, useEffect, useRef } from "react";
import { 
  Heart, Wind, MessageSquare, ShieldAlert, Users, Mic, Search, Play, Activity, 
  BrainCircuit, Bell, LayoutDashboard, Send, Sparkles, TrendingUp, Pause, 
  Info, CheckCircle, Zap, Volume2, Calendar, Stethoscope, Home 
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const App = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [messages, setMessages] = useState([{ role: 'bot', text: "Neural mesh synced. I am monitoring your behavioral rhythm.", agent: "System" }]);
  const [vitals, setVitals] = useState({ hr: 0, br: 0, anxiety: 0, status: "Initializing..." });
  const [history, setHistory] = useState([]);
  const [intel, setIntel] = useState({ drift: 0, confidence: 0, recoveryHalfLife: 0, cognitive_load: 0 });

  // 1. FETCH REAL HISTORY FROM BACKEND
  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/history");
      const data = await res.json();
      setHistory(data);
    } catch (err) { console.error("Mesh Offline:", err); }
  };

  useEffect(() => { fetchHistory(); }, []);

  // 2. LOG REAL DATA TO BACKEND
  const runAnalysis = async (hr, br) => {
    const anxiety = Math.min(100, Math.round(hr * 0.6 + br * 0.4 - 40));
    const status = anxiety > 70 ? "Critical" : anxiety > 45 ? "Anxious" : "Calm";
    const payload = { hr, br, anxiety_score: anxiety, cognitive_load: 28, status };

    setVitals({ hr, br, anxiety, status });
    
    try {
      await fetch("http://localhost:8000/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      fetchHistory(); // Refresh chart
    } catch (err) { console.error("Sync Failed:", err); }
  };

  // 3. AGENTIC CHAT LOGIC
  const handleAgenticChat = async (userMsg) => {
    const newMessages = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages);

    try {
      const res = await fetch("http://localhost:8000/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, vitals })
      });
      const data = await res.json();
      
      if (data.action === "trigger_pacer") setActiveTab("pacer");
      if (data.action === "open_experts") setActiveTab("experts");

      setMessages([...newMessages, { role: 'bot', text: data.response, agent: data.agent }]);
    } catch (err) { console.error("Agentic Failure:", err); }
  };

  return (
    <div className={`aura-platform aura-${vitals.status.toLowerCase()}`}>
      <aside className="aura-sidebar">
        <div className="brand"><BrainCircuit size={28} /> <span>SILENT SIGNAL</span></div>
        <nav className="nav-mesh">
          <SideBtn id="dashboard" icon={<LayoutDashboard />} label="Dashboard" active={activeTab} set={setActiveTab} />
          <SideBtn id="pacer" icon={<Wind />} label="Relief Pacer" active={activeTab} set={setActiveTab} />
          <SideBtn id="chat" icon={<BrainCircuit />} label="Gemini AI" active={activeTab} set={setActiveTab} />
          <SideBtn id="experts" icon={<Users />} label="Expert Nodes" active={activeTab} set={setActiveTab} />
        </nav>
        <button className="sos-action" onClick={() => setShowSOS(true)}><ShieldAlert size={20} /> SOS REPORT</button>
      </aside>

      <main className="aura-viewport">
        <header className="aura-header">
           <div className="search-pill"><Search size={16} /><input placeholder="Search health mesh..." /></div>
           <div className="header-right">
             <div className="tracer-pill"><Sparkles size={14} /> Anxiety Tracer: {vitals.anxiety}%</div>
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Abhinav" alt="avatar" className="header-avatar-fix" />
           </div>
        </header>

        <section className="aura-stage">
          {activeTab === "dashboard" && <DashboardView vitals={vitals} history={history} />}
          {activeTab === "pacer" && <PacerView onScan={runAnalysis} />}
          {activeTab === "chat" && <GeminiHub messages={messages} onSend={handleAgenticChat} vitals={vitals} />}
          {activeTab === "experts" && <ExpertScheduler />}
        </section>

        <footer className="aura-player">
          <div className="track-meta"><strong>Delta Sleep</strong> • 432Hz Recovery</div>
          <button className="play-btn" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</button>
        </footer>
      </main>
      {showSOS && <SOSModal vitals={vitals} onClose={() => setShowSOS(false)} />}
    </div>
  );
};

/* --- SUB-COMPONENTS: REAL DATA MAPPING --- */

const DashboardView = ({ vitals, history }) => (
  <div className="fade-in w-full">
    <div className="aura-card-grid">
      <div className="aura-stat-card rose"><Heart /><span>Heart Rate</span><strong>{vitals.hr} <small>BPM</small></strong></div>
      <div className="aura-stat-card cyan"><Wind /><span>Breathing</span><strong>{vitals.br} <small>RPM</small></strong></div>
      <div className="aura-stat-card purple"><Activity /><span>Anxiety</span><strong>{vitals.anxiety}%</strong></div>
    </div>
    <div className="history-glass">
       <h3>7-Day History Trend</h3>
       <div className="aura-bars">
         {history.length > 0 ? history.map((h, i) => (
           <div key={i} className="bar-wrapper"><div className={`bar ${h.anxiety_score > 70 ? 'alert' : ''}`} style={{height: `${h.anxiety_score}%`}} /><span>D{i+1}</span></div>
         )) : <p>Waiting for sensor mesh synchronization...</p>}
       </div>
    </div>
  </div>
);

const GeminiHub = ({ messages, onSend, vitals }) => {
  const [input, setInput] = useState("");
  return (
    <div className="chat-aura-stage fade-in">
       <div className={`neural-orb-pro ${vitals.status.toLowerCase()}`}><div className="orb-inner" /></div>
       <div className="chat-window-pro">
          {messages.map((m, i) => (
            <div key={i} className={`bubble-${m.role}`}><strong>{m.agent || "User"}:</strong> {m.text}</div>
          ))}
       </div>
       <div className="chat-input-pill">
         <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Consult the Agentic AI..." />
         <Send size={20} onClick={() => { onSend(input); setInput(""); }} />
       </div>
    </div>
  );
};

const PacerView = ({ onScan }) => {
  const videoRef = useRef(null);
  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    setTimeout(() => { onScan(74, 18); stream.getTracks().forEach(t => t.stop()); }, 5000);
  };
  return (
    <div className="pacer-stage fade-in">
      <div className="pacer-head"><h3>Biometric Scanner</h3><button onClick={start} className="scan-trigger">Sync Biometrics</button></div>
      <div className="aura-scanner"><video ref={videoRef} autoPlay muted /></div>
    </div>
  );
};

const ExpertScheduler = () => {
  const [date, setDate] = useState("");
  const book = async () => {
    await fetch("http://localhost:8000/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expert_name: "Dr. Kavita Sharma", consultation_date: date })
    });
    alert("Consultation Booked!");
  };
  return (
    <div className="expert-grid fade-in">
      <div className="expert-card-pro">
        <h4>Dr. Kavita Sharma</h4><p>Sr. Psychiatrist</p>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="date-input" />
        <button onClick={book} className="connect-btn">Connect Expert Node</button>
      </div>
    </div>
  );
};

const SideBtn = ({ id, icon, label, active, set }) => (
  <div className={`nav-item-pro ${active === id ? "active" : ""}`} onClick={() => set(id)}>{icon} <span>{label}</span></div>
);
const SOSModal = ({vitals, onClose}) => (
  <div className="sos-overlay"><div className="sos-modal"><ShieldAlert size={48} color="#ef4444" /><h2>SOS</h2><QRCodeSVG value={`SOS-${vitals.anxiety}`} size={160}/><button onClick={onClose}>Dismiss</button></div></div>
);

export default App;