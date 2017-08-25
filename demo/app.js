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
	cb('<div class="' + options.pageClassName + '">' + options.pageNumber + '</div>');
}

$(document).ready(function () {
    $('.pagesContainer').heavenScroll({
        maxPagesNumber: 3,
        pageHeight: 1584,
        startPage: 1,
        pageClassName: 'pageSingle',
        urlQueryParamName: 'startPage',
        loadPageFunction: productTileFetcher
    });
});
