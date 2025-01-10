/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { navigation as icon } from '@wordpress/icons';
import { select } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Internal dependencies
 */
import initBlock from '../utils/init-block';
import metadata from './block.json';
import edit from './edit';
import save from './save';
import deprecated from './deprecated';

const { name } = metadata;

export { metadata, name };

export const settings = {
	icon,
	example: {
		attributes: {
			overlayMenu: 'never',
		},
		innerBlocks: [
			{
				name: 'core/navigation-link',
				attributes: {
					// translators: 'Home' as in a website's home page.
					label: __( 'Home' ),
					url: 'https://make.wordpress.org/',
				},
			},
			{
				name: 'core/navigation-link',
				attributes: {
					// translators: 'About' as in a website's about page.
					label: __( 'About' ),
					url: 'https://make.wordpress.org/',
				},
			},
			{
				name: 'core/navigation-link',
				attributes: {
					// translators: 'Contact' as in a website's contact page.
					label: __( 'Contact' ),
					url: 'https://make.wordpress.org/',
				},
			},
		],
	},
	edit,
	save,
	__experimentalLabel: ( { ref }, { context } ) => {
		if ( ! ref || context !== 'list-view' ) {
			return;
		}

		const navigation = select( coreStore ).getEditedEntityRecord(
			'postType',
			'wp_navigation',
			ref
		);

		if ( ! navigation?.title ) {
			return;
		}

		return decodeEntities( navigation.title );
	},
	deprecated,
};

export const init = () => initBlock( { name, metadata, settings } );
