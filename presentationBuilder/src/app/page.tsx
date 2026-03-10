'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePresentationStore } from '@/lib/store/presentation-store';
import { Sparkles, ArrowRight, Loader2, Code2, X, FileText, Terminal } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

// ============================================
// PARTICLE NETWORK BACKGROUND - WITH CONSTANT ANIMATION
// Adapted for White/Light Background
// ============================================
const ParticleNetwork = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const particlesRef = useRef<any[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Enhanced Particle class with autonomous movement
        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            radius: number;
            baseDrift: { x: number; y: number };

            constructor() {
                this.x = 0;
                this.y = 0;
                this.vx = 0;
                this.vy = 0;
                this.radius = 0;
                this.baseDrift = { x: 0, y: 0 };
                this.reset();
                this.y = Math.random() * canvas!.height;
                // Base drift for constant animation
                this.baseDrift = {
                    x: (Math.random() - 0.5) * 0.2,
                    y: (Math.random() - 0.5) * 0.2
                };
            }

            reset() {
                if (!canvas) return;
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = Math.random() * 2 + 1;
            }

            update() {
                if (!canvas) return;
                // Apply constant drift for autonomous animation
                this.vx += this.baseDrift.x * 0.01;
                this.vy += this.baseDrift.y * 0.01;

                // Update position
                this.x += this.vx;
                this.y += this.vy;

                // Mouse interaction (flee behavior)
                const dx = mouseRef.current.x - this.x;
                const dy = mouseRef.current.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    const angle = Math.atan2(dy, dx);
                    const force = (120 - dist) / 120;
                    this.vx -= Math.cos(angle) * force * 0.6;
                    this.vy -= Math.sin(angle) * force * 0.6;
                }

                // Velocity limiting
                const maxSpeed = 2;
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > maxSpeed) {
                    this.vx = (this.vx / speed) * maxSpeed;
                    this.vy = (this.vy / speed) * maxSpeed;
                }

                // Gentle damping
                this.vx *= 0.98;
                this.vy *= 0.98;

                // Boundary wrap with smooth transition
                if (this.x < -10) this.x = canvas.width + 10;
                if (this.x > canvas.width + 10) this.x = -10;
                if (this.y < -10) this.y = canvas.height + 10;
                if (this.y > canvas.height + 10) this.y = -10;
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                // Use a darker color for visibility on white background
                ctx.fillStyle = 'rgba(59, 130, 246, 0.6)'; // Blue-500 equivalent with opacity
                ctx.fill();
            }
        }

        // Initialize particles
        particlesRef.current = Array.from({ length: 100 }, () => new Particle());

        // Animation loop
        const animate = () => {
            // Check canvas dimensions again to be safe
            if (canvas.width === 0 || canvas.height === 0) {
                animationId = requestAnimationFrame(animate);
                return;
            }

            // Clear with white/transparent instead of dark
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Optional: minimal faint background if needed, but transparent matches "white app"
            // ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; 
            // ctx.fillRect(0, 0, canvas.width, canvas.height);

            const particles = particlesRef.current;

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        ctx.beginPath();
                        // Connection color: Violet/Purple to match Kelp accent
                        ctx.strokeStyle = `rgba(139, 92, 246, ${(1 - dist / 150) * 0.25})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            animationId = requestAnimationFrame(animate);
        };
        animate();

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
        };
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 0 }} // Behind content
        />
    );
};

// Custom Cursor removed per user request

export default function DashboardPage() {
    const router = useRouter();
    const [companyInput, setCompanyInput] = useState('');
    const [mdContent, setMdContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStatus, setGenerationStatus] = useState('');
    const [showDevMode, setShowDevMode] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [logs, setLogs] = useState<{ id: number; text: string; type: 'info' | 'success' | 'warn' | 'step' }[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);
    const logIdRef = useRef(0);
    const { showToast } = useToast();

    // Auto-scroll logs to bottom
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const pushLog = (text: string, type: 'info' | 'success' | 'warn' | 'step' = 'info') => {
        const id = ++logIdRef.current;
        setLogs(prev => [...prev, { id, text, type }]);
    };

    const {
        setPresentation,
        startLoading,
        finishLoading
    } = usePresentationStore();

    const handleGenerate = async () => {
        if (!companyInput.trim() || !mdContent.trim()) {
            showToast('Please provide both Company Name and OnePager Content', 'error');
            return;
        }

        setIsGenerating(true);
        setLogs([]);
        startLoading();

        pushLog(`Booting PLEK AI for "${companyInput}"...`, 'step');
        pushLog('Initializing multi-agent pipeline...', 'info');

        try {
            // Step 1: Data Agent
            setGenerationStatus('Data Agent');
            pushLog('', 'info');
            pushLog('[AGENT 1 / 3] ► DATA AGENT', 'step');
            pushLog('  → Parsing Company OnePager Markdown...', 'info');
            pushLog('  → Extracting private data sections (business, SWOT, milestones, financials)...', 'info');

            const dataResponse = await fetch('http://localhost:8000/trigger-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company_name: companyInput,
                    md_content: mdContent
                })
            });

            if (!dataResponse.ok) throw new Error('Data Agent Failed');
            const apiData = await dataResponse.json();

            pushLog('  → Running Public Data Agent (Screener scrape)...', 'info');
            pushLog('  → Merging private + public into unified canonical...', 'info');
            pushLog(`  ✔ Data pipeline complete. Run ID: ${apiData.run_id || 'N/A'}`, 'success');

            // Step 2: Transcriber Agent — streamed NDJSON
            setGenerationStatus('Transcriber Agent');
            pushLog('', 'info');
            pushLog('[AGENT 2/3] ► TRANSCRIBER + IMAGE AGENT (LLM)', 'step');
            pushLog('  → Connecting to transcriber stream...', 'info');

            const transcriberResponse = await fetch('http://localhost:8001/generate_from_data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiData)
            });

            if (!transcriberResponse.ok) throw new Error('Transcriber Agent Failed');
            if (!transcriberResponse.body) throw new Error('No response stream');

            const reader = transcriberResponse.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let presentationJson: any = null;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? ''; // keep incomplete line in buffer

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const msg = JSON.parse(line);
                        if (msg.type === 'log') {
                            const level =
                                msg.level === 'success' ? 'success' :
                                    msg.level === 'warn' ? 'warn' :
                                        msg.level === 'step' ? 'step' :
                                            'info';
                            pushLog(msg.text, level);
                            // Update agent label in titlebar based on step markers
                            if (msg.text.includes('LLM GENERATION')) setGenerationStatus('LLM Generation');
                            if (msg.text.includes('IMAGE ENRICHMENT')) setGenerationStatus('Image Agent');
                            if (msg.text.includes('GENERATIVE MODE') || msg.text.includes('SEARCH MODE') || msg.text.includes('Fetching logo')) {
                                setGenerationStatus('Image Agent');
                            }
                        } else if (msg.type === 'result') {
                            presentationJson = msg.data;
                        } else if (msg.type === 'error') {
                            throw new Error(msg.detail);
                        }
                    } catch (parseErr) {
                        // Skip unparseable lines silently
                    }
                }
            }

            if (!presentationJson || !presentationJson.slides) {
                throw new Error('Invalid format received from agent');
            }

            const slideCount = presentationJson.slides.length;
            const blockCount = presentationJson.slides.reduce((acc: number, s: any) => acc + s.blocks.length, 0);
            pushLog(`  ✔ Pipeline complete — ${slideCount} slides, ${blockCount} blocks.`, 'success');

            pushLog('', 'info');
            pushLog('✅ PLEK AI pipeline complete. Redirecting to outline...', 'success');

            setPresentation(presentationJson);
            showToast('Presentation Generated Successfully!', 'success');
            finishLoading();

            // Short delay so user can read final log
            await new Promise(r => setTimeout(r, 900));
            router.push('/outline');

        } catch (error: any) {
            console.error(error);
            pushLog(`❌ ERROR: ${error.message || error}`, 'warn');
            showToast(`Generation Failed: ${error.message || error}`, 'error');
            setIsGenerating(false);
            finishLoading();
        }
    };

    const handleDevModeSubmit = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (!parsed.project_code_name || !parsed.slides || !Array.isArray(parsed.slides)) {
                throw new Error('Invalid presentation format.');
            }
            setPresentation(parsed);
            showToast('Presentation loaded successfully!', 'success');
            router.push('/outline');
        } catch (error: any) {
            showToast(`Invalid JSON: ${error.message}`, 'error');
        }
    };

    return (
        <div className="min-h-screen bg-kelp-bg-app flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Background Animations */}
            <ParticleNetwork />

            <div className="w-full max-w-4xl text-center space-y-8 z-10 relative">

                {/* Hero Header */}
                <div className="space-y-6">
                    <div className="inline-flex items-center justify-center p-3 bg-white/80 backdrop-blur-md rounded-full shadow-sm mb-4 border border-slate-100">
                        <Sparkles className="h-6 w-6 text-kelp-accent-start mr-2" />
                        <span className="font-bold text-kelp-primary tracking-widest uppercase">KELP INTELLIGENCE</span>
                    </div>

                    <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-kelp-primary via-kelp-accent-start to-kelp-accent-end tracking-tight pb-2">
                        PLEK AI
                    </h1>
                    <p className="text-2xl font-medium text-slate-700 max-w-2xl mx-auto">
                        PLEK (Private Layer & External Knowledge)
                    </p>
                    <p className="text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed">
                        A hybrid intelligence engine that fuses Private Layer data with External Knowledge to autonomously generate anonymized, fully editable 3-slide investment teasers.
                    </p>
                </div>

                {/* Dev Mode Modal */}
                {showDevMode && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                            <div className="flex items-center justify-between p-4 border-b border-slate-200">
                                <div className="flex items-center gap-2">
                                    <Code2 className="h-5 w-5 text-kelp-accent-start" />
                                    <h2 className="font-bold text-lg text-slate-800">Dev Mode: JSON Input</h2>
                                </div>
                                <button onClick={() => setShowDevMode(false)} className="p-1 hover:bg-slate-100 rounded-md">
                                    <X className="h-5 w-5 text-slate-500" />
                                </button>
                            </div>
                            <div className="p-4 flex-1 overflow-hidden">
                                <textarea
                                    className="w-full h-64 p-3 border border-slate-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-kelp-accent-start/50"
                                    placeholder='{"project_code_name": "My Project", ...}'
                                    value={jsonInput}
                                    onChange={(e) => setJsonInput(e.target.value)}
                                />
                            </div>
                            <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowDevMode(false)}>Cancel</Button>
                                <Button variant="gradient" onClick={handleDevModeSubmit} disabled={!jsonInput.trim()}>
                                    Load Presentation <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Input & Action */}
                {!isGenerating ? (
                    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50 max-w-2xl mx-auto space-y-6 text-left transition-all hover:shadow-2xl">

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Company Name (as titled on Screener)</label>
                            <Input
                                placeholder="e.g. Kalyani Forge Ltd"
                                className="h-14 text-lg bg-white/50"
                                value={companyInput}
                                onChange={(e) => setCompanyInput(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center justify-between">
                                <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> Company OnePager (Markdown)</span>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".md,.txt"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (e) => {
                                                    const text = e.target?.result;
                                                    if (typeof text === 'string') {
                                                        setMdContent(text);
                                                        showToast('File uploaded successfully!', 'success');
                                                    }
                                                };
                                                reader.readAsText(file);
                                            }
                                        }}
                                    />
                                    <Button variant="outline" size="sm" type="button" className="text-xs h-7">
                                        Upload File
                                    </Button>
                                </div>
                            </label>
                            <textarea
                                className="w-full min-h-[150px] p-4 border border-slate-200 rounded-lg text-sm bg-white/50 ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kelp-accent-start/50 resize-y"
                                placeholder="# Company Overview..."
                                value={mdContent}
                                onChange={(e) => setMdContent(e.target.value)}
                            />
                        </div>

                        <Button
                            size="lg"
                            variant="gradient"
                            className="w-full h-14 font-bold text-lg mt-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                            onClick={handleGenerate}
                            disabled={!companyInput.trim() || !mdContent.trim()}
                        >
                            <Sparkles className="mr-2 h-5 w-5" />
                            Generate Investment Teaser
                        </Button>
                    </div>
                ) : (
                    // ── LIVE LOG PANEL (light theme) ──
                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-slate-200 max-w-2xl mx-auto w-full font-mono text-sm">
                        {/* Panel titlebar */}
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                            <div className="p-1.5 bg-gradient-to-br from-kelp-accent-start to-kelp-accent-end rounded-lg">
                                <Terminal className="h-3.5 w-3.5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PLEK AI</span>
                                <span className="text-xs font-semibold text-kelp-primary">{generationStatus || 'Initializing...'}</span>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                <span className="text-[10px] text-slate-400">working</span>
                                <Loader2 className="h-3.5 w-3.5 text-kelp-accent-start animate-spin" />
                            </div>
                        </div>

                        {/* Log lines */}
                        <div className="h-64 overflow-y-auto space-y-0.5 pr-1">
                            {logs.map((log, i) => {
                                const isLatest = i === logs.length - 1;
                                const colorClass =
                                    log.type === 'success' ? 'text-emerald-600' :
                                        log.type === 'warn' ? 'text-amber-600' :
                                            log.type === 'step' ? 'text-kelp-primary font-bold' :
                                                'text-slate-600';
                                return (
                                    <div
                                        key={log.id}
                                        className={`leading-relaxed transition-opacity duration-700 ${isLatest ? 'opacity-100' :
                                                i >= logs.length - 4 ? 'opacity-70' :
                                                    i >= logs.length - 8 ? 'opacity-40' :
                                                        'opacity-20'
                                            } ${colorClass} animate-in slide-in-from-bottom-1`}
                                        style={{ animationDuration: '200ms' }}
                                    >
                                        {log.text === '' ? <br /> : (
                                            <span>
                                                {log.type !== 'step' && (
                                                    <span className="text-slate-300 mr-2 select-none">›</span>
                                                )}
                                                {log.text}
                                                {isLatest && (
                                                    <span className="inline-block w-1.5 h-3 bg-kelp-accent-start ml-1 animate-pulse align-middle rounded-sm" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={logsEndRef} />
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                            <div className="h-full bg-gradient-to-r from-kelp-accent-start via-purple-500 to-kelp-accent-end animate-progress origin-left w-full" />
                        </div>
                        <p className="text-xs text-slate-400 mt-2 text-center">This may take up to 2 minutes · agents are working</p>
                    </div>
                )}

                {/* Dev Mode Toggle */}
                <button
                    onClick={() => setShowDevMode(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-kelp-accent-start transition-colors mt-8 bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm"
                >
                    <Code2 className="h-3.5 w-3.5" />
                    Dev Mode
                </button>

            </div>

            <div className="fixed bottom-4 text-xs text-slate-400 backdrop-blur-sm px-2 py-1 rounded">
                Strictly Private & Confidential | © 2026 PLEK AI
            </div>
        </div>
    );
}
