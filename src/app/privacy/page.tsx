import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Oak Structures",
  description: "Privacy Policy for Oak Structures website",
};

// Company information
const companyInfo = {
  name: "MC CONVERSIONS LTD",
  email: "luke@mcconversions.uk",
  phone: "07494415834",
  address: "Pantycrai, Adfa, Newtown, Powys, sy163bx, United Kingdom"
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto prose prose-lg">
        <h1 className="text-3xl font-bold mb-6">PRIVACY POLICY</h1>
        <p className="text-gray-600 mb-8">Last updated May 24, 2025</p>
        
        <div className="mb-8">
          <p>
            This Privacy Notice for {companyInfo.name} ('we', 'us', or 'our'), describes how and why we might access, collect, store, use, and/or share ('process') your personal information when you use our services ('Services'), including when you:
          </p>
          <ul className="list-disc pl-6 my-4">
            <li>Visit our website, or any website of ours that links to this Privacy Notice</li>
            <li>Download and use our mobile application (Solidoakstructures), or any other application of ours that links to this Privacy Notice</li>
            <li>Engage with us in other related ways, including any sales, marketing, or events</li>
          </ul>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">SUMMARY OF KEY POINTS</h2>
          <p><strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use.</p>
          <p className="my-2"><strong>Do we process any sensitive personal information?</strong> We do not process sensitive personal information.</p>
          <p className="my-2"><strong>Do we collect any information from third parties?</strong> We do not collect any information from third parties.</p>
          <p className="my-2"><strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.</p>
          <p className="my-2"><strong>In what situations and with which parties do we share personal information?</strong> We may share information in specific situations and with specific third parties.</p>
          <p className="my-2"><strong>How do we keep your information safe?</strong> We have adequate organizational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure.</p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">WHAT INFORMATION DO WE COLLECT?</h2>
          <h3 className="text-xl font-semibold mb-2">Personal information you disclose to us</h3>
          <p><em><strong>In Short:</strong> We collect personal information that you provide to us.</em></p>
          <p className="my-2">
            We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
          </p>
          <p className="my-2">
            <strong>Personal Information Provided by You.</strong> The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:
          </p>
          <ul className="list-disc pl-6 my-4">
            <li>Names</li>
            <li>Phone numbers</li>
            <li>Email addresses</li>
            <li>Mailing addresses</li>
            <li>Usernames</li>
            <li>Passwords</li>
            <li>Contact preferences</li>
            <li>Billing addresses</li>
            <li>Debit/credit card numbers</li>
            <li>Contact or authentication data</li>
          </ul>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">HOW DO WE PROCESS YOUR INFORMATION?</h2>
          <p>
            <em><strong>In Short:</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</em>
          </p>
          <p className="my-2">
            We process your personal information for a variety of reasons, depending on how you interact with our Services, including:
          </p>
          <ul className="list-disc pl-6 my-4">
            <li>To facilitate account creation and authentication and otherwise manage user accounts</li>
            <li>To deliver and facilitate delivery of services to the user</li>
            <li>To respond to user inquiries/offer support to users</li>
            <li>To send administrative information to you</li>
            <li>To fulfill and manage your orders</li>
            <li>To enable user-to-user communications</li>
            <li>To manage user accounts</li>
          </ul>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">CONTACT US</h2>
          <p>If you have questions or comments about this notice, you may email us at {companyInfo.email} or contact us by post at:</p>
          <address className="not-italic my-4">
            {companyInfo.name}<br />
            {companyInfo.address}<br />
            Phone: {companyInfo.phone}
          </address>
        </div>
      </div>
    </div>
  );
}
