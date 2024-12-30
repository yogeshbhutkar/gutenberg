/**
 * WordPress dependencies
 */
import { _x } from '@wordpress/i18n';
import { queryPaginationNext as icon } from '@wordpress/icons';

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
				'Comments Next Page',
				'Example label for the Comments Pagination Next block'
			),
		},
	},
};

export const init = () => initBlock( { name, metadata, settings } );
