import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// ============= STORAGE UTILITIES =============
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

const loadMealPlan = async () => {
  try {
    const result = await storage.get('weekly-meal-plan')
    return result ? JSON.parse(result.value) : {}
  } catch (error) {
    console.error('Error loading meal plan:', error)
    return {}
  }
}

const loadGroceryList = async () => {
  try {
    const result = await storage.get('grocery-list-checked')
    return result ? JSON.parse(result.value) : {}
  } catch (error) {
    console.error('Error loading grocery list:', error)
    return {}
  }
}

const saveGroceryList = async (checkedItems) => {
  try {
    await storage.set('grocery-list-checked', JSON.stringify(checkedItems))
  } catch (error) {
    console.error('Error saving grocery list:', error)
  }
}

// ============= INGREDIENT PARSING =============
// Helper to parse fractions
const parseFraction = (str) => {
  if (str.includes('/')) {
    const [numerator, denominator] = str.split('/').map(Number)
    return numerator / denominator
  }
  return parseFloat(str)
}

const parseIngredient = (ingredientText) => {
  // Extract quantity and unit from ingredient string
  const pattern = /^(\d+(?:\/\d+)?(?:\.\d+)?)\s*(cup|cups|tablespoon|tablespoons|tbsp|teaspoon|tsp|oz|ounce|ounces|pound|pounds|lb|lbs|kg|g|ml|l)?s?\s+(.+)$/i
  const match = ingredientText.trim().match(pattern)
  
  if (match) {
    const [_, quantity, unit, ingredient] = match
    
    return {
      quantity: parseFraction(quantity),
      unit: unit ? unit.toLowerCase() : '',
      ingredient: ingredient.toLowerCase().trim(),
      original: ingredientText
    }
  }
  
  return {
    quantity: 1,
    unit: '',
    ingredient: ingredientText.toLowerCase().trim(),
    original: ingredientText
  }
}

const normalizeUnit = (unit) => {
  const unitMap = {
    'cup': 'cup',
    'cups': 'cup',
    'tablespoon': 'tbsp',
    'tablespoons': 'tbsp',
    'tbsp': 'tbsp',
    'teaspoon': 'tsp',
    'teaspoons': 'tsp',
    'tsp': 'tsp',
    'oz': 'oz',
    'ounce': 'oz',
    'ounces': 'oz',
    'pound': 'lb',
    'pounds': 'lb',
    'lb': 'lb',
    'lbs': 'lb',
    'kg': 'kg',
    'g': 'g',
    'ml': 'ml',
    'l': 'l'
  }
  return unitMap[unit.toLowerCase()] || unit.toLowerCase()
}

const combineIngredients = (ingredients) => {
  const combined = {}
  
  ingredients.forEach(ing => {
    const parsed = parseIngredient(ing)
    const key = `${parsed.ingredient}-${normalizeUnit(parsed.unit)}`
    
    if (combined[key]) {
      combined[key].quantity += parsed.quantity
      combined[key].sources.push(parsed.original)
    } else {
      combined[key] = {
        ...parsed,
        unit: normalizeUnit(parsed.unit),
        sources: [parsed.original]
      }
    }
  })
  
  return Object.values(combined).map(item => ({
    display: `${item.quantity > 0 && item.quantity !== 1 ? Math.round(item.quantity * 100) / 100 + ' ' : ''}${item.unit ? item.unit + ' ' : ''}${item.ingredient}`,
    key: `${item.ingredient}-${item.unit}`,
    sources: item.sources
  }))
}

