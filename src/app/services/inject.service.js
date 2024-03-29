/**
 * Injects an Singleton into the class where the function is called
 * 
 * @global @function inject
 * @param {Class} classRef
 * @returns {Object} instanceOfClass
 */
const inject = function(classRef){
    // Checks if the requested Object was already 
    if(window._singletons === undefined){
        window._singletons = {};
    }

    // Checks if an Instance of this class was already injected
    if(window._singletons[classRef()._constructName] === undefined){
        window._singletons[classRef()._constructName] = classRef();
    }

    return window._singletons[classRef()._constructName];
}
