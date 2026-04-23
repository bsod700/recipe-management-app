'use client';
import React from 'react';
import { createAlertDialog } from '@gluestack-ui/core/alert-dialog/creator';
import { Pressable, View } from 'react-native';
import {
  tva,
  withStyleContext,
} from '@gluestack-ui/utils/nativewind-utils';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

const SCOPE = 'ALERT_DIALOG';

const Root = withStyleContext(View, SCOPE);

const UIAlertDialog = createAlertDialog({
  Root,
  Content: View,
  CloseButton: Pressable,
  Header: View,
  Footer: View,
  Body: View,
  Backdrop: Pressable,
});

const alertDialogRootStyle = tva({
  base: 'w-full h-full items-center justify-center px-6',
});

const alertDialogContentStyle = tva({
  base: 'bg-background-0 rounded-xl border border-outline-200 w-full max-w-[360px] shadow-hard-5',
});

const alertDialogBackdropStyle = tva({
  base: 'absolute left-0 top-0 right-0 bottom-0 bg-background-50/80',
});

const alertDialogHeaderStyle = tva({
  base: 'px-6 pt-6 pb-2',
});

const alertDialogBodyStyle = tva({
  base: 'px-6 pb-4',
});

const alertDialogFooterStyle = tva({
  base: 'px-6 pb-6 pt-2 flex-row gap-3',
});

const alertDialogCloseButtonStyle = tva({
  base: 'rounded-md data-[focus-visible=true]:outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-indicator-info',
});

type IAlertDialogProps = React.ComponentProps<typeof UIAlertDialog> & {
  className?: string;
};

const AlertDialog = React.forwardRef<
  React.ComponentRef<typeof UIAlertDialog>,
  IAlertDialogProps
>(function AlertDialog({ ...props }, ref) {
  const { className, ...rest } = props;
  return (
    <UIAlertDialog
      ref={ref}
      {...rest}
      className={alertDialogRootStyle({ class: className })}
    />
  );
});

type IAlertDialogContentProps = React.ComponentProps<typeof UIAlertDialog.Content> &
  VariantProps<typeof alertDialogContentStyle> & {
    className?: string;
  };

const AlertDialogContent = React.forwardRef<
  React.ComponentRef<typeof UIAlertDialog.Content>,
  IAlertDialogContentProps
>(function AlertDialogContent({ className, ...props }, ref) {
  return (
    <UIAlertDialog.Content
      ref={ref}
      {...props}
      className={alertDialogContentStyle({ class: className })}
    />
  );
});

type IAlertDialogBackdropProps = React.ComponentProps<typeof UIAlertDialog.Backdrop> &
  VariantProps<typeof alertDialogBackdropStyle> & {
    className?: string;
  };

const AlertDialogBackdrop = React.forwardRef<
  React.ComponentRef<typeof UIAlertDialog.Backdrop>,
  IAlertDialogBackdropProps
>(function AlertDialogBackdrop({ className, ...props }, ref) {
  return (
    <UIAlertDialog.Backdrop
      ref={ref}
      {...props}
      className={alertDialogBackdropStyle({ class: className })}
    />
  );
});

type IAlertDialogHeaderProps = React.ComponentProps<typeof UIAlertDialog.Header> &
  VariantProps<typeof alertDialogHeaderStyle> & {
    className?: string;
  };

const AlertDialogHeader = React.forwardRef<
  React.ComponentRef<typeof UIAlertDialog.Header>,
  IAlertDialogHeaderProps
>(function AlertDialogHeader({ className, ...props }, ref) {
  return (
    <UIAlertDialog.Header
      ref={ref}
      {...props}
      className={alertDialogHeaderStyle({ class: className })}
    />
  );
});

type IAlertDialogBodyProps = React.ComponentProps<typeof UIAlertDialog.Body> &
  VariantProps<typeof alertDialogBodyStyle> & {
    className?: string;
  };

const AlertDialogBody = React.forwardRef<
  React.ComponentRef<typeof UIAlertDialog.Body>,
  IAlertDialogBodyProps
>(function AlertDialogBody({ className, ...props }, ref) {
  return (
    <UIAlertDialog.Body
      ref={ref}
      {...props}
      className={alertDialogBodyStyle({ class: className })}
    />
  );
});

type IAlertDialogFooterProps = React.ComponentProps<typeof UIAlertDialog.Footer> &
  VariantProps<typeof alertDialogFooterStyle> & {
    className?: string;
  };

const AlertDialogFooter = React.forwardRef<
  React.ComponentRef<typeof UIAlertDialog.Footer>,
  IAlertDialogFooterProps
>(function AlertDialogFooter({ className, ...props }, ref) {
  return (
    <UIAlertDialog.Footer
      ref={ref}
      {...props}
      className={alertDialogFooterStyle({ class: className })}
    />
  );
});

type IAlertDialogCloseButtonProps = React.ComponentProps<
  typeof UIAlertDialog.CloseButton
> &
  VariantProps<typeof alertDialogCloseButtonStyle> & {
    className?: string;
  };

const AlertDialogCloseButton = React.forwardRef<
  React.ComponentRef<typeof UIAlertDialog.CloseButton>,
  IAlertDialogCloseButtonProps
>(function AlertDialogCloseButton({ className, ...props }, ref) {
  return (
    <UIAlertDialog.CloseButton
      ref={ref}
      {...props}
      className={alertDialogCloseButtonStyle({ class: className })}
    />
  );
});

AlertDialog.displayName = 'AlertDialog';
AlertDialogContent.displayName = 'AlertDialogContent';
AlertDialogBackdrop.displayName = 'AlertDialogBackdrop';
AlertDialogHeader.displayName = 'AlertDialogHeader';
AlertDialogBody.displayName = 'AlertDialogBody';
AlertDialogFooter.displayName = 'AlertDialogFooter';
AlertDialogCloseButton.displayName = 'AlertDialogCloseButton';

export {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogCloseButton,
};
