/**
 * WEDDING RSVP - Google Apps Script Backend
 *
 * Receives RSVP form submissions and sends a beautifully formatted
 * wedding-themed HTML email to the bride/recipient. Also sends a
 * matching auto-response email to the guest who submitted.
 *
 * NOTE: This file uses pure ASCII (HTML entities + Unicode escapes)
 * to prevent character corruption during clipboard paste.
 */

const RECIPIENT_EMAIL = 'francesofhelynponce@gmail.com';
const SENDER_NAME     = 'Wedding RSVP';

function doPost(e) {
  try {
    const data = e.parameter || {};

    if (data._honey) {
      return HtmlService.createHtmlOutput('<p>Thanks!</p>');
    }

    const name      = (data.Name || '').toString().trim();
    const email     = (data.Email || '').toString().trim();
    const guests    = (data['Number of Guests'] || '').toString().trim();
    const attending = (data.Attending || '').toString().trim();
    const message   = (data.Message || '').toString().trim();

    GmailApp.sendEmail(
      RECIPIENT_EMAIL,
      'New Wedding RSVP from ' + (name || 'a guest'),
      buildPlainTextEmail(name, email, guests, attending, message),
      {
        htmlBody: buildHtmlEmail(name, email, guests, attending, message),
        replyTo:  email || RECIPIENT_EMAIL,
        name:     SENDER_NAME
      }
    );

    if (email && email.indexOf('@') !== -1) {
      GmailApp.sendEmail(
        email,
        'Thank you for your RSVP',
        buildPlainAutoresponse(name),
        {
          htmlBody: buildHtmlAutoresponse(name),
          name:     SENDER_NAME
        }
      );
    }

    return HtmlService.createHtmlOutput(buildThankYouPage(name))
      .setTitle('Thank You - Wedding RSVP');

  } catch (err) {
    return HtmlService.createHtmlOutput(
      '<h2 style="font-family:sans-serif;color:#b00;">Sorry - something went wrong sending your RSVP.</h2>' +
      '<p style="font-family:sans-serif;">Please try again, or contact us directly.</p>' +
      '<pre style="font-size:11px;color:#999;">' + escapeHtml(err.toString()) + '</pre>'
    );
  }
}

function doGet() {
  return HtmlService.createHtmlOutput(
    '<p style="font-family:sans-serif;padding:40px;text-align:center;">' +
    'Wedding RSVP endpoint is live. Submit the form on your wedding site to use it.' +
    '</p>'
  );
}

// =================== EMAIL TO RECIPIENT ===================

function buildPlainTextEmail(name, email, guests, attending, message) {
  return [
    'New Wedding RSVP',
    '================',
    '',
    'Name:      ' + name,
    'Email:     ' + email,
    'Guests:    ' + guests,
    'Attending: ' + attending,
    '',
    'Message:',
    message || '(No message)',
    '',
    '-- Sent from your wedding website'
  ].join('\n');
}

function buildHtmlEmail(name, email, guests, attending, message) {
  const safeName      = name      ? escapeHtml(name)      : 'A guest';
  const safeEmail     = email     ? escapeHtml(email)     : '&mdash;';
  const safeGuests    = guests    ? escapeHtml(guests)    : '&mdash;';
  const safeAttending = attending ? escapeHtml(attending) : '&mdash;';
  const safeMessage   = escapeHtml(message);

  return ''
+ '<!DOCTYPE html>'
+ '<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>'
+ '<body style="margin:0;padding:0;background-color:#f8f5f0;font-family:Georgia,\'Times New Roman\',serif;">'
+ '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8f5f0;padding:40px 20px;">'
+ '<tr><td align="center">'
+ '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background-color:#ffffff;border:1px solid #e8e2d5;border-radius:8px;overflow:hidden;">'

+ '<tr><td style="background-color:#d4a574;padding:50px 40px;text-align:center;">'
+ '<p style="margin:0;color:#fff;font-size:13px;letter-spacing:5px;text-transform:uppercase;font-family:Arial,sans-serif;">&mdash; You have a new RSVP &mdash;</p>'
+ '<h1 style="margin:18px 0 0;color:#fff;font-size:42px;font-weight:normal;font-style:italic;">A Beautiful Yes &#x1F48D;</h1>'
+ '</td></tr>'

+ '<tr><td style="padding:40px 40px 10px;text-align:center;">'
+ '<p style="margin:0;color:#5a5147;font-size:17px;line-height:1.6;">A guest just responded to your wedding invitation.</p>'
+ '</td></tr>'

+ '<tr><td style="padding:20px 40px 30px;">'
+ '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf7f2;border-left:4px solid #d4a574;border-radius:4px;">'
+ '<tr><td style="padding:24px 28px;">'
+ '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">'

+   '<tr><td style="padding:6px 0;color:#a38660;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Guest Name</td></tr>'
+   '<tr><td style="padding-bottom:18px;color:#3a342c;font-size:22px;">' + safeName + '</td></tr>'

+   '<tr><td style="padding:6px 0;border-top:1px solid #e8e2d5;color:#a38660;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Email</td></tr>'
+   '<tr><td style="padding-bottom:18px;color:#3a342c;font-size:15px;font-family:Arial,sans-serif;">'
+     '<a href="mailto:' + safeEmail + '" style="color:#d4a574;text-decoration:none;">' + safeEmail + '</a>'
+   '</td></tr>'

+   '<tr><td style="padding:6px 0;border-top:1px solid #e8e2d5;color:#a38660;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Number of Guests</td></tr>'
+   '<tr><td style="padding-bottom:18px;color:#3a342c;font-size:18px;">' + safeGuests + '</td></tr>'

+   '<tr><td style="padding:6px 0;border-top:1px solid #e8e2d5;color:#a38660;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Attending</td></tr>'
+   '<tr><td style="padding-bottom:6px;color:#3a342c;font-size:18px;">' + safeAttending + '</td></tr>'

+ '</table></td></tr></table>'
+ '</td></tr>'

+ (safeMessage
   ? '<tr><td style="padding:0 40px 30px;">'
   + '<p style="margin:0 0 12px;color:#a38660;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">A note from ' + safeName + '</p>'
   + '<div style="padding:20px 24px;background-color:#fdfbf7;border-radius:4px;color:#5a5147;font-size:16px;line-height:1.7;font-style:italic;">'
   + '&ldquo;' + safeMessage + '&rdquo;'
   + '</div></td></tr>'
   : ''
  )

+ '<tr><td style="padding:30px 40px 40px;text-align:center;border-top:1px solid #f0ead8;">'
+ '<p style="margin:0;color:#a38660;font-size:13px;font-family:Arial,sans-serif;">&#x1F48C; Sent from your wedding website</p>'
+ '<p style="margin:8px 0 0;color:#c5b69c;font-size:12px;font-family:Arial,sans-serif;">Reply directly to this email to reach ' + safeName + '.</p>'
+ '</td></tr>'

+ '</table></td></tr></table>'
+ '</body></html>';
}

