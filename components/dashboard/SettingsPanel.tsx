"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Shield, User as UserIcon, Bell, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { UserPlan } from "@/lib/database.types";

interface Props {
  user: User;
  plan: UserPlan;
}

export function SettingsPanel({ user, plan }: Props) {
  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account preferences.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserIcon className="w-4 h-4" /> Profile
          </CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14">
              <AvatarFallback className="bg-primary/20 text-primary text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{displayName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge className="mt-1 capitalize" variant="outline">{plan.plan} Plan</Badge>
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Display name</Label>
              <Input defaultValue={displayName} className="h-9" readOnly />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email address</Label>
              <Input defaultValue={user.email} className="h-9" readOnly />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            To update your profile, use Supabase Auth settings.
          </p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4" /> Security
          </CardTitle>
          <CardDescription>Authentication and session settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-xs text-muted-foreground">Last changed: N/A</p>
            </div>
            <Button variant="outline" size="sm">Change Password</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Not enabled</p>
            </div>
            <Button variant="outline" size="sm" disabled>Enable 2FA</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Active sessions</p>
              <p className="text-xs text-muted-foreground">1 active session</p>
            </div>
            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
              Revoke all
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" /> Notifications
          </CardTitle>
          <CardDescription>Manage alert preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "High-risk scan alerts", desc: "Get notified for threats above 70%" },
              { label: "Weekly summary", desc: "Weekly usage and detection report" },
              { label: "Low credit warnings", desc: "Alert when credits drop below 3" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Badge variant="outline" className="text-xs text-muted-foreground">Coming soon</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-red-600">
            <Shield className="w-4 h-4" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete all scan history</p>
              <p className="text-xs text-muted-foreground">Permanently removes all your scans</p>
            </div>
            <Button variant="outline" size="sm" className="text-red-500 border-red-500/30 hover:bg-red-500/10">
              Delete history
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete account</p>
              <p className="text-xs text-muted-foreground">This action cannot be undone</p>
            </div>
            <Button variant="outline" size="sm" className="text-red-500 border-red-500/30 hover:bg-red-500/10">
              Delete account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
