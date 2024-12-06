/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import {
	__unstableMotion as motion,
	__unstableAnimatePresence as AnimatePresence,
} from '@wordpress/components';
import { useReducedMotion } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../store';
import { unlock } from '../../lock-unlock';

const useRenderDropZone = ( {
	position,
	insertionPoint,
	blockInsertionPointVisible,
	blockInsertionPoint,
	clientId,
	sectionClientIds,
	selectedBlockIds,
} ) => {
	const [ isVisible, setIsVisible ] = useState( false );
	const { setShowZoomOutModeInserter } = useDispatch( blockEditorStore );

	useEffect( () => {
		const hasTopInsertionPoint =
			insertionPoint?.index === 0 &&
			clientId === sectionClientIds[ insertionPoint.index ];
		const hasBottomInsertionPoint =
			insertionPoint &&
			insertionPoint.hasOwnProperty( 'index' ) &&
			clientId === sectionClientIds[ insertionPoint.index - 1 ];

		let visibility = false;
		let selectedBlockId = null;

		if ( position === 'top' ) {
			visibility =
				hasTopInsertionPoint ||
				( blockInsertionPointVisible &&
					blockInsertionPoint.index === 0 &&
					clientId ===
						sectionClientIds[ blockInsertionPoint.index ] );
			selectedBlockId =
				sectionClientIds[
					hasTopInsertionPoint
						? insertionPoint.index
						: blockInsertionPoint.index
				];
		}

		if ( position === 'bottom' ) {
			visibility =
				hasBottomInsertionPoint ||
				( blockInsertionPointVisible &&
					clientId ===
						sectionClientIds[ blockInsertionPoint.index - 1 ] );
			selectedBlockId =
				sectionClientIds[
					hasBottomInsertionPoint
						? insertionPoint.index - 1
						: blockInsertionPoint.index - 1
				];
		}

		if ( visibility ) {
			setShowZoomOutModeInserter(
				! selectedBlockIds.includes( selectedBlockId )
			);
		}

		setIsVisible( visibility );
	}, [
		position,
		insertionPoint,
		blockInsertionPointVisible,
		blockInsertionPoint,
		clientId,
		sectionClientIds,
		selectedBlockIds,
		setShowZoomOutModeInserter,
	] );

	return isVisible;
};

export function ZoomOutSeparator( {
	clientId,
	rootClientId = '',
	position = 'top',
} ) {
	const [ isDraggedOver, setIsDraggedOver ] = useState( false );
	const {
		sectionRootClientId,
		sectionClientIds,
		insertionPoint,
		blockInsertionPointVisible,
		blockInsertionPoint,
		selectedBlockIds,
	} = useSelect( ( select ) => {
		const {
			getInsertionPoint,
			getBlockOrder,
			getSectionRootClientId,
			getSelectedBlockClientIds,
			isBlockInsertionPointVisible,
			getBlockInsertionPoint,
		} = unlock( select( blockEditorStore ) );

		const root = getSectionRootClientId();
		const sectionRootClientIds = getBlockOrder( root );
		return {
			sectionRootClientId: root,
			sectionClientIds: sectionRootClientIds,
			blockOrder: getBlockOrder( root ),
			insertionPoint: getInsertionPoint(),
			blockInsertionPoint: getBlockInsertionPoint(),
			blockInsertionPointVisible: isBlockInsertionPointVisible(),
			selectedBlockIds: getSelectedBlockClientIds(),
		};
	}, [] );

	const isVisible = useRenderDropZone( {
		position,
		insertionPoint,
		blockInsertionPointVisible,
		blockInsertionPoint,
		clientId,
		sectionClientIds,
		selectedBlockIds,
	} );

	const isSectionBlock =
		rootClientId === sectionRootClientId &&
		sectionClientIds &&
		sectionClientIds.includes( clientId );

	const isReducedMotion = useReducedMotion();

	if ( ! clientId ) {
		return;
	}

	if ( ! isSectionBlock ) {
		return null;
	}

	return (
		<AnimatePresence>
			{ isVisible && (
				<motion.div
					initial={ { height: 0 } }
					animate={ {
						// Use a height equal to that of the zoom out frame size.
						height: 'calc(1 * var(--wp-block-editor-iframe-zoom-out-frame-size) / var(--wp-block-editor-iframe-zoom-out-scale)',
					} }
					exit={ { height: 0 } }
					transition={ {
						type: 'tween',
						duration: isReducedMotion ? 0 : 0.2,
						ease: [ 0.6, 0, 0.4, 1 ],
					} }
					className={ clsx(
						'block-editor-block-list__zoom-out-separator',
						{
							'is-dragged-over': isDraggedOver,
						}
					) }
					data-is-insertion-point="true"
					onDragOver={ () => setIsDraggedOver( true ) }
					onDragLeave={ () => setIsDraggedOver( false ) }
				>
					<motion.div
						initial={ { opacity: 0 } }
						animate={ { opacity: 1 } }
						exit={ { opacity: 0, transition: { delay: -0.125 } } }
						transition={ {
							ease: 'linear',
							duration: 0.1,
							delay: 0.125,
						} }
					>
						{ __( 'Drop pattern.' ) }
					</motion.div>
				</motion.div>
			) }
		</AnimatePresence>
	);
}
