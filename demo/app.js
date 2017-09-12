/* eslint-disable */
/**
 * This file contains a demo
 */
import './style.scss';

/**
 * Returns a string to be included in the html
 */
function getQuote(cb) {
    $.ajax({
        async: false,
        url: 'http://cors-proxy.htmldriven.com/?url=http://thoughtsoncoding.com/api/1.0/random.json',
        success: function (data) {
            cb(JSON.parse(data.body).quote);
        }
    });
}

/**
 * Returns html to be written inside .pageSingle
 * @param {object} options
 * @param {string} options.pageClassName
 * @param {integer} options.pageNumber
 * @param {function} cb
 */
function productTileFetcher(options, cb) {
	getQuote((quote) => {
        var html;

        if (options.pageNumber.constructor === Array) {
            html = '';

            options.pageNumber.forEach((pageNumber, index) => {
                // html = this.wrapHtmlPage(html + '<div class="' + options.pageClassName + '" style="top: ' + options.pageHeight[index] + 'px" data-page-number="' + pageNumber + '">' + quote + '</div>');
                html = html + this.wrapHtmlPage(quote, {pageClassName: options.pageClassName, pageHeight: options.pageHeight[index], pageNumber: pageNumber});
            });

            cb(html);
        } else {
            // cb(this.wrapHtmlPage('<div class="' + options.pageClassName + '" style="top: ' + options.pageHeight + 'px" data-page-number="' + options.pageNumber + '">' + quote + '</div>'));
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
        hasSpinner: true,
        spinnerClassName: 'Spinner'
    });
});
