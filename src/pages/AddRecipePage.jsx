import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useRecipes } from '../hooks/useRecipes'

export default function AddRecipePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addRecipe } = useRecipes()
  
  // Pre-fill category if passed from recipes page
  const prefilledCategory = location.state?.category || ''

  const [formData, setFormData] = useState({
    name: '',
    category: prefilledCategory,
    servings: '',
    prepTime: '',
    cookTime: '',
    ingredients: [''],
    instructions: ['']
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index] = value
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }))
  }

  const addIngredientField = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }))
  }

  const removeIngredientField = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        ingredients: newIngredients
      }))
    }
  }

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions]
    newInstructions[index] = value
    setFormData(prev => ({
      ...prev,
      instructions: newInstructions
    }))
  }

  const addInstructionField = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }))
  }

  const removeInstructionField = (index) => {
    if (formData.instructions.length > 1) {
      const newInstructions = formData.instructions.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        instructions: newInstructions
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    //debug
    console.log('Form submitted!')
    console.log('Form data:', formData)
    
    // Validation
    if (!formData.name.trim()) {
      alert('Please enter a recipe name')
      return
    }
    if (!formData.category.trim()) {
      alert('Please enter a category')
      return
    }
    
    // Filter out empty ingredients and instructions
    const cleanedData = {
      ...formData,
      ingredients: formData.ingredients.filter(ing => ing.trim() !== ''),
      instructions: formData.instructions.filter(inst => inst.trim() !== '')
    }

    console.log('Cleaned data:', cleanedData)
    
    if (cleanedData.ingredients.length === 0) {
      alert('Please add at least one ingredient')
      return
    }
    if (cleanedData.instructions.length === 0) {
      alert('Please add at least one instruction')
      return
    }

     console.log('About to save recipe...')

     try {
        const newRecipe = await addRecipe(cleanedData)
        console.log('Recipe saved successfully:', newRecipe)
        
        // Navigate back to recipes page
        navigate('/nextToTriedRecipes')
      } catch (error) {
        console.error('Error saving recipe:', error)
        alert('Failed to save recipe. Check console for details.')
      }
  }

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-6xl font-gasoek text-blue mb-2 uppercase">Add New Recipe</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="bg-cream border-4 border-orange rounded-xl p-8 mb-6">
            <h2 className="text-4xl font-fjalla text-blue mb-6 uppercase">Basic Info</h2>
            
            {/* Recipe Name */}
            <div className="mb-4">
              <label className="block font-fjalla text-xl text-darkbrown mb-2 uppercase">
                Recipe Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Spaghetti Carbonara"
                className="w-full px-4 py-3 rounded-xl border-2 border-orange text-darkbrown text-lg outline-none focus:border-blue transition-colors"
                required
              />
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block font-fjalla text-xl text-darkbrown mb-2 uppercase">
                Category *
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="e.g., Pasta, Indian, Mexican"
                className="w-full px-4 py-3 rounded-xl border-2 border-orange text-darkbrown text-lg outline-none focus:border-blue transition-colors"
                required
              />
            </div>

            {/* Recipe Info Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-fjalla text-xl text-darkbrown mb-2 uppercase">
                  Servings
                </label>
                <input
                  type="text"
                  name="servings"
                  value={formData.servings}
                  onChange={handleInputChange}
                  placeholder="4"
                  className="w-full px-4 py-3 rounded-xl border-2 border-orange text-darkbrown text-lg outline-none focus:border-blue transition-colors"
                />
              </div>
              <div>
                <label className="block font-fjalla text-xl text-darkbrown mb-2 uppercase">
                  Prep Time
                </label>
                <input
                  type="text"
                  name="prepTime"
                  value={formData.prepTime}
                  onChange={handleInputChange}
                  placeholder="15 mins"
                  className="w-full px-4 py-3 rounded-xl border-2 border-orange text-darkbrown text-lg outline-none focus:border-blue transition-colors"
                />
              </div>
              <div>
                <label className="block font-fjalla text-xl text-darkbrown mb-2 uppercase">
                  Cook Time
                </label>
                <input
                  type="text"
                  name="cookTime"
                  value={formData.cookTime}
                  onChange={handleInputChange}
                  placeholder="20 mins"
                  className="w-full px-4 py-3 rounded-xl border-2 border-orange text-darkbrown text-lg outline-none focus:border-blue transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-cream border-4 border-orange rounded-xl p-8 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-4xl font-fjalla text-blue uppercase">Ingredients</h2>
              <button
                type="button"
                onClick={addIngredientField}
                className="bg-orange text-cream font-fjalla text-xl px-6 py-2 rounded-xl hover:bg-blue transition-colors"
              >
                Add +
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    placeholder="e.g., 400g spaghetti"
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-orange text-darkbrown text-lg outline-none focus:border-blue transition-colors"
                  />
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredientField(index)}
                      className="bg-cream border-2 border-darkbrown text-darkbrown font-fjalla text-xl px-4 rounded-xl hover:bg-darkbrown hover:text-cream transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-cream border-4 border-orange rounded-xl p-8 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-4xl font-fjalla text-blue uppercase">Instructions</h2>
              <button
                type="button"
                onClick={addInstructionField}
                className="bg-orange text-cream font-fjalla text-xl px-6 py-2 rounded-xl hover:bg-blue transition-colors"
              >
                Add +
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className="font-fjalla text-orange text-2xl mt-2 min-w-[40px]">
                    {index + 1}.
                  </span>
                  <textarea
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    placeholder="Describe this step..."
                    rows="2"
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-orange text-darkbrown text-lg outline-none focus:border-blue transition-colors resize-none"
                  />
                  {formData.instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstructionField(index)}
                      className="bg-cream border-2 border-darkbrown text-darkbrown font-fjalla text-xl px-4 py-3 rounded-xl hover:bg-darkbrown hover:text-cream transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/nextToTriedRecipes', { state: { direction: 'back' } })}
              className="bg-cream text-darkbrown border-4 border-darkbrown font-fjalla text-2xl px-8 py-4 rounded-xl hover:bg-darkbrown hover:text-cream transition-colors uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-orange text-cream font-fjalla text-2xl px-8 py-4 rounded-xl hover:bg-blue transition-colors uppercase flex-1"
            >
              Save Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}