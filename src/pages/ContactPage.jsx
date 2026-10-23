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
        lead="Tell us a little about the journey you have in mind. A planner will write back to you personally."
      />
      <ErrorBoundary>
        <ContactForm />
      </ErrorBoundary>
    </PageShell>
  );
}
