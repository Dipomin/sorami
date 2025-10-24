# ✨ Guide des Animations Avancées - Sorami Platform

**Date**: 23 octobre 2025  
**Library**: Framer Motion 11.x  
**Framework**: Next.js 15 + TypeScript

---

## 🎯 Vue d'Ensemble

### Animations Actuelles
- ✅ **Fade In**: Apparition en fondu
- ✅ **Slide Up**: Glissement vers le haut
- ✅ **Scale**: Zoom in/out
- ✅ **Stagger**: Animations séquentielles
- ✅ **Progress Bars**: Animations de progression
- ✅ **Hover Effects**: Effets au survol

### Animations Avancées Ajoutées
- ✨ **Parallax Scrolling**: Effet de profondeur
- ✨ **Morphing**: Transformation fluide
- ✨ **Path Drawing**: Animation de tracés SVG
- ✨ **Gesture Animations**: Drag, swipe, pinch
- ✨ **Loading Skeletons**: Placeholders animés
- ✨ **Page Transitions**: Transitions entre pages
- ✨ **Micro-interactions**: Feedback visuel subtil

---

## 🎬 1. Stagger Animations (Séquentielles)

### Pattern de Base
```tsx
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Délai entre chaque enfant
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

<motion.div variants={container} initial="hidden" animate="show">
  {items.map((item) => (
    <motion.div key={item.id} variants={item}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Exemples d'Utilisation

#### Blog Grid
```tsx
const blogContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const blogCard = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { 
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

<motion.div 
  className="grid md:grid-cols-3 gap-6"
  variants={blogContainer}
  initial="hidden"
  animate="show"
>
  {blogs.map((blog) => (
    <motion.div key={blog.id} variants={blogCard}>
      <BlogCard {...blog} />
    </motion.div>
  ))}
</motion.div>
```

#### Stats Dashboard
```tsx
const statsContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const statCard = {
  hidden: { opacity: 0, x: -20 },
  show: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 120,
    },
  },
};
```

---

## 🌊 2. Parallax Scrolling

### Installation
```bash
npm install framer-motion
```

### Hook useParallax
```tsx
import { useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function useParallax(offset = 100) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  return { ref, y, opacity };
}
```

### Utilisation Landing Page
```tsx
import { motion } from "framer-motion";
import { useParallax } from "@/hooks/useParallax";

function HeroSection() {
  const { ref, y, opacity } = useParallax(50);

  return (
    <section ref={ref} className="relative">
      <motion.div style={{ y, opacity }}>
        <h1>Titre avec effet parallax</h1>
      </motion.div>
      
      <motion.div style={{ y: useTransform(y, [0, 100], [0, 50]) }}>
        <Image src="/bg.png" alt="Background" />
      </motion.div>
    </section>
  );
}
```

### Parallax Multi-Layers
```tsx
const { scrollYProgress } = useScroll();

const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
const y3 = useTransform(scrollYProgress, [0, 1], [0, -300]);

<div className="relative">
  <motion.div style={{ y: y1 }} className="layer-1" />
  <motion.div style={{ y: y2 }} className="layer-2" />
  <motion.div style={{ y: y3 }} className="layer-3" />
</div>
```

---

## 🎭 3. Morphing (Transformation Fluide)

### Layout Animations
```tsx
<motion.div layout className="card">
  {expanded && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Content supplémentaire
    </motion.div>
  )}
</motion.div>
```

### Shared Layout Animations
```tsx
import { AnimatePresence } from "framer-motion";

