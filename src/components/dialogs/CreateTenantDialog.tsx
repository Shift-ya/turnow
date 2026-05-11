import * as React from "react";
import { BaseFormDialog, type FormField } from "./BaseFormDialog";

interface CreateTenantDialogProps {
  onSave: (data: { name: string; firstName?: string; lastName?: string; email: string; phone: string; address: string; slug: string; plan: string }) => Promise<void>;
  isLoading?: boolean;
}

export const CreateTenantDialog: React.FC<CreateTenantDialogProps> = ({
  onSave,
  isLoading = false,
}) => {
  const fields: FormField[] = [
    {
      id: "firstName",
      label: "Nombre",
      type: "text",
      placeholder: "Nombre",
      required: true,
    },
    {
      id: "lastName",
      label: "Apellido",
      type: "text",
      placeholder: "Apellido",
      required: true,
    },
    {
      id: "name",
      label: "Nombre del negocio",
      type: "text",
      placeholder: "Mi Negocio",
      required: true,
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      placeholder: "contacto@negocio.com",
      required: true,
    },
    {
      id: "phone",
      label: "Teléfono",
      type: "text",
      placeholder: "+54 9 1234567890",
    },
    {
      id: "address",
      label: "Dirección",
      type: "text",
      placeholder: "Calle Principal 123",
    },
    {
      id: "slug",
      label: "Slug público",
      type: "text",
      placeholder: "mi-negocio",
    },
    {
      id: "plan",
      label: "Plan",
      type: "select",
      required: true,
      options: [
        { value: "BASIC", label: "BASIC" },
        { value: "PROFESSIONAL", label: "PROFESSIONAL" },
        { value: "PREMIUM", label: "PREMIUM" },
      ],
      defaultValue: "BASIC",
    },
  ];

  const handleSubmit = async (data: Record<string, string | number>) => {
    const firstName = (data.firstName as string) || '';
    const lastName = (data.lastName as string) || '';
    const name = data.name as string;
    const slug = (data.slug as string).trim() || name.toLowerCase().replace(/\s+/g, "-");

    await onSave({
      name,
      firstName,
      lastName,
      email: data.email as string,
      phone: data.phone as string,
      address: data.address as string,
      slug,
      plan: data.plan as string,
    });
  };

  return (
    <BaseFormDialog
      title="Crear Nuevo Cliente"
      description="Completa los datos del nuevo cliente para agregarlo a la plataforma"
      fields={fields}
      onSubmit={handleSubmit}
      submitLabel="Crear Cliente"
      triggerLabel="+ Nuevo Cliente"
      isLoading={isLoading}
      triggerAsChild={false}
    />
  );
};