// =================== AUTO-RESPONSE TO GUEST ===================

function buildPlainAutoresponse(name) {
  return [
    'Hi ' + (name || 'there') + ',',
    '',
    'Thank you so much for sending in your RSVP -- your response means the world to us!',
    'We can\'t wait to celebrate this special day with you.',
    '',
    'We\'ll be in touch closer to the wedding with all the final details (venue map, schedule, dress code, etc).',
    '',
    'If anything changes on your end, just reply to this email and let us know.',
    '',
    'With love and gratitude,',
    'Frances'
  ].join('\n');
}

function buildHtmlAutoresponse(name) {
  const safeName = escapeHtml(name || 'Friend');

  return ''
+ '<!DOCTYPE html>'
+ '<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>'
+ '<body style="margin:0;padding:0;background-color:#f8f5f0;font-family:Georgia,\'Times New Roman\',serif;">'
+ '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8f5f0;padding:40px 20px;">'
+ '<tr><td align="center">'
+ '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background-color:#ffffff;border:1px solid #e8e2d5;border-radius:8px;overflow:hidden;">'

+ '<tr><td style="background-color:#d4a574;padding:60px 40px;text-align:center;">'
+ '<div style="color:#fff;font-size:48px;line-height:1;">&#x1F495;</div>'
+ '<h1 style="margin:20px 0 0;color:#fff;font-size:38px;font-weight:normal;font-style:italic;">Thank You, ' + safeName + '!</h1>'
+ '</td></tr>'

+ '<tr><td style="padding:50px 40px;text-align:center;color:#5a5147;font-size:17px;line-height:1.8;">'
+ '<p style="margin:0 0 20px;">Your RSVP has been received &mdash; your response means the world to us.</p>'
+ '<p style="margin:0 0 20px;">We can\'t wait to celebrate this special day with you.</p>'
+ '<p style="margin:0 0 20px;color:#a38660;font-size:15px;">We\'ll be in touch closer to the wedding with all the final details &mdash; venue map, schedule, and dress code.</p>'
+ '</td></tr>'

+ '<tr><td style="padding:0 40px 50px;text-align:center;border-top:1px solid #f0ead8;padding-top:30px;">'
+ '<p style="margin:0;color:#a38660;font-size:14px;font-style:italic;">With love and gratitude,</p>'
+ '<p style="margin:8px 0 0;font-family:Georgia,serif;font-size:28px;color:#3a342c;font-style:italic;">Frances &#x1F48D;</p>'
+ '</td></tr>'

+ '</table></td></tr></table>'
+ '</body></html>';
}

// =================== THANK-YOU PAGE (in browser) ===================

function buildThankYouPage(name) {
  const safeName = escapeHtml(name || '');
  const greeting = safeName ? 'Thank You, ' + safeName + '!' : 'Thank You!';

  return ''
+ '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">'
+ '<meta name="viewport" content="width=device-width,initial-scale=1.0">'
+ '<title>Thank You - Wedding RSVP</title>'
+ '<link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Poppins:wght@300;400&display=swap" rel="stylesheet">'
+ '<style>'
+ 'body{margin:0;padding:0;font-family:\'Poppins\',sans-serif;background-color:#f8f5f0;color:#5a5147;}'
+ '.wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 20px;box-sizing:border-box;}'
+ '.card{max-width:600px;width:100%;background:#fff;padding:60px 40px;text-align:center;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.06);border:1px solid #e8e2d5;}'
+ '.heart{font-size:64px;margin-bottom:24px;}'
+ '.label{text-transform:uppercase;letter-spacing:6px;font-size:12px;color:#d4a574;margin-bottom:16px;font-weight:500;}'
+ 'h1{font-family:\'Dancing Script\',cursive;font-size:60px;margin:0 0 24px;color:#3a342c;font-weight:600;line-height:1.1;}'
+ 'p{font-size:17px;line-height:1.7;margin:0 0 16px;}'
+ '.note{font-size:14px;color:#a38660;margin-top:24px;}'
+ '</style></head><body>'
+ '<div class="wrap"><div class="card">'
+ '<div class="heart">&#x1F48D;</div>'
+ '<div class="label">RSVP Received</div>'
+ '<h1>' + greeting + '</h1>'
+ '<p>Your RSVP has been sent successfully.<br>We can\'t wait to celebrate this special day with you.</p>'
+ '<p class="note">A confirmation has been sent to your email &mdash; we\'ll be in touch with the final wedding details soon.</p>'
+ '</div></div></body></html>';
}

// =================== HELPERS ===================

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
