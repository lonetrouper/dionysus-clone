import { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-3xl mx-auto p-8 text-gray-200 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <p className="text-gray-400 mb-10">
        Got a question, feedback, or just want to say hi? Fill out the form below or email us directly at{" "}
        <a href="mailto:support@byteblaze.dev" className="text-indigo-400 underline">
          support@byteblaze.dev
        </a>.
      </p>

      {!submitted ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm mb-1" htmlFor="name">
              Name
            </label>
            <input
              required
              type="text"
              id="name"
              name="name"
              className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="email">
              Email
            </label>
            <input
              required
              type="email"
              id="email"
              name="email"
              className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="message">
              Message
            </label>
            <textarea
              required
              id="message"
              name="message"
              rows={5}
              className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white"
            />
          </div>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 transition px-6 py-3 rounded text-white font-medium"
          >
            Send Message
          </button>
        </form>
      ) : (
        <div className="text-green-400 font-semibold">
          ✅ Thanks! We'll get back to you shortly.
        </div>
      )}
    </div>
  );
}
