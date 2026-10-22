// Contact form: validation and Formspree delivery.
// The form only exists when `formspree_id` is set in _config.yml. Success is shown
// only after Formspree accepts the message.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const FIELDS = ['name', 'email', 'need', 'message'];

export function readInquiry(form) {
  const value = (name) => (form.elements.namedItem(name)?.value ?? '').trim();
  return {
    name: value('name'),
    email: value('email'),
    need: value('need'),
    message: value('message'),
    _gotcha: value('_gotcha'),
  };
}

export function validateInquiry(data) {
  const errors = {};
  if (data.name.length < 2) errors.name = 'Enter your name.';
  if (!EMAIL_PATTERN.test(data.email)) errors.email = 'Enter an email address we can reply to.';
  if (!data.need) errors.need = 'Choose what you need.';
  if (data.message.length < 10) errors.message = 'Tell us a little more, at least 10 characters.';
  return errors;
}

export async function sendInquiry(endpoint, data, fetchImpl = globalThis.fetch) {
  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) return { ok: true };
    let message = '';
    try {
      const body = await response.json();
      if (Array.isArray(body?.errors)) message = body.errors.map((error) => error.message).join(' ');
    } catch {
      // Formspree normally answers with JSON; an unreadable body still counts as a failure.
    }
    return { ok: false, message };
  } catch {
    return { ok: false, message: '' };
  }
}

function showErrors(form, errors) {
  for (const name of FIELDS) {
    const input = form.elements.namedItem(name);
    const slot = form.querySelector(`[data-error-for="${name}"]`);
    const message = errors[name] ?? '';
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (slot) slot.textContent = message;
  }
}

export function initContactForm(root = document) {
  const form = root.querySelector('[data-contact-form]');
  if (!form) return null;
  const status = form.querySelector('[data-form-status]');
  const button = form.querySelector('[type="submit"]');
  const success = root.querySelector('[data-form-success]');
  const fallbackEmail = root.querySelector('a[href^="mailto:"]')?.getAttribute('href')?.replace('mailto:', '');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = readInquiry(form);
    const errors = validateInquiry(data);
    showErrors(form, errors);
    const firstInvalid = FIELDS.find((name) => errors[name]);
    if (firstInvalid) {
      form.elements.namedItem(firstInvalid)?.focus();
      return;
    }

    button.disabled = true;
    status.textContent = 'Sending…';
    const result = await sendInquiry(form.action, data);
    button.disabled = false;

    if (result.ok) {
      form.reset();
      status.textContent = '';
      form.hidden = true;
      if (success) {
        success.hidden = false;
        success.focus();
      }
      return;
    }
    const detail = result.message ? ` ${result.message.replace(/([^.!?])$/, '$1.')}` : '';
    status.textContent = fallbackEmail
      ? `Your message did not send.${detail} Please email ${fallbackEmail} instead.`
      : `Your message did not send.${detail}`;
  });

  return form;
}
