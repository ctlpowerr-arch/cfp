import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ParsedOption {
  value: string;
  rawLabel: string;
  emoji?: string;
  title: string;
  subtitle?: string;
  disabled?: boolean;
  group?: string;
}

function parseOptionText(raw: string): { emoji?: string; title: string; subtitle?: string } {
  const trimmed = (raw || '').trim();
  if (!trimmed) return { title: '' };

  // Extract leading emoji or symbol if present
  const emojiMatch = trimmed.match(/^([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{26A1}\u{2728}\u{2705}\u{274C}\u{1F1E6}-\u{1F1FF}]+(?:\uFE0F|\u200D[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]+)*)\s*(.*)$/u);
  const emoji = emojiMatch ? emojiMatch[1] : undefined;
  const rest = emojiMatch ? emojiMatch[2].trim() : trimmed;

  // Split title and subtitle on " — " or " • " or " - " (when surrounded by spaces)
  const dashSplit = rest.split(/\s+—\s+|\s+•\s+/);
  if (dashSplit.length >= 2) {
    return {
      emoji,
      title: dashSplit[0].trim(),
      subtitle: dashSplit.slice(1).join(' • ').trim(),
    };
  }

  return { emoji, title: rest };
}

function extractTextFromChildren(children: React.ReactNode): string {
  if (children === null || children === undefined || typeof children === 'boolean') return '';
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractTextFromChildren).join('');
  if (React.isValidElement(children)) {
    return extractTextFromChildren((children.props as any)?.children);
  }
  return '';
}

function extractOptionsFromChildren(children: React.ReactNode, groupName?: string): ParsedOption[] {
  const list: ParsedOption[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    const type = child.type;
    const props = child.props as any;

    if (type === React.Fragment) {
      list.push(...extractOptionsFromChildren(props.children, groupName));
      return;
    }

    if (type === 'optgroup') {
      const label = props.label || groupName;
      list.push(...extractOptionsFromChildren(props.children, label));
      return;
    }

    if (type === 'option') {
      const rawLabel = extractTextFromChildren(props.children);
      const val = props.value !== undefined ? String(props.value) : rawLabel;
      const parsed = parseOptionText(rawLabel);
      list.push({
        value: val,
        rawLabel,
        emoji: parsed.emoji,
        title: parsed.title || rawLabel,
        subtitle: parsed.subtitle,
        disabled: Boolean(props.disabled),
        group: groupName,
      });
    }
  });

  return list;
}

export interface ModernSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  onChange?: (e: React.ChangeEvent<HTMLSelectElement> & { target: { value: string; name?: string; id?: string } }) => void;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  dropdownTitle?: string;
  searchable?: boolean;
}

