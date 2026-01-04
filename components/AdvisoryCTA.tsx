"use client";

import { motion } from "framer-motion";

export default function AdvisoryCTA() {
  return (
    <section className="py-24 bg-[#fcfaf9] px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-[#14213D] mb-4"
        >
          Need consulting services?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-500 mb-8"
        >
          Contact us to discuss how we can support your banking operations
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="px-8 py-3 bg-gradient-to-r from-[#1B2B4B] to-[#355189] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2 mx-auto"
        >
          {/* Using a generic icon or just text based on design */}
          <span
            className="transform rotate-45 inline-block border-t-2 border-r-2 border-white w-2 h-2 mr-2"
            style={{ transform: "rotate(45deg)" }}
          ></span>
          Contact Us
        </motion.button>
      </div>
    </section>
  );
}
