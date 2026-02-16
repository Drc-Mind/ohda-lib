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
  vatRate: 18,
  payment: { method: 'bank', amount: 1180000 }
});`,
  },
  {
    id: 'purchase',
    label: <Translate id="homepage.showcase.purchase.label">Inventory Purchase</Translate>,
    icon: '📦',
    file: 'purchase.ts',
    code: `const journal = ohada.recordPurchase({
  amount: 500000,
  label: "Vendor Stock",
  transport: 25000,
  payment: { method: 'cash', amount: 615000 }
});`,
  },
  {
    id: 'expense',
    label: <Translate id="homepage.showcase.expense.label">Operating Expense</Translate>,
    icon: '🏢',
    file: 'expense.ts',
    code: `const journal = ohada.recordExpense({
  category: 'ELECTRICITY',
  amount: 80000,
  label: "Monthly Bill",
  payment: { method: 'bank', amount: 80000 }
});`,
  },
  {
    id: 'vat',
    label: <Translate id="homepage.showcase.vat.label">VAT Settlement</Translate>,
    icon: '🏛️',
    file: 'vat.ts',
    code: `const result = ohada.settleVAT({
  month: 1,
  year: 2026,
  deductible: 540000,
  collected: 820000
});`,
  }
];

function HomepageHeader() {
  return (
    <header className={clsx('hero dyte-grid-bg', styles.heroBanner)}>
      <div className={clsx(styles.blurBlob, styles.blob1)} />
      <div className={clsx(styles.blurBlob, styles.blob2)} />
      <div className={clsx('container', styles.heroContent, 'animate-fade-in')}>
        <div className="hero-badge">
          <Translate id="homepage.hero.badge">v0.0.3 Stable • SYSCOHADA v2.0</Translate>
        </div>
        <Heading as="h1" className="hero__title">
          <Translate id="homepage.hero.title" values={{
            br: <br />,
            b: <b>ohada-lib</b>
          }}>
            {'Manage your ledger{br}as code with {b}'}
          </Translate>
        </Heading>
        <p className="hero__subtitle">
          <Translate id="homepage.hero.subtitle">
            The TypeScript-native engine for secure and compliant financial management. 
            Bridge the gap between business events and accounting law.
          </Translate>
        </p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/intro">
            <Translate id="homepage.hero.cta.primary">Get Started</Translate>
          </Link>
          <Link className="button button--secondary button--lg" to="https://github.com/marcellintacite/ohada-lib">
            <Translate id="homepage.hero.cta.secondary">Schedule a Demo</Translate>
          </Link>
        </div>
      </div>
    </header>
  );
}

function CodeShowcase() {
  const [activeTab, setActiveTab] = useState(SHOWCASE_DATA[0]);

  return (
    <section className={styles.showcaseContainer}>
      <div className={styles.showcaseGrid}>
        <div className={styles.showcaseSidebar}>
          {SHOWCASE_DATA.map((tab) => (
            <div
              key={tab.id}
              className={clsx(styles.sidebarTab, activeTab.id === tab.id && styles.activeTab)}
              onClick={() => setActiveTab(tab)}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </div>
          ))}
        </div>
        <div className={styles.showcaseBody}>
          <div className={styles.codeHeader}>
            {activeTab.file}
          </div>
          <div className={styles.codeContent}>
            <CodeBlock language="typescript">{activeTab.code}</CodeBlock>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      title: <Translate id="homepage.features.scale.title">Built for Scale</Translate>,
      description: <Translate id="homepage.features.scale.desc">Optimized for high-volume transactions with zero dependencies. Deploy anywhere from edge functions to core servers.</Translate>,
      icon: '🚀'
    },
    {
      title: <Translate id="homepage.features.compliance.title">SYSCOHADA Standard</Translate>,
      description: <Translate id="homepage.features.compliance.desc">Hardcoded compliance for the OHADA region. Every debit and credit follows the official chart of accounts.</Translate>,
      icon: '📐'
    },
    {
      title: <Translate id="homepage.features.resolution.title">Smart Resolution</Translate>,
      description: <Translate id="homepage.features.resolution.desc">Account codes are automatically resolved based on context. No more hardcoding "4111" or "701" manually.</Translate>,
      icon: '🧠'
    },
    {
      title: <Translate id="homepage.features.typesafe.title">Type-Safe API</Translate>,
      description: <Translate id="homepage.features.typesafe.desc">Catch accounting logic bugs at compile time. Strict definitions for sales, purchases, and expenses.</Translate>,
      icon: '🛡️'
    },
    {
      title: <Translate id="homepage.features.audit.title">Audit Ready</Translate>,
      description: <Translate id="homepage.features.audit.desc">Generate immutable audit trails and journal entries that any external auditor can verify instantly.</Translate>,
      icon: '📜'
    },
    {
      title: <Translate id="homepage.features.i18n.title">Multi-Lingual</Translate>,
      description: <Translate id="homepage.features.i18n.desc">English and French support out of the box. Ready for the diverse business landscape of the region.</Translate>,
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
        <CodeShowcase />
        <Features />
      </main>
    </Layout>
  );
}
