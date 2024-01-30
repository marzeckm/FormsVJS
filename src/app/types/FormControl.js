/**
 * @class FormControl
 * @author {Maximilian Marzeck}
 */
const FormControl = function(){
    const formControl = ifExtends(AbstractControl, {
        // Nothing to do
    });

    /**
     * Acts as Constructor
     */
    formControl._constructName = 'FormControl';
    formControl._init();

    const formsService = inject(FormsService);
    formsService.addFormControl(formControl);

    return formControl;
}