/**
 * WordPress dependencies
 */
import { _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import initBlock from '../utils/init-block';
import metadata from './block.json';
import edit from './edit';
import variations from './variations';

const { name } = metadata;
export { metadata, name };

export const settings = {
	edit,
	variations,
	example: {
		attributes: {
			label: _x(
				'Next post',
				'Example label for Post Navigation Link block'
			),
			arrow: 'arrow',
		},
	},
};

export const init = () => initBlock( { name, metadata, settings } );
