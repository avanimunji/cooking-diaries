// PreferencesPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../hooks/usePreferences';

export default function PreferencesPage() {
  const navigate = useNavigate();
  const { preferences, savePreferences } = usePreferences();
  
  const [formData, setFormData] = useState({
    dietaryRestrictions: [],
    allergies: [],
    cuisinePreferences: [],
    skillLevel: 'intermediate',
    spiceLevel: 'medium',
    avoidIngredients: []
  });

  const [customInput, setCustomInput] = useState({
    allergy: '',
    cuisine: '',
    avoidIngredient: ''
  });

  // Load existing preferences if they exist
  useEffect(() => {
    if (preferences) {
      setFormData(preferences);
    }
  }, [preferences]);

  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Pescatarian',
    'Gluten-Free',
    'Dairy-Free',
    'Keto',
    'Paleo',
    'Low-Carb',
    'Halal',
    'Kosher'
  ];

  const commonAllergies = [
    'Nuts',
    'Peanuts',
    'Shellfish',
    'Eggs',
    'Soy',
    'Wheat',
    'Fish',
    'Sesame'
  ];

  const cuisineOptions = [
    'Italian',
    'Mexican',
    'Chinese',
    'Japanese',
    'Indian',
    'Thai',
    'Mediterranean',
    'American',
    'French',
    'Korean'
  ];

  const toggleArrayItem = (array, item) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  const handleCheckbox = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: toggleArrayItem(prev[field], value)
    }));
  };

  const handleAddCustom = (field, inputField) => {
    const value = customInput[inputField].trim();
    if (value && !formData[field].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }));
      setCustomInput(prev => ({ ...prev, [inputField]: '' }));
    }
  };

  const handleRemoveCustom = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    savePreferences(formData);
    navigate('/recommend-recipe', { state: { direction: 'back' } }); // Go back to previous page
  };

  const CheckboxSection = ({ title, options, field }) => (
    <div className="mb-8">
      <h3 className="text-2xl font-fjalla text-darkbrown uppercase mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {options.map(option => (
          <label key={option} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData[field].includes(option)}
              onChange={() => handleCheckbox(field, option)}
              className="w-5 h-5 text-orange focus:ring-orange border-gray-300 rounded"
            />
            <span className="text-lg text-darkbrown">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const CustomInputSection = ({ title, field, inputField, placeholder }) => {
    const customItems = formData[field].filter(item => 
      !commonAllergies.includes(item) && 
      !cuisineOptions.includes(item)
    );

    return (
      <div className="mb-8">
        <h3 className="text-2xl font-fjalla text-darkbrown uppercase mb-4">{title}</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={customInput[inputField]}
            onChange={(e) => setCustomInput(prev => ({ ...prev, [inputField]: e.target.value }))}
            placeholder={placeholder}
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange focus:outline-none"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustom(field, inputField))}
          />
          <button
            type="button"
            onClick={() => handleAddCustom(field, inputField)}
            className="bg-orange text-cream font-fjalla px-6 py-2 uppercase rounded-lg hover:opacity-90"
          >
            Add
          </button>
        </div>
        {customItems.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customItems.map(item => (
              <span key={item} className="bg-blue text-cream px-3 py-1 rounded-full flex items-center gap-2">
                {item}
                <button
                  type="button"
                  onClick={() => handleRemoveCustom(field, item)}
                  className="hover:opacity-70"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-gasoek text-blue mb-4">
          DIETARY PREFERENCES
        </h1>
        <p className="text-xl font-fjalla uppercase text-darkbrown mb-8">
          Help us personalize your recipe recommendations.
        </p>

        <div className="bg-white rounded-xl p-8 shadow-lg">
          
          <CheckboxSection 
            title="Dietary Restrictions" 
            options={dietaryOptions}
            field="dietaryRestrictions"
          />

          <CheckboxSection 
            title="Common Allergies" 
            options={commonAllergies}
            field="allergies"
          />

          <CustomInputSection
            title="Other Allergies or Ingredients to Avoid"
            field="avoidIngredients"
            inputField="avoidIngredient"
            placeholder="e.g., cilantro, mushrooms"
          />

          <CheckboxSection 
            title="Favorite Cuisines" 
            options={cuisineOptions}
            field="cuisinePreferences"
          />

          <div className="mb-8">
            <h3 className="text-2xl font-fjalla text-darkbrown uppercase mb-4">
              Cooking Skill Level
            </h3>
            <div className="flex gap-4">
              {['beginner', 'intermediate', 'advanced'].map(level => (
                <label key={level} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="skillLevel"
                    value={level}
                    checked={formData.skillLevel === level}
                    onChange={(e) => setFormData(prev => ({ ...prev, skillLevel: e.target.value }))}
                    className="w-5 h-5 text-orange focus:ring-orange"
                  />
                  <span className="text-lg text-darkbrown capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-fjalla text-darkbrown uppercase mb-4">
              Spice Preference
            </h3>
            <div className="flex gap-4">
              {['mild', 'medium', 'spicy'].map(level => (
                <label key={level} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="spiceLevel"
                    value={level}
                    checked={formData.spiceLevel === level}
                    onChange={(e) => setFormData(prev => ({ ...prev, spiceLevel: e.target.value }))}
                    className="w-5 h-5 text-orange focus:ring-orange"
                  />
                  <span className="text-lg text-darkbrown capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              className="bg-orange text-cream font-fjalla text-2xl uppercase px-12 py-4 rounded-xl hover:opacity-90 transition-opacity"
            >
              Save Preferences
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-darkbrown text-cream font-fjalla text-2xl uppercase px-12 py-4 rounded-xl hover:opacity-90 transition-opacity"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}