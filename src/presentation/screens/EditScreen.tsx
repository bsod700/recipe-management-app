import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Plus, Sparkles } from 'lucide-react-native';
import { BackHandler, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@presentation/navigation/types';
import { recipeFormSchema, type RecipeFormValues } from '@domain/schemas/recipeSchema';
import { useRecipe } from '@application/hooks/useRecipe';
import { useRecipeMutations } from '@application/hooks/useRecipeMutations';
import { useCategories } from '@application/hooks/useCategories';
import { TextField } from '@presentation/components/TextField';
import { Button } from '@presentation/components/Button';
import { PhotoPicker } from '@presentation/components/PhotoPicker';
import { UnitPicker } from '@presentation/components/UnitPicker';
import { TimeInput } from '@presentation/components/TimeInput';
import { CategoryPicker } from '@presentation/components/CategoryPicker';
import { ExitConfirmAlertOverlay } from '@presentation/components/ExitConfirmAlertOverlay';
import { Pressable } from '@/components/ui/pressable';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { strings } from '@shared/i18n/he';
import { theme } from '@shared/theme/theme';
import { DEFAULT_UNIT } from '@shared/constants/units';
import { formatStepNumber, parseInstructionSteps, serializeInstructionSteps } from '@shared/utils/instructions';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeEdit'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'RecipeEdit'>;

const emptyIngredient = { name: '', amount: NaN, unit: DEFAULT_UNIT } as const;

function parseWholeNumber(text: string): number {
  const normalized = text.replace(/[^0-9]/g, '');
  return normalized === '' ? NaN : Number(normalized);
}

export function EditScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props['route']>();
  const id = route.params?.id;
  const isEdit = Boolean(id);
  const { recipe, loading } = useRecipe(id);
  const { create, update, saving } = useRecipeMutations();
  const { categories } = useCategories();
  const [isDiscardOverlayOpen, setDiscardOverlayOpen] = useState(false);

  const defaultValues = useMemo<RecipeFormValues>(
    () => ({
      title: '',
      category: '',
      link: '',
      prepTimeMinutes: NaN,
      cookTimeMinutes: NaN,
      servings: NaN,
      ingredients: [{ ...emptyIngredient }],
      instructions: [{ text: '' }],
      imageUri: undefined,
    }),
    []
  );

  const { control, handleSubmit, reset, formState, watch, setValue } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const ingredientFields = useFieldArray({ control, name: 'ingredients' });
  const instructionFields = useFieldArray({ control, name: 'instructions' });

  useEffect(() => {
    if (!isEdit || !recipe) return;
    reset({
      title: recipe.title,
      category: recipe.category ?? '',
      link: recipe.link ?? '',
      prepTimeMinutes: recipe.prepTimeMinutes,
      cookTimeMinutes: recipe.cookTimeMinutes,
      servings: recipe.servings,
      ingredients: recipe.ingredients.map((item) => ({
        name: item.name,
        amount: item.amount,
        unit: item.unit,
      })),
      instructions: parseInstructionSteps(recipe.instructions).map((text) => ({ text })),
      imageUri: recipe.imageUri,
    });
  }, [isEdit, recipe, reset]);

  const goBack = useCallback(() => {
    if (formState.isDirty) {
      setDiscardOverlayOpen(true);
      return;
    }
    navigation.goBack();
  }, [formState.isDirty, navigation]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goBack();
      return true;
    });
    return () => sub.remove();
  }, [goBack]);

  const onSave = useCallback(
    async (values: RecipeFormValues) => {
      const draft = {
        title: values.title.trim(),
        category: values.category?.trim() || undefined,
        link: values.link?.trim() || undefined,
        prepTimeMinutes: values.prepTimeMinutes,
        cookTimeMinutes: values.cookTimeMinutes,
        servings: values.servings,
        ingredients: values.ingredients,
        instructions: serializeInstructionSteps(values.instructions.map((step) => step.text)),
        ...(values.imageUri ? { imageUri: values.imageUri } : {}),
      };
      if (isEdit && id) {
        await update(id, draft);
      } else {
        await create(draft);
      }
      reset(values);
      navigation.popToTop();
    },
    [create, id, isEdit, navigation, reset, update]
  );

  if (isEdit && loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg }}>
        <Text style={{ color: theme.colors.text }}>טוען...</Text>
      </View>
    );
  }

  const imageUri = watch('imageUri');
  const categoryValue = watch('category');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'android' ? undefined : 'padding'}
        style={{ flex: 1, backgroundColor: theme.colors.bg }}
      >
        <ScrollView
          style={{ backgroundColor: theme.colors.bg }}
          contentContainerStyle={{ paddingTop: 48, paddingHorizontal: 16, paddingBottom: 144, gap: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Pressable
              style={{
                width: 48,
                height: 48,
                borderRadius: 50,
                backgroundColor: theme.colors.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon as={Sparkles} size="md" style={{ color: '#FEFDFB' }} />
            </Pressable>
            <Text style={{ color: theme.colors.text, fontSize: 29, fontWeight: '700' }}>
              {isEdit ? strings.screens.edit.titleEdit : strings.screens.edit.titleNew}
            </Text>
            <Pressable
              onPress={goBack}
              style={{
                width: 48,
                height: 48,
                borderRadius: 50,
                backgroundColor: theme.colors.menu,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon as={ArrowRight} size="md" style={{ color: '#FEFDFB' }} />
            </Pressable>
          </View>

          {/* Recipe title */}
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }) => (
              <TextField
                label={strings.screens.edit.fields.title}
                placeholder="שם המתכון"
                value={field.value ?? ''}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />

          {/* Photo */}
          <PhotoPicker
            uri={typeof imageUri === 'string' ? imageUri : undefined}
            onChange={(uri) => setValue('imageUri', uri, { shouldDirty: true })}
          />

          {/* Prep time */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600' }}>
              {strings.screens.edit.fields.prepTime}
            </Text>
            <Controller
              control={control}
              name="prepTimeMinutes"
              render={({ field, fieldState }) => (
                <TimeInput
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          </View>

          {/* Cook time */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600' }}>
              {strings.screens.edit.fields.cookTime}
            </Text>
            <Controller
              control={control}
              name="cookTimeMinutes"
              render={({ field, fieldState }) => (
                <TimeInput
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          </View>

          {/* Servings */}
          <Controller
            control={control}
            name="servings"
            render={({ field, fieldState }) => (
              <TextField
                label={strings.screens.edit.fields.servings}
                placeholder="00"
                value={Number.isNaN(field.value) ? '' : String(field.value)}
                onChangeText={(text) => field.onChange(parseWholeNumber(text))}
                onBlur={field.onBlur}
                keyboardType="number-pad"
                error={fieldState.error?.message}
              />
            )}
          />

          {/* Ingredients */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600' }}>
              {strings.screens.edit.fields.ingredients}
            </Text>
            {ingredientFields.fields.map((item, index) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: theme.colors.surfaceAlt,
                  borderRadius: 16,
                  padding: 8,
                  gap: 8,
                }}
              >
                <Controller
                  control={control}
                  name={`ingredients.${index}.name`}
                  render={({ field, fieldState }) => (
                    <TextField
                      placeholder="שם הרכיב"
                      value={field.value ?? ''}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      error={fieldState.error?.message}
                    />
                  )}
                />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Controller
                      control={control}
                      name={`ingredients.${index}.unit`}
                      render={({ field }) => (
                        <UnitPicker value={field.value ?? DEFAULT_UNIT} onChange={field.onChange} />
                      )}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Controller
                      control={control}
                      name={`ingredients.${index}.amount`}
                      render={({ field, fieldState }) => (
                        <TextField
                          placeholder="כמות"
                          value={Number.isNaN(field.value) ? '' : String(field.value)}
                          onChangeText={(text) => field.onChange(parseWholeNumber(text))}
                          onBlur={field.onBlur}
                          keyboardType="number-pad"
                          error={fieldState.error?.message}
                        />
                      )}
                    />
                  </View>
                </View>
              </View>
            ))}
            <Button
              label="הוסיפו מרכיב"
              variant="menu"
              icon={Plus}
              onPress={() => ingredientFields.append({ ...emptyIngredient })}
            />
          </View>

          {/* Instructions */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600' }}>
              {strings.screens.edit.fields.instructions}
            </Text>
            {instructionFields.fields.map((item, index) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: theme.colors.surfaceAlt,
                  borderRadius: 16,
                  padding: 8,
                  gap: 8,
                }}
              >
                <Text style={{ color: theme.colors.accent, fontWeight: '700', textAlign: 'right' }}>
                  {formatStepNumber(index)}
                </Text>
                <Controller
                  control={control}
                  name={`instructions.${index}.text`}
                  render={({ field, fieldState }) => (
                    <TextField
                      placeholder="תארו את שלבי ההכנה"
                      value={field.value ?? ''}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </View>
            ))}
            <Button
              label="הוסיפו שלב"
              variant="menu"
              icon={Plus}
              onPress={() => instructionFields.append({ text: '' })}
            />
          </View>

          {/* Category */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600' }}>
              {strings.screens.edit.fields.category}
            </Text>
            <CategoryPicker
              value={categoryValue ?? ''}
              categories={categories}
              onChange={(cat) => setValue('category', cat, { shouldDirty: true })}
            />
          </View>

          {/* Link */}
          <Controller
            control={control}
            name="link"
            render={({ field, fieldState }) => (
              <TextField
                label={strings.screens.edit.fields.link}
                placeholder="https://www..."
                value={field.value ?? ''}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                autoCapitalize="none"
                keyboardType="url"
              />
            )}
          />
        </ScrollView>

        {/* Sticky save bar */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.colors.accent,
            padding: 16,
          }}
        >
          <Button label={strings.screens.edit.actions.save} onPress={handleSubmit(onSave)} loading={saving} />
        </View>
      </KeyboardAvoidingView>

      <ExitConfirmAlertOverlay
        isOpen={isDiscardOverlayOpen}
        title="המתכון החדש לא נשמר"
        message="האם לצאת בלי לשמור את המתכון?"
        confirmLabel="צא בלי לשמור"
        cancelLabel="הישאר"
        onConfirm={() => {
          setDiscardOverlayOpen(false);
          navigation.goBack();
        }}
        onCancel={() => setDiscardOverlayOpen(false)}
      />
    </SafeAreaView>
  );
}
