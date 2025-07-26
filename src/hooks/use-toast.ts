import { toast as sonnerToast } from "sonner";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useToast() {
  const toast = ({ title, description, variant = "default", action }: ToastProps) => {
    const message = title || description;
    const richMessage = title && description ? (
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
    ) : message;

    if (variant === "destructive") {
      sonnerToast.error(richMessage, {
        action: action ? {
          label: action.label,
          onClick: action.onClick
        } : undefined
      });
    } else {
      sonnerToast.success(richMessage, {
        action: action ? {
          label: action.label,
          onClick: action.onClick
        } : undefined
      });
    }
  };

  return { toast };
}
