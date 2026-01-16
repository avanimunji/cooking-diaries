import { useState, useEffect } from 'react'
import { useRecipes } from '../hooks/useRecipes'
import { useNavigate, useLocation } from 'react-router-dom'

// ============= STORAGE UTILITIES =============
const STORAGE_KEY = 'weekly-meal-plan'

// Helper function to use localStorage
const storage = {
  async get(key) {
    try {
      const value = localStorage.getItem(key)
      if (value) {
        return { key, value }
      }
      return null
    } catch (error) {
      console.error('Storage get error:', error)
      return null
    }
  },
  
  async set(key, value) {
    try {
      localStorage.setItem(key, value)
      return { key, value }
    } catch (error) {
      console.error('Storage set error:', error)
      return null
    }
  }
}

const saveMealPlan = async (mealPlan) => {
  try {
    await storage.set(STORAGE_KEY, JSON.stringify(mealPlan))
  } catch (error) {
    console.error('Error saving meal plan:', error)
  }
}

const loadMealPlan = async () => {
  try {
    const result = await storage.get(STORAGE_KEY)
    return result ? JSON.parse(result.value) : {}
  } catch (error) {
    console.error('Error loading meal plan:', error)
    return {}
  }
}

// ============= CLUSTERING LOGIC =============
const normalizeIngredient = (ingredient) => {
  return ingredient.toLowerCase().replace(/\d+/g, '').replace(/cup|cups|tablespoon|tbsp|tsp|oz|pound|lb|kg|g|ml/gi, '').trim()
}

const calculateSimilarity = (ingredients1, ingredients2) => {
  const set1 = new Set(ingredients1.map(normalizeIngredient))
  const set2 = new Set(ingredients2.map(normalizeIngredient))
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  return intersection.size / union.size
}

