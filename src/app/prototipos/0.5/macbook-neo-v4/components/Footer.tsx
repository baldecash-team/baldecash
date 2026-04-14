'use client';

const footnotes = [
  'MacBook Neo is a demo product landing page built by BaldeCash. All product names, logos, and brands are property of their respective owners.',
  'Battery life varies by use and configuration. Testing conducted by BaldeCash using preproduction hardware and software. See apple.com/batteries for more information.',
  'Display size measured diagonally. Actual viewable area is less.',
  'Financing is available to qualified customers. See checkout for more details.',
];

const footerLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Use', href: '#' },
  { label: 'Sales and Refunds', href: '#' },
  { label: 'Legal', href: '#' },
  { label: 'Site Map', href: '#' },
];

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#f5f5f7',
        padding: '17px 0 21px',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: '0 auto',
          padding: '0 22px',
        }}
      >
        {/* Footnotes */}
        <div
          style={{
            borderBottom: '1px solid #d2d2d7',
            paddingBottom: 17,
            marginBottom: 17,
          }}
        >
          {footnotes.map((note, i) => (
            <p
              key={i}
              style={{
                fontSize: 11,
                lineHeight: 1.47,
                color: '#6e6e73',
                margin: 0,
                marginBottom: i < footnotes.length - 1 ? 10 : 0,
                letterSpacing: '0.007em',
              }}
            >
              <sup style={{ fontSize: 9 }}>{i + 1}</sup> {note}
            </p>
          ))}
        </div>

        {/* Footer links */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 7,
            alignItems: 'center',
            paddingBottom: 10,
          }}
        >
          {footerLinks.map((link, i) => (
            <span key={link.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <a
                href={link.href}
                style={{
                  fontSize: 12,
                  lineHeight: 1.33,
                  color: '#424245',
                  textDecoration: 'none',
                  letterSpacing: '0.007em',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                {link.label}
              </a>
              {i < footerLinks.length - 1 && (
                <span style={{ color: '#d2d2d7', fontSize: 12 }}>|</span>
              )}
            </span>
          ))}
        </div>

        {/* Copyright */}
        <p
          style={{
            fontSize: 12,
            lineHeight: 1.33,
            color: '#6e6e73',
            margin: 0,
            letterSpacing: '0.007em',
          }}
        >
          More ways to shop:{' '}
          <a
            href="#"
            style={{ color: '#0066CC', textDecoration: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            Find a retailer
          </a>{' '}
          near you. Or call 1-800-BALDECA.
        </p>

        <p
          style={{
            fontSize: 12,
            lineHeight: 1.33,
            color: '#6e6e73',
            margin: '5px 0 0',
            letterSpacing: '0.007em',
          }}
        >
          Copyright &copy; 2026 BaldeCash. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
