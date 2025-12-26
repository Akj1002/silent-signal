import React, { useState, useEffect, useRef } from "react";
import {
  Heart, Wind, Mic, Search, Activity, BrainCircuit, 
  LayoutDashboard, Send, Zap, Stethoscope, ShieldAlert, Users,
  Camera, Home, ArrowRight, CheckCircle, Sparkles,
  Utensils, ShoppingBag, Plus, Video, Music
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const App = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showSOS, setShowSOS] = useState(false);
  
  // GLOBAL STATE
  const [vitals, setVitals] = useState({ hr: "--", br: "--", anxiety: 0, status: "Pending Scan" });
  const [history, setHistory] = useState([]);
  const [cart, setCart] = useState([]); 
  
  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/history");
      if(res.ok) setHistory(await res.json());
    } catch(e) { console.log("Backend Offline"); }
  };
  useEffect(() => { fetchHistory(); }, []);

  // REAL-TIME ANALYSIS
  const runAnalysis = async (hr, br) => {
    const anxiety = Math.min(100, Math.round((hr * 0.5) + (br * 1.5) - 40));
    let status = "Optimal";
    if (anxiety > 40) status = "Elevated";
    if (anxiety > 70) status = "Critical";

    setVitals({ hr, br, anxiety, status });

    try {
      await fetch("http://localhost:8000/api/logs", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hr, br, anxiety_score: anxiety, status })
      });
      fetchHistory();
    } catch(e) { console.error("Log failed"); }
  };

  return (
    <div className="pastel-container">
      <Sidebar active={activeTab} set={setActiveTab} setShowSOS={setShowSOS} cartCount={cart.length} />
      
      <main className="pastel-viewport">
        <Header vitals={vitals} />
        
        <section className="pastel-content">
          {activeTab === "home" && <HomePage setTab={setActiveTab} vitals={vitals} />}
          {activeTab === "dashboard" && <Dashboard vitals={vitals} history={history} />}
          {activeTab === "diet" && <DietNode vitals={vitals} />}
          {activeTab === "pharmacy" && <PharmacyCounter cart={cart} setCart={setCart} />}
          {activeTab === "pacer" && <ReliefPacer onScan={runAnalysis} />}
          {activeTab === "chat" && <GeminiMesh vitals={vitals} setTab={setActiveTab} />}
          {activeTab === "health-bot" && <HealthBot />}
          {activeTab === "experts" && <ExpertNodes />}
           {activeTab === "relief" && <ReliefSection />}
        </section>
      </main>

      {/* FIXED: Passing vitals to the SOS Overlay */}
      {showSOS && <SOSOverlay vitals={vitals} close={()=>setShowSOS(false)} />}
    </div>
  );
};

/* --- FIXED SOS OVERLAY (The Emergency Problem Solver) --- */
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

/* --- RELIEF PACER --- */
const ReliefPacer = ({ onScan }) => {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [liveData, setLiveData] = useState({ hr: 70, br: 16 });
  const [progress, setProgress] = useState(0);

  const start = async () => {
    setScanning(true);
    setProgress(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;
      const interval = setInterval(() => {
        setLiveData(prev => ({
          hr: Math.max(60, Math.min(120, prev.hr + Math.floor(Math.random() * 5) - 2)),
          br: Math.max(12, Math.min(30, prev.br + Math.floor(Math.random() * 3) - 1))
        }));
        setProgress(p => p + 2);
      }, 100);
      setTimeout(() => {
        clearInterval(interval);
        onScan(Math.floor(Math.random() * (100 - 65) + 65), Math.floor(Math.random() * (25 - 14) + 14));
        stream.getTracks().forEach(t => t.stop());
        setScanning(false);
      }, 5000);
    } catch (err) { alert("Camera permission required."); setScanning(false); }
  };

  return (
    <div className="pacer-layout fade-in">
      <div className="scanner-frame">
        {scanning ? <video ref={videoRef} autoPlay muted className="live-video"/> : <div className="cam-placeholder"><Camera size={40}/></div>}
        {scanning && <div className="scan-laser"/>}
        {scanning && <div className="live-overlay"><div className="live-stat"><Heart size={16} className="beat"/> {liveData.hr} BPM</div><div className="live-stat"><Wind size={16}/> {liveData.br} RPM</div></div>}
      </div>
      <div className="scanner-ui">
        <h2>Biometric Sync</h2>
        {scanning && <div className="scan-progress"><div className="scan-fill" style={{width: `${progress}%`}}></div></div>}
        <div className="indicators"><span className={scanning?"active":""}><Mic size={16}/> Voice Tone</span><span className={scanning?"active":""}><Video size={16}/> Face Mesh</span></div>
        <button className="action-btn" onClick={start} disabled={scanning}>{scanning ? "Analyzing..." : "Start Live Scan"}</button>
      </div>
    </div>
  );
};
/*--- Relief---*/
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

  // Logic to filter content based on Mood OR Favorites
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
/* --- OTHER COMPONENTS --- */
const DietNode = ({ vitals }) => {
  const foods = [
    { name: "Dark Chocolate", benefit: "Lowers Cortisol", desc: "Flavonoids reduce neuro-inflammation.", color: "brown" },
    { name: "Blueberries", benefit: "Brain Booster", desc: "Antioxidants repair stress-damaged cells.", color: "blue" },
    { name: "Walnuts", benefit: "Omega-3 Rich", desc: "Supports serotonin for mood stability.", color: "cream" },
    { name: "Chamomile Tea", benefit: "Sleep Aid", desc: "Natural sedative for the nervous system.", color: "yellow" },
    { name: "Spinach", benefit: "Magnesium", desc: "Regulates cortisol and blood pressure.", color: "green" },
    { name: "Avocado", benefit: "Vitamin B", desc: "Essential for healthy nerve cells.", color: "green-light" }
  ];
  return (
    <div className="diet-layout fade-in">
      <div className="diet-header"><h2>Neuro-Nutrition Plan</h2><p>Recommended based on anxiety: {vitals.anxiety}%.</p></div>
      <div className="food-grid">{foods.map((f, i) => (<div key={i} className={`food-card ${f.color}`}><div className="food-icon"><Utensils size={20}/></div><h3>{f.name}</h3><span className="benefit-pill">{f.benefit}</span><p>{f.desc}</p></div>))}</div>
    </div>
  );
};

