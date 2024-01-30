/**
 * @class FormGroup
 * @author {Maximilian Marzeck}
 */
const FormGroup = function (controls) {
    const formGroup = ifExtends(AbstractControl, {
        _constructName: 'FormGroup',

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
            if (typeof key === 'string') {
                return this.controls[key];
            } else if (key?.constructor === 'Array') {
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

            if (options['emitEvent'] !== false) {
                this._refreshValue();
            } else {
                this.value[name] = undefined;
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

            if (options['emitEvent'] !== false) {
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
            Object.entries(this.controls).forEach(([key, control]) => {
                if (control.constructor === FormGroup) {
                    control.markAllAsTouched();
                }
                control.markAsTouched();
            });
        },

        /**
         * Markiert das alle Unterelemente als unberührt
         * @public @function markAllAsUntouched
         * @returns {void}
         */
        markAllAsUntouched: function () {
            this.markAsUntouched();
            Object.entries(this.controls).forEach((control) => {
                control.markAsUntouched();
            });
        },

        /**
         * @private @function refreshValue
         * @returns {void}
         */
        _refreshValue: function () {
            const tempValue = {};
            Object.entries(this.controls).forEach(([key, control]) => {
                tempValue[key] = control.value;
            })
            this.setValue((this._dataType) ? this._dataType.deserialize(tempValue) : tempValue);
        },

        /**
         * @private @var setFormGroupStatus
         * @param {AbstractControlState} status 
         * @returns {void}
         */
        _setFormGroupStatus: function (status) {
            this.setState((Object.values(this.controls).map((entry) =>
                !entry.valid).filter((entry) => entry).length > 0)
                ? AbstractControlState.INVALID : status);
        }
    });

    /**
     * Acts as constructor
     */
    formGroup.value = {};

    Object.keys(controls).forEach(function (key) {
        if (controls[key]._construct = 'FormControl') {
            formGroup.controls[key] = controls[key];
            controls[key].parent = formGroup;
        }
    });

    formGroup._init();

    const formsService = inject(FormsService);
    formsService.addFormGroup(formGroup);

    return formGroup;
};