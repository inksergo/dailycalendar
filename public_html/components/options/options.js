
var optionsView = Backbone.View.extend({
    el: "#options-container",
    define: function () {
        //this.$perDayLimitInput = this.$('.per-day-limit-input');
        this.$okBtn = this.$('.options-ok-btn');
        this.perDayLimit = this.$('.per-day-limit');
    },
    events: {
        'click .limit-value': function(){
            var input = this.perDayLimit.find('.per-day-limit-input');
            input.val(app.models.options.get('perDayLimit'));
            this.perDayLimit.find('.limit-value').hide();
            input.show().focus();
        },
        'click .options-ok-btn': function(){
            app.router.navigate('perDiem');
        },
        'keypress .per-day-limit-input': function(e){
            var str = String.fromCharCode(e.keyCode);
            if (!str.match(/^[-()+\d]+$/)){
                e.preventDefault();
            }
        }
    },
    initialize: function () {
        this.$el.html(renderView('components/options/options.html'));
        this.define();
        this.render();

        this.$el.click(_.bind(function(e){
            var item = $(e.target).parents('.per-day-limit');
            if (!item[0]){
                this.saveChanges();
            }
        }, this));
    },
    saveChanges: function(){
        var input = this.perDayLimit.find('.per-day-limit-input'),
            spanValue = this.perDayLimit.find('.limit-value');
        if (input.val() != spanValue.html()){
            if (input.val() == '' || input.val() < 200){
                app.models.options.set('perDayLimit', 200);
            } else {
                app.models.options.set('perDayLimit', input.val())
            }
            storage.setItem('user_options_'+app.currentDate, app.models.options.toJSON());
            this.render();
        }

        this.perDayLimit.find('.per-day-limit-input').hide();
        this.perDayLimit.find('.limit-value').show();
    },
    listenFactory: function(){
        /*
        this.listenTo(app.collections.perDiem, 'add', function(model){
            this.addView(model);
        });
        */
    },
    render: function(){
        this.perDayLimit.find('.per-day-limit-input').val(app.models.options.get('perDayLimit'));
        this.perDayLimit.find('.limit-value').html(app.models.options.get('perDayLimit'));
    }
});
