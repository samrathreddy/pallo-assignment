/**
 * Structured Data Component for SEO
 * Provides JSON-LD structured data for search engines
 */

export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Science Tutor",
    "description": "Interactive AI-powered science tutor that helps students learn physics, chemistry, and biology through personalized conversations and flashcards.",
    "url": "https://pallo.vercel.app/",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "Team Pallo AI"
    },
    "featureList": [
      "Interactive AI tutoring for science subjects",
      "Personalized learning conversations",
      "Custom flashcard generation",
      "Physics, Chemistry, and Biology support",
      "Real-time explanations and examples",
      "LaTeX math equation rendering"
    ],
    "educationalLevel": [
      "High School",
      "College",
      "University"
    ],
    "teaches": [
      "Physics",
      "Chemistry", 
      "Biology",
      "Science"
    ],
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "student"
    },
    "isAccessibleForFree": true,
    "inLanguage": "en-US",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareVersion": "1.0.0",
    "datePublished": "2025-11-19",
    "dateModified": "2025-11-19"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}