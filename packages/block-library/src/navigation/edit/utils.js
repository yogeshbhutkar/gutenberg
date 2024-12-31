/**
 * External dependencies
 */
import clsx from 'clsx';

function getComputedStyle( node ) {
	return node.ownerDocument.defaultView.getComputedStyle( node );
}

export function detectColors(
	colorsDetectionElement,
	setColor,
	setBackground
) {
	if ( ! colorsDetectionElement ) {
		return;
	}
	setColor( getComputedStyle( colorsDetectionElement ).color );

	let backgroundColorNode = colorsDetectionElement;
	let backgroundColor =
		getComputedStyle( backgroundColorNode ).backgroundColor;
	while (
		backgroundColor === 'rgba(0, 0, 0, 0)' &&
		backgroundColorNode.parentNode &&
		backgroundColorNode.parentNode.nodeType ===
			backgroundColorNode.parentNode.ELEMENT_NODE
	) {
		backgroundColorNode = backgroundColorNode.parentNode;
		backgroundColor =
			getComputedStyle( backgroundColorNode ).backgroundColor;
	}

	setBackground( backgroundColor );
}

/**
 * Determine the colors for a menu.
 *
 * Order of priority is:
 * 1: Overlay custom colors (if submenu)
 * 2: Overlay theme colors (if submenu)
 * 3: Custom colors
 * 4: Theme colors
 * 5: Global styles
 *
 * @param {Object}  context
 * @param {boolean} isSubMenu
 */
export function getColors( context, isSubMenu ) {
	const {
		textColor,
		customTextColor,
		backgroundColor,
		customBackgroundColor,
		overlayTextColor,
		customOverlayTextColor,
		overlayBackgroundColor,
		customOverlayBackgroundColor,
		style,
	} = context;

	const colors = {};
	const defaultColor = {
		textColor: '#000',
		backgroundColor: '#fff',
	};

	if ( isSubMenu && !! customOverlayTextColor ) {
		colors.customTextColor = customOverlayTextColor;
	} else if ( isSubMenu && !! overlayTextColor ) {
		colors.textColor = overlayTextColor;
	} else if ( ! isSubMenu && !! customTextColor ) {
		colors.customTextColor = customTextColor;
	} else if ( ! isSubMenu && !! textColor ) {
		colors.textColor = textColor;
	} else if ( ! isSubMenu && !! style?.color?.text ) {
		colors.customTextColor = style.color.text;
	} else {
		colors.customTextColor = defaultColor.textColor;
	}

	if ( isSubMenu && !! customOverlayBackgroundColor ) {
		colors.customBackgroundColor = customOverlayBackgroundColor;
	} else if ( isSubMenu && !! overlayBackgroundColor ) {
		colors.backgroundColor = overlayBackgroundColor;
	} else if ( ! isSubMenu && !! customBackgroundColor ) {
		colors.customBackgroundColor = customBackgroundColor;
	} else if ( ! isSubMenu && !! backgroundColor ) {
		colors.backgroundColor = backgroundColor;
	} else if ( ! isSubMenu && !! style?.color?.background ) {
		colors.customTextColor = style.color.background;
	} else {
		colors.customBackgroundColor = defaultColor.backgroundColor;
	}

	return colors;
}

export function getNavigationChildBlockProps( innerBlocksColors ) {
	return {
		className: clsx( 'wp-block-navigation__submenu-container', {
			'has-text-color': !! (
				innerBlocksColors.textColor || innerBlocksColors.customTextColor
			),
			[ `has-${ innerBlocksColors.textColor }-color` ]:
				!! innerBlocksColors.textColor,
			'has-background': !! (
				innerBlocksColors.backgroundColor ||
				innerBlocksColors.customBackgroundColor
			),
			[ `has-${ innerBlocksColors.backgroundColor }-background-color` ]:
				!! innerBlocksColors.backgroundColor,
		} ),
		style: {
			color: innerBlocksColors.customTextColor,
			backgroundColor: innerBlocksColors.customBackgroundColor,
		},
	};
}
