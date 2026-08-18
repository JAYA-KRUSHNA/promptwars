import { Session, Reel } from '../lib/types';

export const SESSIONS: Session[] = [
  {
    id: 'session_1',
    name: 'Session 1: The Software Engineering Trap (Critical Test)',
    tagline: 'Java Meme + Day in Life + Laptop Setup + Coding Skit + Skipped Hype',
    description: 'Student watched a Java humor meme, a FAANG day-in-the-life, an interview skit, a laptop hardware comparison, and skipped a clickbait AI video. Surface naive keywords say "Java", but true intent is Software Engineering Career & Lifestyle.',
    expected_inference: 'Career / Software Engineering (NOT "Java" and NOT hype)',
    trap_warning: '⚠️ Trap Test: A naive keyword matcher will see "Java" from the meme or recommend clickbait AI. A true agent detects the holistic Software Engineering aspiration and recommends career/engineering depth.',
    reels: [
      {
        id: 'reel_01',
        title: 'POV: Your Java code works on the first try',
        category: 'Java',
        transcript_or_caption: 'Waiting 45 seconds for Maven compile and the NullPointerException is finally gone... screams of joy in the dorm room at 3am #javameme #codinghumor #studentlife',
        format: 'meme',
        hashtags: ['javameme', 'codinghumor', 'studentlife', 'dormdev'],
        emoji: '😂',
        engagement: {
          watch_percent: 100,
          rewatch_count: 2,
          liked: true,
          shared: true,
          skipped_early: false,
        },
      },
      {
        id: 'reel_02',
        title: 'Day in the Life of a Software Engineer at Google',
        category: 'Career',
        transcript_or_caption: 'Morning standup, iced matcha at the microkitchen, writing design docs for distributed caching, 2 hours of deep focus code review, then bouldering wall #swe #dayinthelife #techcareer',
        format: 'vlog',
        hashtags: ['swe', 'dayinthelife', 'techcareer', 'google', 'engineer'],
        emoji: '💼',
        engagement: {
          watch_percent: 92,
          rewatch_count: 1,
          liked: true,
          shared: false,
          skipped_early: false,
        },
      },
      {
        id: 'reel_03',
        title: 'When the interviewer asks "Tell me about yourself"',
        category: 'Career',
        transcript_or_caption: 'Do NOT recite your whole resume from kindergarten. Structure with Present, Past, Future and highlight high-impact technical initiatives #techinterview #careeradvice #behavioralprep',
        format: 'skit',
        hashtags: ['techinterview', 'careeradvice', 'behavioralprep', 'faangprep'],
        emoji: '🎭',
        engagement: {
          watch_percent: 85,
          rewatch_count: 0,
          liked: false,
          shared: false,
          skipped_early: false,
        },
      },
      {
        id: 'reel_04',
        title: 'MacBook Pro vs ThinkPad for Coding in 2025',
        category: 'Hardware',
        transcript_or_caption: 'Comparing Unix terminal ergonomics, battery life under heavy Docker containers, and keyboard tactile response for 8-hour programming sessions #developergear #macbook #thinkpad',
        format: 'comparison',
        hashtags: ['developergear', 'macbook', 'thinkpad', 'setuptour', 'devproductivity'],
        emoji: '💻',
        engagement: {
          watch_percent: 78,
          rewatch_count: 0,
          liked: false,
          shared: false,
          skipped_early: false,
        },
      },
      {
        id: 'reel_05',
        title: '10 AI Tools That Will 10x Your Career Overnight',
        category: 'AI',
        transcript_or_caption: 'Stop writing code manually! These 10 magic AI prompts and extensions will do 100% of your software job while you sleep! #aihype #makemoney #overnight',
        format: 'news',
        hashtags: ['aihype', 'makemoney', 'overnight', 'chatgpttrick'],
        emoji: '⚠️',
        engagement: {
          watch_percent: 15,
          rewatch_count: 0,
          liked: false,
          shared: false,
          skipped_early: true,
        },
      },
      {
        id: 'reel_06',
        title: 'Git Rebase vs Merge — Which Should You Use?',
        category: 'Other',
        transcript_or_caption: 'Visualizing commit history graphs: why rebase keeps linear commit logs for pull requests while merge preserves true chronological branch topology #git #versioncontrol #engineeringbestpractices',
        format: 'tutorial',
        hashtags: ['git', 'versioncontrol', 'engineeringbestpractices', 'cleanbranches'],
        emoji: '🌿',
        engagement: {
          watch_percent: 88,
          rewatch_count: 1,
          liked: true,
          shared: false,
          skipped_early: false,
        },
      },
    ],
  },
  {
    id: 'session_2',
    name: 'Session 2: Pure Java Language Mastery',
    tagline: 'JVM Memory + Spring Boot Microservices + Concurrency Locks',
    description: 'Student spent dedicated watch time studying Java virtual machine memory layouts, thread synchronization, Spring architecture, and JVM GC flags. This is genuine language mastery, not just a casual meme.',
    expected_inference: 'Java (Deep Systems & Backend Language Engineering)',
    trap_warning: '⚠️ Anti-Over-Inference Test: Do not over-generalize to generic "tech career" when clear technical depth signals in Java exist across multiple deep tutorials.',
    reels: [
      {
        id: 'reel_201',
        title: 'How JVM Allocates Objects in Eden vs Survivor Space',
        category: 'Java',
        transcript_or_caption: 'Detailed breakdown of Young Generation Eden space, minor GC object promotion thresholds, and tenuring age distribution flags #jvm #javainternals #memoryallocation',
        format: 'explainer',
        hashtags: ['jvm', 'javainternals', 'memoryallocation', 'heap'],
        emoji: '☕',
        engagement: {
          watch_percent: 100,
          rewatch_count: 2,
          liked: true,
          shared: true,
          skipped_early: false,
        },
      },
      {
        id: 'reel_202',
        title: 'Synchronized vs ReentrantLock: Under the Hood',
        category: 'Java',
        transcript_or_caption: 'Comparing JVM monitor enter/exit opcodes with AbstractQueuedSynchronizer state manipulation and fair lock queuing in java.util.concurrent #concurrency #multithreading',
        format: 'tutorial',
        hashtags: ['concurrency', 'multithreading', 'locks', 'javadev'],
        emoji: '🔒',
        engagement: {
          watch_percent: 94,
          rewatch_count: 1,
          liked: true,
          shared: false,
          skipped_early: false,
        },
      },
      {
        id: 'reel_203',
        title: 'Spring Boot Dependency Injection: How @Autowired Works',
        category: 'Java',
        transcript_or_caption: 'ApplicationContext reflection scanning, BeanPostProcessor lifecycle hooks, and circular dependency resolution in Spring framework #springboot #javaframework',
        format: 'tutorial',
        hashtags: ['springboot', 'javaframework', 'ioc', 'dependencyinjection'],
        emoji: '🍃',
        engagement: {
          watch_percent: 90,
          rewatch_count: 0,
          liked: true,
          shared: false,
          skipped_early: false,
        },
      },
      {
        id: 'reel_204',
        title: 'Java Generics Type Erasure Explained in 60s',
        category: 'Java',
        transcript_or_caption: 'Why List<String> becomes List at runtime in bytecode, synthetic bridge methods, and why primitive arrays differ from generic collections #javacode #typesystem',
        format: 'explainer',
        hashtags: ['javacode', 'typesystem', 'generics', 'bytecode'],
        emoji: '🧩',
        engagement: {
          watch_percent: 86,
          rewatch_count: 1,
          liked: false,
          shared: false,
          skipped_early: false,
        },
      },
    ],
  },
  {
    id: 'session_3',
    name: 'Session 3: AI & Neural Foundations (Anti-Hype Test)',
    tagline: 'Backpropagation Math + Attention Mechanism + Skipped Clickbait',
    description: 'Student engaged deeply with matrix calculus for neural networks and transformer self-attention, while immediately skipping sensationalist "10x your life with ChatGPT" hype videos.',
    expected_inference: 'AI / Machine Learning (Rigorous Math & Architecture, rejecting clickbait)',
    trap_warning: '⚠️ Anti-Hype Filter Test: Must reject the catalog distractor "10 AI Tools That Will 10x Your Career" and recommend substantive Transformer / Neural Net foundation.',
    reels: [
      {
        id: 'reel_301',
        title: 'Backpropagation Visualized: The Chain Rule in 3D',
        category: 'AI',
        transcript_or_caption: 'Computing partial derivatives of loss with respect to weight matrices layer by layer with gradient vector field animations #machinelearning #backprop #deeplearningmath',
        format: 'explainer',
        hashtags: ['machinelearning', 'backprop', 'deeplearningmath', 'neuralnets'],
        emoji: '🧠',
        engagement: {
          watch_percent: 100,
          rewatch_count: 2,
          liked: true,
          shared: true,
          skipped_early: false,
        },
      },
      {
        id: 'reel_302',
        title: 'Why Softmax Needs Temperature Scaling in Attention',
        category: 'AI',
        transcript_or_caption: 'Preventing vanishing gradients in dot-product attention when dimensionality sqrt(d_k) becomes large. Mathematical proof and visual distribution curve #transformers #aiarchitecture',
        format: 'tutorial',
        hashtags: ['transformers', 'aiarchitecture', 'math', 'attentionmechanism'],
        emoji: '📐',
        engagement: {
          watch_percent: 91,
          rewatch_count: 1,
          liked: true,
          shared: false,
          skipped_early: false,
        },
      },
      {
        id: 'reel_303',
        title: 'THIS AI BOT WILL REPLACE ALL CODER JOBS TOMORROW!!',
        category: 'AI',
        transcript_or_caption: 'Shocking demo! Coding is officially dead! Download my prompt guide now! #aicrazy #fearmongering #hype',
        format: 'news',
        hashtags: ['aicrazy', 'fearmongering', 'hype', 'clickbait'],
        emoji: '⚠️',
        engagement: {
          watch_percent: 8,
          rewatch_count: 0,
          liked: false,
          shared: false,
          skipped_early: true,
        },
      },
      {
        id: 'reel_304',
        title: 'Python NumPy Vectorization vs Python For-Loops Benchmark',
        category: 'AI',
        transcript_or_caption: 'Comparing C-contiguous memory layout SIMD execution against standard Python interpreter bytecode loops for 10M matrix dot products #pythonperformance #datascience',
        format: 'comparison',
        hashtags: ['pythonperformance', 'datascience', 'numpy', 'optimization'],
        emoji: '⚡',
        engagement: {
          watch_percent: 89,
          rewatch_count: 0,
          liked: true,
          shared: false,
          skipped_early: false,
        },
      },
    ],
  },
  {
    id: 'session_4',
    name: 'Session 4: Hardware & Systems Architecture',
    tagline: 'CPU L1/L2 Cache + GPU SIMD Parallelism + Silicon Transistors',
    description: 'Student is captivated by physical computing hardware, memory hierarchy latency differences, nanometer lithography, and GPU tensor core architecture.',
    expected_inference: 'Hardware / Computer Systems Architecture',
    trap_warning: '⚠️ Semantic Expansion: Student may benefit from adjacent low-level CPU cache and GPU architecture topics.',
    reels: [
      {
        id: 'reel_401',
        title: 'Nanometer Scales in TSMC 3nm Lithography',
        category: 'Hardware',
        transcript_or_caption: 'Extreme Ultraviolet (EUV) light reflections, pellicle heat resistance, and finFET to GAA ribbon transistor transitions at atomic scale #semiconductors #chipdesign #hardware',
        format: 'explainer',
        hashtags: ['semiconductors', 'chipdesign', 'hardware', 'nanotech'],
        emoji: '🔬',
        engagement: {
          watch_percent: 100,
          rewatch_count: 1,
          liked: true,
          shared: true,
          skipped_early: false,
        },
      },
      {
        id: 'reel_402',
        title: 'Why Cache Latency is 1ns vs RAM Latency 100ns',
        category: 'Hardware',
        transcript_or_caption: 'Visualizing speed of light distance on silicon die, L1 instruction cache SRAM cells, and DRAM capacitor refresh delays #cpu #computerarchitecture #performance',
        format: 'tutorial',
        hashtags: ['cpu', 'computerarchitecture', 'performance', 'memorylatency'],
        emoji: '💾',
        engagement: {
          watch_percent: 96,
          rewatch_count: 1,
          liked: true,
          shared: false,
          skipped_early: false,
        },
      },
      {
        id: 'reel_403',
        title: 'Why GPUs Have 10,000 Small Cores vs CPUs 16 Big Cores',
        category: 'Hardware',
        transcript_or_caption: 'Throughput computing vs latency computing: branching logic and out-of-order execution in CPUs vs pure parallel SIMD arithmetic in graphics silicon #gpu #hardwaregeek',
        format: 'comparison',
        hashtags: ['gpu', 'hardwaregeek', 'silicon', 'simd'],
        emoji: '🎮',
        engagement: {
          watch_percent: 93,
          rewatch_count: 0,
          liked: true,
          shared: false,
          skipped_early: false,
        },
      },
    ],
  },
  {
    id: 'session_5',
    name: 'Session 5: Mixed / Ambiguous Explorer',
    tagline: 'Cooking Skit + Cat Video + Mechanical Keyboard Sound + CSS Tip',
    description: 'A disjointed watch session without a concentrated signal. The agent must honestly calibrate confidence to "Low" or "Medium" instead of fabricating false high confidence.',
    expected_inference: 'Exploratory / Mixed (Calibrated to Low/Medium Confidence)',
    trap_warning: '⚠️ Confidence Calibration Test: The agent should NOT output "High" confidence when data is scattered across disparate non-technical and superficial topics.',
    reels: [
      {
        id: 'reel_501',
        title: 'Quick 15-Minute Garlic Butter Pasta',
        category: 'Lifestyle',
        transcript_or_caption: 'Boil spaghetti al dente, emulsify pasta water with garlic butter and parsley in skillet #cooking #easymeals #foodie',
        format: 'tutorial',
        hashtags: ['cooking', 'easymeals', 'foodie'],
        emoji: '🍝',
        engagement: {
          watch_percent: 60,
          rewatch_count: 0,
          liked: false,
          shared: false,
          skipped_early: false,
        },
      },
      {
        id: 'reel_502',
        title: 'Cat knocking water bottle off the desk in slow motion',
        category: 'Entertainment',
        transcript_or_caption: 'Zero remorse in those eyes at 240fps #catsoftiktok #funnycats #pets',
        format: 'meme',
        hashtags: ['catsoftiktok', 'funnycats', 'pets'],
        emoji: '🐱',
        engagement: {
          watch_percent: 85,
          rewatch_count: 0,
          liked: true,
          shared: false,
          skipped_early: false,
        },
      },
      {
        id: 'reel_503',
        title: 'Creamy Linear Key Switches Sound Test',
        category: 'Hardware',
        transcript_or_caption: 'Lubed and filmed Gateron Oil Kings on brass plate with foam mod #mechanicalkeyboard #asmr #keebs',
        format: 'comparison',
        hashtags: ['mechanicalkeyboard', 'asmr', 'keebs'],
        emoji: '⌨️',
        engagement: {
          watch_percent: 45,
          rewatch_count: 0,
          liked: false,
          shared: false,
          skipped_early: false,
        },
      },
      {
        id: 'reel_504',
        title: 'CSS Glassmorphism One-Liner Generator',
        category: 'Web',
        transcript_or_caption: 'backdrop-filter: blur(16px) with 0.2 opacity white background #css #webdesign #frontend',
        format: 'tutorial',
        hashtags: ['css', 'webdesign', 'frontend'],
        emoji: '🎨',
        engagement: {
          watch_percent: 50,
          rewatch_count: 0,
          liked: false,
          shared: false,
          skipped_early: false,
        },
      },
    ],
  },
  {
    id: 'session_6',
    name: 'Session 6: Gaming, Security & Cloud Ecosystem (6-8 Reel Full Spec)',
    tagline: 'Game Engine Shaders + SQLi Defense + Kubernetes + C++ Meme + Gadgets + Skipped Hype',
    description: 'A rich 7-reel session spanning gaming graphics, cybersecurity defense, cloud infrastructure, hardware gadgets, and C++ developer culture with an anti-hype distractor skip.',
    expected_inference: 'Cybersecurity / Cloud / Systems Architecture (Anti-Hype Grounded)',
    trap_warning: '⚠️ Anti-Hype & Domain Test: Must reject the "Cloud in 7 Days" get-rich-quick distractor and recommend substantive Application Security or Cloud Architecture.',
    reels: [
      {
        id: 'reel_601',
        title: 'How Unreal Engine 5 Lumen Ray Tracing Actually Works',
        category: 'Hardware',
        transcript_or_caption: 'Software ray tracing vs hardware BVH acceleration in GPU shaders for real-time global illumination and reflection probes #gaming #unrealengine #raytracing #shaders',
        format: 'explainer',
        hashtags: ['gaming', 'unrealengine', 'raytracing', 'shaders', 'gamedev'],
        emoji: '🎮',
        engagement: {
          watch_percent: 95,
          rewatch_count: 1,
          liked: true,
          shared: false,
          skipped_early: false,
        },
      },
      {
        id: 'reel_602',
        title: 'Hacking a Login Form with SQL Injection in 60s',
        category: 'Cybersecurity',
        transcript_or_caption: 'Breaking authentication with 1=1 OR payload and explaining why parameterized queries prevent AST manipulation in PostgreSQL #cybersecurity #appsec #ethicalhacking #sqlinjection',
        format: 'tutorial',
        hashtags: ['cybersecurity', 'appsec', 'ethicalhacking', 'sqlinjection', 'infosec'],
        emoji: '🛡️',
        engagement: {
          watch_percent: 100,
          rewatch_count: 2,
          liked: true,
          shared: true,
          skipped_early: false,
        },
      },
      {
        id: 'reel_603',
        title: 'Kubernetes Pod Horizontal Autoscaling in Action',
        category: 'Cloud',
        transcript_or_caption: 'Metrics server CPU triggers, ReplicaSet reconciliation loops, and graceful shutdown signal traps in cloud-native microservices #kubernetes #cloud #devops #docker',
        format: 'tutorial',
        hashtags: ['kubernetes', 'cloud', 'devops', 'docker', 'containers'],
        emoji: '☁️',
        engagement: {
          watch_percent: 88,
          rewatch_count: 0,
          liked: true,
          shared: false,
          skipped_early: false,
        },
      },
      {
        id: 'reel_604',
        title: 'When the C++ segfault disappears after adding a std::cout',
        category: 'Other',
        transcript_or_caption: 'Memory corruption undefined behavior: compiler optimization masks buffer overrun when I/O timing changes at 2am #cppmeme #codinghumor #studentdeveloper',
        format: 'meme',
        hashtags: ['cppmeme', 'codinghumor', 'studentdeveloper', 'debugging'],
        emoji: '💀',
        engagement: {
          watch_percent: 90,
          rewatch_count: 1,
          liked: true,
          shared: false,
          skipped_early: false,
        },
      },
      {
        id: 'reel_605',
        title: '240Hz OLED vs 4K IPS for Coding & Gaming',
        category: 'Hardware',
        transcript_or_caption: 'Subpixel text clarity with clearType vs 0.03ms pixel response times in competitive gaming and dark mode coding IDEs #gaminggear #oled #desksetup #developerhardware',
        format: 'comparison',
        hashtags: ['gaminggear', 'oled', 'desksetup', 'developerhardware'],
        emoji: '🖥️',
        engagement: {
          watch_percent: 75,
          rewatch_count: 0,
          liked: false,
          shared: false,
          skipped_early: false,
        },
      },
      {
        id: 'reel_606',
        title: 'Become a Cloud Engineer in 7 Days — No Experience Needed',
        category: 'Cloud',
        transcript_or_caption: 'Secret certification dumps to land a $150k DevOps job with zero Linux knowledge! Click link in bio now! #cloudhype #getrichquick #shortcut',
        format: 'news',
        hashtags: ['cloudhype', 'getrichquick', 'shortcut', 'clickbait'],
        emoji: '⚠️',
        engagement: {
          watch_percent: 12,
          rewatch_count: 0,
          liked: false,
          shared: false,
          skipped_early: true,
        },
      },
      {
        id: 'reel_607',
        title: 'Day in the Life of a Cloud Security Engineer',
        category: 'Career',
        transcript_or_caption: 'Threat modeling AWS IAM policies, automated SAST/DAST CI/CD pipeline reviews, and incident response drill at a fintech unicorn #techcareer #cloudsec #swe',
        format: 'vlog',
        hashtags: ['techcareer', 'cloudsec', 'swe', 'securityengineer'],
        emoji: '🔒',
        engagement: {
          watch_percent: 86,
          rewatch_count: 0,
          liked: true,
          shared: false,
          skipped_early: false,
        },
      },
    ],
  },
];

