"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const Faq = () => {
  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (index: any) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };
  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          <p className="mt-4 text-xl text-gray-600">
            Everything you need to know about ColdConnect
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {[
            {
              question: "How does the 14-day free trial work?",
              answer:
                "You can sign up for any plan and use all features for 14 days without being charged. No credit card required to start. Cancel anytime during the trial period.",
            },
            {
              question: "Will my emails be marked as spam?",
              answer:
                "ColdConnect includes built-in deliverability protection with email warm-up, spam testing, and best practices to ensure your emails reach the inbox.",
            },
            {
              question: "Can I integrate with my existing CRM?",
              answer:
                "Yes, ColdConnect integrates with popular CRMs including Salesforce, HubSpot, Pipedrive, and more. We also offer API access for custom integrations.",
            },
            {
              question: "Do you provide email templates?",
              answer:
                "Yes, all plans include access to our template library. Professional and Enterprise plans include our AI template generator for creating personalized messages.",
            },
            {
              question: "What happens if I exceed my monthly email limit?",
              answer:
                "You can purchase additional email credits as needed, or upgrade to a higher plan if you consistently need more capacity.",
            },
          ].map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg bg-white"
            >
              <button
                className="flex justify-between items-center w-full px-6 py-4 text-left focus:outline-none"
                onClick={() => toggleAccordion(index)}
              >
                <span className="font-medium">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-500 transition-transform ${
                    activeAccordion === index ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              {activeAccordion === index && (
                <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
