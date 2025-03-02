// app/page.jsx

import { ArrowRight, Mail, Check, Zap, Shield, Star } from "lucide-react";
import Header from "./header";
import Faq from "./faq";
import FramerDashboardShow from "./framer-dash-show";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-blue-600">Cold Email</span> That Actually
                Gets Responses
              </h1>
              <p className="mt-6 text-xl text-gray-600">
                Automate your outreach with personalized, high-converting email
                sequences that get opened, read, and replied to.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row">
                <a
                  href="/signup"
                  className="bg-blue-600 text-white font-medium rounded-lg px-8 py-4 text-center hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                  Start Your Free Trial
                </a>
                <a
                  href="#demo"
                  className="mt-4 sm:mt-0 sm:ml-4 text-blue-600 font-medium rounded-lg px-8 py-4 text-center border border-blue-600 hover:bg-blue-50 transition-all"
                >
                  Watch Demo
                </a>
              </div>
              <div className="mt-8 flex items-center">
                <div className="flex -space-x-2">
                  <img
                    src="/api/placeholder/40/40"
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                  <img
                    src="/api/placeholder/40/40"
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                  <img
                    src="/api/placeholder/40/40"
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                </div>
                <p className="ml-4 text-sm text-gray-600">
                  Trusted by <span className="font-medium">2,500+</span> sales
                  teams worldwide
                </p>
              </div>
            </div>
            <FramerDashboardShow />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">
              Powerful Features to Boost Your Outreach
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to scale your cold email campaigns and
              increase your response rates.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Mail className="h-8 w-8 text-blue-600" />,
                title: "Personalized Sequences",
                description:
                  "Create dynamic email sequences that adapt based on prospect behavior and engagement.",
              },
              {
                icon: <Zap className="h-8 w-8 text-blue-600" />,
                title: "AI-Powered Templates",
                description:
                  "Generate high-converting email templates with our built-in AI writing assistant.",
              },
              {
                icon: <Shield className="h-8 w-8 text-blue-600" />,
                title: "Deliverability Protection",
                description:
                  "Built-in warm-up and monitoring to ensure your emails reach the inbox, not spam.",
              },
              {
                icon: <Star className="h-8 w-8 text-blue-600" />,
                title: "Smart Scheduling",
                description:
                  "Send emails at the perfect time for each recipient based on their time zone and behavior.",
              },
              {
                icon: <Check className="h-8 w-8 text-blue-600" />,
                title: "Performance Analytics",
                description:
                  "Track open rates, click rates, and responses with detailed analytics and A/B testing.",
              },
              {
                icon: <ArrowRight className="h-8 w-8 text-blue-600" />,
                title: "CRM Integration",
                description:
                  "Seamless integration with Salesforce, HubSpot, Pipedrive and other popular CRMs.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-all bg-gray-50 hover:bg-white"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-70">
            {[
              "Company A",
              "Company B",
              "Company C",
              "Company D",
              "Company E",
            ].map((company, index) => (
              <div
                key={index}
                className="text-xl md:text-2xl font-bold text-gray-400"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">How ColdConnect Works</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              From setup to results in just three simple steps
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Import Your Prospects",
                description:
                  "Upload your contact list or connect your CRM to import prospects automatically.",
              },
              {
                step: "02",
                title: "Create Your Sequence",
                description:
                  "Build your email sequence with our templates or use AI to generate personalized messages.",
              },
              {
                step: "03",
                title: "Analyze & Optimize",
                description:
                  "Track performance metrics and optimize your campaigns for better results.",
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="absolute -top-4 -left-4 bg-blue-100 text-blue-600 font-bold text-lg rounded-full w-12 h-12 flex items-center justify-center">
                  {step.step}
                </div>
                <div className="p-6 pt-10 border border-gray-200 rounded-lg hover:shadow-md transition-all h-full bg-gray-50 hover:bg-white">
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">What Our Customers Say</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              See how ColdConnect is helping sales teams exceed their targets
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "ColdConnect has increased our response rates by 43% and helped us close deals faster than ever before.",
                name: "Sarah Johnson",
                role: "Sales Director, TechCorp",
              },
              {
                quote:
                  "The AI templates are incredible. We're saving hours every week while sending more personalized messages.",
                name: "Michael Rodriguez",
                role: "Business Development, GrowthX",
              },
              {
                quote:
                  "After switching to ColdConnect, our emails finally started landing in the inbox instead of spam. Game changer!",
                name: "Jennifer Lee",
                role: "Outbound Sales Manager, SaaS Inc.",
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-md">
                <div className="text-blue-600 text-4xl">"</div>
                <p className="mt-2 text-gray-600">{testimonial.quote}</p>
                <div className="mt-6 flex items-center">
                  <img
                    src="/api/placeholder/50/50"
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="ml-4">
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your needs. All plans include a 14-day
              free trial.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                plan: "Starter",
                price: "$49",
                features: [
                  "1 user",
                  "500 emails/month",
                  "Basic templates",
                  "Email tracking",
                  "Basic analytics",
                ],
              },
              {
                plan: "Professional",
                price: "$99",
                popular: true,
                features: [
                  "3 users",
                  "2,000 emails/month",
                  "AI template generator",
                  "Advanced sequences",
                  "A/B testing",
                  "CRM integration",
                ],
              },
              {
                plan: "Enterprise",
                price: "$199",
                features: [
                  "Unlimited users",
                  "10,000 emails/month",
                  "Priority deliverability",
                  "Custom workflows",
                  "Dedicated support",
                  "API access",
                ],
              },
            ].map((pricing, index) => (
              <div
                key={index}
                className={`border rounded-lg p-8 ${
                  pricing.popular
                    ? "border-blue-600 shadow-md ring-2 ring-blue-600 relative"
                    : "border-gray-200"
                }`}
              >
                {pricing.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold">{pricing.plan}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold">{pricing.price}</span>
                  <span className="ml-1 text-gray-600">/month</span>
                </div>
                <ul className="mt-6 space-y-4">
                  {pricing.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-5 w-5 text-blue-600 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <a
                    href="/signup"
                    className={`w-full block text-center py-3 rounded-lg font-medium ${
                      pricing.popular
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-blue-600 text-blue-600 hover:bg-blue-50"
                    } transition-colors`}
                  >
                    Start Free Trial
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <Faq />

      {/* CTA */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Boost Your Response Rates?
          </h2>
          <p className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto">
            Join thousands of sales professionals who are exceeding their
            targets with ColdConnect.
          </p>
          <div className="mt-10">
            <a
              href="/signup"
              className="bg-white text-blue-600 font-medium rounded-lg px-8 py-4 text-lg hover:bg-blue-50 transition-colors shadow-md"
            >
              Start Your Free Trial
            </a>
            <p className="mt-4 text-blue-100">
              No credit card required. 14-day free trial.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Guides
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Partners
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    GDPR
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <Mail className="h-6 w-6 text-blue-500" />
              <span className="ml-2 text-white font-bold">ColdConnect</span>
            </div>
            <p className="mt-4 md:mt-0">
              © {new Date().getFullYear()} ColdConnect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
