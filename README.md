<h1 align="center">Hearth</h1>
<h2 align="center">(youCode 2026)</h2>

<h4 align="center">
  A multilingual communication tool for women's shelters that leaves no one behind.
</h4>

<p align="center">
  🏆 1st Place in the Community Women's Initiative (CWI) Experienced Stream<br>
  🥇 Diversity in CS Project Hub Winner
</p>

<p align="center">
  <img src="docs/images/hearth-logo.png" alt="Hearth logo" width="500"/>
</p>

<p align="center">
  <a href="https://devpost.com/software/hearth-pvngm3">Devpost</a>
</p>

<br>

## Table of Contents
- [Contributors](#contributors)
- [Problem Statement](#problem-statement)
- [Overview](#overview)
- [User Flow](#user-flow)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Technical Challenges](#technical-challenges)
- [Achievements](#achievements)
- [What We Learned](#what-we-learned)
- [Future Improvements](#future-improvements)
- [Getting Started](#getting-started)

<br>

## Contributors
- Jasmine Zou
- Jianding Bai
- Stephanie Xue
- Yuko Murayama

<br>

## Problem Statement

Emily and Jarny work at the front desk of The Bloom Group, a low-barrier women's shelter in Vancouver. When we called them, we expected to hear about challenges such as access to shelter housing, mental health counselling, or digital resources. Instead, the most immediate need they identified, and the first thing Emily mentioned when we asked what would make her job easier, was interpreters.

For women in shelters, communication is not just a matter of convenience. It is directly tied to safety and access to care. Many residents are navigating crisis situations such as domestic violence, housing instability, or displacement, often while managing emotional stress, trauma, or caring for children. In these moments, the ability to clearly express needs and understand available support is critical.

However, many women's shelters serve individuals from diverse linguistic and cultural backgrounds. Language barriers can make already difficult situations even more isolating. When communication breaks down, it affects everything from intake and safety planning to accessing resources and receiving emotional support.

Through our conversations with staff at The Bloom Group, we identified a clear and urgent need for a more reliable and accessible communication solution.

Shelter workers shared that:
- Language barriers are a daily challenge, especially among residents from diverse backgrounds, including refugees and immigrants
- Existing tools such as Google Translate are often unreliable in real-world scenarios
- Many languages, particularly African and Middle Eastern languages, are poorly supported
- Shelters often lack the resources to hire professional interpreters
- In some cases, staff are unable to identify which language a resident is speaking

<table align="center">
  <tr>
    <td align="center" width="50%">
      <img src="docs/images/limitations-existing-tools.jpg" alt="Limitations Of Existing Tools" width="80%"><br>
      <em>
        Google Translate output showing how inaccurate translations can distort meaning in sensitive or context-dependent conversations, leading to confusion and miscommunication.
      </em>
    </td>
    <td align="center" width="50%">
      <img src="docs/images/limited-language-support.png" alt="Limited Language Support" width="80%"><br>
      <em>
        Google Translate interface highlighting limited language options, which can exclude low-resource and underserved language communities.
      </em>
    </td>
  </tr>
</table>

Beyond our interviews, data reinforces the scale of the issue:
- Around 45% of women's shelter residents are non-native English speakers
- About 87% have low to medium digital literacy

These constraints mean that most existing solutions are not designed for real women's shelter environments. When communication fails, people may struggle to access women's shelter spaces and essential services, mental health support becomes harder to deliver, and residents can feel less safe, less understood, and less empowered.

<br>

## Overview

Most translation tools were built for the world's dominant languages. Hearth was built for the ones left out.

Hearth is a full-stack, local-first mobile communication tool designed for women's shelter workers and residents, built as a Progressive Web App with Next.js, React, TypeScript, and CSS on the frontend and FastAPI and Python on the backend. Speech is transcribed and its language detected locally using OpenAI's Whisper model, and that text is translated using Cohere's Tiny Aya models, a family of models optimized for low-resource languages such as Amharic, Hausa, and Swahili, accessed through the Hugging Face Inference API. Rather than acting as a one-way translator, Hearth functions as a low-friction communication layer that enables real-time, two-way conversations and supports connection, clarity, and understanding.

### Core Features
- Real-time communication from voice to text to translation to speech, supporting back-and-forth interaction
- Automatic language detection, allowing conversations to begin even when the spoken language is unknown
- Guided conversation prompts tailored to women's shelter environments, helping staff initiate and navigate sensitive or complex interactions
- Low-friction, intuitive interface designed for quick and easy use

### Designed for Safety and Privacy
- Speech-to-text and language detection run locally through Whisper, so no audio needs to leave the device for that step
- No account creation or personal data storage, reducing barriers and protecting user privacy
- Built for shared device use in low resource environments
- Harmful language detection with alert-based blocking and an SMS notification to staff, helping identify and respond to potentially unsafe interactions
- Local transcript storage with customizable retention settings to protect both residents and staff

A key design principle was minimizing dependency on external services wherever possible. Running speech recognition and language detection locally through Whisper keeps sensitive audio from ever leaving the device, while translation relies on Cohere's Tiny Aya models to ensure consistent support for underserved and low-resource languages that most translation tools handle poorly.

We also designed lightweight, intuitive UI flows that require zero to minimal training. By prioritizing simplicity and clarity, the system reduces cognitive load and avoids introducing additional barriers to communication.

### Beyond Translation: Thinking About Empowerment
- Enabling residents to communicate their needs, concerns, and experiences more clearly
- Supporting staff in asking more effective, context-aware questions
- Creating space for meaningful communication beyond simple information exchange

<br>

## User Flow

A conversation begins on the landing screen, where a staff member or resident opens the translation screen to start speaking or typing. Once a message is entered, Hearth converts spoken input into text, translates it into the other person’s language, and plays the translated speech, allowing the conversation to continue back and forth in real time. Users can also access the support screen for guided prompts, adjust the translation mode to better support the languages involved, and review saved exchanges in the conversation transcript. Harmful language detection runs in the background throughout each interaction, displaying an in-app alert and sending an SMS notification through Twilio when harmful content is detected to support de-escalation.

<p align="center">
  <img src="docs/screenshots/layout.png" alt="User flow layout" width="800"/>
</p>

<br>

## Features

### Landing Screen
Welcomes the user and provides a starting point for translated conversations, designed to be simple and intuitive for easy use.

<p align="center">
  <img src="docs/screenshots/landing.png" alt="Landing screen" height="500"/>
</p>

<br>

### Translation Screen
Enables real-time, two-way communication through a voice to text to translation to speech pipeline. Users can press and hold the voice input button to speak in any language, or use a keyboard option to type instead. The spoken language is automatically detected and processed without requiring any manual selection, and the translated text is displayed on screen with an option to play the translated audio aloud. Users can also select a translation mode, Auto, Earth, Fire, or Water, each optimized to support a different language group:
- **Auto**: Automatically selects the most appropriate model based on the detected language, providing a seamless experience without requiring manual selection
- **Earth**: Optimized for West Asian and African language groups, supporting languages with diverse scripts and linguistic variations
- **Fire**: Optimized for South Asian language groups, designed to better handle low-resource and underrepresented languages
- **Water**: Optimized for European and Asia-Pacific language groups, improving translation quality for languages with complex structures and dialects

<p align="center">
  <img src="docs/screenshots/translation.png" alt="Translation screen" height="500"/>
</p>

<br>

### Support Screen

Provides categorized prompts to help staff initiate and guide conversations in women's shelter environments, grouped into eight categories: conversation starters, comfort, needs, safety, wellbeing, family, health, and resources. Users select a language from a list in the top left before choosing a category, reducing friction when navigating sensitive or complex interactions. A language must be selected before a prompt can be used.


<p align="center">
  <img src="docs/screenshots/support.png" alt="Support screen" height="500"/>
</p>

<br>

### Prompt Screen
Displays a list of predefined prompts based on the selected category. Selecting a prompt translates it into the chosen language and plays the speech automatically.

<p align="center">
  <img src="docs/screenshots/prompt.png" alt="Prompt screen" height="500"/>
</p>

<br>

### Conversation Transcript
Stores conversation history locally in the browser rather than on an external server, with adjustable retention settings so staff and residents can control how long a transcript is kept.

<p align="center">
  <img src="docs/screenshots/transcript.png" alt="Transcript screen" height="500"/>
</p>

<br>

### Harmful Language Detection and Alert
Every translation is checked against a curated list of harmful keywords and phrases before it is delivered. If a match is found, the translation is blocked, an alert message is displayed to notify the user, and an SMS notification is sent to a configured phone number through Twilio to flag the interaction for follow-up and de-escalation.

<p align="center">
  <img src="docs/screenshots/harmful-language-detection.png" alt="Harmful language detection" height="500"/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="docs/screenshots/alert.png" alt="Alert screen" height="300"/>
</p>

<br>

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript, CSS, Progressive Web App (for accessible use across devices) |
| Backend | FastAPI, Python (enables efficient handling of real-time interactions) |
| APIs | Tiny Aya by Cohere via the Hugging Face Inference API (multilingual model optimized for low-resource languages with support for local deployment) |
| Libraries | OpenAI Whisper (runs locally for flexible multilingual speech-to-text and language detection),<br>Twilio (sends SMS alerts when harmful language is detected) |
| Storage | Local storage (stores conversation transcripts on-device) |

<br>

## How It Works

### Speech and Language Detection
When a resident speaks, the audio is sent to the backend, where a locally loaded Whisper model transcribes it and detects the spoken language in the same step, without the audio ever leaving the device. When a user types instead of speaking, no language is known yet, so this detection step is deferred to translation. The backend exposes separate endpoints for this speech processing step, for translating a resident's message into English, and for translating a worker's English response back into the resident's language, all running behind CORS settings that allow the frontend to reach them directly.

### Translation
The transcribed or typed text is sent to one of four Cohere Tiny Aya models, selected based on whichever translation mode, Auto, Earth, Fire, or Water, is currently active, through the Hugging Face Inference API, a third party cloud service rather than an on-device model. If the language was not already detected by Whisper, Aya is prompted to both detect the language and translate the text in the same request; if it was, Aya is only asked to translate. The prompt sent to the model is written to return only the translated text with no extra commentary, and the backend strips out any leftover labels the model occasionally still includes before sending the result back. The translated text is returned to the frontend, displayed on screen, and can be played aloud.

### Harmful Language Detection
Before any translation reaches the other person, the English version of the text, whether it is the resident's message translated to English or the worker's original English reply, is checked against a curated, keyword based list of harmful phrases using word boundary pattern matching, which helps avoid false positives such as matching "skill" as if it contained "kill." If a match is found, the translation is blocked from being delivered, the user is shown an alert, and the backend sends an SMS notification through Twilio to a configured phone number so staff can be made aware of the interaction.

### Guided Prompts
On the support screen, a user first selects a language from a list of over 20 options, then chooses a category such as Safety, Family, or Wellbeing to reveal a set of predefined prompts written for women's shelter conversations. Selecting a prompt sends it straight through the same translation pipeline used elsewhere in the app, so the phrase is translated into the resident's language and played aloud automatically, without the staff member needing to type or speak it themselves. A prompt cannot be selected until a language has been chosen first.

### Conversation Storage
Completed exchanges are saved as a transcript directly in the browser's local storage rather than on a server, sorted with the most recent conversation first, and users can adjust how long that transcript is retained.

<br>

## Technical Challenges

- Balancing privacy and functionality, since keeping speech recognition on-device while still relying on a cloud hosted translation model required being transparent about which parts of the pipeline are local and which are not
- Integrating multiple AI models for translation, language detection, speech-to-text, and text-to-speech into a cohesive real-time system
- Ensuring speech-to-text and text-to-speech performed reliably across diverse and low-resource languages
- Designing for low digital literacy, ensuring the interface remains intuitive and requires zero to minimal training

<br>

## Achievements

- Designed for real-world edge cases often overlooked by existing tools, including low digital literacy, limited context, and diverse language needs
- Made intentional product and technical decisions to ensure the solution is practical, accessible, and deployable in real women's shelter environments
- Integrated multiple AI components, including translation, language detection, speech-to-text, and text-to-speech, into a unified real-time experience
- Built a keyword based safety layer that blocks harmful content and notifies staff by SMS, adding a real-world safety mechanism beyond translation alone

<br>

## What We Learned

- The challenges faced by women in shelters extend beyond access to information and are shaped by communication, trust, and day-to-day constraints, which impact how they seek help, access services, and interact with staff
- Explored new technologies and AI models, including Tiny Aya by Cohere and Whisper by OpenAI, applying them within a real-world system to support multilingual communication
- Developed the ability to evaluate and combine AI models based on their strengths for translation, speech recognition, and multilingual support, ensuring they work effectively together
- Strengthened collaboration skills by integrating, debugging, and refining multiple AI components as a team

<br>

## Future Improvements
Several enhancements are planned to extend the functionality of the application:
- An ethics-focused study on deploying AI in sensitive, real-world environments
- Fine-tuning models with trauma-informed language, women's shelter-specific terminology, and improved handling of sensitive topics
- Expanding safety guardrails with a more context-aware approach to detecting harmful language, beyond keyword matching
- Support for code-switching to better reflect real-world multilingual communication
- New interaction modes, including one-to-many "townhall" and broadcast-style communication
- Continued testing directly with women's shelters like The Bloom Group to gather real user feedback
- Improved deployment in low-connectivity environments to ensure consistent and reliable performance

<br>

## Getting Started

Follow the steps below to set up and run the application on your own machine. This project requires both a frontend and a backend server running at the same time.

<br>

**Prerequisites**

Make sure Node.js, Python 3, and ffmpeg are installed before you begin. You can check the first two by running the commands below, which should print a version number.

> **Note:** On Windows, replace `python3` with `python` in the commands below.

```bash
node --version
python3 --version
```

ffmpeg can be installed with:
```bash
brew install ffmpeg
```

<br>

**1. Clone the repository**

This downloads a copy of the project to your computer and moves you into the project folder.
```bash
git clone https://github.com/steph-xue/hearth.git
cd hearth
```

**2. Set up environment variables**

Create a `.env` file inside the `backend` folder with your Hugging Face token.
```bash
HF_TOKEN=your_huggingface_token_here
```

**3. Set up the backend**

Create a virtual environment, install the dependencies, and start the backend server.
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**4. Set up the frontend**

In a new terminal, install the dependencies and start the frontend server.
```bash
cd frontend
npm install
npm run dev
```

Once both servers are running, open `http://localhost:3000` in your browser.

<br>

**Testing on a physical device (iOS)**

iOS Safari requires HTTPS for microphone access, so testing on an iPhone requires a secure tunnel through a tool like ngrok. The frontend proxies all backend calls through its own server (see `frontend/app/api/translate/`), so only the frontend needs to be tunneled — the backend stays local.
1. Install ngrok: `brew install ngrok`
2. Sign up at [ngrok.com](https://ngrok.com) and run `ngrok config add-authtoken YOUR_TOKEN`
3. Start a tunnel for the frontend only: `ngrok http 3000`
4. Open the frontend tunnel URL on your iPhone

Android devices do not require ngrok and can open `http://YOUR_LOCAL_IP:3000` directly.
