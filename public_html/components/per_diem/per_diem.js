
var perDiemDayView = Backbone.View.extend({
    touchStartTimeStamp: null,
    timer: null,
    touchDuration : 500, //length of time we want the user to touch before we do something
    isTouchMove: false,

    el: '<td></td>',
    events: {
        'click' : function(){
            console.log('click model view');
            if (this.model.get('day_number') < app.dayToday-1){
                alert('day was left');
                return;
            }
            if (this.model.get('payed')){
                this.onlongtouch();
                return;
            }
            this.model.set('payed_all', !this.model.get('payed_all'));
            storage.setItem(app.currentDate, app.collections.perDiem.toJSON());
        },
        'touchmove': _.throttle(function(){
            if (this.timer) {
                clearTimeout(this.timer); // clearTimeout, not cleartimeout..
                this.timer = null;
            }
            this.isTouchMove = true;
        }, 30),
        'touchstart': function(){
            console.log('touchstart model view');
            this.touchStartTimeStamp = Date.now();
            this.timer = setTimeout(_.bind(function(){
                this.onlongtouch();
            }, this), this.touchDuration);
        },
        'touchend': function(){
            if (this.isTouchMove){
                this.isTouchMove = false;
                return;
            }
            console.log('touchend model view');
            //stops short touches from firing the event
            if (this.timer) {
                clearTimeout(this.timer); // clearTimeout, not cleartimeout..
                this.timer = null;
            }
        }
        /*
         'touchmove': _.throttle(function(){
         if (this.timer) {
         clearTimeout(this.timer); // clearTimeout, not cleartimeout..
         this.timer = null;
         }
         this.isTouchMove = true;
         }, 30),

         'touchstart': function(){
         this.touchStartTimeStamp = Date.now();
         this.timer = setTimeout(_.bind(function(){
         this.onlongtouch();
         }, this), this.touchDuration);
         },
         'touchend': function(){
         if (this.isTouchMove){
         this.isTouchMove = false;
         return;
         }

         //stops short touches from firing the event
         if (this.timer) {
         clearTimeout(this.timer); // clearTimeout, not cleartimeout..
         this.timer = null;
         } else {
         return;
         }

         var time = Date.now()-this.touchStartTimeStamp;
         if (time < this.touchDuration-100){
         if (this.model.get('payed')){
         this.onlongtouch();
         return;
         }
         this.model.set('payed_all', !this.model.get('payed_all'));
         }
         }
         */
    },
    initialize: function () {
        if (this.model.get('day_number') == app.dayToday){
            this.$el.addClass('today');
        }

        if (this.model.get('day_number') < app.dayToday-1){
            this.$el.addClass('left');
        }

        this.$el.html(this.model.get('day_number'));

        this.render();

        this.listenTo(this.model, 'change:payed_all change:payed', function(){
            this.render();
        })
    },
    render: function(){
        console.log('change:payed_all change:payed');
        console.log(this.model.get('payed_all'));

        this.$el.removeClass('payed-all');
        this.$el.removeClass('payed');


        if (this.model.get('payed')){
            this.$el.addClass('payed');
        } else if (this.model.get('payed_all')){
            this.$el.addClass('payed-all');
        }
    },



    onlongtouch : function() {
        console.log('long touch');
        if (this.model.get('day_number') < app.dayToday-1){
            alert('day was left');
            return;
        }
        app.views.perDiemDays.trigger('long_touch_calendar', this.model.id);
    }
});

