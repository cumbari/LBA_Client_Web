var text="";
var publishingEnd = "";
var useDealButtonPress = "false";
function languageText()
{
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
            var selectedLanguage =  results.rows.item(0).languageValue;
            var getTab=Ext.getCmp('tabpanel');
            var moreArray= Ext.getCmp('moreList').getStore();
            var setArray= Ext.getCmp('setList').getStore();
          
            if(selectedLanguage=="ENG"){


                getTab.getTabBar(0).items.items[0].setText("Hot Deals");
                getTab.getTabBar(0).items.items[1].setText("Categories");
                getTab.getTabBar(0).items.items[2].setText("Brands");
                getTab.getTabBar(0).items.items[3].setText("Favorites");
                getTab.getTabBar(0).items.items[4].setText("More");
                Ext.getCmp('doneButton').setText("Done");
                Ext.getCmp('mapButton').setText("Map");
                Ext.getCmp('catBack').setText("Back");
                Ext.getCmp('catMap').setText("Map");
                Ext.getCmp('detailBack').setText("Back");
                Ext.getCmp('infoBack').setText("Back");
                Ext.getCmp('detailMapBack').setText("Back");
                Ext.getCmp('morePanelBack').setText("Back");
                Ext.getCmp('distanceMap').setText("Map");
                Ext.getCmp('mofeInfoButton').setText("More info");
                Ext.getCmp('favoriteButton').setText("Favorite");
                Ext.getCmp('moreDealsButton').setText("More deals");
                Ext.getCmp('moreDealHeader').setTitle("More deals");
                Ext.getCmp('infoButton').setText("More info");
                Ext.getCmp('infoFav').setText("Favorite");
                Ext.getCmp('infoDeals').setText("More deals");
                Ext.getCmp('setTitle').setTitle("Settings");
                Ext.getCmp('setBack').setText("Back");
                Ext.getCmp('langTitle').setTitle('Language');
                Ext.getCmp('langBack').setText('Back');
                Ext.getCmp('aboutTitle').setTitle('About');
                Ext.getCmp('aboutBack').setText('Back');
                Ext.getCmp('submitButton').setText('Submit');
                Ext.getCmp('feeTitle').setTitle('Feedback');
                Ext.getCmp('feeButton').setText('Back');
                Ext.getCmp('posBack').setText('Back');
                Ext.getCmp('unitBack').setText('Back');
                Ext.getCmp('offerBack').setText('Back');
                Ext.getCmp('unitTitle').setTitle('Unit');
                Ext.getCmp('offerTitle').setTitle('Offers in list');
                Ext.getCmp('rangeBack').setText('Back');
                Ext.getCmp('cancleSheet').setText('Cancel');
                Ext.getCmp('activeDeal').setText('Activate Deal');
                Ext.getCmp('campainBack').setText("Back");
                Ext.getCmp('campainMap').setText("Map");
                Ext.getCmp('mapPanelBack').setText('Back');
                moreArray.proxy.url= 'json/eng_array.json';
                moreArray.load();
                setArray.proxy.url= 'json/eng_array.json';
                setArray.load();
            //console.log(Ext.getCmp('hotDeals').plugins.loadMoreText)
            }
            else if(selectedLanguage=="SWE"){
                getTab.getTabBar(0).items.items[0].setText("Hot Deals");
                getTab.getTabBar(0).items.items[1].setText("Kategorier");
                getTab.getTabBar(0).items.items[2].setText("Varumärken");
                getTab.getTabBar(0).items.items[3].setText("Favoriter");
                getTab.getTabBar(0).items.items[4].setText("Mer");
                Ext.getCmp('doneButton').setText("Klar");
                Ext.getCmp('mapButton').setText("Karta");
                Ext.getCmp('catBack').setText("Tillbaka");
                Ext.getCmp('catMap').setText("Karta");
                Ext.getCmp('detailBack').setText("Tillbaka");
                Ext.getCmp('morePanelBack').setText("Tillbaka");
                Ext.getCmp('infoBack').setText("Tillbaka");
                Ext.getCmp('detailMapBack').setText("Tillbaka");
                Ext.getCmp('distanceMap').setText("Karta");
                Ext.getCmp('mofeInfoButton').setText("Mer info");
                Ext.getCmp('favoriteButton').setText("Favorit");
                Ext.getCmp('moreDealsButton').setText("Mer deal");
                Ext.getCmp('moreDealHeader').setTitle("Mer deal");
                Ext.getCmp('infoButton').setText("Mer info");
                Ext.getCmp('infoFav').setText("Favorit");
                Ext.getCmp('infoDeals').setText("Mer deal");
                Ext.getCmp('setTitle').setTitle("Inställningar");
                Ext.getCmp('setBack').setText("Tillbaka");
                Ext.getCmp('langTitle').setTitle('Språk');
                Ext.getCmp('langBack').setText('Tillbaka');
                Ext.getCmp('aboutTitle').setTitle('Om');
                Ext.getCmp('aboutBack').setText('Tillbaka');
                Ext.getCmp('submitButton').setText('Skicka');
                Ext.getCmp('feeTitle').setTitle('Feedback');
                Ext.getCmp('feeButton').setText('Tillbaka');
                Ext.getCmp('posBack').setText('Tillbaka');
                Ext.getCmp('offerBack').setText('Tillbaka');
                Ext.getCmp('unitBack').setText('Tillbaka');
                Ext.getCmp('unitTitle').setTitle('Enhet');
                Ext.getCmp('offerTitle').setTitle('Erbjudanden Lista');
                Ext.getCmp('rangeBack').setText('Tillbaka');
                Ext.getCmp('cancleSheet').setText('Avbryta');
                Ext.getCmp('activeDeal').setText('Aktivera Deal');
                Ext.getCmp('campainBack').setText("Tillbaka");
                Ext.getCmp('campainMap').setText("Karta");
                
                Ext.getCmp('mapPanelBack').setText('Tillbaka');
                moreArray.proxy.url= 'json/swe_array.json';
                moreArray.load();
                setArray.proxy.url= 'json/swe_array.json';
                setArray.load();
            }
        })
    })
}