export const ModernSelect = React.forwardRef<HTMLButtonElement, ModernSelectProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      onValueChange,
      children,
      className,
      disabled,
      required,
      name,
      id,
      title,
      style,
      placeholder,
      dropdownTitle,
      searchable,
      ...restProps
    },
    ref
  ) => {
    const options = useMemo(() => extractOptionsFromChildren(children), [children]);

    const [internalValue, setInternalValue] = useState<string>(() => {
      if (value !== undefined) return String(value);
      if (defaultValue !== undefined) return String(defaultValue);
      return options[0]?.value ?? '';
    });

    const currentValue = value !== undefined ? String(value) : internalValue;

    const selectedOption = useMemo(() => {
      return options.find((o) => o.value === currentValue) || options[0] || null;
    }, [options, currentValue]);

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
    const [isMobile, setIsMobile] = useState(false);
    const [coords, setCoords] = useState<{
      top: number;
      left: number;
      width: number;
      openUpward: boolean;
      maxHeight: number;
    }>({ top: 0, left: 0, width: 280, openUpward: false, maxHeight: 360 });

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    const setMergedRef = useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      },
      [ref]
    );

    const showSearch = searchable ?? options.length >= 6;
    const hasRichSubtitles = useMemo(() => options.some((o) => Boolean(o.subtitle)), [options]);

    const filteredOptions = useMemo(() => {
      if (!searchQuery.trim()) return options;
      const q = searchQuery.toLowerCase().trim();
      return options.filter(
        (o) =>
          o.rawLabel.toLowerCase().includes(q) ||
          o.title.toLowerCase().includes(q) ||
          (o.subtitle && o.subtitle.toLowerCase().includes(q)) ||
          (o.group && o.group.toLowerCase().includes(q))
      );
    }, [options, searchQuery]);

    const updatePosition = useCallback(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw < 640;
      setIsMobile(mobile);

      if (mobile || !triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = vh - rect.bottom - 16;
      const spaceAbove = rect.top - 16;
      const openUpward = spaceBelow < 260 && spaceAbove > spaceBelow;
      const maxHeight = Math.min(420, Math.max(200, openUpward ? spaceAbove - 12 : spaceBelow - 12));

      const minPanelWidth = hasRichSubtitles ? Math.min(vw - 24, Math.max(rect.width, 420)) : Math.min(vw - 24, Math.max(rect.width, 240));
      let left = rect.left;
      if (left + minPanelWidth > vw - 12) {
        left = Math.max(12, vw - minPanelWidth - 12);
      }

      setCoords({
        top: openUpward ? rect.top - 6 : rect.bottom + 6,
        left,
        width: minPanelWidth,
        openUpward,
        maxHeight,
      });
    }, [hasRichSubtitles]);

    const handleOpen = () => {
      if (disabled) return;
      updatePosition();
      setSearchQuery('');
      const idx = options.findIndex((o) => o.value === currentValue);
      setHighlightedIndex(idx >= 0 ? idx : 0);
      setIsOpen(true);
    };

    const handleSelect = (opt: ParsedOption) => {
      if (opt.disabled) return;
      setInternalValue(opt.value);
      setIsOpen(false);
      setSearchQuery('');

      if (onValueChange) {
        onValueChange(opt.value);
      }

      if (onChange) {
        const syntheticEvent = {
          target: { value: opt.value, name: name || '', id: id || '' },
          currentTarget: { value: opt.value, name: name || '', id: id || '' },
          preventDefault: () => {},
          stopPropagation: () => {},
        } as unknown as React.ChangeEvent<HTMLSelectElement> & {
          target: { value: string; name?: string; id?: string };
        };
        onChange(syntheticEvent);
      }
    };

    useEffect(() => {
      if (!isOpen) return;

      const handleResizeOrScroll = (e: Event) => {
        if (panelRef.current && e.target instanceof Node && panelRef.current.contains(e.target)) {
          return;
        }
        updatePosition();
      };

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          triggerRef.current &&
          !triggerRef.current.contains(target) &&
          panelRef.current &&
          !panelRef.current.contains(target)
        ) {
          setIsOpen(false);
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          setIsOpen(false);
          triggerRef.current?.focus();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHighlightedIndex((prev) => (filteredOptions.length > 0 ? (prev + 1) % filteredOptions.length : 0));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlightedIndex((prev) =>
            filteredOptions.length > 0 ? (prev - 1 + filteredOptions.length) % filteredOptions.length : 0
          );
        } else if (e.key === 'Enter' && document.activeElement !== searchInputRef.current) {
          e.preventDefault();
          const chosen = filteredOptions[highlightedIndex];
          if (chosen && !chosen.disabled) {
            handleSelect(chosen);
          }
        }
      };

      window.addEventListener('resize', handleResizeOrScroll);
      window.addEventListener('scroll', handleResizeOrScroll, true);
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);

      if (showSearch) {
        setTimeout(() => searchInputRef.current?.focus(), 40);
      }

      return () => {
        window.removeEventListener('resize', handleResizeOrScroll);
        window.removeEventListener('scroll', handleResizeOrScroll, true);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [isOpen, filteredOptions, highlightedIndex, showSearch, updatePosition]);

    // Detect if the caller passed a dark-first or custom background class
    const hasCustomBg = className && /\bbg-/.test(className);
    const hasCustomHeight = className && /\bh-/.test(className);
    const hasCustomRounded = className && /\brounded/.test(className);

    return (
      <>
        <button
          ref={setMergedRef}
          type="button"
          id={id}
          name={name}
          title={title}
          style={style}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-required={required}
          onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
          className={cn(
            'group relative flex items-center justify-between gap-2 text-left transition-all duration-200 select-none cursor-pointer outline-none',
            !hasCustomHeight && 'h-11',
            !hasCustomRounded && 'rounded-xl',
            !hasCustomBg && 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-slate-100',
            'px-3.5 py-2 text-xs sm:text-sm font-semibold shadow-2xs hover:border-indigo-400/70 dark:hover:border-indigo-500/60 focus-visible:ring-2 focus-visible:ring-indigo-500/30',
            isOpen && 'ring-2 ring-indigo-500/40 border-indigo-500 dark:border-indigo-500',
            disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
            className
          )}
        >
          <span className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            {selectedOption?.emoji && (
              <span className="text-sm sm:text-base shrink-0 leading-none">{selectedOption.emoji}</span>
            )}
            <span className="truncate font-bold leading-snug">
              {selectedOption ? selectedOption.title : placeholder || 'Sélectionner...'}
            </span>
            {selectedOption?.subtitle && (
              <span className="hidden md:inline-block truncate text-[11px] font-medium opacity-65 border-l border-current/20 pl-2">
                {selectedOption.subtitle}
              </span>
            )}
          </span>

          <span
            className={cn(
              'flex items-center justify-center w-5 h-5 rounded-lg bg-slate-500/10 dark:bg-white/10 shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180 bg-indigo-500/20 text-indigo-500'
            )}
          >
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </span>
        </button>

        {isOpen &&
          typeof document !== 'undefined' &&
          createPortal(
            isMobile ? (
              /* MOBILE RESPONSIVE BOTTOM SHEET SELECTION WINDOW */
              <div
                className="fixed inset-0 z-[10050] flex flex-col justify-end bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setIsOpen(false);
                }}
              >
                <div
                  ref={panelRef}
                  className="w-full max-h-[82vh] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
                >
                  {/* Grab Handle */}
                  <div className="flex justify-center pt-2.5 pb-1">
                    <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  </div>

                  {/* Sheet Header */}
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">
                          {dropdownTitle || title || 'Sélectionner une option'}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400">
                          {options.length} option{options.length > 1 ? 's' : ''} disponible{options.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Search Input */}
                  {showSearch && (
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                      <div className="relative flex items-center">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setHighlightedIndex(0);
                          }}
                          placeholder="Rechercher rapidement..."
                          className="w-full h-10 pl-9 pr-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Options List */}
                  <div className="overflow-y-auto p-3 space-y-1.5 flex-1">
                    {filteredOptions.length === 0 ? (
                      <div className="py-8 text-center text-xs font-semibold text-slate-400">
                        Aucune option trouvée pour « {searchQuery} »
                      </div>
                    ) : (
                      filteredOptions.map((opt, idx) => {
                        const isSelected = opt.value === currentValue;
                        const prevGroup = idx > 0 ? filteredOptions[idx - 1].group : undefined;
                        const showGroupHeader = opt.group && opt.group !== prevGroup;

                        return (
                          <React.Fragment key={`${opt.value}_${idx}`}>
                            {showGroupHeader && (
                              <div className="px-2 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                                {opt.group}
                              </div>
                            )}
                            <button
                              type="button"
                              disabled={opt.disabled}
                              onClick={() => handleSelect(opt)}
                              className={cn(
                                'w-full text-left p-3 rounded-2xl border transition-all flex items-start justify-between gap-3 cursor-pointer',
                                isSelected
                                  ? 'bg-indigo-600/10 dark:bg-indigo-500/15 border-indigo-500/40 text-indigo-950 dark:text-white shadow-xs'
                                  : 'bg-slate-50/70 dark:bg-slate-800/40 border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200',
                                opt.disabled && 'opacity-40 cursor-not-allowed'
                              )}
                            >
                              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                {opt.emoji && (
                                  <span className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center text-base shrink-0 shadow-2xs">
                                    {opt.emoji}
                                  </span>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p
                                    className={cn(
                                      'text-xs sm:text-sm font-bold leading-snug break-words',
                                      isSelected
                                        ? 'text-indigo-600 dark:text-indigo-300 font-black'
                                        : 'text-slate-900 dark:text-slate-100'
                                    )}
                                  >
                                    {opt.title}
                                  </p>
                                  {opt.subtitle && (
                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed break-words">
                                      {opt.subtitle}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div
                                className={cn(
                                  'w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all',
                                  isSelected
                                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                                    : 'border border-slate-300 dark:border-slate-700'
                                )}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </button>
                          </React.Fragment>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* DESKTOP & TABLET FLOATING POPOVER SELECTION WINDOW */
              <div
                ref={panelRef}
                role="listbox"
                style={{
                  position: 'fixed',
                  top: coords.openUpward ? undefined : coords.top,
                  bottom: coords.openUpward ? window.innerHeight - coords.top : undefined,
                  left: coords.left,
                  width: coords.width,
                  maxHeight: coords.maxHeight,
                }}
                className="z-[10050] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-950/20 dark:shadow-black/50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Search Bar when >= 6 options */}
                {showSearch && (
                  <div className="p-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 shrink-0">
                    <div className="relative flex items-center">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setHighlightedIndex(0);
                        }}
                        placeholder="Filtrer les options..."
                        className="w-full h-8 pl-8 pr-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Scrollable Options Viewport */}
                <div className="overflow-y-auto p-1.5 space-y-1 flex-1">
                  {filteredOptions.length === 0 ? (
                    <div className="py-6 px-3 text-center text-xs font-semibold text-slate-400">
                      Aucun résultat pour « {searchQuery} »
                    </div>
                  ) : (
                    filteredOptions.map((opt, idx) => {
                      const isSelected = opt.value === currentValue;
                      const isHighlighted = idx === highlightedIndex;
                      const prevGroup = idx > 0 ? filteredOptions[idx - 1].group : undefined;
                      const showGroupHeader = opt.group && opt.group !== prevGroup;

                      return (
                        <React.Fragment key={`${opt.value}_${idx}`}>
                          {showGroupHeader && (
                            <div className="px-2.5 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                              {opt.group}
                            </div>
                          )}
                          <button
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            disabled={opt.disabled}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                            onClick={() => handleSelect(opt)}
                            className={cn(
                              'w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-start justify-between gap-2.5 cursor-pointer',
                              isSelected
                                ? 'bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30'
                                : isHighlighted
                                ? 'bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-transparent'
                                : 'text-slate-700 dark:text-slate-200 border border-transparent hover:bg-slate-100/60 dark:hover:bg-slate-800/50',
                              opt.disabled && 'opacity-40 cursor-not-allowed'
                            )}
                          >
                            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                              {opt.emoji && (
                                <span
                                  className={cn(
                                    'w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5',
                                    isSelected
                                      ? 'bg-indigo-600 text-white shadow-xs'
                                      : 'bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700'
                                  )}
                                >
                                  {opt.emoji}
                                </span>
                              )}
                              <div className="min-w-0 flex-1">
                                <p
                                  className={cn(
                                    'text-xs font-bold leading-snug break-words',
                                    isSelected
                                      ? 'text-indigo-600 dark:text-indigo-300 font-black'
                                      : 'text-slate-900 dark:text-slate-100'
                                  )}
                                >
                                  {opt.title}
                                </p>
                                {opt.subtitle && (
                                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 leading-snug break-words">
                                    {opt.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div
                              className={cn(
                                'w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all',
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow-2xs'
                                  : 'opacity-0 group-hover:opacity-40'
                              )}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </button>
                        </React.Fragment>
                      );
                    })
                  )}
                </div>
              </div>
            ),
            document.body
          )}
      </>
    );
  }
);

ModernSelect.displayName = 'ModernSelect';
export default ModernSelect;
