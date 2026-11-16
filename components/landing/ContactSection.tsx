import type { ComponentProps } from 'react';
import { fullAddress, mapsUrl, site } from './site';
import { Icon } from './Icon';
import { Reveal } from './Reveal';
import { EnquiryForm } from './EnquiryForm';

type Props = ComponentProps<typeof EnquiryForm> & { headingLevel?: 'h1' | 'h2' };

export function ContactSection({ headingLevel: H = 'h2', ...formProps }: Props) {
  return (
    <section className="sec" id="contact" aria-labelledby="contact-title">
      <div className="wrap">
        <Reveal className="cgrid">
          <div className="cinfo dark">
            <p className="lbl">Contact us</p>
            <H className="h2 cinfo__h" id="contact-title">
              Meet your <em className="g">Ambattur team.</em>
            </H>
            <p className="cinfo__p">Share your details. We&apos;ll be in touch.</p>
            <ul className="clist">
              <li>
                <i aria-hidden="true">
                  <Icon name="pin" />
                </i>
                <div>
                  <small>Office</small>
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                    {fullAddress}
                  </a>
                </div>
              </li>
              <li>
                <i aria-hidden="true">
                  <Icon name="phone" />
                </i>
                <div>
                  <small>Call / WhatsApp</small>
                  <a href={site.phoneHref}>{site.phoneDisplay}</a>
                </div>
              </li>
              <li>
                <i aria-hidden="true">
                  <Icon name="mail" />
                </i>
                <div>
                  <small>Email</small>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </div>
              </li>
            </ul>
          </div>
          <EnquiryForm {...formProps} />
        </Reveal>
      </div>
    </section>
  );
}
