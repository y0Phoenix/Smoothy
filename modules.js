module.exports =  { 
    deleteMsg(msg, time) {
        setTimeout(() => msg.delete(), time);
    }, 
}