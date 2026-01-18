import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

const TermsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-500/30">
      <AnimatedBackground />
      <Navbar />

      <main className="relative pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">Terms of Service</h1>
        <p className="text-gray-400 mb-8">Last updated: January 18, 2025</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using Spectre Protocol, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
            <p>
              Spectre Protocol is a decentralized privacy layer on the Solana blockchain. We provide a user interface for interacting with the protocol's smart contracts. We do not take custody of your assets, and we do not facilitate the transfer of funds.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Responsibilities</h2>
            <p>
              You are responsible for:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Ensuring the security of your wallet and private keys.</li>
              <li>Complying with all applicable laws and regulations in your jurisdiction.</li>
              <li>Understanding the risks associated with decentralized finance (DeFi) and blockchain technology.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. No Liability</h2>
            <p>
              Spectre Protocol is provided "as is" without any warranty. We are not liable for any damages, including but not limited to loss of funds, smart contract failures, or network congestion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Modifications</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the protocol constitutes acceptance of the new terms.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;
