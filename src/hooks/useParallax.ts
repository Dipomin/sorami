"use client";

import { useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef, RefObject } from "react";

interface UseParallaxReturn {
  ref: RefObject<HTMLDivElement | null>;
  y: MotionValue<number>;
  opacity: MotionValue<number>;
}

/**
 * Hook pour créer un effet parallax sur un élément
 * @param offset Décalage vertical en pixels (default: 100)
 * @returns { ref, y, opacity } - ref à attacher à l'élément, y et opacity à utiliser avec motion.div style prop
 * 
 * @example
 * ```tsx
 * const { ref, y, opacity } = useParallax(50);
 * 
 * return (
 *   <section ref={ref}>
 *     <motion.div style={{ y, opacity }}>
 *       <h1>Titre avec effet parallax</h1>
 *     </motion.div>
 *   </section>
 * );
 * ```
 */
export function useParallax(offset = 100): UseParallaxReturn {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return { ref, y, opacity };
}

/**
 * Hook pour animer plusieurs layers en parallax
 * @returns scrollYProgress et fonctions de transformation
 * 
 * @example
 * ```tsx
 * const { scrollYProgress, createLayer } = useParallaxLayers();
 * 
 * return (
 *   <div>
 *     <motion.div style={{ y: createLayer(1) }} />
 *     <motion.div style={{ y: createLayer(2) }} />
 *     <motion.div style={{ y: createLayer(3) }} />
 *   </div>
 * );
 * ```
 */
export function useParallaxLayers() {
  const { scrollYProgress } = useScroll();

  const createLayer = (speed: number) => {
    return useTransform(scrollYProgress, [0, 1], [0, -speed * 100]);
  };

  return { scrollYProgress, createLayer };
}