var perDiemDaysList = Backbone.View.extend({
    views: {},
    overLimit: 0,
    popupModel: null,
    perDayTotal: 0,
    wastedTotal:0,
    //el: "#per-diem-container",
    define: function () {
        this.$daysInputsTable = this.$('.days-inputs-table');
        this.$currentMonth = this.$('.row_month');
        this.$moneyWasted = this.$('.per-day-wasted');
        this.$overLimit = this.$('.per-day-overlimit');
        this.$moneyLeft = this.$('.per-day-has-left');
        this.$popupPerDiem = this.$('#popup-per-diem');
        this.$popupOverlimit = this.$('#popup-overlimit');
    },
    events: {
        'click .per-day-overlimit button': function(){
            this.$popupOverlimit.parent().fadeIn(200);
        },
        'click #popup-overlimit .cancel-btn': function(){
            console.log('cancel-btn press');
            this.$popupOverlimit.parent().fadeOut(200);
        },


        'click #popup-per-diem .ok-btn': function(){
            console.log('ok-btn press');
            this.setDaily();
        },
        'click #popup-per-diem .cancel-btn': function(){
            console.log('cancel-btn press');
            this.popupModelId = null;
            this.$popupPerDiem.parent().fadeOut(200);
        },
        'click #popup-per-diem .payed-all': function(){
            console.log('payed-all press');
            this.$popupPerDiem.find('input').val(app.models.options.get('perDayLimit'));
            this.setDaily();
        },
        'keypress #popup-per-diem input': function(e){
            var str = String.fromCharCode(e.keyCode);
            if (!str.match(/^[-()+\d]+$/)){
                e.preventDefault();
            }
        }
    },
    initialize: function () {
		this.template = renderView('components/per_diem/per_diem.html');
		this.$el.html(this.template);
        this.define();

        //на кнопке дневной лимит
        this.$popupPerDiem.find('.payed-all').html(app.models.options.get('perDayLimit'));

        var overLimit = storage.getItem('overlimit_'+app.currentDate);
        if (overLimit){
            this.overLimit = overLimit;
        }

        this.listenFactory();

        setTimeout(_.bind(function(){
            this.render('all');
        }, this), 100)


    },
    listenFactory: function(){
        this.listenTo(app.collections.perDiem, 'add', function(model){
            this.addView(model);
        });

        this.listenTo(app.collections.perDiem, 'change:payed_all change:payed', function(){
            this.render('wasted');
            this.render('left');
        });

        this.listenTo(app.models.options, 'change:perDayLimit', function(){
            this.render('totalLeft');
            this.render('wasted');
            this.render('left');
        });

        this.listenTo(this, 'long_touch_calendar', function(modelId){
            console.log('long_touch_calendar');
            var model = app.collections.perDiem.get(modelId);
            this.$popupPerDiem.find('.date').html(moment(model.get('date')).format('DD.MM.YY'));
            if (model.get('payed_all')){
                this.$popupPerDiem.find('input').val(app.models.options.get('perDayLimit'));
            } else if (model.get('payed')) {
                this.$popupPerDiem.find('input').val(model.get('payed'));
            } else {
                this.$popupPerDiem.find('input').val('');
            }
            this.$popupPerDiem.parent().fadeIn(200);
            this.$popupPerDiem.find('input').focus();
            this.popupModelId = model.id;

        });
    },
    setDaily: function(){
        var inputVal = parseInt(this.$popupPerDiem.find('input').val());
        if (inputVal <= app.models.options.get('perDayLimit')){
            var popupModel = app.collections.perDiem.get(this.popupModelId);
            if (popupModel){
                if (popupModel.get('payed') == inputVal || inputVal == ''){
                    //do nothing
                } else if(inputVal == app.models.options.get('perDayLimit')) {
                    popupModel.set({
                        payed_all: true,
                        payed: 0
                    })
                } else {
                    popupModel.set({
                        payed_all: false,
                        payed: inputVal
                    })
                }
            } else {
                console.log('no date in collection');
            }
        } else {
            var daysCountPayedAll = parseInt(inputVal / app.models.options.get('perDayLimit'));
            //var differenceWaste = inputVal - (daysCountPayedAll * app.perDayLimit);
            var model = app.collections.perDiem.get(this.popupModelId);
            var firstModeldayNo = null;

            if (model){
                firstModeldayNo = model.get('day_number');
                delete model;
            } else {
                console.log('Per Diem: Error bad first model multi payed_all');
                return;
            }

            for (var i = 0; i < daysCountPayedAll; i++){
                var dayNo = firstModeldayNo + i;
                if (dayNo > app.monthEndDay){
                    break;
                }
                var date = moment(app.monthNumber+'.' + dayNo + '.'+app.year).format('MM.DD.YY');
                var model = app.collections.perDiem.get(date);
                if (model){
                    model.set({
                        payed_all: true,
                        payed: 0
                    });
                } else {
                    console.log('Per Diem: Error can not found model with '+ date);
                }
                inputVal -= app.models.options.get('perDayLimit');
            }



            var dayNo = firstModeldayNo+daysCountPayedAll;
            if (dayNo <= app.monthEndDay){
                var date = moment(app.monthNumber+'.' + dayNo + '.'+app.year).format('MM.DD.YY');
                var model = app.collections.perDiem.get(date);
                if (model){
                    model.set({
                        payed_all: false,
                        payed: inputVal
                    });
                } else {
                    console.log('Per Diem: Error can not found model with '+ date);
                }
            } else {
                this.overLimit = inputVal;
                storage.setItem('overlimit_'+app.currentDate, inputVal);
                this.render('overlimit');
            }

        }
        storage.setItem(app.currentDate, app.collections.perDiem.toJSON());
        this.render('wasted');
        this.render('overlimit');
        this.$popupPerDiem.parent().fadeOut(200);
        this.popupModelId = null;
    },
    render: function(arg){
        switch (arg){
            case 'totalLeft':
                this.perDayTotal = app.monthEndDay * app.models.options.get('perDayLimit');
                break;
            case 'calendar':
                this.$currentMonth.html(moment().format("MMMM"));
                var dayIncrement = 0;
                //first week
                var i = null;
                var date = null;
                for (i = 1; i<=7; i++){
                    if (app.startDayOfWeek <= i){
                        dayIncrement++;
                        date = moment(app.monthNumber+'.'+dayIncrement+'.'+app.year).format('MM.DD.YY');
                        date = date+'';
                        this.$daysInputsTable.find('.row_1').append(this.views[date].$el);
                    } else {
                        this.$daysInputsTable.find('.row_1').append('<td class="padding"></td>');
                    }
                }
                //----------------------
                for (i = 2; i<=5; i++){
                    for(var j=1; j<=7; j++){
                        dayIncrement++;
                        if (dayIncrement <= app.monthEndDay){
                            date = moment(app.monthNumber+'.'+dayIncrement+'.'+app.year).format('MM.DD.YY');
                            this.$daysInputsTable.find('.row_'+i).append(this.views[date].$el);
                        } else {
                            this.$daysInputsTable.find('.row_'+i).append('<td class="padding"></td>');
                        }
                    }
                }
                break;
            case 'wasted':
                var currentMonthDays = app.collections.perDiem.where({
                    month_number: app.monthNumber
                });

                var arrLength = currentMonthDays.length;
                var days_payed_all = 0;
                var payed_total = 0;
                for(var i = 0; i < arrLength; i++){
                    if (currentMonthDays[i].get('payed_all')){
                        days_payed_all++;
                    } else if (currentMonthDays[i].get('payed')){
                        console.log(currentMonthDays[i].get('payed'));
                        payed_total += currentMonthDays[i].get('payed');
                    }
                }
                this.wastedTotal = days_payed_all * app.models.options.get('perDayLimit');
                this.wastedTotal += payed_total;

                console.log('wastedTotal = '+this.wastedTotal);

                this.$moneyWasted.find('.total').html(this.wastedTotal + this.overLimit);
                break;
            case 'left':
                setTimeout(_.bind(function(){
                    var left = this.perDayTotal - this.wastedTotal - this.overLimit;
                    if (left < 0){
                        this.$moneyLeft.find('.total').html('0');
                    } else {
                        this.$moneyLeft.find('.total').html(left);
                    }
                },this),50);
                break;
            case 'overlimit':
                if (this.overLimit){
                    this.$overLimit.removeClass('not-all-wasted');
                    var overLimit = this.wastedTotal + this.overLimit - this.perDayTotal;
                    if (overLimit < 0){
                        this.$overLimit.addClass('not-all-wasted');
                        this.$overLimit.find('.total').html(this.overLimit);
                        this.$overLimit.show();
                        return;
                    }
                    this.$overLimit.find('.total').html(overLimit);
                    this.$overLimit.show();
                } else {
                    this.$overLimit.hide();
                }
                break;
            case 'all':
                this.render('totalLeft');
                this.render('calendar');
                this.render('wasted');
                this.render('overlimit');
                this.render('left');
                break;
            default:
                console.log('per_diem view: bad arg render');
        }
    },

    addView: function(model){
        this.views[model.id]= new perDiemDayView({
            model: model
        });
    }
});
