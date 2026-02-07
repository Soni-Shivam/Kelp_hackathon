# PLEK AI - Private Layer & External Knowledge

![PLEK AI](https://img.shields.io/badge/PLEK-AI-8B5CF6?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

> A hybrid intelligence engine that fuses Private Layer financials with External Knowledge to autonomously generate anonymized, fully editable 3-slide investment teasers.

## 🎯 Overview

PLEK AI is an advanced multi-agent system designed for M&A professionals and investment analysts. It automatically generates consulting-grade pitch decks by combining:

- **Private Layer**: Confidential company financials and proprietary data
- **External Knowledge**: Public market data, industry benchmarks, and web research

The system orchestrates three specialized AI agents to produce pixel-perfect, McKinsey-style presentations in under 2 minutes.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│              presentationBuilder/                            │
│  • Interactive slide editor with real-time preview          │
│  • PPTX export with base64 image embedding                  │
│  • Particle network background animations                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Agent Orchestration Layer                   │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Data Agent    │ Transcriber     │    Image Agent          │
│   (Port 8000)   │   Agent         │    (Port 8002)          │
│                 │ (Port 8001)     │                         │
│ • Private MD    │ • LLM-based     │ • Google Custom Search  │
│   parsing       │   slide gen     │ • Imagen 3 generation   │
│ • Public data   │ • Layout engine │ • Fallback handling     │
│   scraping      │ • JSON schema   │                         │
│ • Data merging  │   validation    │                         │
└─────────────────┴─────────────────┴─────────────────────────┘
```

## 🚀 Quick Start

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
   # Edit .env and add your API keys:
   # GOOGLE_API_KEY=your_gemini_api_key

   Key and a Search Engine ID.

Step 1: Get your Credentials
API Key: Go to the Google Cloud Console, create a new project, enable the "Custom Search API", and create an API Key = SEARCH_API_KEY

Search Engine ID (CX): Go to Programmable Search Engine, create a new search engine, enable "Image search" in the settings, and copy the "Search engine ID" (often called cx)=SEARCH_ENGINE_ID
   # SEARCH_API_KEY=your_custom_search_key
   # SEARCH_ENGINE_ID=your_search_engine_id
   ```

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

## 📋 Usage

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

## 🧩 Project Structure

```
kelp-hackathon/
├── dataAgent/              # Data ingestion & processing
│   ├── src/
│   │   ├── private_agent/  # Private data parser
│   │   ├── public_agent/   # Web scraping & search
│   │   └── merge_agent/    # Data consolidation
│   └── data/               # Input/output storage
│
├── transcriberAgent/       # Presentation generation
│   ├── src/
│   │   └── api.py          # FastAPI endpoints
│   ├── kelp_agent.py       # LLM orchestration
│   └── static/images/      # Image storage
│
├── imageAgent/             # Image fetching & generation
│   ├── src/
│   │   ├── handler.py      # Image processing logic
│   │   └── api.py          # Image service API
│   ├── downloaded_images/  # Search results
│   └── generated_images/   # AI-generated images
│
└── presentationBuilder/    # Next.js frontend
    ├── src/
    │   ├── app/            # Pages & routing
    │   ├── components/     # React components
    │   ├── lib/            # Utilities & engines
    │   │   ├── layout-engine.ts
    │   │   ├── pptx-utils.ts
    │   │   └── design-system.ts
    │   └── types/          # TypeScript definitions
    └── public/             # Static assets
```

## 🎨 Features

### Multi-Agent System
- **Data Agent**: Ingests private markdown files and scrapes public data
- **Transcriber Agent**: Uses Gemini 2.0 to generate structured slide content
- **Image Agent**: Fetches relevant images via Google Custom Search or generates with Imagen 3

### Intelligent Layout Engine
- Automatic space allocation across slides
- Dynamic block sizing and positioning
- Responsive grid system for metrics and charts

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

### UI/UX Enhancements
- Particle network background with constant animation
- Glassmorphism design elements
- Real-time slide preview
- Drag-and-drop file upload

## 🔧 Configuration

### Design System
Edit `presentationBuilder/src/lib/design-system.ts`:
- Colors: Brand palette (Kelp Purple, Accent Gradients)
- Typography: Font sizes, weights, spacing
- Layout: Slide dimensions, padding, gaps

### LLM Prompts
Modify `transcriberAgent/kelp_agent.py`:
- System prompts for slide generation
- JSON schema validation rules
- Retry logic and fallback strategies

### Image Fallbacks
When API quotas are exceeded, the system uses:
```
transcriberAgent/static/images/abstract_financial_growth_blue_and_silver_8k_0.jpg
```

## 🐛 Troubleshooting

### Images Not Loading
- **Issue**: `xhr.onerror` when exporting PPTX
- **Solution**: Images are now converted to base64 automatically
- **Fallback**: System uses placeholder image if APIs fail

### API Quota Exceeded
- **Google Custom Search**: 100 queries/day limit
- **Generative Language API**: Enable in Google Cloud Console
- **Workaround**: Fallback images are used automatically

### Module Import Errors
- Ensure all agents use **relative imports** (`from .module import`)
- Run from project root: `uvicorn dataAgent.src.api:app`

## 📊 Performance

- **Generation Time**: ~90-120 seconds
- **Slide Count**: 3 slides (configurable)
- **Image Processing**: Parallel fetching with fallbacks
- **PPTX Size**: ~2-5 MB (with embedded images)

## 🔐 Security & Privacy

- Private company data never leaves local environment
- API keys stored in `.env` (gitignored)
- Anonymization of sensitive financial data
- CORS protection on all API endpoints

## 🛣️ Roadmap

- [ ] Multi-language support
- [ ] Custom brand theme editor
- [ ] Real-time collaboration
- [ ] Cloud deployment (AWS/GCP)
- [ ] Advanced chart types (waterfall, Gantt)
- [ ] PDF export option

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- **Gemini 2.0 Flash** for LLM capabilities
- **pptxgenjs** for PowerPoint generation
- **Next.js** for frontend framework
- **FastAPI** for backend services


