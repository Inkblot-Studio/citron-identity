export type LegalDoc = {
  slug: string;
  title: string;
  summary: string;
  updated: string;
  sections: { heading: string; paragraphs: string[] }[];
};

export const COMPANY = {
  legalName: 'Inkblot Studio Ltd',
  legalNameLocal: 'Инкблот Студио ЕООД',
  uic: '208715250',
  vatId: 'BG208715250',
  address: '19 Maragidik Street, Floor 2, Office 1, 8000 Burgas, Bulgaria',
  director: 'Georgi Hristov Drianovski',
  website: 'https://inkblotstudio.eu',
  legalEmail: 'legal@inkblotstudio.eu',
} as const;

const updated = 'July 5, 2026';

export const legalDocs: LegalDoc[] = [
  {
    slug: 'terms',
    title: 'Terms and Conditions',
    summary: 'The agreement governing your use of Citron services operated by Inkblot Studio Ltd.',
    updated,
    sections: [
      {
        heading: '1. About these terms',
        paragraphs: [
          'These Terms and Conditions ("Terms") govern your access to and use of the websites, applications, and services offered under the Citron brand, including Citron Identity and related products (collectively, the "Services"), operated by Inkblot Studio Ltd.',
          'By creating an account, signing in, or otherwise using the Services, you confirm that you have read, understood, and agree to be bound by these Terms. If you do not agree, you must not use the Services.',
          'If you use the Services on behalf of an organisation, you represent that you have authority to bind that organisation, and "you" refers to both you and that organisation.',
        ],
      },
      {
        heading: '2. Who we are',
        paragraphs: [
          `The Services are provided by ${COMPANY.legalName} (${COMPANY.legalNameLocal}), a single-member limited liability company registered in the Republic of Bulgaria.`,
          `Company Identification Number (UIC): ${COMPANY.uic}. VAT registration: ${COMPANY.vatId}.`,
          `Registered office: ${COMPANY.address}.`,
          `Managing Director: ${COMPANY.director}.`,
          `Website: ${COMPANY.website}. Legal enquiries: ${COMPANY.legalEmail}.`,
        ],
      },
      {
        heading: '3. Definitions',
        paragraphs: [
          '"Account" means a registered user profile used to access the Services.',
          '"Customer Data" means information, files, and other content that you or your users submit to or store within the Services.',
          '"We", "us", and "our" refer to Inkblot Studio Ltd. "You" and "your" refer to the individual or organisation using the Services.',
        ],
      },
      {
        heading: '4. Eligibility and accounts',
        paragraphs: [
          'You must be at least 16 years old and capable of entering into a binding contract under applicable law. Where local law requires a higher minimum age, that higher age applies.',
          'You are responsible for providing accurate registration information and for keeping your login credentials confidential. You must notify us promptly of any unauthorised access to or use of your Account.',
          'We may refuse registration, suspend, or terminate Accounts where we reasonably believe these Terms have been breached or where required by law.',
        ],
      },
      {
        heading: '5. The Services',
        paragraphs: [
          'Citron provides software and related services in the field of information technology, including identity and authentication, business operations, and productivity tools. Specific features depend on your plan and product configuration.',
          'We may improve, modify, or discontinue features from time to time. Where a change materially reduces core functionality of a paid subscription, we will provide reasonable notice when practicable.',
          'The Services may integrate with third-party providers (for example, single sign-on or payment processors). Your use of third-party services is subject to their own terms and policies.',
        ],
      },
      {
        heading: '6. Acceptable use',
        paragraphs: [
          'You agree to use the Services lawfully and only for legitimate business or personal purposes. You must not misuse the Services, interfere with their operation, attempt unauthorised access, probe or scan systems without permission, or use the Services to distribute malware, spam, or unlawful content.',
          'You must not use the Services in a manner that infringes intellectual property or other rights, violates privacy or data-protection law, or facilitates fraud, harassment, or discrimination.',
          'We may investigate suspected violations and cooperate with law-enforcement or regulatory authorities where required.',
        ],
      },
      {
        heading: '7. Your content and data',
        paragraphs: [
          'You retain ownership of Customer Data. You grant us a limited licence to host, process, transmit, and display Customer Data solely to provide, secure, maintain, and improve the Services and as otherwise described in our Privacy Policy.',
          'You are responsible for the accuracy, quality, and legality of Customer Data and for obtaining any permissions required to submit it.',
          'You may export or delete Customer Data where the product provides such functionality. After termination, we will delete or return Customer Data within a reasonable period, except where retention is required by law or for legitimate backup, security, or billing purposes.',
        ],
      },
      {
        heading: '8. Intellectual property',
        paragraphs: [
          'We and our licensors own all rights in the Services, including software, design, branding, documentation, and underlying technology. Except for the limited rights expressly granted in these Terms, no rights are transferred to you.',
          'Citron names, logos, and product marks are our property. You may not use them without our prior written consent.',
          'If you provide feedback or suggestions, you grant us a perpetual, irrevocable, royalty-free licence to use them without obligation to you.',
        ],
      },
      {
        heading: '9. Fees and payment',
        paragraphs: [
          'Some features require a paid subscription. Prices, billing intervals, and included features are shown at purchase or in your order confirmation.',
          'Unless stated otherwise, subscriptions renew automatically at the then-current price. You may cancel in accordance with the cancellation process made available in the product or by contacting us before the next renewal date.',
          'Fees are exclusive of applicable taxes unless stated otherwise. You are responsible for any VAT or similar taxes due on your purchases, other than taxes based on our income.',
          'If payment fails, we may suspend access after reasonable notice until outstanding amounts are settled.',
        ],
      },
      {
        heading: '10. Privacy and data protection',
        paragraphs: [
          'Our collection and use of personal data is described in our Privacy Policy, which forms part of these Terms. By using the Services, you acknowledge that we will process personal data as described there.',
          'Where we process personal data on your behalf as a processor, a separate data-processing agreement may apply for business or enterprise customers.',
        ],
      },
      {
        heading: '11. Confidentiality',
        paragraphs: [
          'Each party may receive non-public information from the other. The receiving party will protect such information with at least reasonable care and use it only for purposes related to the Services, except where disclosure is required by law or to professional advisers bound by confidentiality obligations.',
        ],
      },
      {
        heading: '12. Warranties and disclaimers',
        paragraphs: [
          'We provide the Services with reasonable skill and care and will use commercially reasonable efforts to maintain availability and security.',
          'Except as expressly stated in these Terms, the Services are provided on an "as is" and "as available" basis. To the fullest extent permitted by applicable law, we disclaim all other warranties, whether express, implied, or statutory, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.',
          'We do not warrant that the Services will be uninterrupted, error-free, or completely secure, or that they will meet every requirement of your business.',
        ],
      },
      {
        heading: '13. Limitation of liability',
        paragraphs: [
          'Nothing in these Terms limits or excludes liability that cannot be limited or excluded under applicable law, including liability for death or personal injury caused by negligence, fraud, or fraudulent misrepresentation.',
          'Subject to the foregoing, we are not liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, revenue, goodwill, data, or business opportunity, even if we have been advised of the possibility of such damages.',
          'Subject to the foregoing, our total aggregate liability arising out of or relating to the Services or these Terms is limited to the greater of (a) the amounts paid by you to us for the Services in the twelve (12) months before the event giving rise to the claim, or (b) fifty euros (€50), except where mandatory law provides otherwise.',
        ],
      },
      {
        heading: '14. Indemnity',
        paragraphs: [
          'You will defend, indemnify, and hold us harmless from claims, damages, losses, and expenses (including reasonable legal fees) arising from your use of the Services, your Customer Data, or your breach of these Terms, except to the extent caused by our intentional misconduct or negligence.',
        ],
      },
      {
        heading: '15. Suspension and termination',
        paragraphs: [
          'You may stop using the Services at any time and may close your Account where the product provides that option.',
          'We may suspend or terminate access immediately if you materially breach these Terms, if required by law, or if continued provision would create security or legal risk. Where reasonable, we will provide notice before suspension or termination.',
          'Provisions that by their nature should survive termination will survive, including those relating to intellectual property, confidentiality, disclaimers, limitation of liability, indemnity, and governing law.',
        ],
      },
      {
        heading: '16. Changes',
        paragraphs: [
          'We may update these Terms from time to time. When we make material changes, we will post the updated Terms and revise the "Last updated" date. Where appropriate, we will also notify you by email or in-product notice.',
          'Continued use of the Services after the effective date of updated Terms constitutes acceptance, unless applicable law requires your explicit consent.',
        ],
      },
      {
        heading: '17. Governing law and disputes',
        paragraphs: [
          'These Terms are governed by the laws of the Republic of Bulgaria, without regard to conflict-of-law rules.',
          'The courts of Burgas, Bulgaria shall have exclusive jurisdiction over disputes arising out of or relating to these Terms, subject to any mandatory consumer-protection rights you may have in your country of residence.',
          'If you are a consumer within the European Union, you may also be entitled to use the European Commission’s Online Dispute Resolution platform.',
        ],
      },
      {
        heading: '18. General',
        paragraphs: [
          'If any provision of these Terms is held invalid or unenforceable, the remaining provisions remain in effect.',
          'Our failure to enforce a provision is not a waiver of our right to do so later.',
          'You may not assign these Terms without our consent. We may assign these Terms in connection with a merger, acquisition, corporate reorganisation, or sale of assets.',
          'These Terms, together with the Privacy Policy and any order or plan-specific terms accepted by you, constitute the entire agreement between you and us regarding the Services.',
        ],
      },
      {
        heading: '19. Contact',
        paragraphs: [
          `For questions about these Terms, contact us at ${COMPANY.legalEmail} or by post at our registered office address above.`,
        ],
      },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    summary: 'How Inkblot Studio Ltd collects, uses, and protects personal data when you use Citron.',
    updated,
    sections: [
      {
        heading: '1. Controller',
        paragraphs: [
          `${COMPANY.legalName} (${COMPANY.legalNameLocal}), UIC ${COMPANY.uic}, VAT ${COMPANY.vatId}, with registered office at ${COMPANY.address}, is the data controller for personal data processed through Citron services unless stated otherwise in a separate agreement.`,
          `Privacy enquiries: ${COMPANY.legalEmail}.`,
        ],
      },
      {
        heading: '2. Scope',
        paragraphs: [
          'This Privacy Policy explains how we collect, use, share, and protect personal data when you visit our websites, create an account, or use Citron products, including Citron Identity.',
          'It applies to account holders, administrators, and end users whose data is submitted through the Services.',
        ],
      },
      {
        heading: '3. Data we collect',
        paragraphs: [
          'Account and identity data, such as name, email address, organisation, authentication credentials, and security settings.',
          'Usage and technical data, including device information, log data, IP address, browser type, and interactions with the Services, collected to operate, secure, and improve the platform.',
          'Customer Data that you or your organisation chooses to store in Citron. We process this data on your instructions to provide the Services.',
          'Communications you send to us, including support requests and demo enquiries.',
        ],
      },
      {
        heading: '4. How we use data',
        paragraphs: [
          'To provide, authenticate, and maintain the Services, including account creation, sign-in, multi-factor authentication, and session management.',
          'To secure the platform, detect abuse, troubleshoot issues, and comply with legal obligations.',
          'To communicate with you about your account, service updates, and important security notices.',
          'To analyse aggregated usage and improve product performance and user experience.',
          'We do not sell your personal data. We do not use your business Customer Data to train shared AI models.',
        ],
      },
      {
        heading: '5. Legal bases (EEA and UK)',
        paragraphs: [
          'Where the GDPR or UK GDPR applies, we rely on: performance of a contract (providing the Services); legitimate interests (security, product improvement, and proportionate analytics); consent where required (for example, certain marketing cookies); and legal obligation where applicable.',
        ],
      },
      {
        heading: '6. Sharing and processors',
        paragraphs: [
          'We use trusted infrastructure and service providers who process data on our behalf under contractual safeguards, such as hosting, email delivery, analytics, and payment processing providers.',
          'We may disclose information where required by law, to protect rights and safety, or in connection with a merger, acquisition, or asset sale subject to appropriate protections.',
        ],
      },
      {
        heading: '7. International transfers',
        paragraphs: [
          'If personal data is transferred outside the European Economic Area, we implement appropriate safeguards, such as Standard Contractual Clauses or equivalent mechanisms recognised under applicable law.',
        ],
      },
      {
        heading: '8. Retention',
        paragraphs: [
          'We retain personal data only for as long as necessary for the purposes described in this policy, including to provide the Services, meet legal obligations, resolve disputes, and enforce agreements.',
          'Retention periods may vary depending on data type and your account status.',
        ],
      },
      {
        heading: '9. Security',
        paragraphs: [
          'We apply technical and organisational measures designed to protect personal data, including encryption in transit, access controls, and tenant isolation. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.',
        ],
      },
      {
        heading: '10. Your rights',
        paragraphs: [
          'Depending on your location, you may have rights to access, rectify, erase, restrict, or object to processing of your personal data, to data portability, and to withdraw consent where processing is consent-based.',
          'You may lodge a complaint with the Commission for Personal Data Protection of Bulgaria or your local supervisory authority.',
          `To exercise your rights, contact ${COMPANY.legalEmail}. We will respond within the timeframes required by applicable law.`,
        ],
      },
      {
        heading: '11. Cookies',
        paragraphs: [
          'We use essential cookies and similar technologies required for authentication and security. Additional information is available in our Cookie Policy where published on our website.',
        ],
      },
      {
        heading: '12. Changes',
        paragraphs: [
          'We may update this Privacy Policy from time to time. Material changes will be communicated through the Services or by other appropriate means.',
        ],
      },
    ],
  },
];

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return legalDocs.find((d) => d.slug === slug);
}
