# 🧠 Silent Signal: The Agentic Neural Mesh for Mental Health

![Status](https://img.shields.io/badge/Status-MVP%20Ready-success) ![Tech](https://img.shields.io/badge/Stack-MERN%20%2B%20FastAPI-blue) ![AI](https://img.shields.io/badge/AI-Azure%20%2B%20Gemini-purple)

> *"Silence is not empty; it is full of answers."*

**Silent Signal** is a hyper-personalized mental health ecosystem designed to bridge the gap between biological signals and psychological support. Unlike passive chatbots, our platform is **Agentic**—it actively senses distress through real-time biometrics and intervenes before a crisis occurs.

---

## The Mission
In a world where mental health struggles are often invisible, **Silent Signal** acts as an intelligent lifeline. We utilize a **Hybrid Neural Architecture** combining **Microsoft Azure AI** (Sensory) and **Google Gemini** (Reasoning) to move mental healthcare from "Reactive" to "Proactive."

---

##  Core Features

### 1. Neural Mesh (Live Analysis)
The central nervous system of the app. A glowing, animated Orb visualizes the user's real-time mental state.
 **Input:** Syncs with the Biometric Scanner.
 **Output:** Dynamic color shifts (Blue for Calm, Red for Stress) based on live heart rate data.

### 2. Biometric Resonance (rPPG Scanner)
Non-invasive diagnosis using computer vision.
 **Technology:** Uses the device camera to detect micro-flushes in facial blood flow (Remote Photoplethysmography).
 **Metrics:** Extracts **Heart Rate (BPM)** and **Respiration Rate** without wearables.
 **Workflow:** Auto-triggers the "Dr. AI" consultation upon scan completion.

### 3. Dr. AI (Hybrid Intelligence)
A next-generation medical assistant powered by a **Multi-Model Pipeline**:
 **Sense (Azure AI Language):** Analyzes sentiment and emotional tone to detect hidden distress.
 **Think (Google Gemini 1.5 Flash):** Generates medically grounded, context-aware CBT advice.
 **Speak (Azure AI Speech):** Converts text into a soothing, neural human voice for accessible therapy.

### 4. Expert Care Loop (Telehealth)
Bridging the gap between AI and human care.
 **Smart Booking:** AI recommends specialists (Psychiatrists, Neurologists) based on anxiety severity.
 **Seamless Flow:** Select Date -> Choose Doctor -> Secure Payment Integration.

### 5. Wellness Pharmacy
An integrated e-commerce ecosystem for mental wellness.
 **Curated Store:** Supplements (Ashwagandha, Magnesium) and gear (Yoga mats) tailored to the user's condition.
 **Full Cart System:** Add to cart, review order, and checkout with simulated payment gateways (UPI/Card).

### 6. Neuro-Nutrition Engine
Treating the mind through the body.
 **Logic:** Analyzes stress levels to generate meal plans.
 **Recommendation:** Suggests cortisol-lowering foods (e.g., Dark Chocolate, Avocados) specific to the user's scan results.

### 7. Emergency SOS
 **Function:** Activates a high-contrast emergency mode.
 **Dynamic QR:** Generates a live health code for first responders to scan and view vitals without unlocking the phone.

---

## Technical Architecture

### **Frontend (The Body)**
* **Framework:** React.js (Vite)
* **Styling:** CSS Modules with Glassmorphism & Pastel UI
* **Visualization:** SVG Graphs & CSS Animations
* **Icons:** Lucide React

### **Backend (The Brain)**
* **Framework:** Python FastAPI
* **Database:** SQLite (SQLAlchemy ORM)
* **AI Integration:**
    * `google-generativeai` (Gemini 1.5 Flash / 2.0 Flash)
    * `azure-ai-textanalytics` (Sentiment Analysis)
    * `azure-cognitiveservices-speech` (Text-to-Speech)

---

## Future Roadmap
* **Phase 2:** Wearable Integration (Apple HealthKit / Google Fit API).
* **Phase 3:** VR Sanctuary (Porting "Relief" to Oculus for immersive therapy).
* **Phase 4:** Federated Learning (Training AI models locally for 100% privacy).
