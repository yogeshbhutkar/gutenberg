/**
 * WordPress dependencies
 */
import {
	ToggleControl,
	SelectControl,
	Disabled,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import ServerSideRender from '@wordpress/server-side-render';

export default function ArchivesEdit( { attributes, setAttributes } ) {
	const { showLabel, showPostCounts, displayAsDropdown, type } = attributes;

	return (
		<>
			<InspectorControls>
				<ToolsPanel
					label={ __( 'Settings' ) }
					resetAll={ () => {
						setAttributes( {
							displayAsDropdown: false,
							showLabel: false,
							showPostCounts: false,
							type: 'monthly',
						} );
					} }
				>
					<ToolsPanelItem
						label={ __( 'Display as dropdown' ) }
						isShownByDefault
						hasValue={ () => displayAsDropdown }
						onDeselect={ () =>
							setAttributes( { displayAsDropdown: false } )
						}
					>
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __( 'Display as dropdown' ) }
							checked={ displayAsDropdown }
							onChange={ () =>
								setAttributes( {
									displayAsDropdown: ! displayAsDropdown,
								} )
							}
						/>
					</ToolsPanelItem>

					{ displayAsDropdown && (
						<ToolsPanelItem
							label={ __( 'Show label' ) }
							isShownByDefault
							hasValue={ () => showLabel }
							onDeselect={ () =>
								setAttributes( { showLabel: false } )
							}
						>
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __( 'Show label' ) }
								checked={ showLabel }
								onChange={ () =>
									setAttributes( {
										showLabel: ! showLabel,
									} )
								}
							/>
						</ToolsPanelItem>
					) }

					<ToolsPanelItem
						label={ __( 'Show post counts' ) }
						isShownByDefault
						hasValue={ () => showPostCounts }
						onDeselect={ () =>
							setAttributes( { showPostCounts: false } )
						}
					>
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __( 'Show post counts' ) }
							checked={ showPostCounts }
							onChange={ () =>
								setAttributes( {
									showPostCounts: ! showPostCounts,
								} )
							}
						/>
					</ToolsPanelItem>

					<ToolsPanelItem
						label={ __( 'Group by' ) }
						isShownByDefault
						hasValue={ () => !! type }
						onDeselect={ () =>
							setAttributes( { type: 'monthly' } )
						}
					>
						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'Group by' ) }
							options={ [
								{ label: __( 'Year' ), value: 'yearly' },
								{ label: __( 'Month' ), value: 'monthly' },
								{ label: __( 'Week' ), value: 'weekly' },
								{ label: __( 'Day' ), value: 'daily' },
							] }
							value={ type }
							onChange={ ( value ) =>
								setAttributes( { type: value } )
							}
						/>
					</ToolsPanelItem>
				</ToolsPanel>
			</InspectorControls>
			<div { ...useBlockProps() }>
				<Disabled>
					<ServerSideRender
						block="core/archives"
						skipBlockSupportAttributes
						attributes={ attributes }
					/>
				</Disabled>
			</div>
		</>
	);
}
