import type { AstroConfig, RoutePart } from '../../../@types/astro';

import { compile } from 'path-to-regexp';

export function getRouteGenerator(
	segments: RoutePart[][],
	addTrailingSlash: AstroConfig['trailingSlash'],
	buildFormat: AstroConfig['build']['format'] = 'directory'
) {
	const template = segments
		.map((segment) => {
			return (
				'/' +
				segment
					.map((part) => {
						if (part.spread) {
							return `:${part.content.slice(3)}(.*)?`;
						} else if (part.dynamic) {
							return `:${part.content}`;
						} else {
							return part.content
								.normalize()
								.replace(/\?/g, '%3F')
								.replace(/#/g, '%23')
								.replace(/%5B/g, '[')
								.replace(/%5D/g, ']')
								.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
						}
					})
					.join('')
			);
		})
		.join('');

	/**
	 * If `addTrailingSlash` is 'always'
	 * or `buildFormat` is 'directory' and `addTrailingSlash` is not "never"
	 */
	const shouldAddTrailingSlash =
		addTrailingSlash === 'always' || (buildFormat === 'directory' && addTrailingSlash !== 'never');
	let trailing: '/' | '' = '';
	if (shouldAddTrailingSlash && segments.length) {
		trailing = '/';
	}
	const toPath = compile(template + trailing);
	return toPath;
}
