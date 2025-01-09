/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
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
	__experimentalLabel: ( { ref } ) => {
		if ( ! ref ) {
			return __( 'Navigation' );
		}

		const navigation = select( coreStore ).getEditedEntityRecord(
			'postType',
			'wp_navigation',
			ref
		);

		return navigation?.title
			? sprintf(
					/* translators: %1$s: block title, %2$s: navigation menu title */
					__( '%1$s (%2$s)' ),
					metadata.title,
					decodeEntities( navigation.title )
			  )
			: __( 'Navigation' );
	},
	deprecated,
};

export const init = () => initBlock( { name, metadata, settings } );
