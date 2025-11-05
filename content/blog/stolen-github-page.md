---
external: false
draft: false
showToc: true
heroImage: /images/github_stolen_error.png
title:
  "GitHub Pages Domain Hijacking: A Cautionary Tale About Subdomain Takeovers"
description:
  A cautionary tale about subdomain takeovers on GitHub Pages. Learn how
  attackers can hijack your custom domains, what the security implications are,
  and most importantly - how to protect yourself with domain verification.
date: 2025-11-04
tags:
  - Security
  - GitHub Pages
  - DNS
  - Domain Takeover
  - Web Security
keywords:
  - subdomain takeover
  - GitHub Pages security
  - domain hijacking
  - DNS security
  - CNAME takeover
  - GitHub domain verification
  - subdomain hijacking prevention
  - dangling DNS records
  - GitHub Pages vulnerability
  - DNS hijacking
  - web security best practices
  - OWASP subdomain takeover
---

Picture this: you wake up, grab your coffee, and casually check your email.
Sitting in your inbox is a message from Google Search Console about security
issues on your domain. Your heart sinks. You navigate to your subdomain, and
instead of your carefully crafted GitHub Pages site, you're greeted with... a
sketchy online casino?

Welcome to the world of subdomain takeovers. This is exactly what happened to
me, and it can happen to you too.

## The wake-up call

One morning, I received this email from Google Search Console:
![Google Search Console warning about security issues on my subdomain](/images/google_search_console_email.png)

Someone had hijacked my subdomain `gh.filipmikina.com`. Opening it in a browser
confirmed the worst - my subdomain was now serving a malicious gambling website
to anyone who visited.

**The immediate response**: I jumped into my DNS provider's dashboard and nuked
the entries for `gh.filipmikina.com`. Actually, I pointed them to my internal
servers first (faster than waiting for deletion to propagate). Unfortunately,
with a 4-hour DNS TTL on that record, the malicious site was still accessible
during the propagation window.

Crisis contained. But the real question remained: **how did this happen?**

If you're running GitHub Pages on a custom domain, you need to read this. I've
also written a more detailed guide on
[GitHub Pages deployments with custom subdomains](./github-pages-indexing) if
you want to dive deeper.

## How was I using gh.filipmikina.com?

Here's where I made my mistake. While experimenting with GitHub Pages
deployments, I was testing different subdomain configurations. My initial idea
was to route `gh.filipmikina.com/${project}` to `fiffeek.github.io/${project}`.
Spoiler: that doesn't work. The correct approach is `${project}.filipmikina.com`
pointing to `fiffeek.github.io/${project}`.

During this testing phase, I set up the DNS records - specifically a `CNAME`
record pointing to `fiffeek.github.io` on my DNS provider's side. I even
verified the domain at the repository level.

Then I made the critical error: **I abandoned the subdomain without cleaning**
**up the DNS records**. The CNAME still pointed to GitHub Pages, but no
repository was actually using it. This created what's known as a "dangling DNS
record" - and that's exactly what attackers hunt for.

## What did the attackers do?

The attack is embarrassingly simple. The attacker found my dangling subdomain,
created a repository, and claimed **my** subdomain as their own:
![GitHub Pages custom domain configuration showing how easy it is to claim any domain](/images/github_project_domain_request.png)

Here's the kicker: **GitHub doesn't validate ownership before routing traffic.**
It doesn't matter that my `CNAME` record pointed to `fiffeek.github.io` - GitHub
will happily serve content from _any_ repository that claims the domain, as long
as some `CNAME` record exists in DNS.

Think about that for a moment. An attacker doesn't need to compromise your
GitHub account, your DNS provider, or anything else. They just need to:

1. Find a subdomain with a dangling CNAME to GitHub Pages
2. Add it to their own repository
3. Wait for traffic to flow their way

### GitHub's warnings (that are easy to miss)

To be fair, GitHub does warn about this in their documentation - but these
warnings are buried and easy to overlook.

In the
[subdomain configuration docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-a-subdomain),
they mention:

> These records put you at an immediate risk of domain takeovers

