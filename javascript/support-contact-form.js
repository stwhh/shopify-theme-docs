(function () {
  const SDK_SRC = 'https://forminit.com/sdk/v1/forminit.js';

  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
      return;
    }
    callback();
  }

  function loadSdk(callback) {
    if (typeof Forminit !== 'undefined') {
      callback();
      return;
    }

    const existing = document.querySelector('script[src="' + SDK_SRC + '"]');
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        callback();
        return;
      }
      existing.addEventListener('load', callback, { once: true });
      existing.addEventListener('error', function () {
        showGlobalError('Could not load Forminit. Check your connection or email us directly.');
      }, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = SDK_SRC;
    script.async = true;
    script.onload = function () {
      script.dataset.loaded = 'true';
      callback();
    };
    script.onerror = function () {
      showGlobalError('Could not load Forminit. Check your connection or email us directly.');
    };
    document.body.appendChild(script);
  }

  function showGlobalError(message) {
    const status = document.getElementById('support-contact-form-status');
    if (!status) return;
    status.textContent = message;
    status.className = 'support-contact-form__status support-contact-form__status--error';
  }

  function initSupportContactForm() {
    const form = document.getElementById('support-contact-form');
    if (!form) return;

    const formId = (form.dataset.forminitId || '').trim();
    if (!formId || formId === 'YOUR_FORMINIT_FORM_ID') {
      showGlobalError('Support form is not configured yet. Email stwhh572@gmail.com instead.');
      return;
    }

    const status = document.getElementById('support-contact-form-status');
    const button = form.querySelector('button[type="submit"]');
    const defaultLabel = button ? button.textContent : 'Send message';

    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      if (typeof Forminit === 'undefined') {
        showGlobalError('Form is still loading. Please try again in a moment.');
        return;
      }

      const forminit = new Forminit();

      if (status) {
        status.textContent = 'Sending…';
        status.className = 'support-contact-form__status support-contact-form__status--loading';
      }
      if (button) {
        button.disabled = true;
        button.textContent = 'Sending…';
      }

      try {
        const { error } = await forminit.submit(formId, new FormData(form));

        if (error) {
          if (status) {
            status.textContent = error.message || 'Something went wrong. Please try again or email us directly.';
            status.className = 'support-contact-form__status support-contact-form__status--error';
          }
          return;
        }

        form.reset();
        if (status) {
          status.textContent =
            'Thank you! We received your message and will reply within 1–2 business days.';
          status.className = 'support-contact-form__status support-contact-form__status--success';
        }
      } catch (err) {
        if (status) {
          status.textContent = err && err.message ? err.message : 'Network error. Please try again or email us directly.';
          status.className = 'support-contact-form__status support-contact-form__status--error';
        }
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = defaultLabel;
        }
      }
    });
  }

  onReady(function () {
    loadSdk(initSupportContactForm);
  });
})();
