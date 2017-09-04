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
        var html;

        if (options.pageNumber.constructor === Array) {
            html = '';

            options.pageNumber.forEach(function (pageNumber) {
                html = html + '<div class="' + options.pageClassName + '" data-page-number="' + pageNumber + '">' + pageNumber + '</div>';
            });

            cb(html);
        } else {
            cb('<div class="' + options.pageClassName + '" data-page-number="' + options.pageNumber + '">' + options.pageNumber + '</div>');
        }
	}, 250);
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
