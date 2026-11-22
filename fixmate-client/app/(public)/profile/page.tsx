"use client";

import { useEffect, useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import {
  getAuthToken,
  getAuthUser,
  setAuthSession,
  type AuthUser,
} from "@/lib/auth-session";

export default function ProfilePage() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [bio, setBio] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) {
      router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    const currentUser = getAuthUser();
    if (!currentUser) {
      router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    setUser(currentUser);
    setName(currentUser.name ?? "");
    setPhone(currentUser.phone ?? "");
    setArea(currentUser.area ?? "");
    setBio(currentUser.bio ?? "");
    setIsReady(true);
  }, [pathname, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const updatedUser = await api.patch<AuthUser>("/api/users/profile", {
        name,
        phone,
        area,
        bio,
      });
      const mergedUser: AuthUser = {
        ...user,
        name: updatedUser.name ?? name,
        phone: updatedUser.phone ?? phone,
        area: updatedUser.area ?? area,
        bio: updatedUser.bio ?? bio,
        image: updatedUser.image ?? user?.image,
      };
      setAuthSession(getAuthToken(), mergedUser);
      setUser(mergedUser);
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update your profile.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">Update Profile</h1>
        {isReady ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Profile details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="profile-name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <input
                    id="profile-name"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="profile-email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={user?.email ?? ""}
                    readOnly
                    className="h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="profile-phone" className="text-sm font-medium">
                    Phone
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="profile-area" className="text-sm font-medium">
                    Area
                  </label>
                  <input
                    id="profile-area"
                    value={area}
                    onChange={(event) => setArea(event.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="profile-bio" className="text-sm font-medium">
                    Bio
                  </label>
                  <textarea
                    id="profile-bio"
                    rows={4}
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground" role="status">
            Checking your account...
          </p>
        )}
      </div>
    </main>
  );
}
