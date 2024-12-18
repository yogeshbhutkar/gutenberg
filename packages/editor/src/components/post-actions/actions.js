/**
 * WordPress dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { useMemo, useEffect } from '@wordpress/element';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { store as editorStore } from '../../store';
import { unlock } from '../../lock-unlock';
import { useSetAsHomepageAction } from './set-as-homepage';
import { useSetAsPostsPageAction } from './set-as-posts-page';

export function usePostActions( { postType, onActionPerformed, context } ) {
	const { defaultActions } = useSelect(
		( select ) => {
			const { getEntityActions } = unlock( select( editorStore ) );
			return {
				defaultActions: getEntityActions( 'postType', postType ),
			};
		},
		[ postType ]
	);

	const { canManageOptions, hasFrontPageTemplate } = useSelect(
		( select ) => {
			const { getEntityRecords } = select( coreStore );
			const templates = getEntityRecords( 'postType', 'wp_template', {
				per_page: -1,
			} );

			return {
				canManageOptions: select( coreStore ).canUser( 'update', {
					kind: 'root',
					name: 'site',
				} ),
				hasFrontPageTemplate: !! templates?.find(
					( template ) => template?.slug === 'front-page'
				),
			};
		}
	);

	const setAsHomepageAction = useSetAsHomepageAction();
	const setAsPostsPageAction = useSetAsPostsPageAction();
	const shouldShowHomepageActions =
		canManageOptions && ! hasFrontPageTemplate;

	const { registerPostTypeSchema } = unlock( useDispatch( editorStore ) );
	useEffect( () => {
		registerPostTypeSchema( postType );
	}, [ registerPostTypeSchema, postType ] );

	return useMemo( () => {
		let actions = [ ...defaultActions ];
		if ( shouldShowHomepageActions ) {
			actions.push( setAsHomepageAction, setAsPostsPageAction );
		}

		// Ensure "Move to trash" is always the last action.
		actions = actions.sort( ( a, b ) =>
			b.id === 'move-to-trash' ? -1 : 0
		);

		// Filter actions based on provided context. If not provided
		// all actions are returned. We'll have a single entry for getting the actions
		// and the consumer should provide the context to filter the actions, if needed.
		// Actions should also provide the `context` they support, if it's specific, to
		// compare with the provided context to get all the actions.
		// Right now the only supported context is `list`.
		actions = actions.filter( ( action ) => {
			if ( ! action.context ) {
				return true;
			}
			return action.context === context;
		} );

		if ( onActionPerformed ) {
			for ( let i = 0; i < actions.length; ++i ) {
				if ( actions[ i ].callback ) {
					const existingCallback = actions[ i ].callback;
					actions[ i ] = {
						...actions[ i ],
						callback: ( items, argsObject ) => {
							existingCallback( items, {
								...argsObject,
								onActionPerformed: ( _items ) => {
									if ( argsObject?.onActionPerformed ) {
										argsObject.onActionPerformed( _items );
									}
									onActionPerformed(
										actions[ i ].id,
										_items
									);
								},
							} );
						},
					};
				}
				if ( actions[ i ].RenderModal ) {
					const ExistingRenderModal = actions[ i ].RenderModal;
					actions[ i ] = {
						...actions[ i ],
						RenderModal: ( props ) => {
							return (
								<ExistingRenderModal
									{ ...props }
									onActionPerformed={ ( _items ) => {
										if ( props.onActionPerformed ) {
											props.onActionPerformed( _items );
										}
										onActionPerformed(
											actions[ i ].id,
											_items
										);
									} }
								/>
							);
						},
					};
				}
			}
		}

		return actions;
	}, [
		context,
		defaultActions,
		onActionPerformed,
		setAsHomepageAction,
		setAsPostsPageAction,
		shouldShowHomepageActions,
	] );
}
