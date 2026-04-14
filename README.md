<h1 align="center">Hearth</h1>
<h2 align="center">(youCode 2026)</h2>

<h2 align="center">
  A multilingual communication tool that leaves no one behind.
</h2>

<br>

<p align="center">
  Devpost link: <a href="https://devpost.com/software/hearth-pvngm3">https://devpost.com/software/hearth-pvngm3</a>
</p>

<br>

<p align="center">
  <img src="frontend/public/screenshots/hearth-logo.png" alt="Hearth logo" width="500"/>
</p>

<br>

<h2 align="center">Awards</h2>
<h3 align="center">
  🏆 1st Place in the Community Women’s Initiative (CWI) Experienced Stream<br>
  🥇 Diversity in CS Project Hub Winner
</h3>

<br>

## Contributors
- Jasmine Zou
- Jianding Bai
- Yuko Murayama
- Stephanie Xue
  
<br>

## Inspiration
Emily and Jarny work at the front desk of The Bloom Group, a low-barrier women’s shelter in Vancouver. When we called them, we expected to hear about challenges such as access to shelter housing, mental health counselling, or digital resources. Instead, the most immediate need they identified, and the first thing Emily mentioned when we asked, “what would make your job easier?”, was interpreters.

For women in shelters, communication is not just a matter of convenience. It is directly tied to safety and access to care. Many residents are navigating crisis situations such as domestic violence, housing instability, or displacement, often while managing emotional stress, trauma, or caring for children. In these moments, the ability to clearly express needs and understand available support is critical.

However, many shelters serve individuals from diverse linguistic and cultural backgrounds. Language barriers can make already difficult situations even more isolating. When communication breaks down, it affects everything from intake and safety planning to accessing resources and receiving emotional support.

Through our conversations with staff at The Bloom Group, we identified a clear and urgent need for a more reliable and accessible communication solution. 

Shelter workers shared that:
- Language barriers are a daily challenge, especially among residents from diverse backgrounds, including refugees and immigrants
- Existing tools such as Google Translate are often unreliable in real-world scenarios
- Many languages, particularly African and Middle Eastern languages, are poorly supported
- Shelters often lack the resources to hire professional interpreters
- In some cases, staff are unable to identify which language a resident is speaking

<br>

<table align="center">
  <tr>
    <td align="center" width="50%">
      <img src="frontend/public/screenshots/limitations-existing-tools.jpg" alt="Limitations Of Existing Tools" width="100%"><br>
      <em>
        Google Translate output showing how inaccurate translations can distort meaning in sensitive or context-dependent conversations, leading to confusion and miscommunication.
      </em>
    </td>
    <td align="center" width="50%">
      <img src="frontend/public/screenshots/limited-language-support.png" alt="Limited Language Support" width="100%"><br>
      <em>
        Google Translate interface highlighting limited language options, which can exclude low-resource and underserved language communities.
      </em>
    </td>
  </tr>
</table>

<br>

Beyond our interviews, data reinforces the scale of the issue:
- Around 45% of shelter residents are non-native English speakers
- About 87% have low to medium digital literacy

These constraints mean that most existing solutions are not designed for real shelter environments. When communication fails, people may struggle to access shelter spaces and essential services, mental health support becomes harder to deliver, and residents can feel less safe, less understood, and less empowered.

<br>

## What It Does

Most translation tools were built for the world’s dominant languages. Hearth was built for the ones left out. 

Hearth is a privacy-first, on-device communication tool designed for shelter workers and residents. Powered by Tiny Aya by Cohere, a multilingual model optimized for low-resource languages such as Amharic, Tigrinya, and Somali, it goes beyond traditional translation. Rather than acting as a one-way translator, Hearth functions as a low-friction communication layer that enables real-time, two-way conversations and supports connection, clarity, and understanding.

