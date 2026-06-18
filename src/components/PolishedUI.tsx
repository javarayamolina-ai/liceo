import { ReactNode, useRef, useState, useEffect, createContext, useContext } from 'react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { AlertOctagon, AlertTriangle, ShieldAlert } from 'lucide-react';

interface PolishedButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  type?: 'button' | 'submit';
}

export function PolishedButton({ children, className, onClick, variant = 'primary', type = 'button' }: PolishedButtonProps) {
  const baseStyles = "inline-flex items-center justify-center px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-300";
  
  const variants = {
    primary: "bg-brand-red text-white hover:bg-brand-black",
    outline: "bg-white text-brand-black border border-brand-border hover:border-brand-red",
    ghost: "text-brand-red hover:underline"
  };

  return (
    <button 
      id={`button-${children?.toString().toLowerCase().replace(/\s+/g, '-')}`}
      type={type}
      onClick={onClick}
      className={cn(baseStyles, variants[variant], className)}
    >
      {children}
    </button>
  );
}

export function PolishedCard({ children, className, title, dark = false, accent = false }: { children: ReactNode, className?: string, title?: string, dark?: boolean, accent?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "p-6 sm:p-8 flex flex-col justify-between border-2 transition-all duration-500 ease-out",
        dark ? "bg-brand-black border-brand-black text-white" : 
        accent ? "bg-brand-red border-brand-red text-white" : 
        "bg-white border-brand-border hover:border-brand-red text-brand-black",
        className
      )}
    >
      {title && <h3 className="text-2xl font-bold leading-none mb-6 uppercase tracking-tighter border-b border-current border-opacity-10 pb-4">{title}</h3>}
      {children}
    </motion.div>
  );
}

export function LiceoLogo({ className = "w-12 h-12", onClick }: { className?: string, onClick?: () => void }) {
  return (
    <svg 
      viewBox="0 0 100 120" 
      onClick={onClick}
      className={cn("select-none cursor-pointer filter drop-shadow-[2px_2px_0px_rgba(0,0,0,0.15)]", className)} 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer border (black) & Background (red) */}
      <path 
        d="M 10 15 L 50 5 L 90 15 L 94 65 C 94 92 50 115 50 115 C 50 115 6 92 6 65 Z" 
        fill="#BC2122" 
        stroke="#1A1A1A" 
        strokeWidth="3.5" 
        strokeLinejoin="round"
      />
      {/* Inner border (white line) */}
      <path 
        d="M 13 18 L 50 8 L 87 18 L 90 64 C 90 88 50 109 50 109 C 50 109 10 88 10 64 Z" 
        fill="none" 
        stroke="#FAF9F6" 
        strokeWidth="2" 
      />
      {/* Text: LICEO */}
      <text 
        x="50" 
        y="34" 
        textAnchor="middle" 
        fill="#FFD54F" 
        fontSize="11" 
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" 
        fontWeight="bold" 
        letterSpacing="2"
      >
        LICEO
      </text>
      
      {/* Group for monogram E P S */}
      <g transform="translate(0, -1)">
        {/* Letter E (Left) */}
        <text 
          x="32" 
          y="74" 
          fill="#FFD54F" 
          stroke="#1A1A1A"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fontSize="44" 
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" 
          fontWeight="900" 
          textAnchor="middle"
        >
          E
        </text>
        {/* Letter P (Middle-low) */}
        <text 
          x="50" 
          y="98" 
          fill="#FFD54F" 
          stroke="#1A1A1A"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fontSize="40" 
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" 
          fontWeight="900" 
          textAnchor="middle"
        >
          P
        </text>
        {/* Letter S (Right) */}
        <text 
          x="68" 
          y="74" 
          fill="#FFD54F" 
          stroke="#1A1A1A"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fontSize="44" 
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" 
          fontWeight="900" 
          textAnchor="middle"
        >
          S
        </text>
      </g>
    </svg>
  );
}

interface RetroCarouselProps {
  children: ReactNode;
  itemCount: number;
}

