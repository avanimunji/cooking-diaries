// utils/categoryNormalizer.js

// Your standard category set
const STANDARD_CATEGORIES = [
    'Italian',
    'Mexican',
    'Chinese',
    'Japanese',
    'Indian',
    'Thai',
    'Mediterranean',
    'American',
    'French',
    'Korean',
    'Vietnamese',
    'Middle Eastern',
    'Greek',
    'Spanish',
    'Asian', // Keep as separate category for pan-Asian dishes
    'Breakfast',
    'Dessert',
    'Appetizer',
    'Salad',
    'Soup',
    'Pasta',
    'Noodles', // Separate from pasta
    'Pizza',
    'Burger',
    'Sandwich',
    'BBQ',
    'Vegetarian',
    'Vegan',
    'Seafood'
  ];
  
  // Mapping of common variations to standard categories
  const CATEGORY_MAPPINGS = {
    // Cuisine variations - only map when clearly the same
    'tex-mex': 'Mexican',
    'latin': 'Mexican',
    'latin american': 'Mexican',
    'middle-eastern': 'Middle Eastern',
    'mideast': 'Middle Eastern',
    
    // Meal type variations - be more specific
    'main course': null, // Don't auto-map, let it fall through to Other or cuisine-based
    'main dish': null,
    'entree': null,
    'entrée': null,
    'dinner': null,
    'lunch': null,
    'brunch': 'Breakfast',
    'side dish': 'Appetizer',
    'side': 'Appetizer',
    
    // Food type variations - only when very specific
    'spaghetti': 'Pasta',
    'linguine': 'Pasta',
    'fettuccine': 'Pasta',
    'penne': 'Pasta',
    'ravioli': 'Pasta',
    'lasagna': 'Pasta',
    
    // Asian noodles - keep as Noodles, not Pasta
    'ramen': 'Japanese',
    'udon': 'Japanese',
    'soba': 'Japanese',
    'pho': 'Vietnamese',
    'pad thai': 'Thai',
    'lo mein': 'Chinese',
    'chow mein': 'Chinese',
    'rice noodles': 'Noodles',
    'egg noodles': 'Noodles',
    
    // Specific dishes to cuisine
    'stir fry': 'Chinese',
    'stir-fry': 'Chinese',
    'curry': 'Indian',
    'taco': 'Mexican',
    'burrito': 'Mexican',
    'enchilada': 'Mexican',
    'quesadilla': 'Mexican',
    'sushi': 'Japanese',
    'tempura': 'Japanese',
    'teriyaki': 'Japanese',
    'bibimbap': 'Korean',
    'bulgogi': 'Korean',
    'kimchi': 'Korean',
    'kebab': 'Middle Eastern',
    'shawarma': 'Middle Eastern',
    'falafel': 'Middle Eastern',
    'hummus': 'Middle Eastern',
    'gyro': 'Greek',
    'souvlaki': 'Greek',
    'paella': 'Spanish',
    'tapas': 'Spanish',
    'crepe': 'French',
    'croissant': 'French',
    'quiche': 'French',
    'coq au vin': 'French',
    'ratatouille': 'French',
    'risotto': 'Italian',
    'carbonara': 'Italian',
    'bruschetta': 'Italian',
    'tiramisu': 'Italian',
    
    // Only map protein when it's super generic
    // 'chicken': null, // Don't auto-map
    // 'beef': null,
    // 'pork': null,
    
    // Seafood is clear
    'fish': 'Seafood',
    'shrimp': 'Seafood',
    'shellfish': 'Seafood',
    'crab': 'Seafood',
    'lobster': 'Seafood',
    'salmon': 'Seafood',
    
    // Diet-based
    'plant-based': 'Vegetarian',
    'meatless': 'Vegetarian',
    'dairy-free': 'Vegan',
    
    // Common case variations
    'italian': 'Italian',
    'mexican': 'Mexican',
    'american': 'American',
    'french': 'French',
    'chinese': 'Chinese',
    'japanese': 'Japanese',
    'indian': 'Indian',
    'thai': 'Thai',
    'korean': 'Korean',
    'vietnamese': 'Vietnamese',
    'greek': 'Greek',
    'spanish': 'Spanish'
  };
  
  /**
   * Normalizes a category string to match standard categories
   * @param {string} category - The AI-generated category
   * @param {string[]} existingCategories - Categories already in the user's collection
   * @returns {string} - Normalized category name
   */
  export function normalizeCategory(category, existingCategories = []) {
    if (!category) return 'Other';
    
    const normalized = category.trim();
    const lowerCategory = normalized.toLowerCase();
    
    // 1. Check if it's already a standard category (case-insensitive)
    const standardMatch = STANDARD_CATEGORIES.find(
      cat => cat.toLowerCase() === lowerCategory
    );
    if (standardMatch) return standardMatch;
    
    // 2. Check if it's in our mappings
    const mapping = CATEGORY_MAPPINGS[lowerCategory];
    if (mapping !== undefined) {
      // If mapping is null, it means we intentionally don't want to map it
      // Fall through to next checks
      if (mapping !== null) return mapping;
    }
    
    // 3. Check for specific dish keywords in the category string
    for (const [keyword, mappedCategory] of Object.entries(CATEGORY_MAPPINGS)) {
      if (mappedCategory && lowerCategory.includes(keyword)) {
        return mappedCategory;
      }
    }
    
    // 4. Check if the user already has this category (case-insensitive)
    const existingMatch = existingCategories.find(
      cat => cat.toLowerCase() === lowerCategory
    );
    if (existingMatch) return existingMatch;
    
    // 5. If it's a genuinely new cuisine/category, clean it up and return
    // Remove common suffixes that don't add meaning
    const cleanedCategory = normalized
      .replace(/\b(cuisine|dish|food|style|recipe)\b/gi, '')
      .trim();
    
    if (cleanedCategory) {
      // Capitalize properly
      return cleanedCategory
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    
    return 'Other';
  }
  
  /**
   * Get suggestions for the AI prompt to use standard categories
   */
  export function getCategorySuggestions() {
    return STANDARD_CATEGORIES.slice(0, 15).join(', ');
  }
  
  // Example usage:
  /*
  normalizeCategory('Main Course') // -> 'Other' (generic, let user categorize or AI be more specific)
  normalizeCategory('italian cuisine') // -> 'Italian'
  normalizeCategory('Stir Fry') // -> 'Chinese'
  normalizeCategory('pasta dish') // -> 'Pasta'
  normalizeCategory('Ramen') // -> 'Japanese'
  normalizeCategory('Noodles') // -> 'Noodles'
  normalizeCategory('Asian') // -> 'Asian'
  normalizeCategory('Lo Mein') // -> 'Chinese'
  normalizeCategory('Pho Bowl') // -> 'Vietnamese'
  normalizeCategory('Ethiopian') // -> 'Ethiopian' (new cuisine, preserved)
  normalizeCategory('Chicken Recipe') // -> 'Chicken Recipe' (cleaned up, no auto-mapping)
  */