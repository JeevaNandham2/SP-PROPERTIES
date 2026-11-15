"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { enquirySchema, type EnquiryInput, type EnquiryValues } from './validation';
import { enquiryText, whatsappLink } from './whatsapp';
import { interestOptions } from './data/content';
import { site } from './site';
import { Button } from './Button';
import { Field } from './Field';
import { forwardEnquiry, track } from '@/lib/whatsapp';

interface Props {
  defaultInterest?: (typeof interestOptions)[number];
  defaultMessage?: string;
  /** Injected for tests; defaults to opening WhatsApp in a new tab. */
  onSend?: (url: string, values: EnquiryValues) => void;
}

const openWhatsApp = (url: string) => window.open(url, '_blank', 'noopener');

export function EnquiryForm({ defaultInterest, defaultMessage, onSend = openWhatsApp }: Props) {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [sentLink, setSentLink] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryInput, unknown, EnquiryValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      interest: defaultInterest,
      message: defaultMessage ?? '',
    },
    shouldFocusError: true,
  });

  const submit = (v: EnquiryValues) => {
    const url = whatsappLink(enquiryText(v));
    setSentLink(url);
    onSend(url, v);
    track('lead_submitted', { source: 'landing', interest: v.interest });
    void forwardEnquiry({
      name: v.name,
      mobile: v.phone,
      location: 'Not specified',
      bhk: 'Not specified',
      message: [
        `Interested in: ${v.interest}`,
        v.email ? `Email: ${v.email}` : '',
        v.message ?? '',
      ].filter(Boolean).join('\n'),
      source: 'landing',
    });
    setSentTo(v.name);
    reset({ name: '', phone: '', email: '', interest: defaultInterest, message: '' });
  };

  const a11y = (k: keyof EnquiryInput) => ({
    'aria-invalid': !!errors[k] || undefined,
    'aria-describedby': errors[k] ? `enq-${k}-error` : undefined,
  });

  return (
    <form className="enq" onSubmit={handleSubmit(submit)} noValidate aria-label="Enquiry form">
      <Field id="enq-name" label="Full Name" error={errors.name?.message}>
        <input id="enq-name" autoComplete="name" {...register('name')} {...a11y('name')} />
      </Field>
      <Field id="enq-phone" label="Phone Number" error={errors.phone?.message}>
        <input
          id="enq-phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          {...register('phone')}
          {...a11y('phone')}
        />
      </Field>
      <Field id="enq-email" label="Email Address" optional error={errors.email?.message}>
        <input id="enq-email" type="email" autoComplete="email" {...register('email')} {...a11y('email')} />
      </Field>
      <Field id="enq-interest" label="Property Interest" error={errors.interest?.message}>
        <select id="enq-interest" defaultValue="" {...register('interest')} {...a11y('interest')}>
          <option value="" disabled>
            Select an option
          </option>
          {interestOptions.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field id="enq-message" label="Message" optional full error={errors.message?.message}>
        <textarea
          id="enq-message"
          rows={3}
          placeholder="Preferred area, budget, BHK…"
          {...register('message')}
          {...a11y('message')}
        />
      </Field>
      <div className="enq__end">
        <p>Your enquiry opens in WhatsApp so you can send it to our team directly.</p>
        <Button type="submit" variant="navy" arrow disabled={isSubmitting}>
          Send Enquiry
        </Button>
      </div>
      {sentTo && (
        <p className="enq__ok" role="status">
          Thank you, {sentTo}! Your enquiry is ready. {sentLink && <a className="underline" href={sentLink} target="_blank" rel="noopener noreferrer">Open WhatsApp and press Send</a>}
          {" "}to reach our team, or call <a className="underline" href={site.phoneHref}>{site.phoneDisplay}</a>.
        </p>
      )}
    </form>
  );
}
