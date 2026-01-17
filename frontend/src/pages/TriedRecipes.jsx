import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecipes } from '../hooks/useRecipes'

export default function TriedRecipes() {
  const navigate = useNavigate()
  const { recipes, loading } = useRecipes()
  
  const [categories, setCategories] = useState([
    'All', 'Pasta', 'Indian', 'Mexican', 'Salads', 'Italian', 'Asian', 'Desserts', 'Seafood'
  ])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')

  const filteredRecipes = selectedCategory === 'All' 
    ? recipes 
    : recipes.filter(recipe => recipe.category === selectedCategory)

    if (loading) {
        return (
          <div className="min-h-screen bg-cream flex items-center justify-center">
            <p className="text-3xl font-fjalla text-darkbrown">Loading recipes...</p>
          </div>
        )
      }

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()])
      setSelectedCategory(newCategory.trim())
      setNewCategory('')
      setIsAddingCategory(false)
      setIsDropdownOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream p-8">
      {/* Header with title and custom dropdown */}
      <div className="flex justify-between items-center mb-8 max-w-6xl mx-auto">
        <h1 className="text-6xl font-gasoek text-blue uppercase">Your Recipes</h1>
        
        {/* Custom Dropdown */}
        <div className="relative">
          {/* Dropdown Button */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-darkbrown text-cream font-fjalla text-2xl px-8 py-4 pr-6 rounded-xl uppercase flex items-center gap-4 min-w-[280px] justify-between"
          >
            <span>{selectedCategory}</span>
            <span className="text-3xl">{isDropdownOpen ? '▲' : '▼'}</span>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full mt-2 w-full bg-blue rounded-xl overflow-hidden shadow-lg z-10 max-h-[400px] overflow-y-auto custom-scrollbar">
              {/* Category Options */}
              {categories.map((category) => (
                <div
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category)
                    setIsDropdownOpen(false)
                    setIsAddingCategory(false)
                  }}
                  className={`px-8 py-3 font-fjalla text-xl uppercase cursor-pointer transition-colors ${
                    selectedCategory === category 
                      ? 'bg-darkbrown text-cream' 
                      : 'text-cream hover:bg-darkbrown hover:bg-opacity-50'
                  }`}
                >
                  {category}
                </div>
              ))}

              {/* Add New Category Section */}
              {isAddingCategory ? (
                <div className="p-4 border-t-2 border-cream">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                    placeholder="New category..."
                    className="w-full px-4 py-2 rounded-lg font-fjalla text-lg bg-cream text-darkbrown outline-none uppercase"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleAddCategory}
                      className="flex-1 bg-orange text-cream font-fjalla py-2 rounded-lg hover:bg-blue uppercase transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingCategory(false)
                        setNewCategory('')
                      }}
                      className="flex-1 bg-cream text-darkbrown font-fjalla py-2 uppercase rounded-lg hover:bg-orange hover:text-cream transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingCategory(true)}
                  className="w-full px-8 py-3 font-fjalla text-xl uppercase text-cream hover:bg-orange hover:bg-opacity-50 transition-colors border-t-2 border-cream flex items-center justify-center gap-2"
                >
                  <span className="text-2xl">+</span> Add Category
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Recipe List */}
        <div className="max-w-6xl mx-auto space-y-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">

        {/* Add Recipe Card - only shows when no category is selected */}
        {selectedCategory == 'All' && (
            <div
            onClick={() => navigate('/add-recipe', { state: { category: selectedCategory } })}
            className="rounded-xl p-8 cursor-pointer hover:opacity-90 transition-all bg-orange border-4 border-dashed border-cream flex items-center justify-center min-h-[120px]"
            >
            <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-cream text-orange text-5xl font-bold flex items-center justify-center mx-auto mb-2">
                +
                </div>
                <h2 className="text-2xl font-fjalla text-cream uppercase">
                Add New Recipe
                </h2>
            </div>
            </div>
        )}

        {/* Add Recipe Card - only shows when a specific category is selected */}
        {selectedCategory !== 'All' && (
            <div
            onClick={() => navigate('/add-recipe', { state: { category: selectedCategory } })}
            className="rounded-xl p-8 cursor-pointer hover:opacity-90 transition-all bg-orange border-4 border-dashed border-cream flex items-center justify-center min-h-[120px]"
            >
            <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-cream text-orange text-5xl font-bold flex items-center justify-center mx-auto mb-2">
                +
                </div>
                <h2 className="text-2xl font-fjalla text-cream uppercase">
                Add New {selectedCategory} Recipe
                </h2>
            </div>
            </div>
        )}

        {/* Regular Recipe Cards */}
        {filteredRecipes.map((recipe, index) => (
            <div
            key={recipe.id}
            onClick={() => navigate(`/recipe/${recipe.id}`)}
            className={`rounded-xl p-8 cursor-pointer hover:opacity-90 transition-all ${
                index === -1 ? 'bg-orange border-4 border-blue' : 'bg-orange'
            }`}
            >
            <h2 className="text-3xl font-fjalla uppercase text-cream">
                {recipe.name}
            </h2>
            <p className="text-cream text-lg  opacity-80">
                {recipe.category}
            </p>
            </div>
        ))}

        {/* Show message if no recipes in category */}
        {filteredRecipes.length === 0 && selectedCategory !== 'All' && (
            <div className="text-center py-12">
            <p className="text-darkbrown text-2xl font-fjalla uppercase">
                No recipes in this category yet. Click the + button above to add one!
            </p>
            </div>
        )}
        </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/next', { state: { direction: 'back' } })}
        className="mt-8 bg-darkbrown text-cream font-fjalla text-2xl px-8 py-4 rounded-xl hover:bg-blue transition-colors uppercase"
      >
        Back
      </button>
    </div>
  )
}