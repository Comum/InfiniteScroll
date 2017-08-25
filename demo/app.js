/**
 * This file contains a demo
 */
import './style.scss';

$(document).ready(function () {
    $('.pagesContainer').heavenScroll({
        maxPagesNumber: 3,
        pageHeight: 1584,
        startPage: 1,
        loadPageFunction: 'productTileFetcher',
        pageClassName: 'pageSingle',
        urlQueryParamName: 'startPage'
    });
});