### Core Features
- Real-time communication from voice → text → translation → speech, supporting back-and-forth interaction
- Automatic language detection, allowing conversations to begin even when the spoken language is unknown  
- Guided conversation prompts to help staff initiate and navigate sensitive or complex interactions 
- Low-friction, intuitive interface designed for quick and easy use 

### Designed For Safety And Privacy
- No reliance on third-party translation APIs, keeping all communication local and secure 
- No account creation or personal data storage, reducing barriers and protecting user privacy  
- Built for shared device use in low resource environments
- Harmful language detection with alert-based blocking to help identify and respond to potentially unsafe interactions  
- Local transcript storage with customizable retention settings to protect both residents and staff

### And Beyond Translation, We’re thinking About Empowerment:
- Enabling residents to communicate their needs, concerns, and experiences more clearly
- Supporting staff in asking more effective, context-aware questions
- Creating space for meaningful communication beyond simple information exchange

<br>

## User Flow
<p align="center">
  <img src="frontend/public/screenshots/layout.png" alt="User flow layout" width="800"/>
</p>

<br>

## Features

### Landing Screen
- Welcomes the user and provides a starting point for translated conversations
- Designed to be simple and intuitive for easy use
  
<p align="center">
  <img src="frontend/public/screenshots/landing.png" alt="Landing screen" height="500"/>
</p>


### Translation Screen
- Enables real-time, two-way communication through voice → text → translation → speech
- Allows users to press and hold the voice input button to speak in any language
- Automatically detects the spoken language and processes it without requiring any manual selection
- Displays the translated text on screen and allows users to play the translated audio 
- Provides a keyboard option that allows users to input text in any language
- Allows users to select translation modes such as Auto, Earth, Fire, and Water, each designed to support different language groups

<p align="center">
  <img src="frontend/public/screenshots/translation.png" alt="Translation screen" height="500"/>
</p>

### Translation Modes
- Hearth provides multiple translation modes designed to better support different language groups and use cases:
  - **Auto**: Automatically selects the most appropriate model based on the detected language, providing a seamless experience without requiring manual selection  
  - **Fire**: Optimized for African language groups, designed to better handle low-resource and underrepresented languages  
  - **Water**: Optimized for Middle Eastern language groups, improving translation quality for languages with complex structures and dialects  
  - **Earth**: Optimized for South Asian language groups, supporting languages with diverse scripts and linguistic variations   

<br>

### Support Screen
- Provides categorized prompts to help initiate and guide conversations in shelter environments  
- Users can select a language from the top left before choosing a category  
- Designed to reduce friction when navigating sensitive or complex interactions  

<p align="center">
  <img src="frontend/public/screenshots/support.png" alt="Support screen" height="500"/>
</p>


### Prompt Screen
- Displays a list of predefined prompts based on the selected category  
- Selecting a prompt translates it into the chosen language and plays the speech automatically 

<p align="center">
  <img src="frontend/public/screenshots/prompt.png" alt="Prompt screen" height="500"/>
</p>

### Harmful Language Detection and Alert
- Detects harmful or aggressive language during interactions  
- Blocks unsafe translations to prevent escalation or miscommunication  
- Displays an alert message to notify users when such content is detected  

<p align="center">
  <img src="frontend/public/screenshots/harmful-language-detection.png" alt="Harmful language detection" height="500"/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="frontend/public/screenshots/alert.png" alt="Alert screen" height="500"/>
</p>


### Conversation Transcript
- Stores conversation history locally on the device  
- Supports adjustable retention settings for privacy and safety  
- Ensures sensitive communication is preserved securely without external storage  

<p align="center">
  <img src="frontend/public/screenshots/transcript.png" alt="Transcript screen" height="500"/>
</p>

<br>

## How We Built It
We made deliberate technical decisions to align with the realities of shelter environments, where privacy, accessibility, and reliability are essential.