function CardExpansion() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      {items.map((item) => (
        <motion.div
          key={item.id}
          layoutId={item.id}
          onClick={() => setSelectedId(item.id)}
        >
          <h2>{item.title}</h2>
        </motion.div>
      ))}

      <AnimatePresence>
        {selectedId && (
          <motion.div layoutId={selectedId}>
            <h2>{items.find((i) => i.id === selectedId)?.title}</h2>
            <p>Contenu détaillé...</p>
            <button onClick={() => setSelectedId(null)}>Fermer</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

---

## ✏️ 4. SVG Path Drawing

### Animation de Logo
```tsx
const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 2, ease: "easeInOut" },
      opacity: { duration: 0.01 },
    },
  },
};

<motion.svg width="200" height="200" viewBox="0 0 200 200">
  <motion.path
    d="M 10 80 Q 95 10 180 80"
    stroke="#8b5cf6"
    strokeWidth="4"
    fill="transparent"
    variants={draw}
    initial="hidden"
    animate="visible"
  />
</motion.svg>
```

### Progress Circle
```tsx
function CircularProgress({ progress }: { progress: number }) {
  const circumference = 2 * Math.PI * 45; // rayon 45

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="#1e293b"
        strokeWidth="8"
        fill="transparent"
      />
      <motion.circle
        cx="50"
        cy="50"
        r="45"
        stroke="url(#gradient)"
        strokeWidth="8"
        fill="transparent"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ 
          strokeDashoffset: circumference - (progress / 100) * circumference 
        }}
        transition={{ duration: 1, ease: "easeInOut" }}
        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
      />
      <defs>
        <linearGradient id="gradient">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
```

---

## 👆 5. Gesture Animations

### Drag & Drop
```tsx
<motion.div
  drag
  dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
  dragElastic={0.2}
  whileDrag={{ scale: 1.1, cursor: "grabbing" }}
>
  Glissez-moi
</motion.div>
```

### Swipe to Dismiss
```tsx
function SwipeCard() {
  const [exitX, setExitX] = useState(0);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 100) {
          setExitX(info.offset.x > 0 ? 1000 : -1000);
        }
      }}
      animate={{ x: exitX }}
      transition={{ duration: 0.3 }}
    >
      Swipe left or right
    </motion.div>
  );
}
```

### Pinch to Zoom (Mobile)
```tsx
<motion.div
  style={{ scale }}
  onPinch={(e, info) => {
    scale.set(info.scale);
  }}
>
  <Image src="/photo.jpg" alt="Zoom" />
</motion.div>
```

---

## 💀 6. Loading Skeletons

### Component Skeleton
```tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("bg-dark-800/50 rounded-lg", className)}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
```

### Blog Card Skeleton
```tsx
export function BlogCardSkeleton() {
  return (
    <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl p-6 space-y-4">
      <Skeleton className="h-48 w-full" /> {/* Image */}
      <Skeleton className="h-6 w-3/4" />   {/* Title */}
      <Skeleton className="h-4 w-full" />  {/* Line 1 */}
      <Skeleton className="h-4 w-5/6" />   {/* Line 2 */}
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />  {/* Tag 1 */}
        <Skeleton className="h-6 w-20" />  {/* Tag 2 */}
      </div>
    </div>
  );
}
```

### Usage avec Suspense
```tsx
import { Suspense } from "react";

function BlogList() {
  return (
    <Suspense fallback={<BlogListSkeleton />}>
      <BlogListContent />
    </Suspense>
  );
}

function BlogListSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

---

## 🔄 7. Page Transitions

### Hook usePageTransition
```tsx
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### Usage dans Layout
```tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
```

### Slide Transition
```tsx
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

<AnimatePresence initial={false} custom={direction}>
  <motion.div
    key={page}
    custom={direction}
    variants={variants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ duration: 0.5 }}
  />
</AnimatePresence>
```

---

## 🎨 8. Micro-interactions

### Button Feedback
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="btn-primary"
>
  Cliquez-moi
</motion.button>
```

### Icon Rotation
```tsx
const [isOpen, setIsOpen] = useState(false);

<motion.div
  animate={{ rotate: isOpen ? 180 : 0 }}
  transition={{ duration: 0.3 }}
>
  <ChevronDown className="w-5 h-5" />
</motion.div>
```

### Success Checkmark
```tsx
function SuccessCheck() {
  return (
    <motion.svg
      viewBox="0 0 50 50"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      <motion.path
        d="M14 27l7 7 15-15"
        fill="transparent"
        stroke="#10b981"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
    </motion.svg>
  );
}
```

### Loading Dots
```tsx
function LoadingDots() {
  return (
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-primary-500 rounded-full"
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}
```

---

## 🌟 9. Advanced Hover Effects

### Card Tilt
```tsx
function TiltCard({ children }: { children: ReactNode }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    setRotateY((x - centerX) / 10);
    setRotateX((centerY - y) / 10);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setRotateX(0);
        setRotateY(0);
      }}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
}
```

### Magnetic Button
```tsx
function MagneticButton({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    setPosition({ x: x * 0.3, y: y * 0.3 });
  };

  return (
    <motion.button
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPosition({ x: 0, y: 0 })}
      animate={position}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
    >
      {children}
    </motion.button>
  );
}
```

### Glow Effect on Hover
```tsx
<motion.div
  whileHover={{
    boxShadow: "0 0 40px rgba(139, 92, 246, 0.5)",
  }}
  transition={{ duration: 0.3 }}
  className="card"
