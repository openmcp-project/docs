/* eslint-disable import/no-unresolved */
import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';

export default function Footer() {
  const bmwkEuImg = useBaseUrl('/img/BMWK-EU.png');

  return (
    <footer className="ocp-footer">
      {/* Row 1: EU Funding Banner */}
      <div className="ocp-footer__eu-banner">
        <div className="ocp-footer__eu-container">
          <div className="ocp-footer__eu-logos">
            <img src={bmwkEuImg} alt="EU and BMWK funding logos" />
          </div>
          <div className="ocp-footer__eu-text">
            <p>
              <strong>Funded by the European Union – NextGenerationEU.</strong>
            </p>
            <p>
              The views and opinions expressed are solely those of the author(s) and do not
              necessarily reflect the views of the European Union or the European Commission.
              Neither the European Union nor the European Commission can be held responsible
              for them.
            </p>
          </div>
          <div className="ocp-footer__neonephos">
            <a
              href="https://neonephos.org/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="NeoNephos"
            >
              <img src={useBaseUrl('/img/neonephos.svg')} alt="NeoNephos Logo" style={{height: '80px', minWidth: '120px'}} />
            </a>
          </div>
        </div>
      </div>

      {/* Row 2: Copyright */}
      <div className="ocp-footer__copyright-row">
        <div className="ocp-footer__inner">
          <p>
            <strong>Copyright © Linux Foundation Europe.</strong>{' '}
            Open Control Plane is a project of the Open Component Model Community. For
            applicable policies including privacy policy, terms of use and trademark usage
            guidelines, please see{' '}
            <a href="https://linuxfoundation.eu" target="_blank" rel="noopener noreferrer">
              https://linuxfoundation.eu
            </a>
            . Linux is a registered trademark of Linus Torvalds.
          </p>
        </div>
      </div>

      {/* Row 3: Legal Links */}
      <div className="ocp-footer__legal-row">
        <div className="ocp-footer__inner">
          <nav className="ocp-footer__legal-links" aria-label="Legal">
            <Link to="/about/terms-of-use">Terms of Use</Link>
            <span className="ocp-footer__legal-sep" aria-hidden="true">|</span>
            <Link to="/about/privacy">Privacy Statement</Link>
            <span className="ocp-footer__legal-sep" aria-hidden="true">|</span>
            <Link to="/about/legal-disclosure">Legal Disclosure</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
