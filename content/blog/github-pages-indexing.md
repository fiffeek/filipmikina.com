---
external: false
draft: false
showToc: true
heroImage: "/images/google_search_console_custom_domain_sitemaps.png"
title:
  How to Get Your GitHub Pages Indexed by Google and Bing in Days (Not Months)
description:
  Complete step-by-step guide to getting your GitHub Pages website indexed by
  Google and Bing search engines quickly. Learn how to configure robots.txt,
  sitemaps, and use Google Search Console and Bing Webmaster Tools to accelerate
  indexing.
date: 2025-10-21
tags:
  [
    "SEO",
    "GitHub Pages",
    "Google Search Console",
    "Bing Webmaster",
    "Search Engine Indexing",
    "robots.txt",
    "sitemap",
    "Web Development",
    "Static Site SEO",
  ]
keywords:
  [
    "GitHub Pages SEO",
    "index GitHub Pages",
    "how to get GitHub Pages indexed",
    "GitHub Pages not showing in Google",
    "Google Search Console",
    "Google Search Console verification",
    "Bing Webmaster Tools",
    "search engine indexing",
    "robots.txt",
    "sitemap.xml",
    "submit sitemap to Google",
    "submit sitemap to Bing",
    "GitHub Pages custom domain",
    "GitHub Pages subdomain",
    "speed up indexing",
    "get indexed fast",
    "get website on Google",
    "static site SEO",
    "Jekyll SEO",
    "Hugo SEO",
    "Astro SEO",
    "Docusaurus SEO",
    "VitePress SEO",
    "GitHub Pages visibility",
    "improve website indexing",
    "website not indexed",
    "DuckDuckGo indexing",
    "Yahoo search indexing",
    "search engine crawlers",
    "Googlebot",
    "Bingbot",
    "meta tag verification",
    "DNS verification",
    "CNAME record GitHub Pages",
    "GitHub Pages tutorial",
    "SEO for static websites",
    "index static site",
    "request indexing Google",
    "URL inspection tool",
    "sitemap configuration",
    "robots.txt configuration",
  ]
---

You've just deployed your shiny new GitHub Pages website, but there's a problem:
nobody can find it on Google. Search engines can
[take months](https://github.com/orgs/community/discussions/42375) to naturally
discover and index your site - if they find it at all.

The good news? You don't have to wait. This guide shows you exactly how to get
your site indexed by Google and Bing in just a few days instead of months,
making your content immediately discoverable to users on Google, Bing,
DuckDuckGo, Yahoo, and all other major search engines.

## Why Just Google and Bing? What About DuckDuckGo and Others?

You might wonder: "Shouldn't I submit my site to every search engine
individually?" Actually, no - you only need to focus on two.

**Google** dominates with roughly 90% of global search market share. Get indexed
here, and you're instantly visible to the vast majority of internet users.

**Bing** is the secret backbone of the search ecosystem. While Bing itself has
around 3% market share, many popular "alternative" search engines actually use
Bing's index behind the scenes:

- **DuckDuckGo** - Pulls most results from Bing's API
- **Yahoo** - 100% powered by Bing since 2010
- **Ecosia** - Uses Bing's search infrastructure
- **Qwant** - Relies partially on Bing's index

**The bottom line:** Get indexed on Google and Bing, and you've automatically
covered 95%+ of all search traffic across dozens of search engines. Let's get
started.

## Prerequisites: Setting Up for Search Engine Crawlers

Before we can tell Google and Bing about your site, we need to make sure it's
ready to be crawled. Think of this as rolling out the welcome mat for search
engine bots.

You'll need two key files: `robots.txt` (which tells crawlers they're welcome)
and `sitemap.xml` (which gives them a map of your site). Don't worry - if you're
using any modern static site generator, these are usually just a quick config
change away.

### Step 1: Configure robots.txt