const findSimilarRecipes = (selectedRecipes, allRecipes, threshold = 0.3) => {
  if (selectedRecipes.length === 0) return []
  
  const selectedIngredients = selectedRecipes.flatMap(r => r.ingredients || [])
  
  return allRecipes
    .filter(recipe => !selectedRecipes.find(r => r.id === recipe.id))
    .map(recipe => ({
      ...recipe,
      similarity: calculateSimilarity(selectedIngredients, recipe.ingredients || [])
    }))
    .filter(recipe => recipe.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
}

// ============= FULL WEEK VIEW COMPONENT =============
export function FoodWeekView() {
  const navigate = useNavigate()
  const { recipes, loading } = useRecipes()
  const [mealPlan, setMealPlan] = useState({})

  const daysOfWeek = [
    { short: 'M', full: 'Monday', key: 'monday' },
    { short: 'T', full: 'Tuesday', key: 'tuesday' },
    { short: 'W', full: 'Wednesday', key: 'wednesday' },
    { short: 'TH', full: 'Thursday', key: 'thursday' },
    { short: 'F', full: 'Friday', key: 'friday' },
    { short: 'SA', full: 'Saturday', key: 'saturday' },
    { short: 'SU', full: 'Sunday', key: 'sunday' }
  ]

  useEffect(() => {
    const loadData = async () => {
      const savedPlan = await loadMealPlan()
      setMealPlan(savedPlan)
    }
    loadData()
  }, [])

  const removeMealFromDay = async (dayKey, recipeId) => {
    const newPlan = {
      ...mealPlan,
      [dayKey]: (mealPlan[dayKey] || []).filter(r => r.id !== recipeId)
    }
    setMealPlan(newPlan)
    await saveMealPlan(newPlan)
  }

  const handleDayClick = (day) => {
    navigate('/food-week/day', { state: { day } })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-3xl font-fjalla text-darkbrown">Loading recipes...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-6xl font-gasoek text-blue uppercase mb-8">
          Food for the Week
        </h1>

        <div className="max-w-6xl mx-auto flex flex-row flex-nowrap space-x-6 overflow-x-auto overflow-y-hidden pr-4 custom-scrollbar">


          {daysOfWeek.map((day) => (
            <div
              key={day.key}
              className="bg-orange rounded-xl overflow-hidden shadow-lg flex-shrink-0 w-64 mb-30"
            >
              <div className="bg-darkbrown p-4 flex justify-between items-center">
                <h2 className="text-2xl font-fjalla text-cream uppercase">
                  {day.short}
                </h2>
                <button
                  onClick={() => handleDayClick(day)}
                  className="bg-cream text-darkbrown w-10 h-10 rounded-lg text-2xl font-bold hover:bg-orange transition-colors"
                >
                  +
                </button>
              </div>

              <div className="p-4 space-y-3 min-h-[300px] bg-cream">
                {(mealPlan[day.key] || []).map((recipe) => (
                  <div
                    key={recipe.id}
                    className="bg-cream border-2 border-orange rounded-lg p-3 group hover:border-blue transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-fjalla text-darkbrown uppercase text-sm">
                          {recipe.name}
                        </h3>
                        <p className="text-xs text-darkbrown opacity-60 mt-1">
                          {recipe.category}
                        </p>
                      </div>
                      <button
                        onClick={() => removeMealFromDay(day.key, recipe.id)}
                        className="text-orange hover:text-blue opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xl"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/next')}
          className="bg-darkbrown text-cream font-fjalla text-2xl px-8 py-4 rounded-xl hover:bg-blue transition-colors uppercase"
        >
          Back
        </button>
      </div>
    </div>
  )
}

// ============= DAY PLANNER COMPONENT =============
export function DayPlanner() {
  const navigate = useNavigate()
  const location = useLocation()
  const { recipes, loading } = useRecipes()
  const [mealPlan, setMealPlan] = useState({})
  const [plannerMode, setPlannerMode] = useState(null)
  
  const selectedDay = location.state?.day

  useEffect(() => {
    const loadData = async () => {
      const savedPlan = await loadMealPlan()
      setMealPlan(savedPlan)
    }
    loadData()
  }, [])

  if (!selectedDay) {
    navigate('/food-week')
    return null
  }

  const addMealToDay = async (dayKey, recipe) => {
    const newPlan = {
      ...mealPlan,
      [dayKey]: [...(mealPlan[dayKey] || []), recipe]
    }
    setMealPlan(newPlan)
    await saveMealPlan(newPlan)
  }

  const removeMealFromDay = async (dayKey, recipeId) => {
    const newPlan = {
      ...mealPlan,
      [dayKey]: (mealPlan[dayKey] || []).filter(r => r.id !== recipeId)
    }
    setMealPlan(newPlan)
    await saveMealPlan(newPlan)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-3xl font-fjalla text-darkbrown">Loading recipes...</p>
      </div>
    )
  }

  const currentDayMeals = mealPlan[selectedDay.key] || []
  const similarRecipes = plannerMode === 'similar' 
    ? findSimilarRecipes(currentDayMeals, recipes)
    : []

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-gasoek text-blue uppercase mb-2">
          Plan {selectedDay.full}
        </h1>
        <p className="text-lg font-fjalla text-darkbrown mb-8">
          {currentDayMeals.length} meal{currentDayMeals.length !== 1 ? 's' : ''} planned
        </p>

        {/* Current meals for this day */}
        {currentDayMeals.length > 0 && (
          <div className="bg-orange rounded-xl p-6 shadow-lg mb-6">
            <h2 className="text-2xl font-fjalla text-cream uppercase mb-4">Current Meals</h2>
            <div className="space-y-3">
              {currentDayMeals.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-cream rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-fjalla text-darkbrown uppercase">{recipe.name}</h3>
                    <p className="text-sm text-darkbrown opacity-70">{recipe.category}</p>
                  </div>
                  <button
                    onClick={() => removeMealFromDay(selectedDay.key, recipe.id)}
                    className="bg-orange text-cream px-4 py-2 rounded-lg hover:bg-blue transition-colors font-fjalla uppercase"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Planning mode selection */}
        {!plannerMode && (
          <div className="bg-orange rounded-xl p-8 shadow-lg">
            <h2 className="text-3xl font-fjalla text-cream uppercase mb-6 text-center">
              How would you like to plan?
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <button
                onClick={() => setPlannerMode('similar')}
                className="bg-blue text-cream p-8 rounded-xl hover:bg-darkbrown transition-all shadow-lg"
              >
                <h3 className="text-2xl font-fjalla uppercase mb-2">Similar Ingredients</h3>
                <p className="text-cream opacity-80">
                  Find recipes that share ingredients for efficient shopping
                </p>
              </button>

              <button
                onClick={() => setPlannerMode('browse')}
                className="bg-darkbrown text-cream p-8 rounded-xl hover:bg-blue transition-all shadow-lg"
              >
                <h3 className="text-2xl font-fjalla uppercase mb-2">Browse All Recipes</h3>
                <p className="text-cream opacity-80">
                  Choose from your entire recipe collection
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Recipe selection - Similar Ingredients mode */}
        {plannerMode === 'similar' && (
          <div className="bg-orange rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-fjalla text-cream uppercase">
                Recipes with Similar Ingredients
              </h2>
              <button
                onClick={() => setPlannerMode(null)}
                className="text-cream hover:text-darkbrown font-fjalla uppercase"
              >
                Change Mode
              </button>
            </div>
            
            {similarRecipes.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {similarRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="bg-cream rounded-lg p-4 hover:border-2 hover:border-blue transition-colors"
                  >
                    <h3 className="font-fjalla text-darkbrown uppercase mb-2">
                      {recipe.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs bg-blue text-cream px-2 py-1 rounded-full font-fjalla uppercase">
                        {Math.round(recipe.similarity * 100)}% match
                      </span>
                      <span className="text-xs text-darkbrown opacity-70">{recipe.category}</span>
                    </div>
                    <button
                      onClick={() => {
                        addMealToDay(selectedDay.key, recipe)
                      }}
                      className="w-full bg-blue text-cream py-2 rounded-lg hover:bg-darkbrown transition-colors font-fjalla uppercase"
                    >
                      Add to {selectedDay.full}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center uppercase py-8 text-cream">
                <p className="mb-4 font-fjalla text-lg">No similar recipes found. Try browsing all recipes!</p>
                <button
                  onClick={() => setPlannerMode('browse')}
                  className="bg-darkbrown text-cream px-6 py-3 rounded-lg hover:bg-blue transition-colors font-fjalla uppercase"
                >
                  Browse All Recipes
                </button>
              </div>
            )}
          </div>
        )}

        {/* Recipe selection - Browse mode */}
        {plannerMode === 'browse' && (
          <div className="bg-orange rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-fjalla text-cream uppercase">All Recipes</h2>
              <button
                onClick={() => setPlannerMode(null)}
                className="text-cream hover:text-darkbrown font-fjalla uppercase"
              >
                Change Mode
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
              {recipes.map((recipe) => {
                const alreadyAdded = currentDayMeals.find(m => m.id === recipe.id)
                
                return (
                  <div
                    key={recipe.id}
                    className={`bg-cream rounded-lg p-4 ${
                      alreadyAdded 
                        ? 'opacity-50' 
                        : 'hover:border-2 hover:border-blue'
                    } transition-colors`}
                  >
                    <h3 className="font-fjalla text-darkbrown uppercase mb-2">
                      {recipe.name}
                    </h3>
                    <p className="text-xs text-darkbrown opacity-70 mb-3">{recipe.category}</p>
                    <button
                      onClick={() => addMealToDay(selectedDay.key, recipe)}
                      disabled={alreadyAdded}
                      className={`w-full py-2 rounded-lg font-fjalla uppercase transition-colors ${
                        alreadyAdded
                          ? 'bg-darkbrown text-cream opacity-50 cursor-not-allowed'
                          : 'bg-blue text-cream hover:bg-darkbrown'
                      }`}
                    >
                      {alreadyAdded ? 'Already Added' : `Add to ${selectedDay.full}`}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/food-week')}
          className="mt-8 bg-darkbrown text-cream font-fjalla text-2xl px-8 py-4 rounded-xl hover:bg-blue transition-colors uppercase"
        >
          Back to Week View
        </button>
      </div>
    </div>
  )
}