$(document).ready(()=>{
    var $j = jQuery.noConflict();
    let status=false;
    let synccoords=null;
        setInterval(() => {
                $.get('/all_live_coords',(data)=>{
                    $('tbody').html("");
                    data.forEach(user=>{
                        let html='<tr><th>'+user.name+'</th><th>'+user.latitude+'</th><th>'+user.longitude+'</th></tr>';
                        $('tbody').append(html);
                    });
                  
                })
            }, 2000);
        });
       

