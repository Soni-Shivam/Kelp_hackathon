# PLEK AI - Private Layer & External Knowledge

> A hybrid intelligence engine that fuses Private Layer financials with External Knowledge to autonomously generate anonymized, fully editable 3-slide investment teasers.

## Overview

PLEK AI is an advanced multi-agent system designed for M&A professionals and investment analysts. It automatically generates consulting-grade pitch decks by combining:

- **Private Layer**: Confidential company financials and proprietary data
- **External Knowledge**: Public market data, industry benchmarks, and web research


[Presentation](<https://www.canva.com/design/DAHDaCSpEdw/fS_uLfxG0c_sRNalbWu0lA/edit>)

The system orchestrates three specialized AI agents to produce pixel-perfect, McKinsey-style presentations in under 2 minutes.


![1](https://github.com/user-attachments/assets/6d867901-431d-4d3e-8f04-b7cf9ebbc672)

![2](https://github.com/user-attachments/assets/889e3ffb-e247-4747-b492-7b3037861b67)

<img width="1920" height="923" alt="Screenshot from 2026-02-07 15-40-57" src="https://github.com/user-attachments/assets/8ae8e42f-8a9c-46e5-836e-9f973bda4989" />


<img width="1920" height="923" alt="Screenshot from 2026-02-07 15-40-54" src="https://github.com/user-attachments/assets/d235dcf6-f84d-4b97-8891-460d20f0e969" />


<img width="1920" height="923" alt="Screenshot from 2026-02-07 15-40-50" src="https://github.com/user-attachments/assets/5c5afae4-016a-4621-97b9-3ed038996596" />


## Architecture
<img width="2560" height="1720" alt="all" src="https://github.com/user-attachments/assets/e35e3250-89ef-47d0-b860-805dcb82b4cd" />

## Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm
- **Google API Keys**:
  - Gemini API key (for LLM)
  - Custom Search API key
  - Search Engine ID

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kelp-hackathon
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit .env and add your API keys:
   GOOGLE_API_KEY=your_gemini_api_key

   Key and a Search Engine ID.
   Step 1: Get your Credentials
   API Key: Go to the Google Cloud Console, create a new project, enable the "Custom Search API", and create an API Key = SEARCH_API_KEY

   Step 2: Search Engine ID (CX): Go to Programmable Search Engine, create a new search engine, enable "Image search" in the settings, and copy the "Search engine ID" (often called     cx)=SEARCH_ENGINE_ID
   SEARCH_API_KEY = your_custom_search_key
   SEARCH_ENGINE_ID = your_search_engine_id
   

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install frontend dependencies**
   ```bash
   cd presentationBuilder
   npm install
   cd ..
   ```

### Running the Application

**Terminal 1: Data Agent**
```bash
uvicorn dataAgent.src.api:app --reload --port 8000
```

**Terminal 2: Transcriber Agent**
```bash
uvicorn transcriberAgent.src.api:app --reload --port 8001
```

**Terminal 3: Image Agent**
```bash
uvicorn imageAgent.src.api:app --reload --port 8002
```

**Terminal 4: Frontend**
```bash
cd presentationBuilder
npm run dev
```

Access the application at: **http://localhost:3000**

## Usage

1. **Enter Company Information**
   - Company name (e.g., "Kalyani Forge Ltd")
   - Upload or paste company OnePager (Markdown format)

2. **Generate Presentation**
   - Click "Generate Investment Teaser"
   - Wait ~2 minutes for agent orchestration

3. **Edit & Export**
   - Review and edit slides in the interactive editor
   - Export to PPTX format
   - Generate citations document
     
## Features

### Multi-Agent System
- **Data Agent**: Ingests private markdown files and scrapes public data
- **Transcriber Agent**: Uses Gemini to generate structured slide content
- **Image Agent**: Fetches relevant images via Google Custom Search or generates with Google Nano Banana

### Rich Content Blocks
- **Text Deep Dive**: Bullet points with markdown support
- **Dashboard Grid**: Key metrics in card layout
- **Chart Complex**: Bar, line, doughnut, stacked charts
- **Visual Map**: Image blocks with search/generation
- **Logo Grid**: Partner/client showcase
- **Composite**: Mixed content layouts

### PPTX Export
- Pixel-perfect PowerPoint generation
- Base64 image embedding (no external dependencies)
- Custom fonts and brand colors
- Fallback handling for missing assets

