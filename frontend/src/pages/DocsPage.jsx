import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Shield, ArrowRight, Code, Lock, RefreshCw, Zap, Server } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

const DocsPage = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: <Shield className="w-6 h-6 text-green-400" />,
      content: (
        <div className="space-y-4 text-gray-400">
          <p>
            <strong className="text-white">Spectre Protocol</strong> is a privacy-first liquidity layer built on Solana. 
            It enables users to shield their assets, execute swaps privately, and transfer funds without exposing their main wallet history.
          </p>
          <p>
            By leveraging Zero-Knowledge (ZK) proofs and a unified liquidity pool, Spectre breaks the on-chain link between the sender and the receiver, providing transactional privacy similar to cash.
          </p>
        </div>
      )
    },
    {
      id: 'architecture',
      title: 'Architecture',
      icon: <Server className="w-6 h-6 text-purple-400" />,
      content: (
        <div className="space-y-4 text-gray-400">
          <p>
            The protocol consists of three main components:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-white">Shielded Pool (Vault):</strong> A smart contract that holds all deposited assets. When you deposit, you receive a private note (proof of deposit).
            </li>
            <li>
              <strong className="text-white">Relayer Network:</strong> A set of nodes that process transactions on behalf of users. They pay the gas fees and submit proofs, ensuring the user's IP and wallet remain disconnected.
            </li>
            <li>
              <strong className="text-white">Internal Wallet System:</strong> Temporary, ephemeral wallets used to interact with DeFi protocols (like Jupiter) on behalf of the user, without revealing the user's identity.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Core Features',
      icon: <Zap className="w-6 h-6 text-blue-400" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <h4 className="text-white font-bold flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-green-400" /> Shield & Unshield
            </h4>
            <p className="text-sm">Deposit SOL/SPL tokens into the shielded pool to break the transaction history. Withdraw anytime to a fresh wallet.</p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <h4 className="text-white font-bold flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-purple-400" /> Private Swap
            </h4>
            <p className="text-sm">Swap tokens using Jupiter Aggregator without revealing your main wallet. The swap is executed via an internal ephemeral wallet.</p>
          </div>
        </div>
      )
    },
    {
      id: 'api',
      title: 'API Reference',
      icon: <Code className="w-6 h-6 text-yellow-400" />,
      content: (
        <div className="space-y-4 text-gray-400">
          <p>Spectre provides a REST API for developers to integrate privacy features into their dApps.</p>
          
          <div className="bg-black/50 p-4 rounded-xl border border-white/10 font-mono text-xs overflow-x-auto">
            <div className="mb-4">
              <span className="text-green-400">GET</span> <span className="text-white">/api/balance/portfolio</span>
              <p className="text-gray-500 mt-1">Returns the shielded assets (tokens) for the authenticated user.</p>
            </div>
            <div className="mb-4">
              <span className="text-blue-400">POST</span> <span className="text-white">/api/swap/execute</span>
              <p className="text-gray-500 mt-1">Executes a private swap via Jupiter using shielded funds.</p>
            </div>
            <div>
              <span className="text-purple-400">POST</span> <span className="text-white">/api/transfer/internal</span>
              <p className="text-gray-500 mt-1">Transfers assets privately between two shielded addresses.</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-500/30">
      <AnimatedBackground />
      <Navbar />

      <main className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Documentation v2.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-600">
            Spectre <span className="text-green-400">Docs</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Technical documentation, API references, and guides for the Spectre Privacy Protocol.
            Learn how to integrate privacy into your Solana workflow.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar Navigation */}
          <div className="hidden lg:block col-span-1 sticky top-32 h-fit">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Contents</h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <a 
                    key={section.id}
                    href={`#${section.id}`}
                    className="block px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-1 lg:col-span-3 space-y-12">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-32">
                <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-green-500/20 transition-colors duration-500 group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-white/5 rounded-xl group-hover:bg-green-500/10 group-hover:text-green-400 transition-colors">
                      {section.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    {section.content}
                  </div>
                </div>
              </section>
            ))}

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-green-500/10 to-purple-500/10 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Ready to start?</h3>
                <p className="text-gray-400 text-sm">Launch the app and experience privacy on Solana today.</p>
              </div>
              <a 
                href="/app" 
                className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-green-400 transition-colors shadow-lg hover:scale-105 duration-300"
              >
                Launch App <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DocsPage;
