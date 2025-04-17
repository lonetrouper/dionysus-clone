"use client";
import { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-gray-900 p-8 text-gray-200">
      <h1 className="mb-6 text-3xl font-bold">Contact Us</h1>
      <p className="mb-10 text-gray-400">
        Got a question, feedback, or just want to say hi? Fill out the form
        below or email us directly at{" "}
        <a
          href="mailto:support@byteblaze.dev"
          className="text-indigo-400 underline"
        >
          support@byteblaze.dev
        </a>
        .
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
            <label className="mb-1 block text-sm" htmlFor="name">
              Name
            </label>
            <input
              required
              type="text"
              id="name"
              name="name"
              className="w-full rounded border border-gray-700 bg-gray-800 p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm" htmlFor="email">
              Email
            </label>
            <input
              required
              type="email"
              id="email"
              name="email"
              className="w-full rounded border border-gray-700 bg-gray-800 p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm" htmlFor="message">
              Message
            </label>
            <textarea
              required
              id="message"
              name="message"
              rows={5}
              className="w-full rounded border border-gray-700 bg-gray-800 p-3 text-white"
            />
          </div>

          <button
            type="submit"
            className="rounded bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-500"
          >
            Send Message
          </button>
        </form>
      ) : (
        <div className="font-semibold text-green-400">
          ✅ Thanks! We'll get back to you shortly.
        </div>
      )}
    </div>
  );
}
