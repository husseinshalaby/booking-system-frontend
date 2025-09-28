import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  IconStar,
  IconUsers,
  IconMapPin,
  IconPhone,
  IconMail,
  IconArrowRight,
  IconShield,
  IconClock,
  IconTrendingUp
} from '@tabler/icons-react'
import { countries } from '@/config/locations'
import { professions } from '@/config/professions'

const testimonials = [
  {
    name: 'Sarah Johnson',
    location: 'London, UK',
    rating: 5,
    comment: 'Adam connected me with an amazing painter! The service was professional and the quality exceeded my expectations.',
    profession: 'painter'
  },
  {
    name: 'Mike Chen',
    location: 'Berlin, DE',
    rating: 5,
    comment: 'Quick booking process through Adam\'s platform and excellent electrician. Highly recommend!',
    profession: 'electrician'
  },
  {
    name: 'Emma Wilson',
    location: 'Dublin, IE',
    rating: 5,
    comment: 'Best cleaning service I\'ve ever found through Adam\'s network. Reliable and thorough.',
    profession: 'cleaner'
  }
]

const features = [
  {
    icon: IconShield,
    title: 'Verified Professionals',
    description: 'All service providers are thoroughly vetted and background-checked'
  },
  {
    icon: IconClock,
    title: 'Fast Booking',
    description: 'Book services in minutes with instant confirmation'
  },
  {
    icon: IconTrendingUp,
    title: 'Quality Guaranteed',
    description: 'Satisfaction guaranteed or your money back'
  }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="border-b bg-white/95 backdrop-blur-sm dark:bg-gray-900/95 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Image 
                src="/faviconV2.png" 
                alt="Adam's Services Logo" 
                width={40} 
                height={40} 
                className="rounded-lg shadow-sm"
              />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Adam
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400">Professional Network</div>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#services" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">Services</a>
            <a href="#locations" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">Locations</a>
            <a href="#testimonials" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">Reviews</a>
            <a href="#contact" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">Contact</a>
          </nav>
          <div className="flex space-x-3">
            <Link href="partners/register">
              <Button variant="outline" size="sm" className="hidden sm:flex">Become a Partner</Button>
            </Link>
            <Link href="/customers/signup">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Book Service
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
        <div className="container mx-auto text-center relative">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-800 dark:text-blue-200 text-sm font-medium mb-8">
            <IconStar className="w-4 h-4 mr-2" />
            Trusted by 50,000+ customers across Europe
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Connect with
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Trusted Professionals
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Adam's curated network of certified painters, electricians, plumbers, and more. 
            Premium quality services with transparent pricing across 12 European countries.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/customers/book-service">
              <Button size="lg" className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <IconUsers className="mr-2 h-5 w-5" />
                Find a Professional
                <IconArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/partners/register">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300">
                <IconStar className="mr-2 h-5 w-5" />
                Join Our Network
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { number: '25,000+', label: 'Verified Professionals', icon: IconUsers },
              { number: '100,000+', label: 'Completed Projects', icon: IconTrendingUp },
              { number: '4.9★', label: 'Average Rating', icon: IconStar }
            ].map((stat, index) => (
              <Card key={index} className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Adam's Network?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Premium quality assurance and seamless experience guaranteed
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Professional Services</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Expert craftsmen and specialists across all major service categories
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {professions.map((profession, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white dark:bg-gray-800 h-full">
                <CardHeader className="text-center pb-3">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-inner">
                    <profession.icon className="h-10 w-10 text-blue-600 dark:text-blue-400 stroke-[1.5]" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    {profession.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center flex-1 flex flex-col">
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4 flex-1">
                    {profession.description}
                  </CardDescription>
                  <Link href="/customers/book-service" className="mt-auto">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white group-hover:border-transparent transition-all duration-300 font-medium"
                    >
                      Book {profession.label}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="locations" className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Available Across Europe</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Adam's professional network spans 12 countries with local experts in major cities
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {countries.slice(0, 8).map((country, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{country.flag}</div>
                  <CardTitle className="text-lg">{country.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {country.cities.slice(0, 4).map((city, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <IconMapPin className="h-3 w-3 mr-2 text-blue-600 flex-shrink-0" />
                        <span className="truncate">{city.label}</span>
                      </div>
                    ))}
                    {country.cities.length > 4 && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        +{country.cities.length - 4} more cities
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Don't see your location? We're expanding rapidly!
            </p>
            <Link href="/partners/register">
              <Button variant="outline" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                Request New Location
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Customer Success Stories</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Real experiences from customers who found their perfect professional through Adam
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <IconStar key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription className="flex items-center text-gray-600 dark:text-gray-300">
                    <IconMapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    {testimonial.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic">
                    &ldquo;{testimonial.comment}&rdquo;
                  </p>
                  <div className="mt-4 inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm text-blue-800 dark:text-blue-200">
                    {professions.find(p => p.value === testimonial.profession)?.label || 'Service'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-gray-900 text-white py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <Image 
                  src="/faviconV2.png" 
                  alt="Adam's Services Logo" 
                  width={32} 
                  height={32} 
                  className="rounded-lg"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Adam's Services
                </span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
                Connecting you with Europe's finest professionals for all your home and office needs. 
                Quality guaranteed, trust verified.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <IconPhone className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-400">+44 20 7946 0958</span>
                </div>
                <div className="flex items-center space-x-3">
                  <IconMail className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-400">hello@adamsservices.eu</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">For Customers</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/customers/book-service" className="hover:text-white transition-colors">Book Service</Link></li>
                <li><Link href="/customers/mybookings" className="hover:text-white transition-colors">My Bookings</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Customer Login</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">For Professionals</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/partners/register" className="hover:text-white transition-colors">Join Network</Link></li>
                <li><Link href="/partners/availability" className="hover:text-white transition-colors">Manage Availability</Link></li>
                <li><Link href="/partners/bookings" className="hover:text-white transition-colors">View Bookings</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Partner Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-16 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Adam. All rights reserved. | Connecting Europe's finest professionals.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}