And there's a tip hidden in
[their custom domains guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages#supported-custom-domains):

> We recommend verifying your custom domain prior to adding it to your
> repository, in order to improve security and avoid takeover attacks.

But here's the problem: **verification isn't required.** You can add any
subdomain to your repository without verification. It's optional, not enforced.

### What is a domain takeover?

A subdomain takeover happens when an attacker gains control over a subdomain of
a domain they don't own. This typically occurs when:

1. A subdomain has a DNS record (usually CNAME) pointing to an external service
2. The resource on that external service is decommissioned or unclaimed
3. An attacker claims that resource on the external service
4. Traffic to the subdomain now flows to the attacker's content

For a comprehensive resource on subdomain takeovers across different platforms,
check out
[can-i-take-over-xyz](https://github.com/EdOverflow/can-i-take-over-xyz).

#### Security implications

The security impact of subdomain takeovers is often underestimated. Here's what
an attacker can do once they control your subdomain:

**1. Phishing attacks** Your subdomain has the implicit trust of your main
domain. Attackers can create convincing phishing pages that users will trust
because they're on "your" domain. Imagine `login.yourcompany.com` serving a fake
login page.

**2. Session hijacking and cookie theft** If your main domain sets cookies
without the `Secure` and `HttpOnly` flags properly configured, or uses broad
cookie domains (`.yourcompany.com`), attackers can steal session cookies from
users visiting the compromised subdomain.

**3. Reputation damage** In my case, Google Search Console flagged the malicious
gambling site, which could hurt my domain's search rankings. More importantly,
it damages trust with visitors who associate malicious content with your brand.

**4. XSS and CORS attacks** Depending on your CORS configuration, attackers
might be able to make authenticated requests to your main domain's API.
Same-origin policy treats subdomains as part of the same origin in certain
contexts.

**5. Email and OAuth bypasses** Many systems trust email addresses with your
domain. Some OAuth implementations might trust callbacks to any subdomain. A
compromised subdomain can bypass these security checks.

**6. SEO poisoning** Attackers can use your domain's authority to rank malicious
content, while simultaneously tanking your domain's search reputation.

The financial and reputational damage can be substantial. One report documented
over 5,000 GitHub Pages subdomains vulnerable to takeovers - that's 5,000
potential phishing sites with the implicit trust of legitimate brands.

## What exactly happened in my case?

The attack timeline was straightforward:

1. **I created the vulnerability**: Set up `gh.filipmikina.com` with a `CNAME`
   record pointing to `fiffeek.github.io`
2. **I abandoned the subdomain**: Stopped using it but never removed the DNS
   records
3. **Attacker discovered it**: Using automated scanning tools, they found my
   dangling subdomain
4. **Attacker claimed it**: They created a repository (likely named
   `gh.filipmikina.com`) and added my subdomain to their GitHub Pages
   configuration
5. **Attack deployed**: They published a static malicious gambling site
6. **Google detected it**: Search Console flagged the security issue and alerted
   me

The attacker didn't need any special access or sophisticated tools. They likely
used one of many subdomain takeover scanners that constantly probe for dangling
DNS records.

For more technical details on GitHub Pages takeovers, check out
[this excellent writeup](https://github.com/EdOverflow/can-i-take-over-xyz/issues/68#issuecomment-1949450029)
from another security researcher.

## How to prevent subdomain takeovers

The good news? Protecting yourself is straightforward. Here's what you need to
do:

### 1. Verify your domain at the account/organization level (CRITICAL)

This is the single most important step. According to
[GitHub's documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages#about-domain-verification-for-github-pages):

> When you verify a custom domain for your personal account, only repositories
> owned by your personal account may be used to publish a GitHub Pages site to
> the verified custom domain or the domain's immediate subdomains.

Once verified, **only you** (or your organization) can use that domain and its
subdomains for GitHub Pages. Other users will be blocked from claiming them.

**How to verify:**

1. Go to your [GitHub Pages settings](https://github.com/settings/pages)
2. Add your root domain (e.g., `filipmikina.com`)
3. GitHub will provide a `TXT` record to add to your DNS
4. Add the TXT record to your DNS provider
5. Wait for verification (usually a few minutes)

![GitHub domain verification showing the domain is verified and protected](/images/github_domain_verified.png)

Once verified, the takeover attack becomes impossible. GitHub will reject any
attempt by another user to claim your domain or subdomains.

### 2. Clean up dangling DNS records

Before decommissioning any subdomain:

- Remove the DNS records (CNAME, A, AAAA) from your DNS provider
- Remove the custom domain from the GitHub Pages repository settings
- Double-check that no orphaned records remain

**Pro tip**: Audit your DNS records regularly. Look for any CNAME records
pointing to external services that you're no longer actively using.

### 3. Use monitoring and alerting

- Enable Google Search Console for your domain - it caught my takeover
- Consider using a subdomain takeover scanner in your CI/CD pipeline
- Set up DNS monitoring to alert you of unexpected changes
- Tools like
  [can-i-take-over-xyz](https://github.com/EdOverflow/can-i-take-over-xyz) can
  help you audit your infrastructure

### 4. Minimize your attack surface

- Don't create subdomains "just in case" - only create them when needed
- Delete test subdomains immediately after testing
- Document all your active subdomains and their purposes
- Regular audits: review all DNS records quarterly

### 5. Configure DNS with security in mind

- Use shorter TTL values during testing (easier to fix mistakes quickly)
- Increase TTL values for production records (but not too high - 1 hour is
  reasonable)
- Enable DNSSEC if your DNS provider supports it
- Consider using wildcard DNS records carefully - they're particularly
  vulnerable

## Lessons learned

This incident taught me several valuable lessons:

1. **Cleanup matters**: Abandoned subdomains are security vulnerabilities. Treat
   DNS records like code - delete what you don't use.

2. **Security by default**: GitHub's verification should be mandatory, not
   optional. The fact that it's a "recommendation" means most users won't do it.

3. **Monitor everything**: Google Search Console saved me. Without it, I might
   not have noticed for weeks or months.

4. **The cloud is different**: Traditional security thinking doesn't always
   apply. An attacker doesn't need to "break in" - they just need to claim
   unclaimed resources.

5. **Documentation isn't enough**: GitHub documents this risk, but most
   developers won't read the documentation thoroughly. Security features should
   be opt-out, not opt-in.

## Final thoughts

Subdomain takeovers are a preventable vulnerability, but they require awareness
and proactive security measures. The attack pattern is simple, the tools are
freely available, and the potential damage is significant.

If you're using GitHub Pages with custom domains (or any similar service),
verify your domain **right now**. It takes 5 minutes and could save you from a
major security incident.

And please, clean up your old DNS records. Your future self will thank you.

## Additional resources

Want to dive deeper? Here are some excellent resources:

- [How I Took Over 5,000 GitHub Pages Domains](https://gsociety.fr/the-great-subdomain-heist/) -
  A fascinating look at mass subdomain takeovers
- [can-i-take-over-xyz](https://github.com/EdOverflow/can-i-take-over-xyz) -
  Comprehensive guide to subdomain takeovers across platforms
- [GitHub Pages Domain Verification](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages) -
  Official documentation

Stay safe out there!
