/**
 * WordPress dependencies
 */
import { _x } from '@wordpress/i18n';
import { queryPaginationPrevious as icon } from '@wordpress/icons';

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
			label: _x(
				'Comments Previous Page',
				'Example label for the Comments Pagination Previous block'
			),
		},
	},
};

export const init = () => initBlock( { name, metadata, settings } );
