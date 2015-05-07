var Router = Backbone.Router.extend({
    routes: {
        "index": "index",
        "perDiem": "perDiem",
        "options": "options"
    },
    tabs: {},
    current_route: {},
    define: function(){
        this.appHead = $('#app-head');
        this.appConfBtn = this.appHead.find('.btn-options');
        this.$mainContent = $('#main-content');
        this.appFooter = $('#app-footer');
    },
    initialize: function(){
        this.define();

        this.tabs['options'] = $('#options-container');
        this.tabs['perDiem'] = $('#per-diem-container');

        var _navigate = this._navigate = this.navigate;
        this.navigate = function(route_l) {
            console.log('route to '+ route_l);

            if (!this.current_route.page) {
                this.$mainContent.append(app.views.perDiemDays.$el);
                this.current_route.page = 'perDiem';
            }
/*
            this.tabs[this.current_route.page].hide();
            this.tabs[route_l].show();
*/
            
            if (route_l === 'options'){
                this.appConfBtn.hide();
            } else {
                this.appConfBtn.show();
            }

            var str = route_l.split('/');
            this.current_route = {
                page : str[0],
                id : str[1]
            };
            _navigate(route_l, {trigger: true});
        };
    },
    index: function(){
    console.log('index nav')
    },
    perDiem: function(){
        //this.$mainContent.html(this.tabs['perDiem']);
    },
    options: function(){
        //this.$mainContent.html(this.tabs['options']);
    }
    /*
    homepage: function () {
        log('Router: route homepage');
    },
    visitors: function (id) {
    },
    client: function (id) {
        log('Router: route client/' + id);
    },
    agent: function (id) {
        log('Router: route agent/' + id);
    }
    */
});