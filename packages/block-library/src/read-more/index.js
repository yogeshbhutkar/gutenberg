/**
 * WordPress dependencies
 */
import { _x } from '@wordpress/i18n';
import { link as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import initBlock from '../utils/init-block';
import metadata from './block.json';
import edit from './edit';

const { name } = metadata;
export { metadata, name };

export const settings = {
	icon,
	edit,
	example: {
		attributes: {
			content: _x( 'Read More', 'Example text for the Read More block' ),
		},
	},
};

export const init = () => initBlock( { name, metadata, settings } );
