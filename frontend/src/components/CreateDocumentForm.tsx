import { useState, type FormEvent } from "react";
import { useDocuments } from "@/lib/documents-context";
import { useDepartments } from "@/lib/departments-context";
import { useCategories } from "@/lib/categories-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateDocumentFormProps {
  onCreated: () => void;
  onCancel: () => void;
}

export function CreateDocumentForm({ onCreated, onCancel }: CreateDocumentFormProps) {
  const { addDocument } = useDocuments();
  const { departments } = useDepartments();
  const { categories } = useCategories();
  const { user, isAdmin } = useAuth();

  const availableDepartments = isAdmin
    ? departments
    : departments.filter((d) => user?.departmentIds.includes(d.id));

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState(availableDepartments[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!departmentId) {
      setError("Select a department");
      return;
    }

    const category = categories.find((c) => c.id === categoryId);

    setIsSubmitting(true);
    setError("");

    try {
      await addDocument(
        title.trim(),
        description.trim(),
        departmentId,
        categoryId || undefined,
        category?.name,
        file ?? undefined
      );
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create document.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-lg">Create New Document</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <label htmlFor="doc-title" className="text-sm font-medium text-foreground">
              Title
            </label>
            <Input
              id="doc-title"
              placeholder="Document title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="doc-desc" className="text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              id="doc-desc"
              placeholder="Brief description…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Department</label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {availableDepartments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Category</label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category (optional)" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="doc-file" className="text-sm font-medium text-foreground">
              PDF file
            </label>
            <Input
              id="doc-file"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
