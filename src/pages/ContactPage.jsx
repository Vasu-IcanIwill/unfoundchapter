import PageShell from '../components/PageShell.jsx';
import PageIntro, { Chapter } from '../components/PageIntro.jsx';
import ContactForm from '../components/ContactForm.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

export default function ContactPage() {
  return (
    <PageShell>
      <PageIntro
        eyebrow="Enquire"
        title={<>Begin your <Chapter />.</>}
        lead={<>Tell us a little about the journey you have in mind. A planner will write back to you personally. We reply within one working day.<br />Prefer to talk? <a href="https://wa.me/919147746406" target="_blank" rel="noopener">WhatsApp</a> or <a href="tel:+919147746406">call +91 91477 46406</a>, or write to <a href="mailto:hello@unfoundchapter.com">hello@unfoundchapter.com</a>.</>}
      />
      <ErrorBoundary>
        <ContactForm />
      </ErrorBoundary>
    </PageShell>
  );
}
