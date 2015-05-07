if (typeof App == 'undefined' && typeof window.app == 'undefined') {
    var App = function () {
        window.app = {
        };

        app.monthNumber = parseInt(moment().format('M'));
        app.year = parseInt(moment().format('YY'));
        app.currentDate = app.monthNumber+'.'+app.year;
        app.monthEndDay = parseInt(moment().endOf('month').format('D'));
        app.startDayOfWeek = parseInt((moment().startOf('month').format('d') != 0) ? moment().startOf('month').format('d') : 7);
        app.dayToday = parseInt(moment().format('DD'));


        //todo localStore load
        //app.perDayLimit = 250;


        app.models = {
            perDiem: new perDiemModel(),
            options: new optionsModel()
        }

        //load options
        var userOptions = storage.getItem('user_options_'+app.currentDate);
        if (userOptions){
            app.models.options.set(userOptions);
        } else {
            var last_month = app.monthNumber - 1,
                last_date = '';
            if (!last_month){
                var last_year = app.year-1;
                last_date = 12+'.'+last_year;
            } else {
                last_date = last_month+'.'+app.year;
            }
            userOptions = storage.getItem('user_options_'+last_date);
            if (userOptions){
                app.models.options.set(userOptions);
            } else {
                storage.setItem('user_options_'+app.currentDate, app.models.options.toJSON());
            }
        }
        //------------

        app.collections = {
            perDiem: perDiemCollection
        }
		app.views = {
            perDiemDays: new perDiemDaysList(),
            options: new optionsView()
        }

        app.router = new Router();

        //load from storage
        var gettedData = storage.getItem(app.currentDate);
        if (gettedData){
            console.log('getted data from storage');
            console.log(gettedData);
            app.collections.perDiem.set(gettedData);
        } else {
            for (var i=1; i<= app.monthEndDay; i++){
                var model = new perDiemModel({
                    day_number: i,
                    date: moment(app.monthNumber+'.'+i+'.'+app.year).format('MM.DD.YY'),
                    month_number: parseInt(moment().format('M'))
                });

                app.collections.perDiem.add(model);
            }
            storage.setItem(app.currentDate, app.collections.perDiem.toJSON());
        }
        //-----------------

        _.extend(app, Backbone.Events);
        Backbone.history.start();
        app.trigger('app_load_done');
        //app.router.navigate('options');
        app.router.navigate('perDiem');

        //handler app-head app-footer
        $('#app-head .btn-options').click(function(){
            app.router.navigate('options');
        })
        //---------------------------

        return app;
	}
	
}