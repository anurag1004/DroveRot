$(document).ready(()=>{
    $(document).ready(()=>{
        const socket = io.connect(window.location.host);
            const fl = $('#fl');
            const f = $('#f');
            const fr = $('#fr');
            const bl = $('#bl');
            const b = $('#b');
            const br = $('#br');
            const stop =$('#stop');
            const self_distruct = $('#self_distruct'); //not there yet
            const terminate = $('#terminate');
        $(fl).on('click',(e)=>{
            emit_cmd('r');
        });
        $(f).on('click',(e)=>{
            emit_cmd('t');
        }); 
        $(fr).on('click',(e)=>{
            emit_cmd('y');
        }); 
        $(bl).on('click',(e)=>{
            emit_cmd('f');
        });
         $(b).on('click',(e)=>{
            emit_cmd('g');
        }); 
        $(br).on('click',(e)=>{
            emit_cmd('h');
        });
        $(stop).on('click',(e)=>{
            emit_cmd('b');
        });
        // $(terminate).on('click',e=>{
        //     emit_cmd('e');
        // });
        $(terminate).on('click',e=>{
            socket.emit('rover-operation','e');
        })
        $(self_distruct).on('click',e=>{
            socket.emit('self-distruct','s');
            setTimeout(()=>{
                $(self_distruct).css('display','none');
                $('#msg').fadeIn();
            },2000);
        });
        const emit_cmd = (cmd)=>{
            socket.emit('cmd',cmd);
        }
        socket.on('rov',data=>{
            console.log(data);
        })
    })
})