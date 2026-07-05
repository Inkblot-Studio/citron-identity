import { Link, Navigate, useParams } from 'react-router-dom';
import { getLegalDoc } from '@/lib/legal';
import styles from './LegalPage.module.scss';

export function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  const doc = slug ? getLegalDoc(slug) : undefined;

  if (!doc) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={styles.page} data-theme="light">
      <header className={styles.topBar}>
        <Link to="/login" className={styles.backLink}>
          ← Back to sign in
        </Link>
      </header>

      <article className={styles.article}>
        <p className={styles.eyebrow}>Legal</p>
        <h1 className={styles.title}>{doc.title}</h1>
        <p className={styles.summary}>{doc.summary}</p>
        <p className={styles.updated}>Last updated: {doc.updated}</p>

        <div className={styles.sections}>
          {doc.sections.map((section) => (
            <section key={section.heading} className={styles.section}>
              <h2 className={styles.heading}>{section.heading}</h2>
              <div className={styles.body}>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
