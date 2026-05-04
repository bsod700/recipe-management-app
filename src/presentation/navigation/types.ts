export type RootStackParamList = {
  Home: { category?: string } | undefined;
  SearchRecipes: { category?: string; search?: string } | undefined;
  RecipeDetail: { id: string };
  RecipeEdit: { id?: string };
};