// ============= GROCERY LIST COMPONENT =============
export default function GroceryList() {
  const navigate = useNavigate()
  const [groceryItems, setGroceryItems] = useState([])
  const [checkedItems, setCheckedItems] = useState({})
  const [loading, setLoading] = useState(true)
  const [groupByCategory, setGroupByCategory] = useState(false)

  useEffect(() => {
    loadGroceryData()
  }, [])

  const loadGroceryData = async () => {
    setLoading(true)
    try {
      const mealPlan = await loadMealPlan()
      const savedChecked = await loadGroceryList()
      
      // Extract all recipes from the meal plan
      const allRecipes = Object.values(mealPlan).flat()
      
      // Extract all ingredients with metadata
      const allIngredients = allRecipes.flatMap(recipe => 
        (recipe.ingredients || []).map(ing => ({
          text: ing,
          category: recipe.category,
          recipeName: recipe.name
        }))
      )
      
      // Combine similar ingredients
      const ingredientTexts = allIngredients.map(i => i.text)
      const combinedIngredients = combineIngredients(ingredientTexts)
      
      // Add category info back
      const itemsWithMeta = combinedIngredients.map(item => {
        const matchingIngredients = allIngredients.filter(ing => 
          item.sources.includes(ing.text)
        )
        return {
          ...item,
          categories: [...new Set(matchingIngredients.map(i => i.category))],
          recipes: [...new Set(matchingIngredients.map(i => i.recipeName))]
        }
      })
      
      setGroceryItems(itemsWithMeta)
      setCheckedItems(savedChecked)
    } catch (error) {
      console.error('Error loading grocery data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleItem = async (itemKey) => {
    const newChecked = {
      ...checkedItems,
      [itemKey]: !checkedItems[itemKey]
    }
    setCheckedItems(newChecked)
    await saveGroceryList(newChecked)
  }

  const clearChecked = async () => {
    setCheckedItems({})
    await saveGroceryList({})
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-3xl font-fjalla text-darkbrown">Loading grocery list...</p>
      </div>
    )
  }

  const groupedItems = groupByCategory
    ? groceryItems.reduce((acc, item) => {
        item.categories.forEach(cat => {
          if (!acc[cat]) acc[cat] = []
          acc[cat].push(item)
        })
        return acc
      }, {})
    : { 'All Items': groceryItems }

  const checkedCount = Object.values(checkedItems).filter(Boolean).length
  const totalCount = groceryItems.length

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-gasoek text-blue uppercase mb-4">
          Grocery List
        </h1>
        
        <div className="flex justify-between items-center mb-6">
          <p className="text-lg font-fjalla text-darkbrown">
            {checkedCount} of {totalCount} items checked
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={() => setGroupByCategory(!groupByCategory)}
              className="bg-blue text-cream font-fjalla px-6 py-2 rounded-lg hover:bg-darkbrown transition-colors uppercase"
            >
              {groupByCategory ? 'Show All' : 'Group by Category'}
            </button>
            
            {checkedCount > 0 && (
              <button
                onClick={clearChecked}
                className="bg-orange text-cream font-fjalla px-6 py-2 rounded-lg hover:bg-darkbrown transition-colors uppercase"
              >
                Clear Checked
              </button>
            )}
          </div>
        </div>

        {groceryItems.length === 0 ? (
          <div className="bg-orange rounded-xl p-12 text-center">
            <p className="text-2xl font-fjalla text-cream uppercase mb-4">
              No meals planned yet!
            </p>
            <p className="text-cream mb-6">
              Add some meals to your weekly plan to generate a grocery list
            </p>
            <button
              onClick={() => navigate('/food-week')}
              className="bg-cream text-darkbrown font-fjalla px-8 py-3 rounded-lg hover:bg-blue hover:text-cream transition-colors uppercase"
            >
              Plan Your Week
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="bg-orange rounded-xl p-6 shadow-lg">
                {groupByCategory && (
                  <h2 className="text-2xl font-fjalla text-cream uppercase mb-4 border-b-2 border-cream pb-2">
                    {category}
                  </h2>
                )}
                
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.key}
                      onClick={() => toggleItem(item.key)}
                      className={`bg-cream rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        checkedItems[item.key] ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                            checkedItems[item.key]
                              ? 'bg-blue border-blue'
                              : 'border-darkbrown'
                          }`}>
                            {checkedItems[item.key] && (
                              <span className="text-cream text-sm">✓</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <p className={`font-fjalla text-lg uppercase ${
                            checkedItems[item.key] ? 'line-through text-darkbrown opacity-60' : 'text-darkbrown'
                          }`}>
                            {item.display}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.recipes.map(recipe => (
                              <span
                                key={recipe}
                                className="text-xs bg-blue text-cream px-2 py-1 rounded-full"
                              >
                                {recipe}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="mt-8 bg-darkbrown text-cream font-fjalla text-2xl px-8 py-4 rounded-xl hover:bg-blue transition-colors uppercase"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}