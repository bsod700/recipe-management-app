import React, { memo, useCallback, useState } from 'react';
import { Trash2 } from 'lucide-react-native';
import { View } from 'react-native';
import { strings } from '@shared/i18n/he';
import { theme } from '@shared/theme/theme';
import { Button } from './Button';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

interface Props {
  readonly recipeId: string;
  readonly deleting: boolean;
  readonly onConfirmDelete: (id: string) => Promise<void>;
}

function ListDeleteRecipeActionInner({
  recipeId,
  deleting,
  onConfirmDelete,
}: Props): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = useCallback(() => {
    if (deleting) return;
    setIsOpen(true);
  }, [deleting]);

  const closeDialog = useCallback(() => {
    if (deleting) return;
    setIsOpen(false);
  }, [deleting]);

  const confirmDelete = useCallback(async (): Promise<void> => {
    await onConfirmDelete(recipeId);
    setIsOpen(false);
  }, [onConfirmDelete, recipeId]);

  return (
    <>
      <View
        style={{
          width: 120,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.sm,
        }}
      >
        <Button
          label={strings.screens.list.swipeDelete}
          onPress={openDialog}
          icon={Trash2}
          variant="danger"
          disabled={deleting}
          accessibilityLabel={strings.a11y.swipeDeleteRecipe}
        />
      </View>

      <AlertDialog isOpen={isOpen} onClose={closeDialog} useRNModal>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading size="md">{strings.screens.list.confirmDelete.title}</Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text>{strings.screens.list.confirmDelete.message}</Text>
          </AlertDialogBody>
          <AlertDialogFooter className="justify-end">
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              <View style={{ minWidth: 110 }}>
                <Button
                  label={strings.screens.list.confirmDelete.cancel}
                  onPress={closeDialog}
                  variant="secondary"
                  disabled={deleting}
                />
              </View>
              <View style={{ minWidth: 110 }}>
                <Button
                  label={strings.screens.list.confirmDelete.confirm}
                  onPress={() => void confirmDelete()}
                  variant="danger"
                  icon={Trash2}
                  loading={deleting}
                />
              </View>
            </View>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const ListDeleteRecipeAction = memo(ListDeleteRecipeActionInner);
