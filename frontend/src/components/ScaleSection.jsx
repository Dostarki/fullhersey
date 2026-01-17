import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Globe, Cpu } from 'lucide-react';

const ScaleSection = () => {
  const milestones = [
    { label: 'Infrastructure', active: true, icon: Cpu },
    { label: 'Agents', active: false, icon: Terminal },
    { label: 'Ubiquity', active: false, icon: Globe },
  ];

  return (
    <section className="relative py-32 px-6 bg-[#050505] overflow-hidden">
      
      {/* Background World Map / Grid Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)]"></div>
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter">
          The Scale of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Autonomy</span>
        </h2>
        <p className="text-gray-400 text-xl max-w-3xl mx-auto mb-20 font-light leading-relaxed">
          The next phase is an x402-compatible{' '}
          <span className="text-white font-medium">Private Terminal for AI Agents</span>. As
          autonomous agents pay each other for compute, data, and execution,
          privacy becomes the core primitive preventing strategy leakage.
        </p>

        {/* Interactive Roadmap */}
        <div className="relative mt-16">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/5 -translate-y-1/2 rounded-full hidden md:block"></div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon;
              return (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center relative group"
              >
                {/* Node Point */}
                <div
                  className={`w-20 h-20 rounded-2xl mb-6 flex items-center justify-center border-2 transition-all duration-500 relative z-10 ${
                    milestone.active
                      ? 'bg-black border-white shadow-[0_0_30px_rgba(255,255,255,0.3)]'
                      : 'bg-black border-white/10 group-hover:border-white/30'
                  }`}
                >
                    <Icon className={`w-8 h-8 ${milestone.active ? 'text-white' : 'text-gray-600'}`} />
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <span
                    className={`text-sm uppercase tracking-[0.2em] font-bold ${
                        milestone.active ? 'text-white' : 'text-gray-600'
                    }`}
                    >
                    {milestone.label}
                    </span>
                    {milestone.active && (
                        <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] text-white font-mono inline-block border border-white/10">
                            CURRENT PHASE
                        </div>
                    )}
                </div>
              </motion.div>
            )})}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScaleSection;