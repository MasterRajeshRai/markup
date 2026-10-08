export const fallbackMenus = [
  {
    id: 'menu_header',
    name: 'Main Navigation',
    slug: 'main-navigation',
    location: 'header',
    description: 'Primary navbar for website',
    items: [
      { id: 'mi_1', label: 'Home', url: '/', target: '_self', order: 0, children: [] },
      { id: 'mi_2', label: 'Articles', url: '/articles', target: '_self', order: 1, children: [] },
      { id: 'mi_3', label: 'About', url: '/about', target: '_self', order: 2, children: [] },
      { id: 'mi_4', label: 'Contact', url: '/contact', target: '_self', order: 3, children: [] },
    ],
  },
  {
    id: 'menu_footer',
    name: 'Footer Navigation',
    slug: 'footer-navigation',
    location: 'footer',
    description: 'Footer policies and quick links',
    items: [
      { id: 'mi_10', label: 'Privacy Policy', url: '/privacy', target: '_self', order: 0, children: [] },
      { id: 'mi_11', label: 'Terms of Service', url: '/terms', target: '_self', order: 1, children: [] },
    ],
  },
];
