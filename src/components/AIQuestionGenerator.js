// components/AIQuestionGenerator.js
import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  Plus, 
  RefreshCw, 
  Check, 
  X, 
  Zap,
  Target,
  AlertTriangle,
  Wand2,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { useGame } from '../context/GameContext';

const AIQuestionGenerator = ({ onQuestionsGenerated }) => {
  const { actions } = useGame();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());
  const [error, setError] = useState(null);
  const [generationSettings, setGenerationSettings] = useState({
    category: 'blockchain',
    difficulty: 'medium',
    count: 5,
    style: 'technical',
    topic: ''
  });

  const categories = [
    { value: 'blockchain', label: 'Blockchain & Crypto' },
    { value: 'defi', label: 'DeFi & Protocols' },
    { value: 'nft', label: 'NFTs & Digital Assets' },
    { value: 'meme', label: 'Meme Coins & Culture' },
    { value: 'history', label: 'Crypto History' },
    { value: 'gaming', label: 'GameFi & Web3 Gaming' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy (Beginner)' },
    { value: 'medium', label: 'Medium (Intermediate)' },
    { value: 'hard', label: 'Hard (Expert)' }
  ];

  const styles = [
    { value: 'technical', label: 'Technical (Protocols, Tech)' },
    { value: 'practical', label: 'Practical (Usage, Applications)' },
    { value: 'historical', label: 'Historical (Events, Timeline)' },
    { value: 'current', label: 'Current Events (Recent News)' },
    { value: 'fun', label: 'Fun Facts (Trivia, Memes)' }
  ];

  // Mock AI question generation (replace with actual AI service)
  const generateQuestionsWithAI = async (settings) => {
    // Simulate AI generation with realistic delay
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));

    // Extensive question templates based on category and difficulty
    const questionTemplates = {
      blockchain: {
        easy: [
          {
            question: "What does 'HODL' stand for in cryptocurrency culture?",
            options: ["Hold On for Dear Life", "Hold Original Digital Ledger", "High Order Digital Logic", "Hold On Despite Loss"],
            correct: 0
          },
          {
            question: "Which cryptocurrency is known as 'digital gold'?",
            options: ["Ethereum", "Bitcoin", "Litecoin", "Ripple"],
            correct: 1
          },
          {
            question: "What is the maximum supply of Bitcoin?",
            options: ["21 million", "100 million", "1 billion", "Unlimited"],
            correct: 0
          },
          {
            question: "What consensus mechanism does Bitcoin use?",
            options: ["Proof of Stake", "Proof of Work", "Delegated Proof of Stake", "Proof of Authority"],
            correct: 1
          },
          {
            question: "What is a blockchain wallet used for?",
            options: ["Mining cryptocurrency", "Storing private keys", "Creating new blockchains", "Validating transactions"],
            correct: 1
          },
          {
            question: "Who is the pseudonymous creator of Bitcoin?",
            options: ["Vitalik Buterin", "Satoshi Nakamoto", "Gavin Andresen", "Nick Szabo"],
            correct: 1
          },
          {
            question: "What is a hash function in blockchain?",
            options: ["A password generator", "A one-way mathematical function", "A mining algorithm", "A wallet address"],
            correct: 1
          },
          {
            question: "What does 'FUD' mean in crypto?",
            options: ["Fear, Uncertainty, Doubt", "Fully Unified Database", "Future Utility Dividend", "Fast User Download"],
            correct: 0
          },
          {
            question: "What is a private key?",
            options: ["A public wallet address", "A secret code to access funds", "A blockchain identifier", "A mining reward"],
            correct: 1
          },
          {
            question: "What does 'FOMO' stand for?",
            options: ["Fear of Missing Out", "Fully Optimized Market Order", "Future Option Market Open", "Fast Online Money Order"],
            correct: 0
          }
        ],
        medium: [
          {
            question: "What consensus mechanism does Ethereum 2.0 use?",
            options: ["Proof of Work", "Proof of Stake", "Delegated Proof of Stake", "Proof of Authority"],
            correct: 1
          },
          {
            question: "Which blockchain feature ensures immutability of data?",
            options: ["Smart contracts", "Cryptographic hashing", "Mining rewards", "Gas fees"],
            correct: 1
          },
          {
            question: "What is a 51% attack in blockchain?",
            options: ["Stealing 51% of tokens", "Controlling majority of network hash rate", "Hacking 51% of wallets", "Owning 51% of nodes"],
            correct: 1
          },
          {
            question: "What does 'gas' refer to in Ethereum?",
            options: ["Physical fuel", "Transaction fees", "Mining difficulty", "Block size"],
            correct: 1
          },
          {
            question: "What is a smart contract?",
            options: ["A legal document", "Self-executing code on blockchain", "A mining contract", "An exchange agreement"],
            correct: 1
          }
        ],
        hard: [
          {
            question: "What is the Byzantine Generals Problem in blockchain context?",
            options: ["Network latency issues", "Achieving consensus in distributed systems", "Mining difficulty adjustment", "Smart contract execution"],
            correct: 1
          },
          {
            question: "What is a Merkle tree used for in blockchain?",
            options: ["Storing private keys", "Efficient data verification", "Mining algorithms", "Wallet generation"],
            correct: 1
          }
        ]
      },
      defi: {
        easy: [
          {
            question: "What does DeFi stand for?",
            options: ["Digital Finance", "Decentralized Finance", "Distributed Finance", "Direct Finance"],
            correct: 1
          },
          {
            question: "What is a liquidity pool in DeFi?",
            options: ["A type of wallet", "A collection of funds locked in a smart contract", "A mining pool", "A staking mechanism"],
            correct: 1
          },
          {
            question: "What is yield farming in DeFi?",
            options: ["Growing crops", "Earning rewards by providing liquidity", "Mining cryptocurrency", "Staking tokens"],
            correct: 1
          },
          {
            question: "What is a DEX?",
            options: ["Decentralized Exchange", "Digital Exchange X", "Distributed Execution", "Direct Exchange"],
            correct: 0
          },
          {
            question: "What does TVL stand for in DeFi?",
            options: ["Total Value Locked", "Token Value Limit", "Transaction Volume Level", "Trading Value Logic"],
            correct: 0
          }
        ],
        medium: [
          {
            question: "What is impermanent loss in DeFi?",
            options: ["Permanent loss of funds", "Temporary price volatility", "Loss relative to holding assets", "Gas fee losses"],
            correct: 2
          },
          {
            question: "Which protocol is known for automated market making (AMM)?",
            options: ["Compound", "Uniswap", "Aave", "MakerDAO"],
            correct: 1
          },
          {
            question: "What is a flash loan in DeFi?",
            options: ["Very fast loan approval", "Uncollateralized loan within single transaction", "Small amount loan", "Emergency loan"],
            correct: 1
          }
        ],
        hard: [
          {
            question: "What is the primary risk of flash loans in DeFi?",
            options: ["High interest rates", "Liquidation risk", "Smart contract exploits", "Market volatility"],
            correct: 2
          }
        ]
      },
      nft: {
        easy: [
          {
            question: "What does NFT stand for?",
            options: ["New File Type", "Non-Fungible Token", "Network File Transfer", "Next Finance Technology"],
            correct: 1
          },
          {
            question: "Which blockchain was first widely used for NFTs?",
            options: ["Bitcoin", "Ethereum", "Solana", "Polygon"],
            correct: 1
          },
          {
            question: "What makes an NFT 'non-fungible'?",
            options: ["It's expensive", "Each token is unique", "It can't be traded", "It's not digital"],
            correct: 1
          }
        ],
        medium: [
          {
            question: "What is the ERC-721 standard used for?",
            options: ["Fungible tokens", "Non-fungible tokens", "Smart contracts", "DeFi protocols"],
            correct: 1
          }
        ],
        hard: [
          {
            question: "What is the difference between ERC-721 and ERC-1155?",
            options: ["721 is newer", "1155 allows multiple tokens per contract", "721 is more expensive", "1155 is only for gaming"],
            correct: 1
          }
        ]
      },
      meme: {
        easy: [
          {
            question: "Which meme coin features a Shiba Inu dog?",
            options: ["PEPE", "DOGE", "FLOKI", "SHIB"],
            correct: 1
          },
          {
            question: "What animal is the BONK token mascot?",
            options: ["Cat", "Dog", "Frog", "Hamster"],
            correct: 1
          },
          {
            question: "Who is associated with promoting Dogecoin?",
            options: ["Vitalik Buterin", "Elon Musk", "Satoshi Nakamoto", "Mark Cuban"],
            correct: 1
          }
        ],
        medium: [
          {
            question: "Which meme coin was created as a joke based on Dogecoin?",
            options: ["SHIB", "FLOKI", "BABYDOGE", "SAFEMOON"],
            correct: 0
          }
        ],
        hard: [
          {
            question: "What market cap milestone did DOGE reach in 2021?",
            options: ["$1 billion", "$10 billion", "$80+ billion", "$100 billion"],
            correct: 2
          }
        ]
      },
      history: {
        easy: [
          {
            question: "When was Bitcoin created?",
            options: ["2008", "2009", "2010", "2011"],
            correct: 1
          },
          {
            question: "What was the first recorded Bitcoin transaction?",
            options: ["Pizza purchase", "Coffee purchase", "Car purchase", "House purchase"],
            correct: 0
          },
          {
            question: "How many pizzas were bought with 10,000 Bitcoin in 2010?",
            options: ["1", "2", "5", "10"],
            correct: 1
          }
        ],
        medium: [
          {
            question: "What was The DAO hack of 2016?",
            options: ["Bitcoin theft", "Ethereum smart contract exploit", "Exchange hack", "Mining attack"],
            correct: 1
          }
        ],
        hard: [
          {
            question: "What was the block size debate in Bitcoin?",
            options: ["Storage costs", "Scalability and decentralization trade-offs", "Mining rewards", "Transaction fees"],
            correct: 1
          }
        ]
      },
      gaming: {
        easy: [
          {
            question: "What does GameFi stand for?",
            options: ["Game Finance", "Gaming WiFi", "Game File", "Gaming First"],
            correct: 0
          },
          {
            question: "What is Play-to-Earn (P2E)?",
            options: ["Pay to Enter", "Play to Earn rewards", "Player to Everyone", "Point to End"],
            correct: 1
          }
        ],
        medium: [
          {
            question: "What is the metaverse in gaming?",
            options: ["Game universe", "Virtual shared space", "Gaming platform", "Player community"],
            correct: 1
          }
        ],
        hard: [
          {
            question: "What is the difference between Web2 and Web3 gaming?",
            options: ["Graphics quality", "Ownership and monetization models", "Game complexity", "Player count"],
            correct: 1
          }
        ]
      }
    };

    // Get appropriate questions based on settings
    const categoryQuestions = questionTemplates[settings.category] || questionTemplates.blockchain;
    const difficultyQuestions = categoryQuestions[settings.difficulty] || categoryQuestions.easy;
    
    // Create more variety by mixing questions and adding variations
    const baseQuestions = [...difficultyQuestions];
    const generatedQuestions = [];
    
    // If we need more questions than available, we'll create variations
    for (let i = 0; i < settings.count; i++) {
      const questionIndex = i % baseQuestions.length;
      const baseQuestion = baseQuestions[questionIndex];
      
      // Add some variation to repeated questions
      let questionText = baseQuestion.question;
      if (i >= baseQuestions.length) {
        // Add slight variations for repeated questions
        const variations = [
          "In crypto, " + questionText.toLowerCase(),
          "Which of the following is correct: " + questionText,
          questionText + " (Select the best answer)",
          "Regarding blockchain technology: " + questionText.toLowerCase()
        ];
        questionText = variations[Math.floor(Math.random() * variations.length)];
      }
      
      generatedQuestions.push({
        id: `ai_generated_${Date.now()}_${i}`,
        question: questionText,
        options: [...baseQuestion.options],
        correct: baseQuestion.correct,
        category: settings.category,
        difficulty: settings.difficulty,
        isAIGenerated: true,
        generatedAt: new Date().toISOString(),
        topic: settings.topic || `${settings.style} ${settings.category}`,
        style: settings.style
      });
    }

    return generatedQuestions;
  };

  const handleGenerate = async () => {
    if (!generationSettings.category || generationSettings.count < 1 || generationSettings.count > 20) {
      setError('Please select valid generation settings');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedQuestions([]);
    setSelectedQuestions(new Set());

    try {
      const questions = await generateQuestionsWithAI(generationSettings);
      setGeneratedQuestions(questions);
      // Select all by default
      setSelectedQuestions(new Set(questions.map(q => q.id)));
    } catch (err) {
      setError('Failed to generate questions: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleQuestionSelection = (questionId) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const selectAllQuestions = () => {
    setSelectedQuestions(new Set(generatedQuestions.map(q => q.id)));
  };

  const deselectAllQuestions = () => {
    setSelectedQuestions(new Set());
  };

  const addSelectedQuestions = async () => {
    const questionsToAdd = generatedQuestions.filter(q => selectedQuestions.has(q.id));
    
    if (questionsToAdd.length === 0) {
      setError('Please select at least one question to add');
      return;
    }

    try {
      setIsGenerating(true);
      
      // Add questions to the database
      for (const question of questionsToAdd) {
        const { id, isAIGenerated, generatedAt, topic, style, ...questionData } = question;
        await actions.addQuestion({
          ...questionData,
          aiGenerated: true,
          generatedTopic: topic,
          createdAt: new Date().toISOString()
        });
      }

      // Clear generated questions and notify parent
      setGeneratedQuestions([]);
      setSelectedQuestions(new Set());
      onQuestionsGenerated?.(questionsToAdd.length);
      
    } catch (err) {
      setError('Failed to add questions: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gray-800/60 backdrop-blur-md rounded-xl p-6 border border-gray-700 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <Brain className="w-8 h-8 text-purple-400 animate-pulse" />
          <div className="absolute inset-0 w-8 h-8 bg-purple-400/30 rounded-full animate-ping"></div>
        </div>
        <h2 className="font-bebas text-2xl text-purple-400">AI QUESTION GENERATOR</h2>
        <Sparkles className="w-6 h-6 text-yellow-400" />
      </div>

      {/* Generation Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="font-space block text-white font-bold mb-2">Category</label>
          <select
            value={generationSettings.category}
            onChange={(e) => setGenerationSettings(prev => ({ ...prev, category: e.target.value }))}
            className="font-space w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-purple-400/50 focus:outline-none"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value} className="bg-gray-800">{cat.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-space block text-white font-bold mb-2">Difficulty</label>
          <select
            value={generationSettings.difficulty}
            onChange={(e) => setGenerationSettings(prev => ({ ...prev, difficulty: e.target.value }))}
            className="font-space w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-purple-400/50 focus:outline-none"
          >
            {difficulties.map(diff => (
              <option key={diff.value} value={diff.value} className="bg-gray-800">{diff.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-space block text-white font-bold mb-2">Style</label>
          <select
            value={generationSettings.style}
            onChange={(e) => setGenerationSettings(prev => ({ ...prev, style: e.target.value }))}
            className="font-space w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-purple-400/50 focus:outline-none"
          >
            {styles.map(style => (
              <option key={style.value} value={style.value} className="bg-gray-800">{style.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-space block text-white font-bold mb-2">Count</label>
          <input
            type="number"
            min="1"
            max="20"
            value={generationSettings.count}
            onChange={(e) => setGenerationSettings(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
            className="font-space w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-purple-400/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="font-space block text-white font-bold mb-2">Topic (Optional)</label>
          <input
            type="text"
            value={generationSettings.topic}
            onChange={(e) => setGenerationSettings(prev => ({ ...prev, topic: e.target.value }))}
            placeholder="e.g., Solana, DeFi"
            className="font-space w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-400/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="font-bebas bg-purple-600 text-white py-3 px-6 rounded-xl hover:bg-purple-700 disabled:bg-gray-600 disabled:text-gray-400 transition-all flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              GENERATING...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              GENERATE QUESTIONS
            </>
          )}
        </button>

        {generatedQuestions.length > 0 && (
          <div className="font-space text-gray-300">
            Generated {generatedQuestions.length} questions
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-600/20 border border-red-400/50 rounded-xl p-3 mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="font-space text-red-400 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Generated Questions */}
      {generatedQuestions.length > 0 && (
        <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bebas text-lg text-yellow-400 flex items-center gap-2">
              <Target className="w-5 h-5" />
              GENERATED QUESTIONS ({selectedQuestions.size} selected)
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={selectAllQuestions}
                className="font-space text-sm bg-blue-600 text-white py-1 px-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={deselectAllQuestions}
                className="font-space text-sm bg-gray-600 text-white py-1 px-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Deselect All
              </button>
              <button
                onClick={addSelectedQuestions}
                disabled={selectedQuestions.size === 0 || isGenerating}
                className="font-bebas bg-yellow-400 text-gray-900 py-2 px-4 rounded-lg hover:bg-yellow-300 disabled:bg-gray-600 disabled:text-gray-400 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                ADD SELECTED ({selectedQuestions.size})
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {generatedQuestions.map((question, index) => (
              <div key={question.id} className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                selectedQuestions.has(question.id)
                  ? 'border-yellow-400 bg-yellow-400/10'
                  : 'border-gray-600 bg-gray-800/40 hover:border-gray-500'
              }`} onClick={() => toggleQuestionSelection(question.id)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bebas text-yellow-400">Q{index + 1}</span>
                      <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selectedQuestions.has(question.id)
                          ? 'bg-yellow-400 border-yellow-400'
                          : 'border-gray-600'
                      }`}>
                        {selectedQuestions.has(question.id) && (
                          <Check className="w-4 h-4 text-gray-900" />
                        )}
                      </span>
                    </div>
                    
                    <h4 className="font-space text-white font-semibold mb-3">{question.question}</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className={`p-2 rounded-lg text-sm ${
                          optIndex === question.correct
                            ? 'bg-green-600/30 border border-green-400/50 text-green-400'
                            : 'bg-gray-700/60 text-gray-300'
                        }`}>
                          <span className="font-bebas mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                          {option}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="capitalize">{question.category}</span>
                      <span className="capitalize">{question.difficulty}</span>
                      {question.topic && <span>Topic: {question.topic}</span>}
                      <span className="flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        AI Generated
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-blue-600/20 border border-blue-400/50 rounded-xl p-4 mt-6">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <h4 className="font-bebas text-blue-400">AI GENERATION TIPS</h4>
        </div>
        <ul className="font-space text-sm text-blue-300 space-y-1">
          <li>• Choose specific topics for more targeted questions</li>
          <li>• Start with 5-10 questions to review quality</li>
          <li>• Mix different difficulties for varied gameplay</li>
          <li>• Review generated questions before adding to your bank</li>
          <li>• Use different styles to create diverse question types</li>
        </ul>
      </div>
    </div>
  );
};

export default AIQuestionGenerator;