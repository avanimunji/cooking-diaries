import { useState, useEffect } from 'react'

// Helper function to use localStorage in development
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
  },
  
  async delete(key) {
    try {
      localStorage.removeItem(key)
      return { key, deleted: true }
    } catch (error) {
      console.error('Storage delete error:', error)
      return null
    }
  }
}

export function useRecipes() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecipes()
  }, [])

  const loadRecipes = async () => {
    console.log('Loading recipes...')
    try {
      setLoading(true)
      
      const result = await storage.get('recipes')
      console.log('Storage result:', result)
      
      if (result && result.value) {
        const loadedRecipes = JSON.parse(result.value)
        console.log('Loaded recipes from storage:', loadedRecipes)
        setRecipes(loadedRecipes)
      } else {
        console.log('Creating sample recipes...')
        const sampleRecipes = [
          { 
            id: 1, 
            name: 'Spaghetti Carbonara', 
            category: 'Pasta',
            servings: '4',
            prepTime: '15 mins',
            cookTime: '20 mins',
            ingredients: [
              '400g spaghetti',
              '200g pancetta',
              '4 eggs',
              '100g parmesan cheese',
              'Salt and black pepper'
            ],
            instructions: [
              'Cook spaghetti according to package directions',
              'Fry pancetta until crispy',
              'Beat eggs with parmesan',
              'Toss hot pasta with pancetta and egg mixture',
              'Season and serve immediately'
            ],
            createdAt: Date.now()
          },
          { 
            id: 2, 
            name: 'Chicken Tikka Masala', 
            category: 'Indian',
            servings: '6',
            prepTime: '30 mins',
            cookTime: '40 mins',
            ingredients: [
              '800g chicken breast',
              '400ml coconut cream',
              '400g crushed tomatoes',
              '2 tbsp tikka masala paste',
              'Rice for serving'
            ],
            instructions: [
              'Marinate chicken in tikka paste',
              'Grill chicken until charred',
              'Make sauce with tomatoes and cream',
              'Add chicken to sauce',
              'Simmer and serve with rice'
            ],
            createdAt: Date.now()
          },
          { 
            id: 3, 
            name: 'Beef Tacos', 
            category: 'Mexican',
            servings: '4',
            prepTime: '10 mins',
            cookTime: '15 mins',
            ingredients: [
              '500g ground beef',
              'Taco shells',
              'Lettuce, tomatoes, cheese',
              'Taco seasoning',
              'Sour cream'
            ],
            instructions: [
              'Brown the ground beef',
              'Add taco seasoning and water',
              'Simmer until thickened',
              'Serve in taco shells with toppings'
            ],
            createdAt: Date.now()
          }
        ]
        
        console.log('Sample recipes created:', sampleRecipes)
        setRecipes(sampleRecipes)
        await storage.set('recipes', JSON.stringify(sampleRecipes))
        console.log('Sample recipes saved to storage')
      }
    } catch (error) {
      console.error('Error in loadRecipes:', error)
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }

  const saveRecipes = async (newRecipes) => {
    console.log('saveRecipes called with:', newRecipes.length, 'recipes')
    try {
      const jsonString = JSON.stringify(newRecipes)
      await storage.set('recipes', jsonString)
      setRecipes(newRecipes)
      console.log('Recipes saved successfully')
    } catch (error) {
      console.error('Error saving recipes:', error)
      throw error
    }
  }

  const addRecipe = async (recipe) => {
    console.log('addRecipe called with:', recipe)
    
    const newRecipe = {
      ...recipe,
      id: Date.now(),
      createdAt: Date.now()
    }
    
    console.log('New recipe with ID:', newRecipe)
    
    const updatedRecipes = [...recipes, newRecipe]
    console.log('Total recipes after add:', updatedRecipes.length)
    
    await saveRecipes(updatedRecipes)
    
    return newRecipe
  }

  const updateRecipe = async (id, updatedRecipe) => {
    console.log('updateRecipe called:', id, updatedRecipe)
    const updatedRecipes = recipes.map(recipe => 
      recipe.id === id ? { ...recipe, ...updatedRecipe } : recipe
    )
    await saveRecipes(updatedRecipes)
  }

  const deleteRecipe = async (id) => {
    console.log('deleteRecipe called:', id)
    const updatedRecipes = recipes.filter(recipe => recipe.id !== id)
    await saveRecipes(updatedRecipes)
  }

  const getRecipeById = (id) => {
    return recipes.find(recipe => recipe.id === parseInt(id))
  }

  return {
    recipes,
    loading,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    getRecipeById,
    refreshRecipes: loadRecipes
  }
}