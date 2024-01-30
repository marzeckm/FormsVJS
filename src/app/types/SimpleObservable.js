const SimpleObservable = function(){
    return  {
        value: undefined,
        
        _fn: undefined,

        next: function(value){
            this.value = value;
            if(this._fn){
                this._fn(value);
            }
        },

        subscribe: function(fn){
            this._fn = fn;
            this.next.bind(this);
        }
    };
};