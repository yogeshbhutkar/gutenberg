/**
 * WordPress dependencies
 */
import {
	__experimentalUseSlotFills as useSlotFills,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import InspectorControlsGroups from '../inspector-controls/groups';
import { default as InspectorControls } from '../inspector-controls';
import { store as blockEditorStore } from '../../store';

const PositionControlsPanel = () => {
	const { selectedClientIDs, positionAttribute, isShownByDefault } =
		useSelect( ( select ) => {
			const {
				getBlocksByClientId,
				getSelectedBlockClientIds,
				getBlockAttributes,
			} = select( blockEditorStore );

			const selectedBlockClientIds = getSelectedBlockClientIds();
			const multiSelectedBlocks = getBlocksByClientId(
				selectedBlockClientIds
			);

			// If multiple blocks are selected, the position value will be the value of the first block.
			const blockAttributes = getBlockAttributes(
				selectedBlockClientIds[ 0 ]
			);

			return {
				selectedClientIDs: selectedBlockClientIds,
				positionAttribute: blockAttributes?.style?.position?.type,
				isShownByDefault: multiSelectedBlocks.some(
					( { attributes } ) => !! attributes?.style?.position?.type
				),
			};
		}, [] );

	const { updateBlockAttributes } = useDispatch( blockEditorStore );

	function resetPosition() {
		updateBlockAttributes( selectedClientIDs, {
			style: {
				position: {
					type: undefined,
				},
			},
		} );
	}

	return (
		<ToolsPanel
			className="block-editor-block-inspector__position"
			label={ __( 'Position' ) }
			resetAll={ resetPosition }
		>
			<ToolsPanelItem
				isShownByDefault={ isShownByDefault }
				label={ __( 'Position' ) }
				hasValue={ () => !! positionAttribute }
				onDeselect={ resetPosition }
			>
				<InspectorControls.Slot group="position" />
			</ToolsPanelItem>
		</ToolsPanel>
	);
};

const PositionControls = () => {
	const fills = useSlotFills( InspectorControlsGroups.position.name );
	const hasFills = Boolean( fills && fills.length );

	if ( ! hasFills ) {
		return null;
	}

	return <PositionControlsPanel />;
};

export default PositionControls;