function favEditLang(){
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
            var selectedLanguage =  results.rows.item(0).languageValue;
            if(selectedLanguage=="ENG"){
                Ext.getCmp('ediList').setText('Edit');   
            }
            else if(selectedLanguage=="SWE"){
                Ext.getCmp('ediList').setText('Redigera');      
            }
        })
    });
}
function langSearchMap(){
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
            var selectedLanguage =  results.rows.item(0).languageValue;
            if(selectedLanguage=="ENG"){
                Ext.getCmp('searchBack').setText('Back');
            }
            else if(selectedLanguage=="SWE"){
                Ext.getCmp('searchBack').setText('Tillbaka');
            }
        })
    })
}
var button1;
var button2;

function autoRefresh(useDealButton,distanceButton){

    
    
    var panel =Ext.getCmp('detailViewPanel');

    function toRad(degree)
    {
        rad = degree* Math.PI/ 180;
        return rad;
    }

    var getStoreLatitude = document.getElementById('hidLatitude').value;
    var getStoreLongitude = document.getElementById('hidLongitude').value;
    var currentLatitude = document.getElementById('hidCurrentLatitude').value;
    var currentLongitude = document.getElementById('hidCurrentLongitude').value;
    var R = 6371;
    var latit1=currentLatitude;
    var longi1=currentLongitude;
    var latit2=getStoreLatitude;
    var longi2=getStoreLongitude;
    var dLatit=toRad(latit2-latit1);
    var dLongi=toRad(longi2-longi1);
    var a = Math.sin(dLatit/2) * Math.sin(dLatit/2) +
    Math.sin(dLongi/2) * Math.sin(dLongi/2) * Math.cos(toRad(latit1)) * Math.cos(toRad(latit2));
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    // alert(d);
    var distance = Math.round(d*1000);


    var dockedItemUseDealButton = panel.getComponent('useDealButton');

    if (dockedItemUseDealButton) {
        panel.remove(dockedItemUseDealButton,true);
    }

    var dockedItemDistanceButton = panel.getComponent('distanceButton');

    if (dockedItemDistanceButton) {
        panel.remove(dockedItemDistanceButton,true);
    }
    var textButton = panel.getComponent('theTime');

    if (textButton) {
        panel.remove(textButton,true);
    }

    var offerType = document.getElementById('hidOfferType').value;

    if(offerType=="ADVERTISE"){
        document.getElementById('advertise').style.display="Inline";
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                var rangeValue =  results.rows.item(0).unitValue;
                if(rangeValue=="meter"){
                    if(distance >=1000){
                        var distanceTextMeter=Math.round(distance/1000);
                        document.getElementById('advertise').innerHTML=distanceTextMeter+' '+'km';
                    }else{
                        document.getElementById('advertise').innerHTML=distance+' '+'m';
                    }
                }else if(rangeValue=="miles"){
                    var distanceMiles= distance/1000*.62;
                    if(distanceMiles >= 0.1){
                        var distanceTextMiles=distanceMiles.toFixed(1);
                        document.getElementById('advertise').innerHTML=distanceTextMiles+' '+'mi';
                    }else{
                        var distanceFeet=   distance*5280/1000*0.62;
                        var distanceTextFeet=Math.round(distanceFeet);
                        document.getElementById('advertise').innerHTML=distanceTextFeet+' '+'ft';
                    }
                }
            });
        });
        

    }
    if(offerType != "ADVERTISE")
    {
        if(distance <= 300){
            if (useDealButtonPress =="false"){
                panel.add(useDealButton);
                db.transaction(function (tx) {
                    tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                        var selectedLanguage =  results.rows.item(0).languageValue;
                        if(selectedLanguage=="ENG"){
                            panel.getComponent('useDealButton').setText('Use Deal');
                        }
                        else if(selectedLanguage=="SWE"){
                            panel.getComponent('useDealButton').setText('Anv\u00E4nd Deal');
                        }
                    })
                })
            }else{
                
            }
            panel.doLayout(false)
        }else if(distance > 300 ){
            panel.add(distanceButton);
            panel.doLayout(false)
            db.transaction(function (tx) {
                tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                    var rangeValue =  results.rows.item(0).unitValue;
                    if(rangeValue=="meter"){
                        if(distance >=1000){
                            var distanceTextMeter=Math.round(distance/1000);
                            Ext.getCmp('distanceButton').setText(distanceTextMeter+" "+"km");
                        }else{
                            Ext.getCmp('distanceButton').setText(distance+" "+"m");
                        }
                    }else if(rangeValue=="miles"){
                        var distanceMiles= distance/1000*.62;
                        if(distanceMiles >= 0.1){
                            var distanceTextMiles=distanceMiles.toFixed(1);
                            Ext.getCmp('distanceButton').setText(distanceTextMiles+" "+"mi");
                        }else{
                            var distanceFeet=   distance*5280/1000*0.62;
                            var distanceTextFeet=Math.round(distanceFeet);
                            Ext.getCmp('distanceButton').setText(distanceTextFeet+" "+"ft");
                        }
                    }
                });
            });


        }
    }
}


