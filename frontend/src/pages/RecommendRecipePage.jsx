// RecommendRecipePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipes } from '../hooks/useRecipes';
import { usePreferences } from '../hooks/usePreferences';
import recommend from '../assets/illustrations/recommend.svg';

export default function RecommendRecipePage() {
  const navigate = useNavigate();
  const { recipes, addRecipe } = useRecipes();
  const { preferences, hasPreferences, loading: prefsLoading } = usePreferences();
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [error, setError] = useState(null);

  // Check if user has set preferences, if not redirect to preferences page
  useEffect(() => {
    if (!prefsLoading && !hasPreferences()) {
      navigate('/preferences', { state: { returnTo: '/recommend' } });
    }
  }, [prefsLoading, hasPreferences, navigate]);

  const getSuggestion = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/recommend-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipes: recipes,
          preferences: preferences // Send preferences to backend
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuggestion(data.suggestion);
      } else {
        throw new Error(data.error || 'Failed to get suggestion');
      }
      
    } catch (err) {
      console.error("Error getting suggestion:", err);
      setError("COULDN'T GET A SUGGESTION. PLEASE TRY AGAIN!");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!suggestion) return;
    
    try {
      const { reasoning, ...recipeData } = suggestion;
      await addRecipe(recipeData);
      navigate('/next', { state: { direction: 'back' } });
    } catch (err) {
      console.error("Error saving recipe:", err);
      setError("Couldn't save recipe. Please try again!");
    }
  };

  // Show loading while checking preferences
  if (prefsLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-3xl font-fjalla text-darkbrown">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-8">
      
      {/* Illustration and Generate Button - Only show if no suggestion yet */}
      {!suggestion && (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
          {/* Illustration */}
          <img 
            src={recommend}
            alt="" 
            className="w-180 h-82 object-cover rounded-xl mb-8"
          />
          {/* Header */}
          <h1 className="text-6xl font-gasoek text-blue mb-4">
            RECOMMEND A RECIPE
          </h1>
          <h1 className="text-2xl font-fjalla text-darkbrown mb-8">
            GET A RECIPE BASED ON YOUR TASTE.
          </h1>

          {/* Show current preferences summary */}
          {preferences && (
            <div className="mb-4 text-center text-blue ">
              <span className="font-semibold">Current Preferences</span>
              {preferences.dietaryRestrictions.length > 0 && (
                <span>: {preferences.dietaryRestrictions.join(', ')}</span>
              )}
              <button
                onClick={() => navigate('/preferences')}
                className="
                  inline-flex items-center gap-2
                  text-lg text-darkbrown
                  underline underline-offset-4
                  hover:text-orange
                  transition-colors
                "
              >
                
                <span className="text-sm opacity-70">(edit)</span>
              </button>
            </div>
          )}


          <button 
            onClick={getSuggestion}
            disabled={loading}
            className="bg-orange text-cream font-fjalla text-3xl uppercase px-16 py-6 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Thinking..." : "Generate Suggestion"}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-4 border-red-500 text-red-700 px-6 py-4 rounded-xl mb-8 font-fjalla text-xl">
          {error}
        </div>
      )}

      {/* Suggestion Card */}
      {suggestion && (
        <div className="space-y-6 mb-8">
          {/* Recipe Card */}
          <div className="bg-orange rounded-xl p-8">
            <h2 className="text-4xl font-gasoek text-cream uppercase mb-2">
              {suggestion.name}
            </h2>
            <p className="text-xl font-fjalla uppercase text-cream opacity-90">
              {suggestion.category}
            </p>
          </div>

          {/* Why You'll Love This */}
          <div className="bg-blue rounded-xl p-8">
            <h3 className="text-3xl font-fjalla text-cream uppercase mb-4">
              Why You'll Love This
            </h3>
            <p className="text-lg text-cream leading-relaxed">
              {suggestion.reasoning}
            </p>
          </div>

          {/* Recipe Details */}
          <div className="bg-orange rounded-xl p-8">
            <div className="flex gap-8 mb-6 flex-wrap">
              <div>
                <span className="text-cream text-lg font-fjalla uppercase">Servings: </span>
                <span className="text-cream text-lg">{suggestion.servings}</span>
              </div>
              <div>
                <span className="text-cream text-lg font-fjalla uppercase">Prep: </span>
                <span className="text-cream text-lg">{suggestion.prepTime}</span>
              </div>
              <div>
                <span className="text-cream text-lg font-fjalla uppercase">Cook: </span>
                <span className="text-cream text-lg">{suggestion.cookTime}</span>
              </div>
            </div>

            {/* Ingredients */}
            <div className="mb-6">
              <h3 className="text-3xl font-fjalla text-cream uppercase mb-3">
                Ingredients
              </h3>
              <ul className="space-y-2">
                {suggestion.ingredients.map((ing, i) => (
                  <li key={i} className="text-cream text-lg">
                    • {ing}
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-3xl font-fjalla text-cream uppercase mb-3">
                Instructions
              </h3>
              <ol className="space-y-3">
                {suggestion.instructions.map((step, i) => (
                  <li key={i} className="text-cream text-lg">
                    <span className="font-fjalla">{i + 1}.</span> {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSaveRecipe}
              className="bg-darkbrown text-cream font-fjalla text-2xl uppercase px-12 py-4 rounded-xl hover:opacity-90 transition-opacity"
            >
              Save Recipe
            </button>
            <button
              onClick={() => {
                setSuggestion(null);
                getSuggestion();
              }}
              className="bg-blue text-cream font-fjalla text-2xl uppercase px-12 py-4 rounded-xl hover:opacity-90 transition-opacity"
            >
              Get Another
            </button>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button 
        onClick={() => navigate('/next', { state: { direction: 'back' } })}
        className="bg-darkbrown text-cream font-fjalla text-2xl uppercase px-12 py-4 rounded-xl hover:opacity-90 transition-opacity"
      >
        Back
      </button>
    </div>
  );
}