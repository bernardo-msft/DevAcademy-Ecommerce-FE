"use client";

import { useState, useEffect } from 'react';
import { updateCategory } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Category {
    id: string;
    name: string;
}

interface EditCategoryDialogProps {
  category: Category | null;
  onCategoryUpdated: () => void;
}

export function EditCategoryDialog({ category, onCategoryUpdated }: EditCategoryDialogProps) {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!category || !token) {
      toast.error("Cannot update category. Missing information.");
      return;
    }
    setIsLoading(true);
    try {
      await updateCategory(category.id, { name }, token);
      toast.success('Category updated successfully!');
      onCategoryUpdated();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update category.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!category) return null;

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogDescription>
          Update the category name.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}