function setDForAdverties(getADStore){
    function toRad(degree)
    {
        rad = degree* Math.PI/ 180;
        return rad;
    }
    var couponLat=  getADStore.data.items[0].data.latitude;
    var couponLng = getADStore.data.items[0].data.longitude;
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
    getADStore.data.items[0].set("distanceToStore", distance);

}

var loadFind_Coupon=false;

function getFindCoupons(find_couponLat,find_couponLong){
    var getExUrl = document.location.href;
    var getUrl = getExUrl.split("?");
    if(getExUrl == getUrl[0]){
        Ext.getCmp('hotDeals').getStore().load();
    }else{
        var getService = getUrl[1].split("&");
        if(getService[0]=="service=findCoupons"){
            if(getService[1]!=undefined){
                var campainId = getService[1].split("=");
                if(getService[2]!=undefined){
                    var campainPId = getService[2].split("=");
                    if(getService[3]!=undefined){
                        var campainPrId = getService[3].split("=");
                        var campainPr="";
                        if(campainPrId[1]!=undefined){
                            campainPr = campainPrId[1];
                        }
                        
                        db.transaction(function (tx) {
                            tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
                                var storeLanguage =  results.rows.item(0).languageValue;
                                var storeUnit    =  results.rows.item(0).unitValue;
                                var offerValue =  results.rows.item(0).offersValue;
                                var rangeValue    =  results.rows.item(0).rangeValue;
                                var storeLatitude    =  results.rows.item(0).latitude;
                                var storeLongitude    =  results.rows.item(0).longitude;
                               
                                var getCoupon =Ext.getCmp('hotDeals').getStore();
                                var findCouponURL =baseURL+'findCoupons?apiVersion=2&latitude='+find_couponLat+'&longitude='+find_couponLong+'&lang='+storeLanguage+'&clientId='+userClientId+'&token=cumba4now&batchNo=1&maxNo='+offerValue+'&radiousInMeter='+rangeValue+'&searchWords='+campainId[1]+'&partnerId='+campainPId[1]+'&partnerRef='+campainPr;
                                var prePreviousURL = getCoupon.proxy.url;
                                getCoupon.proxy.url= findCouponURL;
                                getCoupon.load();
                                getCoupon.proxy.url = prePreviousURL;
                                loadFind_Coupon=true;
                                Ext.getCmp("doneButton").show();
                                   

                            });
                        });
                    }else{
                        Ext.getCmp('hotDeals').getStore().load();
                    }
                }else{
                    Ext.getCmp('hotDeals').getStore().load();
                }
            }else{
                Ext.getCmp('hotDeals').getStore().load();
            }
        }else{
            Ext.getCmp('hotDeals').getStore().load();
        }
    }

    loadS="false";
}

function getBrandedCoupon(brandName,brandPId,brandPrId){
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM TEMP_SETTING', [], function (tx, results) {
            var storeLanguage =  results.rows.item(0).languageValue;
            var storeUnit    =  results.rows.item(0).unitValue;
            var offerValue =  results.rows.item(0).offersValue;
            var rangeValue    =  results.rows.item(0).rangeValue;
            var storeLatitude    =  results.rows.item(0).latitude;
            var storeLongitude    =  results.rows.item(0).longitude;
            var brandUrl=baseURL+'getBrandedCoupons?apiVersion=2&token=cumba4now&longitude='+storeLongitude+'&latitude='+storeLatitude+'&clientId='+userClientId+'&lang='+storeLanguage+'&maxNo='+offerValue+'&radiousInMeter='+rangeValue+'&batchNo=1&brandsFilter='+encodeURI(brandName[1])+'&partnerId='+brandPId[1]+'&partnerRef='+brandPrId[1];
            var getBrandStore =Ext.getCmp('getBrandStore').getStore();
            getBrandStore.proxy.url=brandUrl;
            getBrandStore.load();
            Ext.getCmp("Viewport").setActiveItem("brandListPanel");
            var cat = Ext.getCmp('brandListPanel');
            cat.dockedItems.items[0].setTitle(brandName[1]);
               
        });
    });
}