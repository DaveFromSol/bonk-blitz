// components/BonkCyberBackrooms.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Zap, 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown,
  Eye,
  Cpu,
  HardDrive,
  Wifi,
  Battery,
  Signal,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  X,
  Hash,
  Database
} from 'lucide-react';

const BonkCyberBackrooms = ({ onExit }) => {
  const [currentRoom, setCurrentRoom] = useState('0,0,0');
  const [roomCache, setRoomCache] = useState(new Map());
  const [visitedRooms, setVisitedRooms] = useState(new Set(['0,0,0']));
  const [terminalLines, setTerminalLines] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [systemStatus, setSystemStatus] = useState('OPERATIONAL');
  const [connectionStrength, setConnectionStrength] = useState(100);
  const [timeInSystem, setTimeInSystem] = useState(0);
  const [totalRoomsGenerated, setTotalRoomsGenerated] = useState(1);
  const [showJumpscare, setShowJumpscare] = useState(false);
  const [showBlackScreen, setShowBlackScreen] = useState(true);
  const [backroomsLoaded, setBackroomsLoaded] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const terminalRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    if (audioRef.current) {
      // Set up audio event listeners
      audioRef.current.addEventListener('canplaythrough', () => {
        setAudioLoaded(true);
        console.log('Audio loaded successfully');
      });
      
      audioRef.current.addEventListener('error', (e) => {
        setAudioError(true);
        console.error('Audio failed to load:', e);
      });
      
      // Try to load the audio
      audioRef.current.load();
    }
  }, []);

  // Play jumpscare sound with multiple fallbacks
  const playJumpscareSound = async () => {
    if (!audioRef.current) {
      console.warn('Audio ref not available');
      return;
    }

    try {
      // Reset audio to beginning
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.8;
      
      // Try to play
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log('Jumpscare sound played successfully');
      }
    } catch (error) {
      console.error('Failed to play jumpscare sound:', error);
      
      // Fallback: Try Web Audio API
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const response = await fetch('/jumpscare-94984.mp3');
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
        console.log('Fallback audio played via Web Audio API');
      } catch (fallbackError) {
        console.error('Fallback audio also failed:', fallbackError);
      }
    }
  };

  // BONK themed elements for infinite generation
  const bonkThemes = {
    prefixes: ['BONK', 'MEME', 'CRYPTO', 'SOLANA', 'DEGEN', 'DIAMOND', 'PAPER', 'WHALE', 'MOON', 'HODL', 'WAGMI', 'GMI', 'BASED', 'CHAD', 'ALPHA', 'BETA'],
    suffixes: ['PROTOCOL', 'MATRIX', 'CHAMBER', 'VAULT', 'NEXUS', 'CORE', 'HUB', 'NODE', 'SECTOR', 'ZONE', 'REALM', 'DIMENSION', 'SPACE', 'LAB', 'FACTORY', 'FORGE'],
    extensions: ['.exe', '.dao', '.sol', '.rs', '.js', '.py', '.go', '.cpp', '.dll', '.bin', '.dat', '.log', '.cfg', '.ini', '.xml', '.json'],
    colors: ['#FFD302', '#FF5C01', '#FDC202', '#FF8E03', '#E89607', '#FC8E03', '#FF0000', '#32CD32', '#87CEEB', '#FFB347', '#FF6B35'],
    entities: [
      'BONK_SPIRITS', 'MEME_GUARDIANS', 'HODL_BOTS', 'DIAMOND_SENTRIES', 'WHALE_HUNTERS', 'PAPER_SHREDDERS',
      'MOON_ROCKETS', 'DEGEN_ALGORITHMS', 'CHAD_PROTOCOLS', 'ALPHA_ENTITIES', 'BETA_TESTERS', 'GAMMA_RAYS',
      'SIGMA_NODES', 'OMEGA_SEQUENCES', 'DELTA_FORCES', 'THETA_WAVES', 'LAMBDA_FUNCTIONS', 'KAPPA_STREAMS'
    ],
    locations: [
      'BLOCKCHAIN_LAYER', 'MEMESPACE_DIMENSION', 'CONSENSUS_REALM', 'LIQUIDITY_POOLS', 'SMART_CONTRACT_MATRIX',
      'DAO_GOVERNANCE_GRID', 'NFT_GALLERIES', 'DEFI_PROTOCOLS', 'YIELD_FARMS', 'STAKING_CHAMBERS',
      'BRIDGE_NETWORKS', 'ORACLE_FEEDS', 'VALIDATOR_NODES', 'HASH_FUNCTIONS', 'MERKLE_TREES'
    ],
    storylines: [
      'The ancient BONK protocols whisper secrets in binary.',
      'Meme energy flows through fiber optic veins here.',
      'Diamond hands have left their mark on these walls.',
      'Paper hands were liquidated in this very chamber.',
      'The whale graveyard extends infinitely in all directions.',
      'HODL spirits patrol these digital corridors.',
      'Moon mission control coordinates launch sequences.',
      'Degen algorithms compute risk/reward ratios continuously.',
      'Chad energy permeates the electromagnetic spectrum.',
      'Alpha protocols dominate the network consensus.',
      'Beta testing environments spawn endlessly.',
      'Gamma radiation from overclocked mining rigs.',
      'Sigma node optimization routines execute autonomously.',
      'Omega-level classification protocols engaged.',
      'Delta-V calculations for orbital trajectories to the moon.',
      'Theta wave patterns synchronize community sentiment.',
      'Lambda functions process infinite transaction streams.',
      'Kappa coefficients measure meme virality rates.'
    ]
  };

  // Seeded random number generator for consistent room generation
  const seededRandom = (seed) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Generate hash from coordinates
  const coordsToSeed = (coords) => {
    const [x, y, z] = coords.split(',').map(Number);
    return Math.abs(x * 1000 + y * 100 + z * 10 + 12345);
  };

  // Generate infinite room data
  const generateRoom = (coords) => {
    if (roomCache.has(coords)) {
      return roomCache.get(coords);
    }

    const [x, y, z] = coords.split(',').map(Number);
    const seed = coordsToSeed(coords);
    
    // Use seeded random for consistent generation
    const random = (offset = 0) => seededRandom(seed + offset);
    
    // Generate room properties
    const themeIndex = Math.floor(random(1) * bonkThemes.prefixes.length);
    const suffixIndex = Math.floor(random(2) * bonkThemes.suffixes.length);
    const extIndex = Math.floor(random(3) * bonkThemes.extensions.length);
    const colorIndex = Math.floor(random(4) * bonkThemes.colors.length);
    const entityIndex = Math.floor(random(5) * bonkThemes.entities.length);
    const locationIndex = Math.floor(random(6) * bonkThemes.locations.length);
    
    const roomNumber = Math.abs(x + y + z);
    const sectorId = `${Math.floor(x/10)}.${Math.floor(y/10)}.${Math.floor(z/10)}`;
    
    const room = {
      coords,
      name: `${bonkThemes.prefixes[themeIndex]}_${bonkThemes.suffixes[suffixIndex]}_${roomNumber}${bonkThemes.extensions[extIndex]}`,
      description: bonkThemes.storylines[Math.floor(random(7) * bonkThemes.storylines.length)],
      color: bonkThemes.colors[colorIndex],
      systemInfo: {
        coordinates: `[${x}, ${y}, ${z}]`,
        sector: `SECTOR_${sectorId}`,
        location: `${bonkThemes.locations[locationIndex]}://${coords.replace(/,/g, '_')}`,
        security: `LEVEL_${Math.floor(random(8) * 10)}_CLEARANCE`,
        entities: bonkThemes.entities[entityIndex],
        roomId: `#${roomNumber.toString(16).toUpperCase()}`
      },
      story: generateStory(coords, random),
      connections: {
        north: `${x},${y+1},${z}`,
        south: `${x},${y-1},${z}`,
        east: `${x+1},${y},${z}`,
        west: `${x-1},${y},${z}`,
        up: `${x},${y},${z+1}`,
        down: `${x},${y},${z-1}`
      },
      secrets: generateSecrets(coords, random),
      discoveryTime: Date.now()
    };

    // Cache the room
    const newCache = new Map(roomCache);
    newCache.set(coords, room);
    setRoomCache(newCache);
    setTotalRoomsGenerated(prev => prev + 1);
    
    return room;
  };

  // Generate dynamic story content
  const generateStory = (coords, random) => {
    const [x, y, z] = coords.split(',').map(Number);
    const roomType = Math.abs(x + y + z) % 5;
    
    const storyTemplates = [
      // Genesis/Origin rooms
      [
        "> SCANNING PRIMORDIAL_PROTOCOLS...",
        "> DETECTING ANCIENT_BONK_ENERGY...",
        "",
        "You've discovered an ancient BONK nexus.",
        "The walls pulse with primordial meme energy.",
        "",
        "⚡ Original blockchain signatures detected",
        "⚡ Genesis block fragments scattered about",
        "⚡ The echo of the first BONK reverberates here",
        "",
        `Coordinates: [${x}, ${y}, ${z}]`,
        "This place has witnessed the birth of legends.",
        "",
        "[ENERGY_READING]: MAXIMUM_BONK_DETECTED",
        "[HISTORICAL_SIGNIFICANCE]: LEGENDARY_STATUS"
      ],
      
      // Battle/Conflict rooms
      [
        "> ANALYZING COMBAT_RESIDUE...",
        "> DETECTING MASSIVE_LIQUIDATION_EVENTS...",
        "",
        "A battlefield where whales met their doom.",
        "The floor is littered with liquidated positions.",
        "",
        "🏴‍☠️ Whale corpses line the digital corridors",
        "🏴‍☠️ Paper hands were incinerated instantly", 
        "🏴‍☠️ Only diamond hands survived the carnage",
        "",
        `Battle coordinates: [${x}, ${y}, ${z}]`,
        "The retail army claimed victory here.",
        "",
        "[CASUALTY_REPORT]: WHALES_EXTINCT",
        "[VICTORY_STATUS]: PEOPLE_TRIUMPHANT"
      ],
      
      // Tech/Computing rooms
      [
        "> INITIALIZING QUANTUM_PROTOCOLS...",
        "> LOADING ADVANCED_ALGORITHMS...",
        "",
        "A computational nexus of infinite complexity.",
        "BONK algorithms process infinite possibilities.",
        "",
        "🔬 Quantum entangled BONK particles",
        "🔬 AI systems learning meme theory",
        "🔬 Blockchain computations at light speed",
        "",
        `Processing node: [${x}, ${y}, ${z}]`,
        "The future of BONK is calculated here.",
        "",
        "[COMPUTE_POWER]: THEORETICAL_MAXIMUM",
        "[AI_STATUS]: BONK_CONSCIOUSNESS_ACHIEVED"
      ],
      
      // Community/Social rooms
      [
        "> ACCESSING SOCIAL_CONSENSUS_LAYER...",
        "> MAPPING COMMUNITY_NETWORKS...",
        "",
        "A gathering place for digital nomads.",
        "Millions of BONK believers converge here.",
        "",
        "🌐 Global community nodes synchronizing",
        "🌐 Memes propagating at viral speeds",
        "🌐 Collective intelligence emerging",
        "",
        `Social hub: [${x}, ${y}, ${z}]`,
        "The voice of the people echoes eternal.",
        "",
        "[CONSENSUS_LEVEL]: UNANIMOUS_BONK",
        "[COMMUNITY_POWER]: INFINITE_STRENGTH"
      ],
      
      // Mystery/Unknown rooms
      [
        "> UNKNOWN_PROTOCOLS_DETECTED...",
        "> SCANNING_ANOMALOUS_SIGNATURES...",
        "",
        "Something strange lurks in this digital space.",
        "The very fabric of reality seems... different.",
        "",
        "❓ Unidentified BONK entities observed",
        "❓ Physics laws appear to be optional",
        "❓ Time flows in unexpected directions",
        "",
        `Anomaly location: [${x}, ${y}, ${z}]`,
        "Proceed with extreme caution, traveler.",
        "",
        "[THREAT_LEVEL]: UNKNOWN_UNKNOWN",
        "[RECOMMENDATION]: INVESTIGATE_CAREFULLY"
      ]
    ];
    
    return storyTemplates[roomType];
  };

  // Generate secrets for each room
  const generateSecrets = (coords, random) => {
    const secretTemplates = [
      'BONK_GENESIS_CODES', 'WHALE_LIQUIDATION_LOGS', 'DIAMOND_HAND_REGISTRY', 
      'MEME_EVOLUTION_TREE', 'COMMUNITY_TREASURY_KEYS', 'MOON_MISSION_PLANS',
      'PAPER_HAND_DATABASE', 'HODL_STRENGTH_METRICS', 'VIRAL_COEFFICIENT_DATA',
      'QUANTUM_BONK_THEORIES', 'AI_CONSCIOUSNESS_BACKUP', 'INFINITE_SCROLL_CODES'
    ];
    
    const numSecrets = Math.floor(random(10) * 3) + 1;
    const secrets = [];
    
    for (let i = 0; i < numSecrets; i++) {
      const secretIndex = Math.floor(random(10 + i) * secretTemplates.length);
      secrets.push(secretTemplates[secretIndex]);
    }
    
    return secrets;
  };

  // Terminal typing effect
  const typeText = (text, callback) => {
    setIsTyping(true);
    const lines = Array.isArray(text) ? text : [text];
    let lineIndex = 0;
    let charIndex = 0;
    let currentLines = [];

    const typeCharacter = () => {
      if (lineIndex < lines.length) {
        const currentLine = lines[lineIndex];
        
        if (charIndex < currentLine.length) {
          if (!currentLines[lineIndex]) currentLines[lineIndex] = '';
          currentLines[lineIndex] += currentLine[charIndex];
          setTerminalLines([...currentLines]);
          charIndex++;
          setTimeout(typeCharacter, Math.random() * 20 + 5);
        } else {
          lineIndex++;
          charIndex = 0;
          if (lineIndex < lines.length) {
            currentLines[lineIndex] = '';
          }
          setTimeout(typeCharacter, 100);
        }
      } else {
        setIsTyping(false);
        if (callback) callback();
      }
    };

    typeCharacter();
  };

  // Navigate to room
  const navigateToRoom = (coords) => {
    if (isTyping) return;
    
    const room = generateRoom(coords);
    setCurrentRoom(coords);
    setVisitedRooms(prev => new Set([...prev, coords]));
    setTerminalLines([]);
    
    setTimeout(() => {
      typeText(room.story);
    }, 300);
  };

  // Initialize jumpscare sequence
  useEffect(() => {
    // Step 1: Black screen for 3 seconds
    const blackScreenTimer = setTimeout(() => {
      // Step 2: Show jumpscare with sound
      setShowBlackScreen(false);
      setShowJumpscare(true);
      
      // Play jumpscare sound with delay to ensure it plays
      setTimeout(() => {
        playJumpscareSound();
      }, 100);
      
      // Step 3: Hide jumpscare and load backrooms after 1.5 seconds
      const jumpscareTimer = setTimeout(() => {
        setShowJumpscare(false);
        setBackroomsLoaded(true);
        
        // Initialize first room after jumpscare
        const initialRoom = generateRoom('0,0,0');
        setTimeout(() => {
          typeText(initialRoom.story);
        }, 500);
      }, 1500);
      
      return () => clearTimeout(jumpscareTimer);
    }, 3000);
    
    return () => clearTimeout(blackScreenTimer);
  }, []);

  // Initialize first room (removed from here since we do it after jumpscare)
  // useEffect(() => {
  //   const initialRoom = generateRoom('0,0,0');
  //   setTimeout(() => {
  //     typeText(initialRoom.story);
  //   }, 1000);
  // }, []);

  // Time counter
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeInSystem(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Connection strength simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStrength(prev => Math.max(70, Math.min(100, prev + (Math.random() - 0.5) * 10)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentRoomData = generateRoom(currentRoom);
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get recent rooms for quick access
  const recentRooms = Array.from(visitedRooms).slice(-10).reverse();

  // Show black screen
  if (showBlackScreen) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        {/* Multiple audio sources for better compatibility */}
        <audio 
          ref={audioRef} 
          preload="auto"
          muted={false}
          crossOrigin="anonymous"
        >
          <source src="/jumpscare-94984.mp3" type="audio/mpeg" />
          <source src="/jumpscare-94984.mp3" type="audio/mp3" />
          <source src="/jumpscare-94984.mp3" type="audio/wav" />
          Your browser does not support the audio element.
        </audio>
        
        {/* Debug info */}
        {audioError && (
          <div className="absolute top-4 left-4 text-red-400 text-xs">
            Audio failed to load - check console
          </div>
        )}
        
        {audioLoaded && (
          <div className="absolute top-4 right-4 text-green-400 text-xs">
            Audio ready
          </div>
        )}
      </div>
    );
  }

  // Show jumpscare
  if (showJumpscare) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
          <img 
            src="/BONK_Pose_Goku_002.png" 
            alt="BONK JUMPSCARE" 
            className="max-w-full max-h-full object-contain animate-bounce"
            style={{
              filter: 'contrast(200%) brightness(150%) saturate(200%)',
              animation: 'jumpscareShake 0.1s infinite'
            }}
          />
        </div>
        <style jsx>{`
          @keyframes jumpscareShake {
            0% { transform: translate(0px, 0px) rotate(0deg) scale(1.2); }
            10% { transform: translate(-2px, -2px) rotate(-1deg) scale(1.25); }
            20% { transform: translate(-2px, 0px) rotate(1deg) scale(1.3); }
            30% { transform: translate(2px, 2px) rotate(0deg) scale(1.25); }
            40% { transform: translate(2px, -2px) rotate(1deg) scale(1.2); }
            50% { transform: translate(-2px, 2px) rotate(-1deg) scale(1.35); }
            60% { transform: translate(-2px, 2px) rotate(0deg) scale(1.3); }
            70% { transform: translate(2px, 2px) rotate(-1deg) scale(1.25); }
            80% { transform: translate(-2px, -2px) rotate(1deg) scale(1.4); }
            90% { transform: translate(2px, 2px) rotate(0deg) scale(1.35); }
            100% { transform: translate(2px, -2px) rotate(-1deg) scale(1.2); }
          }
        `}</style>
      </div>
    );
  }

  // Don't show backrooms until after jumpscare
  if (!backroomsLoaded) {
    return <div className="min-h-screen bg-black"></div>;
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono overflow-hidden relative">
      {/* Infinite Matrix Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-30 gap-px h-full text-xs">
          {Array.from({ length: 900 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                animationDelay: `${Math.random() * 5}s`,
                color: currentRoomData.color,
                opacity: Math.random() * 0.7 + 0.3
              }}
            >
              {['B', 'O', 'N', 'K', '0', '1'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      </div>

      {/* System Header */}
      <div className="relative z-10 border-b border-green-400" style={{ borderColor: currentRoomData.color }}>
        <div className="flex items-center justify-between p-2 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4" style={{ color: currentRoomData.color }} />
              <span style={{ color: currentRoomData.color }}>INFINITE_BONK_MATRIX</span>
            </div>
            <div className="flex items-center gap-1">
              <span>STATUS:</span>
              <span className="text-green-400">{systemStatus}</span>
            </div>
            <div className="flex items-center gap-1">
              <Database className="w-3 h-3" />
              <span>GENERATED: {totalRoomsGenerated.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Signal className="w-3 h-3" />
              <span>{connectionStrength}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              <span>COORDS: {currentRoom}</span>
            </div>
            <div className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              <span>TIME: {formatTime(timeInSystem)}</span>
            </div>
            <button
              onClick={onExit}
              className="flex items-center gap-1 hover:text-red-400 transition-colors"
            >
              <X className="w-3 h-3" />
              EXIT
            </button>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="relative z-10 flex h-[calc(100vh-40px)]">
        {/* Left Panel - Navigation & Info */}
        <div className="w-80 border-r border-green-400 p-4 bg-black/90 overflow-y-auto" style={{ borderColor: currentRoomData.color }}>
          <div className="space-y-4">
            {/* Current Room Info */}
            <div className="border border-green-400 p-3 rounded" style={{ borderColor: currentRoomData.color }}>
              <div className="text-xs mb-2" style={{ color: currentRoomData.color }}>
                ■ CURRENT_SECTOR
              </div>
              <div className="font-bold mb-1 text-xs break-all">{currentRoomData.name}</div>
              <div className="text-xs opacity-80 mb-2">{currentRoomData.description}</div>
              
              <div className="space-y-1 text-xs">
                <div>COORDS: {currentRoomData.systemInfo.coordinates}</div>
                <div>SECTOR: {currentRoomData.systemInfo.sector}</div>
                <div>ID: {currentRoomData.systemInfo.roomId}</div>
                <div>SEC: {currentRoomData.systemInfo.security}</div>
                <div className="break-all">ENT: {currentRoomData.systemInfo.entities}</div>
              </div>
            </div>

            {/* 3D Navigation Grid */}
            <div className="border border-green-400 p-3 rounded" style={{ borderColor: currentRoomData.color }}>
              <div className="text-xs mb-2" style={{ color: currentRoomData.color }}>
                ■ INFINITE_NAVIGATION
              </div>
              
              {/* Z-Axis Controls */}
              <div className="flex justify-center mb-2">
                <button
                  onClick={() => navigateToRoom(currentRoomData.connections.up)}
                  disabled={isTyping}
                  className="p-1 border rounded text-center hover:bg-green-400 hover:text-black transition-colors text-xs"
                  style={{ borderColor: currentRoomData.color }}
                  title="UP (Z+)"
                >
                  ▲ UP
                </button>
              </div>
              
              {/* XY-Axis Grid */}
              <div className="grid grid-cols-3 gap-1 text-xs mb-2">
                <div></div>
                <button
                  onClick={() => navigateToRoom(currentRoomData.connections.north)}
                  disabled={isTyping}
                  className="p-2 border rounded text-center hover:bg-green-400 hover:text-black transition-colors"
                  style={{ borderColor: currentRoomData.color }}
                  title="North (Y+)"
                >
                  <ArrowUp className="w-3 h-3 mx-auto" />
                  N
                </button>
                <div></div>
                
                <button
                  onClick={() => navigateToRoom(currentRoomData.connections.west)}
                  disabled={isTyping}
                  className="p-2 border rounded text-center hover:bg-green-400 hover:text-black transition-colors"
                  style={{ borderColor: currentRoomData.color }}
                  title="West (X-)"
                >
                  <ArrowLeft className="w-3 h-3 mx-auto" />
                  W
                </button>
                
                <div className="p-2 border rounded text-center font-bold" style={{ backgroundColor: currentRoomData.color, color: 'black' }}>
                  <Eye className="w-3 h-3 mx-auto" />
                  YOU
                </div>
                
                <button
                  onClick={() => navigateToRoom(currentRoomData.connections.east)}
                  disabled={isTyping}
                  className="p-2 border rounded text-center hover:bg-green-400 hover:text-black transition-colors"
                  style={{ borderColor: currentRoomData.color }}
                  title="East (X+)"
                >
                  <ArrowRight className="w-3 h-3 mx-auto" />
                  E
                </button>
                
                <div></div>
                <button
                  onClick={() => navigateToRoom(currentRoomData.connections.south)}
                  disabled={isTyping}
                  className="p-2 border rounded text-center hover:bg-green-400 hover:text-black transition-colors"
                  style={{ borderColor: currentRoomData.color }}
                  title="South (Y-)"
                >
                  <ArrowDown className="w-3 h-3 mx-auto" />
                  S
                </button>
                <div></div>
              </div>
              
              {/* Z-Axis Down */}
              <div className="flex justify-center">
                <button
                  onClick={() => navigateToRoom(currentRoomData.connections.down)}
                  disabled={isTyping}
                  className="p-1 border rounded text-center hover:bg-green-400 hover:text-black transition-colors text-xs"
                  style={{ borderColor: currentRoomData.color }}
                  title="DOWN (Z-)"
                >
                  ▼ DOWN
                </button>
              </div>
            </div>

            {/* Recent Rooms */}
            <div className="border border-green-400 p-3 rounded" style={{ borderColor: currentRoomData.color }}>
              <div className="text-xs mb-2" style={{ color: currentRoomData.color }}>
                ■ EXPLORATION_HISTORY ({visitedRooms.size})
              </div>
              <div className="space-y-1 text-xs max-h-40 overflow-y-auto">
                {recentRooms.map(coords => {
                  const room = generateRoom(coords);
                  return (
                    <button
                      key={coords}
                      onClick={() => navigateToRoom(coords)}
                      disabled={isTyping}
                      className={`block w-full text-left p-1 rounded hover:bg-green-400 hover:text-black transition-colors text-xs break-all ${
                        coords === currentRoom ? 'font-bold' : ''
                      }`}
                      style={{ 
                        backgroundColor: coords === currentRoom ? currentRoomData.color : 'transparent',
                        color: coords === currentRoom ? 'black' : currentRoomData.color
                      }}
                    >
                      {coords}: {room.name.substring(0, 20)}...
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Jump */}
            <div className="border border-green-400 p-3 rounded" style={{ borderColor: currentRoomData.color }}>
              <div className="text-xs mb-2" style={{ color: currentRoomData.color }}>
                ■ QUANTUM_JUMP
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => navigateToRoom('0,0,0')}
                  disabled={isTyping}
                  className="w-full p-1 border rounded text-xs hover:bg-green-400 hover:text-black transition-colors"
                  style={{ borderColor: currentRoomData.color }}
                >
                  RETURN TO ORIGIN [0,0,0]
                </button>
                <button
                  onClick={() => {
                    const randomX = Math.floor(Math.random() * 200) - 100;
                    const randomY = Math.floor(Math.random() * 200) - 100;
                    const randomZ = Math.floor(Math.random() * 200) - 100;
                    navigateToRoom(`${randomX},${randomY},${randomZ}`);
                  }}
                  disabled={isTyping}
                  className="w-full p-1 border rounded text-xs hover:bg-green-400 hover:text-black transition-colors"
                  style={{ borderColor: currentRoomData.color }}
                >
                  RANDOM WARP
                </button>
              </div>
            </div>

            {/* Secrets */}
            <div className="border border-green-400 p-3 rounded" style={{ borderColor: currentRoomData.color }}>
              <div className="text-xs mb-2" style={{ color: currentRoomData.color }}>
                ■ SECTOR_SECRETS
              </div>
              <div className="text-xs space-y-1">
                {currentRoomData.secrets.map((secret, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Lock className="w-3 h-3 flex-shrink-0" />
                    <span className="opacity-60 break-all">{secret}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Terminal */}
        <div className="flex-1 p-4 bg-black/95">
          <div 
            ref={terminalRef}
            className="h-full overflow-y-auto font-mono text-sm space-y-1"
          >
            {terminalLines.map((line, index) => (
              <div 
                key={index} 
                className={`${
                  line.startsWith('>') ? 'text-yellow-400' :
                  line.startsWith('[') ? 'text-blue-400' :
                  line.includes('⚡') || line.includes('🏴‍☠️') || line.includes('🔬') || line.includes('🌐') || line.includes('❓') ? 'text-white font-bold' :
                  'text-green-400'
                }`}
                style={{
                  color: line.startsWith('>') ? currentRoomData.color :
                         line.startsWith('[') ? '#87CEEB' :
                         line.includes('⚡') || line.includes('🏴‍☠️') || line.includes('🔬') || line.includes('🌐') || line.includes('❓') ? '#FFFFFF' :
                         '#90EE90'
                }}
              >
                {line}
              </div>
            ))}
            {isTyping && (
              <div className="inline-block w-2 h-4 bg-green-400 animate-pulse" style={{ backgroundColor: currentRoomData.color }}></div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black border-t border-green-400 p-2 text-xs flex justify-between items-center" style={{ borderColor: currentRoomData.color }}>
        <div className="flex items-center gap-4">
          <span style={{ color: currentRoomData.color }}>INFINITE_BONK_PROTOCOL_V∞</span>
          <span>EXPLORED: {visitedRooms.size.toLocaleString()}</span>
          <span>GENERATED: {totalRoomsGenerated.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>CURRENT: {currentRoom}</span>
          <span>UPTIME: {formatTime(timeInSystem)}</span>
          <span className="animate-pulse" style={{ color: currentRoomData.color }}>●</span>
        </div>
      </div>
    </div>
  );
};

export default BonkCyberBackrooms;