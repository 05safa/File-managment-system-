import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUsers } from "@/lib/users-context";
import { Department } from "@/lib/departments-context";

interface AssignUsersToDeptProps {
  department: Department;
  onAssign: (dept: Department, userIds: string[]) => Promise<void>;
}

export function AssignUsersToDept({ department, onAssign }: AssignUsersToDeptProps) {
  const [open, setOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { users } = useUsers();

  useEffect(() => {
    if (open) {
      setSelectedUsers(users.filter((u) => u.departmentIds.includes(department.id)).map((u) => u.id));
    }
  }, [open, department.id, users]);

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAssign = async () => {
    setLoading(true);
    try {
      await onAssign(department, selectedUsers);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Assign Users
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Users to {department.name}</DialogTitle>
          <DialogDescription>
            Selected users will include this department (existing departments are kept).
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center space-x-2">
                <Checkbox
                  id={user.id}
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={() => handleToggleUser(user.id)}
                />
                <Label htmlFor={user.id} className="flex flex-col cursor-pointer flex-1">
                  <span className="font-medium">{user.email}</span>
                  <span className="text-xs text-muted-foreground">
                    {user.departmentIds.length} dept(s)
                  </span>
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={loading}>
            {loading ? "Saving…" : `Save (${selectedUsers.length})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
