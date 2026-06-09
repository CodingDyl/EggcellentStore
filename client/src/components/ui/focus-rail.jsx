import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from 'lib/utils';

/**
 * @typedef {Object} FocusRailItem
 * @property {string|number} id
 * @property {string} title
 * @property {string} [description]
 * @property {string} imageSrc
 * @property {string} [href]
 * @property {string} [meta]
 */

function wrap(min, max, v) {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
}

const BASE_SPRING = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 1,
};

const TAP_SPRING = {
  type: 'spring',
  stiffness: 450,
  damping: 18,
  mass: 1,
};

/**
 * @param {Object} props
 * @param {FocusRailItem[]} props.items
 * @param {number} [props.initialIndex]
 * @param {boolean} [props.loop]
 * @param {boolean} [props.autoPlay]
 * @param {number} [props.interval]
 * @param {string} [props.className]
 */
export function FocusRail({
  items,
  initialIndex = 0,
  loop = true,
  autoPlay = false,
  interval = 4000,
  className,
}) {
  const [active, setActive] = React.useState(initialIndex);
  const [isHovering, setIsHovering] = React.useState(false);
  const lastWheelTime = React.useRef(0);

  const count = items.length;
  const activeIndex = wrap(0, count, active);
  const activeItem = items[activeIndex];

  const handlePrev = React.useCallback(() => {
    if (!loop && active === 0) return;
    setActive((p) => p - 1);
  }, [loop, active]);

  const handleNext = React.useCallback(() => {
    if (!loop && active === count - 1) return;
    setActive((p) => p + 1);
  }, [loop, active, count]);

  const onWheel = React.useCallback(
    (e) => {
      const now = Date.now();
      if (now - lastWheelTime.current < 400) return;

      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = isHorizontal ? e.deltaX : e.deltaY;

      if (Math.abs(delta) > 20) {
        if (delta > 0) {
          handleNext();
        } else {
          handlePrev();
        }
        lastWheelTime.current = now;
      }
    },
    [handleNext, handlePrev]
  );

  React.useEffect(() => {
    if (!autoPlay || isHovering) return;
    const timer = setInterval(() => handleNext(), interval);
    return () => clearInterval(timer);
  }, [autoPlay, isHovering, handleNext, interval]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

  const onDragEnd = (_e, { offset, velocity }) => {
    const swipe = swipePower(offset.x, velocity.x);
    if (swipe < -swipeConfidenceThreshold) {
      handleNext();
    } else if (swipe > swipeConfidenceThreshold) {
      handlePrev();
    }
  };

  const visibleIndices = [-2, -1, 0, 1, 2];

  if (!count) {
    return null;
  }

  return (
    <div
      className={cn(
        'group relative flex h-[520px] w-full flex-col overflow-hidden rounded-2xl border border-barn-700/60 bg-barn-950 text-cream-50 outline-none select-none sm:h-[580px]',
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onWheel={onWheel}
      role="region"
      aria-roledescription="carousel"
      aria-label="Producer spotlight"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`bg-${activeItem.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <img
              src={activeItem.imageSrc}
              alt=""
              className="h-full w-full object-cover blur-3xl saturate-150"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-barn-950 via-barn-950/60 to-barn-950/20" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-4 md:px-8">
        <motion.div
          className="relative mx-auto flex h-[300px] w-full max-w-6xl cursor-grab items-center justify-center active:cursor-grabbing sm:h-[340px]"
          style={{ perspective: '1200px' }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={onDragEnd}
        >
          {visibleIndices.map((offset) => {
            const absIndex = active + offset;
            const index = wrap(0, count, absIndex);
            const item = items[index];

            if (!loop && (absIndex < 0 || absIndex >= count)) return null;

            const isCenter = offset === 0;
            const dist = Math.abs(offset);
            const xOffset = offset * 280;
            const zOffset = -dist * 160;
            const scale = isCenter ? 1 : 0.85;
            const rotateY = offset * -18;
            const opacity = isCenter ? 1 : Math.max(0.15, 1 - dist * 0.45);
            const blur = isCenter ? 0 : dist * 5;
            const brightness = isCenter ? 1 : 0.55;

            return (
              <motion.div
                key={`${item.id}-${absIndex}`}
                className={cn(
                  'absolute aspect-[3/4] w-[220px] rounded-2xl border border-cream-200/10 bg-barn-900 shadow-2xl sm:w-[260px] md:w-[280px]',
                  isCenter ? 'z-20 shadow-glow' : 'z-10'
                )}
                initial={false}
                animate={{
                  x: xOffset,
                  z: zOffset,
                  scale,
                  rotateY,
                  opacity,
                  filter: `blur(${blur}px) brightness(${brightness})`,
                }}
                transition={(val) => (val === 'scale' ? TAP_SPRING : BASE_SPRING)}
                style={{ transformStyle: 'preserve-3d' }}
                onClick={() => {
                  if (offset !== 0) setActive((p) => p + offset);
                }}
              >
                <img
                  src={item.imageSrc}
                  alt={item.title}
                  className="pointer-events-none h-full w-full rounded-2xl object-cover"
                />
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-yolk-500/10 to-transparent" />
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-barn-950/10 mix-blend-multiply" />
              </motion.div>
            );
          })}
        </motion.div>

        <div className="pointer-events-auto mx-auto mt-8 flex w-full max-w-4xl flex-col items-center justify-between gap-6 md:mt-10 md:flex-row">
          <div className="flex h-36 flex-1 flex-col items-center justify-center text-center md:items-start md:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                {activeItem.meta && (
                  <span className="text-xs font-medium uppercase tracking-wider text-yolk-400">
                    {activeItem.meta}
                  </span>
                )}
                <h3 className="font-display text-2xl font-bold tracking-tight text-cream-50 md:text-3xl">
                  {activeItem.title}
                </h3>
                {activeItem.description && (
                  <p className="max-w-md text-sm leading-relaxed text-cream-200/70 md:text-base">
                    {activeItem.description}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-full border border-barn-700/60 bg-barn-900/80 p-1 backdrop-blur-md">
              <button
                type="button"
                onClick={handlePrev}
                className="rounded-full p-3 text-cream-200/60 transition hover:bg-barn-800 hover:text-cream-50 focus:outline-none focus:ring-2 focus:ring-yolk-500/40 active:scale-95"
                aria-label="Previous producer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="min-w-[40px] text-center font-mono text-xs text-cream-200/50">
                {activeIndex + 1} / {count}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="rounded-full p-3 text-cream-200/60 transition hover:bg-barn-800 hover:text-cream-50 focus:outline-none focus:ring-2 focus:ring-yolk-500/40 active:scale-95"
                aria-label="Next producer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
