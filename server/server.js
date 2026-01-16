// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Function to check if recipe violates dietary restrictions
function checkDietaryViolations(recipe, preferences) {
  const violations = [];
  
  // Combine all ingredients and instructions into searchable text
  const recipeText = [
    recipe.name,
    ...recipe.ingredients,
    ...recipe.instructions
  ].join(' ').toLowerCase();
  
  // Define forbidden ingredients for each restriction
  const forbiddenIngredients = {
    vegetarian: ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'meat', 'bacon', 'sausage', 
                 'fish', 'salmon', 'tuna', 'shrimp', 'prawn', 'crab', 'lobster', 'seafood', 'anchovy'],
    vegan: ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'meat', 'bacon', 'sausage',
            'fish', 'salmon', 'tuna', 'shrimp', 'prawn', 'crab', 'lobster', 'seafood',
            'egg', 'milk', 'cheese', 'butter', 'cream', 'yogurt', 'dairy', 'honey'],
    pescatarian: ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'meat', 'bacon', 'sausage'],
    'gluten-free': ['wheat', 'flour', 'bread', 'pasta', 'barley', 'rye', 'couscous', 'seitan'],
    'dairy-free': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'dairy', 'whey', 'casein'],
    halal: ['pork', 'bacon', 'ham', 'alcohol', 'wine', 'beer'],
    kosher: ['pork', 'bacon', 'ham', 'shellfish', 'shrimp', 'crab', 'lobster']
  };
  
  // Check dietary restrictions
  if (preferences.dietaryRestrictions?.length > 0) {
    preferences.dietaryRestrictions.forEach(restriction => {
      const forbidden = forbiddenIngredients[restriction.toLowerCase()] || [];
      forbidden.forEach(ingredient => {
        if (recipeText.includes(ingredient)) {
          violations.push(`Contains ${ingredient} (violates ${restriction})`);
        }
      });
    });
  }
  
  // Check allergies
  if (preferences.allergies?.length > 0) {
    preferences.allergies.forEach(allergy => {
      if (recipeText.includes(allergy.toLowerCase())) {
        violations.push(`Contains ${allergy} (allergy)`);
      }
    });
  }
  
  // Check ingredients to avoid
  if (preferences.avoidIngredients?.length > 0) {
    preferences.avoidIngredients.forEach(ingredient => {
      if (recipeText.includes(ingredient.toLowerCase())) {
        violations.push(`Contains ${ingredient} (user preference)`);
      }
    });
  }
  
  return {
    hasViolation: violations.length > 0,
    violations
  };
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Recipe recommendation endpoint
app.post('/api/recommend-recipe', async (req, res) => {
  try {
    const { recipes, preferences } = req.body;

    const recipesList = recipes.map(r => 
      `- ${r.name} (${r.category})`
    ).join('\n');



    // Build explicit constraints for the prompt
    let constraintText = '';
    let dietaryConstraints = [];
    
    if (preferences) {
      if (preferences.dietaryRestrictions?.length > 0) {
        preferences.dietaryRestrictions.forEach(restriction => {
          switch(restriction.toLowerCase()) {
            case 'vegetarian':
              dietaryConstraints.push('NO MEAT (beef, pork, chicken, lamb, etc.)');
              dietaryConstraints.push('NO FISH or SEAFOOD');
              break;
            case 'vegan':
              dietaryConstraints.push('NO ANIMAL PRODUCTS (meat, fish, eggs, dairy, honey)');
              break;
            case 'pescatarian':
              dietaryConstraints.push('NO MEAT (beef, pork, chicken, lamb, etc.)');
              dietaryConstraints.push('Fish and seafood are OK');
              break;
            case 'gluten-free':
              dietaryConstraints.push('NO WHEAT, BARLEY, RYE, or regular pasta/bread');
              break;
            case 'dairy-free':
              dietaryConstraints.push('NO MILK, CHEESE, BUTTER, CREAM, YOGURT');
              break;
            case 'keto':
              dietaryConstraints.push('LOW CARB - no bread, pasta, rice, potatoes, sugar');
              break;
            case 'paleo':
              dietaryConstraints.push('NO GRAINS, LEGUMES, DAIRY, or PROCESSED FOODS');
              break;
            case 'halal':
              dietaryConstraints.push('NO PORK or ALCOHOL');
              dietaryConstraints.push('Meat must be halal');
              break;
            case 'kosher':
              dietaryConstraints.push('NO PORK or SHELLFISH');
              dietaryConstraints.push('No mixing meat and dairy');
              break;
            default:
              dietaryConstraints.push(`Must follow ${restriction} diet`);
          }
        });
      }
      
      if (preferences.allergies?.length > 0) {
        preferences.allergies.forEach(allergy => {
          dietaryConstraints.push(`ABSOLUTELY NO ${allergy.toUpperCase()} - SEVERE ALLERGY`);
        });
      }
      
      if (preferences.avoidIngredients?.length > 0) {
        preferences.avoidIngredients.forEach(ingredient => {
          dietaryConstraints.push(`Do not use ${ingredient}`);
        });
      }
      
      if (dietaryConstraints.length > 0) {
        constraintText = '\n\n🚨 CRITICAL DIETARY CONSTRAINTS - MUST FOLLOW EXACTLY:\n' + 
          dietaryConstraints.map((c, i) => `${i + 1}. ${c}`).join('\n');
      }
    }

    const prompt = `You are a recipe suggestion system. You MUST follow these rules:

${constraintText}

${constraintText ? `
VERIFICATION STEP - Before suggesting ANY recipe, check:
${dietaryConstraints.map((c, i) => `${i + 1}. ${c} - Does your recipe violate this? If YES, choose a different recipe.`).join('\n')}

If the recipe you're thinking of contains ANY forbidden ingredients, STOP and think of a completely different recipe.
` : ''}

Context (the user's dietary needs may have changed - these are just for understanding their taste preferences):
${recipesList || '- No recipes yet'}

Additional preferences:
${preferences?.cuisinePreferences?.length > 0 ? `- Cuisines they enjoy: ${preferences.cuisinePreferences.join(', ')}` : ''}
${preferences?.skillLevel ? `- Skill level: ${preferences.skillLevel}` : ''}
${preferences?.spiceLevel ? `- Spice preference: ${preferences.spiceLevel}` : ''}

Generate ONE recipe that:
1. ABSOLUTELY follows all dietary constraints above (this is most important)
2. Would appeal to their taste based on the context
3. Is different from what they already have

For the category field, use ONE of these standard categories if possible:
Italian, Mexican, Chinese, Japanese, Indian, Thai, Mediterranean, American, French, Korean, Vietnamese, Middle Eastern, Greek, Spanish, Asian, Breakfast, Dessert, Appetizer, Salad, Soup, Pasta, Noodles, Pizza, Seafood

IMPORTANT NOTES:
- Use "Pasta" for Italian pasta dishes (spaghetti, penne, etc.)
- Use "Noodles" for Asian noodle dishes (ramen, pho, pad thai, lo mein, etc.)
- Use specific cuisines (Chinese, Japanese, Thai, etc.) rather than generic "Asian" when possible
- Only use a different category if the recipe truly doesn't fit any of the above (e.g., Ethiopian, Caribbean, Moroccan, etc.)

Return ONLY valid JSON (no markdown, no backticks):
{
  "name": "Recipe Name",
  "reasoning": "Why you'd like this, focusing on the flavors",
  "category": "One of the standard categories listed above",
  "servings": "Number",
  "prepTime": "X mins",
  "cookTime": "X mins",
  "ingredients": ["item 1", "item 2"],
  "instructions": ["step 1", "step 2", but don't number them]
}`;

    // Use Gemini Pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Clean up the response and parse JSON
    const cleanText = responseText.replace(/```json\n?|\n?```/g, '').trim();
    const parsedSuggestion = JSON.parse(cleanText);

    // VALIDATION: Check if recipe violates dietary constraints
    if (preferences) {
      const violationCheck = checkDietaryViolations(parsedSuggestion, preferences);
      if (violationCheck.hasViolation) {
        console.error('Recipe violated dietary constraints:', violationCheck.violations);
        // Return error to user instead of bad recipe
        return res.status(400).json({ 
          success: false, 
          error: `Recipe suggestion violated your dietary restrictions: ${violationCheck.violations.join(', ')}. Please try again.`
        });
      }
    }

    res.json({ success: true, suggestion: parsedSuggestion });

  } catch (error) {
    console.error('Error getting recipe suggestion:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get recipe suggestion' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});