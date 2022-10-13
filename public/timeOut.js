
document.addEventListener('DOMContentLoaded', function(){
    // let errorMsg = document.querySelector('.message');
    if(errorMsg.innerHTML !== ''){
        setTimeout(function(){
            errorMsg.innerHTML = '';
        }, 4000);
    }
});