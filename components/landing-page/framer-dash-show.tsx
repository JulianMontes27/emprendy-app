"use client";

import { motion } from "framer-motion";

const FramerDashboardShow = () => {
  return (
    <div className="mt-12 md:mt-0 md:w-1/2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200"
      >
        <img
          src="/api/placeholder/600/400"
          alt="ColdConnect Dashboard"
          className="w-full"
        />
      </motion.div>
    </div>
  );
};

export default FramerDashboardShow;
