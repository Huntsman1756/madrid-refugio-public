"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import {
  type SearchKind,
  type SearchOption,
} from "@/lib/madrid-search";

interface AddressAutocompleteFieldProps {
  label: string;
  hideLabelVisually?: boolean;
  name: string;
  options: SearchOption[];
  onSelect: (option: SearchOption) => void;
  onSelectedOptionChange?: (option: SearchOption | null) => void;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  selectedOption?: SearchOption | null;
  value?: string;
}

const KIND_LABELS: Record<SearchKind, string> = {
  address: "Direccion",
  place: "Lugar",
  area: "Area",
};

export const AddressAutocompleteField = forwardRef<HTMLInputElement, AddressAutocompleteFieldProps>(function AddressAutocompleteField({
  label,
  hideLabelVisually = false,
  name,
  options,
  onSelect,
  onSelectedOptionChange,
  onValueChange,
  placeholder,
  selectedOption: controlledSelectedOption,
  value: controlledValue,
}: AddressAutocompleteFieldProps, ref) {
  const [uncontrolledValue, setUncontrolledValue] = useState("");
  const [uncontrolledSelectedOption, setUncontrolledSelectedOption] = useState<SearchOption | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();

  const value = controlledValue ?? uncontrolledValue;
  const selectedOption = controlledSelectedOption ?? uncontrolledSelectedOption;

  const suggestions = selectedOption?.label === value ? [] : options;

  const isListOpen = isOpen && suggestions.length > 0;

  useEffect(() => {
    if (!isListOpen) {
      setActiveIndex(-1);
      return;
    }

    setActiveIndex((currentIndex) => {
      if (currentIndex < 0) {
        return 0;
      }

      return Math.min(currentIndex, suggestions.length - 1);
    });
  }, [isListOpen, suggestions.length]);

  useEffect(() => {
    if (!isListOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isListOpen]);

  const setValue = (nextValue: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  const setSelectedOption = (option: SearchOption | null) => {
    if (controlledSelectedOption === undefined) {
      setUncontrolledSelectedOption(option);
    }

    onSelectedOptionChange?.(option);
  };

  const handleSelect = (option: SearchOption) => {
    setValue(option.label);
    setSelectedOption(option);
    setIsOpen(false);
    onSelect(option);
  };

  const handleChange = (nextValue: string) => {
    setValue(nextValue);
    setSelectedOption(null);
    setIsOpen(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!suggestions.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((currentIndex) => (currentIndex + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((currentIndex) => (currentIndex <= 0 ? suggestions.length - 1 : currentIndex - 1));
      return;
    }

    if (event.key === "Enter" && isListOpen && activeIndex >= 0) {
      event.preventDefault();
      handleSelect(suggestions[activeIndex]);
    }
  };

  return (
    <div
      ref={rootRef}
      className="space-y-2"
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget)) {
          return;
        }

        setIsOpen(false);
      }}
    >
      {label ? (
        <label htmlFor={name} className={hideLabelVisually ? "sr-only" : "block text-sm font-medium text-[var(--ds-black)]"}>
          {label}
        </label>
      ) : null}

      <input
        ref={ref}
        id={name}
        name={name}
        type="text"
        role="combobox"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={isListOpen}
        aria-activedescendant={isListOpen && activeIndex >= 0 ? `${listboxId}-option-${suggestions[activeIndex]?.id}` : undefined}
        onChange={(event) => {
          handleChange(event.target.value);
        }}
        onFocus={() => {
          if (suggestions.length > 0) {
            setIsOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
        className="w-full rounded-2xl border border-[var(--ds-gray-200)] bg-[var(--ds-gray-50)] px-4 py-3 text-sm text-[var(--ds-black)] placeholder:text-[var(--ds-gray-400)] focus:border-transparent focus:ring-2 focus:ring-[var(--ds-focus-color)] focus:ring-offset-2"
      />

      {isListOpen && (
        <ul
          id={listboxId}
          role="listbox"
          className="space-y-2 rounded-2xl border border-[var(--ds-gray-200)] bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
        >
          {suggestions.map((option, index) => (
            <li
              key={option.id}
              id={`${listboxId}-option-${option.id}`}
              role="option"
              aria-selected={index === activeIndex}
            >
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => handleSelect(option)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left hover:bg-[var(--ds-gray-50)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-focus-color)] focus-visible:ring-offset-2 ${index === activeIndex ? "bg-[var(--ds-gray-50)]" : ""}`}
              >
                <span className="min-w-0 text-sm text-[var(--ds-black)]">{option.label}</span>
                <span className="shrink-0 rounded-full bg-[var(--ds-gray-100)] px-2 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--ds-gray-500)]">
                  {KIND_LABELS[option.kind]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
