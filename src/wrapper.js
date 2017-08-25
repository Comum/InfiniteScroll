/**
 * The jquery wrapper
 */

import HeavenScroll from './HeavenScroll';

const pluginName = 'heavenScroll';

$.fn[pluginName] = function (options) {
    return this.each(function () {
        if (!$.data(this, 'plugin_' + pluginName)) {
            $.data(this, 'plugin_' + pluginName, new HeavenScroll(this, options));
        }
    });
};
