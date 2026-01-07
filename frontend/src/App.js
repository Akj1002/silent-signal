import React, { useState, useEffect, useRef } from "react";
import {
  Heart, Wind, Mic, Search, Activity, BrainCircuit, 
  LayoutDashboard, Send, Zap, ShieldAlert, Users,
  Camera, Home, ArrowRight, CheckCircle, Sparkles,
  Utensils, ShoppingBag, Plus, Video, Music, CreditCard, Smartphone, Banknote,
  Volume2, History, X, ChevronLeft, Star, Settings, Paperclip
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showSOS, setShowSOS] = useState(false);
  
  // GLOBAL STATE
  const [vitals, setVitals] = useState({ hr: "--", br: "--", anxiety: 0, status: "Pending" });
  const [cart, setCart] = useState([]); 
  const [history, setHistory] = useState([
    { day: "Mon", val: 20 }, { day: "Tue", val: 45 }, { day: "Wed", val: 30 }, 
    { day: "Thu", val: 60 }, { day: "Fri", val: 25 }, { day: "Sat", val: 15 }, { day: "Sun", val: 10 }
  ]);

  const handleScanComplete = (hr, br) => {
    const anxiety = Math.min(100, Math.round((hr * 0.5) + (br * 1.5) - 40));
    setVitals({ hr, br, anxiety, status: anxiety > 50 ? "High" : "Optimal" });
    setActiveTab("mesh"); // Auto-redirect to Orb
  };

  return (
    <div className="pastel-container">
      <Sidebar active={activeTab} set={setActiveTab} setShowSOS={setShowSOS} cartCount={cart.length} />
      
      <main className="pastel-viewport">
        <Header user="Abhinav Jha" />
        
        <div className="content-area">
          {activeTab === "home" && <HomePage setTab={setActiveTab} vitals={vitals} />}
          {activeTab === "dashboard" && <Dashboard vitals={vitals} history={history} />}
          
          {/* FEATURES */}
          {activeTab === "diet" && <DietNode vitals={vitals} />}
          {activeTab === "pharmacy" && <PharmacyCounter cart={cart} setCart={setCart} />}
          {activeTab === "pacer" && <ReliefPacer onScan={handleScanComplete} />}
          
          {/* AI MODULES */}
          {activeTab === "mesh" && <NeuralMesh vitals={vitals} />}
          {activeTab === "chat" && <AdvancedDrAI vitals={vitals} />}
          
          {activeTab === "experts" && <ExpertNodes />}
          {activeTab === "relief" && <ReliefSection />}
        </div>
      </main>

      {showSOS && <SOSOverlay vitals={vitals} close={()=>setShowSOS(false)} />}
    </div>
  );
};

