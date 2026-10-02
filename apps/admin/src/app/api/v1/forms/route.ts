import { NextRequest, NextResponse } from 'next/server';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'number';
  required: boolean;
  placeholder?: string;
  options?: string[]; // for select
  helpText?: string;
}

export interface FormItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  submitButtonText: string;
  successMessage: string;
  redirectUrl?: string;
  notificationEmail?: string;
  enableHoneypot: boolean;
  fields: FormField[];
  submissionCount: number;
  unreadCount: number;
  conversionRate: number; // percentage
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
}

let MOCK_FORMS: FormItem[] = [
  {
    id: 'form_contact',
    name: 'Enterprise Contact & Sales Inquiry',
    slug: 'contact-us',
    description: 'Main lead capture form for enterprise sales, architecture audits, and pricing requests.',
    submitButtonText: 'Submit Inquiry',
    successMessage: 'Thank you for reaching out! An enterprise solutions architect will respond within 4 business hours.',
    notificationEmail: 'leads@acmecms.io',
    enableHoneypot: true,
    submissionCount: 48,
    unreadCount: 5,
    conversionRate: 8.4,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    fields: [
      { id: 'f_name', name: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Doe' },
      { id: 'f_email', name: 'workEmail', label: 'Work Email', type: 'email', required: true, placeholder: 'jane@enterprise.com' },
      { id: 'f_company', name: 'company', label: 'Company Organization', type: 'text', required: true, placeholder: 'Acme Corp' },
      {
        id: 'f_tier',
        name: 'planInterest',
        label: 'Architecture Tier',
        type: 'select',
        required: true,
        options: ['Self-Hosted Enterprise', 'Cloud Multi-Region', 'Dedicated Cluster', 'Custom SLA'],
      },
      { id: 'f_message', name: 'message', label: 'Project Scope & Requirements', type: 'textarea', required: false, placeholder: 'Tell us about your migration timeline and tech stack...' },
    ],
  },
  {
    id: 'form_newsletter',
    name: 'Developer Newsletter Subscription',
    slug: 'developer-newsletter',
    description: 'Weekly digest covering headless architecture, Next.js optimization, and API-first patterns.',
    submitButtonText: 'Subscribe to Weekly Digest',
    successMessage: 'Welcome to our engineering community! Check your inbox to confirm your subscription.',
    enableHoneypot: true,
    submissionCount: 312,
    unreadCount: 0,
    conversionRate: 14.2,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    fields: [
      { id: 'fn_email', name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'developer@company.dev' },
      {
        id: 'fn_role',
        name: 'primaryRole',
        label: 'Primary Role',
        type: 'select',
        required: false,
        options: ['Full Stack Engineer', 'Frontend Architect', 'Engineering Leader', 'Product Manager'],
      },
    ],
  },
  {
    id: 'form_demo',
    name: 'Schedule Live Platform Demo',
    slug: 'schedule-demo',
    description: 'Guided walkthrough of the Headless CMS DAM, Rank Markup SEO, and workflow approvals.',
    submitButtonText: 'Book 30-Min Walkthrough',
    successMessage: 'Demo request received! We will send a calendar invitation promptly.',
    enableHoneypot: true,
    submissionCount: 19,
    unreadCount: 2,
    conversionRate: 6.8,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    fields: [
      { id: 'fd_name', name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Alex Smith' },
      { id: 'fd_email', name: 'email', label: 'Work Email', type: 'email', required: true, placeholder: 'alex@company.com' },
      { id: 'fd_phone', name: 'phone', label: 'Phone Number', type: 'tel', required: false, placeholder: '+1 (555) 000-0000' },
      { id: 'fd_notes', name: 'notes', label: 'Specific Features to Explore', type: 'textarea', required: false, placeholder: 'e.g. Cloudflare R2 WebP auto-cropping, Mega-Menu builder' },
    ],
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    forms: MOCK_FORMS,
    totalSubmissions: MOCK_FORMS.reduce((acc, f) => acc + f.submissionCount, 0),
    totalUnread: MOCK_FORMS.reduce((acc, f) => acc + f.unreadCount, 0),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, description, submitButtonText, successMessage, enableHoneypot, fields } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const newForm: FormItem = {
      id: `form_${Date.now()}`,
      name,
      slug,
      description: description || '',
      submitButtonText: submitButtonText || 'Submit',
      successMessage: successMessage || 'Thank you for your submission!',
      enableHoneypot: enableHoneypot ?? true,
      fields: Array.isArray(fields) && fields.length > 0 ? fields : [
        { id: `f_${Date.now()}_1`, name: 'email', label: 'Email', type: 'email', required: true },
      ],
      submissionCount: 0,
      unreadCount: 0,
      conversionRate: 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    MOCK_FORMS.unshift(newForm);

    return NextResponse.json({ success: true, form: newForm });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create form' }, { status: 500 });
  }
}
