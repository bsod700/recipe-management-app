import React, { useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import type { RootStackParamList } from '@presentation/navigation/types';
import {
  recipeFormSchema,
  type RecipeFormValues,
} from '@domain/schemas/recipeSchema';
import { useRecipe } from '@application/hooks/useRecipe';
import { useRecipeMutations } from '@application/hooks/useRecipeMutations';
import { TextField } from '@presentation/components/TextField';
import { Button } from '@presentation/components/Button';
import { IngredientRow } from '@presentation/components/IngredientRow';
import { PhotoPicker } from '@presentation/components/PhotoPicker';
import { strings } from '@shared/i18n/he';
import { theme } from '@shared/theme/theme';
import { DEFAULT_UNIT } from '@shared/constants/units';
import { formatStepNumber, parseInstructionSteps, serializeInstructionSteps } from '@shared/utils/instructions';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeEdit'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'RecipeEdit'>;

const emptyIngredient = {
  name: '',
  amount: NaN,
  unit: DEFAULT_UNIT,
} as const;

const emptyInstructionStep = { text: '' } as const;

function parseWholeNumber(text: string): number {
  const normalized = text.replace(/[^0-9]/g, '');
  return normalized === '' ? NaN : Number(normalized);
}

export function EditScreen(): React.ReactElement {
  const route = useRoute<Props['route']>();
  const navigation = useNavigation<Nav>();
  const id = route.params?.id;
  const isEdit = Boolean(id);

  const { recipe, loading } = useRecipe(id);
  const { create, update, remove, saving, deleting } = useRecipeMutations();

  const defaultValues = useMemo<RecipeFormValues>(
    () => ({
      title: '',
      prepTimeMinutes: NaN,
      cookTimeMinutes: NaN,
      servings: NaN,
      ingredients: [{ ...emptyIngredient }],
      instructions: [{ ...emptyInstructionStep }],
      imageUri: undefined,
    }),
    []
  );

  const methods = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const { control, handleSubmit, reset, formState, watch, setValue } = methods;
  const ingredientFields = useFieldArray({ control, name: 'ingredients' });
  const instructionFields = useFieldArray({ control, name: 'instructions' });

  // Populate form when editing an existing recipe.
  useEffect(() => {
    if (!isEdit) return;
    if (!recipe) return;
    reset({
      title: recipe.title,
      prepTimeMinutes: recipe.prepTimeMinutes,
      cookTimeMinutes: recipe.cookTimeMinutes,
      servings: recipe.servings,
      ingredients: recipe.ingredients.map((i) => ({
        name: i.name,
        amount: i.amount,
        unit: i.unit,
      })),
      instructions: parseInstructionSteps(recipe.instructions).map((text) => ({ text })),
      imageUri: recipe.imageUri,
    });
  }, [isEdit, recipe, reset]);

  // Set dynamic header title.
  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEdit
        ? strings.screens.edit.titleEdit
        : strings.screens.edit.titleNew,
    });
  }, [navigation, isEdit]);

  // Confirm-before-leave if the form is dirty.
  const confirmDiscardIfDirty = useCallback((): boolean => {
    if (!formState.isDirty) return false;
    Alert.alert(
      strings.screens.edit.confirmDiscard.title,
      strings.screens.edit.confirmDiscard.message,
      [
        { text: strings.screens.edit.confirmDiscard.cancel, style: 'cancel' },
        {
          text: strings.screens.edit.confirmDiscard.confirm,
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
    return true;
  }, [formState.isDirty, navigation]);

  // Android hardware back.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      return confirmDiscardIfDirty();
    });
    return () => sub.remove();
  }, [confirmDiscardIfDirty]);

  // Header back intercept.
  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      if (!formState.isDirty) return;
      e.preventDefault();
      Alert.alert(
        strings.screens.edit.confirmDiscard.title,
        strings.screens.edit.confirmDiscard.message,
        [
          { text: strings.screens.edit.confirmDiscard.cancel, style: 'cancel' },
          {
            text: strings.screens.edit.confirmDiscard.confirm,
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });
    return unsub;
  }, [navigation, formState.isDirty]);

  const onSubmit = useCallback(
    async (values: RecipeFormValues): Promise<void> => {
      try {
        const draft = {
          title: values.title,
          prepTimeMinutes: values.prepTimeMinutes,
          cookTimeMinutes: values.cookTimeMinutes,
          servings: values.servings,
          ingredients: values.ingredients,
          instructions: serializeInstructionSteps(
            values.instructions.map((step) => step.text)
          ),
          ...(values.imageUri ? { imageUri: values.imageUri } : {}),
        };
        if (isEdit && id) {
          await update(id, draft);
        } else {
          await create(draft);
        }
        // Reset dirty so beforeRemove lets us leave quietly.
        reset(values);
        navigation.goBack();
      } catch {
        Alert.alert(strings.app.name, strings.errors.saveFailed);
      }
    },
    [create, update, id, isEdit, navigation, reset]
  );

  const onDelete = useCallback(() => {
    if (!id) return;
    Alert.alert(
      strings.screens.edit.confirmDelete.title,
      strings.screens.edit.confirmDelete.message,
      [
        { text: strings.screens.edit.confirmDelete.cancel, style: 'cancel' },
        {
          text: strings.screens.edit.confirmDelete.confirm,
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(id);
              // Pop twice: off Edit → off Detail → back to List.
              reset(methods.getValues()); // clear dirty
              navigation.popToTop();
            } catch {
              Alert.alert(strings.app.name, strings.errors.deleteFailed);
            }
          },
        },
      ]
    );
  }, [id, navigation, remove, reset, methods]);

  const imageUri = watch('imageUri');

  if (isEdit && loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.colors.accent} size="large" />
      </View>
    );
  }

  return (
    <FormProvider {...methods}>
      <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'android' ? undefined : 'padding'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              padding: theme.spacing.lg,
              gap: theme.spacing.xl,
              paddingBottom: theme.spacing.xl,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title */}
            <Controller
              control={control}
              name="title"
              render={({ field, fieldState }) => (
                <TextField
                  label={strings.screens.edit.fields.title}
                  placeholder={strings.screens.edit.fields.titlePlaceholder}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  returnKeyType="next"
                />
              )}
            />

            {/* Recipe details */}
            <View style={{ gap: theme.spacing.md }}>
              <Text className="text-lg font-bold text-text text-right">
                {strings.screens.edit.fields.recipeDetails}
              </Text>
              <View style={{ gap: theme.spacing.md }}>
                <Controller
                  control={control}
                  name="prepTimeMinutes"
                  render={({ field, fieldState }) => (
                    <TextField
                      label={strings.screens.edit.fields.prepTimeMinutes}
                      placeholder={strings.screens.edit.fields.minutesPlaceholder}
                      value={
                        field.value === undefined || Number.isNaN(field.value)
                          ? ''
                          : String(field.value)
                      }
                      onChangeText={(text) => field.onChange(parseWholeNumber(text))}
                      onBlur={field.onBlur}
                      error={fieldState.error?.message}
                      keyboardType="number-pad"
                      inputMode="numeric"
                      returnKeyType="next"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="cookTimeMinutes"
                  render={({ field, fieldState }) => (
                    <TextField
                      label={strings.screens.edit.fields.cookTimeMinutes}
                      placeholder={strings.screens.edit.fields.minutesPlaceholder}
                      value={
                        field.value === undefined || Number.isNaN(field.value)
                          ? ''
                          : String(field.value)
                      }
                      onChangeText={(text) => field.onChange(parseWholeNumber(text))}
                      onBlur={field.onBlur}
                      error={fieldState.error?.message}
                      keyboardType="number-pad"
                      inputMode="numeric"
                      returnKeyType="next"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="servings"
                  render={({ field, fieldState }) => (
                    <TextField
                      label={strings.screens.edit.fields.servings}
                      placeholder={strings.screens.edit.fields.servingsPlaceholder}
                      value={
                        field.value === undefined || Number.isNaN(field.value)
                          ? ''
                          : String(field.value)
                      }
                      onChangeText={(text) => field.onChange(parseWholeNumber(text))}
                      onBlur={field.onBlur}
                      error={fieldState.error?.message}
                      keyboardType="number-pad"
                      inputMode="numeric"
                      returnKeyType="next"
                    />
                  )}
                />
              </View>
            </View>

            {/* Ingredients */}
            <View style={{ gap: theme.spacing.md }}>
              <Text className="text-lg font-bold text-text text-right">
                {strings.screens.edit.fields.ingredients}
              </Text>

              {formState.errors.ingredients?.message ? (
                <Text className="text-base text-danger text-right">
                  {formState.errors.ingredients.message}
                </Text>
              ) : null}

              <View style={{ gap: theme.spacing.md }}>
                {ingredientFields.fields.map((field, index) => (
                  <IngredientRow
                    key={field.id}
                    index={index}
                    canRemove={ingredientFields.fields.length > 1}
                    onRemove={(i) => ingredientFields.remove(i)}
                  />
                ))}
              </View>

              <Button
                label={strings.screens.edit.actions.addIngredient}
                variant="secondary"
                onPress={() => ingredientFields.append({ ...emptyIngredient })}
              />
            </View>

            {/* Instructions */}
            <View style={{ gap: theme.spacing.md }}>
              <Text className="text-lg font-bold text-text text-right">
                {strings.screens.edit.fields.instructions}
              </Text>

              {typeof formState.errors.instructions?.message === 'string' ? (
                <Text className="text-base text-danger text-right">
                  {formState.errors.instructions.message}
                </Text>
              ) : null}

              <View style={{ gap: theme.spacing.md }}>
                {instructionFields.fields.map((field, index) => (
                  <View
                    key={field.id}
                    className="rounded-card border border-border bg-surfaceAlt"
                    style={{ padding: theme.spacing.md, gap: theme.spacing.sm }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text className="text-base text-accent font-bold">
                        {formatStepNumber(index)}
                      </Text>
                      {instructionFields.fields.length > 1 ? (
                        <Pressable
                          onPress={() => instructionFields.remove(index)}
                          accessibilityRole="button"
                          accessibilityLabel={strings.screens.edit.actions.removeStep}
                          style={{
                            minWidth: theme.minTouchTarget,
                            minHeight: theme.minTouchTarget,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: theme.radius.md,
                          }}
                        >
                          <Text className="text-danger font-semibold">
                            {strings.screens.edit.actions.removeStep}
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>

                    <Controller
                      control={control}
                      name={`instructions.${index}.text`}
                      render={({ field: stepField, fieldState }) => (
                        <TextField
                          placeholder={strings.screens.edit.fields.instructionsPlaceholder}
                          value={stepField.value}
                          onChangeText={stepField.onChange}
                          onBlur={stepField.onBlur}
                          error={fieldState.error?.message}
                          multiline
                          minHeight={96}
                        />
                      )}
                    />
                  </View>
                ))}
              </View>

              <Button
                label={strings.screens.edit.actions.addStep}
                variant="secondary"
                onPress={() => instructionFields.append({ ...emptyInstructionStep })}
              />
            </View>

            {/* Photo */}
            <PhotoPicker
              uri={imageUri}
              onChange={(uri) =>
                setValue('imageUri', uri, { shouldDirty: true })
              }
            />
          </ScrollView>

          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.md,
              paddingBottom: theme.spacing.lg,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              gap: theme.spacing.sm,
            }}
          >
            <Button
              label={strings.screens.edit.actions.save}
              onPress={handleSubmit(onSubmit)}
              loading={saving}
            />

            {isEdit ? (
              <Button
                label={strings.screens.edit.actions.delete}
                onPress={onDelete}
                variant="danger"
                loading={deleting}
              />
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </FormProvider>
  );
}
