export interface ArticleSchemaProps {
  headline: string;
  description?: string;
  image?: string;
  authorName?: string;
  datePublished?: string;
  dateModified?: string;
  publisherName?: string;
  publisherLogo?: string;
  url?: string;
}

export interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  contactPoint?: {
    telephone?: string;
    contactType?: string;
    email?: string;
  };
  socialProfiles?: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ProductSchemaProps {
  name: string;
  description?: string;
  image?: string;
  sku?: string;
  price?: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generate Schema.org JSON-LD objects
 */
export const schemaOrg = {
  article(props: ArticleSchemaProps) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: props.headline,
      description: props.description,
      image: props.image ? [props.image] : undefined,
      datePublished: props.datePublished,
      dateModified: props.dateModified || props.datePublished,
      author: props.authorName ? { '@type': 'Person', name: props.authorName } : undefined,
      publisher: props.publisherName
        ? {
            '@type': 'Organization',
            name: props.publisherName,
            logo: props.publisherLogo ? { '@type': 'ImageObject', url: props.publisherLogo } : undefined,
          }
        : undefined,
      mainEntityOfPage: props.url ? { '@type': 'WebPage', '@id': props.url } : undefined,
    };
  },

  organization(props: OrganizationSchemaProps) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: props.name,
      url: props.url,
      logo: props.logo,
      description: props.description,
      sameAs: props.socialProfiles && props.socialProfiles.length > 0 ? props.socialProfiles : undefined,
      contactPoint: props.contactPoint
        ? {
            '@type': 'ContactPoint',
            telephone: props.contactPoint.telephone,
            contactType: props.contactPoint.contactType || 'customer service',
            email: props.contactPoint.email,
          }
        : undefined,
    };
  },

  faq(items: FaqItem[]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    };
  },

  product(props: ProductSchemaProps) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: props.name,
      description: props.description,
      image: props.image,
      sku: props.sku,
      brand: props.brand ? { '@type': 'Brand', name: props.brand } : undefined,
      offers: props.price !== undefined
        ? {
            '@type': 'Offer',
            price: props.price,
            priceCurrency: props.currency || 'USD',
            availability: `https://schema.org/${props.availability || 'InStock'}`,
          }
        : undefined,
    };
  },

  breadcrumbs(items: BreadcrumbItem[]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.name,
        item: item.url,
      })),
    };
  },
};
