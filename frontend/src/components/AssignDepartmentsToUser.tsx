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
import { useDepartments } from "@/lib/departments-context";
import type { SystemUser } from "@/lib/users-context";

interface AssignDepartmentsToUserProps {
  user: SystemUser;
  onAssign: (userId: string, departmentIds: string[]) => Promise<void>;
}

export function AssignDepartmentsToUser({ user, onAssign }: AssignDepartmentsToUserProps) {
  const { departments } = useDepartments();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setSelected(user.departmentIds);
  }, [open, user.departmentIds]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onAssign(user.id, selected);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Departments
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Departments for {user.email}</DialogTitle>
          <DialogDescription>Select one or more departments (e.g. IT + Finance for u3).</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {departments.map((dept) => (
            <div key={dept.id} className="flex items-center space-x-2">
              <Checkbox
                id={`dept-${user.id}-${dept.id}`}
                checked={selected.includes(dept.id)}
                onCheckedChange={() => toggle(dept.id)}
              />
              <Label htmlFor={`dept-${user.id}-${dept.id}`} className="cursor-pointer">
                {dept.name}
              </Label>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
