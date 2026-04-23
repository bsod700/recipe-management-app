import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Plus, Save, Trash2, X } from 'lucide-react-native';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ReactHookForm from 'react-hook-form';
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
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { Toast, ToastTitle, useToast } from '@/components/ui/toast';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { Heading } from '@/components/ui/heading';
import { strings } from '@shared/i18n/he';
import { theme } from '@shared/theme/theme';
import { DEFAULT_UNIT } from '@shared/constants/units';
import { formatStepNumber, parseInstructionSteps, serializeInstructionSteps } from '@shared/utils/instructions';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeEdit'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'RecipeEdit'>;
type RHFControllerRenderArg = {
  field: {
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur: () => void;
  };
  fieldState: { error?: { message?: string } };
};
type RHFControllerComponent = (props: {
  control: unknown;
  name: string;
  render: (props: RHFControllerRenderArg) => React.ReactElement;
}) => React.ReactElement;
type RHFFormProviderComponent = (
  props: {
    children: React.ReactNode;
  } & Record<string, unknown>
) => React.ReactElement;
type RHFUseFieldArrayReturn = {
  fields: Array<{ id: string }>;
  append: (value: unknown) => void;
  remove: (index: number) => void;
};
type RHFUseFieldArrayHook = (props: {
  control: unknown;
  name: string;
}) => RHFUseFieldArrayReturn;
type RHFUseFormReturn = {
  control: unknown;
  handleSubmit: (
    onValid: (values: RecipeFormValues) => Promise<void> | void
  ) => () => void;
  reset: (values?: RecipeFormValues) => void;
  watch: (name: 'imageUri') => string | undefined;
  setValue: (
    name: 'imageUri',
    value: string | undefined,
    options?: { shouldDirty?: boolean }
  ) => void;
  getValues: () => RecipeFormValues;
  formState: {
    isDirty: boolean;
    errors: Record<string, unknown>;
  };
};
type RHFUseFormHook = (props: {
  resolver: unknown;
  defaultValues: RecipeFormValues;
  mode: 'onBlur';
}) => RHFUseFormReturn;

