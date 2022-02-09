'use strict';

const assert = require( 'assert' ),
	Api = require( 'wdio-mediawiki/Api' ),
	ReadMorePage = require( '../pageobjects/readmore.page' );

describe( 'ReadMore', function () {
	let bot;

	before( async () => {
		bot = await Api.bot();
	} );

	const name = 'Related Articles 1';

	// eslint-disable-next-line mocha/no-sibling-hooks
	before( async function () {
		// Create page needed for the tests
		const content = '{{#related:related_articles_2}}';
		await bot.edit( name, content );
	} );

	it.skip( 'ReadMore is not present on Vector', async function () {
		await ReadMorePage.openDesktop( name );
		assert( await !ReadMorePage.isCardVisible(), 'No related pages cards are shown' );
	} );

	it.skip( 'ReadMore is present in Minerva @daily', async function () {
		await ReadMorePage.openMobile( name );
		assert( await ReadMorePage.seeReadMore() );
	} );
} );
