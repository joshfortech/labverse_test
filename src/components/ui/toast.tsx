import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cva } from 'class-variance-authority';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

const ToastProvider = ToastPrimitive.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border-slate-200 bg-white text-slate-900',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
        destructive: 'border-red-200 bg-red-50 text-red-900',
        warning: 'border-amber-200 bg-amber-50 text-amber-900',
        info: 'border-blue-200 bg-blue-50 text-blue-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & { variant?: 'default' | 'success' | 'destructive' | 'warning' | 'info' }
>(({ className, variant = 'default', ...props }, ref) => {
  const icons = {
    default: null,
    success: <CheckCircle className="h-5 w-5 text-emerald-600" />,
    destructive: <AlertCircle className="h-5 w-5 text-red-600" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600" />,
    info: <Info className="h-5 w-5 text-blue-600" />,
  };

  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-start space-x-3">
        {icons[variant] && <div className="flex-shrink-0">{icons[variant]}</div>}
        <div className="flex-1 space-y-1">
          <div className="flex items-center space-x-2">
            <ToastPrimitive.Title className="text-sm font-semibold" />
            <ToastPrimitive.Close className="ml-auto flex h-5 w-5 items-center justify-center rounded-md text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-lab-green">
              <X className="h-4 w-4" />
            </ToastPrimitive.Close>
          </div>
          <ToastPrimitive.Description className="text-sm opacity-90" />
        </div>
      </div>
      <ToastPrimitive.Action asChild altText="Dismiss">
        <button className="inline-flex h-8 shrink-0 items-center justify-center rounded-md bg-slate-100 px-3 text-xs font-semibold text-slate-600 ring-offset-white transition-colors hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-lab-green focus:ring-offset-2">
          Dismiss
        </button>
      </ToastPrimitive.Action>
    </ToastPrimitive.Root>
  );
});
Toast.displayName = ToastPrimitive.Root.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn('ml-auto flex h-5 w-5 items-center justify-center rounded-md text-slate-400 hover:text-slate-600', className)}
    {...props}
  />
));
ToastClose.displayName = ToastPrimitive.Close.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn('inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-xs font-semibold ring-offset-white transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-lab-green focus:ring-offset-2', className)}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitive.Action.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  type ToastProps,
  type ToastActionElement,
};