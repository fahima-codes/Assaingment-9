"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import {
  getAuthToken,
  getAuthUser,
  isAuthRole,
  setAuthSession,
  type AuthRole,
  type AuthUser,
} from "@/lib/auth-session";
import { uploadImageToImgBB } from "@/lib/imgbb";

const ROLE_LABELS: Record<AuthRole, string> = {
  customer: "Customer",
  technician: "Technician",
  admin: "Admin",
};

function getInitials(user: AuthUser) {
  return (user.name?.trim() || user.email || "FixMate")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DashboardProfile() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AuthRole | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    const currentUser = getAuthUser();
    if (!token || !currentUser) {
      router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    const currentRole = isAuthRole(currentUser.role)
      ? currentUser.role
      : "customer";
    setUser(currentUser);
    setRole(currentRole);
  }, [pathname, router]);

  if (!user || !role) {
    return (
      <main className="px-4 py-12" role="status">
        <p className="text-sm text-muted-foreground">Checking your account...</p>
      </main>
    );
  }

  return (
    <DashboardLayout role={role} user={user}>
      <DashboardProfileForm
        role={role}
        user={user}
        onUserUpdated={setUser}
      />
    </DashboardLayout>
  );
}

interface DashboardProfileFormProps {
  role: AuthRole;
  user: AuthUser;
  onUserUpdated: (user: AuthUser) => void;
}

function DashboardProfileForm({
  role,
  user,
  onUserUpdated,
}: DashboardProfileFormProps) {
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [area, setArea] = useState(user.area ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [image, setImage] = useState(user.image ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file for your profile photo.");
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadImageToImgBB(file);
      setImage(imageUrl);
      toast.success("Profile photo uploaded.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not upload profile photo.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Enter your name.");
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await api.patch<AuthUser>("/api/users/profile", {
        name: name.trim(),
        phone: phone.trim(),
        area: area.trim(),
        bio: bio.trim(),
        image,
      });
      const nextUser: AuthUser = {
        ...user,
        name: updatedUser.name ?? name.trim(),
        phone: updatedUser.phone ?? phone.trim(),
        area: updatedUser.area ?? area.trim(),
        bio: updatedUser.bio ?? bio.trim(),
        image: updatedUser.image ?? image,
      };

      setAuthSession(getAuthToken(), nextUser);
      onUserUpdated(nextUser);
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update your profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section>
        <p className="text-sm font-semibold text-primary">Account settings</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Profile
        </h1>
        <p className="mt-2 text-muted-foreground">
          Keep your contact details and profile photo up to date.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Personal information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-xl font-semibold text-primary">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={`${name || "Profile"} profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(user)
                )}
              </span>
              <div className="space-y-2">
                <label
                  htmlFor="dashboard-profile-photo"
                  className="block text-sm font-medium text-foreground"
                >
                  Profile Photo
                </label>
                <input
                  id="dashboard-profile-photo"
                  type="file"
                  accept="image/*"
                  disabled={isUploading || isSaving}
                  onChange={handlePhotoChange}
                  className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-accent-foreground hover:file:bg-accent/80"
                />
                <p className="text-xs text-muted-foreground">
                  {isUploading
                    ? "Uploading photo..."
                    : "Choose an image to upload with ImgBB."}
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="dashboard-profile-name" className="text-sm font-medium">
                  Name
                </label>
                <input
                  id="dashboard-profile-name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="dashboard-profile-email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="dashboard-profile-email"
                  type="email"
                  value={user.email ?? ""}
                  readOnly
                  className="h-10 w-full rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="dashboard-profile-phone" className="text-sm font-medium">
                  Phone
                </label>
                <input
                  id="dashboard-profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="dashboard-profile-area" className="text-sm font-medium">
                  Area
                </label>
                <input
                  id="dashboard-profile-area"
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="dashboard-profile-bio" className="text-sm font-medium">
                  Bio
                </label>
                <textarea
                  id="dashboard-profile-bio"
                  rows={4}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="dashboard-profile-role" className="text-sm font-medium">
                  Role
                </label>
                <input
                  id="dashboard-profile-role"
                  value={ROLE_LABELS[role]}
                  readOnly
                  className="h-10 w-full rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-border pt-5">
              <Button
                type="submit"
                disabled={isSaving || isUploading}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
