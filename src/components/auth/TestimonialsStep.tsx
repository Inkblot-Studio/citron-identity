import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import styles from './TestimonialsStep.module.scss';

const testimonials = [
  {
    id: 1,
    name: 'Lachy Groom',
    title: 'Investor. Co-founder of Physical Intelligence',
    quote: 'The team at IS truly masters the details. Their products are both beautiful and incredibly functional, showing just how much they care about getting everything right.',
    avatar: '👨‍💼',
  },
  {
    id: 2,
    name: 'Guillermo Rauch',
    title: 'CEO at Vercel',
    quote: 'IS is one of my favorite design and product teams out there. I love how they always share how the sausage is made.',
    avatar: '👨‍💻',
  },
  {
    id: 3,
    name: 'Stammy',
    title: 'Co-Founder at Limitless AI',
    quote: "I love IS so much. Such a well-crafted identity provider. Even if you don't use it frequently it's worth checking out for the polish alone.",
    avatar: '👨‍🔬',
  },
  {
    id: 4,
    name: 'Zeno Rocha',
    title: 'Founder & CEO at Resend',
    quote: 'IS is one of my favorite software teams, building one of the most beautifully designed products on the market.',
    avatar: '👨‍🚀',
  },
];

interface TestimonialsStepProps {
  onSignIn: () => void;
}

export const TestimonialsStep: React.FC<TestimonialsStepProps> = ({ onSignIn }) => {
  const { completeTestimonials } = useAuthStore();
  const [visibleTestimonials, setVisibleTestimonials] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < testimonials.length) {
        setVisibleTestimonials((prev) => [...prev, currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.gradient} />
        <div className={styles.pattern} />
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.topBar}>
            <span className={styles.stepIndicator}>Step 1 of 3</span>
            <button type="button" className={styles.signInLink} onClick={onSignIn}>
              Sign in
            </button>
          </div>
          <h1 className={styles.title}>Among the brightest minds</h1>
          <p className={styles.subtitle}>
            From casual users to pros, you inspire us. That&apos;s why so many choose IS, and we&apos;re excited to have you on board.
          </p>
        </div>

        <div className={styles.testimonialsGrid}>
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`${styles.testimonialCard} ${
                visibleTestimonials.includes(index) ? styles.visible : ''
              }`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className={styles.avatar}>{testimonial.avatar}</div>
              <div className={styles.content}>
                <div className={styles.header}>
                  <h3 className={styles.name}>{testimonial.name}</h3>
                  <div className={styles.verified}>✓</div>
                </div>
                <p className={styles.title}>{testimonial.title}</p>
                <p className={styles.quote}>&ldquo;{testimonial.quote}&rdquo;</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.callToAction}>
          <button type="button" className={styles.setupButton} onClick={completeTestimonials}>
            Setup your account
          </button>
          <p className={styles.completionText}>~40 seconds to completion</p>
          <p className={styles.loginHint}>
            Already have an account?{' '}
            <button type="button" className={styles.signInLink} onClick={onSignIn}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
