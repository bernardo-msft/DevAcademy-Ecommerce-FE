"use client";

import { useState, useEffect } from 'react';
import { getCategories, createProduct } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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

interface AddProductDialogProps {
  onProductAdded: () => void;
}

const initialFormData = {
  name: '',
  description: '',
  price: '',
  stockQuantity: '',
  categoryId: '',
};

export function AddProductDialog({ onProductAdded }: AddProductDialogProps) {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        toast.error('Failed to fetch categories.');
      } finally {
        setIsCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.categoryId || !token) {
      toast.error(!token ? "Authentication error." : "Please select a category.");
      return;
    }
    setIsLoading(true);
    
    const productFormData = new FormData();
    productFormData.append('name', formData.name);
    productFormData.append('description', formData.description);
    productFormData.append('price', formData.price);
    productFormData.append('stockQuantity', formData.stockQuantity);
    productFormData.append('categoryId', formData.categoryId);
    if (imageFile) {
      productFormData.append('imageFile', imageFile);
    }

    try {
      await createProduct(productFormData, token);
      toast.success('Product added successfully!');
      onProductAdded(); // Refresh the product list in the parent component
      setFormData(initialFormData); // Reset form data
      setImageFile(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add product.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogDescription>
          Fill out the form to add a new product to your store.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="imageFile">Product Image</Label>
            <Input id="imageFile" name="imageFile" type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stockQuantity">Stock Quantity</Label>
            <Input id="stockQuantity" name="stockQuantity" type="number" value={formData.stockQuantity} onChange={handleChange} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select onValueChange={handleCategoryChange} value={formData.categoryId} required>
            <SelectTrigger id="category" disabled={isCategoriesLoading}>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Product'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}