const { render, init, getCards, test } = require( '../../resources/ext.relatedArticles.readMore/index.js' );
const { createApp } = require( 'vue' );
const PAGE = {
	title: 'Hello no description'
};
const PAGE_WITH_DESCRIPTION = {
	title: 'Hello',
	description: 'Description',
	thumbnail: {
		source: 'hello.gif',
		width: 200,
		height: 200
	}
};

describe( 'ext.relatedArticles.readMore.bootstrap', () => {
	beforeEach( () => {
		mw.util.getUrl = jest.fn( ( title ) => `/wiki/${ title }` );
	} );

	it( 'init with zero pages and parent container', () => {
		test.relatedPages.getForCurrentPage = jest.fn( () => Promise.resolve( [] ) );
		const parent = document.createElement( 'div' );
		const element = document.createElement( 'div' );
		parent.appendChild( element );
		init( element );
		expect( parent.innerHTML ).toMatchSnapshot();
	} );

	it( 'init with zero pages without parent container', () => {
		test.relatedPages.getForCurrentPage = jest.fn( () => Promise.resolve( [] ) );
		const element = document.createElement( 'div' );
		init( element );
		expect( element.innerHTML ).toMatchSnapshot();
	} );

	it( 'init with pages', () => {
		test.relatedPages.getForCurrentPage = jest.fn( () => Promise.resolve( [
			PAGE_WITH_DESCRIPTION
		] ) );
		const element = document.createElement( 'div' );
		init( element );
		expect( element.innerHTML ).toMatchSnapshot();
	} );

	it( 'renders with small container and custom heading', () => {
		const element = document.createElement( 'div' );
		render( [], element, 'Hello world', function ( options ) {
			const app = createApp( options );
			return app;
		}, true );
		expect( element.innerHTML ).toMatchSnapshot();
	} );

	it( 'renders without error', () => {
		const element = document.createElement( 'div' );
		const plugin = {
			install: function ( app ) {
				app.config.globalProperties.$i18n = () => ( {
					text: ( key ) => `<${ key }>`
				} );
			}
		};
		render( [
			PAGE,
			PAGE_WITH_DESCRIPTION,
			{
				title: 'Hello with extract',
				extract: 'Extract',
				thumbnail: {
					source: 'helloEx.gif',
					width: 200,
					height: 200
				}
			},
			{
				title: 'Hello with pageprops',
				pageprops: {
					description: 'Page props desc'
				}
			}
		], element, '', function ( options ) {
			const app = createApp( options );
			app.use( plugin );
			return app;
		}, false );
		expect( element.innerHTML ).toMatchSnapshot();
	} );

	const DEFAULT_CARD = {
		title: 'Title',
		thumbnail: {
			source: 'puppy.gif',
			width: 100,
			height: 100
		}
	};

	it( 'maps cards', () => {
		[
			[
				Object.assign( {}, DEFAULT_CARD, {
					description: 'Description'
				} )
			],
			[
				Object.assign( {}, DEFAULT_CARD, {
					extract: 'Description'
				} )
			],
			[
				Object.assign( {}, DEFAULT_CARD, {
					pageprops: {
						description: 'Description'
					}
				} )
			]
		].forEach( ( testCase ) => {
			const cards = getCards( testCase );
			expect( cards ).toEqual( [
				{
					id: 'Title',
					label: 'Title',
					url: '/wiki/Title',
					thumbnail: {
						width: 100,
						height: 100,
						url: 'puppy.gif'
					},
					description: 'Description'
				}
			] );
		} );
	} );

	it( 'maps cards with missing fields', () => {
		const cards = getCards(
			[
				{
					title: 'Title'
				}
			]
		);
		expect( cards ).toEqual( [
			{
				id: 'Title',
				label: 'Title',
				url: '/wiki/Title',
				description: '',
				thumbnail: undefined
			}
		] );
	} );
} );
