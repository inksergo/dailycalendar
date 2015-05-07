/**
 * Created by Zerg on 08.04.2015.
 */

var renderCache = {};
var preloadRenderCache = function(paths){
    var urls = _.isArray(paths) ? paths : [paths];
    _.each(urls, function(url){
        var tpl = null;
        url = url.replace(/^\//,'');
        console.log('Loading template ' + url);

        $.ajax(
            url,
            {
                async: false,
                context: this,
                success: function (data) {
                    tpl = data;
                    console.log('Template ' + url + ' has been loaded');
                }
            }
        );

        if (tpl) {
            renderCache[url] = tpl;
        } else {
            throw 'Loading view ' + url + ' has been failed';
        }
    });
}

var renderView = function (url, params) {
    url = url.replace(/^\//,'');
    if (!renderCache[url]) {
        preloadRenderCache(url);
    }
    var tpl = renderCache[url];
    var html = Mustache.render(tpl, params);
    /*
    //локализация, согласно атрибутам local_innerHtml
    if (typeof app != 'undefined' && typeof app.l8n != 'undefined') {
        var $node = $('<div></div>').html(html);
        $node.find('*[local_innerHtml]').each(function () {
            var $this = $(this),
                key = $this.attr('local_innerHtml').split('d.')[1],
                params = ($this.attr('lang_params')) ? JSON.parse($this.attr('lang_params')) : [],
                value = app.l8n(key, params);

            $this.html(value);
        });
        return $node.html();
    } else {
        return html;
    }
    */
    return html;
}

var storage = {
    setItem: function(key,item){
        item = JSON.stringify(item);
        localStorage.setItem(key,item);
    },
    getItem: function(key){
        var item = localStorage.getItem(key);
        return JSON.parse(item);
    }
}