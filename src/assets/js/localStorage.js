export default {
    getItem(key){
        return window.localStorage.getItem(key);
    },
    setItem(key, value){
        try{
            // ios safari 无痕模式下，直接使用localStorage.setItem会报错
            window.localStorage.setItem(key, value);
        }catch(e){
            if(process.env.NODE_ENV === 'development'){
                console.log('localStorage.setItem报错', e.message);
            }
        }
    }
}