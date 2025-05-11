import React from "react";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export default function Settings() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: "Jane Doe",
      email: "jane.doe@example.com",
      bio: "Radiologist at RadGlobal",
      notifications: true,
      marketing: false,
      password: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onSubmit = (data: any) => {
    // Mock submit handler
    alert("Settings saved!\n" + JSON.stringify(data, null, 2));
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-2 md:px-0 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-center gap-6">
              <Avatar>
                <AvatarImage src="/avatar-placeholder.png" alt="User avatar" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name", { required: true })} className="mt-1" />
                {errors.name && <span className="text-xs text-red-600">Name is required</span>}
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email", { required: true })} className="mt-1" />
              {errors.email && <span className="text-xs text-red-600">Email is required</span>}
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" {...register("bio")} className="mt-1" />
            </div>
            <Button type="submit" disabled={isSubmitting} className="mt-2">Save Profile</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Change your account password.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label htmlFor="password">Current Password</Label>
              <Input id="password" type="password" {...register("password")} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" {...register("newPassword")} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" {...register("confirmPassword")} className="mt-1" />
            </div>
            <Button type="submit" variant="secondary" disabled={isSubmitting}>Update Password</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Manage your notification and marketing preferences.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Email Notifications</Label>
                <div className="text-xs text-muted-foreground">Receive updates about appointments and reports.</div>
              </div>
              <Switch id="notifications" {...register("notifications")} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing">Marketing Emails</Label>
                <div className="text-xs text-muted-foreground">Get product news and feature updates.</div>
              </div>
              <Switch id="marketing" {...register("marketing")} />
            </div>
            <Button type="submit" variant="outline" disabled={isSubmitting}>Save Preferences</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
