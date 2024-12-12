/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import {
	InnerBlocks,
	BlockControls,
	BlockVerticalAlignmentToolbar,
	InspectorControls,
	useBlockProps,
	useSettings,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	ToolbarButton,
	__experimentalUseCustomUnits as useCustomUnits,
	PanelBody,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { sprintf, __ } from '@wordpress/i18n';
import { createBlock } from '@wordpress/blocks';

function AddColumnButton() {
	const { insertBlock } = useDispatch( blockEditorStore );
	const { _getBlockRootClientId, _getBlockIndex, _getSelectedBlockClientId } =
		useSelect( ( select ) => {
			const {
				getBlockRootClientId,
				getBlockIndex,
				getSelectedBlockClientId,
			} = select( blockEditorStore );

			return {
				_getBlockRootClientId: getBlockRootClientId,
				_getBlockIndex: getBlockIndex,
				_getSelectedBlockClientId: getSelectedBlockClientId,
			};
		} );

	const handleAddColumn = () => {
		const selectedBlockClientId = _getSelectedBlockClientId();
		const newColumn = createBlock( 'core/column' );
		const rootClientId = _getBlockRootClientId( selectedBlockClientId );
		const currentBlockIndex = _getBlockIndex( selectedBlockClientId );

		insertBlock( newColumn, currentBlockIndex + 1, rootClientId, true );
	};

	return (
		<BlockControls group="other">
			<ToolbarButton onClick={ handleAddColumn }>
				{ __( 'Add Column' ) }
			</ToolbarButton>
		</BlockControls>
	);
}

function ColumnInspectorControls( { width, setAttributes } ) {
	const [ availableUnits ] = useSettings( 'spacing.units' );
	const units = useCustomUnits( {
		availableUnits: availableUnits || [ '%', 'px', 'em', 'rem', 'vw' ],
	} );
	return (
		<PanelBody title={ __( 'Settings' ) }>
			<UnitControl
				label={ __( 'Width' ) }
				__unstableInputWidth="calc(50% - 8px)"
				__next40pxDefaultSize
				value={ width || '' }
				onChange={ ( nextWidth ) => {
					nextWidth = 0 > parseFloat( nextWidth ) ? '0' : nextWidth;
					setAttributes( { width: nextWidth } );
				} }
				units={ units }
			/>
		</PanelBody>
	);
}

function ColumnEdit( {
	attributes: { verticalAlignment, width, templateLock, allowedBlocks },
	setAttributes,
	clientId,
} ) {
	const classes = clsx( 'block-core-columns', {
		[ `is-vertically-aligned-${ verticalAlignment }` ]: verticalAlignment,
	} );
	const { columnsIds, hasChildBlocks, rootClientId } = useSelect(
		( select ) => {
			const { getBlockOrder, getBlockRootClientId } =
				select( blockEditorStore );

			const rootId = getBlockRootClientId( clientId );

			return {
				hasChildBlocks: getBlockOrder( clientId ).length > 0,
				rootClientId: rootId,
				columnsIds: getBlockOrder( rootId ),
			};
		},
		[ clientId ]
	);

	const { updateBlockAttributes } = useDispatch( blockEditorStore );

	const updateAlignment = ( value ) => {
		// Update own alignment.
		setAttributes( { verticalAlignment: value } );
		// Reset parent Columns block.
		updateBlockAttributes( rootClientId, {
			verticalAlignment: null,
		} );
	};

	const widthWithUnit = Number.isFinite( width ) ? width + '%' : width;
	const blockProps = useBlockProps( {
		className: classes,
		style: widthWithUnit ? { flexBasis: widthWithUnit } : undefined,
	} );

	const columnsCount = columnsIds.length;
	const currentColumnPosition = columnsIds.indexOf( clientId ) + 1;

	const label = sprintf(
		/* translators: 1: Block label (i.e. "Block: Column"), 2: Position of the selected block, 3: Total number of sibling blocks of the same type */
		__( '%1$s (%2$d of %3$d)' ),
		blockProps[ 'aria-label' ],
		currentColumnPosition,
		columnsCount
	);

	const innerBlocksProps = useInnerBlocksProps(
		{ ...blockProps, 'aria-label': label },
		{
			templateLock,
			allowedBlocks,
			renderAppender: hasChildBlocks
				? undefined
				: InnerBlocks.ButtonBlockAppender,
		}
	);

	return (
		<>
			<BlockControls>
				<BlockVerticalAlignmentToolbar
					onChange={ updateAlignment }
					value={ verticalAlignment }
					controls={ [ 'top', 'center', 'bottom', 'stretch' ] }
				/>
			</BlockControls>
			<InspectorControls>
				<ColumnInspectorControls
					width={ width }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>
			<AddColumnButton />
			<div { ...innerBlocksProps } />
		</>
	);
}

export default ColumnEdit;