const { Controller, FormProvider, useFieldArray, useForm } = ReactHookForm as {
  Controller: RHFControllerComponent;
  FormProvider: RHFFormProviderComponent;
  useFieldArray: RHFUseFieldArrayHook;
  useForm: RHFUseFormHook;
};

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

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function EditScreen(): React.ReactElement {
  const route = useRoute<Props['route']>();
  const navigation = useNavigation<Nav>();
  const id = route.params?.id;
  const isEdit = Boolean(id);

  const { recipe, loading } = useRecipe(id);
  const { create, update, remove, saving } = useRecipeMutations();
  const bypassDiscardGuardRef = useRef(false);
  const pendingDiscardActionRef = useRef<null | (() => void)>(null);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const toast = useToast();

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

  const methods = useForm({
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

  const discardDialogCopy = isEdit
    ? strings.screens.edit.confirmDiscard
    : strings.screens.edit.confirmDiscardNew;

  // Show the discard modal and stash the action that should run on confirm.
  const openDiscardDialog = useCallback((onConfirmDiscard: () => void): boolean => {
    if (bypassDiscardGuardRef.current) return false;
    if (!formState.isDirty) return false;
    pendingDiscardActionRef.current = onConfirmDiscard;
    setIsDiscardDialogOpen(true);
    return true;
  }, [formState.isDirty]);

  const closeDiscardDialog = useCallback(() => {
    pendingDiscardActionRef.current = null;
    setIsDiscardDialogOpen(false);
  }, []);

  const confirmDiscard = useCallback(() => {
    const pendingAction = pendingDiscardActionRef.current;
    pendingDiscardActionRef.current = null;
    setIsDiscardDialogOpen(false);
    if (!pendingAction) return;
    // Let the next navigation action pass without re-triggering this guard.
    bypassDiscardGuardRef.current = true;
    pendingAction();
  }, []);

  // Android hardware back.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      return openDiscardDialog(() => navigation.goBack());
    });
    return () => sub.remove();
  }, [openDiscardDialog, navigation]);

  // Header back intercept.
  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      if (bypassDiscardGuardRef.current) return;
      if (!formState.isDirty) return;
      e.preventDefault();
      openDiscardDialog(() => navigation.dispatch(e.data.action));
    });
    return unsub;
  }, [navigation, formState.isDirty, openDiscardDialog]);

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
        bypassDiscardGuardRef.current = true;
        reset(values);
        toast.show({
          placement: 'top',
          duration: 1800,
          render: ({ id: toastId }) => (
            <Toast nativeID={`save-success-${toastId}`} action="success" variant="solid">
              <ToastTitle>{strings.screens.edit.feedback.saveSuccess}</ToastTitle>
            </Toast>
          ),
        });
        navigation.popToTop();
      } catch {
        Alert.alert(strings.app.name, strings.errors.saveFailed);
      }
    },
    [create, update, id, isEdit, navigation, reset, toast]
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: isEdit
        ? () => (
            <Pressable
              onPress={onDelete}
              accessibilityRole="button"
              accessibilityLabel={strings.screens.edit.actions.delete}
              className="bg-secondary-500 border border-outline-500 rounded-md"
              style={{
                minHeight: theme.minTouchTarget,
                minWidth: theme.minTouchTarget,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: theme.spacing.sm,
              }}
            >
              <Icon as={Trash2} size="md" className="text-error-500" />
            </Pressable>
          )
        : undefined,
    });
  }, [navigation, isEdit, onDelete]);

  const imageUri = watch('imageUri');
  const ingredientsErrorMessage =
    formState.errors.ingredients &&
    typeof formState.errors.ingredients === 'object' &&
    'message' in formState.errors.ingredients &&
    typeof formState.errors.ingredients.message === 'string'
      ? formState.errors.ingredients.message
      : undefined;
  const instructionsErrorMessage =
    formState.errors.instructions &&
    typeof formState.errors.instructions === 'object' &&
    'message' in formState.errors.instructions &&
    typeof formState.errors.instructions.message === 'string'
      ? formState.errors.instructions.message
      : undefined;

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
          style={{ flex: 1, backgroundColor: theme.colors.bg }}
        >
          <ScrollView
            style={{ backgroundColor: theme.colors.bg }}
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
                  value={asString(field.value)}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  returnKeyType="next"
                />
              )}
            />

            {/* Recipe details */}
            <View style={{ gap: theme.spacing.md }}>
              <Text className="text-lg font-bold text-typography-950">
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
              <Text className="text-lg font-bold text-typography-950">
                {strings.screens.edit.fields.ingredients}
              </Text>

              {ingredientsErrorMessage ? (
                <Text className="text-base text-error-500">
                  {ingredientsErrorMessage}
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
                icon={Plus}
              />
            </View>

            {/* Instructions */}
            <View style={{ gap: theme.spacing.md }}>
              <Text className="text-lg font-bold text-typography-950">
                {strings.screens.edit.fields.instructions}
              </Text>

              {instructionsErrorMessage ? (
                <Text className="text-base text-error-500">
                  {instructionsErrorMessage}
                </Text>
              ) : null}

              <View style={{ gap: theme.spacing.md }}>
                {instructionFields.fields.map((field, index) => (
                  <View
                    key={field.id}
                    className="rounded-lg border border-outline-500 bg-secondary-500"
                    style={{ padding: theme.spacing.md, gap: theme.spacing.sm }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text className="text-base text-primary-500 font-bold">
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
                          <Icon as={X} size="md" className="text-error-500" />
                        </Pressable>
                      ) : null}
                    </View>

                    <Controller
                      control={control}
                      name={`instructions.${index}.text`}
                      render={({ field: stepField, fieldState }) => (
                        <TextField
                          placeholder={strings.screens.edit.fields.instructionsPlaceholder}
                          value={asString(stepField.value)}
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
                icon={Plus}
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
              icon={Save}
            />
          </View>
        </KeyboardAvoidingView>

        <AlertDialog isOpen={isDiscardDialogOpen} onClose={closeDiscardDialog} useRNModal>
          <AlertDialogBackdrop />
          <AlertDialogContent>
            <AlertDialogHeader>
              <Heading size="md">{discardDialogCopy.title}</Heading>
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text>{discardDialogCopy.message}</Text>
            </AlertDialogBody>
            <AlertDialogFooter className="justify-end">
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                <View style={{ minWidth: 120 }}>
                  <Button
                    label={discardDialogCopy.cancel}
                    onPress={closeDiscardDialog}
                    variant="secondary"
                  />
                </View>
                <View style={{ minWidth: 120 }}>
                  <Button
                    label={discardDialogCopy.confirm}
                    onPress={confirmDiscard}
                    variant="danger"
                  />
                </View>
              </View>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SafeAreaView>
    </FormProvider>
  );
}
