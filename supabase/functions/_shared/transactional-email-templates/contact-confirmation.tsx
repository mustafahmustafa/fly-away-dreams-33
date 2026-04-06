import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "SkyVoyAI"

interface ContactConfirmationProps {
  firstName?: string
}

const ContactConfirmationEmail = ({ firstName }: ContactConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Thanks for reaching out to {SITE_NAME}!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logoText}>✈ {SITE_NAME}</Text>
        </Section>

        <Section style={content}>
          <Heading style={h1}>
            {firstName ? `Thank you, ${firstName}!` : 'Thank you for reaching out!'}
          </Heading>

          <Text style={text}>
            We've received your message and our team is already on it.
            You can expect a reply within <strong>2 hours</strong> during business hours.
          </Text>

          <Text style={text}>
            In the meantime, feel free to explore the latest flight deals on our website.
          </Text>

          <Section style={ctaContainer}>
            <Button style={ctaButton} href="https://skyvoyai.com/deals">
              Browse Flight Deals →
            </Button>
          </Section>

          <Text style={footer}>
            Best regards,<br />
            The {SITE_NAME} Team<br />
            Dubai Internet City, UAE
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactConfirmationEmail,
  subject: 'Thanks for contacting SkyVoyAI ✈',
  displayName: 'Contact confirmation (to sender)',
  previewData: { firstName: 'Ahmed' },
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
const content = { padding: '30px' }
const h1 = {
  fontSize: '22px',
  fontWeight: '700' as const,
  color: '#0a1128',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#55575d',
  lineHeight: '1.7',
  margin: '0 0 18px',
}
const ctaContainer = { textAlign: 'center' as const, margin: '24px 0' }
const ctaButton = {
  backgroundColor: '#0057FF',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  padding: '14px 28px',
  borderRadius: '8px',
  textDecoration: 'none',
}
const footer = {
  fontSize: '12px',
  color: '#999999',
  margin: '30px 0 0',
  lineHeight: '1.6',
}
