import { User } from "lucide-react";

interface SettingsHeaderProps {
  username?: string;
  email?: string;
}

export function SettingsHeader({ username, email }: SettingsHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account security and preferences
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{username || email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}