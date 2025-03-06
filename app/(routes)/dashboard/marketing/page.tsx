import MarketingPageClient from "./_components/client";

const MarketingPage = () => {
  // Mock data for campaigns
  const campaigns = [
    {
      id: 1,
      name: "Q4 Outreach",
      status: "Scheduled",
      sent: 120,
      opens: 80,
      replies: 12,
      progress: 65,
    },
    {
      id: 2,
      name: "New Client Follow-Up",
      status: "Draft",
      sent: 0,
      opens: 0,
      replies: 0,
      progress: 0,
    },
    {
      id: 3,
      name: "Product Launch",
      status: "Sent",
      sent: 500,
      opens: 350,
      replies: 45,
      progress: 70,
    },
  ];
  // Mock data for templates
  const templates = [
    {
      id: 1,
      name: "Product Launch",
      description: "A template for announcing new products.",
    },
    {
      id: 2,
      name: "Follow-Up",
      description: "A template for following up with leads.",
    },
    {
      id: 3,
      name: "Networking",
      description: "A template for networking and introductions.",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <MarketingPageClient templates={templates} campaigns={campaigns} />
    </div>
  );
};

export default MarketingPage;
