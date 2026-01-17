import { useState, useEffect } from 'react';

// hooks/usePreferences.js
export function usePreferences() {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load preferences from localStorage on mount
    const stored = localStorage.getItem('dietaryPreferences');
    if (stored) {
      setPreferences(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const savePreferences = (prefs) => {
    localStorage.setItem('dietaryPreferences', JSON.stringify(prefs));
    setPreferences(prefs);
  };

  const clearPreferences = () => {
    localStorage.removeItem('dietaryPreferences');
    setPreferences(null);
  };

  const hasPreferences = () => {
    return preferences !== null;
  };

  return {
    preferences,
    savePreferences,
    clearPreferences,
    hasPreferences,
    loading
  };
}

// Example of what preferences object looks like:
const examplePreferences = {
  dietaryRestrictions: ['vegetarian', 'gluten-free'], // or empty array
  allergies: ['nuts', 'shellfish'], // or empty array
  cuisinePreferences: ['Italian', 'Mexican', 'Thai'],
  skillLevel: 'intermediate', // beginner, intermediate, advanced
  spiceLevel: 'medium', // mild, medium, spicy
  avoidIngredients: ['cilantro', 'olives']
};