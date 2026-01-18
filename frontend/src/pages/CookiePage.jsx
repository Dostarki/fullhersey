import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

const CookiePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-500/30">
      <AnimatedBackground />
      <Navbar />

      <main className="relative pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">Cookie Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: January 18, 2025</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Cookies</h2>
            <p>
              Spectre Protocol respects your privacy. We use a minimal number of cookies strictly for:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Essential Functions:</strong> Remembering your session settings or theme preferences.</li>
              <li><strong>Performance:</strong> Ensuring the website loads quickly and efficiently.</li>
            </ul>
            <p className="mt-4">
              We <strong>do not</strong> use cookies for:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Tracking your browsing history across other websites.</li>
              <li>Collecting personal data for advertising.</li>
              <li>Selling your data to third parties.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Managing Cookies</h2>
            <p>
              You can control and manage cookies through your browser settings. You can choose to block or delete cookies, but please note that some features of our website may not function correctly if you do so.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CookiePage;
