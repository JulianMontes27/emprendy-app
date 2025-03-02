"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import imagePaths from "@/utils/import-imgs";

export default function Collage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? imagePaths.length - 1 : prevIndex - 1
    );
  };

  const nextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === imagePaths.length - 1 ? 0 : prevIndex + 1
    );
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        prevImage();
      } else if (event.key === "ArrowRight") {
        nextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section className="relative h-[70vh] w-full max-w-4xl mx-auto overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src={imagePaths[currentIndex]}
            alt={`Tennis club image ${currentIndex + 1}`}
            layout="fill"
            objectFit="cover"
            priority
            unoptimized={true} // ✅ Fix: Ensures images load correctly in production
          />
        </motion.div>
      </AnimatePresence>

      {/* Background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />

      {/* Navigation Arrows */}
      <div className="absolute inset-0 flex items-center justify-between p-4 z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={prevImage}
          className="rounded-full bg-white/10 text-white hover:bg-white/20 pointer-events-auto"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={nextImage}
          className="rounded-full bg-white/10 text-white hover:bg-white/20 pointer-events-auto"
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Overlay Text */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/60 to-transparent p-6 text-center text-white flex flex-col gap-6">
        <div className="mb-20">
          <h1 className="text-4xl font-bold mb-2 md:text-5xl lg:text-6xl">
            Bienvenidos
          </h1>
          <p className="text-4xl">Escuela de Tenis de </p>
          <span className="text-2xl">Bocagrande</span>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {imagePaths.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? "bg-white" : "bg-white/50"
            } transition-colors duration-300`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
