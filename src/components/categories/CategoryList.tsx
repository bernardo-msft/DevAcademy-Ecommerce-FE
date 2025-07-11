"use client";

import { useState, useEffect } from 'react';
import { getCategories } from '@/services/api';
import { Button } from '@/components/ui/button';

interface Category {
  id: number;
  name: string;
}

interface CategoryListProps {
    onSelectCategory: (categoryId: number | null) => void;
    selectedCategoryId: number | null;
}

export function CategoryList({ onSelectCategory, selectedCategoryId }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch categories.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return <div>Loading categories...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="mb-8">
      <div className="flex flex-wrap justify-center gap-4">
        <Button
          variant={selectedCategoryId === null ? "default" : "outline"}
          onClick={() => onSelectCategory(null)}
          className="px-8 py-3 text-lg hover:cursor-pointer"
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategoryId === category.id ? "default" : "outline"}
            onClick={() => onSelectCategory(category.id)}
            className="px-8 py-3 text-lg hover:cursor-pointer"
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
}