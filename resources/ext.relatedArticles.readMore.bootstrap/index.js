( function ( $, mw ) {

	var relatedPages = new mw.relatedPages.RelatedPagesGateway(
			new mw.Api(),
			mw.config.get( 'wgPageName' ),
			mw.config.get( 'wgRelatedArticles' ),
			mw.config.get( 'wgRelatedArticlesUseCirrusSearch' ),
			mw.config.get( 'wgRelatedArticlesOnlyUseCirrusSearch' )
		),
		LIMIT = mw.config.get( 'wgRelatedArticlesCardLimit' ),
		debouncedLoad = $.debounce( 100, function () {
			loadRelatedArticles(); // eslint-disable-line
		} ),
		$window = $( window ),
		shouldShowReadMore;

	/**
	 * Is RelatedArticles extension enabled for current user
	 *
	 * Returns true if the user opted into the beta feature, otherwise
	 * user's session ID is used to determine the eligibility for RelatedArticles functionality,
	 * based on the value of wgRelatedArticlesEnabledSamplingRate
	 * thus the function will result the same outcome as long as the browser
	 * hasn't been restarted or the cookie hasn't been cleared.
	 *
	 * @return {boolean}
	 */
	function isEnabledForCurrentUser() {
		var bucket,
			samplingRate = mw.config.get( 'wgRelatedArticlesEnabledSamplingRate', 1 );

		bucket = mw.experiments.getBucket( {
			name: 'ext.relatedArticles.visibility',
			enabled: true,
			buckets: {
				control: 1 - samplingRate,
				A: samplingRate
			}
		}, mw.user.sessionId() );
		return bucket === 'A';
	}

	/**
	 * Load related articles when the user scrolls past half of the window height.
	 *
	 * @ignore
	 */
	function loadRelatedArticles() {
		var readMore = $( '.read-more-container' ).get( 0 ),
			scrollThreshold = $window.height() * 2;

		if ( mw.viewport.isElementCloseToViewport( readMore, scrollThreshold ) ) {
			$.when(
				// Note we load dependencies here rather than ResourceLoader
				// to avoid PHP exceptions when Cards not installed
				// which should never happen given the if statement.
				mw.loader.using( [
					'ext.relatedArticles.cards',
					'ext.relatedArticles.readMore'
				] ),
				relatedPages.getForCurrentPage( LIMIT )
			).done( function ( _, pages ) {
				if ( pages.length ) {
					mw.track( 'ext.relatedArticles.init', pages );
				} else {
					readMore.remove();
				}
			} );
			// detach handler to stop subsequent loads on scroll
			$window.off( 'scroll', debouncedLoad );
		}
	}

	shouldShowReadMore = isEnabledForCurrentUser();

	if ( shouldShowReadMore ) {
		// Add container to DOM for checking distance on scroll
		// If a skin has marked up a footer content area prepend it there
		if ( $( '.footer-content' ).length ) {
			$( '<div class="read-more-container" />' ).prependTo( '.footer-content' );
		} else {
			$( '<div class="read-more-container post-content" />' )
				.insertAfter( '#content' );
		}

		// try related articles load on scroll
		$window.on( 'scroll', debouncedLoad );
		// try an initial load, in case of no scroll
		loadRelatedArticles();
	}

	mw.track( 'ext.relatedArticles.logEnabled', { isEnabled: shouldShowReadMore } );
}( jQuery, mediaWiki ) );