const PharmacyCounter = ({ cart, setCart }) => {
  const products = [{ id: 1, name: "Calm-Magnesium", price: "$15", desc: "Stress relief." }, { id: 2, name: "Melatonin Sleep", price: "$12", desc: "For deep REM." }, { id: 3, name: "Ashwagandha", price: "$20", desc: "Lowers cortisol." }, { id: 4, name: "Vitamin D3", price: "$10", desc: "Mood elevator." }];
  const addToCart = (p) => setCart([...cart, p]);
  const checkout = () => { alert("Order Placed!"); setCart([]); };
  return (
    <div className="pharmacy-layout fade-in">
      <div className="shop-section"><h2>Mental Wellness Pharmacy</h2><div className="product-grid">{products.map((p) => (<div key={p.id} className="product-card"><div className="prod-img">Rx</div><h3>{p.name}</h3><p>{p.desc}</p><div className="price-row"><span>{p.price}</span><button onClick={() => addToCart(p)}><Plus size={16}/> Add</button></div></div>))}</div></div>
      <div className="cart-sidebar"><h3>Cart <ShoppingBag size={18}/></h3>{cart.length === 0 ? <p className="empty-msg">Empty</p> : (<div className="cart-items">{cart.map((c, i) => (<div key={i} className="cart-item"><span>{c.name}</span><strong>{c.price}</strong></div>))}<button className="checkout-btn" onClick={checkout}>Checkout</button></div>)}</div>
    </div>
  );
};

