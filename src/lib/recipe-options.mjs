// Keep one library card while giving each carb its own complete, linkable method.
export function recipeVersions(recipe) {
  const options = Array.isArray(recipe.recipeOptions) ? recipe.recipeOptions : [];
  if (!options.length) return [recipe];
  return options.map(option => ({
    ...recipe,
    slug: option.slug,
    canonicalSlug: recipe.slug,
    aliases: option.slug === recipe.slug ? (recipe.aliases || []) : [],
    selectedChoice: option.id,
    selectedChoiceLabel: option.label,
    servings: option.servings ?? recipe.servings,
    defaultServings: option.defaultServings ?? option.servings ?? recipe.servings,
    prepMinutes: option.prepMinutes ?? recipe.prepMinutes,
    cookMinutes: option.cookMinutes ?? recipe.cookMinutes,
    advancePrep: [recipe.advancePrep, option.advancePrep].filter(Boolean).join(' '),
    groups: [...(recipe.groups || []), ...(option.groups || [])],
    steps: [...(option.beforeSteps || []), ...(recipe.steps || []), ...(option.afterSteps || [])],
  }));
}
