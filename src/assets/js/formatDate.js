// 传入"2017-10"的字符串，会把它专为"2017-10-1"的时间戳

export function strToDate(str){
    let res = str.split('-'),
        year = window.parseInt(res[0]),
        month = window.parseInt(res[1] - 1);
    return new Date(year, month, 1).getTime();
}

export function dateToStr(time){
    let d = new Date(time),
        year = d.getFullYear(),
        month = d.getMonth() + 1;
    return `${ year }-${ month }`;
}
