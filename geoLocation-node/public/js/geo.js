
$(document).ready(()=>{
    const posBtn=$('#posBtn');
     $(posBtn).on('click',(e)=>{
          handlePermissionAndRedirect();
        });
  
 })
 function getPosition(){
     navigator.geolocation.watchPosition(success,(err)=>{
         console.log(err);
         //retry
         getPosition();
     },{
         enableHighAccuracy: true, 
         maximumAge: 0, 
         timeout: 10000
     })
 
 }
 function success(position){
    var $j = jQuery.noConflict();
     let latitude=position.coords.latitude;
     let longitude=position.coords.longitude;
     //console.log("latitude: "+latitude+" ,"+" longitude: "+longitude);
     $('.positions').html("");
     $('.positions').append('<p>'+"latitude: "+latitude+" ,"+" longitude: "+longitude+'</p>');
    //  const encMsg = CryptoJS.AES.encrypt(tosend, roomkey).toString();
     $.get('/passKey',(data)=>{
         let longitude_enc  = CryptoJS.AES.encrypt(longitude.toString(),data.key).toString();
         let latitude_enc  = CryptoJS.AES.encrypt(latitude.toString(),data.key).toString();
        $.post('/updateLocation',{longitude_string:longitude_enc,latitude_string:latitude_enc},(data)=>{
            console.log('successfully sent the location! || Server_Response:'+ data);
            if(data!=200||data!='OK'){
                console.log(data);
            }
     }).fail(()=>{
         alert('something went wrong!!');
     })
     }).fail(()=>{
         alert('failed to get the encryption keys!!');
     })
   
 }
 function handlePermissionAndRedirect(){
     navigator.permissions.query({name:'geolocation'}).then(result=>{
       getPosition();
     })
     .catch(err=>{
         console.log(err.code);
         return false;
     });
 }