// 元——>分
export function y2f(n){
    n = typeof n === 'number' ? n : window.parseInt(n);
    return n * 100;
}

// 分->元
export function f2y(n){
    n = typeof n === 'number' ? n : window.parseInt(n);
    return n / 100;
}