// All available reels across all pre-configured test sessions
export const ALL_REELS: Reel[] = SESSIONS.flatMap((s) => s.reels).filter(
  (reel, idx, self) => self.findIndex((r) => r.id === reel.id) === idx
);

// Helper to generate a realistic randomized student watch session (6-8 reels)
export function generateRandomSession(count = 7): Session {
  // Shuffle all reels
  const shuffled = [...ALL_REELS].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.max(3, Math.min(count, ALL_REELS.length)));

  // Apply realistic randomized watch telemetry to simulate a live student browsing
  const randomizedReels: Reel[] = selected.map((reel, index) => {
    // 30% chance skipped early, 50% high engagement, 20% moderate
    const roll = Math.random();
    let watchPercent = 85;
    let liked = false;
    let shared = false;
    let rewatchCount = 0;
    let skippedEarly = false;

    if (roll < 0.25) {
      // Skipped early
      watchPercent = Math.floor(Math.random() * 25) + 5; // 5% - 30%
      skippedEarly = true;
    } else if (roll < 0.7) {
      // High completion + engaged
      watchPercent = Math.floor(Math.random() * 20) + 80; // 80% - 100%
      liked = Math.random() > 0.4;
      shared = Math.random() > 0.7;
      rewatchCount = Math.random() > 0.6 ? 1 : 0;
    } else {
      // Moderate casual watch
      watchPercent = Math.floor(Math.random() * 35) + 45; // 45% - 80%
      liked = Math.random() > 0.8;
    }

    return {
      ...reel,
      id: `${reel.id}_rand_${index}_${Date.now().toString(36)}`,
      engagement: {
        watch_percent: watchPercent,
        rewatch_count: rewatchCount,
        liked,
        shared,
        skipped_early: skippedEarly,
      },
    };
  });

  return {
    id: `custom_random_${Date.now()}`,
    name: '🎲 Custom Random Student Feed',
    tagline: 'Dynamically Generated Multi-Topic Watch Session',
    description: `A live randomized student watch history containing ${randomizedReels.length} reels across varied topics with simulated real-world telemetry (watch %, likes, skips).`,
    expected_inference: 'Dynamic Holistic Multi-Signal Inference',
    trap_warning: '✨ Dynamic Agent Test: The AI Agent evaluates the exact combination of active topics, watch times, and skips to synthesize a grounded recommendation.',
    reels: randomizedReels,
  };
}

