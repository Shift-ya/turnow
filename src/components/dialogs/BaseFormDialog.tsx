import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "number" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string | number;
}

interface BaseFormDialogProps {
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "destructive" | "ghost" | "secondary";
  title: string;
  description?: string;
  fields: FormField[];
  onSubmit: (data: Record<string, string | number>) => Promise<void> | void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
  triggerAsChild?: boolean;
}

export const BaseFormDialog = ({
  triggerLabel = "Abrir",
  triggerVariant = "default",
  title,
  description,
  fields,
  onSubmit,
  submitLabel = "Guardar cambios",
  cancelLabel = "Cancelar",
  isLoading = false,
  children,
  triggerAsChild: _triggerAsChild = false,
}: BaseFormDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<Record<string, string | number>>({});
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    const initialData: Record<string, string | number> = {};
    fields.forEach((field) => {
      initialData[field.id] = field.defaultValue || "";
    });
    setFormData(initialData);
  }, [fields]);

  const handleChange = (id: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
      setOpen(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const triggerNode = children ? children : <Button variant={triggerVariant}>{triggerLabel}</Button>;
  const safeTriggerNode = React.isValidElement(triggerNode) ? triggerNode : <span>{triggerNode}</span>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {safeTriggerNode}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="eyebrow w-fit">Formulario</div>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id} className="flex items-center gap-1.5">
                {field.label}
                {field.required && <span className="text-[#f52ccf]">*</span>}
              </Label>

              {field.type === "textarea" ? (
                <textarea
                  id={field.id}
                  placeholder={field.placeholder}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  required={field.required}
                  className="flex min-h-[110px] w-full rounded-[22px] border border-white/10 bg-[#0d0d0d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#717171] focus:border-[#5e92ff] focus:bg-[#0f111a] focus:ring-4 focus:ring-[#5e92ff]/15 disabled:cursor-not-allowed disabled:opacity-60"
                />
              ) : field.type === "select" ? (
                <select
                  id={field.id}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  required={field.required}
                  className="flex h-11 w-full rounded-[22px] border border-white/10 bg-[#0d0d0d] px-4 py-2 text-sm text-white outline-none transition focus:border-[#5e92ff] focus:bg-[#0f111a] focus:ring-4 focus:ring-[#5e92ff]/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="" className="bg-[#0d0d0d] text-[#a1a1aa]">
                    Selecciona una opcion
                  </option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#0d0d0d] text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  required={field.required}
                />
              )}
            </div>
          ))}

          <DialogFooter className="border-t border-white/10 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting || isLoading}>
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={submitting || isLoading}>
              {submitting || isLoading ? "Guardando..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
