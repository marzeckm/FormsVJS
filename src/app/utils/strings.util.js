/**
 * Errors
 */
const ERROR_VALIDATORS_PATTERN = 'ValidatorFn have to be build in the following pattern: (abstractControl:AbstractControl) => {key:string : value:string} | null.';
const ERROR_VALIDATOR_CONTAIN_FN = 'Validators have to contain a function that returns either null (no Error) or an Object (Error)!';
const ERROR_CONTROL_STATE = 'The requested Control-State is not available.';
const ERROR_ONLY_ONE_ATTRIBUTE = 'You can only set one of these attributes per DOM-Element: formGroupName, formGroup, formControlName or formControl!';

/**
 * Data types
 */
const TYPE_OBJECT = 'object';
const TYPE_STRING = 'string';
const TYPE_ARRAY = 'Array';
const TYPE_FUNCTION = 'function';
const TYPE_FORMGROUP = 'FormGroup';
const TYPE_FORMCONTROL = 'FormControl';

/**
 * other
 */
const EMIT_EVENT = 'emitEvent';
const FORMCONTROL_NAME = 'formControlName';
const FORMGROUP_NAME = 'formGroupName';
const FORMCONTROL = 'formControl';
const FORMGROUP = 'formGroup';