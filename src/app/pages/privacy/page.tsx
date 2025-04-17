export default function PrivacyPolicy() {
    return (
      <div className="max-w-4xl mx-auto p-8 text-gray-200 bg-gray-900 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="mb-4 text-gray-400">
          Effective Date: April 15, 2025
        </p>
  
        <p className="mb-6 text-gray-400">
          Byteblaze ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and disclose your information when you use our service.
        </p>
  
        <h2 className="text-2xl font-semibold mt-10 mb-4">1. Information We Collect</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-400">
          <li>Personal information (e.g., name, email address) when you sign up or contact us.</li>
          <li>Usage data (e.g., pages visited, queries made in the app) for improving our services.</li>
          <li>Technical data such as IP address, device info, and browser type.</li>
        </ul>
  
        <h2 className="text-2xl font-semibold mt-10 mb-4">2. How We Use Your Information</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-400">
          <li>To provide and improve the Byteblaze platform.</li>
          <li>To personalize your experience.</li>
          <li>To respond to your queries and support requests.</li>
          <li>To analyze usage and optimize performance.</li>
        </ul>
  
        <h2 className="text-2xl font-semibold mt-10 mb-4">3. Payments</h2>
        <p className="text-gray-400 mb-4">
          We use Razorpay to process payments. Razorpay may collect and store payment information in accordance with their{" "}
          <a
            href="https://razorpay.com/privacy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 underline"
          >
            Privacy Policy
          </a>.
        </p>
  
        <h2 className="text-2xl font-semibold mt-10 mb-4">4. Data Sharing</h2>
        <p className="text-gray-400 mb-4">
          We do not sell your personal information. We may share it with trusted service providers who assist in operating our service, subject to strict confidentiality.
        </p>
  
        <h2 className="text-2xl font-semibold mt-10 mb-4">5. Data Retention</h2>
        <p className="text-gray-400 mb-4">
          We retain your information as long as necessary to provide services and comply with legal obligations.
        </p>
  
        <h2 className="text-2xl font-semibold mt-10 mb-4">6. Your Rights</h2>
        <p className="text-gray-400 mb-4">
          You have the right to access, correct, or delete your personal data. Contact us at support@byteblaze.dev for requests.
        </p>
  
        <h2 className="text-2xl font-semibold mt-10 mb-4">7. Changes to This Policy</h2>
        <p className="text-gray-400 mb-4">
          We may update this Privacy Policy from time to time. Any changes will be posted on this page.
        </p>
  
        <h2 className="text-2xl font-semibold mt-10 mb-4">8. Contact Us</h2>
        <p className="text-gray-400 mb-4">
          If you have any questions, contact us at <a href="mailto:support@byteblaze.dev" className="underline text-indigo-400">support@byteblaze.dev</a>.
        </p>
      </div>
    );
  }

