import { useParams, useNavigate } from 'react-router-dom'
import { useRecipes } from '../hooks/useRecipes'

export default function RecipeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getRecipeById, deleteRecipe, loading } = useRecipes()
  
  const recipe = getRecipeById(id)

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      await deleteRecipe(parseInt(id))
      navigate('/nextToTriedRecipes')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream p-8 flex items-center justify-center">
        <p className="text-3xl font-fjalla text-darkbrown">Loading...</p>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-cream p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl font-fjalla text-darkbrown mb-4">Recipe not found</p>
          <button
            onClick={() => navigate('/nextToTriedRecipes', { state: { direction: 'back' } })}
            className="bg-orange text-cream font-fjalla text-xl px-6 py-3 rounded-xl hover:bg-blue transition-colors"
          >
            Back to Recipes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-6xl font-gasoek text-blue uppercase mb-2">{recipe.name}</h1>
          <p className="text-3xl font-fjalla text-orange uppercase">{recipe.category}</p>
        </div>

        {/* Recipe Info */}
        <div className="bg-orange rounded-xl p-6 mb-6 flex gap-8">
          <div className="text-cream">
            <p className="font-fjalla text-lg uppercase opacity-80">Servings</p>
            <p className="font-fjalla text-3xl">{recipe.servings}</p>
          </div>
          <div className="text-cream">
            <p className="font-fjalla text-lg uppercase opacity-80">Prep Time</p>
            <p className="font-fjalla text-3xl">{recipe.prepTime}</p>
          </div>
          <div className="text-cream">
            <p className="font-fjalla text-lg uppercase opacity-80">Cook Time</p>
            <p className="font-fjalla text-3xl">{recipe.cookTime}</p>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-cream border-6 border-orange rounded-xl p-8 mb-6">
          <h2 className="text-4xl font-fjalla text-blue mb-4 uppercase">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="text-xl text-darkbrown flex items-start">
                <span className="text-orange mr-2">●</span>
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="bg-cream border-6 border-orange rounded-xl p-8 mb-6">
          <h2 className="text-4xl font-fjalla text-blue mb-4 uppercase">Instructions</h2>
          <ol className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="text-xl text-darkbrown flex items-start">
                <span className="font-fjalla text-orange text-2xl mr-2 min-w-[30px]">
                  {index + 1}.
                </span>
                <span className="pt-1">{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/nextToTriedRecipes', { state: { direction: 'back' } })}
            className="bg-darkbrown text-cream font-fjalla text-2xl px-8 py-4 rounded-xl hover:bg-blue transition-colors uppercase"
          >
            Back to Recipes
          </button>
          <button
            onClick={() => navigate(`/edit-recipe/${id}`)}
            className="bg-orange text-cream font-fjalla text-2xl px-8 py-4 rounded-xl hover:bg-blue transition-colors uppercase"
          >
            Edit Recipe
          </button>
          <button
            onClick={handleDelete}
            className="bg-cream text-darkbrown border-4 border-darkbrown font-fjalla text-2xl px-8 py-4 rounded-xl hover:bg-darkbrown hover:text-cream transition-colors uppercase"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}