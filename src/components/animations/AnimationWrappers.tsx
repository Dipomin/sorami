"use client";

import React, { ReactNode } from "react";
import { motion, Variants } from "framer-motion";
import { useInView, useReducedMotion } from "@/hooks/useAnimations";
import { useRef } from "react";

interface FadeInWhenVisibleProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Wrapper qui fait apparaître le contenu en fondu quand il entre dans le viewport
 */
export function FadeInWhenVisible({
  children,
  delay = 0,
  className,
}: FadeInWhenVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { threshold: 0.1 });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 50 }}
      animate={
        isInView
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: prefersReducedMotion ? 0 : 50 }
      }
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Wrapper qui fait apparaître le contenu avec un effet de zoom
 */
export function ScaleIn({ children, delay = 0, className }: ScaleInProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ scale: prefersReducedMotion ? 1 : 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

interface SlideInProps {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  className?: string;
}

/**
 * Wrapper qui fait glisser le contenu depuis une direction
 */
export function SlideIn({
  children,
  direction = "up",
  delay = 0,
  className,
}: SlideInProps) {
  const prefersReducedMotion = useReducedMotion();

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: prefersReducedMotion
        ? 0
        : direction === "left"
        ? -100
        : direction === "right"
        ? 100
        : 0,
      y: prefersReducedMotion
        ? 0
        : direction === "up"
        ? 100
        : direction === "down"
        ? -100
        : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

/**
 * Container qui déclenche des animations en cascade pour ses enfants
 * Les enfants doivent être wrappés avec StaggerItem
 */
export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className,
}: StaggerContainerProps) {
  const variants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

/**
 * Item à utiliser dans un StaggerContainer
 */
export function StaggerItem({ children, className }: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion();

  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 30,
      scale: prefersReducedMotion ? 1 : 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

interface RotateInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Wrapper qui fait apparaître le contenu avec une rotation
 */
export function RotateIn({ children, delay = 0, className }: RotateInProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{
        rotate: prefersReducedMotion ? 0 : -180,
        opacity: 0,
        scale: prefersReducedMotion ? 1 : 0.5,
      }}
      animate={{ rotate: 0, opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 12,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

interface PulseProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper qui fait pulser le contenu en boucle
 */
export function Pulse({ children, className }: PulseProps) {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

interface FloatProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper qui fait flotter le contenu verticalement
 */
export function Float({ children, className }: FloatProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{
        y: [-10, 10, -10],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
