/* eslint-disable */
/**
 * This file contains a demo
 */
import './style.scss';

/**
 * Returns html to be written inside .pageSingle
 * @param {object} options
 * @param {string} options.pageClassName
 * @param {integer} options.pageNumber
 * @param {function} cb
 */
function productTileFetcher(options, cb) {
	setTimeout(function () {
		cb('<div class="' + options.pageClassName + '">' + options.pageNumber + '</div>');
	}, 250);
	// cb('<div class="' + options.pageClassName + '">' + options.pageNumber + '</div>');
}

$(document).ready(function () {
    $('.pagesContainer').heavenScroll({
    	fadeInValue: 1500,
        maxPagesNumber: 3,
        pageHeight: 1584,
        startPage: 1,
        endPage: 10,
        pageClassName: 'pageSingle',
        urlQueryParamName: 'startPage',
        loadPageFunction: productTileFetcher
    });
});
