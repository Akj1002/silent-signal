import React, { useState, useEffect, useRef } from "react";
import {
  Heart, Wind, Mic, Search, Activity, BrainCircuit, 
  LayoutDashboard, Send, Zap, ShieldAlert, Users,
  Camera, Home, ArrowRight, CheckCircle, Sparkles,
  Utensils, ShoppingBag, Plus, Video, Music, CreditCard, Smartphone, Banknote,
  Volume2, History, X, ChevronLeft, Star, Settings, Paperclip, Lock, Mail, User, ClipboardList,
  Download, Cloud, MessageCircle, FileText, Share2, LogOut, Calendar, Clock, Instagram, Linkedin, MicOff,
  ArrowUpRight, ShieldCheck, Stethoscope
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import axios from 'axios';
import { jsPDF } from "jspdf"; 
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'; 
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false); // Toggles between Landing Page and Auth Page
  const [user, setUser] = useState({ name: "", email: "" }); 
  const [activeTab, setActiveTab] = useState("home");
  const [showSOS, setShowSOS] = useState(false);
  const [vitals, setVitals] = useState({ hr: "--", br: "--", anxiety: 0, status: "Pending" });
  const [cart, setCart] = useState([]); 
  const [history, setHistory] = useState([
    { day: "Mon", val: 20 }, { day: "Tue", val: 45 }, { day: "Wed", val: 30 }
  ]);

  const handleScanComplete = (hr, anxiety) => {
    setVitals({ hr, br: Math.round(hr/4), anxiety, status: anxiety > 50 ? "High" : "Optimal" });
    setHistory(prev => [...prev.slice(1), { day: "Today", val: hr }]); 
    setActiveTab("mesh"); 
  };

  if (!isAuthenticated) {
    if (!showAuth) {
      return <LandingPage onGetStarted={() => setShowAuth(true)} />;
    }
    return (
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <AuthPage 
          onLogin={(userData) => { setUser(userData); setIsAuthenticated(true); }} 
          onBack={() => setShowAuth(false)}
        />
      </GoogleOAuthProvider>
    );
  }

  return (
    <div className="pastel-container">
      <Sidebar active={activeTab} set={setActiveTab} setShowSOS={setShowSOS} cartCount={cart.length} />
      
      <main className="pastel-viewport">
        <Header user={user.name} onLogout={() => { setIsAuthenticated(false); setShowAuth(false); setActiveTab("home"); }} />
        <div className="content-area">
          {activeTab === "home" && <HomePage setTab={setActiveTab} vitals={vitals} user={user.name} />}
          {activeTab === "pacer" && <ReliefPacer onScan={handleScanComplete} />}
          {activeTab === "mesh" && <NeuralMesh vitals={vitals} setTab={setActiveTab} />}
          {activeTab === "dashboard" && <Dashboard vitals={vitals} history={history} />}
          {activeTab === "chat" && <AdvancedDrAI vitals={vitals} user={user.name} />}
          {activeTab === "experts" && <ExpertNodes setTab={setActiveTab} user={user.name} />}
          {activeTab === "consultation" && <ConsultationRoom setTab={setActiveTab} setCart={setCart} cart={cart} vitals={vitals} user={user.name} />}
          {activeTab === "diet" && <DietNode vitals={vitals} />}
          {activeTab === "pharmacy" && <PharmacyCounter cart={cart} setCart={setCart} user={user.name} />}
          {activeTab === "relief" && <ReliefSection />}
        </div>
      </main>
      {showSOS && <SOSOverlay vitals={vitals} close={()=>setShowSOS(false)} />}
    </div>
  );
};

