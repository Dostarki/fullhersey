import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

const PrivacyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-500/30">
      <AnimatedBackground />
      <Navbar />

      <main className="relative pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: January 18, 2025</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p>
              Spectre Protocol ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our decentralized application and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Data Collection</h2>
            <p>
              As a decentralized protocol, we do not collect personal identification information (PII) such as your name, email address, or IP address. 
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>We do not track your IP address or geolocation.</li>
              <li>We do not use cookies for tracking purposes.</li>
              <li>We do not store your wallet private keys.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. On-Chain Data</h2>
            <p>
              Please be aware that all transactions on the Solana blockchain are public. While Spectre Protocol uses Zero-Knowledge (ZK) proofs to break the link between sender and receiver, the deposit and withdrawal transactions themselves are recorded on the public ledger.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Local Storage</h2>
            <p>
              We use local storage on your device solely to improve your user experience, such as remembering your theme preference or caching non-sensitive application state. This data never leaves your device.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPage;
