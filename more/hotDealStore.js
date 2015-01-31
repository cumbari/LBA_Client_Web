Ext.regModel('hotDeals', {
    fields: [
    
    {
        name: 'offerTitle',
        type: 'string'
    },
    {
        name: 'productInfoLink',
        type: 'string'
    },
    {
        name: 'groupId',
        type: 'string'
    },
    {
        name: 'couponDeliveryType',
        type: 'string'
    },
    {
        name: 'limitPeriodList',
        type: 'string'
    },

    {
        name: 'smallImage',
        type: 'string'
    },

    {
        name: 'largeImage',
        type: 'string'
    },

    {
        name: 'distanceToStore',
        type: 'integer'
    },

    {
        name: 'offerType',
        type: 'string'
    },

    {
        name: 'isSponsored',
        type: 'string'
    },
    {
        name: 'validFrom',
        type: 'string'
    },
    {
        name: 'brandIcon',
        type: 'string'
    },
    {
        name: 'brandName',
        type: 'string'
    },
    {
        name: 'offerSlogan',
        type: 'string'
    },
    {
        name: 'storeId',
        type: 'string'
    }
    ,
    {
        name: 'couponId',
        type: 'string'
    },
    {
        name: 'endOfPublishing',
        type: 'string'
    }
    ],
    hasMany: {
        model: 'limitPeriod',
        name: 'limitPeriodList'
    }
    
});
Ext.regModel("limitPeriod", {
    fields: [
    {
        name: 'endTime',
        type: 'string'
    },
    {
        name: 'startTime',
        type: 'string'
    },
    {
        name: 'validDay',
        type: 'string'
    }
    ],

   
    belongsTo: 'hotDeals'
});





