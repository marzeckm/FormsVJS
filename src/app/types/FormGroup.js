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
         * Gibt anhand eines Schlüssels oder eine Liste dieser ein Control der 
         * Formgroup zurück.
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
         * Fügt ein Control der FormGroup hinzu
         * 
         * @public @function addControl
         * @param {string} name 
         * @param {AbstractControl} control 
         * @param {{emitEvent?:boolean}} options 
         * @returns {void}
         */
        addControl: function (name, control, options) {
            this.controls[name] = control;
            control.parent = this;

            if (options[EMIT_EVENT] !== false) {
                this._refreshValue();
            } else {
                this.value[name] = control;
            }
        },

        /**
         * Entfernt ein Control aus der FormGroup
         * 
         * @public @function removeControl
         * @param {string} name 
         * @param {{emitEvent:boolean}} options 
         * @returns {void}
         */
        removeControl: function (name, options) {
            this.controls[name] = undefined;

            if (options[EMIT_EVENT] !== false) {
                this._refreshValue();
            } else {
                this.value[name] = undefined;
            }
        },

        /**
         * Markiert das alle Unterelemente als berührt
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
         * Markiert das alle Unterelemente als unberührt
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
            return (Object.keys(this.controls).map(function(key){
                return !controls[key].valid
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