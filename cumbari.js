var loadS = "true";
var exception = "false";
var find_couponLat;
var find_couponLong;
var locationLoad;
var baseURL = "https://market.cumbari.com/CouponServer/clientapi/";
Ext.setup({
    icon: 'icon.png',
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'phone_startup.png',
    glossOnIcon: false,
   
    onReady: function() {
        
        // date and time for URL
        var d          = new Date();
        var curr_date  = d.getDate();
        var curr_month = d.getMonth();
        var curr_year  = d.getFullYear();
        var hours      = d.getHours();
        var minutes    = d.getMinutes();

        var formattedDate = curr_year+"-"+curr_month+'-'+curr_date+' '+hours+':'+minutes;

        if(connection=="offline"){
            Ext.Msg.alert('', 'Please connect your device to network', Ext.emptyFn);

        }
        else if(connection=="online"){
            //////// Geo location on Map///////////////

       
            var geo = new Ext.util.GeoLocation({
                id:'geo',
                autoUpdate: true,
                listeners: {
                    locationupdate: function (geo) {
                        getCurrentLatitude  =  geo.latitude;
                        getCurrentLongitude =  geo.longitude;
                        document.getElementById('hidCurrentLatitude').value=getCurrentLatitude;
                        document.getElementById('hidCurrentLongitude').value=getCurrentLongitude;
                  
                        ////////////Geo location end////////////////////

                        db.transaction(function (tx) {
                            var positionUpdateQuery = "UPDATE TEMP_SETTING SET latitude= "+"'"+getCurrentLatitude+"'"+" ,longitude = "+"'"+getCurrentLongitude+"'";
                            tx.executeSql(positionUpdateQuery);
                            var id		 =  guidGenerator();
                            tx.executeSql('SELECT * FROM NEW_POSITION', [], function (tx, results) {
                                var len = results.rows.length;
                                if(len==0)
                                {
                                    var insertQuery = "INSERT INTO NEW_POSITION (id, latitude,longitude) VALUES ("+"'"+id+"'"+","+"'"+getCurrentLatitude+"'"+","+"'"+getCurrentLongitude+"'"+")";
                                    tx.executeSql(insertQuery);
                                }
                            })
                        })
                        /***************  get Coupons Url      *************/
                        
                    
                        var getCouponsURL= baseURL+'getCoupons?apiVersion=2&token=cumba4now&longitude='+getCurrentLongitude+'&latitude='+getCurrentLatitude+'&clientId='+userClientId+'&lang='+userLanguage+'&batchNo=1&maxNo=200&radiousInMeter='+userRange;
                   
                        var getCategoriesURL =baseURL+'getCategories?apiVersion=2&token=cumba4now&categoriesVersion=1&lang='+userLanguage;
 
                        var getBandsURL=baseURL+'getBrandedCoupons?apiVersion=2&token=cumba4now&longitude='+getCurrentLongitude+'&latitude='+getCurrentLatitude+'&clientId='+userClientId+'&lang='+userLanguage+'&maxNo=200&radiousInMeter='+userRange;


                   
                   
                        /*************** use Coupon   *************/
                    
                    

                        //////////////////// Detail view Items  ///////////////
                        //                    var button1 = {
                        //                        xtype: 'textfield',
                        //                        name : 'theTime',
                        //                        id:'theTime',
                        //                        cls:'myButton-loding',
                        //                        dock:'bottom'
                        //                    };
                        if(locationLoad==null){

                            var distanceButton = {
                                xtype:'button',
                                text:'',
                                id:'distanceButton',
                                ui:'myButton',
                                dock:'bottom',
                                cls:'myButton-loding',
                                handler:function(){
                                    db.transaction(function (tx) {
                                        tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                            var selectedLanguage =  results.rows.item(0).languageValue;
                                            if(selectedLanguage=="ENG"){
                                                Ext.Msg.alert('', 'Sorry! You must be closer to the Point of Sale to be able to activate the deal', Ext.emptyFn);

                                            }
                                            else if(selectedLanguage=="SWE"){
                                                Ext.Msg.alert('', 'Tyv\u00E4rr! Du m\u00E5ste vara n\u00E4rmare Point of Sale f\u00F6r att kunna aktivera aff\u00E4ren', Ext.emptyFn);

                                            }

                                        })
                                    });
                                }
                            };
                            var sheet = new Ext.Sheet({
                                height  : 300,
                                stretchX: true,
                                id:'sheet',
                                stretchY: true,
                                html:"<div style='color:white' align='center'>You have maximum 10 minutes to use this deal after activation recommend you to only activate the deal when you are about to pay</div>",
                                layout: {
                                    type: 'hbox',
                                    align: 'stretch'
                                },
                                dockedItems: [
                                {
                                    dock : 'bottom',
                                    xtype: 'button',
                                    text : 'Cancel',
                                    id:'cancleSheet',
                                    ui:'myCancel',
                                    cls:'myButton-loding',
                                    handler:function(){
                                        sheet.hide({
                                            type:'slide',
                                            duration:500,
                                            direction:'up'
                                        });
                                    }

                                },{
                                    dock : 'bottom',
                                    xtype: 'button',
                                    text : 'Activate Deal',
                                    id:'activeDeal',
                                    ui:'myUseButton',
                                    cls:'myButton-loding',
                                    handler:function(){
                                        useCouponStoreId   =  document.getElementById('hidstoreId').value;
                                        CouponDeliveryType   =  document.getElementById('hidCouponDeliveryType').value;
                                        useCouponId  =  document.getElementById('hidCouponId').value;
                                        useCouponDistanceToStore =  document.getElementById('hidDistanceToStore').value;
                                        var useCouponURL= baseURL+'useCoupon?apiVersion=2&token=cumba4now&couponId='+useCouponId+'&storeId='+useCouponStoreId+'&clientId='+userClientId+'&distanceToStore='+useCouponDistanceToStore;
                                

                                        var dockedItemUseDealButton = detailViewPanel.getComponent('useDealButton');
                                        useDealButtonPress = "true"
                                        if (dockedItemUseDealButton) {
                                            detailViewPanel.remove(dockedItemUseDealButton,true);
                                        }
                                        document.getElementById('theTime').style.display='inline';
                                        //detailViewPanel.add(button1);
                                        detailViewPanel.doLayout(false)
                                        sheet.hide({
                                            type:'slide',
                                            duration:500,
                                            direction:'up'
                                        });
                                        Ext.Ajax.request({
                                            url:useCouponURL,
                                            method: "GET",
                                            success: function(response, opts) {
                                                db.transaction(function (tx) {
                                                    tx.executeSql("SELECT * FROM FAVORITES WHERE couponId = "+"'"+useCouponId+"'"+";", [],function(transaction, results){
                                                        var   numberOfRecord = results.rows.length;
                                   
                                                        if(numberOfRecord==1){
                                                            var query = "DELETE FROM  FAVORITES WHERE couponId = "+"'"+useCouponId+"'"+";";
                                                            tx.executeSql(query);
                                       
                                                        }
                                                    })
                                                });

                                                startTimer();
                                            }
                                        });
                                
                                    }
                                }
                                ]
                            });

                    

                            var useDealButton=  {
                                xtype:'button',
                                text:'Use Deal',
                                id:'useDealButton',
                                ui:'myUseButton',
                                cls:'myButton-loding',
                                dock:'bottom',
                                handler:function(){
                                    useCouponStoreId   =  document.getElementById('hidstoreId').value;
                                    CouponDeliveryType   =  document.getElementById('hidCouponDeliveryType').value;
                                    useCouponId  =  document.getElementById('hidCouponId').value;
                                    useCouponDistanceToStore =  document.getElementById('hidDistanceToStore').value;
                                    var useCouponURL= baseURL+'useCoupon?apiVersion=2&token=cumba4now&couponId='+useCouponId+'&storeId='+useCouponStoreId+'&clientId='+userClientId+'&distanceToStore='+useCouponDistanceToStore;



                                    if(CouponDeliveryType=="PINCODE")
                                    {
                                        var sheet_pinCode = new Ext.Sheet({
                                            height  : 300,
                                            stretchX: true,
                                            id:'sheet_pinCode',
                                            stretchY: true,
                                            html:"<div style='color:white' align='center'>Activate deal</div>",
                                            layout: {
                                                type: 'hbox',
                                                align: 'stretch'
                                            },
                                            dockedItems: [
                                            {
                                                dock : 'bottom',
                                                xtype: 'button',
                                                text : 'Cancel',
                                                id:'cancleSheet',
                                                ui:'myCancel',
                                                cls:'myButton-loding',
                                                handler:function(){
                                                    sheet_pinCode.hide({
                                                        type:'slide',
                                                        duration:500,
                                                        direction:'up'
                                                    });
                                                }

                                            },{
                                                dock : 'bottom',
                                                xtype: 'button',
                                                text : 'Activate Deal',
                                                id:'activeDeal',
                                                ui:'myUseButton',
                                                cls:'myButton-loding',
                                                handler:function(){
                                                    sheet_pinCode.hide({
                                                        type:'slide',
                                                        duration:500,
                                                        direction:'up'
                                                    });

                                                    Ext.Ajax.request({
                                                        url:useCouponURL,
                                                        method: "GET",
                                                        success: function(response, opts) {
                                                            var url_response = Ext.decode(response.responseText);
                                                            var codeType = url_response.codeType;
                                                            code=url_response.code;
                                                            var offerSlogan = document.getElementById('offerSlogan').innerHTML;
                                                            var validFrom = document.getElementById('validFrom').innerHTML;
                                                            var validTo = document.getElementById('hidEndOfPublishing').value;
                                                            db.transaction(function (tx) {
                                                                tx.executeSql("SELECT * FROM FAVORITES WHERE couponId = "+"'"+useCouponId+"'"+";", [],function(transaction, results){
                                                                    var   numberOfRecord = results.rows.length;

                                                                    if(numberOfRecord==1){
                                                                        var query = "DELETE FROM  FAVORITES WHERE couponId = "+"'"+useCouponId+"'"+";";
                                                                        tx.executeSql(query);

                                                                    }
                                                                })
                                                            });
                                                            Ext.getCmp('Viewport').setActiveItem(Ext.getCmp('pinCodePanel'))
                                                            displayMobiCode(code,offerSlogan,validFrom,validTo);

                                                        }
                                                    })

                                                }
                                            }
                                            ]
                                        });
                                            
                                        sheet_pinCode.show();


                                        db.transaction(function (tx) {
                                            tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                var selectedLanguage =  results.rows.item(0).languageValue;
                                                if(selectedLanguage=="ENG"){
                                                    Ext.getCmp('sheet_pinCode').el.dom.children(2).children(0).innerHTML='Activate deal';
                                                }
                                                else if(selectedLanguage=="SWE"){
                                                    Ext.getCmp('sheet_pinCode').el.dom.children(2).children(0).innerHTML='Aktivera Deal';
                                                }

                                            })
                                        });

                                        


                                    }
                                    else if(CouponDeliveryType=="BARCODE")
                                    {
                                        var sheet_barcode = new Ext.Sheet({
                                            height  : 300,
                                            stretchX: true,
                                            id:'sheet_barcode',
                                            stretchY: true,
                                            html:"<div style='color:white' align='center'>Activate deal</div>",
                                            layout: {
                                                type: 'hbox',
                                                align: 'stretch'
                                            },
                                            dockedItems: [
                                            {
                                                dock : 'bottom',
                                                xtype: 'button',
                                                text : 'Cancel',
                                                id:'cancleSheet',
                                                ui:'myCancel',
                                                cls:'myButton-loding',
                                                handler:function(){
                                                    sheet_barcode.hide({
                                                        type:'slide',
                                                        duration:500,
                                                        direction:'up'
                                                    });
                                                }

                                            },{
                                                dock : 'bottom',
                                                xtype: 'button',
                                                text : 'Activate Deal',
                                                id:'activeDeal',
                                                ui:'myUseButton',
                                                cls:'myButton-loding',
                                                handler:function(){
                                                    sheet_barcode.hide({
                                                        type:'slide',
                                                        duration:500,
                                                        direction:'up'
                                                    });
                                                    Ext.Ajax.request({
                                                        url:useCouponURL,
                                                        method: "GET",
                                                        success: function(response, opts) {
                                                            var url_response = Ext.decode(response.responseText);
                                                            var codeType = url_response.codeType;
                                                            code=url_response.code;
                                                            db.transaction(function (tx) {
                                                                tx.executeSql("SELECT * FROM FAVORITES WHERE couponId = "+"'"+useCouponId+"'"+";", [],function(transaction, results){
                                                                    var   numberOfRecord = results.rows.length;

                                                                    if(numberOfRecord==1){
                                                                        var query = "DELETE FROM  FAVORITES WHERE couponId = "+"'"+useCouponId+"'"+";";
                                                                        tx.executeSql(query);

                                                                    }
                                                                })
                                                            });
                                                            Ext.getCmp('Viewport').setActiveItem(Ext.getCmp('barCodePanel'))
                                                            generateBarcode(code);
                                                        }
                                                    })

                                                }
                                            }
                                            ]
                                        });
                                        sheet_barcode.show();
                                            
                                        db.transaction(function (tx) {
                                            tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                var selectedLanguage =  results.rows.item(0).languageValue;
                                                if(selectedLanguage=="ENG"){
                                                    Ext.getCmp('sheet_barcode').el.dom.children(2).children(0).innerHTML='Activate deal';
                                                }
                                                else if(selectedLanguage=="SWE"){
                                                    Ext.getCmp('sheet_barcode').el.dom.children(2).children(0).innerHTML='Aktivera Deal';
                                                }

                                            })
                                        });
                                        

                                    }
                                    else{
                                        sheet.show();
                                        db.transaction(function (tx) {
                                            tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                var selectedLanguage =  results.rows.item(0).languageValue;
                                                if(selectedLanguage=="ENG"){
                                                    Ext.getCmp('sheet').el.dom.children(2).children(0).innerHTML='You have maximum 10 minutes to use this deal after activation recommend you to only activate the deal when you are about to pay.';
                                                }
                                                else if(selectedLanguage=="SWE"){
                                                    Ext.getCmp('sheet').el.dom.children(2).children(0).innerHTML='Du har max 10 minuter f\u00F6r att anv\u00E4nda den h\u00E4r aff\u00E4ren efter aktivering rekommenderar att du bara aktivera aff\u00E4r n\u00E4r du \u00E4r p\u00E5 v\u00E4g att betala.';
                                                }

                                            })
                                        });
                                    }

                                }
                            }
                

                            ////////////////// Detail view items end ////////////////////////



                            ///////////////////  MAP //////////////////////////////////////////
                            function mapRender(){
                                var distance_map = Ext.getCmp('storesMap');
                                distance_map.rendered = false;
                                distance_map.render();
                            }


                            //                    image = new google.maps.MarkerImage(
                            //                        'Pin.png',
                            //                        new google.maps.Size(32, 31),
                            //                        new google.maps.Point(0,0),
                            //                        new google.maps.Point(16, 31)
                            //                        );
                            //
                            //                    var center;
                            //                    var map =  new Ext.Map ({
                            //                        id:'storesMap',
                            //                        useCurrentLocation: true,
                            //                        mapOptions: {
                            //                            zoom: 11,
                            //                            navigationControlOptions: {
                            //                                style: google.maps.NavigationControlStyle.DEFAULT
                            //                            }
                            //                        },
                            //                        listeners: {
                            //                            afterrender: function(map){
                            //                                var currentLatitude = document.getElementById('hidCurrentLatitude').value;
                            //                                var currentLongitude = document.getElementById('hidCurrentLongitude').value;
                            //                                this.update({
                            //                                    latitude:currentLatitude,
                            //                                    longitude:currentLongitude
                            //                                })
                            //                                marker = new google.maps.Marker({
                            //                                    position: new google.maps.LatLng(currentLatitude,currentLongitude),
                            //                                    map: map.map,
                            //                                    icon:image
                            //                                });
                            //
                            //
                            //                            }
                            //                        }
                            //                    });
                            ////////////////////////////  MAP end  ////////////////////////////////////


                            //////////////////// Loading Mask ////////////////////////////

                            if (Ext.get('loading-mask')) {
                                var loadmask = Ext.get('loading-mask');
                                Ext.Anim.run(loadmask, 'fade', {
                                    easing: 'ease',
                                    duration: 2500,
                                    after: function() {
                                        Ext.get('loading-mask').remove();
                                    }
                                });
                            }
                            /////////////////// Loading Mask end//////////////////////////////
                            var favListTpl = new Ext.XTemplate(
                                '<tpl for=".">',
                                '<div class="brands-row">',
                                '<table width="100% "border="0"cellpadding="0" cellspacing="0">',
                                '<tr>',
                                '<td class="but"align:left style="margin-right:10px;"><img src="{smallImage}"/>',
                                '</td>',
                                '<td width="100% "align="left "><table><tr><td class="hot-deals-h">{offerTitle}</td></tr><tr><td class="hot-deals-sub-h">{offerSlogan}</td></tr></table></td>',
                                '<tpl if="distanceToStore&gt;=1000">'+
                                '<td nowrap="nowrap "class="val"><button id="removeItems" name="removeItems" class="deleteButton" style="display:none">Delete</button>{[Math.round(values.distanceToStore/1000)]} km</td>'+   //do formatting here
                                '</tpl>'+
                                '<tpl if="distanceToStore<=999">'+
                                '<td nowrap="nowrap "class="val"><button id="removeItems" name="removeItems" class="deleteButton" style="display:none">Delete</button>{distanceToStore} m</td>'+   //do formatting here
                                '</tpl>',
                                '</tr>',
                                '</table>',
                                '</div>',
                                '</tpl>'
                                );
                            var favListTplMiles = new Ext.XTemplate(
                                '<tpl for=".">',
                                '<div class="brands-row">',
                                '<table width="100% "border="0"cellpadding="0" cellspacing="0">',
                                '<tr>',
                                '<td class="but"align:left style="margin-right:10px;"><img src="{smallImage}"/>',
                                '</td>',
                                '<td width="100% "align="left "><table><tr><td class="hot-deals-h">{offerTitle}</td></tr><tr><td class="hot-deals-sub-h">{offerSlogan}</td></tr></table></td>',
                                '<tpl if="distanceToStore/1000*0.62&gt;=0.1">'+
                                '<td nowrap="nowrap "class="val"><button id="removeItems" name="removeItems" class="deleteButton" style="display:none">Delete</button>{[(values.distanceToStore/1000*.62).toFixed(1)]} mi</td>'+   //do formatting here
                                '</tpl>'+
                                '<tpl if="distanceToStore/1000*0.62 < 0.1">'+
                                '<td nowrap="nowrap "class="val"><button id="removeItems" name="removeItems" class="deleteButton" style="display:none">Delete</button>{[Math.round(values.distanceToStore*5280/1000*0.62)]} ft</td>'+   //do formatting here
                                '</tpl>',
                                '</tr>',
                                '</table>',
                                '</div>',
                                '</tpl>'
                                );

                            var campaignListTpl = new Ext.XTemplate(
                                '<tpl for=".">',
                                '<tpl if="isSponsored ==&quot;true&quot;"">',
                                '<div class="brands-row-spon">',
                                '</tpl>',
                                '<tpl if="isSponsored !=&quot;true&quot;"">',
                                '<div  class="brands-row">',
                                '</tpl>',
                                '<table width="100% "border="0"cellpadding="0" cellspacing="0">',
                                '<tr>',
                                '<td class="but"align:left style="margin-right:10px;"><img src="{smallImage}"/>',
                                '</td>',
                                '<td width="100% "align="left "><table><tr><td class="hot-deals-h">{offerTitle}</td></tr><tr><td class="hot-deals-sub-h">{offerSlogan}</td></tr></table></td>',
                                '</tr>',
                                '</table>',
                                '</div>',
                                '</tpl>'
                                );
                                    
                            var couponListTpl = new Ext.XTemplate(
                                '<tpl for=".">',
                                '<tpl if="isSponsored ==&quot;true&quot;"">',
                                '<div class="brands-row-spon">',
                                '</tpl>',
                                '<tpl if="isSponsored !=&quot;true&quot;"">',
                                '<div  class="brands-row">',
                                '</tpl>',
                                '<table width="100% "border="0"cellpadding="0" cellspacing="0">',
                                '<tr>',
                                '<td class="but"align:left style="margin-right:10px;"><img src="{smallImage}"/>',
                                '</td>',
                                '<td width="100% "align="left "><table><tr><td class="hot-deals-h">{offerTitle}</td></tr><tr><td class="hot-deals-sub-h">{offerSlogan}</td></tr></table></td>',
                                '<tpl if="distanceToStore&gt;=1000">'+
                                '<td nowrap="nowrap "class="val">{[Math.round(values.distanceToStore/1000)]} km</td>'+   //do formatting here
                                '</tpl>'+
                                '<tpl if="distanceToStore<=999">'+
                                '<td nowrap="nowrap "class="val">{distanceToStore} m</td>'+   //do formatting here
                                '</tpl>',
                                '</tr>',
                                '</table>',
                                '</div>',
                                '</tpl>'
                                );

                            var couponListForMiles = new Ext.XTemplate(
                                '<tpl for=".">',
                                '<tpl if="isSponsored ==&quot;true&quot;"">',
                                '<div class="brands-row-spon">',
                                '</tpl>',
                                '<tpl if="isSponsored !=&quot;true&quot;"">',
                                '<div  class="brands-row">',
                                '</tpl>',
                                '<table width="100% "border="0"cellpadding="0" cellspacing="0">',
                                '<tr>',
                                '<td class="but"align:left style="margin-right:10px;"><img src="{smallImage}"/>',
                                '</td>',
                                '<td width="100% "align="left "><table><tr><td class="hot-deals-h">{offerTitle}</td></tr><tr><td class="hot-deals-sub-h">{offerSlogan}</td></tr></table></td>',
                                '<tpl if="distanceToStore/1000*0.62&gt;=0.1">'+
                                '<td nowrap="nowrap "class="val">{[(values.distanceToStore/1000*.62).toFixed(1)]} mi</td>'+
                                '</tpl>'+
                                '<tpl if="distanceToStore/1000*0.62 < 0.1">'+
                                '<td nowrap="nowrap "class="val">{[Math.round(values.distanceToStore*5280/1000*0.62)]} ft</td>'+
                                '</tpl>',
                                '</tr>',
                                '</table>',
                                '</div>',
                                '</tpl>'
                                );

                            var categoriesBrandTpl = new Ext.XTemplate(
                                '<div class="brands-row">',
                                '<table width="100%" border="0 "cellpadding="0"cellspacing="0">',
                                '<tr>',
                                '<td  class="icon"align:"left" style="margin-right:10px;"><img src="{smallImage}"/>',
                                '</td>',
                                '<td class="hot-deals-h" width="100%"align="left">{categoryName}</td>',
                                '<td nowrap="nowrap" class="val">{numberOfCoupons}</td>',
                                '</tr>',
                                '</table>',
                                '</div>'
                                );
                            var brandTpl = new Ext.XTemplate(
                                '<div class="brands-row">',
                                '<table width="100%" border="0 "cellpadding="0"cellspacing="0">',
                                '<tr>',
                                '<td  class="but"align:"left" style="margin-right:10px;"><img src="{brandIcon}"/>',
                                '</td>',
                                '<td class="hot-deals-h" width="100%"align="left">{brandName}</td>',
                                '<td nowrap="nowrap" class="val">{numberOfCoupons}</td>',
                                '</tr>',
                                '</table>',
                                '</div>'
                                );

                            var moreTpl = new Ext.XTemplate(
                                '<div class="brands-row">',
                                '<table width="100%"border="0" cellpadding="0" cellspacing="0">',
                                '<tr>',
                                '<td img style="width:1px; height:37px; align:left">{image}</td>',
                                '<td class="hot-deals-h" width="100%" align="left"valign="middle">',
                                '{name}',
                                '</td>',
                                '<td nowrap="nowrap" class="val">{selectValue}</td>',
                                '</tr>',
                                '</table>',
                                '</div>'
                                );
       
                            ////////////////////////////// for stores models///////////////////////////////////////////////////

                            Ext.regModel('Stores', {
                                fields: [
                                {
                                    name: 'city',
                                    type: 'string'
                                },

                                {
                                    name: 'country',
                                    type: 'string'
                                },

                                {
                                    name: 'email',
                                    type: 'string'
                                },

                                {
                                    name: 'homePage',
                                    type: 'string'
                                },

                                {
                                    name: 'latitude',
                                    type: 'string'
                                },

                                {
                                    name: 'longitude',
                                    type: 'string'
                                },

                                {
                                    name: 'phone',
                                    type: 'string'
                                },

                                {
                                    name: 'storeId',
                                    type: 'string'
                                },

                                {
                                    name: 'storeName',
                                    type: 'string'
                                },

                                {
                                    name: 'street',
                                    type: 'string'
                                }
                                ]
                            });
                            ////////////////// json foe hot deal store/////////////////////////////////////////////////////////////
                            //TODO
                            var jsonHotDealListStore = new Ext.data.Store({
                                id:'jsonHotDealListStore',
                                model: "Stores",
                                proxy :{
                                    type : 'memory',
                                    reader : new Ext.data.JsonReader({
                                        root: 'ListOfStores'
                                    })
                                }
                       
                            });


                            ////////////////////////categories coupon stores//////////////////////////////////

                            var jsonCategorieStores = new Ext.data.Store({
                                model: "Stores",
                                proxy :{
                                    type : 'memory',
                                    reader : new Ext.data.JsonReader({
                                        root: 'ListOfStores'
                                    })
                                }
                            });

                            //////////////////////////////brand coupon store//////////////////////////////////////////
                            var jsonBrandStores = new Ext.data.Store({
                                model: "Stores",
                                proxy :{
                                    type : 'memory',
                                    reader : new Ext.data.JsonReader({
                                        root: 'ListOfStores'
                                    })
                                }
                            });

                            //////////////////////////////more deals coupon store//////////////////////////////////////////
                            var jsonMoreDealListStore = new Ext.data.Store({
                                model: "Stores",
                                proxy: {
                                    type: 'memory',
                                    reader: new Ext.data.JsonReader({
                                        type: 'json',
                                        root: 'ListOfStores'
                                    })
                                }
                            });
                            
                            ///////  new campaign List store
                            var jsonCampaignStore = new Ext.data.Store({
                                model: "Stores",
                                proxy: {
                                    type: 'memory',
                                    reader: new Ext.data.JsonReader({
                                        type: 'json',
                                        root: 'ListOfStores'
                                    })
                                }
                            });


                            var getCouponStores = new Ext.data.Store({
                                model: "Stores",
                                proxy :{
                                    type : 'memory',
                                    reader : new Ext.data.JsonReader({
                                        type: 'json',
                                        root: 'storeInfo'
                                    })
                                }
                            });
                            /////////////////////// Custom model for data view///////////////////////////////////////////////////////


                            Ext.regModel('CustomCumbari', {
                                fields: [
                                {
                                    name: 'endTime',
                                    type: 'string'
                                },
                                {
                                    name: 'productInfoLink',
                                    type: 'string'
                                },
                                {
                                    name: 'startTime',
                                    type: 'string'
                                },
                                {
                                    name: 'couponDeliveryType',
                                    type: 'string'
                                },
                                {
                                    name: 'groupId',
                                    type: 'string'
                                }
                                ,
                                {
                                    name: 'validDay',
                                    type: 'string'
                                }
                                ,
                                {
                                    name: 'offerTitle',
                                    type: 'string'
                                },
                                {
                                    name: 'offerType',
                                    type: 'string'
                                },
                        
                                {
                                    name: 'validFrom',
                                    type: 'string'
                                },
                                {
                                    name: 'offerSlogan',
                                    type: 'string'
                                },
                                {
                                    name: 'smallImage',
                                    type: 'string'
                                },

                                {
                                    name: 'distanceToStore',
                                    type: 'integer'
                                },

                                {
                                    name: 'isSponsored',
                                    type: 'string'
                                },

                                {
                                    name: 'storeId',
                                    type: 'string'
                                },

                                {
                                    name: 'storeName',
                                    type: 'string'
                                },

                                {
                                    name: 'latitude',
                                    type: 'string'
                                },

                                {
                                    name: 'longitude',
                                    type: 'string'
                                },

                                {
                                    name: 'city',
                                    type: 'string'
                                },

                                {
                                    name: 'country',
                                    type: 'string'
                                },

                                {
                                    name: 'email',
                                    type: 'string'
                                },

                                {
                                    name: 'homePage',
                                    type: 'string'
                                },

                                {
                                    name: 'phone',
                                    type: 'string'
                                },

                                {
                                    name: 'storeId',
                                    type: 'string'
                                },

                                {
                                    name: 'storeName',
                                    type: 'string'
                                },

                                {
                                    name: 'street',
                                    type: 'string'
                                },
                                {
                                    name: 'couponId',
                                    type: 'string'
                                },
                                {
                                    name: 'endOfPublishing',
                                    type: 'string'
                                },
                                {
                                    name: 'brandName',
                                    type: 'string'
                                }

                                ]
                            });
                            var counter = 2;
                   
                            languageText();
                            var tabpanel = new Ext.TabPanel({
                                tabBar: {
                                    dock: 'bottom',
              
                                    layout: {
                                        pack: 'center'
                                    }
                                },
                                fullscreen: true,
                                id:'tabpanel',
                                layout: 'card',
                                ui:'myUI',
                                cardSwitchAnimation :false,
                                items: [
                                new Ext.List({
                                    title: 'Hot deals',
                                    fullscreen: true,
                                    id:'hotDeals',
                                    cls:'myList',
                                    grouped :true,
                                    plugins:[
                                    {
                                        ptype: 'listpaging',
                                        autoPaging: false,
                                        id:'pagePluginId',
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
                                    store:new Ext.data.Store({
                                        id:'hotStore',
                                        model: "hotDeals",
                                        clearOnPageLoad: false,
                                        proxy:{
                                            type: 'ajax',
                                            url: getCouponsURL,
                                            reader: new Ext.data.JsonReader({
                                                type: 'json',
                                                root: 'ListOfCoupons'
                                            }),
                                            listeners: {
                                                exception:function (proxy, response, operation) {
                                                    $(".x-mask-loading").hide();
                                                    exception = "true";
                                                    db.transaction(function (tx) {
                                                        tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                            var selectedLanguage =  results.rows.item(0).languageValue;
                                                            if(selectedLanguage=="ENG"){
                                                                Ext.Msg.alert('', 'No/Weak internet Access You can not use Cumbari service currently.', Ext.emptyFn);
                                                                
                                                            }
                                                            else if(selectedLanguage=="SWE"){
                                                                Ext.Msg.alert('', 'Inget/svagt tillg\u00E5ng till internet Du kan inte anv\u00E4nda Cumbari tj\u00E4nster som idag.', Ext.emptyFn);
                                                            }

                                                        })
                                                    });
                                                    var getMoreStore = Ext.getCmp('moreList').getStore();
                                                    getMoreStore.removeAll();
                                                }
                                            }
                                        },
                                        //autoLoad: true,
                                        getGroupString : function(record) {
                                            return record.get('isSponsored') + ' (' + record.get('offerType') + ') ';
                                        },
                                        listeners: {
                                            'load': function() {
												jsonHotDealListStore.add(this.proxy.reader.rawData.ListOfStores);
                                                var getBrand=Ext.getCmp('Brands').getStore();
                                                getBrand.loadData(this.proxy.reader.rawData.ListOfBrandHits);
                                                function toRad(degree)
                                                {
                                                    rad = degree* Math.PI/ 180;
                                                    return rad;
                                                }
                                                var i;
                                                for(i=0;i< this.data.items.length;i++){
                                                    var findStore = this.data.items[i].data.storeId;
                                                    var showDiatance= jsonHotDealListStore.findRecord("storeId" ,findStore );
                                                    var couponLat=  showDiatance.data.latitude;
                                                    var couponLng = showDiatance.data.longitude;
                                                    var currentLatitude = document.getElementById('hidCurrentLatitude').value;
                                                    var currentLongitude = document.getElementById('hidCurrentLongitude').value;
                                                    var R = 6371;
                                                    var latit1=currentLatitude;
                                                    var longi1=currentLongitude;
                                                    var latit2=couponLat;
                                                    var longi2=couponLng;
                                                    var dLatit=toRad(latit2-latit1);
                                                    var dLongi=toRad(longi2-longi1);
                                                    var a = Math.sin(dLatit/2) * Math.sin(dLatit/2) +
                                                    Math.sin(dLongi/2) * Math.sin(dLongi/2) * Math.cos(toRad(latit1)) * Math.cos(toRad(latit2));
                                                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                                                    var di = R * c;
                                                    var distance = Math.round(di*1000);
                                                    this.data.items[i].set("distanceToStore", distance);
                                                    
                                                    // filter and sort the current store for same group id//
                                                    var categories = [];
                                                    this.filterBy(function(record){
                                                        var fieldData = this.findExact("groupId",record.data.groupId)
                                                        if ($.inArray(record.data.groupId, categories) == -1 && fieldData > -1 ) {
                                                            categories.push(record.data.groupId);
                                                            return record;
                                                        }
                                                    });
                                                    this.sort([
                                                    {
                                                        property : 'isSponsored',
                                                        direction: 'DESC'
                                                    },
                                                    {
                                                        property : 'offerType',
                                                        direction: 'DESC'
                                                    }
                                                    ]);
                                                }
                                            }
                                        }
                                    }),
                                    iconCls: 'hotDeal',
                                    itemTpl :campaignListTpl,
                                    listeners: {
                                        activate: {
                                            fn: function(){
                                                function toRad(degree)
                                                {
                                                    rad = degree* Math.PI/ 180;
                                                    return rad;
                                                }
                                                if(loadS=="true"){
                                                    find_couponLat=getCurrentLatitude;
                                                    find_couponLong=getCurrentLongitude;
                                                    getFindCoupons(find_couponLat,find_couponLong);
                                                }
                                                db.transaction(function (tx) {
                                                    tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                        var selectedUnit =  results.rows.item(0).unitValue;
                                                        if(selectedUnit=="meter"){
                                                            Ext.getCmp('hotDeals').itemTpl=campaignListTpl;
                                                            Ext.getCmp('hotDeals').initComponent();
                                                            Ext.getCmp('hotDeals').refresh();
                                                        }
                                                        else if(selectedUnit=="miles"){
                                                            Ext.getCmp('hotDeals').itemTpl=campaignListTpl;
                                                            Ext.getCmp('hotDeals').initComponent();
                                                            Ext.getCmp('hotDeals').refresh();
                                                   
                                                        }
                                                    })
                                                });

                                                Ext.getCmp("mapButton").show();
                                                Ext.getCmp('ediList').hide();
                                                Ext.getCmp('doneButton').hide();
                                                var buttonToHide =Ext.getCmp('listSearch').getValue();
                                                if(buttonToHide==''){
                                                    if(loadFind_Coupon==true){
                                                        Ext.getCmp('doneButton').show();
                                                    }else{
                                                        Ext.getCmp('doneButton').hide();   
                                                    }

                                                }
                                                else{

                                                    Ext.getCmp('doneButton').show();
                                                }
                                        
                                                var hideSearch =Ext.getCmp('tabpanel');
                                                var df =hideSearch.getDockedComponent('searchBar');
                                                if(!df){
                                                    hideSearch.addDocked('searchBar');
                                                }

                                            }
                                        },
                                        itemtap: function(view, index, item, e){
                                           
                                            var recName =  view.getStore().getAt(index).data.offerTitle ;
                                            var groupId =  view.getStore().getAt(index).data.groupId ;
											var campain = Ext.getCmp('newCampain');
											 Ext.getCmp('hotDeals').getStore().clearFilter(true);
                                            campain.dockedItems.items[0].setTitle(recName);
                                            var cs = Ext.getCmp('campainStore').getStore();
                                            var getHotCoupons =Ext.getCmp('hotDeals').getStore();
                                            cs.removeAll();
                                            cs.add(getHotCoupons.data.items);
                                            jsonCampaignStore.loadData(jsonHotDealListStore.data.items);
                                            cs.filterBy(function(record){
                                               // var fieldData = record.data.groupId.toLowerCase().indexOf(groupId);
												var fieldData = cs.findExact("groupId",groupId)
                                                if (fieldData > -1 )
                                                    return record;
												
												

                                            });
											Ext.getCmp('Viewport').setActiveItem('newCampain', {
                                                type:'flip',
                                                duration:500,
                                                direction:'right'
                                            });
											// filter and sort the current store for same group id//
											var categories = [];
											Ext.getCmp('hotDeals').getStore().filterBy(function(record){
												var fieldData = this.findExact("groupId",record.data.groupId)
												if ($.inArray(record.data.groupId, categories) == -1 && fieldData > -1 ) {
													categories.push(record.data.groupId);
													return record;
												}
											});
                                        }
                                    }
                                }),
                                new Ext.List({
                                    title: 'categories',
                                    fullscreen: true,
                                    id:'categories',
                                    store: new Ext.data.Store({
                                        model: "categories",
                                        proxy: {
                                            type: 'ajax',
                                            url:getCategoriesURL,
                                            reader: {
                                                type: 'json',
                                                root: 'listOfCategories'
                                            }
                                        },
                                        autoLoad: true
                                    }),
                                    iconCls: 'category',
                                    itemTpl :categoriesBrandTpl,
                                    listeners: {
                                        activate: {
                                            fn: function(){
                                                Ext.getCmp("mapButton").hide();
                                                Ext.getCmp('doneButton').hide();
                                                Ext.getCmp('ediList').hide();
                                                var hideSearch =Ext.getCmp('tabpanel');
                                                var df =hideSearch.getComponent('searchBar');
                                                if(!df){

                                                }else{
                                                    hideSearch.removeDocked(df,false);
                                                }
                                                if(exception == "false"){
                                                    var i;
                                                    var catHit = Ext.getCmp('hotDeals').getStore();
                                                    var hj =catHit.proxy.reader.rawData.ListOfCategoryHits;
                                                    for(i=0;i<hj.length;i++){
                                                        var cteCoupon=hj[i].categoryId;
                                                        var catNum = Ext.getCmp('hotDeals').getStore().proxy.reader.rawData.ListOfCategoryHits[i].numberOfCoupons;
                                                        var findHit=Ext.getCmp('categories').getStore();
                                                        var findCat =findHit.findRecord("categoryId",cteCoupon);
                                                        findCat.set('numberOfCoupons',catNum);
                                                    }
                                                }
                                            //                                        var hideSearch =Ext.getCmp('tabpanel');
                                            //                                        hideSearch.dockedItems.items[1].hide();
                                            //                                        hideSearch.dockedItems.items[1].rendered = false;
                                            //                                        hideSearch.doComponentLayout();
                                            }
                                        },
                                        itemTap:function(view, index, item, e){
                                            setTimeout(function(){
                                                view.deselect(index);
                                            },500);
                                            var recName =  view.getStore().getAt(index).data.categoryName ;
                                            var tempB = new String(recName);
                                            tempB = encodeURI(tempB);
                                            tempB =  tempB.replace(/&/,"%26");
                                            var getURL=Ext.getCmp('hotDeals').getStore();
                                            getCouponsURLCategory = getURL.proxy.url+'&categoriesFilter='+tempB;
                                            var getCatStore=Ext.getCmp('catStore').getStore();
                                            getCatStore.proxy.url=getCouponsURLCategory;
                                            getCatStore.load();
                                            var cat = Ext.getCmp('Panel');
                                            cat.dockedItems.items[0].setTitle(recName);
                                            Ext.getCmp('Viewport').setActiveItem('Panel', {
                                                type:'slide',
                                                direction:'left',
                                                duration:500
                                            });
                                        }
                                    }
                                }),
                                new Ext.List({
                                    title: 'Brands',
                                    fullscreen:true,
                                    id:'Brands',
                                    store: new Ext.data.Store({
                                        model: "brands",
                                        proxy: {
                                            type: 'memory',
                                            //url: getBandsURL,
                                            reader: {
                                                type: 'json',
                                                root: 'ListOfCoupons'
                                            }
                                        },
                                        autoLoad: true
                                    }),
                                    iconCls: 'brand',
                                    itemTpl :brandTpl,
                                    grouped : false,
                                    indexBar: false,
                                    listeners: {
                                        activate: {
                                            fn: function(){
                                                //                                        var i;
                                                //                                        var catHit = Ext.getCmp('hotDeals').getStore();
                                                //                                        var hj =catHit.proxy.reader.rawData.ListOfBrandHits;
                                                //                                        for(i=0;i<hj.length;i++){
                                                //                                            var cteCoupon=hj[i].brandName;
                                                //                                            var catNum = Ext.getCmp('hotDeals').getStore().proxy.reader.rawData.ListOfBrandHits[i].numberOfCoupons;
                                                //                                            var findHit=Ext.getCmp('Brands').getStore();
                                                //                                            var findCat =findHit.findRecord("brandName",cteCoupon);
                                                //                                            findCat.set('numberOfCoupons',catNum);
                                                //                                        }


                                                Ext.getCmp("mapButton").hide();
                                                Ext.getCmp('doneButton').hide();
                                                Ext.getCmp('ediList').hide();
                                                var hideSearch =Ext.getCmp('tabpanel');
                                                var df =hideSearch.getComponent('searchBar');
                                                if(!df){

                                                }else{
                                                    hideSearch.removeDocked(df,false);
                                                }
                                            }
                                        },
                                        itemTap:function(view, index, item, e){
                                            setTimeout(function(){
                                                view.deselect(index);
                                            },500);

                                            var recName =  view.getStore().getAt(index).data.brandName;
                                            var cat = Ext.getCmp('brandListPanel');
                                            cat.dockedItems.items[0].setTitle(recName);
                                            db.transaction(function (tx) {
                                                tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                    var storeLanguage =  results.rows.item(0).languageValue;
                                                    var storeUnit    =  results.rows.item(0).unitValue;
                                                    var offerValue =  results.rows.item(0).offersValue;
                                                    var rangeValue    =  results.rows.item(0).rangeValue;
                                                    var storeLatitude    =  results.rows.item(0).latitude;
                                                    var storeLongitude    =  results.rows.item(0).longitude;
                                                    var tempB = new String(recName);
                                                    tempB = encodeURI(tempB);
                                                    tempB =  tempB.replace(/&/,"%26");
                                                    var brandUrl=baseURL+'getBrandedCoupons?apiVersion=2&token=cumba4now&longitude='+storeLongitude+'&latitude='+storeLatitude+'&clientId='+userClientId+'&lang='+storeLanguage+'&maxNo=200&radiousInMeter='+rangeValue;
                                                    getCouponsURLCategory = brandUrl+'&batchNo=1&brandsFilter='+tempB;
                                                    var getBrandStore =Ext.getCmp('getBrandStore').getStore();
                                                    getBrandStore.proxy.url=getCouponsURLCategory;
                                                    getBrandStore.load();
                                                });
                                            });
                                            Ext.getCmp('Viewport').setActiveItem('brandListPanel', {
                                                type:'slide',
                                                direction:'left',
                                                duration:500
                                            });
                                        }
                                    }
                
                                }) ,
                                new Ext.List({
                                    fullscreen: true,
                                    itemTpl :favListTpl,
                                    id:'favotites',
                                    store:jsonFavoritesStore,
                                    title: 'favorites',
                                    iconCls: 'heart',
                                    listeners: {
                                        activate: {
                                            fn: function(){
                                                Ext.getCmp("mapButton").show();
                                                Ext.getCmp('doneButton').hide();
                                                Ext.getCmp('ediList').show();
                                                var hideSearch =Ext.getCmp('tabpanel');
                                                var df =hideSearch.getComponent('searchBar');
                                                if(!df){

                                                }else{
                                                    hideSearch.removeDocked(df,false);
                                                }
                                                var favorites_store =Ext.getCmp('favotites').getStore();
                                                addFavorites();
                                                var loadFav =Ext.getCmp('favotites').getStore();
                                                loadFav.load();
                                                db.transaction(function (tx) {
                                                    tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                        var selectedUnit =  results.rows.item(0).unitValue;
                                                        if(selectedUnit=="meter"){
                                                            Ext.getCmp('favotites').itemTpl=favListTpl;
                                                            Ext.getCmp('favotites').initComponent();
                                                            Ext.getCmp('favotites').refresh();
                                                        }
                                                        else if(selectedUnit=="miles"){
                                                            Ext.getCmp('favotites').itemTpl=favListTplMiles;
                                                            Ext.getCmp('favotites').initComponent();
                                                            Ext.getCmp('favotites').refresh();
                                                   
                                                        }
                                                    })
                                                });
                                                favEditLang();
                                            }
                                        },
                                        itemtap: function(view, index, item, e){
                                            setTimeout(function(){
                                                view.deselect(index);
                                            },500);
                                            if(e.getTarget('.deleteButton')){
                                                var store=view.getStore();
                                                var record = store.getAt(index);
                                                store.remove(record);
                                                var deleteCouponId=record.data.couponId;
                                                db.transaction(function (tx) {
                                                    tx.executeSql("SELECT * FROM FAVORITES WHERE couponId = "+"'"+deleteCouponId+"'"+";", [],function(transaction, results){
                                                        var   numberOfRecord = results.rows.length;

                                                        if(numberOfRecord==1){
                                                            var query = "DELETE FROM  FAVORITES WHERE couponId = "+"'"+deleteCouponId+"'"+";";
                                                            tx.executeSql(query);

                                                        }
                                                    })
                                                });
                                                $(".deleteButton").show();
                                            }
                                            else{
                                                var rec = view.getStore().getAt(index);
                                                detailViewPanel.update(rec.data);
                                                infoPanel.update(rec.data);
                                                Ext.getCmp('Viewport').setActiveItem('detailViewPanel', {
                                                    type:'slide',
                                                    direction:'left',
                                                    duration:500
                                                });
                                            }
                                        }
                                    }
                                }) ,
                                new Ext.List({
                                    title: 'More',
                                    fullscreen: true,
                                    id:'moreList',
                                    itemTpl :moreTpl,
                                    store: more,
                                    iconCls: 'more',
                                    listeners: {
                                        activate: {
                                            fn: function(){
                                                Ext.getCmp("mapButton").hide();
                                                Ext.getCmp('doneButton').hide();
                                                Ext.getCmp('ediList').hide();
                                                var hideSearch =Ext.getCmp('tabpanel');
                                                var df =hideSearch.getComponent('searchBar');
                                                if(!df){

                                                }else{
                                                    hideSearch.removeDocked(df,false);
                                                }
                                                var getMoreList=Ext.getCmp('moreList').getStore();
                                                var getPos=getMoreList.data.items[0];
                                                db.transaction(function (tx) {
                                                    tx.executeSql('SELECT * FROM POSITION', [], function (tx, results) {
                                                        var selectedPos =  results.rows.item(0).positionValue;
                                                        if(selectedPos=="CUR"){
                                                            getPos.set('selectValue',"Current");
                                                        }else if(selectedPos=="NEW"){
                                                            getPos.set('selectValue',"New");
                                                        }
                                                    });
                                                });
                                            }
                                        },
                                        itemTap: function(list,more ){
                                            if(more==0)
                                            {
                                                Ext.getCmp('Viewport').setActiveItem('changePositionPanel',{
                                                    type:'slide',
                                                    direction:'left',
                                                    duration:500
                                                });
                                            }
                                            else if(more==1)
                                            {
                                                Ext.getCmp('Viewport').setActiveItem('settingPanel',{
                                                    type:'slide',
                                                    direction:'left',
                                                    duration:500
                                                });
                                            }
                                            else if(more==2)
                                            {
                                                Ext.getCmp('Viewport').setActiveItem('feedbackPanel',{
                                                    type:'slide',
                                                    direction:'left',
                                                    duration:500
                                                });
                                            }
                                            else if(more==3)
                                            {
                                                Ext.getCmp('Viewport').setActiveItem('aboutPanel',{
                                                    type:'slide',
                                                    direction:'left',
                                                    duration:500
                                                });
                                            }
                                        }
                                    }
                
                                })
                                ],
                                dockedItems: [{
                                    xtype: 'toolbar',
                                    title:"<span class= 'logo'><img src='https://s3-eu-west-1.amazonaws.com/webclient/more/logo.jpg' width='90' height='41' align= 'center' ></span>",
                                    dock: 'top',
                                    ui:'charcoal',
                                    layout: {
                                        pack: 'right'
                                    },
                                    items: [{
                                        text:'Done',
                                        id:'doneButton',
                                        ui:'done',
                                        hidden:true,
                                        handler:function(){
                                            loadFind_Coupon=false;
                                            db.transaction(function (tx) {
                                                tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                    var storeLanguage =  results.rows.item(0).languageValue;
                                                    var storeUnit    =  results.rows.item(0).unitValue;
                                                    var offerValue =  results.rows.item(0).offersValue;
                                                    var rangeValue    =  results.rows.item(0).rangeValue;
                                                    var storeLatitude    =  results.rows.item(0).latitude;
                                                    var storeLongitude    =  results.rows.item(0).longitude;
                                                    var getCoupon =Ext.getCmp('hotDeals').getStore();
                                                    getCoupon.proxy.url= baseURL+'getCoupons?apiVersion=2&token=cumba4now&longitude='+storeLongitude+'&latitude='+storeLatitude+'&clientId='+userClientId+'&lang='+storeLanguage+'&batchNo=1&maxNo=200&radiousInMeter='+rangeValue;
                                                    getCoupon.load();
                                           
                                                })
                                            })
                                            Ext.getCmp('listSearch').setValue('');
                                            this.hide();

                                        }
                                    },{
                                        text:'Edit',
                                        ui:'done',
                                        id:'ediList',
                                        handler:function(){
                                            if(this.text=="Edit"){
                                                this.setText('Done');
                                                $(".deleteButton").show();
                                            }
                                            else if(this.text=="Redigera"){
                                                this.setText('Klar');
                                                $(".deleteButton").show();
                                            }
                                            else if(this.text=="Klar"){
                                                this.setText('Redigera');
                                                $(".deleteButton").hide();
                                            }
                                            else if(this.text=="Done"){
                                                this.setText('Edit');
                                                $(".deleteButton").hide();
                                            }
                                        }
                                    },{
                                        xtype: 'spacer'
                                    },
                                    {
                                        text: 'Map',
                                        ui: 'forward',
                                        id:'mapButton',
                                        handler: function() {
                                            this.addListener('tap', function () {
                                                var tab = Ext.getCmp('tabpanel');
                                                var activeTab = tab.getActiveItem();
                                                var tabItem=(tab.items.findIndex('id', activeTab.id));
                                                if(tabItem==0){
                                                    var firstTab=jsonHotDealListStore.data;
                                                    //var firstTab=jsonHotDealListStore.data.items[0].data.latitude;

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



                                                }
                                                else if (tabItem==3){
                                                    mapRender();

                                                    var favTabStore=Ext.getCmp('favotites').getStore();
                                                    var favTab=favTabStore.data.items;
                                                    for(i=0;i<favTab.length;i++){
                                                        var markerLatitudeFav=favTab[i].data.latitude;
                                                        var markerLongitudeFav=favTab[i].data.longitude;
                                                        var markerStoreNameFav=favTab[i].data.storeName;

                                                        var getMarkFav= Ext.getCmp('storesMap');
                                                        getMarkFav.update({
                                                            latitude : markerLatitudeFav,
                                                            longitude : markerLongitudeFav
                                                        });

                                                        marker = new google.maps.Marker({
                                                            id:'upCenter',
                                                            position:new google.maps.LatLng(markerLatitudeFav,markerLongitudeFav),
                                                            map: storesMap.map,
                                                            icon:'https://s3-eu-west-1.amazonaws.com/webclient/Pin.png'
                                                        });

                                                        favInfoWindow(marker, markerStoreNameFav);
                                                    }
                                                    var infowindows = new google.maps.InfoWindow();
                                                    function favInfoWindow(marker, markerStoreNameFav) {

                                                        google.maps.event.addListener(marker, 'mousedown', (function(marker, i) {
                                                            return function() {
                                                      
                                                                infowindows.setContent(markerStoreNameFav);
                                                                infowindows.open(storesMap.map, marker);
                                                            }
                                                        })(marker));
                                                    }

                                                }








                                            //console.log(storeMarkers)

                                            }),
                                            Ext.getCmp('Viewport').setActiveItem('mapPanel', {
                                                type:'slide',
                                                direction:'left',
                                                duration:500
                                            });
                                        }
                    

                                    }]
                                },{
                                    xtype:'toolbar',
                                    dock:'top',
                                    id:'searchBar',
                                    ui:'charcoal',
                                    items:[{
                                        xtype:'searchfield',
                                        width:'95%',
                                        id:'listSearch',
                                        value : '',

                                        listeners: {
                                            focus: function(){
                                                Ext.getCmp('listSearch').setValue('');
                                                Ext.getCmp('doneButton').show();
                                            },
                                            blur: function(){
                                                if( Ext.getCmp('listSearch').getValue()=='' ){
                                                    Ext.getCmp('listSearch').setValue('');
                                                }
                                            },
                                            action : function(e){
                                                var keyWords =Ext.getCmp('listSearch').getValue();
                                                db.transaction(function (tx) {
                                                    tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                        var storeLanguage =  results.rows.item(0).languageValue;
                                                        var storeUnit    =  results.rows.item(0).unitValue;
                                                        var offerValue =  results.rows.item(0).offersValue;
                                                        var rangeValue    =  results.rows.item(0).rangeValue;
                                                        var storeLatitude    =  results.rows.item(0).latitude;
                                                        var storeLongitude    =  results.rows.item(0).longitude;
                                                        var temp = new String(keyWords);
                                                        temp = encodeURI(temp);
                                                        temp =  temp.replace(/&/,"%26");
                                                        var getCoupon =Ext.getCmp('hotDeals').getStore();
                                                        var findCouponURL =baseURL+'findCoupons?apiVersion=2&latitude='+storeLatitude+'&longitude='+storeLongitude+'&lang='+storeLanguage+'&clientId='+userClientId+'&token=cumba4now&batchNo=1&maxNo=200&radiousInMeter='+rangeValue+'&searchWords='+temp;
                                                        var prePreviousURL = getCoupon.proxy.url;
                                                        getCoupon.proxy.url= findCouponURL;
                                                        getCoupon.load();
                                                        getCoupon.proxy.url = prePreviousURL;

                                                    })
                                                })
                                            }
                                        }
                                    }]
                                }
                                ]
                            });
         
                            //////////////////////  categories Panel ///////////////////////////



                            var catCounter=2;
                            var Panel = new Ext.Panel({
                                flex: 1,
                                frame:true,
                                autoHeight: true,
                                collapsible: true,
                                width: '100%',
                                layout: 'fit',
                                id:'Panel',
                                dockedItems:[
                                new Ext.Toolbar({
                                    dock : 'top',
                                    title: 'Title',
                                    id:'catTitle',
                                    cls:'catLable',
                                    ui:'charcoal',
                                    items: [
                                    {
                                        text: 'Back',
                                        ui:'back',
                                        id:'catBack',
                                        handler: function() {
                                            Ext.getCmp('Viewport').setActiveItem('tabpanel', {
                                                type:'slide',
                                                duration:500,
                                                direction:'right'
                                            });
                                        }
                                    },{
                                        xtype:'spacer'
                                    },{
                                        text:'Map',
                                        ui:'forward',
                                        id:'catMap',
                                        handler:function(){
                                            Ext.getCmp('Viewport').setActiveItem('mapPanel', {
                                                type:'slide',
                                                duration:500,
                                                direction:'right'
                                            });
                                            mapRender();
                                            var catTab=jsonCategorieStores.data.items;
                                            for(i=0;i<catTab.length;i++){
                                                var markerLatitude=catTab[i].data.latitude;
                                                var markerLongitude=catTab[i].data.longitude;
                                                var markerStoreName=catTab[i].data.storeName;
                                                var getMark= Ext.getCmp('storesMap');
                                                getMark.update({
                                                    latitude : markerLatitude,
                                                    longitude : markerLongitude
                                                });
                                                //                                            var infowindow = new google.maps.InfoWindow({
                                                //                                                content: ""+markerStoreName+""
                                                //                                            });
                                                marker = new google.maps.Marker({
                                                    id:'upCenter',
                                                    position:new google.maps.LatLng(markerLatitude,markerLongitude),
                                                    map: storesMap.map,
                                                    icon:'https://s3-eu-west-1.amazonaws.com/webclient/Pin.png'
                                                });
                                                catInfoWindow(marker, markerStoreName);
                                            }
                                            var infowindows = new google.maps.InfoWindow();
                                            function catInfoWindow(marker, markerStoreName) {
                                                google.maps.event.addListener(marker, 'mousedown', (function(marker, i) {
                                                    return function() {
                                                        infowindows.setContent(markerStoreName);
                                                        infowindows.open(storesMap.map, marker);
                                                    }
                                                })(marker));

                                            }

                                        }
                                    }
                                    ]
                                }),
                                ],
                                items:[new Ext.List({
                                    fullscreen: true,
                                    id:'catStore',
                                    itemTpl :couponListTpl,
                                    cls:'myList',
                                    grouped :true,
                                    plugins:[
                                    {
                                        ptype: 'listpaging',
                                        autoPaging: false,
                                        onPagingTap :function(){
                                            var getTitle = Ext.getCmp('catTitle').title;
                                            db.transaction(function (tx) {
                                                tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                    var storeLanguage =  results.rows.item(0).languageValue;
                                                    var storeUnit    =  results.rows.item(0).unitValue;
                                                    var offerValue =  results.rows.item(0).offersValue;
                                                    var rangeValue    =  results.rows.item(0).rangeValue;
                                                    var storeLatitude    =  results.rows.item(0).latitude;
                                                    var storeLongitude    =  results.rows.item(0).longitude;
                                                    var getCoupon =Ext.getCmp('catStore').getStore();
                                                    getCoupon.proxy.url= baseURL+'getCoupons?apiVersion=2&token=cumba4now&longitude='+storeLongitude+'&latitude='+storeLatitude+'&clientId='+userClientId+'&lang='+storeLanguage+'&batchNo='+catCounter+'&maxNo=200&radiousInMeter='+rangeValue+'&categoriesFilter='+encodeURI(getTitle);
                                                    catCounter++;
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
                                        model: "categoriesCoupon",
                                        clearOnPageLoad: false,
                                        proxy: {
                                            type: 'ajax',
                                            url:  'json/categoriesList.json',
                                            reader: new Ext.data.JsonReader({
                                                type: 'json',
                                                root: 'ListOfCoupons'
                                            }),
                                            listeners: {
                                                exception:function (proxy, response, operation) {
                                                    $(".x-mask-loading").hide();
                                                    db.transaction(function (tx) {
                                                        tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                            var selectedLanguage =  results.rows.item(0).languageValue;
                                                            if(selectedLanguage=="ENG"){
                                                                Ext.Msg.alert('', 'Error with connection or there is no coupon in this category.', Ext.emptyFn);
                                                                
                                                            }
                                                            else if(selectedLanguage=="SWE"){
                                                                Ext.Msg.alert('', 'Fel med anslutning eller ingen kupong i denna kategori.', Ext.emptyFn);
                                                            }

                                                        })
                                                    });
                                                }
                                            }
                                        },
                                        //autoLoad: true,
                                        getGroupString : function(record) {
                                            return  record.get('isSponsored');
                                        },
                                        listeners: {
                                            'load': function(list) {
                                                jsonCategorieStores.add(this.proxy.reader.rawData.ListOfStores);
                                                function toRad(degree)
                                                {
                                                    rad = degree* Math.PI/ 180;
                                                    return rad;
                                                }
                                                var i;
                                                for(i=0;i< this.data.items.length;i++){
                                                    var findStore = this.data.items[i].data.storeId;
                                                    var showDiatance= jsonCategorieStores.findRecord("storeId" ,findStore );
                                                    var couponLat=  showDiatance.data.latitude;
                                                    var couponLng = showDiatance.data.longitude;
                                                    var currentLatitude = document.getElementById('hidCurrentLatitude').value;
                                                    var currentLongitude = document.getElementById('hidCurrentLongitude').value;
                                                    var R = 6371;
                                                    var latit1=currentLatitude;
                                                    var longi1=currentLongitude;
                                                    var latit2=couponLat;
                                                    var longi2=couponLng;
                                                    var dLatit=toRad(latit2-latit1);
                                                    var dLongi=toRad(longi2-longi1);
                                                    var a = Math.sin(dLatit/2) * Math.sin(dLatit/2) +
                                                    Math.sin(dLongi/2) * Math.sin(dLongi/2) * Math.cos(toRad(latit1)) * Math.cos(toRad(latit2));
                                                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                                                    var di = R * c;
                                                    var distance = Math.round(di*1000);

                                                    this.data.items[i].set("distanceToStore", distance);
                                                }
                                            }
                                        }
                                    }),
                                    listeners: {
                                        activate:function(){
                                            db.transaction(function (tx) {
                                                tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                    var selectedUnit =  results.rows.item(0).unitValue;
                                                    if(selectedUnit=="meter"){
                                                        Ext.getCmp('catStore').itemTpl=couponListTpl;
                                                        Ext.getCmp('catStore').initComponent();
                                                        Ext.getCmp('catStore').refresh();
                                                    }
                                                    else if(selectedUnit=="miles"){
                                                        Ext.getCmp('catStore').itemTpl=couponListForMiles;
                                                        Ext.getCmp('catStore').initComponent();
                                                        Ext.getCmp('catStore').refresh();
                                                   
                                                    }
                                                })
                                            });
                                        },

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
                                                    hotDealStoreViewStatisticsURL= baseURL+"storeViewStatistic?apiVersion=1&clientId="+userClientId+"&couponViewStatisticList=[{eventTime:"+"\'"+encodeURI(formattedDate)+"\'"+",couponId:"+"\'"+getCouponsId+"\'"+",storeId:"+"\'"+getStoreId+"\'"+",distanceToStore:"+getDistanceToStore+"}]&token=cumba4now";

                                                    Ext.Ajax.request({
                                                        url:hotDealStoreViewStatisticsURL,
                                                        method: "GET"
                                                    });

                                                    var getCoupon= baseURL+'getCoupon?apiVersion=2&couponId='+getCouponsId+'&lang='+userLanguage+'&token=cumba4now'

                                                    var found = jsonCategorieStores.findRecord("storeId", rec.data.storeId);
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
                                                    }else{

                                                        //person=Ext.ModelMgr.create({validDay:rec.limitPeriodListStore.data.items[0].data.validDay});
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
                                                        duration:500,
                                                        direction:'left'
                                                    });
                                                });
                                            });
                                        }
                                    }
                                }),],
                                listeners:{
                                    activate:function(){
                                        db.transaction(function (tx) {
                                            tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                var selectedUnit =  results.rows.item(0).unitValue;
                                                if(selectedUnit=="meter"){
                                                    Ext.getCmp('catStore').itemTpl=couponListTpl;
                                                    Ext.getCmp('catStore').initComponent();
                                                    Ext.getCmp('catStore').refresh();
                                                }
                                                else if(selectedUnit=="miles"){
                                                    Ext.getCmp('catStore').itemTpl=couponListForMiles;
                                                    Ext.getCmp('catStore').initComponent();
                                                    Ext.getCmp('catStore').refresh();

                                                }
                                            })
                                        })
                                    }
                                }
                            });


                            /////////////////////////  Brands Panel  /////////////////////////////
                            var brandCounter=2;
                            var brandListPanel = new Ext.Panel({
                                flex: 1,
                                frame:true,
                                autoHeight: true,
                                collapsible: true,
                                width: '100%',
                                layout: 'fit',
                                id:'brandListPanel',
                                dockedItems:[
                                new Ext.Toolbar({
                                    dock : 'top',
                                    title: '',
                                    id:'brandTitle',
                                    cls:'catLable',
                                    ui:'charcoal',
                                    items: [
                                    {
                                        text: 'Back',
                                        ui:'back',
                                        handler: function() {
                                            Ext.getCmp('Viewport').setActiveItem('tabpanel', {
                                                type:'slide',
                                                duration:500,
                                                direction:'right'
                                            });
                                            Ext.getCmp('tabpanel').setActiveItem('Brands');
                                        }
                                    },{
                                        xtype:'spacer'
                                    },{
                                        text:'Map',
                                        ui:'forward',
                                        handler:function(){
                                            Ext.getCmp('Viewport').setActiveItem('mapPanel', {
                                                type:'slide',
                                                duration:500,
                                                direction:'left'
                                            });
                                        }
                                    }
                                    ]
                                }),
                                ],
                                items:[new Ext.List({
                                    fullscreen: true,
                                    id:'getBrandStore',
                                    itemTpl :couponListTpl,
                                    cls:'myList',
                                    grouped :true,
                                    plugins:[
                                    {
                                        ptype: 'listpaging',
                                        autoPaging: false,
                                        onPagingTap :function(){
                                            var getTitle = Ext.getCmp('brandTitle').title;
                                            db.transaction(function (tx) {
                                                tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                    var storeLanguage =  results.rows.item(0).languageValue;
                                                    var storeUnit    =  results.rows.item(0).unitValue;
                                                    var offerValue =  results.rows.item(0).offersValue;
                                                    var rangeValue    =  results.rows.item(0).rangeValue;
                                                    var storeLatitude    =  results.rows.item(0).latitude;
                                                    var storeLongitude    =  results.rows.item(0).longitude;
                                                    var getCoupon =Ext.getCmp('getBrandStore').getStore();
                                                    var brandUrl=baseURL+'getBrandedCoupons?apiVersion=2&token=cumba4now&longitude='+storeLongitude+'&latitude='+storeLatitude+'&clientId='+userClientId+'&lang='+storeLanguage+'&maxNo=200&radiousInMeter='+rangeValue;
                                                    getCouponsURLCategory = brandUrl+'&batchNo='+brandCounter+'&brandsFilter='+encodeURI(getTitle);
                                                    getCoupon.proxy.url = getCouponsURLCategory;
                                                    brandCounter++;
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
                                    store:new Ext.data.Store({
                                        model: "brandsCoupon",
                                        clearOnPageLoad: false,
                                        proxy: {
                                            type: 'ajax',
                                            url: 'json/brandCoupon.json',
                                            reader: new Ext.data.JsonReader({
                                                type: 'json',
                                                root: 'ListOfCoupons'
                                            }),
                                            listeners: {
                                                exception:function (proxy, response, operation) {
                                                    $(".x-mask-loading").hide();
                                                    db.transaction(function (tx) {
                                                        tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                            var selectedLanguage =  results.rows.item(0).languageValue;
                                                            if(selectedLanguage=="ENG"){
                                                                Ext.Msg.alert('', 'Error with connection or there is no coupon in this brand.', Ext.emptyFn);

                                                            }
                                                            else if(selectedLanguage=="SWE"){
                                                                Ext.Msg.alert('', 'Fel med anslutning eller ingen kupong i denna varum\u00E4rke.', Ext.emptyFn);
                                                            }

                                                        })
                                                    });
                                                }
                                            }
                                        },
                                        //autoLoad: true,
                                        getGroupString : function(record) {
                                            return  record.get('isSponsored');
                                        },
                                        listeners: {
                                            'load': function(list) {
                                                jsonBrandStores.add(this.proxy.reader.rawData.ListOfStores);
                                                function toRad(degree)
                                                {
                                                    rad = degree* Math.PI/ 180;
                                                    return rad;
                                                }
                                                var i;
                                                for(i=0;i< this.data.items.length;i++){
                                                    var findStore = this.data.items[i].data.storeId;
                                                    var showDiatance= jsonBrandStores.findRecord("storeId" ,findStore );
                                                    var couponLat=  showDiatance.data.latitude;
                                                    var couponLng = showDiatance.data.longitude;
                                                    var currentLatitude = document.getElementById('hidCurrentLatitude').value;
                                                    var currentLongitude = document.getElementById('hidCurrentLongitude').value;
                                                    var R = 6371;
                                                    var latit1=currentLatitude;
                                                    var longi1=currentLongitude;
                                                    var latit2=couponLat;
                                                    var longi2=couponLng;
                                                    var dLatit=toRad(latit2-latit1);
                                                    var dLongi=toRad(longi2-longi1);
                                                    var a = Math.sin(dLatit/2) * Math.sin(dLatit/2) +
                                                    Math.sin(dLongi/2) * Math.sin(dLongi/2) * Math.cos(toRad(latit1)) * Math.cos(toRad(latit2));
                                                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                                                    var di = R * c;
                                                    var distance = Math.round(di*1000);

                                                    this.data.items[i].set("distanceToStore", distance);
                                                }
                                            }
                                        }
                                    }),
                                    listeners: {
                                        activate:function(){
                                            db.transaction(function (tx) {
                                                tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                    var selectedUnit =  results.rows.item(0).unitValue;
                                                    if(selectedUnit=="meter"){
                                                        Ext.getCmp('getBrandStore').itemTpl=couponListTpl;
                                                        Ext.getCmp('getBrandStore').initComponent();
                                                        Ext.getCmp('getBrandStore').refresh();
                                                    }
                                                    else if(selectedUnit=="miles"){
                                                        Ext.getCmp('getBrandStore').itemTpl=couponListForMiles;
                                                        Ext.getCmp('getBrandStore').initComponent();
                                                        Ext.getCmp('getBrandStore').refresh();
                                                   
                                                    }
                                                })
                                            });
                                        },

                                        itemtap: function(view, index, item, e){
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

                                                    var found = jsonBrandStores.findRecord("storeId", rec.data.storeId);
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
                                                            couponDeliveryType: rec.data.couponDeliveryType,
                                                            couponId: rec.data.couponId,
                                                            productInfoLink: rec.data.productInfoLink,
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
                                                    }else{

                                                        //person=Ext.ModelMgr.create({validDay:rec.limitPeriodListStore.data.items[0].data.validDay});
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
                                                        duration:500,
                                                        direction:'left'
                                                    });
                                                });
                                            });
                                        }
                                    }

                                }),],
                                listeners:{
                                    activate:function(){
                                        db.transaction(function (tx) {
                                            tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                var selectedUnit =  results.rows.item(0).unitValue;
                                                if(selectedUnit=="meter"){
                                                    Ext.getCmp('getBrandStore').itemTpl=couponListTpl;
                                                    Ext.getCmp('getBrandStore').initComponent();
                                                    Ext.getCmp('getBrandStore').refresh();
                                                }
                                                else if(selectedUnit=="miles"){
                                                    Ext.getCmp('getBrandStore').itemTpl=couponListForMiles;
                                                    Ext.getCmp('getBrandStore').initComponent();
                                                    Ext.getCmp('getBrandStore').refresh();

                                                }
                                            })
                                        })
                                    }
                                }


                            });

                            ///////////////////  main detail view ////////////////////////////////////////////////////
                            var moreCounter=0;
                   
                            var detailViewTpl = new Ext.XTemplate(
                                '<div class="brands-row">',
                                '<table width="100%"border="0" cellpadding="0" cellspacing="0">',
                                '<input type="hidden" name="hidLatitude" id="hidLatitude" value={latitude}><input type="hidden" name="hidLongitude" id="hidLongitude" value={longitude}>',
                                '<input type="hidden" name="hidstoreId" id="hidstoreId" value={storeId}>',
                                '<input type="hidden" name="hidCouponId" id="hidCouponId" value={couponId}>',
                                '<input type="hidden" name="hidDistanceToStore" id="hidDistanceToStore" value={distanceToStore}>',
                                '<input type="hidden" name="hidCouponDeliveryType" id="hidCouponDeliveryType" value={couponDeliveryType}>',
                                '<input type="hidden" name="hidEndOfPublishing" id="hidEndOfPublishing" value="{endOfPublishing}">',
                                '<input type="hidden" name="hidOfferTitle" id="hidOfferTitle" value="{offerTitle}">',
                                '<input type="hidden" name="hidOfferType" id="hidOfferType" value="{offerType}">',
                                '<input type="hidden" name="hidLargeImage" id="hidLargeImage" value={largeImage}>',
                                '<input type="hidden" name="hidLargeImage" id="hidSmallImage" value={smallImage}>',
                                '<input type="hidden" name="hidStoreName" id="hidStoreName" value="{storeName}">',
                                '<input type="hidden" name="hidValidDay" id="hidValidDay" value="{validDay}">',
                                '<input type="hidden" name="hidStreet" id="hidStreet" value="{street}">',
                                '<input type="hidden" name="hidCity" id="hidCity" value="{city}">',
                                '<input type="hidden" name="hidStartTime" id="hidStartTime" value="{startTime}">',
                                '<input type="hidden" name="hidEndTime" id="hidEndTime" value="{endTime}">',
                                '<input type="hidden" name="hidOfferSlogan" id="hidOfferSlogan" value="{offerSlogan}">',
                                '<input type="hidden" name="hidDistanceToStore" id="hidDistanceToStore" value={distanceToStore}>',
                                '<tr>',
                                '<td colspan="2" align:"center"><div class="larg-image"><table class="tableImage" align="center"><tr><td><img class="mainimage" src="{largeImage}"/></td></tr></table></div></td>',
                                '</tr>',
                                '<tr>',
                                '<td colspan="2"valign="top"><div class="td-h1" id="offerSlogan">{offerTitle}</div></td>',
                                '</tr>',
                                '<tr>',
                                '<td colspan="2"valign="top"><div class="td-h2">{offerSlogan}</div></td>',
                                '</tr>',
                                '</table>',
                                '</div>',
                                '<div position:relative;"><div class="bot_txt">',
                                '<table width="100%" border="0" cellpadding="0" cellspacing="0">',
                                '<tr>',
                                '<td width="170" align="left"valign="top"><div class="td-h3">{storeName}</div></td>',
                                '<td align="left"valign="top"><div class="td-h4">{validDay}</div></td>',
                                '</tr>',
                                '<tr>',
                                '<td width="170" align="left"valign="top"><div class="td-h3">{street},{city}</div></td>',
                                '<td align="left"valign="top"><div class="td-h4" id="validFrom">{startTime}{endTime}  {endOfPublishing}</div></td>',
                                '</tr>',
                                '</table>',
                                '</div></div>',
                                '<div id="theTime" class="timeBase" style="display:none"></div>',
                                '<div id="advertise" class="advertise-text" style="display:none"></div>'
                                );
                            //                    var distance = 540
                            //                    function deal(){
                            //                        if(distance > 500){
                            //                            Ext.Msg.alert('', 'Sorry! You must be closer to the Point of Sale to be able to activate the deal', Ext.emptyFn);
                            //                        }
                            //                    }
                            var detailViewPanel = new Ext.Panel({
                                cls:'backImage',
                                id:'detailViewPanel',
                                fullscreen : true,
                                tpl:detailViewTpl,
                                dockedItems: [
                                {
                                    xtype: 'toolbar',
                                    title: "<span class= 'logo'><img src='https://s3-eu-west-1.amazonaws.com/webclient/more/logo.jpg' width='90' height='41' align= 'center' ></span>",
                                    ui:'charcoal',
                                    items: [{
                                        text: 'Back',
                                        ui: 'back',
                                        id:'detailBack',
                                        handler: function() {
                                            if(moreCounter){
                                                moreCounter=0;
                                                Ext.getCmp('Viewport').setActiveItem('moreDealsPanel');
                                            }else{

                                                var tab = Ext.getCmp('tabpanel');
                                                var activeTab = tab.getActiveItem();
                                                var backItem=(tab.items.findIndex('id', activeTab.id));
                                                if (backItem==0){
                                                    Ext.getCmp('Viewport').setActiveItem('newCampain' ,{
                                                        type:'slide',
                                                        duration:500,
                                                        direction:'right'
                                                    });
                                                }
                                                else if(backItem==1){
                                                    Ext.getCmp('Viewport').setActiveItem('Panel' ,{
                                                        type:'slide',
                                                        duration:500,
                                                        direction:'right'
                                                    });
                                                }
                                                else if(backItem==2){
                                                    Ext.getCmp('Viewport').setActiveItem('brandListPanel' ,{
                                                        type:'slide',
                                                        duration:500,
                                                        direction:'right'
                                                    });
                                                }
                                                else if(backItem==3){
                                                    addFavorites();
                                                    var loadFav =Ext.getCmp('favotites').getStore();
                                                    loadFav.load();
                                                    favEditLang();
                                                    Ext.getCmp('Viewport').setActiveItem('tabpanel' ,{
                                                        type:'slide',
                                                        duration:500,
                                                        direction:'right'
                                                    });
                                                }
                                            }
                                        }

                                    },{
                                        xtype: 'spacer'
                                    },

                                    {
                                        ui: 'forward',
                                        text: 'Map',
                                        id:'distanceMap',
                                        handler:function(){
                                            Ext.getCmp('Viewport').setActiveItem('detailViewMapPanel' ,{
                                                type:'slide',
                                                duration:500,
                                                direction:'left'
                                            });
                                        }

                                    }
                                    ]
                                },{
                                    xtype: 'toolbar',
                                    dock : 'bottom',
                                    ui:'charcoal',

                                    layout: {
                                        pack: 'center'
                                    },
                                    items: [
                                    {
                                        text:'',
                                        cls:'btnAction',
                                        handler:function(){
                                            var offerTitle  =  document.getElementById('hidOfferTitle').value;
                                            var offerSlogan  =  document.getElementById('hidOfferSlogan').value;
                                            var largeImage  =  document.getElementById('hidLargeImage').value;
                                            FB.ui(
                                            {
                                                method: 'feed',
                                                caption: offerTitle,
                                                description: (
                                                    offerSlogan
                                                    ),
                                                picture: largeImage
                                            });
                                        }
                                    }
                                    ,{
                                        text:'More info',
                                        ui:'toolButton',
                                        id:'mofeInfoButton',
                                        handler: function(){
                                            Ext.getCmp('Viewport').setActiveItem('infoPanel',{
                                                type:'slide',
                                                direction:'left',
                                                duration:500
                                            })
                                        }
                                    },
                                    {
                                        text: 'Favorite',
                                        ui:'toolButton',
                                        id:'favoriteButton',
                                        handler:function(){

                                            db.transaction(function (tx) {
                                                tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                    var selectedLanguage =  results.rows.item(0).languageValue;
                                                    if(selectedLanguage=="ENG"){
                                                        favAlert="Do you want to add this deal to your favorites!";
                                                        favAlertLang();
                                                    }
                                                    else if(selectedLanguage=="SWE"){
                                                        favAlert="Vill du l\u00E4gga till den h\u00E4r aff\u00E4ren i dina favoriter!";
                                                        favAlertLang();
                                                    }

                                                })
                                            });
                                            function favAlertLang(){
                                                Ext.Msg.show({
                                                    title:    '',
                                                    msg:      favAlert,
                                                    buttons:  Ext.MessageBox.OKCANCEL,
                                                    fn: function(btn) {
                                                        if( btn == 'ok') {
                                                            db.transaction(function (tx) {
							   
                                                                var id		 =  guidGenerator();
                                                                var latitude  =  document.getElementById('hidLatitude').value;
                                                                var longitude =  document.getElementById('hidLongitude').value;
                                                                var storeId   =  document.getElementById('hidstoreId').value;
                                                                var couponId  =  document.getElementById('hidCouponId').value;
                                                                couponType   =  document.getElementById('hidCouponDeliveryType').value;
                                                                var offerTitle  =  document.getElementById('hidOfferTitle').value;
                                                                var endOfPublishing  =  document.getElementById('hidEndOfPublishing').value;
                                                                var largeImage  =  document.getElementById('hidLargeImage').value;
                                                                var dis =  document.getElementById('hidDistanceToStore').value;
                                                                var smallImage  =  document.getElementById('hidSmallImage').value;
                                                                var storeName  =  document.getElementById('hidStoreName').value;
                                                                var validDay  =  document.getElementById('hidValidDay').value;
                                                                var street  =  document.getElementById('hidStreet').value;
                                                                var city  =  document.getElementById('hidCity').value;
                                                                var startTime  =  document.getElementById('hidStartTime').value;
                                                                var endTime  =  document.getElementById('hidEndTime').value;
                                                                var offerSlogan  =  document.getElementById('hidOfferSlogan').value;
                                                                var offerType  =  document.getElementById('hidOfferType').value;
                                                                var d          = new Date();
                                                                var curr_date  = d.getDate();
                                                                var curr_month = d.getMonth();
                                                                var curr_year  = d.getFullYear();
                                                                var formattedDate = curr_year+"-"+curr_month+'-'+curr_date;
                                                                tx.executeSql("SELECT * FROM FAVORITES WHERE couponId = "+"'"+couponId+"'"+";", [],function(transaction, results){
                                                                    var   numberOfRecord = results.rows.length;
                                                                    if(numberOfRecord==0 && endOfPublishing >=formattedDate){
                                                                        var query = "INSERT INTO FAVORITES (id,smallImage,largeImage,latitude,longitude,storeId,couponId,endOfPublishing,offerTitle,distance,couponType,storeName,validDay,street,city,startTime,endTime,offerSlogan,offerType) VALUES ("+"'"+id+"'"+","+"'"+smallImage+"'"+","+"'"+largeImage+"'"+","+"'"+latitude+"'"+","+"'"+longitude+"'"+","+"'"+storeId+"'"+","+"'"+couponId+"'"+","+"'"+endOfPublishing+"'"+","+"'"+escape(offerTitle)+"'"+","+"'"+dis+"'"+","+"'"+couponType+"'"+","+"'"+storeName+"'"+","+"'"+validDay+"'"+","+"'"+street+"'"+","+"'"+city+"'"+","+"'"+startTime+"'"+","+"'"+endTime+"'"+","+"'"+escape(offerSlogan)+"'"+","+"'"+offerType+"'"+")";
                                                                        tx.executeSql(query);
                                                                    }
                                                                })
                                                    

                                                            });
                                                


                                                        }
                                                    }
                                                });
                                            }
                                        }

                                    },{
                                        text:'More deals',
                                        ui:'toolButton',
                                        id:'moreDealsButton',
                                        handler:function(){
                                            var as = Ext.getCmp('moreCoupons').getStore();
                                            var getHotCoupons=Ext.getCmp('hotDeals').getStore();
                                            as.removeAll();
                                            as.add(getHotCoupons.data.items);
                                            jsonMoreDealListStore.loadData(jsonHotDealListStore.data.items);

                                            more_CouponStoreId   =  document.getElementById('hidstoreId').value;
                                            var ty =as.filterBy(function(record){
                                                var fieldData = record.data.storeId.toLowerCase().indexOf(more_CouponStoreId);
                                                if (fieldData > -1 )
                                                    return record;

                                            });
                                            Ext.getCmp('Viewport').setActiveItem('moreDealsPanel',{
                                                type:'slide',
                                                duration:500,
                                                direction:'down'
                                            })
                                        }

                                    }
                                    ]
                                }
                                ],
                                listeners:{
                                    activate : function(panel){
                                        button1 = useDealButton;
                                        button2 = distanceButton;
                                        autoRefresh(button1,button2);
                                        setInterval('autoRefresh(button1,button2)', 10000);
                                    }
                                }
            
                            });

                            ///////////////////////////  detail view end /////////////////////////////////////////////////


                            ////////////////////  More info Panel  //////////////////////////////////////////////

                            var productInfoTemplate = new Ext.XTemplate(
                                '<tpl for=".">',
                                '<div class="padding">',
                                '</div>',
                                '<div class="more_info-b">',
                                '<ul style="margin-right:50px;">',
                                '<li><span >Product discription:</span><a class="dataLink" href="{productInfoLink}">{productInfoLink}</a></li>',
                                '</ul>',
                                '</div>',
                                '</tpl>'
                                );
                            var infoPanelTemplate = new Ext.XTemplate(
                                '<tpl for=".">',
                                '<div class="more_info-b2">',
                                '<ul>',
                                '<li class="more_info-b3"><span class="dataText">Store Information:</span>{storeName}</li>',
                                '<li class="more_info-b3"><span class="dataText">Company name:</span></li>',
                                '<li class="more_info-b3"><span class="dataText">Address:</span>{street},{city},{country}</li>',
                                '<li class="more_info-b3"><span class="dataText">Phone number:</span>{phone}</li>',
                                '<li class="more_info-b3"><span class="dataText">E-mail:</span>{email}</li>',
                                '<li class="more_info-b3"><span class="dataText">Company home page:</span><span class="dataLink"><a href="{homePage}">{homePage}</a></span></li>',
                                '</ul>',
                                '</div>',
                                '</tpl>'
                                );
                            var infoPanel = new Ext.Panel({
                                id:'infoPanel',
                                cls:'backImage',
                                tpl:productInfoTemplate,
                                frame:true,
                                layout:'fit',
                                items:[
                                new Ext.DataView({
                                    id:'dataStore',
                                    tpl:infoPanelTemplate,
                                    itemSelector:'div.item',
                                    fullscreen: true,
                                    // cls:'dataView',
                                    store: new Ext.data.Store({
                                        model: "Stores",
                                        proxy: {
                                            type: 'memory',
                                            //url: 'json/categories.json',
                                            reader: {
                                                type: 'json',
                                                root: 'listOfCategories'
                                            }
                                        },
                                        autoLoad: true,
                                        listeners: {
                                            'load': function(list) {

                                            }
                                        }
                                    })


                                })],
                                dockedItems: [
                                {
                                    xtype: 'toolbar',
                                    title: "<span class= 'logo'><img src='https://s3-eu-west-1.amazonaws.com/webclient/more/logo.jpg' width='90' height='41' align= 'center' ></span>",
                                    ui:'charcoal',
                                    items: [{
                                        text: 'Back',
                                        id:'infoBack',
                                        ui: 'back',
                                        handler: function() {
                                            Ext.getCmp('Viewport').setActiveItem('detailViewPanel', {
                                                type:'slide',
                                                duration:500,
                                                direction:'down'
                                            });
                                        }

                                    },{
                                        xtype: 'spacer'
                                    },


                                    ]
                                },{
                                    xtype: 'toolbar',
                                    dock : 'bottom',
                                    ui:'charcoal',

                                    layout: {
                                        pack: 'center'
                                    },
                                    items: [
                                    {
                                        text:'',
                                        cls:'btnAction',
                                        handler:function(){
                                            var offerTitle  =  document.getElementById('hidOfferTitle').value;
                                            var offerSlogan  =  document.getElementById('hidOfferSlogan').value;
                                            var largeImage  =  document.getElementById('hidLargeImage').value;
                                            FB.ui(
                                            {
                                                method: 'feed',
                                                caption: offerTitle,
                                                description: (
                                                    offerSlogan
                                                    ),
                                                picture: largeImage
                                            });
                                        }
                                    }
                                    ,{
                                        text:'More info',
                                        id:'infoButton',
                                        ui:'toolButton',
                                        handler: function(){
                                            Ext.getCmp('Viewport').setActiveItem('infoPanel',{
                                                type:'slide',
                                                duration:500,
                                                direction:'down'
                                            })
                                        }

                                    },
                                    {
                                        text: 'Favorite',
                                        ui:'toolButton',
                                        id:'infoFav',
                                        handler:function(){
                                            db.transaction(function (tx) {
                                                tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                    var selectedLanguage =  results.rows.item(0).languageValue;
                                                    if(selectedLanguage=="ENG"){
                                                        favAlert="Do you want to add this deal to your favorites!";
                                                        favAlertLang();
                                                    }
                                                    else if(selectedLanguage=="SWE"){
                                                        favAlert="Vill du l\u00E4gga till den h\u00E4r aff\u00E4ren i dina favoriter!";
                                                        favAlertLang();
                                                    }

                                                })
                                            });
                                            function favAlertLang(){
                                                Ext.Msg.show({
                                                    title:    '',
                                                    msg:      favAlert,
                                                    buttons:  Ext.MessageBox.OKCANCEL,
                                                    fn: function(btn) {
                                                        if( btn == 'ok') {
                                                            db.transaction(function (tx) {

                                                                var id		 =  guidGenerator();
                                                                var latitude  =  document.getElementById('hidLatitude').value;
                                                                var longitude =  document.getElementById('hidLongitude').value;
                                                                var storeId   =  document.getElementById('hidstoreId').value;
                                                                var couponId  =  document.getElementById('hidCouponId').value;
                                                                couponType   =  document.getElementById('hidCouponDeliveryType').value;
                                                                var offerTitle  =  document.getElementById('hidOfferTitle').value;
                                                                var endOfPublishing  =  document.getElementById('hidEndOfPublishing').value;
                                                                var largeImage  =  document.getElementById('hidLargeImage').value;
                                                                var dis =  document.getElementById('hidDistanceToStore').value;
                                                                var smallImage  =  document.getElementById('hidSmallImage').value;
                                                                var storeName  =  document.getElementById('hidStoreName').value;
                                                                var validDay  =  document.getElementById('hidValidDay').value;
                                                                var street  =  document.getElementById('hidStreet').value;
                                                                var city  =  document.getElementById('hidCity').value;
                                                                var startTime  =  document.getElementById('hidStartTime').value;
                                                                var endTime  =  document.getElementById('hidEndTime').value;
                                                                var offerSlogan  =  document.getElementById('hidOfferSlogan').value;
                                                                var offerType  =  document.getElementById('hidOfferType').value;
                                                                var d          = new Date();
                                                                var curr_date  = d.getDate();
                                                                var curr_month = d.getMonth();
                                                                var curr_year  = d.getFullYear();
                                                                var formattedDate = curr_year+"-"+curr_month+'-'+curr_date;
                                                                tx.executeSql("SELECT * FROM FAVORITES WHERE couponId = "+"'"+couponId+"'"+";", [],function(transaction, results){
                                                                    var   numberOfRecord = results.rows.length;
                                                                    if(numberOfRecord==0 && endOfPublishing >=formattedDate){
                                                                        var query = "INSERT INTO FAVORITES (id,smallImage,largeImage,latitude,longitude,storeId,couponId,endOfPublishing,offerTitle,distance,couponType,storeName,validDay,street,city,startTime,endTime,offerSlogan,offerType) VALUES ("+"'"+id+"'"+","+"'"+smallImage+"'"+","+"'"+largeImage+"'"+","+"'"+latitude+"'"+","+"'"+longitude+"'"+","+"'"+storeId+"'"+","+"'"+couponId+"'"+","+"'"+endOfPublishing+"'"+","+"'"+escape(offerTitle)+"'"+","+"'"+dis+"'"+","+"'"+couponType+"'"+","+"'"+storeName+"'"+","+"'"+validDay+"'"+","+"'"+street+"'"+","+"'"+city+"'"+","+"'"+startTime+"'"+","+"'"+endTime+"'"+","+"'"+escape(offerSlogan)+"'"+","+"'"+offerType+"'"+")";
                                                                        tx.executeSql(query);
                                                                    }
                                                                })


                                                            });



                                                        }
                                                    }
                                                });
                                            }
                                        }

                                    },{
                                        text:'More deals',
                                        id:'infoDeals',
                                        ui:'toolButton',
                                        handler: function(){
                                            var as = Ext.getCmp('moreCoupons').getStore();
                                            var getHotCoupons=Ext.getCmp('hotDeals').getStore();
                                            as.removeAll();
                                            as.add(getHotCoupons.data.items);
                                            jsonMoreDealListStore.loadData(getHotCoupons.proxy.reader.rawData.ListOfStores);

                                            more_CouponStoreId   =  document.getElementById('hidstoreId').value;
                                            var ty =as.filterBy(function(record){
                                                var fieldData = record.data.storeId.toLowerCase().indexOf(more_CouponStoreId);
                                                if (fieldData > -1 )
                                                    return record;

                                            });
                                            Ext.getCmp('Viewport').setActiveItem('moreDealsPanel',{
                                                type:'slide',
                                                duration:500,
                                                direction:'down'
                                            });
                                        }

                                    }
                                    ]
                                }
                                ],
                                listeners:{
                                    activate:function(){
                                        Ext.getCmp('dataStore').addCls('dataViewStyle');
                                        couponStoreId   =  document.getElementById('hidstoreId').value;
                                        var findstore=Ext.getCmp('infoPanel').items.items[0].getStore();
                                        findstore.removeAll();
                                        var findInfo =jsonHotDealListStore.findRecord("storeId", couponStoreId);
                                        if(findInfo==null){
                                            var catRec =jsonCategorieStores.findRecord("storeId", couponStoreId);
                                            if(catRec==null){
                                                var brandRec = jsonBrandStores.findRecord("storeId", couponStoreId);
                                                if(brandRec==null){

                                                }else{
                                                    findstore.add(brandRec);
                                                }
                                            }else{
                                                findstore.add(catRec);
                                            }
                                        }else{
                                            findstore.add(findInfo);
                                        }
                                        infoPanel.doComponentLayout();
                                    }
                                }
                            });
    

                            //////////////////////// More deals panel//////////////////////////////////////

                            var moreDealsPanel = new Ext.Panel({
                                id:'moreDealsPanel',
                                fullscreen: true,
                                cardSwitchAnimation: {
                                    type: 'slide',
                                    cover: true
                                },

                                defaults: {
                                    scroll: 'vertical'
                                },
                                items:[new Ext.List({
                                    fullscreen:true,
                                    id:'moreCoupons',
                                    itemTpl :couponListTpl,
                                    cls:'myList',
                                    grouped :true,
                                    store: new Ext.data.Store({
                                        model: "moreDealsCoupon",
                                        clearOnPageLoad: false,
                                        proxy: {
                                            type: 'memory',
                                            //url: getCouponsURL,
                                            reader: {
                                                type: 'json',
                                                root: 'ListOfCoupons'
                                            }
                                        },
                                        autoLoad: true,
                                        getGroupString : function(record) {
                                            return  record.get('isSponsored');
                                        },
                                        listeners: {
                                            'load': function(list) {
                                      
                                            //jsonMoreDealListStore.loadData(this.proxy.reader.rawData.ListOfStores);
                                       
                                            }
                                        }
                                    }),
                                    listeners:{
                                        itemtap: function(view, index, item, e){
                                            moreCounter=1;
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
                                                    var getCoupon=baseURL+'getCoupon?apiVersion=2&couponId='+getCouponsId+'&lang='+userLanguage+'&token=cumba4now'

                                                    var found = jsonMoreDealListStore.findRecord("storeId", rec.data.storeId);

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
                                                            couponId: rec.data.couponId,
                                                            productInfoLink: rec.data.productInfoLink,
                                                            couponDeliveryType: rec.data.couponDeliveryType,
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
                                                    }else{

                                                        var custom = Ext.ModelMgr.create({
                                                            id: 1,
                                                            validDay:"Valid"+" "+rec.limitPeriodListStore.data.items[0].data.validDay,
                                                            startTime:rec.limitPeriodListStore.data.items[0].data.startTime+' '+'-',
                                                            endTime:rec.limitPeriodListStore.data.items[0].data.endTime,
                                                            storeId: rec.data.storeId,
                                                            smallImage: rec.data.smallImage,
                                                            largeImage: rec.data.largeImage,
                                                            productInfoLink: rec.data.productInfoLink,
                                                            couponId: rec.data.couponId,
                                                            couponDeliveryType: rec.data.couponDeliveryType,
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
                                })
                                ],
                                dockedItems: [
                                {
                                    dock : 'top',
                                    xtype: 'toolbar',
                                    id:'moreDealHeader',
                                    title: 'More deals',
                                    ui:'charcoal',
                                    cls:'headText',
                                    items:[{
                                        xtype:'button',
                                        ui:'back',
                                        id:'morePanelBack',
                                        text:'Back',
                                        handler:function(){
                                            Ext.getCmp('Viewport').setActiveItem('detailViewPanel',{
                                                type:'slide',
                                                direction:'right',
                                                duration:500
                                           
                                            })
                                        }

                                    }]
                                },

                                ]
                            });

                            ///////////////////  About Panel  //////////////////////////////////////////

                            var aboutPanel = new Ext.Panel({
                                id: 'aboutPanel',
                                cls:'backImage',
                                html:"<div style='height:8px;'></div><div class='about_bg'><table width='100%' border='0' cellpadding='0' cellspacing='0'><tr><td><img src='https://s3-eu-west-1.amazonaws.com/webclient/images/spacer.gif' width='1' height='37'align= 'left'></td><td width='100%' align='left' valign='middle' class='about'>Cumbari is driven by curiosity and guided by insights from countless mistakes and successes in the telecom and computer business. The core team of Cumbari has been working with most aspects of IP and electronic services since the 80s.</td></tr><tr><td><img src='https://s3-eu-west-1.amazonaws.com/webclient/images/spacer.gif' width='1' height='37'align= 'left'></td><td align='left' valign='middle' class='about'><img src='https://s3-eu-west-1.amazonaws.com/webclient/images/about_bot-logo.jpg' width='230' height='112'align= 'right'></td></tr></table></div>",
                                dockedItems: [
                                {
                                    xtype: 'toolbar',
                                    ui:'charcoal',
                                    title:'About',
                                    cls:'headText',
                                    id:'aboutTitle',
                                    items: [{
                                        text: 'Back',
                                        ui: 'back',
                                        id:'aboutBack',
                                        handler: function() {
                                            Ext.getCmp('Viewport').setActiveItem('tabpanel', {
                                                type:'slide',
                                                direction:'right',
                                                duration:500
                                            });
                                        }

                                    }]
                                }
                                ]
                            });

                            /////////////////////// Feedback Panel//////////////////////////////////////////////////////
                            Ext.regModel('User', {
                                fields: [{
                                    name: 'email',
                                    type: 'string'
                                }],
                                validations: [{
                                    type: 'format',
                                    name: 'email',
                                    matcher: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
                            
                                }]
                            });
                            var feedbackPanel = new Ext.Panel({
                                id: 'feedbackPanel',
                                cls:'backImage',
                                items:[{
                                    xtype:'formpanel',
                                    id:'emailForm',

                                    items:[{
                                        xtype:'emailfield',
                                        label:'From',
                                        id:'email',
                                        name:'email'

                                    },
                                    new  Ext.form.TextArea({
                                        label:'Message',
                                        id:'message'
                                    })
                                    ,{
                                        xtype:'button',
                                        text:'Submit',
                                        ui:'myUseButton',
                                        id:'submitButton',
                                        cls:'submitButton',
                                        handler:function(){
                                            var form =Ext.getCmp('emailForm');
                                            var getMessage =Ext.getCmp('message').getValue();
                                            var getEmail =Ext.getCmp('email').getValue();
                                            var users = Ext.ModelMgr.create({
                                                'email'   : getEmail
                                            }, 'User');
                                            form.loadModel(users);
                                            var model = Ext.ModelMgr.create(form.getValues(),'User');

                                            var errors = model.validate(),message = "";
                                            if(errors.isValid()){

                                                if(users){
                                                    form.updateRecord(users, true);
                                                    Ext.Ajax.request({
                                                        url: 'senchaEmail.php?from='+getEmail+'&message='+getMessage,
                                                        method: "GET",
                                                        success: function(response, opts) {
                                                            Ext.Msg.alert("",response.responseText, function(){});
                                                            return false;
                                                        }
                                                    });
                                                }
                                            }else {
                                                Ext.each(errors.items,function(rec,i){
                                            
                                                    });
                                                db.transaction(function (tx) {
                                                    tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                        var selectedLanguage =  results.rows.item(0).languageValue;

                                                        if(selectedLanguage=="ENG"){
                                                            message="Please enter a valid email.";
                                                            Ext.Msg.alert("", message, function(){});
                                                            return false;
                                                        }
                                                        else if(selectedLanguage=="SWE"){
                                                            message="Ange en giltig e-postadress.";
                                                            Ext.Msg.alert("", message, function(){});
                                                            return false;
                                                        }
                                                    })
                                                })
                                       
                                            }
                                    

                                        }
                                    }]
                                }],
                                listeners:{
                                    beforeactivate :function(){
                                        db.transaction(function (tx) {
                                            tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                var selectedLanguage =  results.rows.item(0).languageValue;
                                                if(selectedLanguage=="ENG"){
                                                    Ext.getCmp('emailForm').el.dom.children(0).children(0).children(0).innerHTML='From';
                                                    Ext.getCmp('emailForm').el.dom.children(0).children(1).children(0).innerHTML='Message';

                                                }
                                                else if(selectedLanguage=="SWE"){
                                                    Ext.getCmp('emailForm').el.dom.children(0).children(0).children(0).innerHTML='Fr\u00E5n';
                                                    Ext.getCmp('emailForm').el.dom.children(0).children(1).children(0).innerHTML='Meddelande';

                                                }
                                            })
                                        })
                                    }
                                },
                                dockedItems: [
                                {
                                    xtype: 'toolbar',
                                    title:'Feedback',
                                    cls:'headText',
                                    id:'feeTitle',
                                    ui:'charcoal',
                                    items: [{
                                        text: 'Back',
                                        ui: 'back',
                                        id:'feeButton',
                                        handler: function() {
                                            Ext.getCmp('Viewport').setActiveItem('tabpanel', {
                                                type:'slide',
                                                duration:500,
                                                direction:'right'
                                            });
                                        }

                                    }]
                                }
                                ]
                            });

                            /////////////////////////////   Position Panel  ////////////////////////////////////////////


                            var curPos = setCurrentPosition;
                            var newPos = setNewPosition;
		
                            var changePositionPanel=  new Ext.Panel({
                                fullscreen : true,
                                id:'changePositionPanel',
                                cls: 'backImage',
                                items: [{
                                    xtype: 'fieldset',
                                    cls:'myForm-loding',
                                    defaults: {
                                        xtype: 'radiofield'

                                    },
                                    items: [
                                    {
                                        name : 'Current',
                                        label: 'Current',
                                        checked : curPos,
                                        id      : 'currentPosition',
                                        value   : 'CUR',
                                        listeners:{
                                            check:function(){
                                                db.transaction(function (tx) {
                                                    var positionUpdateQuery = "UPDATE TEMP_SETTING SET latitude= "+"'"+getCurrentLatitude+"'"+" ,longitude = "+"'"+getCurrentLongitude+"'";
                                                    tx.executeSql(positionUpdateQuery);

                                                    var id		 =  guidGenerator();
                                                    var curValue = Ext.getCmp('currentPosition').getValue();
                                                    tx.executeSql('SELECT * FROM POSITION', [], function (tx, results) {
                                                        var len = results.rows.length;
                                                        if(len==0)
                                                        {
                                                            var insertQuery = "INSERT INTO POSITION (id, positionValue) VALUES ("+"'"+id+"'"+","+"'"+curValue+"'"+")";
                                                            tx.executeSql(insertQuery);
                                                        }
                                                        else{
                                                            var insertedId =  results.rows.item(0).id;
                                                            var updateQuery = "UPDATE POSITION SET positionValue = " +"'"+curValue+"'"+" WHERE id = "+"'"+insertedId+"'"+"";
                                                            tx.executeSql(updateQuery);

                                                        }
                                                    });
                                                });
                                            }
                                        }
                    
                                    },
                                    {
                                        name : 'Current',
                                        label: 'New' ,
                                        id:'newPosition',
                                        checked : newPos,
                                        value : 'NEW',
                                        listeners:{
                                            check:function(){
                                                db.transaction(function (tx) {
                                                    var id		 =  guidGenerator();
                                                    var curValue = Ext.getCmp('newPosition').getValue();
                                                    tx.executeSql('SELECT * FROM POSITION', [], function (tx, results) {
                                                        var len = results.rows.length;
                                                        if(len==0)
                                                        {
                                                            var insertQuery = "INSERT INTO POSITION (id, positionValue) VALUES ("+"'"+id+"'"+","+"'"+curValue+"'"+")";
                                                            tx.executeSql(insertQuery);
                                                        }
                                                        else{
                                                            var insertedId =  results.rows.item(0).id;
                                                            var updateQuery = "UPDATE POSITION SET positionValue = " +"'"+curValue+"'"+" WHERE id = "+"'"+insertedId+"'"+"";
                                                            tx.executeSql(updateQuery);

                                                        }
                                                    });
                                                });




                                            }
                                        }
                                    }]
                                }],
                                dockedItems:[{
                                    xtype: 'toolbar',
                                    dock : 'top',
                                    ui:'charcoal',
                                    title:"<span class= 'logo'><img src='https://s3-eu-west-1.amazonaws.com/webclient/more/logo.jpg' width='90' height='41' align= 'center' ></span>",
                                    items: [{
                                        text: 'Back',
                                        ui:'back',
                                        id:'posBack',
                                        handler: function() {
                                            var getMoreList=Ext.getCmp('moreList').getStore();
                                            var getPos=getMoreList.data.items[0];
                                            db.transaction(function (tx) {
                                                tx.executeSql('SELECT * FROM POSITION', [], function (tx, results) {
                                                    var selectedPos =  results.rows.item(0).positionValue;
                                                    if(selectedPos=="CUR"){
                                                        getPos.set('selectValue',"Current");
                                                    }else if(selectedPos=="NEW"){
                                                        getPos.set('selectValue',"New");
                                                    }
                                                });
                                            });
                                            db.transaction(function (tx) {
                                                tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                    var storeLanguage =  results.rows.item(0).languageValue;
                                                    var storeUnit    =  results.rows.item(0).unitValue;
                                                    var offerValue =  results.rows.item(0).offersValue;
                                                    var rangeValue    =  results.rows.item(0).rangeValue;
                                                    var storeLatitude    =  results.rows.item(0).latitude;
                                                    var storeLongitude    =  results.rows.item(0).longitude;
                                                    var getCoupon =Ext.getCmp('hotDeals').getStore();
                                                    getCoupon.proxy.url= baseURL+'getCoupons?apiVersion=2&token=cumba4now&longitude='+storeLongitude+'&latitude='+storeLatitude+'&clientId='+userClientId+'&lang='+storeLanguage+'&batchNo=1&maxNo=200&radiousInMeter='+rangeValue;
                                                    getCoupon.load();
                                                    var getMoreCoupons=Ext.getCmp('moreCoupons').getStore();
                                                    getMoreCoupons.proxy.url= baseURL+'getCoupons?apiVersion=2&token=cumba4now&longitude='+storeLongitude+'&latitude='+storeLatitude+'&clientId='+userClientId+'&lang='+storeLanguage+'&batchNo=1&maxNo=200&radiousInMeter='+rangeValue;
                                                    getMoreCoupons.load();
                                            
                                                    var catStoreURL=Ext.getCmp('categories').getStore();
                                                    catStoreURL.proxy.url=baseURL+'getCategories?apiVersion=1&token=cumba4now&categoriesVersion=1&lang='+storeLanguage;
                                                    catStoreURL.load();
                                                
                                                })
                                            })


                                            Ext.getCmp('Viewport').setActiveItem('tabpanel', {
                                                type:'slide',
                                                direction:'right',
                                                duration:500
                                            });
                                        }
                                    }]
                                }],
                                listeners:{
                                    el: {
                                        tap: function(ctl) {
                                            if(ctl.target.value=="NEW"){
                                                Ext.getCmp('Viewport').setActiveItem(searchMapPanel(),{
                                                    type:'slide',
                                                    direction:'right',
                                                    duration:500
                                                });
                                                Ext.getCmp('newPosition').setChecked(true);
                                            }
                                            else if(ctl.target.value=="CUR"){

                                        }
                                        }

                                    }
                                }
                            });
        
                            ///////////////  current location map Panel////////////////////////////////////

                            function searchMapPanel(){
                                var searchMapPanel = new Ext.Panel({
                                    id:'searchMapPanel',
                                    layout: 'card',
                                    cardSwitchAnimation: 'slide',
                                    dockedItems:[{
                                        xtype:'toolbar',
                                        //title:"<span class= 'logo'><img src='more/logo.jpg' width='90' height='41' align= 'center' ></span>",
                                        ui:'charcoal',
                                        dock:'top',
                                        items:[{
                                            text:'Back',
                                            ui:'back',
                                            id:'searchBack',
                                            handler:function(){

                                                db.transaction(function (tx) {
                                                    tx.executeSql('SELECT * FROM NEW_POSITION', [], function (tx, results) {
                                                        var len = results.rows.length;
                                                        if(len != 0)
                                                        {
                                                            var setLatitute = results.rows.item(0).latitude;
                                                            var setLongitude = results.rows.item(0).longitude;
                                                            var updateQueryPosition = "UPDATE TEMP_SETTING SET latitude = " +"'"+setLatitute+"'"+" , longitude = " +"'"+setLongitude+"'"+"";
                                                            tx.executeSql(updateQueryPosition);
                                                        }
                                                    })
                                                })


                                                var viewPort = Ext.getCmp('Viewport');
                                                var activeItem = viewPort.getActiveItem();
                                                viewPort.remove(activeItem);
                                                viewPort.setActiveItem('changePositionPanel');
                                            }
                                        },{
                                            xtype:'spacer'

                                        }, new Ext.SegmentedButton({

                                            items: [
                                            {
                                                text: 'Search',
                                                pressed: true

                                            },
                                            {
                                                text:'Tap On Map'


                                            }],
                                            listeners: {
                                                toggle: function(container, button, pressed){
                                                    //console.log("User toggled the '" + button.text + "' button: " + (pressed ? 'on' : 'off'));

                                                    var segment = button.text+pressed ;
                                                    if(segment=="Searchtrue"){
                                                        Ext.getCmp('searchToolbar').show();
                                                        searchMapPanel.removeAll(true);
                                                        searchMapPanel.add(searchMap());
                                                    //searchMapPanel.setactiveItem('Smap');

                                                    //                                           var Smap=Ext.getCmp('Smap');
                                                    //
                                                    //                                            searchMapPanel.add(Smap);



                                                    }else if(segment=="Tap On Maptrue"){
                                                        Ext.getCmp('searchToolbar').hide();
                                                        searchMapPanel.removeAll(true);
                                                        searchMapPanel.add(mapTap());
                                                    //searchMapPanel.setactiveItem('mapTap');
                                                    //                                             var Tmap=Ext.getCmp('mapTap');
                                                    //                                            searchMapPanel.add(Tmap);
                                                    }
                                                }
                                            }
                                        })
                                        ]
                                    },{
                                        xtype:'toolbar',
                                        dock:'top',
                                        ui:'search',
                                        id:'searchToolbar',
                                        items:[{
                                            xtype:'searchfield',
                                            id:'searchfields',
                                            width:'95%',
                                            value : 'Search Position',
                                            listeners: {
                                                focus: function(){
                                                    Ext.getCmp('searchfields').setValue('');
                                                },
                                                blur: function(){
                                                    if( Ext.getCmp('searchfields').getValue()=='' ){
                                                        Ext.getCmp('searchfields').setValue('Search Position');
                                                    }
                                                },
                                                action : function(e){
                                                    var we=  Ext.getCmp('searchfields').getValue();
                                                    var geocoder = new google.maps.Geocoder();
                                                    var address = we;
                                                    geocoder.geocode( {
                                                        'address': address
                                                    }, function(results, status) {
                                                        if (status == google.maps.GeocoderStatus.OK)
                                                        {
                                                            var latitude= results[0].geometry.location.lat();
                                                            var longitude = results[0].geometry.location.lng();
                                                            var map = Ext.getCmp('searchMap');
                                                            map.update({
                                                                latitude : latitude,
                                                                longitude : longitude
                                                            });
                                                            var infowindow = new google.maps.InfoWindow({
                                                                content: ""+new google.maps.LatLng(latitude,longitude)+""
                                                            });
                                                            marker = new google.maps.Marker({
                                                                id:'upCenter',
                                                                position:new google.maps.LatLng(latitude,longitude),
                                                                map: map.map,
                                                                icon:image
                                                            });
                                                            google.maps.event.addListener(marker, 'click', function() {
                                                                infowindow.open(map.map, marker);
                                                            });



                                                            db.transaction(function (tx) {
                                                                var id		 =  guidGenerator();
                                                                tx.executeSql('SELECT * FROM NEW_POSITION', [], function (tx, results) {
                                                                    var len = results.rows.length;
                                                                    if(len==0)
                                                                    {
                                                                        var insertQuery = "INSERT INTO NEW_POSITION (id, latitude,longitude) VALUES ("+"'"+id+"'"+","+"'"+latitude+"'"+","+"'"+longitude+"'"+")";
                                                                        tx.executeSql(insertQuery);
                                                                    }
                                                                    else{
                                                                        var insertedId =  results.rows.item(0).id;
                                                                        var updateQueryLat = "UPDATE NEW_POSITION SET latitude = " +"'"+latitude+"'"+" WHERE id = "+"'"+insertedId+"'"+"";
                                                                        var updateQueryLong = "UPDATE NEW_POSITION SET longitude = " +"'"+longitude+"'"+" WHERE id = "+"'"+insertedId+"'"+"";
                                                                        tx.executeSql(updateQueryLat);
                                                                        tx.executeSql(updateQueryLong);
                                                                    }
                                                                });
                                                                tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                                    var len = results.rows.length;
                                                                    if(len==0)
                                                                    {
                                                                        var insertQuery = "INSERT INTO TEMP_SETTING (id, latitude,longitude) VALUES ("+"'"+id+"'"+","+"'"+latitude+"'"+","+"'"+longitude+"'"+")";
                                                                        tx.executeSql(insertQuery);
                                                                    }
                                                                    else{
                                                                        var insertedId =  results.rows.item(0).id;
                                                                        var updateQueryLat = "UPDATE TEMP_SETTING SET latitude = " +"'"+latitude+"'"+" WHERE id = "+"'"+insertedId+"'"+"";
                                                                        var updateQueryLong = "UPDATE TEMP_SETTING SET longitude = " +"'"+longitude+"'"+" WHERE id = "+"'"+insertedId+"'"+"";
                                                                        tx.executeSql(updateQueryLat);
                                                                        tx.executeSql(updateQueryLong);
                                                                    }
                                                                });
                                                            });
                                                        }
                                                    });
                                                }
                                            }
                                        }]
                                    }],
                                    items:[searchMap()],
                                    listeners:{
                                        activate:function(){
                                            langSearchMap();
                                        }
                                    }



                                });
                                return searchMapPanel;
                            }


                            var mapPanel = new Ext.Panel({
                                id: 'mapPanel',
                                items:storesMap,
                                dockedItems: [
                                {
                                    xtype: 'toolbar',
                                    title:"<span class= 'logo'><img src='https://s3-eu-west-1.amazonaws.com/webclient/more/logo.jpg' width='90' height='41' align= 'center' ></span>",
                                    ui:'charcoal',
                                    items: [{
                                        text: 'Back',
                                        ui: 'back',
                                        id:'mapPanelBack',
                                        handler: function() {
                                            this.addListener('tap', function () {
                                                var tab = Ext.getCmp('tabpanel');
                                                var activeTab = tab.getActiveItem();
                                                var backItem=(tab.items.findIndex('id', activeTab.id));
                                                if (backItem==0){
                                                    Ext.getCmp('Viewport').setActiveItem('tabpanel' ,{
                                                        type:'slide',
                                                        direction:'right',
                                                        duration:500
                                                    });
                                                }
                                                else if(backItem==1){
                                                    Ext.getCmp('Viewport').setActiveItem('Panel' ,{
                                                        type:'slide',
                                                        direction:'right',
                                                        duration:500
                                                    });
                                                }
                                                else if(backItem==2){
                                                    Ext.getCmp('Viewport').setActiveItem('brandListPanel' ,{
                                                        type:'slide',
                                                        direction:'right',
                                                        duration:500
                                                    });
                                                }
                                                else if(backItem==3){
                                                    Ext.getCmp('Viewport').setActiveItem('tabpanel' ,{
                                                        type:'slide',
                                                        direction:'right',
                                                        duration:500
                                                    });
                                                }
                                            })
                                        }

                                    }]
                                }
                                ]
            
                            });

                            /////////////////////////  Detail view Map panel  ////////////////////////////////

                            var detailViewMapPanel = new Ext.Panel({
                                id: 'detailViewMapPanel',
                                dockedItems: [
                                {
                                    xtype: 'toolbar',
                                    title:"<span class= 'logo'><img src='https://s3-eu-west-1.amazonaws.com/webclient/more/logo.jpg' width='90' height='41' align= 'center' ></span>",
                                    ui:'charcoal',
                                    items: [{
                                        text: 'Back',
                                        ui: 'back',
                                        id:'detailMapBack',
                                        handler: function() {
                                            Ext.getCmp('Viewport').setActiveItem('detailViewPanel', {
                                                type:'slide',
                                                duration:500,
                                                direction:'right'
                                            });
                                        }

                                    }]
                                }
                                ],
                                items:[detailMap],
                                listeners:{
                                    activate:function(){
                                        var mapToRefresh = this.getComponent('detailMap');
                                        mapToRefresh.rendered = false;
                                        mapToRefresh.render();
                                    }
                                }
                            });


                            ///////////////////////  Setting Panel /////////////////////////////////////
                    

                            var settingPanel = new Ext.Panel({
                                id: 'settingPanel',
                                dockedItems: [
                                {
                                    xtype: 'toolbar',
                                    title:'Settings',
                                    cls:'headText',
                                    id:'setTitle',
                                    ui:'charcoal',
                                    items: [{
                                        text: 'Back',
                                        ui: 'back',
                                        id:'setBack',
                                        handler: function() {
                                            var getMoreList=Ext.getCmp('moreList').getStore();
                                            var getPos=getMoreList.data.items[0];
                                            db.transaction(function (tx) {
                                                tx.executeSql('SELECT * FROM POSITION', [], function (tx, results) {
                                                    var selectedPos =  results.rows.item(0).positionValue;
                                                    if(selectedPos=="CUR"){
                                                        getPos.set('selectValue',"Current");
                                                    }else if(selectedPos=="NEW"){
                                                        getPos.set('selectValue',"New");
                                                    }
                                                });
                                            });
                                            db.transaction(function (tx) {
                                                tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                    var storeLanguage =  results.rows.item(0).languageValue;
                                                    var storeUnit    =  results.rows.item(0).unitValue;
                                                    var offerValue =  results.rows.item(0).offersValue;
                                                    var rangeValue    =  results.rows.item(0).rangeValue;
                                                    var storeLatitude    =  results.rows.item(0).latitude;
                                                    var storeLongitude    =  results.rows.item(0).longitude;
                                                    var getCoupon =Ext.getCmp('hotDeals').getStore();
                                                    getCoupon.proxy.url= baseURL+'getCoupons?apiVersion=2&token=cumba4now&longitude='+storeLongitude+'&latitude='+storeLatitude+'&clientId='+userClientId+'&lang='+storeLanguage+'&batchNo=1&maxNo=200&radiousInMeter='+rangeValue;
                                                    getCoupon.load();
                                                    var getMoreCoupons=Ext.getCmp('moreCoupons').getStore();
                                                    getMoreCoupons.proxy.url= baseURL+'getCoupons?apiVersion=2&token=cumba4now&longitude='+storeLongitude+'&latitude='+storeLatitude+'&clientId='+userClientId+'&lang='+storeLanguage+'&batchNo=1&maxNo=200&radiousInMeter='+rangeValue;
                                                    getMoreCoupons.load();

                                                    var catStoreURL=Ext.getCmp('categories').getStore();
                                                    catStoreURL.proxy.url=baseURL+'getCategories?apiVersion=1&token=cumba4now&categoriesVersion=1&lang='+storeLanguage;
                                                    catStoreURL.load();
                                               
                                                })
                                            }),

                                    
                                     
                                            Ext.getCmp('Viewport').setActiveItem('tabpanel', {
                                                type:'slide',
                                                direction:'right',
                                                duration:500
                                            });
                                        }
                                    }]
                                }
                                ],
                                items:[
                                new Ext.List({
                                    fullscreen: true,
                                    id:'setList',
                                    itemTpl :moreTpl,
                                    store:  new Ext.data.Store({
                                        model  : 'Contact',
                                        sorters: 'image',
                                        proxy:{
                                            type: 'ajax',
                                            url: 'json/eng_array.json',
                                            reader: new Ext.data.JsonReader({
                                                type: 'json',
                                                root: 'ListOfSettings'
                                            }),
                                            listeners: {
                                                exception:function (proxy, response, operation) {
                                                    $(".x-mask-loading").hide();
                                                    db.transaction(function (tx) {
                                                        tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                            var selectedLanguage =  results.rows.item(0).languageValue;
                                                            if(selectedLanguage=="ENG"){
                                                                Ext.Msg.alert('', 'No/Weak internet Access You can not use Cumbari service currently.', Ext.emptyFn);

                                                            }
                                                            else if(selectedLanguage=="SWE"){
                                                                Ext.Msg.alert('', 'Inget/svagt tillg\u00E5ng till internet Du kan inte anv\u00E4nda Cumbari tj\u00E4nster som idag.', Ext.emptyFn);
                                                            }

                                                        })
                                                    });
                                                }
                                            }
                                        },
                                        //autoLoad: true,
                                        listeners:{
                                            datachanged:function(){
                                                db.transaction(function (tx) {
                                                    tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                        var selectedLanguage =  results.rows.item(0).languageValue;
                                                        var selectedUnit =  results.rows.item(0).unitValue;
                                                        var selectedOffer =  results.rows.item(0).offersValue;
                                                        var selectedRange =  results.rows.item(0).rangeValue;
                                                        var selectSettings =Ext.getCmp('setList').getStore();
                                                        var findLng =selectSettings.data.items[0];
                                                        var findUnit =selectSettings.data.items[1];
                                                        var findOffer =selectSettings.data.items[2];
                                                        var findRange =selectSettings.data.items[3];
                                                        if(selectedLanguage=="ENG"){
                                                            findLng.set('selectValue',"English");
                                                        }
                                                        else if(selectedLanguage=="SWE"){
                                                            findLng.set('selectValue',"Svenska");
                                                        }
                                                        if(selectedUnit=="meter"){
                                                            findUnit.set('selectValue',"Meter");
                                                            findRange.set('selectValue',selectedRange+' '+'m');
                                                        }
                                                        else if(selectedUnit=="miles"){
                                                            findUnit.set('selectValue',"Miles");
                                                            var miles=selectedRange;
                                                            var inMiles=miles*0.000621371192;
                                                            roundMiles=Math.round(inMiles*10)/10;
                                                            findRange.set('selectValue',roundMiles+' '+'miles');
                                                        }
                                                        findOffer.set('selectValue',selectedOffer+" "+"Offers");
                                                    })
                                                });
                                            }
                                        }

                                    }),
                                    listeners: {
                                        itemTap: function(list,set ){
                                            if(set==0)
                                            {
                                                Ext.getCmp('Viewport').setActiveItem('languagePanel',{
                                                    type:'slide',
                                                    direction:'left',
                                                    duration:500
                                                });
                                            }
                                            else if(set==1)
                                            {
                                                Ext.getCmp('Viewport').setActiveItem('unitPanel',{
                                                    type:'slide',
                                                    direction:'left',
                                                    duration:500
                                                });
                                            }
                                            else if(set==2)
                                            {
                                                Ext.getCmp('Viewport').setActiveItem('offerPanel',{
                                                    type:'slide',
                                                    direction:'left',
                                                    duration:500
                                                });
                                            }
                                            else if(set==3)
                                            {
                                                Ext.getCmp('Viewport').setActiveItem('rangePanel',{
                                                    type:'slide',
                                                    direction:'left',
                                                    duration:500
                                                });
                                            }
                                        }
                                    }
                                })
                                ],
                                listeners:{
                                    activate:function(){
                                        db.transaction(function (tx) {
                                            tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                var selectedLanguage =  results.rows.item(0).languageValue;
                                                var selectedUnit =  results.rows.item(0).unitValue;
                                                var selectedOffer =  results.rows.item(0).offersValue;
                                                var selectedRange =  results.rows.item(0).rangeValue;
                                                var selectSettings =Ext.getCmp('setList').getStore();
                                                var findLng =selectSettings.data.items[0];
                                                var findUnit =selectSettings.data.items[1];
                                                var findOffer =selectSettings.data.items[2];
                                                var findRange =selectSettings.data.items[3];
                                                if(selectedLanguage=="ENG"){
                                                //findLng.set('selectValue',"English");
                                                }
                                                else if(selectedLanguage=="SWE"){
                                                //findLng.set('selectValue',"Svenska");
                                                }
                                                if(selectedUnit=="meter"){
                                                    findUnit.set('selectValue',"Meter");
                                                    findRange.set('selectValue',selectedRange+' '+'m');
                                                }
                                                else if(selectedUnit=="miles"){
                                                    findUnit.set('selectValue',"Miles");
                                                    var miles=selectedRange;
                                                    var inMiles=miles*0.000621371192;
                                                    roundMiles=Math.round(inMiles*10)/10;
                                                    findRange.set('selectValue',roundMiles+' '+'miles');
                                                }
                                                findOffer.set('selectValue',selectedOffer+" "+"Offers");
                                            })
                                        });

                                    }
                                }
                            });
       
                            var currentCheckedLanguage = setCurrentLanguage;
                            var newCheckedLanguage = setNewLanguage;

                            var languagePanel=  new Ext.Panel({
                                fullscreen : true,
                                id:'languagePanel',
                                cls: 'backImage',
                                items: [{
                                    xtype: 'fieldset',
                                    cls:'myForm-loding',
                                    defaults: {
                                        xtype: 'radiofield'

                                    },
                                    items: [
                                    {
                                        name : 'language',
                                        label: 'English',
                                        checked : currentCheckedLanguage,
                                        id:'english',
                                        value : 'ENG',
                                        listeners:{
                                            check :function(){
                                                Ext.getCmp('langTitle').setTitle('Language');
                                                Ext.getCmp('langBack').setText('Back');

                                                db.transaction(function (tx) {
                                                    var id		 =  guidGenerator();
                                                    var curValue = Ext.getCmp('english').getValue();
                                                    tx.executeSql('SELECT * FROM LANGUAGE', [], function (tx, results) {
                                                        var len = results.rows.length;
                                                        if(len==0)
                                                        {
                                                            var insertQuery = "INSERT INTO LANGUAGE (id, languageValue) VALUES ("+"'"+id+"'"+","+"'"+curValue+"'"+")";
                                                            tx.executeSql(insertQuery);
                                                        }
                                                        else{
                                                            var insertedId =  results.rows.item(0).id;
                                                            var updateQuery = "UPDATE LANGUAGE SET languageValue = " +"'"+curValue+"'"+" WHERE id = "+"'"+insertedId+"'"+"";
                                                            tx.executeSql(updateQuery);

                                                            // query to update TEMP_SETING table.
                                                            var updateQueryTemp = "UPDATE TEMP_SETTING SET languageValue = " +"'"+curValue+"'"+"";
                                                            tx.executeSql(updateQueryTemp);

                                                        }
                                                    });
                                                });
                                            }
                                        }
                                    },
                                    {
                                        name : 'language',
                                        label: 'Svenska' ,
                                        id:'svenvak',
                                        checked : newCheckedLanguage,
                                        value : 'SWE',
                                        listeners:{
                                            check :function(){
                                                Ext.getCmp('langTitle').setTitle('Spr\u00E5k');
                                                Ext.getCmp('langBack').setText('Tillbaka');
                                                db.transaction(function (tx) {
                                                    var id		 =  guidGenerator();
                                                    var curValue = Ext.getCmp('svenvak').getValue();
                                                    tx.executeSql('SELECT * FROM LANGUAGE', [], function (tx, results) {
                                                        var len = results.rows.length;
                                                        if(len==0)
                                                        {
                                                            var insertQuery = "INSERT INTO LANGUAGE (id, languageValue) VALUES ("+"'"+id+"'"+","+"'"+curValue+"'"+")";
                                                            tx.executeSql(insertQuery);
                                                        }
                                                        else{
                                                            var insertedId =  results.rows.item(0).id;
                                                            var updateQuery = "UPDATE LANGUAGE SET languageValue = " +"'"+curValue+"'"+" WHERE id = "+"'"+insertedId+"'"+"";
                                                            tx.executeSql(updateQuery);

                                                            // query to update TEMP_SETING table.
                                                            var updateQueryTemp = "UPDATE TEMP_SETTING SET languageValue = " +"'"+curValue+"'"+"";
                                                            tx.executeSql(updateQueryTemp);
                                                        }
                                                    });
                                                });
                                            }
                                        }
                                    }]
                                }],
                                dockedItems:[{
                                    xtype: 'toolbar',
                                    dock : 'top',
                                    ui:'charcoal',
                                    title: "Language",
                                    cls:'headText',
                                    id:'langTitle',
                                    items: [{
                                        text: 'Back',
                                        ui:'back',
                                        id:'langBack',
                                        handler: function() {
                                            languageText();


                                            Ext.getCmp('Viewport').setActiveItem('settingPanel', {
                                                type:'slide',
                                                duration:500,
                                                direction:'right'
                                            });
                                        }
                                    }]
                                }]
                            });

                    
                            var currentCheckedUnit = setCurrentUnit;
                            var newCheckedUnit = setNewUnit;

                            var unitPanel=  new Ext.Panel({
                                fullscreen : true,
                                id:'unitPanel',
                                cls: 'backImage',
                                items: [{
                                    xtype: 'fieldset',
                                    cls:'myForm-loding',
                                    defaults: {
                                        xtype: 'radiofield'
                                    },
                                    items: [
                                    {
                                        name : 'rang',
                                        label: 'Meter',
                                        checked : currentCheckedUnit,
                                        id:'unitMeter',
                                        value : 'meter',
                                        listeners:{
                                            check :function(){
                                                db.transaction(function (tx) {
                                                    var id		 =  guidGenerator();
                                                    var curValue = Ext.getCmp('unitMeter').getValue();
                                                    tx.executeSql('SELECT * FROM UNIT', [], function (tx, results) {
                                                        var len = results.rows.length;
                                                        if(len==0)
                                                        {
                                                            var insertQuery = "INSERT INTO UNIT (id, unitValue) VALUES ("+"'"+id+"'"+","+"'"+curValue+"'"+")";
                                                            tx.executeSql(insertQuery);
                                                        }
                                                        else{
                                                            var insertedId =  results.rows.item(0).id;
                                                            var updateQuery = "UPDATE UNIT SET unitValue = " +"'"+curValue+"'"+" WHERE id = "+"'"+insertedId+"'"+"";
                                                            tx.executeSql(updateQuery);

                                                            // query to update TEMP_SETING table.
                                                            var updateQueryTemp = "UPDATE TEMP_SETTING SET unitValue = " +"'"+curValue+"'"+"";
                                                            tx.executeSql(updateQueryTemp);
                                                        }
                                                    });
                                                });
                                            }
                                        }
                                    },
                                    {
                                        name : 'rang',
                                        label: 'Miles' ,
                                        value : 'miles',
                                        checked : newCheckedUnit,
                                        id:'unitMiles',
                                        listeners:{
                                            check :function(){
                                                db.transaction(function (tx) {
                                                    var id		 =  guidGenerator();
                                                    var curValue = Ext.getCmp('unitMiles').getValue();
                                                    tx.executeSql('SELECT * FROM UNIT', [], function (tx, results) {
                                                        var len = results.rows.length;
                                                        if(len==0)
                                                        {
                                                            var insertQuery = "INSERT INTO UNIT (id, unitValue) VALUES ("+"'"+id+"'"+","+"'"+curValue+"'"+")";
                                                            tx.executeSql(insertQuery);
                                                        }
                                                        else{
                                                            var insertedId =  results.rows.item(0).id;
                                                            var updateQuery = "UPDATE UNIT SET unitValue = " +"'"+curValue+"'"+" WHERE id = "+"'"+insertedId+"'"+"";
                                                            tx.executeSql(updateQuery);
                                                    
                                                            // query to update TEMP_SETING table.
                                                            var updateQueryTemp = "UPDATE TEMP_SETTING SET unitValue = " +"'"+curValue+"'"+"";
                                                            tx.executeSql(updateQueryTemp);


                                                        }
                                                    });
                                                });
                                            }
                                        }
                                    }]
                                }],
                                dockedItems:[{
                                    xtype: 'toolbar',
                                    dock : 'top',
                                    ui:'charcoal',
                                    title: "Unit",
                                    cls:'headText',
                                    id:'unitTitle',
                                    items: [{
                                        text: 'Back',
                                        ui:'back',
                                        id:'unitBack',
                                        handler: function() {
                                            Ext.getCmp('Viewport').setActiveItem('settingPanel', {
                                                type:'slide',
                                                duration:500,
                                                direction:'right'
                                            });
                                        }
                                    }]
                                }]
                            });

                            var currentOffers =setCurrentOffer;

                            var offerPanel = new Ext.Panel({
                                fullscreen : true,
                                id:'offerPanel',
                                cls: 'backImage',
                                items: [{
                                    xtype: 'fieldset',
                                    cls:'myForm-loding',
                                    items: [
                                    {
                                        xtype: 'textfield',
                                        name : 'first',
                                        cls:'textLable',
                                        id:'first'
                                    }, {
                                        xtype   : 'sliderfield',
                                        id:'slider',
                                        value   : currentOffers,
                                        minValue: 10,
                                        maxValue: 100,
                                        listeners:
                                        {
                                            change:function()
                                            {
                                        
                                                var curValue = Ext.getCmp('slider').getValue();
                                                Ext.getCmp('first').setValue(curValue + ""+ "  Offers");
                                                db.transaction(function (tx) {
                                                    var id		 =  guidGenerator();
                                                    tx.executeSql('SELECT * FROM OFFERS', [], function (tx, results) {
                                                        var len = results.rows.length;
                                                        if(len==0)
                                                        {
                                                            var insertQuery = "INSERT INTO OFFERS (id, offersValue) VALUES ("+"'"+id+"'"+","+"'"+curValue+"'"+")";
                                                            tx.executeSql(insertQuery);
                                                        }
                                                        else{
                                                            var insertedId =  results.rows.item(0).id;
                                                            var updateQuery = "UPDATE OFFERS SET offersValue = " +"'"+curValue+"'"+" WHERE id = "+"'"+insertedId+"'"+"";
                                                            tx.executeSql(updateQuery);

                                                            // query to update TEMP_SETING table.
                                                            var updateQueryTemp = "UPDATE TEMP_SETTING SET offersValue = " +"'"+curValue+"'"+"";
                                                            tx.executeSql(updateQueryTemp);
                                                        }
                                                    });
                                                });
                                        
                                            }
                                        }
                                    },
                                    ]
                                }],
                                dockedItems:[{
                                    xtype: 'toolbar',
                                    dock : 'top',
                                    ui:'charcoal',
                                    title: "Offers in list",
                                    cls:'headText',
                                    id:'offerTitle',
                                    items: [{
                                        text: 'Back',
                                        ui:'back',
                                        id:'offerBack',
                                        handler: function() {
                                            Ext.getCmp('Viewport').setActiveItem('settingPanel', {
                                                type:'slide',
                                                duration:500,
                                                direction:'right'
                                            });
                                        }
                                    }]
                                }],
                                listeners:{
                                    activate:function(){
                                        var curValue = Ext.getCmp('slider').getValue();
                                        Ext.getCmp('first').setValue(curValue + ""+ "  Offers");
                                    }
                                }
                            });

                            var currentRange = setCurrentRange;

                            var rangePanel = new Ext.Panel({
                                fullscreen : true,
                                id:'rangePanel',
                                cls: 'backImage',
                                items: [{
                                    xtype: 'fieldset',
                                    cls:'myForm-loding',
                                    items: [
                                    {
                                        xtype: 'textfield',
                                        name : 'range',
                                        cls:'textLable',
                                        id:'range'
                                    }, {
                                        xtype   : 'sliderfield',
                                        id:'rangeSlider',
                                        value   : currentRange,
                                        minValue: 250,
                                        maxValue: 10000,
                                        listeners:
                                        {
                                            change:function()
                                            {
                                        
                                                var curValue=Ext.getCmp('rangeSlider').getValue();
                                                db.transaction(function (tx) {
                                                    tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                        var selectedUnit =  results.rows.item(0).unitValue;
                                                        if(selectedUnit=="meter"){
                                                            Ext.getCmp('range').setValue(curValue + ""+ " m");
                                                        }
                                                        else if(selectedUnit=="miles"){
                                                            var miles=curValue;
                                                            var inMiles=miles*0.000621371192;
                                                            roundMiles=Math.round(inMiles*10)/10;
                                                            Ext.getCmp('range').setValue(roundMiles + ""+ " miles");
                                                        }
                                                    })
                                                });
                                                db.transaction(function (tx) {
                                                    var id		 =  guidGenerator();
                                                    tx.executeSql('SELECT * FROM RANGE', [], function (tx, results) {
                                                        var len = results.rows.length;
                                                        if(len==0)
                                                        {
                                                            var insertQuery = "INSERT INTO RANGE (id,rangeValue) VALUES ("+"'"+id+"'"+",'10000')";
                                                            tx.executeSql(insertQuery);
                                                            tx.executeSql('SELECT * FROM RANGE', [], function (tx, results) {

                                                                });
                                                        }
                                                        else{
                                                            var insertedId =  results.rows.item(0).id;
                                                            var updateQuery = "UPDATE RANGE SET rangeValue = " +"'"+curValue+"'"+" WHERE id = "+"'"+insertedId+"'"+"";
                                                            tx.executeSql(updateQuery);

                                                            // query to update TEMP_SETING table.
                                                            var updateQueryTemp = "UPDATE TEMP_SETTING SET rangeValue = " +"'"+curValue+"'"+"";
                                                            tx.executeSql(updateQueryTemp);
                                                        }
                                                    });
                                                });
                                        
                                            }
                                        }
                                    },
                                    ]
                                }],
                                dockedItems:[{
                                    xtype: 'toolbar',
                                    dock : 'top',
                                    ui:'charcoal',
                                    title: "Range",
                                    cls:'headText',
                                    items: [{
                                        text: 'Back',
                                        ui:'back',
                                        id:'rangeBack',
                                        handler: function() {
                                            Ext.getCmp('Viewport').setActiveItem('settingPanel', {
                                                type:'slide',
                                                duration:500,
                                                direction:'right'
                                            });
                                        }
                                    }]
                                }],
                                listeners:{
                                    activate:function(){
                                        var curValue=Ext.getCmp('rangeSlider').getValue();
                                        db.transaction(function (tx) {
                                            tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                var selectedUnit =  results.rows.item(0).unitValue;
                                                if(selectedUnit=="meter"){
                                                    Ext.getCmp('range').setValue(curValue + ""+ " m");
                                                }
                                                else if(selectedUnit=="miles"){
                                                    var miles=curValue;
                                                    var inMiles=miles*0.000621371192;
                                                    roundMiles=Math.round(inMiles*10)/10;
                                                    Ext.getCmp('range').setValue(roundMiles + ""+ " miles");
                                                }
                                            })
                                        });

                                    }
                                }
                            });


                            var endScreen = new Ext.Panel({
                                cls:'endImage',
                                fullscreen : true,
                                id:'endScreen',
                                items:[{
                                    xtype:'button',
                                    ui:'done',
                                    text:'Thank you! Back to Hot Deals',
                                    cls:'myButton-loding',
                                    handler:function(){
                                        var getCoupon =Ext.getCmp('hotDeals').getStore();
                                        getCoupon.load();
                                        var end= Ext.getCmp('tabpanel').setActiveItem('hotDeals');
                                        //console.debug(end);
                                        Ext.getCmp('Viewport').setActiveItem(end, {
                                            type:'slide',
                                            direction:'right',
                                            duration:500
                                        });
                   
                                    }

                                }]
                            });
                            ///////////////////////////////////////////////////////////////////////////////////////////////////////
     
   
                            var Viewport = new Ext.Panel ({
                                id:'Viewport',
                                fullscreen: true,
                                layout: 'card',
                                cardSwitchAnimation: 'fade',
                                items: [tabpanel,Panel,brandListPanel,aboutPanel,feedbackPanel,changePositionPanel,settingPanel,detailViewPanel,mapPanel,rangePanel,offerPanel,unitPanel,languagePanel,infoPanel,detailViewMapPanel,moreDealsPanel,endScreen,couponList(jsonCampaignStore,couponListTpl,detailViewPanel,infoPanel,couponListForMiles,storesMap,db)]
                                ,
                                listeners:{
                                    beforerender:function(){
                                        var exUrl = document.location.href;
                                        
                                        var vars = exUrl.split("?");
                                        if(exUrl==vars[0]){

                                        }else{
                                            var vars2 = vars[1].split("&");
                                            if(vars2[0]=="service=getCoupon"){
                                                if(vars2[1]!= undefined){
                                                    var getCId = vars2[1].split("=");

                                                }
                                                if(vars2[2]!= undefined){
                                                    var getPId = vars2[2].split("=");

                                                }
                                                if(vars2[3]!= undefined){
                                                    var getPRe = vars2[3].split("=");
                                                    Ext.Ajax.request({
                                                        url:baseURL+"getCoupon?apiVersion=2&token=cumba4now&couponId="+getCId[1]+"&lang=ENG&partnerId="+getPId[1]+"&partnerRef="+getPRe[1],
                                                        method: "GET",
                                                        success: function(response, opts) {
                                                            var dockedItemUseDealButton = Ext.getCmp("Viewport").getComponent('tabpanel');
                                                            dockedItemUseDealButton.hide();
                                                            detailAdverties();
                                                            function detailAdverties(){
                                                                db.transaction(function (tx) {
                                                                    tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                                                        var selectedLanguage =  results.rows.item(0).languageValue;
                                                                        var getCP = new Ext.data.Store({
                                                                            id:'hotStore',
                                                                            clearOnPageLoad: false,
                                                                            model: "hotDeals",
                                                                            proxy:{
                                                                                type: 'ajax',
                                                                                url: baseURL+"getCoupon?apiVersion=2&token=cumba4now&couponId="+getCId[1]+"&lang="+selectedLanguage+"&partnerId="+getPId[1]+"&partnerRef="+getPRe[1],
                                                                                reader: new Ext.data.JsonReader({
                                                                                    type: 'json',
                                                                                    root: 'coupon'
                                                                                })
                                                                            },
                                                                            autoLoad: true,
                                                                            listeners: {
                                                                                'load': function(list,index,e,d,g) {
                                                                                    getCouponStores.add(this.proxy.reader.rawData.storeInfo);
                                                                                    getADStore = getCouponStores;
                                                                                    setDForAdverties(getADStore);

                                                                                    var valid=this.proxy.reader.rawData.coupon.limitPeriodList[0];
                                                                                    if(this.proxy.reader.rawData.coupon.endOfPublishing==""){
                                                                                        text ="";
                                                                                        publishingEnd = "";
                                                                                    }else{
                                                                                        var dateNew =this.proxy.reader.rawData.coupon.endOfPublishing;
                                                                                        publishingDateEnd = dateNew.split(" ");
                                                                                        publishingEnd = publishingDateEnd[0];
                                                                                        if(selectedLanguage=="ENG"){
                                                                                            text = "valid until";
                                                                                        }else if(selectedLanguage=="SWE"){
                                                                                            text = "Giltig till";
                                                                                        }

                                                                                    }
                                                                                    
                                                                                    if(valid==undefined){
                                                                                        var getCouponRecord = Ext.ModelMgr.create({
                                                                                            id: 1,
                                                                                            storeId: this.proxy.reader.rawData.coupon.storeId,
                                                                                            smallImage: this.proxy.reader.rawData.coupon.smallImage,
                                                                                            largeImage: this.proxy.reader.rawData.coupon.largeImage,
                                                                                            couponDeliveryType: this.proxy.reader.rawData.coupon.couponDeliveryType,
                                                                                            couponId: this.proxy.reader.rawData.coupon.couponId,
                                                                                            distanceToStore:getADStore.data.items[0].data.distanceToStore,
                                                                                            endOfPublishing:text+" "+publishingEnd,
                                                                                            offerTitle:this.proxy.reader.rawData.coupon.offerTitle,
                                                                                            offerType:this.proxy.reader.rawData.coupon.offerType,
                                                                                            offerSlogan:this.proxy.reader.rawData.coupon.offerSlogan,
                                                                                            validFrom:this.proxy.reader.rawData.coupon.validFrom,
                                                                                            latitude : getCouponStores.data.items[0].data.latitude,
                                                                                            longitude : getCouponStores.data.items[0].data.longitude,
                                                                                            homePage:getCouponStores.data.items[0].data.homePage,
                                                                                            phone:getCouponStores.data.items[0].data.phone,
                                                                                            storeName:getCouponStores.data.items[0].data.storeName,
                                                                                            street:getCouponStores.data.items[0].data.street,
                                                                                            email:getCouponStores.data.items[0].data.email,
                                                                                            country:getCouponStores.data.items[0].data.country,
                                                                                            city:getCouponStores.data.items[0].data.city
                                                                                        }, 'CustomCumbari');
                                                                                        detailViewPanel.update(getCouponRecord.data);
                                                                                        infoPanel.update(getCouponRecord.data);
                                                                                       
                                                                                        Ext.getCmp('Viewport').setActiveItem('detailViewPanel');
                                                                                    }else{
                                                                                        var getCouponRecordPList = Ext.ModelMgr.create({
                                                                                            id: 1,
                                                                                            validDay:"Valid:"+" "+valid.validDay,
                                                                                            startTime:valid.startTime+' '+'-',
                                                                                            endTime:valid.endTime,
                                                                                            storeId: this.proxy.reader.rawData.coupon.storeId,
                                                                                            smallImage: this.proxy.reader.rawData.coupon.smallImage,
                                                                                            largeImage: this.proxy.reader.rawData.coupon.largeImage,
                                                                                            couponDeliveryType: this.proxy.reader.rawData.coupon.couponDeliveryType,
                                                                                            couponId: this.proxy.reader.rawData.coupon.couponId,
                                                                                            distanceToStore:getADStore.data.items[0].data.distanceToStore,
                                                                                            endOfPublishing:text+" "+publishingEnd,
                                                                                            offerTitle:this.proxy.reader.rawData.coupon.offerTitle,
                                                                                            offerType:this.proxy.reader.rawData.coupon.offerType,
                                                                                            offerSlogan:this.proxy.reader.rawData.coupon.offerSlogan,
                                                                                            validFrom:this.proxy.reader.rawData.coupon.validFrom,
                                                                                            latitude : getCouponStores.data.items[0].data.latitude,
                                                                                            longitude : getCouponStores.data.items[0].data.longitude,
                                                                                            homePage:getCouponStores.data.items[0].data.homePage,
                                                                                            phone:getCouponStores.data.items[0].data.phone,
                                                                                            storeName:getCouponStores.data.items[0].data.storeName,
                                                                                            street:getCouponStores.data.items[0].data.street,
                                                                                            email:getCouponStores.data.items[0].data.email,
                                                                                            country:getCouponStores.data.items[0].data.country,
                                                                                            city:getCouponStores.data.items[0].data.city
                                                                                        }, 'CustomCumbari');
                                                                                        detailViewPanel.update(getCouponRecordPList.data);
                                                                                        infoPanel.update(getCouponRecordPList.data);
                                                                                        
                                                                                        Ext.getCmp('Viewport').setActiveItem('detailViewPanel');
                                                                                    }
                                                                                }
                                                                            }
                                                                        });
                                                                    });
                                                                });
                                                            }
                                                        },
                                                        failure:function(wewee){
                                                            if(wewee.statusText=="Bad Request"){
                                                                Ext.Msg.alert(" "+"Unknown couponId.");
                                                            }else{
                                                                Ext.Msg.alert(" "+"User Unauthorized.");
                                                            }
                                                        }

                                                    });
                                                }else{
                                                    Ext.Msg.alert(" "+"User Unauthorized.");
                                                }
                                            }else if(vars2[0]=="service=getBrandedCoupons"){

                                                if(vars2[1]!= undefined){
                                                    var brandName = vars2[1].split("=");

                                                }
                                                if(vars2[2]!= undefined){
                                                    var brandPId = vars2[2].split("=");

                                                }
                                                if(vars2[3]!= undefined){
                                                    var brandPrId = vars2[3].split("=");
                                                    getBrandedCoupon(brandName,brandPId,brandPrId);
                                                   
                                                }else{
                                                    Ext.Msg.alert(" "+"User Unauthorized.");
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                            locationLoad = "changed";
                        }
                    },
                    locationerror: function (   geo,
                        bTimeout,
                        bPermissionDenied,
                        bLocationUnavailable,
                        message) {
                        if(bTimeout){
                            
                        }
                        else{
                            
                    }
                    }
                }
            });
            geo.updateLocation();
        }
    }


});