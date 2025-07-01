"use client";

import { useState, useEffect } from 'react';
import { getCategories, updateProduct, getProductById } from '@/services/api';
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

interface Product {
    id: number;
    name: string;
}

interface Category {
  id: string;
  name: string;
}

interface EditProductDialogProps {
  product: Product | null;
  onProductUpdated: () => void;
}

const initialFormData = {
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    imageUrl: '',
};

export function EditProductDialog({ product, onProductUpdated }: EditProductDialogProps) {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (product && token) {
        setIsDataLoading(true);
        try {
          const [productDetails, categoriesData] = await Promise.all([
            getProductById(product.id.toString()),
            getCategories()
          ]);

          setCategories(categoriesData);
          setFormData({
            name: productDetails.name,
            description: productDetails.description,
            price: productDetails.price.toString(),
            stockQuantity: productDetails.stockQuantity.toString(),
            categoryId: productDetails.categoryId.toString(),
            imageUrl: productDetails.imageUrl,
          });

        } catch (error) {
          toast.error('Failed to fetch data for editing.');
        } finally {
          setIsDataLoading(false);
        }
      }
    };
    fetchInitialData();
  }, [product, token]);


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
    if (!product || !formData.categoryId || !token) {
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
      await updateProduct(product.id, productFormData, token);
      toast.success('Product updated successfully!');
      onProductUpdated();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update product.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) return null;

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogDescription>
          Update the details for &quot;{formData.name || product.name}&quot;.
        </DialogDescription>
      </DialogHeader>
      {isDataLoading ? (
        <div className="py-10 text-center">Loading form data...</div>
      ) : (
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
            {formData.imageUrl && !imageFile && <img src={formData.imageUrl} alt="Current product" className="w-20 h-20 object-cover rounded-md my-2" />}
            <Input id="imageFile" name="imageFile" type="file" accept="image/*" onChange={handleFileChange} />
            <p className="text-sm text-muted-foreground">Leave blank to keep the current image.</p>
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
              <SelectTrigger id="category" disabled={isDataLoading}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
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
            <Button type="submit" disabled={isLoading || isDataLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      )}
    </DialogContent>
  );
}