// --- 1. CONNECTED DR. AI (Gemini + Azure Voice) ---
const AdvancedDrAI = ({ vitals }) => {
  const [msgs, setMsgs] = useState([
    { role: "bot", text: "Hello Abhinav. I'm Dr. AI. I have access to your live vitals. How can I help?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("Gemini Pro");
  const [showHistory, setShowHistory] = useState(false);

  // --- REAL BACKEND CONNECTION ---
  const send = async () => {
    if (!input.trim()) return;

    // 1. Add User Message
    const newMsgs = [...msgs, { role: "user", text: input }];
    setMsgs(newMsgs);
    setInput("");
    setLoading(true);

    try {
      // 2. Call Python Backend
      const response = await fetch("http://localhost:8000/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: input, 
          vitals: vitals // Passing Heart Rate & Anxiety to Gemini
        })
      });

      const data = await response.json();

      // 3. Add AI Response
      setMsgs(prev => [...prev, { role: "bot", text: data.response }]);

      // 4. Play Azure Audio
      if (data.audio) {
        try {
          const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
          audio.play();
        } catch (e) {
          console.error("Audio playback failed", e);
        }
      }

    } catch (err) {
      setMsgs(prev => [...prev, { role: "bot", text: "⚠️ Error: Backend is offline. Check terminal." }]);
    }
    
    setLoading(false);
  };

  return (
    <div className="dr-ai-layout fade-in">
      {/* Sidebar */}
      <div className={`ai-sidebar ${showHistory ? 'visible' : ''}`}>
        <div className="ai-header">
          <h3>History</h3>
          <button onClick={() => setShowHistory(false)}><X size={18}/></button>
        </div>
        <div className="history-list">
          <div className="hist-item">Today: Panic Attack Analysis</div>
          <div className="hist-item">Yesterday: Diet Plan</div>
        </div>
      </div>

      {/* Main Chat */}
      <div className="ai-main">
        <div className="ai-toolbar">
          <button onClick={() => setShowHistory(true)}><History size={20}/></button>
          <div className="model-pill">
            <Sparkles size={16} color="#FF8FA3"/>
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              <option>Gemini Pro (Medical)</option>
              <option>Gemini Flash (Fast)</option>
              <option>GPT-4o (Reasoning)</option>
            </select>
          </div>
          <Settings size={20} color="#888"/>
        </div>

        <div className="ai-feed">
          {msgs.map((m, i) => (
            <div key={i} className={`ai-msg ${m.role}`}>
              <div className="ai-avatar">
                {m.role==='bot' ? <BrainCircuit size={18}/> : 'A'}
              </div>
              <div className="ai-bubble">{m.text}</div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {loading && (
            <div className="ai-msg bot">
              <div className="ai-avatar"><BrainCircuit size={18}/></div>
              <div className="ai-bubble" style={{fontStyle:'italic', color:'#888'}}>
                Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="ai-input-box">
          <button className="tool-btn"><Paperclip size={20}/></button>
          <input 
            value={input} 
            onChange={e=>setInput(e.target.value)} 
            placeholder="Ask Dr. AI..." 
            onKeyPress={e=>e.key==='Enter' && !loading && send()}
            disabled={loading}
          />
          <button className="mic-btn"><Mic size={20}/></button>
          <button className="send-circle" onClick={send} disabled={loading}>
            {loading ? <div className="spinner"></div> : <ArrowRight size={20}/>}
          </button>
        </div>
      </div>
    </div>
  );
};
// --- 2. NEURAL MESH (Orb Style) ---
const NeuralMesh = ({ vitals }) => (
  <div className="mesh-layout fade-in">
    <div className="orb-section">
      <div className={`orb ${vitals.anxiety > 50 ? 'stress' : 'calm'}`}></div>
      <h2>Neural Mesh Active</h2>
      <p>Syncing Biometrics...</p>
    </div>
    <div className="vitals-panel">
      <h3>Live Analysis</h3>
      <div className="vital-row">
        <div className="v-card pink">
          <Heart className="v-icon"/>
          <div><h4>{vitals.hr} BPM</h4><p>Heart Rate</p></div>
        </div>
        <div className="v-card blue">
          <Zap className="v-icon"/>
          <div><h4>{vitals.anxiety}%</h4><p>Anxiety</p></div>
        </div>
      </div>
      <div className="diagnosis-box">
        <h4>💡 Dr. AI Diagnosis</h4>
        <p>{vitals.status === "High" ? "High distress detected. I recommend immediate breathing exercises." : "Vitals are stable. Maintain this state."}</p>
      </div>
    </div>
  </div>
);

// --- UPDATED DASHBOARD (Real Data Graph) ---
const Dashboard = ({ vitals, history }) => {
  // 1. Get data points (Default to 0 if missing)
  const dataPoints = history.map(h => h.val || 0);
  
  // 2. Add current live reading to the end if available
  const currentHR = vitals.hr !== "--" ? parseInt(vitals.hr) : 0;
  const graphData = currentHR > 0 ? [...dataPoints.slice(1), currentHR] : dataPoints;

  // 3. Graph Dimensions
  const width = 500;
  const height = 150;
  const maxVal = 120; // Max Scale for HR

  // 4. Generate SVG Path Command
  const generatePath = (data) => {
    if (data.length === 0) return "";
    
    // Calculate X and Y coordinates
    const points = data.map((val, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (val / maxVal) * height;
      return `${x},${y}`;
    });

    // Create Line Path (L = Line to)
    return `M${points.join(" L")}`;
  };

  // 5. Generate Fill Area (Closed loop)
  const linePath = generatePath(graphData);
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <div className="dashboard-layout fade-in">
      <div className="dash-header">
        <div>
          <h2>Wellness Overview</h2>
          <p>Your health metrics for the last 7 days.</p>
        </div>
        <select className="date-select"><option>Last 7 Days</option></select>
      </div>
      
      <div className="kpi-row">
        <div className="kpi-card pink">
          <div className="k-icon"><Heart size={24} color="#FF8FA3"/></div>
          <div className="k-data">
            <h3>{vitals.hr} <small>BPM</small></h3>
            <p>Current Heart Rate</p>
          </div>
        </div>
        <div className="kpi-card blue">
          <div className="k-icon"><Zap size={24} color="#A0C4FF"/></div>
          <div className="k-data">
            <h3>{vitals.anxiety}%</h3>
            <p>Anxiety Score</p>
          </div>
        </div>
        <div className="kpi-card green">
          <div className="k-icon"><CheckCircle size={24} color="#4CAF50"/></div>
          <div className="k-data">
            <h3>Good</h3>
            <p>Sleep Quality</p>
          </div>
        </div>
      </div>

      <div className="main-graph-card">
        <h3>Heart Rate Trend (Real-Time)</h3>
        <div className="graph-wrapper">
          <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
            <defs>
              <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#FF8FA3" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
              </linearGradient>
            </defs>
            {/* The Area Fill */}
            <path d={areaPath} fill="url(#gradient)" />
            {/* The Line Stroke */}
            <path d={linePath} fill="none" stroke="#FF8FA3" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            
            {/* Data Dots */}
            {graphData.map((val, i) => {
               const x = (i / (graphData.length - 1)) * width;
               const y = height - (val / maxVal) * height;
               return <circle key={i} cx={x} cy={y} r="4" fill="#FF8FA3" stroke="white" strokeWidth="2"/>
            })}
          </svg>
          <div className="graph-labels">
            {history.map((h, i) => <span key={i}>{h.day}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
};
const handleScanComplete = (hr, br) => {
    const anxiety = Math.min(100, Math.round((hr * 0.5) + (br * 1.5) - 40));
    setVitals({ hr, br, anxiety, status: anxiety > 50 ? "High" : "Optimal" });
    
    // UPDATE HISTORY WITH NEW HR (This makes the graph move!)
    setHistory(prev => [...prev.slice(1), { day: "Today", val: hr }]); 
    
    setActiveTab("mesh"); 
  };
// --- 4. DIET PAGE (Populated) ---
const DietNode = ({ vitals }) => (
  <div className="diet-layout fade-in">
    <h2 className="section-title">Neuro-Nutrition Plan</h2>
    <p className="subtitle">Recommended based on anxiety: {vitals.anxiety}%</p>
    
    <div className="diet-grid">
      <div className="diet-card c-brown">
        <div className="d-icon">🍫</div>
        <h3>Dark Chocolate</h3>
        <p>Lowers Cortisol</p>
        <span>Reduces neuro-inflammation.</span>
      </div>
      <div className="diet-card c-blue">
        <div className="d-icon">🫐</div>
        <h3>Blueberries</h3>
        <p>Brain Booster</p>
        <span>Antioxidants repair stress.</span>
      </div>
      <div className="diet-card c-cream">
        <div className="d-icon">🌰</div>
        <h3>Walnuts</h3>
        <p>Omega-3 Rich</p>
        <span>Supports serotonin.</span>
      </div>
      <div className="diet-card c-green">
        <div className="d-icon">🥑</div>
        <h3>Avocado</h3>
        <p>Vitamin B</p>
        <span>Healthy nerve cells.</span>
      </div>
    </div>
  </div>
);

// --- UPDATED PHARMACY (1mg Style) ---
const PharmacyCounter = ({ cart, setCart }) => {
  const [view, setView] = useState("shop");
  const products = [
    { id: 1, name: "Calm Magnesium", price: 15, tag: "Best Seller", icon: "💊", desc: "For muscle relaxation" },
    { id: 2, name: "Melatonin Sleep", price: 12, tag: "Sleep Aid", icon: "🌙", desc: "Natural sleep support" },
    { id: 3, name: "Ashwagandha Root", price: 20, tag: "Ayurveda", icon: "🌿", desc: "Stress reduction" },
    { id: 4, name: "Vitamin D3 + K2", price: 10, tag: "Daily", icon: "☀️", desc: "Bone & mood health" },
    { id: 5, name: "Focus Green Tea", price: 8, tag: "Detox", icon: "🍵", desc: "Clarity and focus" },
    { id: 6, name: "Yoga Mat Pro", price: 45, tag: "Gear", icon: "🧘", desc: "Non-slip grip" }
  ];

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="pharmacy-layout fade-in">
      {view === "shop" ? (
        <>
          <div className="shop-head">
            <div>
              <h2>Wellness Store</h2>
              <p>Curated supplements & gear for mental health.</p>
            </div>
            <button className="cart-chip" onClick={()=>setView("checkout")}>
              <ShoppingBag size={18}/> <span>{cart.length} Items</span>
            </button>
          </div>
          <div className="prod-grid">
            {products.map(p => (
              <div key={p.id} className="prod-card">
                <span className="p-tag">{p.tag}</span>
                <div className="p-icon">{p.icon}</div>
                <div className="p-info">
                  <h3>{p.name}</h3>
                  <p>{p.desc}</p>
                  <div className="p-action">
                    <b>${p.price}</b>
                    <button onClick={() => setCart([...cart, p])}>Add</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="checkout-layout">
          <button className="back-btn" onClick={()=>setView("shop")}><ChevronLeft size={18}/> Continue Shopping</button>
          
          <div className="checkout-split">
            <div className="pay-methods">
              <h3>Select Payment Method</h3>
              <div className="method-card active">
                <Smartphone size={24} color="#FF8FA3"/>
                <div><h4>UPI / GPay</h4><p>Instant payment</p></div>
                <div className="radio selected"></div>
              </div>
              <div className="method-card">
                <CreditCard size={24} color="#666"/>
                <div><h4>Credit / Debit Card</h4><p>Visa, Mastercard</p></div>
                <div className="radio"></div>
              </div>
              <div className="method-card">
                <Banknote size={24} color="#666"/>
                <div><h4>Cash on Delivery</h4><p>Pay at doorstep</p></div>
                <div className="radio"></div>
              </div>
            </div>

            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="item-list">
                {cart.length === 0 ? <p>Cart is empty</p> : cart.map((c,i)=>(
                  <div key={i} className="sum-item">
                    <span>{c.name}</span>
                    <b>${c.price}</b>
                  </div>
                ))}
              </div>
              <div className="divider"></div>
              <div className="sum-total">
                <span>Total to Pay</span>
                <span>${total}</span>
              </div>
              <button className="place-order-btn" onClick={()=>{alert("Order Placed Successfully!"); setCart([]); setView("shop")}}>
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 6. HOME PAGE (Restored "Good" UI) ---
const HomePage = ({ setTab, vitals }) => (
  <div className="home-layout fade-in">
    <div className="welcome-section">
      <h1>Good Morning, Abhinav.</h1>
      <p>Your neural mesh is active. Biometrics are stable.</p>
    </div>

    <div className="big-hero-card">
      <div className="hero-txt">
        <h2>Daily Health Scan</h2>
        <p>Ready to analyze vocal & facial biomarkers?</p>
        <button onClick={() => setTab('pacer')}>Start Scan <ArrowRight size={18}/></button>
      </div>
      <div className="hero-stat">
        <Activity size={40}/>
        <span>Good</span>
      </div>
    </div>

    <div className="home-grid">
      <div className="h-card pink" onClick={()=>setTab('mesh')}>
        <Activity size={24}/>
        <h3>Neural Mesh</h3>
        <p>Live Vitals</p>
      </div>
      <div className="h-card blue" onClick={()=>setTab('chat')}>
        <Sparkles size={24}/>
        <h3>Dr. AI</h3>
        <p>Consultation</p>
      </div>
      <div className="h-card orange" onClick={()=>setTab('dashboard')}>
        <LayoutDashboard size={24}/>
        <h3>Analytics</h3>
        <p>7-Day Trend</p>
      </div>
    </div>
  </div>
);

// --- UTILITIES ---
const Sidebar = ({ active, set, setShowSOS, cartCount }) => (
  <aside className="pastel-sidebar">
    <div className="brand"><BrainCircuit color="#FF8FA3" size={30}/> SilentSignal</div>
    <nav>
      {[{id:'home',l:'Home',i:<Home/>},{id:'dashboard',l:'Dashboard',i:<LayoutDashboard/>},{id:'mesh',l:'Neural Mesh',i:<Activity/>},{id:'chat',l:'Dr. AI Chat',i:<Sparkles/>},{id:'pacer',l:'Scanner',i:<Camera/>},{id:'experts',l:'Doctors',i:<Users/>},{id:'pharmacy',l:'Pharmacy',i:<ShoppingBag/>,c:cartCount},{id:'diet',l:'Nutrition',i:<Utensils/>},{id:'relief',l:'Sanctuary',i:<Music/>}].map(item=>(
        <button key={item.id} className={active===item.id?'active':''} onClick={()=>set(item.id)}>
          {item.i} <span>{item.l}</span> {item.c>0&&<span className="badge">{item.c}</span>}
        </button>
      ))}
    </nav>
    <button className="sos-btn" onClick={()=>setShowSOS(true)}><ShieldAlert/> SOS</button>
  </aside>
);

// --- COLORFUL DOCTOR BOOKING & DATE SELECTION ---
const ExpertNodes = () => {
  const [view, setView] = useState("list"); 
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [date, setDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const docs = [
    { id: 1, name: "Dr. Kavita Sharma", role: "Psychiatrist", exp: "12 Yrs", fee: 50, rating: "4.9", color: "blue", tags: ["Anxiety", "Depression"] },
    { id: 2, name: "Dr. Rahul Mehta", role: "Clinical Therapist", exp: "8 Yrs", fee: 40, rating: "4.8", color: "pink", tags: ["Trauma", "CBT"] },
    { id: 3, name: "Dr. Sarah Jenkins", role: "Neurologist", exp: "15 Yrs", fee: 80, rating: "5.0", color: "mint", tags: ["Migraine", "Brain Health"] }
  ];

  const startBooking = (doc) => { setSelectedDoc(doc); setView("date"); };
  const proceedToPay = () => { if(!date) return alert("Select date!"); setView("checkout"); };

  return (
    <div className="experts-layout fade-in">
      {/* 1. DOCTOR LIST */}
      {view === "list" && (
        <>
          <div className="page-header">
            <h2>Top Specialists</h2>
            <p>Book verified experts. Consultation fees apply.</p>
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
                    <p className="doc-role">{d.role} • {d.exp} Exp</p>
                    <div className="doc-tags">{d.tags.map(t=><span key={t}>{t}</span>)}</div>
                  </div>
                </div>
                <div className="doc-right">
                  <div className="fee-info"><span>Consultation Fee</span><b>${d.fee}</b></div>
                  <button className="book-btn" onClick={() => startBooking(d)}>Book Appointment</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 2. COLORFUL DATE SELECTION */}
      {view === "date" && selectedDoc && (
        <div className="booking-overlay">
          <div className={`booking-card theme-${selectedDoc.color}`}>
            <div className="booking-header-color">
              <button onClick={() => setView("list")}><ChevronLeft size={24} color="white"/></button>
              <h3>Select Date</h3>
            </div>
            
            <div className="booking-body">
              <div className="doc-mini-profile">
                <div className="doc-avatar-md">{selectedDoc.name[0]}</div>
                <div>
                  <h4>{selectedDoc.name}</h4>
                  <p>{selectedDoc.role}</p>
                </div>
              </div>

              <div className="date-input-fancy">
                <label>Choose Appointment Date</label>
                <input type="date" onChange={(e)=>setDate(e.target.value)} />
              </div>

              <div className="fee-summary-box">
                <div className="row"><span>Consultation</span><span>${selectedDoc.fee}</span></div>
                <div className="row"><span>Service Fee</span><span>$2.00</span></div>
                <div className="row total"><span>Total</span><span>${selectedDoc.fee + 2}</span></div>
              </div>

              <button className="proceed-btn-color" onClick={proceedToPay}>
                Proceed to Pay ${selectedDoc.fee + 2} <ArrowRight size={18}/>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CHECKOUT VIEW */}
      {view === "checkout" && selectedDoc && (
        <div className="booking-overlay">
          <div className="booking-card">
            <div className="booking-header-simple">
              <button onClick={() => setView("date")}><ChevronLeft size={20}/></button>
              <h3>Secure Payment</h3>
            </div>
            <div className="booking-body">
              <div className="pay-methods-list">
                {['UPI / GPay', 'Credit Card', 'Net Banking'].map(m => (
                  <div key={m} className={`pm-item ${paymentMethod===m?'active':''}`} onClick={()=>setPaymentMethod(m)}>
                    <span>{m}</span>
                    <div className="radio-circle"></div>
                  </div>
                ))}
              </div>
              <button className="pay-final-btn" onClick={()=>setView("success")}>Pay Securely</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUCCESS */}
      {view === "success" && (
        <div className="success-screen">
          <CheckCircle size={80} color="#4CAF50" className="bounce"/>
          <h2>Booking Confirmed!</h2>
          <p>Appointment scheduled for <strong>{date}</strong>.</p>
          <button onClick={()=>setView("list")}>Done</button>
        </div>
      )}
    </div>
  );
};
// --- RESTORED BIOMETRIC SCANNER (The Good Version) ---
const ReliefPacer = ({ onScan }) => {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const startScan = async () => {
    setScanning(true);
    setProgress(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      
      // Simulate scanning progress
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            return 100;
          }
          return p + 2;
        });
      }, 80);

      setTimeout(() => {
        stream.getTracks().forEach(t => t.stop());
        setScanning(false);
        onScan(85, 18); // Pass results
      }, 4000);
    } catch (err) {
      alert("Camera required. Simulating scan...");
      setScanning(false);
      onScan(85, 18);
    }
  };

  return (
    <div className="pacer-layout fade-in">
      {/* Black Camera Box */}
      <div className="camera-frame">
        {scanning ? (
          <>
            <video ref={videoRef} autoPlay muted className="live-video" />
            <div className="scan-line"></div>
            <div className="scan-overlay-text">Analyzing Micro-Expressions... {progress}%</div>
          </>
        ) : (
          <div className="cam-placeholder">
            <Camera size={60} color="#333" />
            <p>Camera Offline</p>
          </div>
        )}
      </div>

      {/* Info & Controls */}
      <div className="pacer-info">
        <h2>Biometric Sync</h2>
        <div className="indicators">
          <span><Mic size={16}/> Voice Tone</span>
          <span><Video size={16}/> Face Mesh</span>
        </div>
        <button className="big-pink-btn" onClick={startScan} disabled={scanning}>
          {scanning ? "Scanning..." : "Start Health Scan"}
        </button>
      </div>
    </div>
  );
};

const Header = () => (<header className="pastel-header"><div className="search"><Search size={16}/><input placeholder="Search..."/></div><div className="user">Abhinav Jha</div></header>);
 
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

const SOSOverlay = ({ vitals, close }) => (
  <div className="sos-overlay">
    <div className="sos-box">
      <div className="sos-header">
        <ShieldAlert size={60} color="#FF0000" className="pulse-alert"/>
        <h2>EMERGENCY ALERT</h2>
      </div>
      
      <p>Scan to share live vitals with responders.</p>
      
      <div className="qr-frame">
        <QRCodeSVG 
          value={`SOS-ALERT | HR:${vitals.hr} | BR:${vitals.br} | ANXIETY:${vitals.anxiety}% | STATUS:${vitals.status}`} 
          size={160}
          fgColor="#FF0000"
        />
      </div>

      <div className="sos-stats">
        <div className="stat-pill">❤️ {vitals.hr} BPM</div>
        <div className="stat-pill">⚡ {vitals.anxiety}% Anxiety</div>
      </div>

      <button className="dismiss-btn" onClick={close}>False Alarm - Dismiss</button>
    </div>
  </div>
);

export default App;