/* --- 0. BEAUTIFUL LANDING PAGE --- */
const LandingPage = ({ onGetStarted }) => {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff0f3 0%, #f0f4ff 50%, #f4fbf0 100%)', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.5)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
          <BrainCircuit color="#FF8FA3" size={32}/> SilentSignal
        </div>
        <div>
          <button onClick={onGetStarted} style={{ background: '#FF8FA3', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255, 143, 163, 0.4)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
            Login Securely
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 20px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(255, 143, 163, 0.15)', color: '#FF8FA3', padding: '8px 20px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16}/> The Future of Mental Healthcare
        </div>
        <h1 style={{ fontSize: '4rem', color: '#1a1a1a', lineHeight: '1.1', marginBottom: '25px', fontWeight: '800' }}>
          The Agentic <span style={{ color: '#FF8FA3' }}>Neural Mesh</span> for Mental Health.
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '40px', maxWidth: '700px', lineHeight: '1.6' }}>
          Non-invasive, zero-touch biometric monitoring using advanced computer vision. Autonomously detecting acute stress and bridging the gap between panic and clinical relief.
        </p>
        <button onClick={onGetStarted} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#333', color: 'white', border: 'none', padding: '16px 40px', borderRadius: '40px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)', transition: 'all 0.3s' }} onMouseOver={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.transform = 'translateY(-3px)'; }} onMouseOut={e => { e.currentTarget.style.background = '#333'; e.currentTarget.style.transform = 'translateY(0)'; }}>
          Enter the Sanctuary <ArrowUpRight size={20}/>
        </button>
      </div>

      {/* Features Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 100px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
        
        {/* Feature 1 */}
        <div style={{ background: 'white', padding: '40px 30px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid rgba(255, 143, 163, 0.2)', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#fff0f3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Activity size={30} color="#FF8FA3" />
          </div>
          <h3 style={{ fontSize: '1.4rem', color: '#333', marginBottom: '12px' }}>Zero-Touch Scanning</h3>
          <p style={{ color: '#666', lineHeight: '1.6' }}>Utilizing YOLOv8 and rPPG to extract live heart rate and stress indices straight from facial micro-movements, no wearables required.</p>
        </div>

        {/* Feature 2 */}
        <div style={{ background: 'white', padding: '40px 30px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid rgba(195, 216, 235, 0.5)', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#eef4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Sparkles size={30} color="#5c95ff" />
          </div>
          <h3 style={{ fontSize: '1.4rem', color: '#333', marginBottom: '12px' }}>Voice-Enabled Dr. AI</h3>
          <p style={{ color: '#666', lineHeight: '1.6' }}>An empathetic, context-aware AI agent that actively monitors your vitals. Use hands-free voice dictation during high-anxiety events.</p>
        </div>

        {/* Feature 3 */}
        <div style={{ background: 'white', padding: '40px 30px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid rgba(198, 224, 180, 0.5)', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#f2fceb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Stethoscope size={30} color="#6db841" />
          </div>
          <h3 style={{ fontSize: '1.4rem', color: '#333', marginBottom: '12px' }}>Clinical Integration</h3>
          <p style={{ color: '#666', lineHeight: '1.6' }}>Instantly export beautifully formatted PDF medical invoices, access neuro-nutrition supplements, and book real-world psychiatric experts.</p>
        </div>

      </div>
    </div>
  );
};

/* --- 1. DYNAMIC AUTHENTICATION PAGE (With Google OAuth & Back Button) --- */
const AuthPage = ({ onLogin, onBack }) => {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleLocalSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const displayName = mode === 'signup' ? formData.name : (formData.name || formData.email.split('@')[0]);
      onLogin({ name: displayName || "User", email: formData.email });
      setLoading(false);
    }, 1000);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      // IDEAL SCENARIO: Send token to your backend to trigger Nodemailer
      // const res = await axios.post('http://localhost:5000/api/auth/google', { token: credentialResponse.credential });
      // onLogin({ name: res.data.user.name, email: res.data.user.email });

      // Fallback for frontend demo purposes
      console.log("Google Token Received: ", credentialResponse.credential);
      onLogin({ name: "Google User", email: "verified@google.com" });
    } catch (error) {
      console.error("Google Login Failed", error);
      alert("Google Authentication Failed.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box fade-in" style={{ position: 'relative' }}>
        
        {/* Back to Landing Page Button */}
        <button onClick={onBack} style={{ position: 'absolute', top: '15px', left: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
          <ChevronLeft size={16}/> Back
        </button>

        <div className="auth-header" style={{ marginTop: '20px' }}>
          <BrainCircuit size={40} color="#FF8FA3" />
          <h2>SilentSignal</h2>
          <p>Secure Neural Mesh Access</p>
        </div>

        {mode !== 'forgot' && (
          <div className="auth-tabs">
            <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
            <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Sign Up</button>
          </div>
        )}

        <form className="auth-form" onSubmit={handleLocalSubmit}>
          {mode === 'signup' && (
            <div className="input-group">
              <User size={18} />
              <input name="name" type="text" placeholder="Full Name" required onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
          )}
          <div className="input-group">
            <Mail size={18} />
            <input name="email" type="email" placeholder="Email Address" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          {mode !== 'forgot' && (
            <div className="input-group">
              <Lock size={18} />
              <input name="password" type="password" placeholder="Password" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
          )}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Authenticating..." : mode === 'login' ? 'Login Securely' : 'Create Account'}
          </button>
        </form>

        <div className="social-login-sect">
          <div className="divider"><span>OR CONTINUE WITH</span></div>
          
          {/* Official Google OAuth Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
            <GoogleLogin 
              onSuccess={handleGoogleSuccess}
              onError={() => alert('Login Failed')}
              shape="pill"
              theme="outline"
            />
          </div>

        </div>

        <div className="auth-links">
          {mode === 'login' && <span className="text-link" onClick={() => setMode('forgot')}>Forgot your password?</span>}
          {mode === 'forgot' && <span className="text-link" onClick={() => setMode('login')}>← Back to Login</span>}
        </div>
      </div>
    </div>
  );
};

/* --- 2. HEADER --- */
const Header = ({ user, onLogout }) => ( 
  <header className="pastel-header">
    <div className="search"><Search size={16}/><input placeholder="Search medical records..."/></div>
    <div className="header-right">
      <div className="user-profile"><div className="user-avatar">{user ? user[0] : 'U'}</div><span>{user}</span></div>
      <button className="logout-btn" onClick={onLogout}><LogOut size={16}/> Logout</button>
    </div>
  </header> 
);

/* --- 3. BIOMETRIC SCANNER --- */
const ReliefPacer = ({ onScan }) => {
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [statusText, setStatusText] = useState("System Ready");
  
  useEffect(() => {
    let stream = null;
    const enableCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) { videoRef.current.srcObject = stream; setCameraActive(true); }
      } catch (err) { console.error("Camera Error:", err); }
    };
    enableCamera();
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, []);

  const startScan = async (simulateStress = false) => {
    setScanning(true); 
    setStatusText("Initializing YOLOv8 Face Tracking...");
    
    try {
      await new Promise(r => setTimeout(r, 1500)); 
      setStatusText("Extracting rPPG Signal...");
      
      if (simulateStress) {
        setStatusText("Simulating Acute Stress Marker...");
        setTimeout(() => { onScan(118, 85); setScanning(false); }, 1500);
        return; 
      }

      const response = await axios.post('http://127.0.0.1:8000/api/scan', { user_id: "demo_user" });
      setStatusText("Data Received.");
      onScan(response.data.bpm, response.data.anxiety_score);
      setScanning(false);
    } catch (error) {
      setStatusText("Neural Link Failed. Using offline fallback.");
      setTimeout(() => { onScan(simulateStress ? 118 : 65, simulateStress ? 85 : 12); setScanning(false); }, 2000); 
    } 
  };

  return (
    <div className="pacer-layout fade-in">
      <div className="camera-frame">
        <video ref={videoRef} autoPlay muted className={`live-video ${cameraActive ? 'opacity-100' : 'opacity-50'}`} />
        {!scanning && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', gap: '15px' }}>
            <button onClick={() => startScan(false)} className="big-pink-btn">START NEURAL SCAN</button>
            <button 
              onClick={() => startScan(true)} 
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 20px', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer', transition: '0.2s' }}
            >
              Demo: Simulate High Stress
            </button>
          </div>
        )}
        {scanning && ( <><div className="scan-line"></div><div className="scan-overlay-text">{statusText}</div></> )}
      </div>
    </div>
  );
};

/* --- 4. NEURAL MESH --- */
const NeuralMesh = ({ vitals, setTab }) => {
  const isHighStress = vitals.anxiety > 50;
  return (
    <div className="mesh-layout fade-in">
      <div className="orb-section">
        <div className={`orb ${isHighStress ? 'stress' : 'calm'}`}></div><h2>Neural Mesh Analysis</h2>
      </div>
      <div className="vitals-panel">
        <h3>Live Biometrics</h3>
        <div className="vital-row">
          <div className="v-card"><h4>{vitals.hr} BPM</h4><p>Heart Rate</p></div>
          <div className="v-card"><h4>{vitals.anxiety}%</h4><p>Stress Level</p></div>
        </div>
        <div className="diagnosis-box">
          <h4>💡 AI Recommendation</h4>
          <p>{isHighStress ? "Severe stress detected. Immediate intervention required." : "Vitals are optimal. Proceed to relaxation."}</p>
        </div>
        <div className="action-buttons">
          {isHighStress ? (
            <><button className="mesh-btn dr-book" onClick={() => setTab("experts")}><Users size={20}/> Yes, Book a Doctor</button>
              <button className="mesh-btn dr-ai" onClick={() => setTab("chat")}><BrainCircuit size={20}/> Yes, Chat with Dr. AI</button></>
          ) : ( <button className="mesh-btn relief" onClick={() => setTab("relief")}><Music size={20}/> I prefer the Relief Sanctuary</button> )}
        </div>
      </div>
    </div>
  );
};

/* --- SHARED VOICE RECOGNITION LOGIC --- */
const handleVoiceInput = (setInput, setIsListening) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Voice recognition is not supported in this browser. Please use Google Chrome.");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.onstart = () => setIsListening(true);
  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    setInput(prev => prev + (prev ? " " : "") + transcript);
    setIsListening(false);
  };
  recognition.onerror = () => setIsListening(false);
  recognition.onend = () => setIsListening(false);
  recognition.start();
};

