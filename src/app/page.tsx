import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pizza, ChefHat, Truck, Clock, Star, MapPin, Phone } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <Pizza className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">Pizza Palace</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-red-500 hover:bg-red-600">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Hot & Fresh Pizza
            <span className="text-red-500"> Delivered</span> To You
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience the taste of authentic Italian pizza made with fresh ingredients 
            and delivered hot to your doorstep. Order now and get 20% off your first order!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/menu">
              <Button size="lg" className="bg-red-500 hover:bg-red-600 text-lg px-8">
                Order Now
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Pizza Palace?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <FeatureCard
              icon={<ChefHat className="w-8 h-8 text-red-500" />}
              title="Fresh Ingredients"
              description="We use only the freshest ingredients sourced daily from local suppliers."
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8 text-red-500" />}
              title="Fast Delivery"
              description="Hot pizza delivered to your door in 30 minutes or less guaranteed."
            />
            <FeatureCard
              icon={<Star className="w-8 h-8 text-red-500" />}
              title="Best Quality"
              description="Authentic Italian recipes passed down through generations."
            />
            <FeatureCard
              icon={<Truck className="w-8 h-8 text-red-500" />}
              title="Free Delivery"
              description="Free delivery on all orders over $25. No hidden fees!"
            />
          </div>
        </div>
      </section>

      {/* Popular Pizzas Section */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Popular Pizzas
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <PizzaCard
              name="Margherita Classic"
              description="Fresh mozzarella, tomato sauce, and basil on our signature crust."
              price="$14.99"
              image="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400"
            />
            <PizzaCard
              name="Pepperoni Feast"
              description="Loaded with premium pepperoni and mozzarella cheese."
              price="$16.99"
              image="https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400"
            />
            <PizzaCard
              name="Supreme Special"
              description="Pepperoni, mushrooms, onions, peppers, and olives."
              price="$18.99"
              image="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400"
            />
          </div>
          <div className="text-center mt-12">
            <Link href="/menu">
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Full Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 bg-red-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Order?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Create an account now and get 20% off your first order!
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <Pizza className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Pizza Palace</span>
            </div>
            <p className="text-gray-400">
              The best pizza in town, delivered fast and fresh.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/menu" className="hover:text-white">Menu</Link></li>
              <li><Link href="/login" className="hover:text-white">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-white">Register</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                123 Pizza Street, Food City
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                (555) 123-4567
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Hours</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Mon - Thu: 11am - 10pm</li>
              <li>Fri - Sat: 11am - 11pm</li>
              <li>Sun: 12pm - 9pm</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2026 Pizza Palace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-red-50 transition-colors">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PizzaCard({ name, description, price, image }: { name: string; description: string; price: string; image: string }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <div className="h-48 bg-gray-200 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{name}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-red-500">{price}</span>
          <Link href="/menu">
            <Button size="sm" className="bg-red-500 hover:bg-red-600">
              Order
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
