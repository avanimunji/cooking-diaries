import { useNavigate } from 'react-router-dom'
import truentried from '../assets/illustrations/truentried.svg'
import addrec from '../assets/illustrations/addrec.svg'
import groclist from '../assets/illustrations/groclist.svg'

export default function Home() {
  const navigate = useNavigate()

  const daysOfWeek = ['M', 'T', 'W', 'TH', 'F', 'SA', 'SU']

  return (
    <div className="min-h-screen bg-cream p-8">
      {/* Header */}
      <h1 className="text-6xl font-gasoek text-blue mb-8">HOME</h1>

      {/* Main Grid Container */}
      <div className="grid grid-cols-2 gap-6 max-w-9xl">
        
        {/* Top Left - Your Tried and True Recipes */}
        <div 
          onClick={() => navigate('/nextToTriedRecipes')}
          className="bg-orange rounded-xl p-8 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
        >
            {/* Illustration - bottom left */}
            <img 
                src={truentried}
                alt="" 
                className="absolute bottom-86 left-16 w-60 h-60 object-contain"
            />

          <div className="text-center relative z-10">
            <h2 className="text-4xl font-fjalla text-cream uppercase">
              Your Tried and<br />True Recipes
            </h2>
          </div>
        </div>

        {/* Top Right - Food for the Week */}
        <div 
          onClick={() => navigate('/food-week')}
          className="bg-cream rounded-xl border-6 border-orange overflow-hidden h-64 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="bg-orange p-8">
            <h2 className="text-4xl font-fjalla text-cream text-center uppercase">
              Food for the Week
            </h2>
          </div>
          
          {/* Calendar Grid */}
          <div className="bg-darkbrown text-cream">
            <div className="grid grid-cols-7 text-center font-fjalla text-2xl">
              {daysOfWeek.map((day, index) => (
                <div key={index} className="p-2 border-r-3 border-cream last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
          </div>
          
          {/* Meal slots */}
          <div className="grid grid-cols-7 min-h-[120px]">
            {daysOfWeek.map((_, index) => (
              <div 
                key={index} 
                className="border-r-3 border-darkbrown last:border-r-0 p-4 hover:bg-blue hover:bg-opacity-10 cursor-pointer transition-colors"
                onClick={() => console.log(`Clicked day ${index + 1}`)}
              >

                {/* Meal content will go here */}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Left - Recommend a Recipe */}
        <div 
          onClick={() => navigate('/recommend-recipe')}
          className="bg-orange rounded-xl p-8 h-64 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
        >
            {/* Illustration - bottom left */}
            <img 
                src={addrec} 
                alt="" 
                className="absolute bottom-20 right-190 w-63 h-41 object-contain"
            />

          <div className="text-center relative z-10">
            <h2 className="text-4xl font-fjalla text-cream uppercase">
              Recommend a Recipe
            </h2>
          </div>
        </div>

        {/* Bottom Right - Grocery List */}
        <div 
          onClick={(e) => {
            e.stopPropagation()
            console.log('Grocery list clicked!')
            navigate('/grocery-list')
          }}
          className="bg-orange rounded-xl p-8 h-64 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
        >
            {/* Illustration - bottom left */}
            <img 
                src={groclist} 
                alt="" 
                className="absolute bottom-5 left-228 w-90 h-50 object-contain"
            />

          <div className="text-center relative z-10">
            <h2 className="text-4xl font-fjalla text-cream uppercase">
              Grocery List
            </h2>
          </div>
        </div>

      </div>
    </div>
  )
}