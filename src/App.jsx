import { Routes, Route } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import LandingPage from './pages/LandingPage.jsx'
import Home from './pages/Home.jsx'
import TriedRecipes from './pages/TriedRecipes.jsx'
import RecipeDetailPage from './pages/RecipeDetailPage'
import AddRecipePage from './pages/AddRecipePage'
import RecommendRecipePage from './pages/RecommendRecipePage'
import PageTransition from './components/PageTransition.jsx'
import PreferencesPage from './pages/PreferencesPage.jsx'
import FoodWeekView from './pages/FoodWeekView'
import DayPlanner from './pages/DayPlanner'

export default function App() {
  const location = useLocation()
  
  // Get direction from navigation state, default to 'forward'
  const direction = location.state?.direction || 'forward'

  return (
    <div style={{ backgroundColor: '#FFF6EB', minHeight: '100vh' }}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <PageTransition direction={direction}>
              <LandingPage />
            </PageTransition>
          } />
          <Route path="/next" element={
            <PageTransition direction={direction}>
              <Home />
            </PageTransition>
          } />
          <Route path="/nextToTriedRecipes" element={
            <PageTransition direction={direction}>
              <TriedRecipes />
            </PageTransition>
          } />
          <Route path="/recipe/:id" element={
            <PageTransition direction={direction}>
              <RecipeDetailPage />
            </PageTransition>
          } />
          <Route path="/add-recipe" element={
            <PageTransition direction={direction}>
              <AddRecipePage />
            </PageTransition>
          } />
          <Route path="/recommend-recipe" element={
            <PageTransition direction={direction}>
              <RecommendRecipePage />
            </PageTransition>
          } />
          <Route path="/preferences" element={
            <PageTransition direction={direction}>
              <PreferencesPage />
            </PageTransition>
          } />
          <Route path="/food-week" element={
            <PageTransition direction={direction}>
              <FoodWeekView />
            </PageTransition>
          } />
          <Route path="/food-week/day" element={
            <PageTransition direction={direction}>
              <DayPlanner />
            </PageTransition>
          } />
          
        </Routes>
      </AnimatePresence>
    </div>
  )
}