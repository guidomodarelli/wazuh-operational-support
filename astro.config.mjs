// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'My Docs',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'How to Use This Documentation', slug: 'overview/getting-started' },
					],
				},
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Wazuh API 55000 timeout (GCP)', slug: 'guides/wazuh-api-55000-connection-timeout-gcp' },
						{ label: 'Hostname vs agent.name mismatch', slug: 'guides/agent-name-hostname-mismatch-dashboard' },
					],
				},
			],
		}),
	],
});
