/**
 * WordPress dependencies
 */
import { __, _x, sprintf } from '@wordpress/i18n';
import {
	NavigableMenu,
	MenuItem,
	FormFileUpload,
	MenuGroup,
	ToolbarGroup,
	ToolbarButton,
	Dropdown,
	Button,
	TextControl,
	SelectControl,
	__experimentalGrid as Grid,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import {
	MediaUpload,
	MediaUploadCheck,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { upload, media } from '@wordpress/icons';
import { useSelect } from '@wordpress/data';
import { useState, useRef, useEffect } from '@wordpress/element';
import { getFilename } from '@wordpress/url';

const ALLOWED_TYPES = [ 'text/vtt' ];

const DEFAULT_KIND = 'subtitles';

const KIND_OPTIONS = [
	{ label: __( 'Subtitles' ), value: 'subtitles' },
	{ label: __( 'Captions' ), value: 'captions' },
	{ label: __( 'Descriptions' ), value: 'descriptions' },
	{ label: __( 'Chapters' ), value: 'chapters' },
	{ label: __( 'Metadata' ), value: 'metadata' },
];

function TrackList( { tracks, onEditPress } ) {
	const content = tracks.map( ( track, index ) => {
		return (
			<HStack
				key={ index }
				className="block-library-video-tracks-editor__track-list-track"
			>
				<span>{ track.label }</span>
				<Button
					__next40pxDefaultSize
					variant="tertiary"
					onClick={ () => onEditPress( index ) }
					aria-label={ sprintf(
						/* translators: %s: Label of the video text track e.g: "French subtitles". */
						_x( 'Edit %s', 'text tracks' ),
						track.label
					) }
				>
					{ __( 'Edit' ) }
				</Button>
			</HStack>
		);
	} );

	return (
		<MenuGroup
			label={ __( 'Text tracks' ) }
			className="block-library-video-tracks-editor__track-list"
		>
			{ content }
		</MenuGroup>
	);
}

function SingleTrackEditor( { track, onChange, onClose, onRemove } ) {
	const { src = '', label = '', srcLang = '', kind = DEFAULT_KIND } = track;
	const fileName = src.startsWith( 'blob:' ) ? '' : getFilename( src ) || '';
	return (
		<VStack
			className="block-library-video-tracks-editor__single-track-editor"
			spacing="4"
		>
			<span className="block-library-video-tracks-editor__single-track-editor-edit-track-label">
				{ __( 'Edit track' ) }
			</span>
			<span>
				{ __( 'File' ) }: <b>{ fileName }</b>
			</span>
			<Grid columns={ 2 } gap={ 4 }>
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					onChange={ ( newLabel ) =>
						onChange( {
							...track,
							label: newLabel,
						} )
					}
					label={ __( 'Label' ) }
					value={ label }
					help={ __( 'Title of track' ) }
				/>
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					onChange={ ( newSrcLang ) =>
						onChange( {
							...track,
							srcLang: newSrcLang,
						} )
					}
					label={ __( 'Source language' ) }
					value={ srcLang }
					help={ __( 'Language tag (en, fr, etc.)' ) }
				/>
			</Grid>
			<VStack spacing="8">
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					className="block-library-video-tracks-editor__single-track-editor-kind-select"
					options={ KIND_OPTIONS }
					value={ kind }
					label={ __( 'Kind' ) }
					onChange={ ( newKind ) => {
						onChange( {
							...track,
							kind: newKind,
						} );
					} }
				/>
				<HStack className="block-library-video-tracks-editor__single-track-editor-buttons-container">
					<Button
						__next40pxDefaultSize
						isDestructive
						variant="link"
						onClick={ onRemove }
					>
						{ __( 'Remove track' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="primary"
						onClick={ () => {
							const changes = {};
							let hasChanges = false;
							if ( label === '' ) {
								changes.label = __( 'English' );
								hasChanges = true;
							}
							if ( srcLang === '' ) {
								changes.srcLang = 'en';
								hasChanges = true;
							}
							if ( track.kind === undefined ) {
								changes.kind = DEFAULT_KIND;
								hasChanges = true;
							}
							if ( hasChanges ) {
								onChange( {
									...track,
									...changes,
								} );
							}
							onClose();
						} }
					>
						{ __( 'Apply' ) }
					</Button>
				</HStack>
			</VStack>
		</VStack>
	);
}

export default function TracksEditor( { tracks = [], onChange } ) {
	const mediaUpload = useSelect( ( select ) => {
		return select( blockEditorStore ).getSettings().mediaUpload;
	}, [] );
	const [ trackBeingEdited, setTrackBeingEdited ] = useState( null );
	const dropdownPopoverRef = useRef();

	useEffect( () => {
		dropdownPopoverRef.current?.focus();
	}, [ trackBeingEdited ] );

	if ( ! mediaUpload ) {
		return null;
	}
	return (
		<Dropdown
			contentClassName="block-library-video-tracks-editor"
			focusOnMount
			popoverProps={ {
				ref: dropdownPopoverRef,
			} }
			renderToggle={ ( { isOpen, onToggle } ) => {
				const handleOnToggle = () => {
					if ( ! isOpen ) {
						// When the Popover opens make sure the initial view is
						// always the track list rather than the edit track UI.
						setTrackBeingEdited( null );
					}
					onToggle();
				};

				return (
					<ToolbarGroup>
						<ToolbarButton
							aria-expanded={ isOpen }
							aria-haspopup="true"
							onClick={ handleOnToggle }
						>
							{ __( 'Text tracks' ) }
						</ToolbarButton>
					</ToolbarGroup>
				);
			} }
			renderContent={ () => {
				if ( trackBeingEdited !== null ) {
					return (
						<SingleTrackEditor
							track={ tracks[ trackBeingEdited ] }
							onChange={ ( newTrack ) => {
								const newTracks = [ ...tracks ];
								newTracks[ trackBeingEdited ] = newTrack;
								onChange( newTracks );
							} }
							onClose={ () => setTrackBeingEdited( null ) }
							onRemove={ () => {
								onChange(
									tracks.filter(
										( _track, index ) =>
											index !== trackBeingEdited
									)
								);
								setTrackBeingEdited( null );
							} }
						/>
					);
				}

				return (
					<>
						{ tracks.length === 0 && (
							<div className="block-library-video-tracks-editor__tracks-informative-message">
								<h2 className="block-library-video-tracks-editor__tracks-informative-message-title">
									{ __( 'Text tracks' ) }
								</h2>
								<p className="block-library-video-tracks-editor__tracks-informative-message-description">
									{ __(
										'Tracks can be subtitles, captions, chapters, or descriptions. They help make your content more accessible to a wider range of users.'
									) }
								</p>
							</div>
						) }
						<NavigableMenu>
							<TrackList
								tracks={ tracks }
								onEditPress={ setTrackBeingEdited }
							/>
							<MenuGroup
								className="block-library-video-tracks-editor__add-tracks-container"
								label={ __( 'Add tracks' ) }
							>
								<MediaUpload
									onSelect={ ( { url } ) => {
										const trackIndex = tracks.length;
										onChange( [ ...tracks, { src: url } ] );
										setTrackBeingEdited( trackIndex );
									} }
									allowedTypes={ ALLOWED_TYPES }
									render={ ( { open } ) => (
										<MenuItem
											icon={ media }
											onClick={ open }
										>
											{ __( 'Open Media Library' ) }
										</MenuItem>
									) }
								/>
								<MediaUploadCheck>
									<FormFileUpload
										onChange={ ( event ) => {
											const files = event.target.files;
											const trackIndex = tracks.length;
											mediaUpload( {
												allowedTypes: ALLOWED_TYPES,
												filesList: files,
												onFileChange: ( [
													{ url },
												] ) => {
													const newTracks = [
														...tracks,
													];
													if (
														! newTracks[
															trackIndex
														]
													) {
														newTracks[
															trackIndex
														] = {};
													}
													newTracks[ trackIndex ] = {
														...tracks[ trackIndex ],
														src: url,
													};
													onChange( newTracks );
													setTrackBeingEdited(
														trackIndex
													);
												},
											} );
										} }
										accept=".vtt,text/vtt"
										render={ ( { openFileDialog } ) => {
											return (
												<MenuItem
													icon={ upload }
													onClick={ () => {
														openFileDialog();
													} }
												>
													{ _x( 'Upload', 'verb' ) }
												</MenuItem>
											);
										} }
									/>
								</MediaUploadCheck>
							</MenuGroup>
						</NavigableMenu>
					</>
				);
			} }
		/>
	);
}
