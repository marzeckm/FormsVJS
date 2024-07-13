/**
 * Implementation of a {@link FormGroup} which contains multiple {@link AbstractControl}
 * 
 * @class {FormGroup}
 * @author {Maximilian Marzeck}
 */
const FormGroup = function (controls) {
    const formGroup = ifExtends(AbstractControl, {
        _constructName: TYPE_FORMGROUP,

        /**
         * @public @var {{string: AbstractControl}} controls
         */
        controls: {},

        /**
         * @private @var _dataType;
         */
        _dataType: undefined,

        /**
         * Returns depending on a key or list of keys the wanted Sub-Control
         * 
         * @public @function get
         * @param {string | string[]} key 
         * @return {AbstractControl}
         */
        get: function (key) {
            if (typeof key === TYPE_STRING) {
                return this.controls[key];
            } else if (key.constructor === TYPE_ARRAY) {
                const tempKey = key.shift();
                return ((key.length > 0) ? this.get(key) : this.controls[tempKey]);
            }

            return undefined;
        },

        /**
         * Adds an {@link AbstractControl} to the children
         * 
         * @public @function addControl
         * @param {string} name 
         * @param {AbstractControl} control 
         * @param {{emitEvent?:boolean}} options 
         * @returns {void}
         */
        addControl: function (name, control, options) {
            options = (options ? options : {emitEvent: true});

            this.controls[name] = control;
            control.parent = this;

            if (options[EMIT_EVENT] !== false) {
                this._refreshValue();
            } else {
                this.value[name] = control;
            }
        },

        /**
         * Removes an {@link AbstractControl} from the children
         * 
         * @public @function removeControl
         * @param {string} name 
         * @param {{emitEvent:boolean}} options 
         * @returns {void}
         */
        removeControl: function (name, options) {
            options = options ? options : {emitEvent: true};
            delete this.controls[name];

            if (options[EMIT_EVENT] !== false) {
                this._refreshValue();
            } else {
                this.value[name] = undefined;
            }
        },

        /**
         * Marks all Sub-Controls as touched
         * @public @function markAllAsTouched
         * @returns {void}
         */
        markAllAsTouched: function () {
            this.markAsTouched();
            Object.keys(this.controls).forEach(function(key){
                if (controls[key]._constructName === TYPE_FORMGROUP) {
                    controls[key].markAllAsTouched();
                }
                controls[key].markAsTouched();
            });
        },

        /**
         * Marks all Sub-Controls as untouched
         * @public @function markAllAsUntouched
         * @returns {void}
         */
        markAllAsUntouched: function () {
            this.markAsUntouched();
            Object.keys(this.controls).forEach(function(key){
                if (controls[key].constructName === TYPE_FORMGROUP) {
                    controls[key].markAllAsUntouched();
                }
                controls[key].markAsUntouched();
            });
        },

        /**
         * @private @function refreshValue
         * @returns {void}
         */
        _refreshValue: function () {
            const tempValue = {};
            const _this = this; 

            Object.keys(this.controls).forEach(function(key){
                tempValue[key] = _this.controls[key].value;
            })
            this.setValue((this._dataType) ? this._dataType.deserialize(tempValue) : tempValue);
        },

        /**
         * @private @var setFormGroupStatus
         * @param {AbstractControlState} status 
         * @returns {void}
         */
        _setFormGroupStatus: function (status) {
            this.setState(this._getStatusFromChildren() ? AbstractControlState.INVALID : status);
        },

        /**
         * 
         * @override @private @function isInvalid
         * @returns {boolean} 
         */
        _isInvalid: function(){
            return this.hasErrors() || this._getStatusFromChildren();
        },

        /**
         * @private @function getStatusFromChildren 
         */
        _getStatusFromChildren: function(){
            const _this = this;
            return (Object.keys(this.controls).map(function(key){
                return !_this.controls[key].valid
            }).filter(Boolean).length > 0);
        }
    });

    /**
     * Acts as constructor
     */
    formGroup.value = {};

    Object.keys(controls).forEach(function (key) {
        if ([TYPE_FORMCONTROL, TYPE_FORMGROUP].indexOf(controls[key]._constructName) > -1) {
            formGroup.controls[key] = controls[key];
            controls[key].parent = formGroup;
        }
    });

    const formsService = inject(FormsService);
    formsService.addFormGroup(formGroup);

    return formGroup;
};
