var perDiemModel = Backbone.Model.extend({
    idAttribute: 'date',
    defaults: {
        day_number: null,
        month_number: null,
        date: null,
        payed: 0,
        payed_all: false,
        //isDayToday: false
    }
});
