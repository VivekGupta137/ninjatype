<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />
  <xsl:template match="/rss">
    <html lang="en">
      <head>
        <title><xsl:value-of select="channel/title" /> — RSS feed</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { color: #e5e5e5; background: #101010; font: 16px/1.7 system-ui, sans-serif; max-width: 760px; margin: 0 auto; padding: 48px 24px; }
          a { color: #a7c7ff; text-underline-offset: 4px; }
          h1 { font-size: 1.8rem; line-height: 1.3; }
          h2 { font-size: 1.2rem; margin-bottom: 8px; }
          p { color: #bdbdbd; }
          article { border-top: 1px solid #333; padding: 16px 0; }
          code { overflow-wrap: anywhere; }
          .date { font-size: .8rem; }
        </style>
      </head>
      <body>
        <header>
          <a href="{channel/link}">NinjaType</a>
          <h1><xsl:value-of select="channel/title" /></h1>
          <p>This is an RSS feed. Copy its address into your feed reader to follow new typing guides and updates.</p>
          <p><xsl:value-of select="channel/description" /></p>
        </header>
        <main>
          <xsl:for-each select="channel/item">
            <article>
              <h2><a href="{link}"><xsl:value-of select="title" /></a></h2>
              <p class="date"><xsl:value-of select="pubDate" /></p>
              <p><xsl:value-of select="description" /></p>
            </article>
          </xsl:for-each>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
