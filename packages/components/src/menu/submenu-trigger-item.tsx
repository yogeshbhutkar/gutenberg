/**
 * External dependencies
 */
import * as Ariakit from '@ariakit/react';

/**
 * WordPress dependencies
 */
import { forwardRef, useContext } from '@wordpress/element';
import { chevronRightSmall } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import type { WordPressComponentProps } from '../context';
import type { MenuItemProps } from './types';
import { MenuContext } from './context';
import { MenuItem } from './item';
import * as Styled from './styles';

export const MenuSubmenuTriggerItem = forwardRef<
	HTMLDivElement,
	WordPressComponentProps< MenuItemProps, 'div', false >
>( function MenuSubmenuTriggerItem( { suffix, ...otherProps }, ref ) {
	const menuContext = useContext( MenuContext );

	if ( ! menuContext?.store.parent ) {
		throw new Error(
			'Menu.SubmenuTriggerItem can only be rendered inside a nested Menu component'
		);
	}

	return (
		<Ariakit.MenuButton
			ref={ ref }
			accessibleWhenDisabled
			store={ menuContext.store }
			render={
				<MenuItem
					{ ...otherProps }
					// The menu item needs to register and be part of the parent menu.
					// Without specifying the store explicitly, the `MenuItem` component
					// would otherwise read the store via context and pick up the one from
					// the sub-menu `Menu` component.
					store={ menuContext.store.parent }
					suffix={
						<>
							{ suffix }
							<Styled.SubmenuChevronIcon
								aria-hidden="true"
								icon={ chevronRightSmall }
								size={ 24 }
								preserveAspectRatio="xMidYMid slice"
							/>
						</>
					}
				/>
			}
		/>
	);
} );