export function RetroCarousel({ children, itemCount }: RetroCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      checkScroll();
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) {
        el.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [children, itemCount]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = Math.min(clientWidth * 0.8, 400); // Smooth scroll about a card's width
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Navigation arrows (retro-themed) */}
      {itemCount > 0 && (
        <div className="absolute right-0 -top-16 flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className={cn(
              "w-10 h-10 flex items-center justify-center border-2 border-brand-black bg-white select-none transition-all",
              "font-extrabold text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
              canScrollLeft 
                ? "hover:bg-brand-red hover:text-white cursor-pointer" 
                : "opacity-30 cursor-not-allowed bg-gray-50 text-gray-400 border-gray-200 shadow-none active:translate-x-0 active:translate-y-0"
            )}
            title="Anterior"
          >
            ←
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className={cn(
              "w-10 h-10 flex items-center justify-center border-2 border-brand-black bg-white select-none transition-all",
              "font-extrabold text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
              canScrollRight 
                ? "hover:bg-brand-red hover:text-white cursor-pointer" 
                : "opacity-30 cursor-not-allowed bg-gray-50 text-gray-400 border-gray-200 shadow-none active:translate-x-0 active:translate-y-0"
            )}
            title="Siguiente"
          >
            →
          </button>
        </div>
      )}

      {/* Touch swipeable horizontal scroll container with overscroll containment */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-8 pb-8 pt-[3px] scroll-smooth snap-x snap-mandatory no-scrollbar overscroll-x-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </div>
    </div>
  );
}

// Retro-Brutalist Custom Confirm System
export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const RetroConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function useRetroConfirm() {
  const context = useContext(RetroConfirmContext);
  if (!context) {
    throw new Error('useRetroConfirm debe usarse dentro de un RetroConfirmProvider');
  }
  return context.confirm;
}

export function RetroConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolver) resolver(false);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolver) resolver(true);
  };

  return (
    <RetroConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {isOpen && options && (
          <div className="fixed inset-0 bg-brand-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            {/* Backdrop click closer (rejects) */}
            <div className="absolute inset-0" onClick={handleCancel} />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "relative bg-white text-brand-black max-w-md w-full border-4 border-brand-black p-6 sm:p-8 z-10",
                options.isDestructive 
                  ? "shadow-[8px_8px_0px_0px_rgba(188,33,34,1)]" 
                  : "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              )}
            >
              {/* Outer banner accent */}
              <div className={cn(
                "h-3 absolute top-0 left-0 right-0 border-b-2 border-brand-black",
                options.isDestructive ? "bg-brand-red" : "bg-brand-black"
              )} />

              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-2.5 rounded-none border-2 border-brand-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    options.isDestructive ? "bg-red-50 text-brand-red" : "bg-neutral-50 text-brand-black"
                  )}>
                    {options.isDestructive ? (
                      <ShieldAlert className="w-8 h-8 shrink-0 animate-pulse" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 shrink-0" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-brand-red font-bold uppercase block mb-1">
                      {options.isDestructive ? "ACCIÓN DESTRUCTIVA DETECTADA" : "CONFIRMACIÓN RETRO"}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-none text-brand-black">
                      {options.title}
                    </h3>
                  </div>
                </div>

                <div className="p-4 bg-brand-bg border-2 border-brand-black font-serif italic text-gray-800 text-sm leading-relaxed">
                  {options.message}
                </div>

                <div className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">
                  ⚠️ Esta acción puede ser irreversible. Asegúrate bien de continuar.
                </div>

                <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3 justify-end">
                  <button
                    onClick={handleCancel}
                    className="w-full sm:w-auto px-5 py-3 border-2 border-brand-black bg-white select-none hover:bg-gray-100 font-extrabold text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                  >
                    {options.cancelText || "Cancelar"}
                  </button>
                  <button
                    onClick={handleConfirm}
                    className={cn(
                      "w-full sm:w-auto px-6 py-3 border-2 border-brand-black select-none font-extrabold text-xs uppercase tracking-widest text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer",
                      options.isDestructive 
                        ? "bg-brand-red hover:bg-brand-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" 
                        : "bg-brand-black hover:bg-neutral-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    )}
                  >
                    {options.confirmText || "Confirmar"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </RetroConfirmContext.Provider>
  );
}


