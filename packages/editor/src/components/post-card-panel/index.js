/**
 * WordPress dependencies
 */
import {
	Icon,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Internal dependencies
 */
import { store as editorStore } from '../../store';
import {
	TEMPLATE_POST_TYPE,
	TEMPLATE_PART_POST_TYPE,
} from '../../store/constants';
import { unlock } from '../../lock-unlock';
import PostActions from '../post-actions';
import usePageTypeBadge from '../../utils/pageTypeBadge';
import { getTemplateInfo } from '../../utils/get-template-info';

/**
 * Renders a title of the post type and the available quick actions available within a 3-dot dropdown.
 *
 * @param {Object}          props                     - Component props.
 * @param {string}          [props.postType]          - The post type string.
 * @param {string|string[]} [props.postId]            - The post id or list of post ids.
 * @param {Function}        [props.onActionPerformed] - A callback function for when a quick action is performed.
 * @return {React.ReactNode} The rendered component.
 */
export default function PostCardPanel( {
	postType,
	postId,
	onActionPerformed,
} ) {
	const postIds = useMemo(
		() => ( Array.isArray( postId ) ? postId : [ postId ] ),
		[ postId ]
	);
	const { postTitle, icon, labels } = useSelect(
		( select ) => {
			const { getEditedEntityRecord, getEntityRecord, getPostType } =
				select( coreStore );
			const { getPostIcon } = unlock( select( editorStore ) );
			let _title = '';
			const _record = getEditedEntityRecord(
				'postType',
				postType,
				postIds[ 0 ]
			);
			if ( postIds.length === 1 ) {
				const { default_template_types: templateTypes = [] } =
					getEntityRecord( 'root', '__unstableBase' ) ?? {};

				const _templateInfo = [
					TEMPLATE_POST_TYPE,
					TEMPLATE_PART_POST_TYPE,
				].includes( postType )
					? getTemplateInfo( {
							template: _record,
							templateTypes,
					  } )
					: {};
				_title = _templateInfo?.title || _record?.title;
			}

			return {
				postTitle: _title,
				icon: getPostIcon( postType, {
					area: _record?.area,
				} ),
				labels: getPostType( postType )?.labels,
			};
		},
		[ postIds, postType ]
	);

	const pageTypeBadge = usePageTypeBadge( postId );
	let title = __( 'No title' );
	if ( labels?.name && postIds.length > 1 ) {
		title = sprintf(
			// translators: %i number of selected items %s: Name of the plural post type e.g: "Posts".
			__( '%i %s' ),
			postId.length,
			labels?.name
		);
	} else if ( postTitle ) {
		title = decodeEntities( postTitle );
	}

	return (
		<VStack spacing={ 1 } className="editor-post-card-panel">
			<HStack
				spacing={ 2 }
				className="editor-post-card-panel__header"
				align="flex-start"
			>
				<Icon className="editor-post-card-panel__icon" icon={ icon } />
				<Text
					numberOfLines={ 2 }
					truncate
					className="editor-post-card-panel__title"
					as="h2"
				>
					{ title }
					{ pageTypeBadge && postIds.length === 1 && (
						<span className="editor-post-card-panel__title-badge">
							{ pageTypeBadge }
						</span>
					) }
				</Text>
				<PostActions
					postType={ postType }
					postId={ postId }
					onActionPerformed={ onActionPerformed }
				/>
			</HStack>
			{ postIds.length > 1 && (
				<Text className="editor-post-card-panel__description">
					{ sprintf(
						// translators: %s: Name of the plural post type e.g: "Posts".
						__( 'Changes will be applied to all selected %s.' ),
						labels?.name.toLowerCase()
					) }
				</Text>
			) }
		</VStack>
	);
}
