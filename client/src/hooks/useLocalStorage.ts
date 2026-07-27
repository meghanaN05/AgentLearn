import { useState } from "react";

function useLocalStorage<T>(
  key: string,
  initialValue: T
) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);

      return item
        ? (JSON.parse(item) as T)
        : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);

      localStorage.setItem(
        key,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const removeValue = () => {
    localStorage.removeItem(key);
    setStoredValue(initialValue);
  };

  return [
    storedValue,
    setValue,
    removeValue,
  ] as const;
}

export default useLocalStorage;