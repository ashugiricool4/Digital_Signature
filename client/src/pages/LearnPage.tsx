import { useState } from 'react';
import { ChevronRight, Key, FileText, Shield, CheckSquare, Zap, Play, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EducationCard from '@/components/EducationCard';
import { EDUCATION_CONTENT } from '@/lib/constants';

// Defines the structure of the education cards
interface EducationCardConfig {
  id: string;
  title: string;
  content: string[];
  icon: React.ReactNode;
  iconColor: string;
  iconBgColor: string;
  learnMoreColor: string;
}

const LearnPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const educationCards: EducationCardConfig[] = [
    {
      id: 'basics',
      title: EDUCATION_CONTENT.basics.title,
      content: EDUCATION_CONTENT.basics.content,
      icon: <Key className="h-5 w-5" />,
      iconColor: 'text-primary-600 dark:text-primary-400',
      iconBgColor: 'bg-primary-100 dark:bg-primary-900/50',
      learnMoreColor: 'text-primary-600 hover:text-primary-700 dark:text-primary-400',
    },
    {
      id: 'methods',
      title: EDUCATION_CONTENT.methods.title,
      content: EDUCATION_CONTENT.methods.content,
      icon: <FileText className="h-5 w-5" />,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBgColor: 'bg-blue-100 dark:bg-blue-900/50',
      learnMoreColor: 'text-blue-600 hover:text-blue-700 dark:text-blue-400',
    },
    {
      id: 'security',
      title: EDUCATION_CONTENT.security.title,
      content: EDUCATION_CONTENT.security.content,
      icon: <Shield className="h-5 w-5" />,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/50',
      learnMoreColor: 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400',
    },
    {
      id: 'usage',
      title: EDUCATION_CONTENT.usage.title,
      content: EDUCATION_CONTENT.usage.content,
      icon: <CheckSquare className="h-5 w-5" />,
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBgColor: 'bg-amber-100 dark:bg-amber-900/50',
      learnMoreColor: 'text-amber-600 hover:text-amber-700 dark:text-amber-400',
    },
    {
      id: 'advanced',
      title: EDUCATION_CONTENT.advanced.title,
      content: EDUCATION_CONTENT.advanced.content,
      icon: <Zap className="h-5 w-5" />,
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBgColor: 'bg-purple-100 dark:bg-purple-900/50',
      learnMoreColor: 'text-purple-600 hover:text-purple-700 dark:text-purple-400',
    },
    {
      id: 'demo',
      title: "Interactive Demo",
      content: [
        "Try our interactive demo to understand how blockchain signatures work with step-by-step visualization.",
        "Learn about key generation, message hashing, and signature verification in a visual format.",
        "See the cryptographic principles in action to better understand blockchain security."
      ],
      icon: <Play className="h-5 w-5" />,
      iconColor: 'text-rose-600 dark:text-rose-400',
      iconBgColor: 'bg-rose-100 dark:bg-rose-900/50',
      learnMoreColor: 'text-rose-600 hover:text-rose-700 dark:text-rose-400',
    }
  ];

  const handleExpandSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Blockchain Signatures: Learn</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Understand the fundamentals of blockchain signatures and how they work.
        </p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {educationCards.map((card) => (
              <EducationCard 
                key={card.id}
                title={card.title}
                contentList={card.content}
                icon={card.icon}
                iconColor={card.iconColor}
                iconBgColor={card.iconBgColor}
                learnMoreColor={card.learnMoreColor}
                onLearnMore={() => handleExpandSection(card.id)}
              />
            ))}
          </div>

          {/* Advanced content section - shows when a "Learn more" button is clicked */}
          {expandedSection && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
            >
              <h3 className="text-lg font-semibold mb-4">
                {educationCards.find(card => card.id === expandedSection)?.title}
              </h3>
              
              {expandedSection === 'basics' && (
                <div className="space-y-4">
                  <p className="text-slate-700 dark:text-slate-300">
                    Blockchain signatures are cryptographic signatures that utilize public key cryptography. When you create a blockchain wallet, you generate a private key and a corresponding public key. The private key is kept secret, while the public key is derivable from the private key and can be shared.
                  </p>
                  
                  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">How blockchain signatures work:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <li>A message (text, transaction data, document hash, etc.) is created</li>
                      <li>The message is hashed using a cryptographic hash function</li>
                      <li>The hash is signed with the user's private key, creating a signature</li>
                      <li>Anyone can verify the signature using the signer's public address</li>
                      <li>The verification process proves the message was signed by the owner of that private key</li>
                    </ol>
                  </div>
                  
                  <p className="text-slate-700 dark:text-slate-300">
                    The mathematical relationship between the private key, the message hash, and the signature ensures that without the private key, it's computationally infeasible to forge a valid signature.
                  </p>
                </div>
              )}
              
              {expandedSection === 'methods' && (
                <div className="space-y-4">
                  <p className="text-slate-700 dark:text-slate-300">
                    Ethereum and other blockchain platforms support several methods for signing data, each with specific use cases and security considerations.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">personal_sign</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        The most basic and user-friendly signing method. It prefixes the message with a standard string to prevent confusion with transaction signing. Used for simple authentication and message validation.
                      </p>
                      <pre className="bg-slate-200 dark:bg-slate-800 p-2 mt-2 text-xs overflow-x-auto rounded">
                        {`// Example\nawait ethereum.request({\n  method: 'personal_sign',\n  params: [message, address]\n});`}
                      </pre>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">EIP-712 Typed Data Signing</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        Provides human-readable structured data signing with better security and usability. Wallets can display a formatted version of what's being signed, making it clear to users what they're agreeing to.
                      </p>
                      <pre className="bg-slate-200 dark:bg-slate-800 p-2 mt-2 text-xs overflow-x-auto rounded">
                        {`// Example\nawait ethereum.request({\n  method: 'eth_signTypedData_v4',\n  params: [address, JSON.stringify(typedData)]\n});`}
                      </pre>
                    </div>
                  </div>
                  
                  <p className="text-slate-700 dark:text-slate-300">
                    For document signing, the process typically involves creating a hash of the document and then signing that hash. This is more efficient than signing the entire document and still provides cryptographic proof of document authenticity.
                  </p>
                </div>
              )}
              
              {expandedSection === 'security' && (
                <div className="space-y-4">
                  <p className="text-slate-700 dark:text-slate-300">
                    Security is paramount when dealing with cryptographic signatures since they can authorize transactions and have legal implications.
                  </p>
                  
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-red-700 dark:text-red-400">Common Security Risks:</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-red-700 dark:text-red-300">
                      <li>Phishing attacks that trick users into signing malicious messages</li>
                      <li>Blind signing of transaction data without understanding the implications</li>
                      <li>Replay attacks where a valid signature is reused in a different context</li>
                      <li>Private key compromise through malware or insecure storage</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-green-700 dark:text-green-400">Best Practices:</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-green-700 dark:text-green-300">
                      <li>Always use a hardware wallet for high-value accounts</li>
                      <li>Only sign messages from trusted sources with clear intentions</li>
                      <li>Verify what you're signing in your wallet interface</li>
                      <li>Use time-limited signatures when possible</li>
                      <li>Include nonces in messages to prevent replay attacks</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {expandedSection === 'usage' && (
                <div className="space-y-4">
                  <p className="text-slate-700 dark:text-slate-300">
                    Blockchain signatures have numerous practical applications beyond cryptocurrency transactions.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Authentication & Identity</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        Web3 applications use signatures to prove ownership of an address without requiring on-chain transactions. This allows for gasless authentication to websites and services.
                      </p>
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Examples: Login with Ethereum, DAO voting, decentralized identity verification
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Document Validation</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        Digital documents can be signed to prove authenticity and integrity. The document hash is signed, providing tamper-proof verification without revealing the document contents.
                      </p>
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Examples: Legal agreements, certificates, proof of ownership
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Off-chain Permissions</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        Signatures can authorize actions to be taken on behalf of the signer without requiring gas fees for each action. This is commonly used in NFT minting, token approvals, and more.
                      </p>
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Examples: Gasless NFT minting, meta-transactions, conditional authorizations
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Multi-signature Systems</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        Multiple parties can sign the same message or transaction, requiring a threshold of signatures before an action is authorized. This enhances security for high-value operations.
                      </p>
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Examples: Treasury management, secure asset transfers, organizational governance
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {expandedSection === 'advanced' && (
                <div className="space-y-4">
                  <p className="text-slate-700 dark:text-slate-300">
                    Advanced signature concepts extend the basic functionality to solve specific problems in blockchain applications.
                  </p>
                  
                  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Threshold Signatures</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      A cryptographic scheme where M out of N possible signers must provide valid signatures. This distributes trust across multiple parties while maintaining flexibility. Unlike basic multi-sig, threshold signatures produce a single signature, saving space and computation.
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Signature Aggregation</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Multiple signatures from different parties can be mathematically combined into a single, compact signature. This is useful for scaling blockchain systems by reducing the data needed to verify multiple signatures.
                    </p>
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Example technologies: BLS signatures, Schnorr signatures
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Zero-knowledge Signatures</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Zero-knowledge proofs allow you to prove you signed something without revealing the actual signature or other sensitive information. This enables privacy-preserving verification for applications where confidentiality is important.
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Time-bound and Conditional Signatures</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Signatures can incorporate expiration times or other conditions directly in the signed message. This prevents signatures from being valid indefinitely and enables more complex authorization schemes.
                    </p>
                  </div>
                </div>
              )}
              
              {expandedSection === 'demo' && (
                <div className="space-y-4">
                  <p className="text-slate-700 dark:text-slate-300">
                    Our interactive demo provides a step-by-step visualization of the blockchain signature process, from key generation to signature verification.
                  </p>
                  
                  <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg text-center">
                    <h4 className="font-medium mb-4">Signature Process Visualization</h4>
                    
                    <div className="flex justify-center mb-8">
                      <div className="relative">
                        {/* Simple animation of the signature process */}
                        <svg width="500" height="120" viewBox="0 0 500 120" className="max-w-full">
                          <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                              <polygon points="0 0, 10 3.5, 0 7" fill="#4F46E5" />
                            </marker>
                          </defs>
                          
                          {/* Message */}
                          <rect x="10" y="10" width="100" height="40" rx="4" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="1" />
                          <text x="60" y="35" fontSize="12" fontFamily="monospace" textAnchor="middle" fill="#4338CA">Message</text>
                          
                          {/* Hash */}
                          <rect x="190" y="10" width="120" height="40" rx="4" fill="#C7D2FE" stroke="#4F46E5" strokeWidth="1" />
                          <text x="250" y="35" fontSize="12" fontFamily="monospace" textAnchor="middle" fill="#4338CA">Hash Function</text>
                          
                          {/* Signature */}
                          <rect x="390" y="10" width="100" height="40" rx="4" fill="#A5B4FC" stroke="#4F46E5" strokeWidth="1" />
                          <text x="440" y="35" fontSize="12" fontFamily="monospace" textAnchor="middle" fill="#312E81">Signature</text>
                          
                          {/* Private Key */}
                          <rect x="190" y="80" width="120" height="30" rx="4" fill="#818CF8" stroke="#4F46E5" strokeWidth="1" />
                          <text x="250" y="100" fontSize="12" fontFamily="monospace" textAnchor="middle" fill="white">Private Key</text>
                          
                          {/* Arrows */}
                          <line x1="110" y1="30" x2="190" y2="30" stroke="#4F46E5" strokeWidth="2" markerEnd="url(#arrowhead)" />
                          <line x1="310" y1="30" x2="390" y2="30" stroke="#4F46E5" strokeWidth="2" markerEnd="url(#arrowhead)" />
                          <line x1="250" y1="80" x2="250" y2="50" stroke="#4F46E5" strokeWidth="2" markerEnd="url(#arrowhead)" />
                          
                          {/* Animation */}
                          <circle className="animate-pulse" cx="150" cy="30" r="5" fill="#4F46E5" />
                          <circle className="animate-pulse" cx="350" cy="30" r="5" fill="#4F46E5" />
                          <circle className="animate-pulse" cx="250" cy="65" r="5" fill="#4F46E5" />
                        </svg>
                      </div>
                    </div>
                    
                    <Button variant="default" className="bg-rose-600 hover:bg-rose-700">
                      Start Interactive Demo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">1. Key Generation</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        Learn how public and private keys are generated and how they mathematically relate to each other.
                      </p>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">2. Message Signing</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        See how messages are hashed and then signed using the private key to create a unique signature.
                      </p>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">3. Verification</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        Understand how others can verify your signature using only your public address and the signed message.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </TabsContent>

        {/* Tutorials Tab Content */}
        <TabsContent value="tutorials">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="aspect-video bg-slate-100 dark:bg-slate-700 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-primary-600/90 rounded-full h-16 w-16 flex items-center justify-center cursor-pointer hover:bg-primary-700/90 transition-colors">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-white font-medium">Getting Started with BlockSign</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  Learn how to sign your first message with BlockSign and verify signatures from others. Perfect for beginners.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Duration: 5:24</span>
                  <Button variant="ghost" size="sm" className="text-primary-600 dark:text-primary-400">
                    Watch Tutorial <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="aspect-video bg-slate-100 dark:bg-slate-700 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-primary-600/90 rounded-full h-16 w-16 flex items-center justify-center cursor-pointer hover:bg-primary-700/90 transition-colors">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-white font-medium">Advanced Document Signing</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  Explore document signing with hash verification, templates, and timestamping for legally-viable signatures.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Duration: 8:12</span>
                  <Button variant="ghost" size="sm" className="text-primary-600 dark:text-primary-400">
                    Watch Tutorial <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="aspect-video bg-slate-100 dark:bg-slate-700 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-primary-600/90 rounded-full h-16 w-16 flex items-center justify-center cursor-pointer hover:bg-primary-700/90 transition-colors">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-white font-medium">Understanding EIP-712 Typed Data</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  Learn how to use structured data signing for better security and user experience in blockchain applications.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Duration: 7:35</span>
                  <Button variant="ghost" size="sm" className="text-primary-600 dark:text-primary-400">
                    Watch Tutorial <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="aspect-video bg-slate-100 dark:bg-slate-700 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-primary-600/90 rounded-full h-16 w-16 flex items-center justify-center cursor-pointer hover:bg-primary-700/90 transition-colors">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-white font-medium">Secure Signature Practices</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  Best practices for secure cryptographic signatures and avoiding common risks and pitfalls.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Duration: 6:48</span>
                  <Button variant="ghost" size="sm" className="text-primary-600 dark:text-primary-400">
                    Watch Tutorial <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Resources Tab Content */}
        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-full mb-4">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">External Resources</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Explore these resources to deepen your understanding of blockchain signatures and cryptography.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-medium mb-4">Official Documentation</h3>
              <ul className="space-y-3">
                <li>
                  <a href="https://docs.metamask.io/guide/signing-data.html" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">MetaMask Signing Data Guide</span>
                  </a>
                </li>
                <li>
                  <a href="https://eips.ethereum.org/EIPS/eip-712" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">EIP-712: Ethereum Typed Structured Data Hashing and Signing</span>
                  </a>
                </li>
                <li>
                  <a href="https://docs.ethers.org/v5/api/signer/" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">Ethers.js Signer Documentation</span>
                  </a>
                </li>
                <li>
                  <a href="https://web3js.readthedocs.io/en/v1.7.5/web3-eth-personal.html" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">Web3.js Personal Module for Signing</span>
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-medium mb-4">Tutorials & Articles</h3>
              <ul className="space-y-3">
                <li>
                  <a href="https://ethereum.org/en/developers/tutorials/how-to-validate-ethereum-signatures/" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">How to Validate Ethereum Signatures</span>
                  </a>
                </li>
                <li>
                  <a href="https://medium.com/mycrypto/the-magic-of-digital-signatures-on-ethereum-98fe184dc9c7" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">The Magic of Digital Signatures on Ethereum</span>
                  </a>
                </li>
                <li>
                  <a href="https://blog.openzeppelin.com/signing-and-verifying-messages-in-ethereum/" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">Signing and Verifying Messages in Ethereum</span>
                  </a>
                </li>
                <li>
                  <a href="https://consensys.net/blog/developers/guide-to-smart-contract-security-tools/" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">Guide to Smart Contract Security Tools</span>
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-medium mb-4">Tools & Libraries</h3>
              <ul className="space-y-3">
                <li>
                  <a href="https://github.com/ethers-io/ethers.js/" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">Ethers.js - Complete Ethereum Library</span>
                  </a>
                </li>
                <li>
                  <a href="https://github.com/WalletConnect/web3modal" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">Web3Modal - Wallet Connection Library</span>
                  </a>
                </li>
                <li>
                  <a href="https://github.com/OpenZeppelin/openzeppelin-contracts" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">OpenZeppelin - Secure Smart Contract Libraries</span>
                  </a>
                </li>
                <li>
                  <a href="https://github.com/spruceid/siwe" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">Sign-In with Ethereum (SIWE) Library</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>

        {/* FAQ Tab Content */}
        <TabsContent value="faq">
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                <details className="group p-6">
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">What is a blockchain signature?</h3>
                    <ChevronRight className="h-5 w-5 text-slate-500 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-3 text-slate-600 dark:text-slate-300">
                    <p>A blockchain signature is a cryptographic proof that the owner of a specific private key has authorized a message or transaction. It uses public key cryptography where a private key creates the signature, and anyone with the corresponding public address can verify it without knowing the private key.</p>
                  </div>
                </details>

                <details className="group p-6">
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">How is signing different from sending a transaction?</h3>
                    <ChevronRight className="h-5 w-5 text-slate-500 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-3 text-slate-600 dark:text-slate-300">
                    <p>Signing a message is an off-chain action that doesn't modify blockchain state or require gas fees. It simply creates a cryptographic signature that proves you authorized a specific message. Transactions, on the other hand, are on-chain operations that change blockchain state, require gas fees, and are processed by network validators.</p>
                  </div>
                </details>

                <details className="group p-6">
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Are blockchain signatures legally binding?</h3>
                    <ChevronRight className="h-5 w-5 text-slate-500 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-3 text-slate-600 dark:text-slate-300">
                    <p>In many jurisdictions, cryptographic signatures can be legally binding under electronic signature laws. For example, in the United States, the ESIGN Act and UETA generally recognize electronic signatures as legally valid. However, for important legal documents, you should consult a legal professional familiar with blockchain technology and the relevant jurisdiction.</p>
                  </div>
                </details>

                <details className="group p-6">
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">What should I do if I accidentally signed a malicious message?</h3>
                    <ChevronRight className="h-5 w-5 text-slate-500 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-3 text-slate-600 dark:text-slate-300">
                    <p>If you believe you've signed a malicious message that could compromise your assets:</p>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Transfer any at-risk assets to a new, secure wallet immediately</li>
                      <li>Revoke any token approvals that might have been granted (use tools like Revoke.cash)</li>
                      <li>If it was a malicious dApp, report it to security services like MetaMask's PhishFort</li>
                      <li>Consider using a hardware wallet for additional security going forward</li>
                    </ol>
                  </div>
                </details>

                <details className="group p-6">
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Can I verify signatures from other blockchains?</h3>
                    <ChevronRight className="h-5 w-5 text-slate-500 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-3 text-slate-600 dark:text-slate-300">
                    <p>Yes, many blockchains use the same elliptic curve cryptography (secp256k1) for signatures, so the verification process is often compatible across networks like Ethereum, Binance Smart Chain, Polygon, etc. However, some blockchains might use different signature schemes or formats, which would require specific verification methods.</p>
                  </div>
                </details>

                <details className="group p-6">
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Do I need gas (ETH) to sign messages?</h3>
                    <ChevronRight className="h-5 w-5 text-slate-500 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-3 text-slate-600 dark:text-slate-300">
                    <p>No, signing messages is an off-chain operation that happens entirely in your wallet. It doesn't require any gas fees or ETH balance. This makes signatures useful for authentication, proving ownership, and authorizing actions without transaction costs.</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Add missing ExternalLink component used in Resources
const ExternalLink = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

export default LearnPage;
