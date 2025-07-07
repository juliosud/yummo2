import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  QrCode,
  Smartphone,
  ChefHat,
  Clock,
  Star,
  Users,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                yummo.ai
              </span>
            </div>
            <Button
              onClick={handleLoginClick}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Transform Your
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Restaurant Experience
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Enable contactless dining with QR code menus, seamless ordering,
              and real-time kitchen management. Delight your customers while
              streamlining operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleLoginClick}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 rounded-full text-lg font-semibold border-2 hover:bg-gray-50"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-100 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-100 rounded-full opacity-60 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-100 rounded-full opacity-60 animate-pulse delay-500"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Modern Dining
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From QR code menus to kitchen management, we've got your
              restaurant covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  QR Code Menus
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Customers scan QR codes at their table to instantly access
                  your digital menu with beautiful photos and descriptions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Mobile Ordering
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Seamless mobile experience allows customers to browse,
                  customize, and place orders directly from their phones.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Kitchen Dashboard
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Real-time order management system helps your kitchen staff
                  track, prepare, and complete orders efficiently.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Real-time Updates
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Customers receive live updates on their order status, from
                  preparation to ready for pickup.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Menu Management
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Easy-to-use interface for updating menu items, prices, photos,
                  and availability in real-time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Table Management
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Organize tables, generate unique QR codes, and track customer
                  sessions with our intuitive table management system.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Why Choose yummo.ai?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Increase Efficiency
                    </h3>
                    <p className="text-gray-600">
                      Reduce wait times and streamline operations with automated
                      order processing and kitchen notifications.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Enhance Customer Experience
                    </h3>
                    <p className="text-gray-600">
                      Provide a modern, contactless dining experience that
                      customers love and remember.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Reduce Costs
                    </h3>
                    <p className="text-gray-600">
                      Cut printing costs and reduce staff workload with digital
                      menus and automated order management.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Real-time Analytics
                    </h3>
                    <p className="text-gray-600">
                      Get insights into popular dishes, peak hours, and customer
                      preferences with built-in analytics.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 text-white">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <QrCode className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    Ready to Get Started?
                  </h3>
                  <p className="text-blue-100 mb-6">
                    Join hundreds of restaurants already using yummo.ai to
                    transform their dining experience.
                  </p>
                  <Button
                    onClick={handleLoginClick}
                    className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold transition-all duration-200"
                  >
                    Start Your Free Trial
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                yummo.ai
              </span>
            </div>
            <p className="text-gray-400 mb-6">
              Transforming restaurants with smart QR menu technology
            </p>
            <div className="flex justify-center space-x-8 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Contact Us
              </a>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-gray-400 text-sm">
              © 2024 yummo.ai. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
