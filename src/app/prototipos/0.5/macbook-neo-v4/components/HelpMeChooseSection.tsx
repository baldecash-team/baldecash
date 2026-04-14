'use client';

export default function HelpMeChooseSection() {
  return (
    <section id="help-me-choose" className="bg-white text-[#1d1d1f] py-24">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="bg-[#f5f5f7] rounded-3xl p-10 md:p-16 text-center">
          <h2 className="text-[32px] md:text-[48px] font-semibold tracking-[-0.003em] leading-[1.08] mb-4">
            Help me choose.
          </h2>
          <p className="text-xl text-[#6e6e73] max-w-[500px] mx-auto mb-8">
            Answer a few questions to find the best Mac for you.
          </p>
          <a
            href="#"
            className="inline-flex items-center justify-center px-8 py-3 bg-[#0066cc] text-white text-lg font-medium rounded-full hover:bg-[#0055b3] transition-colors"
          >
            Get started
          </a>
        </div>
      </div>
    </section>
  );
}
