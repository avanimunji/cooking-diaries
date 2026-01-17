import { useNavigate } from 'react-router-dom'
import landingpan from '../assets/illustrations/landingpan.svg'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center">

      <img 
        src={landingpan} 
        alt="landingpan" 
        className="w-139 h-80 object-cover rounded-xl mb-10"
      />

      <h1 className="text-6xl font-gasoek text-blue mb-4">
        COOKING DIARIES
      </h1>

      <h1 className="text-2xl font-fjalla text-darkbrown mb-20">
        KEEP TRACK OF RECIPES YOU KNOW AND LOVE.
      </h1>


      <button 
        onClick={() => navigate('/next')}
        className="px-8 py-3 bg-orange text-cream font-fjalla rounded-xl text-2xl hover:bg-darkbrown transition-colors"
      >
        GET STARTED
      </button>
    </div>
  )
}