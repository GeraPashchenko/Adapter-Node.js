
module.exports.getObjectValue = function (obj, str, list) { // функция поиска определенного свойства в объекте                   
    getProp(obj, str, list);                               // и записи его значений в список

    function getProp(o, str, list) {
        for (var prop in o) {
            if (prop == str) {
                list.push(JSON.stringify(o[prop]));
            }
            else if (typeof (o[prop]) === 'object') {
                getProp(o[prop], str, list);
            }
        }
    }
}