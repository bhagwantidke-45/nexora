import { useState, useEffect } from "react";

/**
 * useDebounce — delays updating a value until after `delay` ms of inactivity.
 * Use for search inputs to avoid firing on every keystroke.
 *
 * const debouncedSearch = useDebounce(search, 300);
 */
const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;