import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, ShoppingCart, Truck, Award } from "lucide-react";

export default function Home() {
  const featuredProducts = [
    {
      name: "Smart Watch",
      price: "$299",
      image: "https://placehold.co/400x300/E5E7EB/4B5563?text=Smart+Watch",
    },
    {
      name: "Wireless Earbuds",
      price: "$149",
      image: "https://placehold.co/400x300/D1D5DB/374151?text=Earbuds",
    },
    {
      name: "VR Headset",
      price: "$499",
      image: "https://placehold.co/400x300/9CA3AF/1F2937?text=VR+Headset",
    },
  ];

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="w-full pt-24 md:pt-32 lg:pt-40 border-y">
        <div className="px-4 md:px-6 space-y-10 xl:space-y-16">
          <div className="grid max-w-[1300px] mx-auto gap-4 px-4 sm:px-6 md:px-10 md:grid-cols-2 md:gap-16">
            <div>
              <h1 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]">
                Discover the Future of Tech
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                Explore our curated collection of cutting-edge gadgets and
                accessories designed to elevate your lifestyle.
              </p>
              <div className="space-x-4 mt-6">
                <Link href="/products">
                  <Button size="lg">
                    Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="https://placehold.co/600x400/?text=Hero+Product"
                alt="Hero Product"
                className="w-full max-w-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-10">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-60 object-cover rounded-md mb-4"
                  />
                  <h3 className="text-xl font-semibold">{product.name}</h3>
                  <p className="text-lg text-muted-foreground mt-1">
                    {product.price}
                  </p>
                  <Button className="w-full mt-4">
                    <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Why MyStore?
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              We offer the best products with a focus on quality, speed, and
              customer satisfaction.
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-2">
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="flex flex-col items-center gap-2">
                <Truck className="h-8 w-8" />
                <p className="font-semibold">Fast Shipping</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Award className="h-8 w-8" />
                <p className="font-semibold">Premium Quality</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <ShoppingCart className="h-8 w-8" />
                <p className="font-semibold">Huge Selection</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Stay Updated
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Subscribe to our newsletter to get the latest news on our
              products and promotions.
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-2">
            <form className="flex space-x-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="max-w-lg flex-1"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}