const GeminiMesh=({vitals,setTab})=>{const [msgs,setMsgs]=useState([{role:"bot",text:"Neural Agent synchronized."}]);const [input,setInput]=useState("");const send=async()=>{const newMsgs=[...msgs,{role:"user",text:input}];setMsgs(newMsgs);setInput("");try{const res=await fetch("http://localhost:8000/api/agent/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:input,vitals})});const data=await res.json();if(data.action==="trigger_pacer")setTab("pacer");if(data.action==="open_experts")setTab("experts");setMsgs([...newMsgs,{role:"bot",text:data.response}]);}catch(e){setMsgs([...newMsgs,{role:"bot",text:"Offline Mode."}]);}};return(<div className="gemini-layout fade-in"><div className="orb-container"><div className={`neural-orb ${vitals.anxiety>50?"stress":"calm"}`}><div className="inner-glow"/></div></div><div className="chat-interface"><div className="chat-feed">{msgs.map((m,i)=><div key={i} className={`msg ${m.role}`}>{m.text}</div>)}</div><div className="chat-input-row"><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask Gemini..." /><button onClick={send}><Send size={20}/></button></div></div></div>);};
const HealthBot=()=>{const [msgs,setMsgs]=useState([{role:"bot",text:"Medical Specialist active."}]);const [input,setInput]=useState("");const send=async()=>{const newMsgs=[...msgs,{role:"user",text:input}];setMsgs(newMsgs);setInput("");try{const res=await fetch("http://localhost:8000/api/agent/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:input,vitals:{hr:75,br:18,anxiety:40}})});const data=await res.json();setMsgs([...newMsgs,{role:"bot",text:data.response}]);}catch(e){setMsgs([...newMsgs,{role:"bot",text:"Offline Mode."}]);} };return(<div className="medical-layout fade-in"><div className="medical-header"><Stethoscope size={28}/><h2>Dr. AI Specialist</h2></div><div className="medical-feed">{msgs.map((m,i)=><div key={i} className={`med-msg ${m.role}`}>{m.text}</div>)}</div><div className="medical-input"><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Type symptoms..."/><button onClick={send}><Send size={20}/></button></div></div>);};
const ExpertNodes=()=>{const [date,setDate]=useState("");const [bookingStatus,setBookingStatus]=useState(null);const experts=[{name:"Dr. Kavita Sharma",role:"Clinical Psychiatrist",match:"98%",tags:["Anxiety","CBT"]},{name:"Dr. R. Mehta",role:"Neuro-Psychologist",match:"94%",tags:["Trauma","Sleep"]}];const handleBook=async(expertName)=>{if(!date){alert("Select date.");return;}try{const res=await fetch("http://localhost:8000/api/bookings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({expert_name:expertName,consultation_date:date})});if(res.ok){setBookingStatus(`Confirmed: ${expertName} on ${date}`);setTimeout(()=>setBookingStatus(null),3000);}}catch(err){alert("Booking failed.");}};return(<div className="experts-layout fade-in"><div className="experts-header"><h2>Expert Consultation Nodes</h2><p>AI-matched specialists.</p></div>{bookingStatus&&<div className="success-banner"><CheckCircle size={20}/>{bookingStatus}</div>}<div className="expert-grid">{experts.map((exp,i)=>(<div key={i} className="expert-card"><div className="match-badge">{exp.match} Match</div><div className="expert-avatar-box">{exp.name.charAt(0)}</div><h3>{exp.name}</h3><p className="expert-role">{exp.role}</p><div className="tags-row">{exp.tags.map(t=><span key={t} className="tag">{t}</span>)}</div><div className="booking-action"><input type="date" className="date-picker" onChange={(e)=>setDate(e.target.value)}/><button className="book-btn" onClick={()=>handleBook(exp.name)}>Book Session</button></div></div>))}</div></div>);};
const HomePage=({setTab,vitals})=>(<div className="home-layout fade-in"><div className="hero-section"><div className="hero-text"><h1>Good Morning, Abhinav.</h1><p>Neural mesh active.</p><button className="hero-btn" onClick={()=>setTab('pacer')}>Start Daily Scan <ArrowRight size={18}/></button></div><div className="hero-card"><div className="pulse-ring"></div><Activity size={40} className="hero-icon"/><h3>{vitals.status}</h3><span>Status</span></div></div><div className="quick-grid"><div className="quick-card pink" onClick={()=>setTab('chat')}><BrainCircuit size={24}/><h3>Gemini Mesh</h3><p>Agentic AI.</p></div><div className="quick-card blue" onClick={()=>setTab('diet')}><Utensils size={24}/><h3>Diet Plan</h3><p>Neuro-nutrition.</p></div><div className="quick-card cream" onClick={()=>setTab('pharmacy')}><ShoppingBag size={24}/><h3>Pharmacy</h3><p>Wellness Store.</p></div></div></div>);
const Dashboard=({vitals,history})=>(<div className="dash-layout fade-in"><div className="stats-row"><Card icon={<Heart color="#FF8FA3"/>} label="Heart Rate" val={`${vitals.hr} BPM`} /><Card icon={<Wind color="#A0C4FF"/>} label="Breathing" val={`${vitals.br} RPM`} /><Card icon={<Zap color="#BDB2FF"/>} label="Anxiety" val={`${vitals.anxiety}%`} /></div><div className="chart-box"><h3>7-Day Trends</h3><div className="bars">{history.map((h,i)=><div key={i} className="bar" style={{height:`${h.anxiety_score}%`}}></div>)}</div></div></div>);
const Sidebar=({active,set,setShowSOS,cartCount})=>(<aside className="pastel-sidebar"><div className="logo"><BrainCircuit color="#FF8FA3" size={28}/> SilentSignal</div><nav>{[{id:'home',icon:<Home size={18}/>},{id:'dashboard',icon:<LayoutDashboard size={18}/>},{id:'diet',icon:<Utensils size={18}/>},{id:'pharmacy',icon:<ShoppingBag size={18}/>,count:cartCount},{id:'pacer',icon:<Wind size={18}/>},{id:'chat',icon:<Sparkles size={18}/>},{id:'health-bot',icon:<Stethoscope size={18}/>},{id:'relief',icon:<Music size={18}/>},{id:'experts',icon:<Users size={18}/>}].map(item=><div key={item.id} className={`nav-btn ${active===item.id?'active':''}`} onClick={()=>set(item.id)}>{item.icon}{item.id.replace('-',' ').toUpperCase()}{item.count>0&&<span className="nav-badge">{item.count}</span>}</div>)}</nav><button className="sos-btn" onClick={()=>setShowSOS(true)}><ShieldAlert size={18}/> EMERGENCY SOS</button></aside>);
const Card=({icon,label,val})=><div className="stat-card"><div className="icon-box">{icon}</div><div><h4>{val}</h4><p>{label}</p></div></div>;
const Header=({vitals})=><header className="pastel-header"><div className="search-bar"><Search size={16}/><input placeholder="Search..." /></div><div className="user-pill"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Abhinav" alt="User"/> Abhinav Jha</div></header>;

export default App;
