import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readInquiry, sendInquiry, validateInquiry } from '../../assets/js/contact.js';

const valid = { name: 'Ada Lovelace', email: 'ada@example.com', need: 'Agentic AI', message: 'We want an agent for bid scopes.', _gotcha: '' };

function fakeForm(values) {
  return { elements: { namedItem: (name) => (name in values ? { value: values[name] } : null) } };
}

describe('validateInquiry', () => {
  it('accepts a complete message', () => {
    assert.deepEqual(validateInquiry(valid), {});
  });

  it('flags each missing or invalid field', () => {
    const errors = validateInquiry({ name: '', email: 'not-an-email', need: '', message: 'short', _gotcha: '' });
    assert.deepEqual(Object.keys(errors).sort(), ['email', 'message', 'name', 'need']);
  });
});

describe('readInquiry', () => {
  it('trims field values and treats missing fields as empty', () => {
    const data = readInquiry(fakeForm({ name: '  Ada ', email: 'ada@example.com ', message: ' Hello there ' }));
    assert.deepEqual(data, { name: 'Ada', email: 'ada@example.com', need: '', message: 'Hello there', _gotcha: '' });
  });
});

describe('sendInquiry', () => {
  it('reports success only when Formspree accepts the message', async () => {
    let request;
    const result = await sendInquiry('https://formspree.io/f/test', valid, async (url, init) => {
      request = { url, init };
      return { ok: true, json: async () => ({ ok: true }) };
    });
    assert.deepEqual(result, { ok: true });
    assert.equal(request.url, 'https://formspree.io/f/test');
    assert.equal(request.init.method, 'POST');
    assert.equal(request.init.headers.Accept, 'application/json');
    assert.deepEqual(JSON.parse(request.init.body), valid);
  });

  it('passes Formspree error messages back when it rejects the message', async () => {
    const result = await sendInquiry('https://formspree.io/f/test', valid, async () => ({
      ok: false,
      json: async () => ({ errors: [{ message: 'Form not found.' }] }),
    }));
    assert.deepEqual(result, { ok: false, message: 'Form not found.' });
  });

  it('treats a network failure as a failed send', async () => {
    const result = await sendInquiry('https://formspree.io/f/test', valid, async () => {
      throw new TypeError('Failed to fetch');
    });
    assert.equal(result.ok, false);
  });

  it('treats an unreadable error response as a failed send', async () => {
    const result = await sendInquiry('https://formspree.io/f/test', valid, async () => ({
      ok: false,
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    }));
    assert.deepEqual(result, { ok: false, message: '' });
  });
});
