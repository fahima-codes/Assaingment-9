"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { uploadImageToImgBB } from "@/lib/imgbb";
import {
  SERVICE_CATEGORIES,
  SERVICE_MODES,
  type Service,
} from "@/lib/services";
import type { AuthUser } from "@/lib/auth-session";

interface TechnicianServiceFormProps {
  user: AuthUser;
  service?: Service;
  onCancel?: () => void;
  onSaved: (service?: Service) => void;
}

export function TechnicianServiceForm({
  user,
  service,
  onCancel,
  onSaved,
}: TechnicianServiceFormProps) {
  const [title, setTitle] = useState(service?.title ?? "");
  const [category, setCategory] = useState(service?.category ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [price, setPrice] = useState(
    typeof service?.price === "number" ? String(service.price) : "",
  );
  const [duration, setDuration] = useState(service?.duration ?? "");
  const [serviceMode, setServiceMode] = useState(service?.serviceMode ?? "");
  const [serviceArea, setServiceArea] = useState(
    service?.serviceArea ?? service?.technicianArea ?? "",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file && !file.type.startsWith("image/")) {
      event.target.value = "";
      toast.error("Choose an image file for your service.");
      return;
    }

    setImageFile(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      toast.error("Enter a base price greater than 0.");
      return;
    }
    if (!imageFile && !service?.serviceImage) {
      toast.error("Choose an image for your service.");
      return;
    }

    setIsSaving(true);
    try {
      const serviceImage = imageFile
        ? await uploadImageToImgBB(imageFile)
        : service?.serviceImage ?? "";
      const payload = {
        title: title.trim(),
        category,
        description: description.trim(),
        price: numericPrice,
        duration: duration.trim(),
        serviceMode,
        serviceArea: serviceArea.trim(),
        serviceImage,
      };

      const savedService = service
        ? await api.patch<Service>(`/api/services/${service._id}`, payload)
        : await api.post<Service>("/api/services", payload);

      toast.success(
        service
          ? "Service updated and is waiting for admin approval."
          : "Waiting for admin approval",
      );
      onSaved(savedService);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save your service.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const fieldClassName =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="technician-service-name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="technician-service-name"
            value={user.name ?? ""}
            readOnly
            className={`${fieldClassName} bg-muted text-muted-foreground`}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="technician-service-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="technician-service-email"
            type="email"
            value={user.email ?? ""}
            readOnly
            className={`${fieldClassName} bg-muted text-muted-foreground`}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="technician-service-title" className="text-sm font-medium">
            Title
          </label>
          <input
            id="technician-service-title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={fieldClassName}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="technician-service-category" className="text-sm font-medium">
            Category
          </label>
          <select
            id="technician-service-category"
            required
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={fieldClassName}
          >
            <option value="" disabled>
              Select a category
            </option>
            {SERVICE_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="technician-service-price" className="text-sm font-medium">
            Base Price
          </label>
          <input
            id="technician-service-price"
            type="number"
            required
            min="0.01"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className={fieldClassName}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="technician-service-duration" className="text-sm font-medium">
            Estimated Duration
          </label>
          <input
            id="technician-service-duration"
            required
            placeholder="e.g. 1-2 hours"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            className={fieldClassName}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="technician-service-mode" className="text-sm font-medium">
            Service Mode
          </label>
          <select
            id="technician-service-mode"
            required
            value={serviceMode}
            onChange={(event) => setServiceMode(event.target.value)}
            className={fieldClassName}
          >
            <option value="" disabled>
              Select a service mode
            </option>
            {SERVICE_MODES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="technician-service-area" className="text-sm font-medium">
            Service Area
          </label>
          <input
            id="technician-service-area"
            required
            value={serviceArea}
            onChange={(event) => setServiceArea(event.target.value)}
            className={fieldClassName}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="technician-service-description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="technician-service-description"
            required
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="technician-service-image" className="text-sm font-medium">
            Service Image
          </label>
          <input
            id="technician-service-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-accent-foreground hover:file:bg-accent/80"
          />
          <p className="text-xs text-muted-foreground">
            {imageFile
              ? `Selected: ${imageFile.name}`
              : service?.serviceImage
                ? "Choose a new image to replace the current one."
                : "Choose an image file to upload with ImgBB."}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={onCancel}
          >
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSaving}>
          {isSaving
            ? imageFile
              ? "Uploading and saving..."
              : "Saving..."
            : service
              ? "Save Changes"
              : "Submit for Approval"}
        </Button>
      </div>
    </form>
  );
}
