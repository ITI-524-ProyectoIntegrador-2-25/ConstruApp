export const BASE_URL = 'https://smartbuild-001-site1.ktempurl.com';

const joinURL = (base, path) => `${base.replace(/\/+$/,'')}/${String(path).replace(/^\/+/,'')}`;
const toURL = (path) => /^https?:\/\//i.test(path) ? path : joinURL(BASE_URL, path);

export const http = {
  async request(method, url, opts = {}) {
    const { params, data, headers } = opts;
    let finalURL = toURL(url);

    if (params && typeof params === 'object') {
      const usp = new URLSearchParams();
      for (const [k,v] of Object.entries(params)) {
        if (v === undefined || v === null) continue;
        usp.append(k, String(v));
      }
      finalURL += (finalURL.includes('?') ? '&' : '?') + usp.toString();
    }

    const hasBody = ['POST','PUT','PATCH','DELETE'].includes(method) && data != null;

    const started = Date.now();
    console.debug('[HTTP][REQ]', { method, url: finalURL, params: params || null, bodyPreview: hasBody ? data : null });

    const res = await fetch(finalURL, {
      method,
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        Accept: 'application/json, text/plain, */*',
        ...(hasBody ? { 'Content-Type': 'application/json; charset=utf-8' } : {}),
        ...(headers || {})
      },
      body: hasBody ? JSON.stringify(data) : undefined,
    });

    const elapsed = Date.now() - started;
    const ct = res.headers.get('content-type') || '';
    const payload = ct.includes('application/json') ? await res.json() : await res.text();

    console.debug('[HTTP][RES]', { method, url: finalURL, status: res.status, statusText: res.statusText, ms: elapsed, contentType: ct });

    if (!res.ok) {
      console.error('[HTTP][ERR]', { method, url: finalURL, status: res.status, statusText: res.statusText, responsePreview: payload });
      throw new Error(`HTTP ${res.status} ${res.statusText} :: ${typeof payload === 'string' ? payload : JSON.stringify(payload)}`);
    }

    return payload;
  },
  get(url, opts) { return this.request('GET', url, opts); },
  post(url, opts) { return this.request('POST', url, opts); },
  put(url, opts)  { return this.request('PUT',  url, opts); },
  patch(url, opts){ return this.request('PATCH',url, opts); },
  delete(url, opts){return this.request('DELETE',url, opts); },
};
