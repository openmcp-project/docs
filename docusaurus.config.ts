import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Open Managed Control Plane (openMCP)',
  tagline: 'Part of ApeiroRA and NeoNephos.',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://openmcp-project.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/docs/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'openmcp-project',
  projectName: 'docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/openmcp-project/docs/tree/main/',
        },
        blog: {
          routeBasePath: "adrs",
          path: "adrs",
          showReadingTime: false,
          feedOptions: {
            type: null,
            xslt: true,
          },
          editUrl:
            'https://github.com/openmcp-project/docs/tree/main/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          blogSidebarTitle: 'All ADRs',
          blogSidebarCount: 'ALL',
          blogTitle: 'Architectural Decision Records (ADRs)',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Open Managed Control Plane (openMCP)',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'about',
          position: 'left',
          label: 'About OpenMCP',
        },
        {
          type: 'docSidebar',
          sidebarId: 'userDocs',
          position: 'left',
          label: 'End-users',
        },
        {
          type: 'docSidebar',
          sidebarId: 'operatorDocs',
          position: 'left',
          label: 'Operators',
        },
        {
          type: 'docSidebar',
          sidebarId: 'developerDocs',
          position: 'left',
          label: 'Developers',
        },
        {to: '/adrs', label: 'ADRs', position: 'left'},
        {
          href: 'https://github.com/openmcp-project/docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: '/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'ApeiroRA',
              href: 'https://apeirora.eu/',
            },
            {
              label: 'NeoNephos',
              href: 'https://neonephos.org/',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/openmcp-project',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} SAP SE or an SAP affiliate company and contributors. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
