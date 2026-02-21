import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import styles from './TestimonialsStep.module.scss';

const testimonials = [
  {
    id: 1,
    name: 'Lachy Groom',
    title: 'Investor. Co-founder of Physical Intelligence',
    quote: 'The team at InkID truly masters the details. Their products are both beautiful and incredibly functional, showing just how much they care about getting everything right.',
    avatar: '👨‍💼'
  },
  {
    id: 2,
    name: 'Guillermo Rauch',
    title: 'CEO at Vercel',
    quote: 'InkID is one of my favorite design and product teams out there. I love how they always share how the sausage is made.',
    avatar: '👨‍💻'
  },
  {
    id: 3,
    name: 'Stammy',
    title: 'Co-Founder at Limitless AI',
    quote: 'I love InkID so much. Such a well-crafted identity provider. Even if you don\'t use it frequently it\'s worth checking out for the polish alone.',
    avatar: '👨‍🔬'
  },
  {
    id: 4,
    name: 'Zeno Rocha',
    title: 'Founder & CEO at Resend',
    quote: 'InkID is one of my favorite software teams, building one of the most beautifully designed products on the market.',
    avatar: '👨‍🚀'
  }
];

export const TestimonialsStep: React.FC = () => {
  const { completeTestimonials } = useAuthStore();
  const [visibleTestimonials, setVisibleTestimonials] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Start showing testimonials one by one
    const interval = setInterval(() => {
      if (currentIndex < testimonials.length) {
        setVisibleTestimonials(prev => [...prev, currentIndex]);
        setCurrentIndex(prev => prev + 1);
      } else {
        clearInterval(interval);
        // Complete testimonials after showing all
        setTimeout(() => {
          completeTestimonials?.();
        }, 2000);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [currentIndex, completeTestimonials]);

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.gradient} />
        <div className={styles.pattern} />
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.stepIndicator}>Step 1 of 3</div>
          <h1 className={styles.title}>Among the brightest minds</h1>
          <p className={styles.subtitle}>
            From casual users to pros, you inspire us. That's why so many choose InkID, and we're excited to have you on board.
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
                <p className={styles.quote}>"{testimonial.quote}"</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.callToAction}>
          <button className={styles.setupButton} onClick={completeTestimonials}>
            Setup your account
          </button>
          <p className={styles.completionText}>~40 seconds to completion</p>
        </div>
      </div>
    </div>
  );
}; 