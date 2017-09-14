/* eslint-disable */
/**
 * This file contains a demo
 */
import './style.scss';

/**
 * Returns a string to be included in the html
 *
 * @param {Function} cb
 */
function getQuote(cb) {
    $.ajax({
        url: 'http://cors-proxy.htmldriven.com/?url=http://thoughtsoncoding.com/api/1.0/random.json',
        success: function (data) {
            cb(JSON.parse(data.body).quote);
        }
    });
}

/**
 * Returns html to be written inside .pageSingle
 *
 * @param {Object} options
 * @param {String} options.pageClassName
 * @param {Integer|Array} options.pageNumber
 * @param {Function} cb
 */
function productTileFetcher(options, cb) {
	getQuote((quote) => {
        var html;

        if (options.pageNumber.constructor === Array) {
            html = '';

            options.pageNumber.forEach((pageNumber, index) => {
                quote = quote + '<br><a href="https://web.fe.up.pt/~ee08112/">Click Me!</a>';
                html = html + this.wrapHtmlPage(quote, {pageClassName: options.pageClassName, pageNumber: pageNumber});
            });

            cb(html);
        } else {
            quote = quote + '<br><a href="https://web.fe.up.pt/~ee08112/">Click Me!</a>';
            cb(this.wrapHtmlPage(quote, options));
        }
	});
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
        loadPageFunction: productTileFetcher,
        spinnerClassName: 'Spinner'
    });
});
