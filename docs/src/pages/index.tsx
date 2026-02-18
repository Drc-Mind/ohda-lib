import React, {useState} from 'react';
import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';
import Translate, {translate} from '@docusaurus/Translate';

import styles from './index.module.css';

const SHOWCASE_DATA = [
  {
    id: 'sale',
    label: <Translate id="homepage.showcase.sale.label">Record Sale</Translate>,
    icon: '💰',
    file: 'sales.ts',
    code: `const journal = ohada.recordSale({
  amount: 1000000,
  label: "Large Order #42",
  saleType: 'GOODS',
  vatRate: 18,
  payment: { method: 'bank', amount: 1180000 }
});`,
    output: `[
  {
    "type": "CONSTATATION",
    "lines": [
      { "account": "4111", "debit": 1180000, "credit": 0 },
      { "account": "701", "debit": 0, "credit": 1000000 },
      { "account": "4431", "debit": 0, "credit": 180000 }
    ],
    "isBalanced": true
  },
  {
    "type": "REGLEMENT",
    "lines": [
      { "account": "5211", "debit": 1180000, "credit": 0 },
      { "account": "4111", "debit": 0, "credit": 1180000 }
    ],
    "isBalanced": true
  }
]`
  },
  {
    id: 'purchase',
    label: <Translate id="homepage.showcase.purchase.label">Inventory Purchase</Translate>,
    icon: '📦',
    file: 'purchase.ts',
    code: `const journal = ohada.recordPurchase({
  amount: 500000,
  label: "Vendor Stock",
  charges: [{ type: 'Transport', amount: 25000 }],
  vatRate: 18,
  payments: [{ method: 'cash', amount: 619500 }]
});`,
    output: `[
  {
    "type": "CONSTATATION",
    "lines": [
      { "account": "6011", "debit": 500000, "credit": 0 },
      { "account": "6015", "debit": 25000, "credit": 0 },
      { "account": "4452", "debit": 94500, "credit": 0 },
      { "account": "4011", "debit": 0, "credit": 619500 }
    ],
    "isBalanced": true
  },
  {
    "type": "REGLEMENT",
    "lines": [
      { "account": "4011", "debit": 619500, "credit": 0 },
      { "account": "5711", "debit": 0, "credit": 619500 }
    ],
    "isBalanced": true
  }
]`
  },
  {
    id: 'expense',
    label: <Translate id="homepage.showcase.expense.label">Operating Expense</Translate>,
    icon: '🏢',
    file: 'expense.ts',
    code: `const journal = ohada.recordExpense({
  category: 'OFFICE_SUPPLIES',
  amount: 80000,
  label: "Office Materials",
  payment: { method: 'bank', amount: 94400 }
});`,
    output: `[
  {
    "type": "CONSTATATION",
    "lines": [
      { "account": "604", "debit": 80000, "credit": 0 },
      { "account": "4011", "debit": 0, "credit": 80000 }
    ],
    "isBalanced": true
  },
  {
    "type": "REGLEMENT",
    "lines": [
      { "account": "4011", "debit": 94400, "credit": 0 },
      { "account": "5211", "debit": 0, "credit": 94400 }
    ],
    "isBalanced": true
  }
]`
  },
  {
    id: 'asset',
    label: <Translate id="homepage.showcase.assets.title">Asset Acquisition</Translate>,
    icon: '�',
    file: 'assets.ts',
    code: `const journal = ohada.recordAsset({
  assetName: "Server Dell",
  type: 'COMPUTER_EQUIPMENT',
  amount: 2500000,
  transport: 50000,
  vatRate: 18,
  payment: { method: 'bank', amount: 3009000 }
});`,
    output: `[
  {
    "type": "CONSTATATION",
    "lines": [
      { "account": "2444", "debit": 2550000, "credit": 0 },
      { "account": "4451", "debit": 459000, "credit": 0 },
      { "account": "4812", "debit": 0, "credit": 3009000 }
    ],
    "isBalanced": true
  },
  {
    "type": "REGLEMENT",
    "lines": [
      { "account": "4812", "debit": 3009000, "credit": 0 },
      { "account": "5211", "debit": 0, "credit": 3009000 }
    ],
    "isBalanced": true
  }
]`
  }
];

