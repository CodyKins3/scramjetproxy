// server.js
const express = require('express');
const fetch = require('node-fetch'); // node-fetch v2 style require
const cheerio = require('cheerio');
const bodyParser = require('body-parser');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Very small helper to make proxied URLs: /proxy?url=<encoded>
function proxyUrlFor(targetUrl) {
  return '/proxy?url=' + encodeURIComponent(targetUrl);
}

function isHtmlContentType(contentType) {
  return contentType && contentType.toLowerCase().includes('text/html');
}

app.get('/proxy', async (req, res) => {
  const target = req.query.url;
  if (!target) {
    return res.status(400).send('Missing url parameter. Example: /proxy?url=' + encodeURIComponent('https://example.com'));
  }

  let targetUrl;
  try {
    targetUrl = new URL(target);
  } catch (err) {
    return res.status(400).send('Invalid URL');
  }

  try {
    // Forward some headers from the client if needed:
    const fetchOptions = {
      method: 'GET',
      headers: {
        // minimal headers. Add or forward others (User-Agent, Cookie) if necessary
        'User-Agent': req.headers['user-agent'] || 'SimpleProxy/1.0'
      },
      redirect: 'follow',
      // optionally add timeout or other options
    };

    const upstream = await fetch(targetUrl.toString(), fetchOptions);

    // Pass through status code for better transparency
    res.status(upstream.status);

    // Copy chosen response headers (Content-Type, Set-Cookie if required, etc.)
    const contentType = upstream.headers.get('content-type') || '';
    if (upstream.headers.get('set-cookie')) {
      // caution: set-cookie handling may need to be careful (domains, secure flags)
      res.set('set-cookie', upstream.headers.get('set-cookie'));
    }
    if (contentType) res.set('content-type', contentType);

    // If HTML, rewrite links so subsequent navigations go through our proxy
    if (isHtmlContentType(contentType)) {
      const bodyText = await upstream.text();

      // Load HTML into cheerio
      const $ = cheerio.load(bodyText, { decodeEntities: false });

      // Convert relative URLs to absolute using base URL (if <base> exists handle that)
      const baseHref = $('base').attr('href') || targetUrl.origin + targetUrl.pathname;

      // Elements & attributes to rewrite: a[href], link[href], script[src], img[src], form[action], iframe[src]
      const ATTR_SELECTORS = [
        {sel: 'a', attr: 'href'},
        {sel: 'link', attr: 'href'},
        {sel: 'script', attr: 'src'},
        {sel: 'img', attr: 'src'},
        {sel: 'iframe', attr: 'src'},
        {sel: 'form', attr: 'action'}
      ];

      ATTR_SELECTORS.forEach(({sel, attr}) => {
        $(sel).each((i, el) => {
          const $el = $(el);
          const original = $el.attr(attr);
          if (!original) return;

          // ignore anchors like "mailto:", "tel:", "javascript:"
          const lower = original.trim().toLowerCase();
          if (lower.startsWith('mailto:') || lower.startsWith('tel:') || lower.startsWith('javascript:') || lower.startsWith('#')) {
            return;
          }

          // build absolute URL from base if needed
          let abs;
          try {
            abs = new URL(original, baseHref).toString();
          } catch (err) {
            // if can't parse, skip
            return;
          }

          // For forms, we will keep method; action must be proxied
          // Replace attribute with proxy URL that points to our /proxy endpoint
          const proxied = proxyUrlFor(abs);
          $el.attr(attr, proxied);
        });
      });

      // Inject a tiny banner so we know it's proxied (optional)
      $('body').prepend(`<div style="background:#222;color:#fff;padding:6px;font-family:Arial;font-size:13px;">
        Proxied: ${targetUrl.hostname} — <a href="/" style="color:#9cf">Home</a>
      </div>`);

      // Return modified HTML
      res.send($.html());
      return;
    }

    // Non-HTML: stream or buffer and pass back. We'll buffer for simplicity.
    const buffer = await upstream.buffer();
    res.send(buffer);

  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).send('Error fetching target: ' + String(err.message || err));
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
  console.log('Open http://localhost:' + PORT + ' in your browser');
});
