import HomePage from './HomePage.jsx';
import DevDiwaliPage from './DevDiwaliPage.jsx';
import ContactPage from './ContactPage.jsx';
import TermsPage from './TermsPage.jsx';
import PrivacyPage from './PrivacyPage.jsx';
import NotFoundPage from './NotFoundPage.jsx';

// page name (= HTML file name) -> component; used by the build-time prerender
export const PAGES = {
  index: HomePage,
  'dev-diwali': DevDiwaliPage,
  contact: ContactPage,
  terms: TermsPage,
  privacy: PrivacyPage,
  404: NotFoundPage,
};