### Tech Stack
- **Frontend:** Next.js and TypeScript, built as a Progressive Web App (PWA) for accessible, low-friction use across devices  
- **Backend:** Python and FastAPI, enabling efficient handling of real-time interactions  
- **Translation:** Tiny Aya by Cohere, a multilingual model optimized for low-resource languages with support for local deployment  
- **Speech & Language Detection:** Whisper by OpenAI, enabling accurate and flexible multilingual voice input  

A key design principle was eliminating dependency on external services for core functionality. By keeping all processing on-device, Hearth protects sensitive conversations, maintains reliability in low-connectivity environments, and ensures consistent support for underserved and low-resource languages.

We also designed lightweight, intuitive UI flows that require zero to minimal training. By prioritizing simplicity and clarity, the system reduces cognitive load and avoids introducing additional barriers to communication.

<br>

## Challenges We Ran Into
- Balancing privacy and functionality by keeping all processing on-device while maintaining reliable performance 
- Integrating multiple AI models for translation, language detection, speech-to-text, and text-to-speech features into a cohesive real-time system 
- Ensuring speech-to-text and text-to-speech systems perform reliably across diverse and low-resource languages 
- Designing for low digital literacy, ensuring the interface remains intuitive and requires zero to minimal training 

<br>

## Accomplishments That We're Proud Of
- Built a fully privacy-conscious, on-device communication system without relying on third-party APIs  
- Designed for real-world edge cases often overlooked by existing tools, including low digital literacy, limited context, and diverse language needs  
- Made intentional product and technical decisions to ensure the solution is practical, accessible, and deployable in real shelter environments  
- Integrated multiple AI components, including translation, language detection, speech-to-text, and text-to-speech, into a unified real-time experience    

<br>

## What We Learned
- The challenges faced by women in shelters extend beyond access to information and are shaped by communication, trust, and day-to-day constraints, which impact how they seek help, access services, and interact with staff  
- Explored new technologies and AI models, including Tiny Aya by Cohere and Whisper by OpenAI, applying them within a real-world system to support multilingual communication 
- Developed the ability to evaluate and combine AI models based on their strengths for translation, speech recognition, and multilingual support, ensuring they work effectively together 
- Strengthened collaboration skills by integrating, debugging, and refining multiple AI components as a team  

<br>

## What’s Next For Hearth
- Conduct an ethics-focused study on deploying AI in sensitive, real-world environments  
- Fine-tune models with trauma-informed language, shelter-specific terminology, and improved handling of sensitive topics to better reflect real-world conversations
- Expand safety guardrails to better detect and respond to harmful language in a responsible and context-aware manner  
- Add support for code-switching to reflect real-world multilingual communication  
- Explore new interaction modes, including one-to-many “townhall” and broadcast-style communication  
- Continue testing directly with shelters like The Bloom Group to gather real user feedback  
- Improve deployment in low-connectivity environments to ensure consistent and reliable performance  

<br>

## Running Locally

### Prerequisites

- Python 3.9+
- Node.js 18+
- ffmpeg (`brew install ffmpeg`)

### First-Time Setup

#### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### After Pulling Latest Main

```bash
git pull origin main

# Backend — install any new dependencies
cd backend
source .venv/bin/activate
pip install -r requirements.txt

# Frontend — install any new dependencies
cd ../frontend
npm install
```

Then restart both servers as usual.

### Testing on a Physical Device (iOS)

iOS Safari requires HTTPS for microphone access. Use ngrok to create a secure tunnel:

1. Install ngrok: `brew install ngrok`
2. Sign up at [ngrok.com](https://ngrok.com) and run `ngrok config add-authtoken YOUR_TOKEN`
3. Start tunnels: `ngrok start --all --config ~/ngrok-hearth.yml`
4. Create `frontend/.env.local`:
   `NEXT_PUBLIC_BACKEND_URL=https://your-backend-tunnel.ngrok-free.app`

5. Open the frontend tunnel URL on your iPhone

> **Android users:** No ngrok needed — open `http://YOUR_LOCAL_IP:3000` directly.
