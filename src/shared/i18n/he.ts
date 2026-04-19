/**
 * Single source of truth for all UI strings.
 * Hebrew only — app is personal-use, one locale.
 */

import type { IngredientUnit } from '@domain/entities/Recipe';

export const strings = {
  app: {
    name: 'מתכונים',
  },
  screens: {
    list: {
      title: 'המתכונים שלי',
      searchPlaceholder: 'חיפוש מתכון...',
      empty: 'עדיין אין מתכונים. הוסף את הראשון!',
      emptySearch: 'לא נמצאו מתכונים תואמים.',
      addButton: 'הוסף מתכון',
      swipeDelete: 'מחק',
      confirmDelete: {
        title: 'מחיקת מתכון',
        message: 'למחוק את המתכון הזה?',
        confirm: 'מחק',
        cancel: 'ביטול',
      },
    },
    edit: {
      titleNew: 'מתכון חדש',
      titleEdit: 'עריכת מתכון',
      fields: {
        title: 'שם המתכון',
        titlePlaceholder: 'לדוגמה: שקשוקה',
        ingredients: 'מרכיבים',
        ingredientName: 'שם',
        ingredientAmount: 'כמות',
        ingredientUnit: 'יחידה',
        instructions: 'הוראות הכנה',
        instructionsPlaceholder: 'תאר את שלבי ההכנה...',
        photo: 'תמונה (אופציונלי)',
      },
      actions: {
        addIngredient: 'הוסף מרכיב',
        removeIngredient: 'הסר',
        addStep: 'הוסף שלב',
        removeStep: 'הסר שלב',
        pickPhoto: 'בחר תמונה',
        removePhoto: 'הסר תמונה',
        save: 'שמור',
        cancel: 'ביטול',
        delete: 'מחק מתכון',
      },
      confirmDelete: {
        title: 'מחיקת מתכון',
        message: 'האם למחוק את המתכון לצמיתות?',
        confirm: 'מחק',
        cancel: 'ביטול',
      },
      confirmDiscard: {
        title: 'שינויים לא נשמרו',
        message: 'האם לצאת בלי לשמור?',
        confirm: 'צא',
        cancel: 'הישאר',
      },
    },
    detail: {
      ingredientsHeading: 'מרכיבים',
      instructionsHeading: 'הוראות הכנה',
      edit: 'עריכה',
    },
  },
  units: {
    grams: 'גרם',
    ml: 'מ"ל',
    cups: 'כוסות',
    spoons: 'כפות',
    teaspoons: 'כפיות',
    units: 'יחידות',
  } satisfies Record<IngredientUnit, string>,
  errors: {
    titleRequired: 'יש להזין שם למתכון.',
    ingredientNameRequired: 'שם המרכיב חובה.',
    amountInvalid: 'כמות לא תקינה.',
    unitRequired: 'יש לבחור יחידת מידה.',
    atLeastOneIngredient: 'יש להוסיף לפחות מרכיב אחד.',
    instructionsRequired: 'יש להזין הוראות הכנה.',
    tooLong: 'הטקסט ארוך מדי.',
    loadFailed: 'טעינת המתכונים נכשלה.',
    saveFailed: 'שמירת המתכון נכשלה.',
    deleteFailed: 'מחיקת המתכון נכשלה.',
    imagePickerDenied: 'אין הרשאה לגשת לגלריה.',
  },
  a11y: {
    searchField: 'שדה חיפוש מתכונים',
    clearSearch: 'נקה חיפוש',
    addRecipeButton: 'כפתור הוספת מתכון חדש',
    recipeCard: 'כרטיס מתכון',
    swipeDeleteRecipe: 'מחיקת מתכון בהחלקה',
    removeIngredientRow: 'הסר שורת מרכיב',
    recipeImage: 'תמונת המתכון',
  },
} as const;
