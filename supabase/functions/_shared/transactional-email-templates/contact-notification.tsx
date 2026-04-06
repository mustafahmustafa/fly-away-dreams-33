import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "SkyVoyAI"

interface ContactNotificationProps {
  firstName?: string
  lastName?: string
  email?: string
  subject?: string
  message?: string
}

const ContactNotificationEmail = ({ firstName, lastName, email, subject, message }: ContactNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New contact form submission from {firstName || 'a visitor'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logoText}>✈ {SITE_NAME}</Text>
        </Section>

        <Heading style={h1}>New Contact Form Submission</Heading>

        <Section style={detailsBox}>
          <Text style={detailLabel}>Name</Text>
          <Text style={detailValue}>{firstName || '—'} {lastName || ''}</Text>

          <Text style={detailLabel}>Email</Text>
          <Text style={detailValue}>{email || '—'}</Text>

          <Text style={detailLabel}>Subject</Text>
          <Text style={detailValue}>{subject || '—'}</Text>
        </Section>

        <Hr style={divider} />

        <Text style={detailLabel}>Message</Text>
        <Text style={messageText}>{message || 'No message provided.'}</Text>

        <Hr style={divider} />

        <Text style={footer}>
          This email was sent from the {SITE_NAME} contact form.
          Reply directly to {email || 'the sender'} to respond.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactNotificationEmail,
  subject: (data: Record<string, any>) =>
    `New contact: ${data.subject || 'General inquiry'} — ${data.firstName || 'Visitor'}`,
  to: 'info@skyvoyai.com',
  displayName: 'Contact form notification (to admin)',
  previewData: {
    firstName: 'Ahmed',
    lastName: 'Al-Khatib',
    email: 'ahmed@example.com',
    subject: 'Booking inquiry',
    message: 'Hi, I would like to know more about your corporate travel packages.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '0', maxWidth: '560px', margin: '0 auto' }
const header = {
  backgroundColor: '#0a1128',
  padding: '24px 30px',
  borderRadius: '12px 12px 0 0',
}
const logoText = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: '700' as const,
  margin: '0',
  fontFamily: "'Syne', Arial, sans-serif",
}
const h1 = {
  fontSize: '22px',
  fontWeight: '700' as const,
  color: '#0a1128',
  margin: '28px 30px 20px',
}
const detailsBox = {
  backgroundColor: '#f4f6fa',
  borderRadius: '10px',
  padding: '20px 24px',
  margin: '0 30px',
}
const detailLabel = {
  fontSize: '11px',
  fontWeight: '600' as const,
  color: '#8993a4',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  margin: '0 0 4px 30px',
  marginLeft: '0',
}
const detailValue = {
  fontSize: '15px',
  color: '#1a1a2e',
  margin: '0 0 16px 0',
}
const messageText = {
  fontSize: '14px',
  color: '#333',
  lineHeight: '1.7',
  margin: '8px 30px 20px',
  whiteSpace: 'pre-wrap' as const,
}
const divider = { borderColor: '#e8ebf0', margin: '16px 30px' }
const footer = {
  fontSize: '12px',
  color: '#999',
  margin: '10px 30px 30px',
  lineHeight: '1.5',
}
