/**
 * External dependencies
 */
import type { h as createElement, RefObject } from 'preact';

/**
 * Internal dependencies
 */
import { getNamespace } from './namespaces';
import type { Evaluate } from './hooks';

export interface Scope {
	evaluate: Evaluate;
	context: object;
	serverContext: object;
	ref: RefObject< HTMLElement >;
	attributes: createElement.JSX.HTMLAttributes;
}

// Store stacks for the current scope and the default namespaces and export APIs
// to interact with them.
const scopeStack: Scope[] = [];

export const getScope = () => scopeStack.slice( -1 )[ 0 ];

export const setScope = ( scope: Scope ) => {
	scopeStack.push( scope );
};
export const resetScope = () => {
	scopeStack.pop();
};

// Wrap the element props to prevent modifications.
const immutableMap = new WeakMap();
const immutableError = () => {
	throw new Error(
		'Please use `data-wp-bind` to modify the attributes of an element.'
	);
};
const immutableHandlers: ProxyHandler< object > = {
	get( target, key, receiver ) {
		const value = Reflect.get( target, key, receiver );
		return !! value && typeof value === 'object'
			? deepImmutable( value )
			: value;
	},
	set: immutableError,
	deleteProperty: immutableError,
};
const deepImmutable = < T extends object = {} >( target: T ): T => {
	if ( ! immutableMap.has( target ) ) {
		immutableMap.set( target, new Proxy( target, immutableHandlers ) );
	}
	return immutableMap.get( target );
};

/**
 * Retrieves the context inherited by the element evaluating a function from the
 * store. The returned value depends on the element and the namespace where the
 * function calling `getContext()` exists.
 *
 * @param namespace Store namespace. By default, the namespace where the calling
 *                  function exists is used.
 * @return The context content.
 */
export const getContext = < T extends object >( namespace?: string ): T => {
	const scope = getScope();
	if ( globalThis.SCRIPT_DEBUG ) {
		if ( ! scope ) {
			throw Error(
				'Cannot call `getContext()` when there is no scope. If you are using an async function, please consider using a generator instead. If you are using some sort of async callbacks, like `setTimeout`, please wrap the callback with `withScope(callback)`.'
			);
		}
	}
	return scope.context[ namespace || getNamespace() ];
};

/**
 * Retrieves a representation of the element where a function from the store
 * is being evaluated. Such representation is read-only, and contains a
 * reference to the DOM element, its props and a local reactive state.
 *
 * @return Element representation.
 */
export const getElement = () => {
	const scope = getScope();
	if ( globalThis.SCRIPT_DEBUG ) {
		if ( ! scope ) {
			throw Error(
				'Cannot call `getElement()` when there is no scope. If you are using an async function, please consider using a generator instead. If you are using some sort of async callbacks, like `setTimeout`, please wrap the callback with `withScope(callback)`.'
			);
		}
	}
	const { ref, attributes } = scope;
	return Object.freeze( {
		ref: ref.current,
		attributes: deepImmutable( attributes ),
	} );
};

/**
 * Retrieves the part of the inherited context defined and updated from the
 * server.
 *
 * The object returned is read-only, and includes the context defined in PHP
 * with `wp_interactivity_data_wp_context()`, including the corresponding
 * inherited properties. When `actions.navigate()` is called, this object is
 * updated to reflect the changes in the new visited page, without affecting the
 * context returned by `getContext()`. Directives can subscribe to those changes
 * to update the context if needed.
 *
 * @example
 * ```js
 *  store('...', {
 *    callbacks: {
 *      updateServerContext() {
 *        const context = getContext();
 *        const serverContext = getServerContext();
 *        // Override some property with the new value that came from the server.
 *        context.overridableProp = serverContext.overridableProp;
 *      },
 *    },
 *  });
 * ```
 *
 * @param namespace Store namespace. By default, the namespace where the calling
 *                  function exists is used.
 * @return The server context content.
 */
export const getServerContext = < T extends object >(
	namespace?: string
): T => {
	const scope = getScope();
	if ( globalThis.SCRIPT_DEBUG ) {
		if ( ! scope ) {
			throw Error(
				'Cannot call `getServerContext()` when there is no scope. If you are using an async function, please consider using a generator instead. If you are using some sort of async callbacks, like `setTimeout`, please wrap the callback with `withScope(callback)`.'
			);
		}
	}
	return scope.serverContext[ namespace || getNamespace() ];
};
