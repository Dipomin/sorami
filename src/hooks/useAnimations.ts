"use client";

import { useState, useEffect, RefObject } from "react";

/**
 * Hook pour détecter si un élément est visible dans le viewport
 * Utile pour déclencher des animations au scroll
 * 
 * @param ref Référence à l'élément DOM à observer
 * @param options Options de l'IntersectionObserver
 * @returns boolean indiquant si l'élément est visible
 * 
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * const isInView = useInView(ref, { threshold: 0.5 });
 * 
 * return (
 *   <motion.div
 *     ref={ref}
 *     initial={{ opacity: 0 }}
 *     animate={isInView ? { opacity: 1 } : { opacity: 0 }}
 *   >
 *     Contenu
 *   </motion.div>
 * );
 * ```
 */
export function useInView(
  ref: RefObject<Element | null>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isInView;
}

/**
 * Hook pour détecter la préférence utilisateur pour les animations réduites
 * @returns boolean - true si l'utilisateur préfère réduire les animations
 * 
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 * 
 * return (
 *   <motion.div
 *     initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
 *     animate={{ opacity: 1, y: 0 }}
 *   />
 * );
 * ```
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook pour détecter si l'appareil est mobile
 * @returns boolean - true si mobile
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
}
