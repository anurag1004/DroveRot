$(document).ready(()=>{
    const socket = io.connect(window.location.host);
   
        socket.on("processed-img",(data)=>{
            console.log(data);
            var src = 'data:image/jpeg;base64,'+data.src;
            $('#processed_img').attr('src',src);
        });
})