function couponList(jsonCampaignStore,couponListTpl,detailViewPanel,infoPanel,couponListForMiles,storesMap,db){
    var counter = 2;
    var d          = new Date();
    var curr_date  = d.getDate();
    var curr_month = d.getMonth();
    var curr_year  = d.getFullYear();
    var hours      = d.getHours();
    var minutes    = d.getMinutes();

    var formattedDate = curr_year+"-"+curr_month+'-'+curr_date+' '+hours+':'+minutes;
    var couponList = new Ext.Panel({
        flex: 1,
        frame:true,
        autoHeight: true,
        collapsible: true,
        width: '100%',
        layout: 'fit',
        id:'newCampain',
        dockedItems:[
        new Ext.Toolbar({
            dock : 'top',
            title: '',
            id:'campainTitle',
            cls:'catLable',
            ui:'charcoal',
            items: [
            {
                text: 'Back',
                ui:'back',
                id:'campainBack',
                handler: function() {
                    Ext.getCmp('Viewport').setActiveItem('tabpanel', {
                        type:'flip',
                        duration:500,
                        direction:'right'
                    });
                }
            },{
                xtype:'spacer'
            },{
                text:'Map',
                ui:'forward',
                id:'campainMap',
                handler:function(){
                    var firstTab=jsonCampaignStore.data;
                    var i=0
                    for(i=0;i<firstTab.length;i++)
                    {
                        var markerLatitude=firstTab.items[i].data.latitude;
                        var markerLongitude=firstTab.items[i].data.longitude;
                        var markerStoreName=firstTab.items[i].data.storeName;
                        var markers= [markerStoreName,markerLatitude,markerLongitude];
                                                
                        var getMark= Ext.getCmp('storesMap');
                        getMark.update({
                            latitude : markerLatitude,
                            longitude : markerLongitude
                        });
                        marker = new google.maps.Marker({
                            id:'upCenter',
                            position:new google.maps.LatLng(markerLatitude,markerLongitude),
                            map: storesMap.map,
                                                    
                            icon:'https://s3-eu-west-1.amazonaws.com/webclient/Pin.png'
                        });
                        hotInfoWindow(marker, markerStoreName);
                    }
                    var infowindow = new google.maps.InfoWindow();
                    function hotInfoWindow(marker, markerStoreName) {
                        google.maps.event.addListener(marker, 'mousedown', (function(marker, i) {
                            return function() {
                                infowindow.setContent(markerStoreName);
                                infowindow.open(storesMap.map, marker);
                            }
                        })(marker));
                    }
                    Ext.getCmp('Viewport').setActiveItem('mapPanel', {
                        type:'slide',
                        direction:'left',
                        duration:500
                    });              
                }
            }
            ]
        }),
        ],
        items:[new Ext.List({
            fullscreen: true,
            id:'campainStore',
            cls:'myList',
            itemTpl :couponListTpl,
            plugins:[
            {
                ptype: 'listpaging',
                autoPaging: false,
                id:'pluginId',
                onPagingTap :function(){
                    db.transaction(function (tx) {
                        tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                            var storeLanguage =  results.rows.item(0).languageValue;
                            var storeUnit    =  results.rows.item(0).unitValue;
                            var offerValue =  results.rows.item(0).offersValue;
                            var rangeValue    =  results.rows.item(0).rangeValue;
                            var storeLatitude    =  results.rows.item(0).latitude;
                            var storeLongitude    =  results.rows.item(0).longitude;
                            var getCoupon =Ext.getCmp('hotDeals').getStore();
                            getCoupon.proxy.url= baseURL+'getCoupons?apiVersion=2&token=cumba4now&longitude='+storeLongitude+'&latitude='+storeLatitude+'&clientId='+userClientId+'&lang='+storeLanguage+'&batchNo='+counter+'&maxNo=200&radiousInMeter='+rangeValue;
                                          
                            counter++;
                            var maxNumbebr =getCoupon.proxy.reader.rawData.MaxNumberReached;

                            if(maxNumbebr==false)
                            {
                                getCoupon.loadPage();
                            }
                            else
                            {
                                db.transaction(function (tx) {
                                    tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                        var selectedLanguage =  results.rows.item(0).languageValue;
                                        if(selectedLanguage=="ENG"){
                                            Ext.Msg.alert('', 'No More Coupons.', Ext.emptyFn);

                                        }
                                        else if(selectedLanguage=="SWE"){
                                            Ext.Msg.alert('', 'Inga fler kuponger.', Ext.emptyFn);

                                        }

                                    })
                                });
                            }
                        })
                    })
                }

            }],
            store:  new Ext.data.Store({
                model: "hotDeals",
                clearOnPageLoad: false,
                proxy: {
                    type: 'memory',
                    reader: new Ext.data.JsonReader({
                        type: 'json',
                        root: 'ListOfCoupons'
                    })
                }
            }),
            listeners: {
                itemTap:function(view, index, item, e){
                    setTimeout(function(){
                        view.deselect(index);
                    },500);
                    db.transaction(function (tx) {
                        tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                            var selectedLanguage =  results.rows.item(0).languageValue;
                            var rec = view.getStore().getAt(index);
                            getStoreId=rec.data.storeId;
                            getCouponsId=rec.data.couponId;
                            getDistanceToStore=rec.data.distanceToStore;
                            hotDealStoreViewStatisticsURL=baseURL+"storeViewStatistic?apiVersion=1&clientId="+userClientId+"&couponViewStatisticList=[{eventTime:"+"\'"+encodeURI(formattedDate)+"\'"+",couponId:"+"\'"+getCouponsId+"\'"+",storeId:"+"\'"+getStoreId+"\'"+",distanceToStore:"+getDistanceToStore+"}]&token=cumba4now";

                            Ext.Ajax.request({
                                url:hotDealStoreViewStatisticsURL,
                                method: "GET"
                            });

                            var getCoupon=baseURL+'getCoupon?apiVersion=2&couponId='+getCouponsId+'&lang='+userLanguage+'&token=cumba4now'
                                   
                            var found = jsonCampaignStore.findRecord("storeId", rec.data.storeId);
                            var valid=rec.limitPeriodListStore.data.items[0];
                            if(rec.data.endOfPublishing==""){
                                text ="";
                                publishingEnd = "";
                            }else{
                                var dateNew =rec.data.endOfPublishing;
                                publishingDateEnd = dateNew.split(" ");
                                publishingEnd = publishingDateEnd[0];
                                if(selectedLanguage=="ENG"){
                                    text = "valid until";
                                }else if(selectedLanguage=="SWE"){
                                    text = "Giltig till";
                                }

                            }
                            if(valid==undefined){
                                var customRecord = Ext.ModelMgr.create({
                                    id: 1,
                                    storeId: rec.data.storeId,
                                    smallImage: rec.data.smallImage,
                                    largeImage: rec.data.largeImage,
                                    productInfoLink: rec.data.productInfoLink,
                                    couponDeliveryType: rec.data.couponDeliveryType,
                                    couponId: rec.data.couponId,
                                    distanceToStore:rec.data.distanceToStore,
                                    endOfPublishing:text+" "+publishingEnd,
                                    offerTitle:rec.data.offerTitle,
                                    offerType:rec.data.offerType,
                                    offerSlogan:rec.data.offerSlogan,
                                    validFrom:rec.data.validFrom,
                                    latitude : found.data.latitude,
                                    longitude : found.data.longitude,
                                    homePage:found.data.homePage,
                                    phone:found.data.phone,
                                    storeName:found.data.storeName,
                                    street:found.data.street,
                                    email:found.data.email,
                                    country:found.data.country,
                                    city:found.data.city
                                }, 'CustomCumbari');
                                detailViewPanel.update(customRecord.data);
                                infoPanel.update(rec.data);
                            }
                            else{
                                var custom = Ext.ModelMgr.create({
                                    id: 1,
                                    validDay:"Valid:"+" "+rec.limitPeriodListStore.data.items[0].data.validDay,
                                    startTime:rec.limitPeriodListStore.data.items[0].data.startTime+' '+'-',
                                    endTime:rec.limitPeriodListStore.data.items[0].data.endTime,
                                    storeId: rec.data.storeId,
                                    productInfoLink: rec.data.productInfoLink,
                                    smallImage: rec.data.smallImage,
                                    largeImage: rec.data.largeImage,
                                    couponDeliveryType: rec.data.couponDeliveryType,
                                    couponId: rec.data.couponId,
                                    distanceToStore:rec.data.distanceToStore,
                                    endOfPublishing:text+" "+publishingEnd,
                                    offerTitle:rec.data.offerTitle,
                                    offerType:rec.data.offerType,
                                    offerSlogan:rec.data.offerSlogan,
                                    validFrom:rec.data.validFrom,
                                    latitude : found.data.latitude,
                                    longitude : found.data.longitude,
                                    homePage:found.data.homePage,
                                    phone:found.data.phone,
                                    storeName:found.data.storeName,
                                    street:found.data.street,
                                    email:found.data.email,
                                    country:found.data.country,
                                    city:found.data.city
                                }, 'CustomCumbari');
                                detailViewPanel.update(custom.data);
                                infoPanel.update(rec.data);
                            }
                            Ext.getCmp('Viewport').setActiveItem('detailViewPanel', {
                                type:'slide',
                                direction:'left',
                                duration:500
                            });
                        });
                    });
                }
            }
        })],
        listeners:{
            activate:{
                fn: function(){
                    db.transaction(function (tx) {
                        tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                            var selectedUnit =  results.rows.item(0).unitValue;
                            if(selectedUnit=="meter"){
                                Ext.getCmp('campainStore').itemTpl=couponListTpl;
                                Ext.getCmp('campainStore').initComponent();
                                Ext.getCmp('campainStore').refresh();
                            }
                            else if(selectedUnit=="miles"){
                                Ext.getCmp('campainStore').itemTpl=couponListForMiles;
                                Ext.getCmp('campainStore').initComponent();
                                Ext.getCmp('campainStore').refresh();
                                                   
                            }
                        })
                    });
                }
            }
        }

    });
    return couponList;
}