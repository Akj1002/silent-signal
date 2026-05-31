# 🧠 Silent Signal: The Agentic Neural Mesh for Mental Health

![Status](https://img.shields.io/badge/Status-MVP%20Ready-success) ![Tech](https://img.shields.io/badge/Stack-React%20%2B%20FastAPI-blue) ![AI](https://img.shields.io/badge/AI-Azure%20%2B%20Gemini-purple) ![Deployment](https://img.shields.io/badge/Deployment-Vercel-black)

> *"Silence is not empty; it is full of answers."*

**Silent Signal** is a hyper-personalized mental health ecosystem designed to bridge the gap between biological signals and psychological support. Unlike passive chatbots, our platform is **Agentic**—it actively senses distress through real-time biometrics and intervenes before a crisis occurs, all wrapped in a premium, glassmorphism-inspired interface.

---

## 🌐 Live Demo & Deployment

The frontend architecture is actively deployed and hosted for live demonstration.

🔗 **[Experience the Live Frontend Here](https://silent-signal-frontend.vercel.app)**

> **Note on Architecture:** The frontend is fully live on Vercel. To ensure zero latency and full processing power for our heavy Computer Vision models (PyTorch, YOLOv8, OpenCV), the FastAPI biometric backend is currently configured to execute locally. 

---

## 🎯 The Mission
In a world where mental health struggles are often invisible, **Silent Signal** acts as an intelligent lifeline. We utilize a **Hybrid Neural Architecture** combining **Microsoft Azure AI** (Sensory) and **Google Gemini** (Reasoning) to move mental healthcare from "Reactive" to "Proactive."

---

## ✨ Core Ecosystem & Features

### 1. Neural Mesh (Live Analysis)
The central nervous system of the application. A glowing, animated Orb visualizes the user's real-time mental state.
* **Input:** Syncs seamlessly with the Biometric Scanner.
* **Output:** Dynamic UI color shifts (Blue for Calm, Red for Stress) based on live physiological data.

### 2. Biometric Resonance (rPPG Scanner)
Non-invasive, zero-touch diagnosis utilizing edge computer vision.
* **Technology:** Harnesses device cameras to detect micro-flushes in facial blood flow via Remote Photoplethysmography (rPPG) and YOLOv8 face detection.
* **Metrics:** Extracts **Heart Rate (BPM)** and **Respiration Rate** entirely without wearables.
* **Workflow:** Automatically triggers the "Dr. AI" consultation upon scan completion.

### 3. Dr. AI (Hybrid Intelligence)
A next-generation medical assistant powered by a highly optimized **Multi-Model Pipeline**:
* **Sense (Azure AI Language):** Analyzes sentiment and emotional tone to detect hidden distress markers.
* **Think (Google Gemini 1.5 Flash):** Generates medically grounded, context-aware CBT (Cognitive Behavioral Therapy) advice.
* **Speak (Azure AI Speech):** Converts text into a soothing, neural human voice for accessible, empathetic therapy.

### 4. Expert Care Loop (Telehealth)
Bridging the gap between artificial intelligence and human medical care.
* **Smart Booking:** AI autonomously recommends specialists (Psychiatrists, Neurologists) based on anxiety severity algorithms.
* **Seamless Flow:** Intuitive Date Selection -> Doctor Assignment -> Secure Payment Integration.

### 5. Wellness Pharmacy
An integrated e-commerce ecosystem dedicated to mental wellness.
* **Curated Store:** Targeted supplements (Ashwagandha, Magnesium) and mindfulness gear recommended based on the user's current condition.
* **Full Cart System:** Modern checkout flow with simulated payment gateways (UPI/Card).

### 6. Neuro-Nutrition Engine
Treating the mind through the body via data-driven dietetics.
* **Logic:** Analyzes biometric stress levels to dynamically generate meal plans.
* **Recommendation:** Suggests cortisol-lowering foods (e.g., Dark Chocolate, Avocados) mapped specifically to the user's real-time scan results.

### 7. Emergency SOS
* **Function:** Instantly activates a high-contrast emergency UI mode.
* **Dynamic QR:** Generates a live health code for first responders, allowing them to scan and view critical vitals without unlocking the device.

---

## 💻 Technical Architecture

### **Frontend (The Interface)**
* **Framework:** React.js (Vite)
* **Styling:** CSS Modules, high-end Glassmorphism aesthetics, fluid SVG Graphs, and CSS Animations.
* **Icons:** Lucide React

### **Backend (The Brain)**
* **Framework:** Python FastAPI
* **Computer Vision:** OpenCV Headless, Ultralytics (YOLOv8), PyTorch
* **Database:** SQLite with SQLAlchemy ORM
* **AI Integration:**
  * `google-generativeai` (Gemini 1.5 Flash)
  * `azure-ai-textanalytics` (Sentiment Analysis)
  * `azure-cognitiveservices-speech` (Text-to-Speech)

---

## 🚀 Getting Started (Local Development)

To run the full Hybrid Neural Architecture on your local machine:

**1. Clone the repository:**
```bash
git clone [https://github.com/Akj1002/silent-signal.git](https://github.com/Akj1002/silent-signal.git)
cd silent-signal

**2. Start the FastAPI Backend:**

Bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
3. Start the React Frontend:

Bash
cd ../frontend
npm install
npm run dev
🔮 Future Roadmap
Phase 2: Wearable Hardware Integration (Apple HealthKit / Google Fit API).

Phase 3: VR Sanctuary (Porting "Relief" environments to Oculus for immersive therapy).

Phase 4: Federated Learning (Training AI models directly on edge devices for 100% data privacy).