/* --- 5. DR. AI CHAT --- */
const AdvancedDrAI = ({ vitals, user }) => {
  const [msgs, setMsgs] = useState(() => {
    const saved = localStorage.getItem("silent_signal_dr_ai");
    return saved ? JSON.parse(saved) : [{ 
      role: "bot", 
      text: `Hello ${user || 'Patient'}. I'm Dr. AI. I have access to your live vitals. How can I help?`,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("silent_signal_dr_ai", JSON.stringify(msgs));
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  const send = async () => {
    if (!input.trim()) return;
    const timeNow = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const newMsgs = [...msgs, { role: "user", text: input, time: timeNow }];
    setMsgs(newMsgs); 
    setInput(""); 
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/api/agent/chat", { message: input, vitals: vitals });
      setMsgs(prev => [...prev, { role: "bot", text: response.data.response, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    } catch (err) { 
      setTimeout(() => {
        setMsgs(prev => [...prev, { role: "bot", text: "Based on your vitals, I recommend rest and monitoring. (Backend offline).", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
      }, 1000);
    }
    setLoading(false);
  };

  const clearChat = () => {
    setMsgs([{ role: "bot", text: "Chat history cleared. How can I assist you today?", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
  };

  return (
    <div className="dr-ai-layout fade-in">
      <div className="ai-main">
        <div className="ai-toolbar">
          <div className="model-pill"><Sparkles size={16} color="#FF8FA3"/><select><option>Gemini 2.5 Flash</option></select></div>
          <button onClick={clearChat} style={{background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.85rem'}}>Clear History</button>
        </div>
        <div className="ai-feed wa-chat-bg">
          {msgs.map((m, i) => (
            <div key={i} className={`wa-msg-row ${m.role === 'user' ? 'wa-right' : 'wa-left'}`}>
              <div className={`wa-bubble ${m.role === 'user' ? 'wa-user' : 'wa-bot'}`}>
                {m.role === 'bot' && <div className="wa-sender">Dr. AI</div>}
                <div className="wa-text">{m.text}</div>
                <div className="wa-time">{m.time}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="wa-msg-row wa-left">
              <div className="wa-bubble wa-bot"><div className="wa-text" style={{fontStyle:'italic', color:'#888'}}>Dr. AI is typing...</div></div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="wa-input-area">
          <button className={`mic-btn ${isListening ? 'recording' : ''}`} onClick={() => handleVoiceInput(setInput, setIsListening)}>
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <input 
            value={input} 
            onChange={e=>setInput(e.target.value)} 
            placeholder="Type or speak to Dr. AI..." 
            onKeyPress={e=>e.key==='Enter' && !loading && send()} 
            disabled={loading} 
          />
          <button className="send-circle" onClick={send} disabled={loading}>
            {loading ? <div className="spinner"></div> : <Send size={18}/>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* --- 6. DIET PAGE --- */
const DietNode = ({ vitals }) => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/api/nutrition')
      .then(res => { 
        if(res.data && res.data.length > 0) {
          const realFoods = res.data.slice(0, 30).map((item, index) => ({
            id: item.id || index,
            name: item.Description || item.name || "Healthy Food",
            tag: item.Category || item.tag || "Nutrition",
            icon: "🥗",
            desc: item["Data.Protein"] ? `Protein: ${item["Data.Protein"]}g | Carbs: ${item["Data.Carbohydrate"]}g` : (item.desc || "Verified nutritional value.")
          }));
          setFoods(realFoods);
          setLoading(false); 
        } else { throw new Error("Empty Array"); }
      })
      .catch(err => { 
        setFoods([
          { id: 1, name: "Dark Chocolate", tag: "Lowers Cortisol", icon: "🍫", desc: "Reduces neuro-inflammation and oxidative stress." },
          { id: 2, name: "Blueberries", tag: "Brain Booster", icon: "🫐", desc: "Antioxidants repair stress and promote clarity." },
          { id: 3, name: "Avocado", tag: "Vitamin B", icon: "🥑", desc: "Healthy fats support nerve cells and mood." },
          { id: 4, name: "Walnuts", tag: "Omega-3", icon: "🌰", desc: "Supports serotonin production for calm." }
        ]); setLoading(false); 
      });
  }, []);

  return (
    <div className="diet-layout fade-in">
      <h2 className="section-title">Neuro-Nutrition Plan</h2>
      {loading ? <p>Loading Kaggle Dataset...</p> : (
        <div className="diet-grid">
          {foods.map(food => (
             <div key={food.id} className="diet-card c-green">
               <div className="d-icon">{food.icon}</div>
               <h3>{food.name}</h3>
               <p className="diet-tag">{food.tag}</p>
               <span style={{fontSize: '0.85rem', color: '#666'}}>{food.desc}</span>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* --- 7. NEURO-NUTRITION & SUPPLEMENTS (Upgraded Pharmacy) --- */
const PharmacyCounter = ({ cart, setCart, user }) => {
  const [view, setView] = useState("shop");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const total = cart.reduce((acc, item) => acc + item.price, 0);

  const handleExportStorePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(255, 143, 163); 
    doc.text("Silent Signal", 20, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Neuro-Nutrition Order Invoice", 20, 30);
    doc.line(20, 35, 190, 35); 

    doc.setFontSize(12);
    doc.text(`Billed To: ${user || 'Guest'}`, 20, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 52);
    
    doc.text("Order Summary:", 20, 65);
    cart.forEach((item, index) => {
        doc.text(`- ${item.name} ($${item.price})`, 25, 75 + (index * 7));
    });

    doc.setFontSize(14);
    doc.text(`Total Amount Paid: $${total}`, 20, 85 + (cart.length * 7));

    doc.save(`SilentSignal_Order_${new Date().getTime()}.pdf`);
  };

  useEffect(() => {
    axios.get('http://localhost:8000/api/pharmacy')
      .then(res => { 
        if(res.data && res.data.length > 0) {
          const mappedSupplements = res.data.slice(0, 30).map((item, index) => ({
            id: item.id || index,
            name: item.Drug_Name || item.name || "Natural Supplement",
            price: item.Price ? parseFloat(item.Price) : Math.floor(Math.random() * 20) + 10,
            tag: item.Reason || item.tag || "Wellness",
            icon: "🌿", 
            desc: item.Description || item.desc || "Natural, data-backed therapeutic support."
          }));
          setProducts(mappedSupplements);
          setLoading(false); 
        } else { throw new Error("Empty Array"); }
      })
      .catch(err => { 
        setProducts([
          { id: 1, name: "Ashwagandha Root Extract", price: 12, tag: "Ayurveda • Stress Relief", icon: "🌿", desc: "Ancient adaptogen proven to severely reduce cortisol levels and manage daily stress." },
          { id: 2, name: "Calm Magnesium Glycinate", price: 18, tag: "Mineral • Nervous System", icon: "✨", desc: "Highly absorbable magnesium to calm the nervous system and prevent panic spikes." },
          { id: 3, name: "L-Theanine & Melatonin", price: 22, tag: "Sleep Aid • Rest", icon: "🌙", desc: "Natural sleep cycle support for deep rest without the morning grogginess." },
          { id: 4, name: "Vitamin D3 + K2 Drop", price: 15, tag: "Daily Support", icon: "☀️", desc: "Essential for bone health and regulating mood fluctuations." },
          { id: 5, name: "Focus Green Tea Matcha", price: 25, tag: "Detox • Clarity", icon: "🍵", desc: "Promotes clarity, detox, and calm focus without caffeine jitters." }
        ]); setLoading(false); 
      });
  }, []);

  return (
    <div className="pharmacy-layout fade-in">
      {view === "shop" ? (
        <>
          <div className="shop-head" style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', color: '#333' }}>Neuro-Nutrition & Supplements</h2>
              <p style={{ color: '#888', marginTop: '5px' }}>Natural, data-backed therapeutic support for your autonomic nervous system.</p>
            </div>
            <button className="cart-chip" onClick={()=>setView("checkout")}><ShoppingBag size={18}/> <span>{cart.length} Items</span></button>
          </div>
          {loading ? <p>Loading Supplements...</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {products.map(p => (
                <div key={p.id} style={{ background: 'white', borderRadius: '15px', padding: '20px', border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <span style={{ fontSize: '2rem' }}>{p.icon}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#FF8FA3', background: '#fff0f3', padding: '4px 10px', borderRadius: '20px' }}>{p.tag}</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#333' }}>{p.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#666', minHeight: '40px', marginBottom: '15px' }}>{p.desc}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                    <b style={{ fontSize: '1.3rem', color: '#333' }}>${p.price}</b>
                    <button style={{ background: '#FF8FA3', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setCart([...cart, p])}>Add to Cart</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : view === "checkout" ? (
        <div className="checkout-layout">
          <button className="back-btn" onClick={()=>setView("shop")}>Back to Supplements</button>
          <div className="checkout-split">
            <div className="order-summary">
              <h3>Order Summary</h3>
              {cart.length === 0 ? ( <div className="empty-cart-msg">Your cart is currently empty. Add some items to checkout!</div> ) : (
                <>{cart.map((c,i)=>(<div key={i} className="sum-item"><span>{c.name}</span><b>${c.price}</b></div>))}
                  <div className="sum-total"><span>Total</span><span>${total}</span></div>
                  <button className="place-order-btn" onClick={() => setView("success")}>Place Secure Order</button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="success-screen">
          <CheckCircle size={80} color="#4CAF50" className="bounce"/><h2>Order Placed Successfully!</h2><p>Your wellness products will be delivered soon.</p>
          <div className="success-actions">
             <button className="primary-action-btn" onClick={() => { setCart([]); setView("shop"); }}>Continue Shopping</button>
             <button className="secondary-action-btn" onClick={handleExportStorePDF}><Download size={18}/> Download Invoice</button>
          </div>
        </div>
      )}
    </div>
  );
};

/* --- 8. DASHBOARD --- */
const Dashboard = ({ vitals, history }) => {
  const dataPoints = history.map(h => h.val || 0);
  const currentHR = vitals.hr !== "--" ? parseInt(vitals.hr) : 0;
  const graphData = currentHR > 0 ? [...dataPoints.slice(1), currentHR] : dataPoints;
  const width = 500; const height = 150; const maxVal = 120;
  const generatePath = (data) => {
    if (data.length === 0) return "";
    const points = data.map((val, index) => `${(index / (data.length - 1)) * width},${height - (val / maxVal) * height}`);
    return `M${points.join(" L")}`;
  };
  const linePath = generatePath(graphData);
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <div className="dashboard-layout fade-in">
      <div className="dash-header"><h2>Wellness Overview</h2></div>
      <div className="kpi-row">
        <div className="kpi-card pink"><div className="k-icon"><Heart size={24} color="#FF8FA3"/></div><div className="k-data"><h3>{vitals.hr} <small>BPM</small></h3><p>Heart Rate</p></div></div>
        <div className="kpi-card blue"><div className="k-icon"><Zap size={24} color="#A0C4FF"/></div><div className="k-data"><h3>{vitals.anxiety}%</h3><p>Anxiety</p></div></div>
      </div>
      <div className="main-graph-card">
        <h3>Heart Rate Trend</h3>
        <div className="graph-wrapper">
          <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
            <defs><linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#FF8FA3" stopOpacity="0.4"/><stop offset="100%" stopColor="#fff" stopOpacity="0"/></linearGradient></defs>
            <path d={areaPath} fill="url(#gradient)" /><path d={linePath} fill="none" stroke="#FF8FA3" strokeWidth="4" />
          </svg>
        </div>
      </div>
    </div>
  );
};

/* --- RELIEF SECTION (STRICTLY UNTOUCHED AS REQUESTED) --- */
const ReliefSection = () => {
  const [filter, setFilter] = useState("All");
  const [favorites, setFavorites] = useState([]); // Array of IDs

  const moods = ["All", "Calm", "Focus", "Motivation", "Favorites"];

  const mediaData = {
    songs: [
      { id: "6irxS2m3XrDjWPZFkE5qgo?si=qoTz3uY_TK-bxbjvR7ewww", title: "Peaceful Meditation", desc: "Slow ambient sounds", cat: "Calm" },
      { id: "2F6LyTRo99Hy7ayFFLso9t?si=lO0aVsYYQ-m2h75J2mRIuA", title: "Deep Focus", desc: "Instrumental beats", cat: "Focus" },
      { id: "0BVsv2yFhmyN959vkZVJAl?si=Q2QFKz23RDqKKv_557SLdw", title: "Positive Vibes", desc: "Uplift your mood", cat: "Motivation" },
      { id: "37i9dQZF1DWXe9gFZP0gtP", title: "Stress Relief Piano", desc: "Gentle melodies", cat: "Calm" }
    ],
      videos: [
  {
    id: "inpok4MKVLM",
    title: "5 Minutes Mindfulness",
    speaker: "Guided Meditation",
    cat: "Calm",
    embed: true
  },
  {
    id: "z-IR48Mb3W0",
    title: "Train Your Brain",
    speaker: "Neuroscience",
    cat: "Focus",
    embed: true
  },
  {
    id: "p0p1fjLPjYQ",
    title: "Why are you unhappy",
    speaker: "Matthew McConaughey ",
    cat: "Motivation",
    embed: false
  },
  {
  id: "ZXsQAXx_ao0",
  title: "Believe in Yourself",
  speaker: "MotivationHub",
  cat: "Motivation"
},
{
  id: "wnHW6o8WMas",
  title: "Never Give Up",
  speaker: "Motivation2Study",
  cat: "Motivation"
},
{
  id: "UNQhuFL6CWg",
  title: "This Will Change Your Life",
  speaker: "Ben Lionel Scott",
  cat: "Motivation"
},
{
  id: "iCvmsMzlF7o",
  title: "Grit: The Power of Passion",
  speaker: "Angela Duckworth (TED)",
  cat: "Motivation"
},
{
  id: "ZToicYcHIOU",
  title: "Guided Breathing Exercise",
  speaker: "Headspace",
  cat: "Calm"
}
]  
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

 
  const filteredSongs = mediaData.songs.filter(s => 
    filter === "Favorites" ? favorites.includes(s.id) : (filter === "All" || s.cat === filter)
  );

  const filteredVideos = mediaData.videos.filter(v => 
    filter === "Favorites" ? favorites.includes(v.id) : (filter === "All" || v.cat === filter)
  );

  return (
    <div className="relief-container fade-in">
      <div className="relief-header">
        <h1><Sparkles className="icon-pink" /> Relief Sanctuary</h1>
        <p>Save your favorite frequencies for quick access.</p>
      </div>

      <div className="filter-bar">
        {moods.map(m => (
          <button
            key={m}
            className={`filter-btn ${filter === m ? "active" : ""} ${m === "Favorites" ? "fav-filter" : ""}`}
            onClick={() => setFilter(m)}
          >
            {m === "Favorites" && <Heart size={14} fill={filter === "Favorites" ? "white" : "none"} style={{marginRight: '5px'}}/>}
            {m}
          </button>
        ))}
      </div>

      <div className="relief-grid">
        {/* AUDIO COLUMN */}
        <div className="relief-column">
          <div className="column-title"><Music /> <h3>The Soundscape</h3></div>
          <div className="scroll-area">
            {filteredSongs.length > 0 ? filteredSongs.map(song => (
              <div key={song.id} className="relief-card song-card">
                <div className="relief-info">
                  <div className="card-top">
                    <span className="mood-tag">{song.cat}</span>
                    <button className="fav-toggle" onClick={() => toggleFavorite(song.id)}>
                      <Heart size={18} fill={favorites.includes(song.id) ? "#FF8FA3" : "none"} color={favorites.includes(song.id) ? "#FF8FA3" : "#ccc"} />
                    </button>
                  </div>
                  <h4>{song.title}</h4>
                </div>
                <iframe
  key={song.id}
  src={`https://open.spotify.com/embed/playlist/${song.id}`}
  width="100%"
  height="152"
  frameBorder="0"
  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
  loading="lazy"
/>
              </div>
            )) : <p className="empty-msg">No favorites in Audio yet.</p>}
          </div>
        </div>

        {/* VIDEO COLUMN */}
        <div className="relief-column">
          <div className="column-title"><Video /> <h3>The Vision</h3></div>
          <div className="scroll-area">
            {filteredVideos.length > 0 ? filteredVideos.map(video => (
              <div key={video.id} className="relief-card video-card">
                <div className="video-wrapper">
                <div
    className="yt-card"
    onClick={() =>
        window.open(`https://www.youtube.com/watch?v=${video.id}`, "_blank")
    }
>
    <img
        src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
        alt={video.title}
    />

    <div className="yt-overlay">
        <span className="yt-play">▶</span>
        <p>Watch on YouTube</p>
    </div>
</div>

                </div>
                <div className="relief-info">
                  <div className="card-top">
                    <span className="mood-tag">{video.cat}</span>
                    <button className="fav-toggle" onClick={() => toggleFavorite(video.id)}>
                      <Heart size={18} fill={favorites.includes(video.id) ? "#FF8FA3" : "none"} color={favorites.includes(video.id) ? "#FF8FA3" : "#ccc"} />
                    </button>
                  </div>
                  <h4>{video.title}</h4>
                  <p>{video.speaker}</p>
                </div>
              </div>
            )) : <p className="empty-msg">No favorites in Videos yet.</p>}
          </div>
        </div>
      </div>

      <style>{`
        .relief-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
        .relief-header { text-align: center; margin-bottom: 25px; }
        .filter-bar { display: flex; justify-content: center; gap: 10px; margin-bottom: 30px; }
        .filter-btn { padding: 8px 20px; border-radius: 20px; border: 1px solid #eee; background: white; cursor: pointer; display: flex; align-items: center; }
        .filter-btn.active { background: #FF8FA3; color: white; border-color: #FF8FA3; }
        .fav-filter.active { background: #ff4d6d; }
        
        .relief-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
        .scroll-area { max-height: 70vh; overflow-y: auto; padding-right: 8px; }
        
        .relief-card { background: white; border-radius: 15px; border: 1px solid #f0f0f0; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); position: relative; }
        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .fav-toggle { background: none; border: none; cursor: pointer; transition: transform 0.2s; }
        .fav-toggle:hover { transform: scale(1.2); }
        
        .mood-tag { font-size: 0.6rem; font-weight: bold; color: #FF8FA3; background: #fff0f3; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; }
        .relief-info { padding: 15px; }
        .relief-info h4 { margin: 5px 0; font-size: 1rem; color: #333; }
        .relief-info p { margin: 0; font-size: 0.8rem; color: #888; }
        
        .video-wrapper { position: relative; padding-bottom: 56.25%; height: 0; background: #000; border-radius: 15px 15px 0 0; overflow: hidden; }
        .video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
        
        .empty-msg { text-align: center; color: #bbb; font-style: italic; margin-top: 40px; }
        .icon-pink { color: #FF8FA3; }
        
        @media (max-width: 850px) { .relief-grid { grid-template-columns: 1fr; } }
        .yt-card {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(0,0,0,0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.yt-card img {
  width: 100%;
  display: block;
  filter: brightness(0.9);
}

.yt-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 40px rgba(0,0,0,0.25);
}

.yt-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.1),
    rgba(0,0,0,0.7)
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.yt-card:hover .yt-overlay {
  opacity: 1;
}

.yt-play {
  font-size: 3rem;
  background: rgba(255, 0, 0, 0.85);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.yt-overlay p {
  font-size: 0.95rem;
  font-weight: 600;
}

      `}</style>
    </div>
  );
};

/* --- 9. CONSULTATION (With PDF Implementation) --- */
const SOSOverlay = ({ vitals, close }) => (
  <div className="sos-overlay"><div className="sos-box"><div className="sos-header"><ShieldAlert size={60} color="#FF0000"/><h2>EMERGENCY ALERT</h2></div><div className="qr-frame"><QRCodeSVG value={`SOS | HR:${vitals.hr}`} size={160} fgColor="#FF0000"/></div><button className="dismiss-btn" onClick={close}>Dismiss</button></div></div>
);

const ConsultationRoom = ({ setTab, cart, setCart, vitals, user }) => {
  const [messages, setMessages] = useState([{ sender: "Dr. Kavita", text: `Hello ${user || 'there'}! I have reviewed your recent high-stress vitals from the Neural Mesh. How are you feeling right now?`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [driveStatus, setDriveStatus] = useState("Drive");
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const handleSend = async () => {
    if(!input.trim()) return;
    const userText = input;
    const timeNow = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    setMessages(prev => [...prev, { sender: "You", text: userText, time: timeNow }]); 
    setInput("");
    setIsTyping(true);

    try {
      const response = await axios.post("http://localhost:8000/api/agent/chat", { message: `Patient says: "${userText}". You are Dr. Kavita Sharma, a psychiatrist. Reply briefly, empathetically, and professionally.`, vitals: vitals });
      setMessages(prev => [...prev, { sender: "Dr. Kavita", text: response.data.response, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    } catch (error) {
      setTimeout(() => { 
        let reply = "I understand. I am updating your file to ensure you get the right care.";
        const lowerInput = userText.toLowerCase();
        if (lowerInput.includes("headache") || lowerInput.includes("pain")) reply = "I'm sorry you're experiencing pain. Let's add a mild analgesic and monitor your stress triggers.";
        else if (lowerInput.includes("sleep") || lowerInput.includes("tired")) reply = "Sleep deprivation heavily impacts anxiety. I'm adding Melatonin from our supplements to your prescription.";
        else if (lowerInput.includes("stress") || lowerInput.includes("anxious") || lowerInput.includes("panic")) reply = "Your vitals confirm an elevated stress response. I strongly recommend the Calm Magnesium and 10 minutes in the Relief Sanctuary.";
        
        setMessages(prev => [...prev, { sender: "Dr. Kavita", text: reply, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]); 
      }, 1500);
    } finally { setIsTyping(false); }
  };

  const handleExportConsultationPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(255, 143, 163); 
    doc.text("Silent Signal", 20, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Official Clinical Report & Vitals", 20, 30);
    doc.line(20, 35, 190, 35); 

    doc.setFontSize(12);
    doc.text(`Patient Name: ${user || 'Guest'}`, 20, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 52);
    
    doc.text(`Recorded Heart Rate: ${vitals?.hr || '--'} BPM`, 20, 65);
    doc.text(`Stress Index: ${vitals?.anxiety || '--'}%`, 20, 72);
    doc.text(`Status: ${vitals?.status || 'Pending'}`, 20, 79);

    doc.text("Recommended Therapeutic Supplements:", 20, 95);
    doc.text("- Calm Magnesium (1 Tablet/Night)", 25, 105);

    doc.save(`${user || 'Patient'}_Medical_Report.pdf`);
  };

  const handleExportWhatsApp = () => { 
    const text = `*🏥 SilentSignal Official Medical Report*\n\n*Patient:* ${user || 'Guest'}\n*Date:* ${new Date().toLocaleDateString()}\n\n*📊 Biometrics (YOLOv8 & rPPG):*\n- Heart Rate: ${vitals.hr} BPM\n- Stress Index: ${vitals.anxiety}%\n- Status: ${vitals.status}\n\n*💊 Prescribed Interventions:*\n1. Calm Magnesium (1 Tablet/Night)\n2. Neuro-Nutrition: Dark Chocolate & Blueberries\n3. Therapy: Relief Sanctuary Soundscapes (10 mins/Day)\n\n_Generated securely via SilentSignal Neural Mesh._`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); 
  };
  
  const handleDriveUpload = () => { setDriveStatus("Uploading..."); setTimeout(() => { setDriveStatus("Saved ✓"); setTimeout(() => setDriveStatus("Drive"), 3000); }, 1500); };
  const handleExportEmail = () => { const text = `SilentSignal Medical Report\n\nDoctor: Dr. Kavita Sharma\nDiagnosis: Acute Stress Response\nHeart Rate: ${vitals.hr} BPM\nStress Level: ${vitals.anxiety}%\n\nPlease check the SilentSignal dashboard for full prescriptions.`; window.location.href = `mailto:?subject=My SilentSignal Medical Report&body=${encodeURIComponent(text)}`; };

  return (
    <div className="consultation-room fade-in">
      <div className="chat-window">
        <div className="chat-header"><span>Live Consultation: Dr. Kavita Sharma</span><div style={{display: 'flex', gap: '10px'}}><Video size={20}/><Volume2 size={20}/></div></div>
        
        <div className="chat-messages wa-chat-bg">
          {messages.map((m, i) => (
            <div key={i} className={`wa-msg-row ${m.sender === "You" ? 'wa-right' : 'wa-left'}`}>
              <div className={`wa-bubble ${m.sender === "You" ? 'wa-user' : 'wa-bot'}`}>
                {m.sender !== "You" && <div className="wa-sender">{m.sender}</div>}
                <div className="wa-text">{m.text}</div>
                <div className="wa-time">{m.time}</div>
              </div>
            </div>
          ))}
          {isTyping && ( <div className="wa-msg-row wa-left"><div className="wa-bubble wa-bot"><div className="wa-text" style={{fontStyle:'italic', color:'#888'}}>Dr. Kavita is typing...</div></div></div> )}
          <div ref={chatEndRef} />
        </div>

        <div className="wa-input-area">
          <button className={`mic-btn ${isListening ? 'recording' : ''}`} onClick={() => handleVoiceInput(setInput, setIsListening)}>
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <input 
            value={input} 
            onChange={e=>setInput(e.target.value)} 
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Type or speak to the doctor..." 
            disabled={isTyping}
          />
          <button className="send-circle" onClick={handleSend} disabled={isTyping}><Send size={18}/></button>
        </div>
      </div>

      <div className="prescription-panel">
        <div className="rx-header"><ClipboardList size={24}/> <h3>Official e-Prescription</h3></div>
        <h4>Prescribed Interventions</h4>
        <div className="rx-item"><div><b>Calm Magnesium</b></div><button onClick={() => { setCart([...cart, { id: 101, name: "Calm Magnesium", price: 15 }]); setTab("pharmacy"); }}>Buy in Store</button></div>
        <div className="export-section">
          <h4><Share2 size={16}/> Export Medical Records</h4>
          <p>Download or share your AI scanner vitals & prescriptions.</p>
          <div className="export-grid">
            <button onClick={handleExportConsultationPDF}><FileText size={18} color="#E53935"/> PDF</button>
            <button onClick={handleDriveUpload} style={{color: driveStatus.includes("✓") ? "#4CAF50" : "#555"}}><Cloud size={18} color={driveStatus.includes("✓") ? "#4CAF50" : "#1976D2"}/> {driveStatus}</button>
            <button className="wa-btn" onClick={handleExportWhatsApp}><MessageCircle size={18} color="#25D366"/> WhatsApp</button>
            <button onClick={handleExportEmail}><Mail size={18} color="#FB8C00"/> Email</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- 10. EXPERTS BOOKING PAGE --- */
const ExpertNodes = ({ setTab, user }) => {
  const [view, setView] = useState("list"); 
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [date, setDate] = useState("");
  
  const docs = [
    { id: 1, name: "Dr. Kavita Sharma", role: "Psychiatrist", exp: "12 Yrs", fee: 50, rating: "4.9", color: "blue", tags: ["Anxiety", "Depression"], availability: "Available Today" },
    { id: 2, name: "Dr. Rahul Mehta", role: "Clinical Therapist", exp: "8 Yrs", fee: 40, rating: "4.8", color: "pink", tags: ["Trauma", "CBT"], availability: "Next Slot: Tomorrow" },
    { id: 3, name: "Dr. Sarah Jenkins", role: "Neurologist", exp: "15 Yrs", fee: 80, rating: "5.0", color: "mint", tags: ["Migraine", "Brain Health"], availability: "Available Today" },
    { id: 4, name: "Dr. Amit Patel", role: "Ayurvedic Specialist", exp: "10 Yrs", fee: 30, rating: "4.7", color: "tan", tags: ["Holistic", "Stress"], availability: "Next Slot: Wed" },
    { id: 5, name: "Dr. Emily Chen", role: "Behavioral Coach", exp: "6 Yrs", fee: 45, rating: "4.9", color: "purple", tags: ["Sleep", "Habits"], availability: "Available Today" }
  ];

  const handleExportBookingPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(255, 143, 163); 
    doc.text("Silent Signal", 20, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Medical Appointment Invoice", 20, 30);
    doc.line(20, 35, 190, 35); 

    doc.setFontSize(12);
    doc.text(`Patient Name: ${user || 'Guest'}`, 20, 45);
    doc.text(`Date of Booking: ${new Date().toLocaleDateString()}`, 20, 52);
    
    doc.text(`Doctor: ${selectedDoc.name}`, 20, 65);
    doc.text(`Specialization: ${selectedDoc.role}`, 20, 72);
    doc.text(`Appointment Date: ${date}`, 20, 79);

    doc.text(`Consultation Fee: $${selectedDoc.fee.toFixed(2)}`, 20, 95);
    doc.text(`Platform Fee: $2.00`, 20, 102);
    doc.setFontSize(14);
    doc.text(`Total Amount Paid: $${(selectedDoc.fee + 2).toFixed(2)}`, 20, 115);

    doc.save(`SilentSignal_Appointment_${selectedDoc.name.replace(/\s+/g, '')}.pdf`);
  };

  return (
    <div className="experts-layout fade-in">
      {view === "list" && ( 
        <>
          <div className="page-header">
            <h2>Top Specialists</h2>
            <p style={{color: '#888'}}>Book certified professionals tailored to your Neural Mesh analysis.</p>
          </div>
          <div className="doc-list-vertical">
            {docs.map((d) => (
              <div key={d.id} className={`doc-profile-card ${d.color}`}>
                <div className="doc-left">
                  <div className="doc-avatar-lg">{d.name[0]}</div>
                  <div className="doc-details">
                    <div className="doc-name-row">
                      <h3>{d.name}</h3>
                      <span className="rating-badge"><Star size={12} fill="white"/> {d.rating}</span>
                    </div>
                    <p className="doc-role">{d.role} • {d.exp}</p>
                    <div className="doc-tags">
                       <span className="avail-badge"><Clock size={12}/> {d.availability}</span>
                       {d.tags.map(t=><span className="skill-tag" key={t}>{t}</span>)}
                    </div>
                  </div>
                </div>
                <div className="doc-right">
                  <div className="fee-info"><span>Fee</span><b>${d.fee}</b></div>
                  <button className="book-btn" onClick={() => { setSelectedDoc(d); setView("date"); }}>Book</button>
                </div>
              </div>
            ))}
          </div>
        </> 
      )}
      {view === "date" && selectedDoc && ( 
        <div className="booking-overlay">
          <div className={`booking-card theme-${selectedDoc.color}`}>
            <div className="booking-header-color">
              <button onClick={() => setView("list")}><ChevronLeft size={24} color="white"/></button>
              <h3>Select Date for {selectedDoc.name}</h3>
            </div>
            <div className="booking-body">
              <div className="date-input-fancy">
                <label><Calendar size={16}/> Choose Appointment Date</label>
                <input type="date" onChange={(e)=>setDate(e.target.value)} />
              </div>
              <button className="proceed-btn-color" onClick={() => { if(!date) alert("Please select a date!"); else setView("success"); }}>
                Proceed to Pay ${(selectedDoc.fee + 2).toFixed(2)}
              </button>
            </div>
          </div>
        </div> 
      )}
      {view === "success" && ( 
        <div className="success-screen">
          <CheckCircle size={80} color="#4CAF50" className="bounce"/>
          <h2>Booking Confirmed!</h2>
          <p>Your appointment is scheduled for {date}.</p>
          <div className="success-actions">
             <button className="primary-action-btn" onClick={() => setTab("consultation")}>Join Consultation</button>
             <button className="secondary-action-btn" onClick={handleExportBookingPDF}>
               <Download size={18}/> Download Invoice
             </button>
          </div>
        </div> 
      )}
    </div>
  );
};

const Sidebar = ({ active, set, setShowSOS, cartCount }) => (
  <aside className="pastel-sidebar">
    <div className="brand"><BrainCircuit color="#FF8FA3" size={30}/> SilentSignal</div>
    <nav>
      {[{id:'home',l:'Home',i:<Home/>},{id:'pacer',l:'Scanner',i:<Camera/>},{id:'mesh',l:'Neural Mesh',i:<Activity/>},{id:'chat',l:'Dr. AI Chat',i:<Sparkles/>},{id:'dashboard',l:'Dashboard',i:<LayoutDashboard/>},{id:'experts',l:'Doctors',i:<Users/>},{id:'consultation',l:'Active Chat',i:<Video/>},{id:'pharmacy',l:'Store',i:<ShoppingBag/>,c:cartCount},{id:'diet',l:'Nutrition',i:<Utensils/>},{id:'relief',l:'Sanctuary',i:<Music/>}].map(item=>( <button key={item.id} className={active===item.id?'active':''} onClick={()=>set(item.id)}>{item.i} <span>{item.l}</span> {item.c>0&&<span className="badge">{item.c}</span>}</button> ))}
    </nav>
    <button className="sos-btn" onClick={()=>setShowSOS(true)}><ShieldAlert/> SOS</button>
  </aside>
);

const HomePage = ({ setTab, vitals, user }) => (
  <div className="home-layout fade-in">
    <div className="welcome-section"><h1>Good Morning, {user}.</h1><p>Secure login verified. Your neural mesh is standing by.</p></div>
    <div className="big-hero-card"><div className="hero-txt"><h2>Daily Health Scan</h2><p>Analyze vocal & facial biomarkers using YOLOv8 & rPPG.</p><button onClick={() => setTab('pacer')}>Start Scan <ArrowRight size={18}/></button></div></div>
    <div className="home-grid">
      <div className="h-card pink" onClick={()=>setTab('mesh')}><Activity size={24}/><h3>Neural Mesh</h3></div>
      <div className="h-card blue" onClick={()=>setTab('chat')}><Sparkles size={24}/><h3>Dr. AI</h3></div>
      <div className="h-card tan" onClick={()=>setTab('experts')}><Users size={24}/><h3>Book Doctor</h3></div>
    </div>
  </div>
);

export default App;