'use client';

import { environmentData } from '../data/v4Data';

export default function EnvironmentSection() {
  return (
    <section id="environment" className="bg-white text-[#1d1d1f] py-24">
      <div className="max-w-[980px] mx-auto px-6">
        <h2 className="text-[32px] md:text-[48px] font-semibold tracking-[-0.003em] leading-[1.08] mb-8">
          {environmentData.headline}
        </h2>

        {/* Recycled material card */}
        <div className="bg-[#f5f5f7] rounded-[18px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          {/* Recycling icon */}
          <div className="w-[80px] h-[80px] flex-shrink-0">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M40 8L28 28h24L40 8zm-2.5 4.3L30.3 24h14.4L37.5 12.3zM16 36l-8 20h24l-8-20h-8zm2.5 4h3l5.2 12H13.3l5.2-12zM56 36l-8 20h24l-8-20h-8zm2.5 4h3l5.2 12H53.3l5.2-12z" fill="#1d1d1f"/>
            </svg>
          </div>
          <div>
            <h3 className="text-[21px] md:text-[28px] font-semibold leading-[1.14] tracking-[0.007em] mb-3">
              {environmentData.stat}
            </h3>
            <a
              href="#"
              className="text-[#0066cc] text-sm hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more in our Product Environmental Report (PDF) &rsaquo;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