function HomepageHeader() {
  const [activeTab, setActiveTab] = useState(SHOWCASE_DATA[0]);

  return (
    <header className={clsx('hero dyte-grid-bg', styles.heroBanner)}>
      <div className={clsx(styles.blurBlob, styles.blob1)} />
      <div className={clsx(styles.blurBlob, styles.blob2)} />
      <div className={clsx('container', styles.heroContainer, 'animate-fade-in')}>
        <div className={styles.heroLeft}>
          <div className="hero-badge">
            <Translate id="homepage.hero.badge">v0.0.3 Stable • SYSCOHADA v2.0</Translate>
          </div>
          <Heading as="h1" className="hero__title">
            <Translate id="homepage.hero.title" values={{
              br: <br />,
              b: <b>ohada-lib</b>
            }}>
              {'OHADA accounting should be {br}simple for every developer'}
            </Translate>
          </Heading>
          <p className="hero__subtitle">
            <Translate id="homepage.hero.subtitle">
              The professional TypeScript engine for compliant financial management in the OHADA region. 
              Automated rules and zero-dependency performance.
            </Translate>
          </p>
          <div className={styles.buttons}>
            <Link className="button button--primary" to="/docs/intro">
              <span className={styles.fullLabel}><Translate id="homepage.hero.cta.primary">Get Started</Translate></span>
              <span className={styles.mobileLabel}><Translate id="homepage.hero.cta.primary.mobile">Start</Translate></span>
            </Link>
            <Link className="button button--secondary" to="https://github.com/marcellintacite/ohada-lib">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '8px', verticalAlign: 'middle'}}><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </Link>
          </div>

          <div className={styles.compatibility}>
            <span className={styles.compatibilityLabel}>Use it with</span>
            <div className={styles.compatibilityLogos}>
              <div className={styles.logoItem}>React</div>
              <div className={styles.logoItem}>Next.js</div>
              <div className={styles.logoItem}>Node.js</div>
              <div className={styles.logoItem}>Vite</div>
            </div>
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.miniShowcase}>
            <div className={styles.miniShowcaseHeader}>
              <div className={styles.miniShowcaseTabs}>
                {SHOWCASE_DATA.map((tab) => (
                  <button
                    key={tab.id}
                    className={clsx(styles.miniTab, activeTab.id === tab.id && styles.miniTabActive)}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className={styles.miniShowcaseActions}>
                <button className={styles.copyButton}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            </div>
            <div className={styles.miniShowcaseBody}>
              <div className={styles.miniCodeWrapper}>
                <div className={styles.miniLabel}>Input Code</div>
                <CodeBlock language="typescript">{activeTab.code}</CodeBlock>
              </div>
              <div className={styles.miniOutputWrapper}>
                <div className={styles.miniLabel}>Resulting Journal</div>
                <CodeBlock language="json">{activeTab.output}</CodeBlock>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// CodeShowcase is now integrated into HomepageHeader

function Features() {
  const features = [
    {
      title: <Translate id="homepage.features.compliance.title">SYSCOHADA Standard</Translate>,
      description: <Translate id="homepage.features.compliance.desc">Hardcoded compliance for all 17 OHADA member states. Every transaction follows the official revised chart of accounts.</Translate>,
      icon: '📐'
    },
    {
      title: <Translate id="homepage.features.assets.title">Asset Management</Translate>,
      description: <Translate id="homepage.features.assets.desc">Advanced handling of acquisitions, component splits, and dismantling provisions as per specialized rules.</Translate>,
      icon: '🏢'
    },
    {
      title: <Translate id="homepage.features.resolution.title">Smart Resolution</Translate>,
      description: <Translate id="homepage.features.resolution.desc">Automatically map business events to the correct accounts. No more looking up chart codes manually.</Translate>,
      icon: '🧠'
    },
    {
      title: <Translate id="homepage.features.typesafe.title">Type-Safe Accounting</Translate>,
      description: <Translate id="homepage.features.typesafe.desc">Built-in validation prevents common accounting errors at compile time. Catch logic bugs before they hit the ledger.</Translate>,
      icon: '🛡️'
    },
    {
      title: <Translate id="homepage.features.scale.title">Zero Dependencies</Translate>,
      description: <Translate id="homepage.features.scale.desc">Lightweight (~70KB) and incredibly fast. Runs in Node.js, Browsers, and Edge environments without overhead.</Translate>,
      icon: '🚀'
    },
    {
      title: <Translate id="homepage.features.i18n.title">Multi-Lingual</Translate>,
      description: <Translate id="homepage.features.i18n.desc">Fully localized journal labels and documentation in English and French for the entire region.</Translate>,
      icon: '🌍'
    }
  ];

  return (
    <section className={styles.featuresWrapper}>
      <div className="container">
        <span className={styles.sectionLabel}>
          <Translate id="homepage.features.label">Pillars</Translate>
        </span>
        <h2 className={styles.sectionTitle}>
          <Translate id="homepage.features.title">Engineered for Compliance.</Translate>
        </h2>
        <div className={styles.bentoGrid}>
          {features.map((f, i) => (
            <div key={i} className={styles.bentoCard}>
              <span className={styles.cardIcon}>{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="ohada-lib | Programmable SYSCOHADA Accounting"
      description="The TypeScript library for secure and compliant financial management in the OHADA region.">
      <HomepageHeader />
      <main>
        <Features />
      </main>
    </Layout>
  );
}
