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
	// Determine whether the panel should be expanded.
	const { selectedClientID, positionAttribute } = useSelect( ( select ) => {
		const { getSelectedBlockClientIds, getBlockAttributes } =
			select( blockEditorStore );

		const clientIds = getSelectedBlockClientIds();

		// If multiple blocks are selected, prioritize the first block.
		const blockAttributes = getBlockAttributes( clientIds[ 0 ] );

		return {
			selectedClientID: clientIds[ 0 ],
			positionAttribute: blockAttributes?.style?.position?.type,
		};
	}, [] );

	const { updateBlockAttributes } = useDispatch( blockEditorStore );

	function resetPosition() {
		updateBlockAttributes( selectedClientID, {
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
				isShownByDefault
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
