/**
 * External dependencies
 */
import RouteRecognizer from 'route-recognizer';
import { createBrowserHistory } from 'history';

/**
 * WordPress dependencies
 */
import {
	createContext,
	useContext,
	useSyncExternalStore,
	useMemo,
} from '@wordpress/element';
import {
	addQueryArgs,
	getQueryArgs,
	getPath,
	buildQueryString,
} from '@wordpress/url';
import { useEvent } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import type { ReactNode } from 'react';

const history = createBrowserHistory();
interface Route {
	name: string;
	path: string;
	areas: Record< string, ReactNode >;
	widths: Record< string, number >;
}

type LocationWithQuery = Location & {
	query?: Record< string, any >;
};

interface Match {
	name: string;
	path: string;
	areas: Record< string, ReactNode >;
	widths: Record< string, number >;
	query?: Record< string, any >;
	params?: Record< string, any >;
}

export type BeforeNavigate = ( arg: {
	path: string;
	query: Record< string, any >;
} ) => {
	path: string;
	query: Record< string, any >;
};

interface Config {
	pathArg: string;
	beforeNavigate?: BeforeNavigate;
}

export interface NavigationOptions {
	transition?: string;
	state?: Record< string, any >;
}

const RoutesContext = createContext< Match | null >( null );
export const ConfigContext = createContext< Config >( { pathArg: 'p' } );

const locationMemo = new WeakMap();
function getLocationWithQuery() {
	const location = history.location;
	let locationWithQuery = locationMemo.get( location );
	if ( ! locationWithQuery ) {
		locationWithQuery = {
			...location,
			query: Object.fromEntries( new URLSearchParams( location.search ) ),
		};
		locationMemo.set( location, locationWithQuery );
	}
	return locationWithQuery;
}

export function useLocation() {
	const context = useContext( RoutesContext );
	if ( ! context ) {
		throw new Error( 'useLocation must be used within a RouterProvider' );
	}
	return context;
}

export function useHistory() {
	const { pathArg, beforeNavigate } = useContext( ConfigContext );

	const navigate = useEvent(
		async ( rawPath: string, options: NavigationOptions = {} ) => {
			const query = getQueryArgs( rawPath );
			const path = getPath( 'http://domain.com/' + rawPath ) ?? '';
			const performPush = () => {
				const result = beforeNavigate
					? beforeNavigate( { path, query } )
					: { path, query };
				return history.push(
					{
						search: buildQueryString( {
							[ pathArg ]: result.path,
							...result.query,
						} ),
					},
					options.state
				);
			};

			/*
			 * Skip transition in mobile, otherwise it crashes the browser.
			 * See: https://github.com/WordPress/gutenberg/pull/63002.
			 */
			const isMediumOrBigger =
				window.matchMedia( '(min-width: 782px)' ).matches;
			if (
				! isMediumOrBigger ||
				! document.startViewTransition ||
				! options.transition
			) {
				performPush();
				return;
			}

			await new Promise< void >( ( resolve ) => {
				const classname = options.transition ?? '';
				document.documentElement.classList.add( classname );
				const transition = document.startViewTransition( () =>
					performPush()
				);
				transition.finished.finally( () => {
					document.documentElement.classList.remove( classname );
					resolve();
				} );
			} );
		}
	);

	return useMemo(
		() => ( {
			navigate,
			back: history.back,
		} ),
		[ navigate ]
	);
}

export default function useMatch(
	location: LocationWithQuery,
	matcher: RouteRecognizer,
	pathArg: string
): Match {
	const { query: rawQuery = {} } = location;

	return useMemo( () => {
		const { [ pathArg ]: path = '/', ...query } = rawQuery;
		const result = matcher.recognize( path )?.[ 0 ];
		if ( ! result ) {
			return {
				name: '404',
				path: addQueryArgs( path, query ),
				areas: {},
				widths: {},
				query,
				params: {},
			};
		}

		const matchedRoute = result.handler as Route;
		const resolveFunctions = ( record: Record< string, any > = {} ) => {
			return Object.fromEntries(
				Object.entries( record ).map( ( [ key, value ] ) => {
					if ( typeof value === 'function' ) {
						return [
							key,
							value( { query, params: result.params } ),
						];
					}
					return [ key, value ];
				} )
			);
		};
		return {
			name: matchedRoute.name,
			areas: resolveFunctions( matchedRoute.areas ),
			widths: resolveFunctions( matchedRoute.widths ),
			params: result.params,
			query,
			path: addQueryArgs( path, query ),
		};
	}, [ matcher, rawQuery, pathArg ] );
}

export function RouterProvider( {
	routes,
	pathArg,
	beforeNavigate,
	children,
}: {
	routes: Route[];
	pathArg: string;
	beforeNavigate?: BeforeNavigate;
	children: React.ReactNode;
} ) {
	const location = useSyncExternalStore(
		history.listen,
		getLocationWithQuery,
		getLocationWithQuery
	);
	const matcher = useMemo( () => {
		const ret = new RouteRecognizer();
		routes.forEach( ( route ) => {
			ret.add( [ { path: route.path, handler: route } ], {
				as: route.name,
			} );
		} );
		return ret;
	}, [ routes ] );
	const match = useMatch( location, matcher, pathArg );
	const config = useMemo(
		() => ( { beforeNavigate, pathArg } ),
		[ beforeNavigate, pathArg ]
	);

	return (
		<ConfigContext.Provider value={ config }>
			<RoutesContext.Provider value={ match }>
				{ children }
			</RoutesContext.Provider>
		</ConfigContext.Provider>
	);
}
