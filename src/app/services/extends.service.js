/**
 * Extends a given interface
 * 
 * @param {Class} interface 
 * @param {Class} classRef 
 */
const ifExtends = function(interface, classRef){
    const result = interface();

    Object.keys(classRef).forEach(function(key){
        result[key] = classRef[key];
    });

    return result;
}