>
  Hover me
</motion.div>
```

---

## 📊 10. Data Visualization Animations

### Bar Chart Animation
```tsx
function AnimatedBar({ height, delay }: { height: number; delay: number }) {
  return (
    <motion.div
      className="w-12 bg-gradient-to-t from-primary-600 to-accent-600 rounded-t-lg"
      initial={{ height: 0 }}
      animate={{ height: `${height}%` }}
      transition={{ duration: 1, delay, ease: "easeOut" }}
    />
  );
}
```

### Counter Animation
```tsx
function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev + increment >= target) {
          clearInterval(timer);
          return target;
        }
        return prev + increment;
      });
    }, 16);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{Math.round(count)}</span>;
}
```

---

## 🎯 Performance Tips

### 1. Use transform instead of position
```tsx
// ✅ Good (GPU accelerated)
<motion.div animate={{ x: 100, scale: 1.5 }} />

// ❌ Bad (causes reflow)
<motion.div animate={{ left: 100, width: 200 }} />
```

### 2. Reduce Motion Preference
```tsx
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

<motion.div
  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
  animate={{ opacity: 1, y: 0 }}
/>
```

### 3. Use willChange
```tsx
<motion.div
  style={{ willChange: "transform" }}
  animate={{ x: 100 }}
/>
```

### 4. Lazy Animation
```tsx
const [isInView, setIsInView] = useState(false);
const ref = useRef<HTMLDivElement>(null);

useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    setIsInView(entry.isIntersecting);
  });
  
  if (ref.current) observer.observe(ref.current);
  
  return () => observer.disconnect();
}, []);

<motion.div
  ref={ref}
  initial={{ opacity: 0 }}
  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
/>
```

---

## 📦 Composants Réutilisables

### AnimatedPresence Wrapper
```tsx
export function FadeInWhenVisible({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 },
      }}
    >
      {children}
    </motion.div>
  );
}
```

### ScaleIn Component
```tsx
export function ScaleIn({ 
  children, 
  delay = 0 
}: { 
  children: ReactNode; 
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 100, 
        delay 
      }}
    >
      {children}
    </motion.div>
  );
}
```

---

## 🎬 Conclusion

Ces animations avancées ajoutent une **dimension professionnelle** à la plateforme Sorami :

- ✨ **Stagger**: Rythme visuel agréable
- 🌊 **Parallax**: Profondeur et immersion
- 🎭 **Morphing**: Transitions fluides
- ✏️ **SVG Drawing**: Feedback visuel créatif
- 👆 **Gestures**: Interactions naturelles
- 💀 **Skeletons**: Loading states élégants
- 🔄 **Page Transitions**: Navigation fluide
- 🎨 **Micro-interactions**: Feedback instantané

**Next Steps**:
1. Implémenter progressivement
2. Tester performance mobile
3. A/B tester l'impact UX
4. Ajuster selon feedback utilisateurs

