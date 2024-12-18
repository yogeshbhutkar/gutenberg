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
	__unstableUseNavigateRegions as useNavigateRegions,
	SlotFillProvider,
} from '@wordpress/components';
import {
	useReducedMotion,
	useViewportMatch,
	useResizeObserver,
	usePrevious,
} from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { useState, useRef, useEffect } from '@wordpress/element';
import { CommandMenu } from '@wordpress/commands';
import { privateApis as blockEditorPrivateApis } from '@wordpress/block-editor';
import {
	EditorSnackbars,
	UnsavedChangesWarning,
	ErrorBoundary,
	privateApis as editorPrivateApis,
} from '@wordpress/editor';
import { privateApis as coreCommandsPrivateApis } from '@wordpress/core-commands';
import { privateApis as routerPrivateApis } from '@wordpress/router';
import { PluginArea } from '@wordpress/plugins';
import { store as noticesStore } from '@wordpress/notices';
import { useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { default as SiteHub, SiteHubMobile } from '../site-hub';
import ResizableFrame from '../resizable-frame';
import { unlock } from '../../lock-unlock';
import SaveKeyboardShortcut from '../save-keyboard-shortcut';
import { useIsSiteEditorLoading } from './hooks';
import useMovingAnimation from './animation';
import SidebarContent from '../sidebar';
import SaveHub from '../save-hub';
import SavePanel from '../save-panel';

const { useCommands } = unlock( coreCommandsPrivateApis );
const { useGlobalStyle } = unlock( blockEditorPrivateApis );
const { NavigableRegion, GlobalStylesProvider } = unlock( editorPrivateApis );
const { useLocation } = unlock( routerPrivateApis );

const ANIMATION_DURATION = 0.3;

function Layout() {
	const { query, name: routeKey, areas, widths } = useLocation();
	const { canvas = 'view' } = query;
	useCommands();
	const isMobileViewport = useViewportMatch( 'medium', '<' );
	const toggleRef = useRef();
	const navigateRegionsProps = useNavigateRegions();
	const disableMotion = useReducedMotion();
	const [ canvasResizer, canvasSize ] = useResizeObserver();
	const isEditorLoading = useIsSiteEditorLoading();
	const [ isResizableFrameOversized, setIsResizableFrameOversized ] =
		useState( false );
	const animationRef = useMovingAnimation( {
		triggerAnimationOnChange: routeKey + '-' + canvas,
	} );

	const [ backgroundColor ] = useGlobalStyle( 'color.background' );
	const [ gradientValue ] = useGlobalStyle( 'color.gradient' );
	const previousCanvaMode = usePrevious( canvas );
	useEffect( () => {
		if ( previousCanvaMode === 'edit' ) {
			toggleRef.current?.focus();
		}
		// Should not depend on the previous canvas mode value but the next.
	}, [ canvas ] );

	return (
		<>
			<UnsavedChangesWarning />
			<CommandMenu />
			{ canvas === 'view' && <SaveKeyboardShortcut /> }
			<div
				{ ...navigateRegionsProps }
				ref={ navigateRegionsProps.ref }
				className={ clsx(
					'edit-site-layout',
					navigateRegionsProps.className,
					{
						'is-full-canvas': canvas === 'edit',
					}
				) }
			>
				<div className="edit-site-layout__content">
					{ /*
						The NavigableRegion must always be rendered and not use
						`inert` otherwise `useNavigateRegions` will fail.
					*/ }
					{ ( ! isMobileViewport || ! areas.mobile ) && (
						<NavigableRegion
							ariaLabel={ __( 'Navigation' ) }
							className="edit-site-layout__sidebar-region"
						>
							<AnimatePresence>
								{ canvas === 'view' && (
									<motion.div
										initial={ { opacity: 0 } }
										animate={ { opacity: 1 } }
										exit={ { opacity: 0 } }
										transition={ {
											type: 'tween',
											duration:
												// Disable transition in mobile to emulate a full page transition.
												disableMotion ||
												isMobileViewport
													? 0
													: ANIMATION_DURATION,
											ease: 'easeOut',
										} }
										className="edit-site-layout__sidebar"
									>
										<SiteHub
											ref={ toggleRef }
											isTransparent={
												isResizableFrameOversized
											}
										/>
										<SidebarContent
											shouldAnimate={
												routeKey !== 'styles'
											}
											routeKey={ routeKey }
										>
											<ErrorBoundary>
												{ areas.sidebar }
											</ErrorBoundary>
										</SidebarContent>
										<SaveHub />
										<SavePanel />
									</motion.div>
								) }
							</AnimatePresence>
						</NavigableRegion>
					) }

					<EditorSnackbars />

					{ isMobileViewport && areas.mobile && (
						<div className="edit-site-layout__mobile">
							{ canvas !== 'edit' && (
								<SidebarContent routeKey={ routeKey }>
									<SiteHubMobile
										ref={ toggleRef }
										isTransparent={
											isResizableFrameOversized
										}
									/>
								</SidebarContent>
							) }
							<ErrorBoundary>{ areas.mobile }</ErrorBoundary>
						</div>
					) }

					{ ! isMobileViewport &&
						areas.content &&
						canvas !== 'edit' && (
							<div
								className="edit-site-layout__area"
								style={ {
									maxWidth: widths?.content,
								} }
							>
								<ErrorBoundary>{ areas.content }</ErrorBoundary>
							</div>
						) }

					{ ! isMobileViewport && areas.edit && canvas !== 'edit' && (
						<div
							className="edit-site-layout__area"
							style={ {
								maxWidth: widths?.edit,
							} }
						>
							<ErrorBoundary>{ areas.edit }</ErrorBoundary>
						</div>
					) }

					{ ! isMobileViewport && areas.preview && (
						<div className="edit-site-layout__canvas-container">
							{ canvasResizer }
							{ !! canvasSize.width && (
								<div
									className={ clsx(
										'edit-site-layout__canvas',
										{
											'is-right-aligned':
												isResizableFrameOversized,
										}
									) }
									ref={ animationRef }
								>
									<ErrorBoundary>
										<ResizableFrame
											isReady={ ! isEditorLoading }
											isFullWidth={ canvas === 'edit' }
											defaultSize={ {
												width:
													canvasSize.width -
													24 /* $canvas-padding */,
												height: canvasSize.height,
											} }
											isOversized={
												isResizableFrameOversized
											}
											setIsOversized={
												setIsResizableFrameOversized
											}
											innerContentStyle={ {
												background:
													gradientValue ??
													backgroundColor,
											} }
										>
											{ areas.preview }
										</ResizableFrame>
									</ErrorBoundary>
								</div>
							) }
						</div>
					) }
				</div>
			</div>
		</>
	);
}

export default function LayoutWithGlobalStylesProvider( props ) {
	const { createErrorNotice } = useDispatch( noticesStore );
	function onPluginAreaError( name ) {
		createErrorNotice(
			sprintf(
				/* translators: %s: plugin name */
				__(
					'The "%s" plugin has encountered an error and cannot be rendered.'
				),
				name
			)
		);
	}

	return (
		<SlotFillProvider>
			<GlobalStylesProvider>
				{ /** This needs to be within the SlotFillProvider */ }
				<PluginArea onError={ onPluginAreaError } />
				<Layout { ...props } />
			</GlobalStylesProvider>
		</SlotFillProvider>
	);
}