Your
[robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
file is like a bouncer for your website. It tells search engine crawlers
(Googlebot, Bingbot, etc.) which parts of your site they're allowed to visit.

Without a proper robots.txt, you might accidentally be turning away the very
bots you want to visit. For GitHub Pages, this file needs to live at the root of
your deployed site (e.g., `https://username.github.io/robots.txt`).

Here's what a properly configured robots.txt looks like (you can
[view this site's robots.txt](https://www.filipmikina.com/robots.txt) as an
example):

```{% title="https://www.filipmikina.com/robots.txt" %}
User-agent: *
Allow: /

Sitemap: https://filipmikina.com/sitemap-0.xml
```

Here's what this means:

- `User-agent: *` - "Hey, this applies to ALL search engine bots"
- `Allow: /` - "You're welcome to crawl everything on my site"
- `Sitemap:` - "Here's a map to help you find all my pages"

**How to add this to your GitHub Pages site:**

Good news: most static site generators make this trivial. Usually, you just
create a `robots.txt` file in your `public/` directory, and it automatically
gets deployed to the root.

For example, on this Astro blog, it's just
[this file in public/robots.txt](https://github.com/fiffeek/filipmikina.com/blob/main/public/robots.txt).
That's it!

**Using plain HTML without a framework?** Just create a `robots.txt` file in the
root of your repository where your `index.html` lives. GitHub Pages will serve
it automatically.

**Framework-specific guides for adding robots.txt:**

- [Hugo](https://gohugo.io/templates/robots/)
- [Gatsby](https://github.com/mdreizin/gatsby-plugin-robots-txt)
- [Astro](https://github.com/alextim/astro-lib/tree/main/packages/astro-robots-txt)
- [VitePress](https://vitepress.dev/guide/asset-handling#the-public-directory)
- [Docusaurus](https://docusaurus.io/docs/seo#robots-file)
- [Next.js](https://nextjs.org/docs/pages/api-reference/file-conventions/public-folder#robots-favicons-and-other)
- [Nuxt](https://github.com/nuxt-modules/robots)
- [VuePress](https://vuepress.vuejs.org/guide/assets.html#public-files)

### Step 2: Generate and Configure Your Sitemap

Your
[sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
is literally a map of your website. It's an XML file that lists every important
page you want search engines to know about. Instead of search bots wandering
around trying to find all your pages, you're handing them a complete directory.

Here's an example of what a sitemap looks like
([view this site's sitemap](https://www.filipmikina.com/sitemap-0.xml)):

```xml {% title="www.filipmikina.com/sitemap-0.xml" %}
<?xml version="1.0" encoding="UTF-8"?>
<urlset
	xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
	xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
	xmlns:xhtml="http://www.w3.org/1999/xhtml"
	xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
	xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
	<url>
		<loc>https://filipmikina.com/</loc>
	</url>
	<url>
		<loc>https://filipmikina.com/blog/</loc>
	</url>
</urlset>
```

**Important:** Never write your sitemap by hand - it will quickly become
outdated as you add content. All modern static site generators can automatically
generate and maintain your sitemap for you.

**Using plain HTML without a framework?** You'll need a sitemap generator tool.
Try [XML Sitemaps Generator](https://www.xml-sitemaps.com/) or install a simple
tool like [sitemap-generator](https://www.npmjs.com/package/sitemap-generator)
to create one automatically.

**Framework-specific sitemap configuration:**

- [Jekyll](https://github.com/jekyll/jekyll-sitemap)
- [Hugo](https://gohugo.io/templates/sitemap/)
- [Astro](https://docs.astro.build/en/guides/integrations-guide/sitemap)
- [VitePress](https://vitepress.dev/guide/sitemap-generation)
- [Docusaurus](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-sitemap)
- [VuePress](https://ecosystem.vuejs.press/plugins/seo/sitemap/guide.html)

**Verification step:** After deployment, verify both files are accessible by
visiting `https://your-site.com/robots.txt` and
`https://your-site.com/sitemap-0.xml` (or similar) in your browser. You should
see the actual file contents displayed, not a 404 error page.

## Getting Indexed on Google Search Console

Now comes the important part: actively requesting indexing from Google. To do
this, you need to prove ownership of your GitHub Pages site. There are two
scenarios:

1. **Using GitHub's default domain** (`username.github.io/project`)
2. **Using a custom domain** (`your-domain.com`)

Both methods work, but the verification process differs slightly. We'll cover
both approaches below. Once you're verified on Google, you can easily import
your site to Bing Webmaster Tools (covered later).

### Option 1: Using GitHub's Default Domain

If you're using GitHub's default domain format (`username.github.io/project`),
follow these steps. We'll use `fiffeek.github.io/docs-test` as an example
throughout.

**Step 1:** Navigate to
[Google Search Console](https://search.google.com/search-console/welcome) and
enter your full URL in the **URL prefix** field on the right side:

![Google Search Console welcome page with two options: Domain property on the left and URL prefix on the right. Enter your full GitHub Pages URL in the URL prefix field.](/images/google_search_console_welcome.png)

**Step 2:** Google will ask you to verify ownership. The easiest method is using
an **HTML meta tag**. Click on the HTML tag option:

![Verification methods page in Google Search Console showing multiple options: HTML file, HTML tag, Google Analytics, and others. The HTML tag option is the easiest for GitHub Pages.](/images/google_search_console_verify.png)

**Step 3:** Expand the HTML tag section to reveal your unique verification code:

![Expanded HTML tag verification section showing a meta tag code snippet beginning with 'google-site-verification' that you'll copy and paste into your site's head section.](/images/google_search_console_tag.png)

**Step 4:** Copy the meta tag and add it to your site's `<head>` section. The
implementation varies by framework.

For example, with Docusaurus, you can add it to your config file
([see the actual commit](https://github.com/fiffeek/docs-test/commit/cca6db43d1a42199e528cc4bb8a7a6e2cbdfa858)):

```typescript {% title="docusaurus.config.ts" %}
headTags: [
  {
    tagName: 'meta',
    attributes: {
      name: 'google-site-verification',
      content: 'LaGbZet27I9VYSccGGJ1xGrpwg4lm8xlEOkBu4DGnn4',
    },
  },
],
```

After deploying, verify the tag appears in your page source. To check: visit
your site in a browser, right-click anywhere on the page, select "View Page
Source" (or press `Ctrl+U` / `Cmd+U`), and look for this meta tag in the
`<head>` section:

```html
<meta
  name="google-site-verification"
  content="LaGbZet27I9VYSccGGJ1xGrpwg4lm8xlEOkBu4DGnn4"
/>
```

**Framework-specific guides for adding meta tags:**

- [Hugo](https://anantcode.github.io/posts/2022-05-03-google-search-console-verification-with-papermod-hugo/)
- [Astro](https://github.com/satnaing/astro-paper/discussions/334)
- [Docusaurus](https://docusaurus.io/docs/markdown-features/head-metadata)
- [VitePress](https://vitepress-theme-default-plus.lando.dev/guides/adding-page-metadata.html)
- [VuePress](https://vuepress-theme-default-plus.lando.dev/adding-page-metadata.html)

**Step 5:** Once deployed and verified in your page source, click the **Verify**
button in Google Search Console:

![Successful ownership verification in Google Search Console with a green checkmark confirming your site has been verified and added to the console.](/images/google_search_console_verify_success.png)

**Step 6:** Submit your sitemap. Navigate to the Sitemaps section in the left
sidebar and enter just your sitemap filename (e.g., `sitemap-0.xml` or
`sitemap.xml` - not the full URL):

![Google Search Console sidebar menu with the 'Sitemaps' option highlighted under the Indexing section.](/images/google_search_console_sitemaps.png)

!['Add a new sitemap' input field where you enter 'sitemap-0.xml' and click Submit to tell Google about your site's structure.](/images/google_search_console_sitemap_enter.png)

**Step 7 (Optional):** Request priority indexing for specific pages. Enter any
URL from your site in the search bar at the top:

![URL inspection search bar at the top of Google Search Console where you paste any page URL to check its indexing status.](/images/google_search_console_top_bar.png)

**Step 8:** You'll likely see the page isn't indexed yet (this is normal for new
sites):

!['URL is not on Google' message indicating the page hasn't been discovered or indexed yet by Google's crawlers - don't worry, this is expected.](/images/google_search_console_not_loaded.png)

**Step 9:** Click **Request indexing** after running a live test to verify the
page loads correctly:

!['Request Indexing' button that appears after testing a live URL - clicking this adds your page to Google's priority crawl queue.](/images/google_search_console_request_indexing.png)

### Option 2: Using a Custom Domain or Subdomain

If you're using a custom domain (like `docs.yourdomain.com`), the process is
similar but involves DNS configuration. This example uses
[hyprdynamicmonitors.filipmikina.com](https://hyprdynamicmonitors.filipmikina.com/)
as a reference.

For detailed GitHub Pages domain setup, refer to the
[official GitHub documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

#### Step 1: Configure the CNAME File

When you set a custom domain in your GitHub repository settings:

![GitHub Pages settings page with the 'Custom domain' input field where you enter your custom subdomain like 'docs.yourdomain.com'.](/images/github_custom_domain.png)

GitHub automatically creates a
[CNAME file](https://github.com/fiffeek/hyprdynamicmonitors/commit/c0eb6bef13fcf6d6e8b8c548787985b57072d30d)
in your `gh-pages` branch:

```text {% title="CNAME" %}
hyprdynamicmonitors.filipmikina.com
```

**Important:** Most static site generators will overwrite this file during
deployment. To prevent this, add the CNAME file to your source code so it gets
included in every build.

For Docusaurus, add it to your static folder
([example](https://github.com/fiffeek/hyprdynamicmonitors/blob/main/docs/static/CNAME)):

```text {% title="docs/static/CNAME" %}
hyprdynamicmonitors.filipmikina.com
```

**Framework-specific CNAME configuration:**

- [VuePress](https://v1.vuepress.vuejs.org/guide/deploy.html#github-pages)
- [VitePress](https://vitepress.dev/guide/asset-handling#the-public-directory)
- [Hugo](https://gohugo.io/host-and-deploy/host-on-github-pages/) - place in
  `static/CNAME`
- [Jekyll](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site) -
  place in docs root `/CNAME`
- [Astro](https://docs.astro.build/en/guides/deploy/github/#change-your-github-url-to-a-custom-domain)
- [Docusaurus](https://docusaurus.io/docs/deployment#deploying-to-github-pages)

#### Step 2: Update Your Site's Base URL

Configure your static site generator to use the custom domain as the base URL.

For Docusaurus:

```typescript {% title="docusaurus.config.ts" %}
const config: Config = {
  url: "https://hyprdynamicmonitors.filipmikina.com",
};
```

**Framework-specific URL configuration:**

- [Jekyll](https://jekyllrb.com/docs/configuration/options/)
- [Hugo](https://gohugo.io/configuration/all/#baseurl)
- [Astro](https://docs.astro.build/en/reference/configuration-reference/#site)
- [VitePress](https://vitepress.dev/reference/site-config#base)
- [Docusaurus](https://docusaurus.io/docs/configuration#url)

#### Step 3: Configure DNS with Your Domain Provider

Navigate to your domain provider's DNS management page and create a CNAME record
pointing your subdomain to GitHub Pages. For example, `hyprdynamicmonitors` →
`fiffeek.github.io`:

![Domain provider's DNS settings with a CNAME record where the subdomain 'hyprdynamicmonitors' points to 'fiffeek.github.io', routing your custom domain traffic to GitHub Pages.](/images/square_custom_cname.png)

Verify DNS propagation by opening your terminal and running this command
(replace with your domain):

```bash
dig hyprdynamicmonitors.filipmikina.com +noall +answer -t A
```

Expected output showing your CNAME is properly configured:

```bash
hyprdynamicmonitors.filipmikina.com. 9466 IN CNAME fiffeek.github.io.
fiffeek.github.io.      2371    IN      A       185.199.108.153
fiffeek.github.io.      2371    IN      A       185.199.109.153
fiffeek.github.io.      2371    IN      A       185.199.110.153
fiffeek.github.io.      2371    IN      A       185.199.111.153
```

Once propagated, your site should be accessible at your custom domain (e.g.,
[hyprdynamicmonitors.filipmikina.com](https://hyprdynamicmonitors.filipmikina.com/)).

#### Step 4: Verify Domain Ownership in Google Search Console

If you haven't already verified your root domain in Google Search Console,
you'll need to do that first. This step proves you own the entire domain (not
just the subdomain):

1. Go to
   [Google Search Console](https://search.google.com/search-console/welcome) and
   enter your root domain (not subdomain) in the **Domain** field on the left:

![Google Search Console with the 'Domain' property option on the left where you enter your root domain like 'filipmikina.com' without subdomain or protocol.](/images/google_search_console_custom_domain.png)

2. Google will provide a TXT record that you need to add to your DNS settings to
   prove ownership:

![DNS verification instructions showing a TXT record value starting with 'google-site-verification=' to copy and add to your domain's DNS.](/images/google_search_console_verify_custom_domain.png)

3. Add the TXT record to your domain provider's DNS management panel:

![Domain provider's DNS settings with a new TXT record where the record name is '@' and the value is the google-site-verification string from Google.](/images/square_custom_google.png)

4. Wait for DNS propagation (usually 5-30 minutes), then click **Verify** in
   Google Search Console.

#### Step 5: Submit Your Sitemap

With your domain verified, navigate to the Sitemaps section and submit your
sitemap:

![Sitemaps section in Google Search Console showing the sitemap submission interface where you enter your sitemap URL and check its status.](/images/google_search_console_custom_domain_sitemaps.png)

You can also request individual pages to be indexed using the same URL
inspection process described in Option 1, Steps 7-9.

## Getting Indexed on Bing (The Easy Way)

Here's the good news: once you've set up Google Search Console, getting indexed
on Bing is incredibly simple. Bing Webmaster Tools can import your verified
sites directly from Google Search Console, saving you from repeating the
verification process.

**Step 1:** Navigate to [Bing Webmaster Tools](https://www.bing.com/webmasters/)
and sign in with your Microsoft account.

**Step 2:** Choose the **Import from Google Search Console** option:

![Bing Webmaster Tools welcome page with the 'Import from Google Search Console' button that automatically imports all your verified sites and settings from Google.](/images/bing_webmaster.png)

**Step 3:** Authorize Bing to access your Google Search Console data. Your
sites, sitemaps, and verification will be automatically imported - no manual
configuration needed!

**Step 4 (Optional):** Use the
[Bing URL Inspection Tool](https://www.bing.com/webmasters/urlinspection) to
request priority indexing for specific pages, just like you did with Google
Search Console.

## What to Expect

After completing these steps, you should see your pages start appearing in
search results within:

- **Google**: 3-7 days for most pages
- **Bing**: 5-10 days for most pages
- **DuckDuckGo, Yahoo, Ecosia**: Same as Bing (since they use Bing's index)

Remember that search engines continuously crawl and update their indexes. Your
sitemap will help them discover new content automatically as you publish it.

## Quick Troubleshooting

If your pages aren't being indexed:

1. **Verify robots.txt** - Make sure you're not accidentally blocking search
   engines
2. **Check your sitemap** - Ensure it's accessible and contains valid URLs
3. **Review Search Console errors** - Both Google and Bing provide detailed
   error reports
4. **Be patient** - Initial indexing can take up to 2 weeks in some cases
5. **Submit individual URLs** - Use the URL inspection tools to prioritize
   important pages

With these steps completed, your GitHub Pages site will be discoverable across
all major search engines, helping users find your content quickly and easily.
