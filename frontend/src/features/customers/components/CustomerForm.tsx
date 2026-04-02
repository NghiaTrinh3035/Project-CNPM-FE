import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  customerCreateSchema,
  customerUpdateSchema,
  type CustomerFormValues,
} from "@/features/customers/schemas/customerSchema";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";

interface CustomerFormProps {
  mode: "create" | "update";
  initialValues?: Partial<CustomerFormValues>;
  submitError?: string | null;
  onCancel: () => void;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
}

const labelClassName = "mb-1 block text-sm font-medium";
const errorClassName = "mt-1 text-xs text-red-600";

export const CustomerForm = ({ mode, initialValues, submitError, onCancel, onSubmit }: CustomerFormProps) => {
  const schema = mode === "create" ? customerCreateSchema : customerUpdateSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      email: "",
      phone: "",
      address: "",
      gender: "MALE",
      ...initialValues,
    },
  });

  useEffect(() => {
    reset({
      username: "",
      password: "",
      fullName: "",
      email: "",
      phone: "",
      address: "",
      gender: "MALE",
      ...initialValues,
    });
  }, [initialValues, reset]);

  const submitForm = handleSubmit(onSubmit);

  return (
    <form className="space-y-3" onSubmit={submitForm}>
      {mode === "create" ? (
        <>
          <div>
            <label className={labelClassName}>Ten dang nhap</label>
            <Input {...register("username")} />
            {errors.username ? <p className={errorClassName}>{errors.username.message}</p> : null}
          </div>

          <div>
            <label className={labelClassName}>Mat khau</label>
            <Input type="password" {...register("password")} />
            {errors.password ? <p className={errorClassName}>{errors.password.message}</p> : null}
          </div>
        </>
      ) : null}

      <div>
        <label className={labelClassName}>Ho va ten</label>
        <Input {...register("fullName")} />
        {errors.fullName ? <p className={errorClassName}>{errors.fullName.message}</p> : null}
      </div>

      <div>
        <label className={labelClassName}>Email</label>
        <Input {...register("email")} />
        {errors.email ? <p className={errorClassName}>{errors.email.message}</p> : null}
      </div>

      <div>
        <label className={labelClassName}>So dien thoai</label>
        <Input {...register("phone")} />
        {errors.phone ? <p className={errorClassName}>{errors.phone.message}</p> : null}
      </div>

      <div>
        <label className={labelClassName}>Dia chi</label>
        <Input {...register("address")} />
        {errors.address ? <p className={errorClassName}>{errors.address.message}</p> : null}
      </div>

      <div>
        <label className={labelClassName}>Gioi tinh</label>
        <Select {...register("gender")}>
          <option value="MALE">Nam</option>
          <option value="FEMALE">Nu</option>
          <option value="OTHER">Khac</option>
        </Select>
        {errors.gender ? <p className={errorClassName}>{errors.gender.message}</p> : null}
      </div>

      {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Huy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Dang luu..." : mode === "create" ? "Them moi" : "Cap nhat"}
        </Button>
      </div>
    </form>
  );
};



