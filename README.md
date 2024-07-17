# FormsVJS
[![JavaScript](https://img.shields.io/badge/javascript-black?style=for-the-badge&logo=javascript)](https://github.com/marzeckm)  
  
FormsVJS is a Vanilla JavaScript implementation inspired by the FormGroups and FormControls of the Angular framework. Its functions and capabilities closely mirror those of Angular. FormsVJS is delivered in a compressed form with a size of 8 KB. It facilitates the straightforward creation of forms that can be queried through JavaScript and transmitted via AJAX requests to APIs, with built-in validation features. FormsVJS extends support to a range of legacy browsers, including Internet Explorer 11, making it compatible with virtually any web project.

## Getting Started:
FormsVJS can be easily integrated into your project as a JavaScript script file. The necessary files can be found in the build folder within the FormsVJS GitHub repository. Download either the `FormsVJS.js` file (uncompressed) or `FormsVJS.min.js` file (compressed) and place it in the desired location within your project folder. Then, as illustrated in the following example, specify the file path within a script tag either in the `<head>` or `<body>` of your HTML document.

```
<script src="url/to/FormsVJS.min.js"></script>
```

Once you have integrated the desired file into your project, you can now utilize FormsVJS. However, ensure that your custom JavaScript code is executed only after FormsVJS has loaded. Additionally, when working with certain web frameworks that also rely on JavaScript, it is crucial to ensure that FormsVJS is executed on the client side.

## Usage Instructions:

To work with FormsVJS, the FormsService must be injected initially. FormsVJS provides the `include()` function for this purpose, serving as a straightforward implementation for Dependency Injection. It is essential to ensure consistent usage of the same FormsService object, making the use of `include()` mandatory. 

```
const formsService = inject(FormsService);
```

Once you have injected the `FormsService`, you can proceed with creating FormGroups and FormControls. FormGroups are objects equivalent to forms, containing all the elements of the form and capable of including any objects that inherit from the AbstractControl type. FormGroups can be created in various ways.
When creating FormGroups, it is crucial to note that the constructor cannot be called without arguments. The constructor requires an object `{}` to be passed as an argument.

Example 1: Creating a `FormGroup` with FormsService (without Children)
```
const formGroup = formsService.createFormGroup({});
```

Example 2: Creating a `FormGroup` with FormsService (with Children)
```
const formGroup = formsService.createFormGroup({
    id: FormControl(),
    name: FormControl(),
    address: FormGroup({
        street: FormControl(),
        number: FormControl()
    })
});
```

Example 3: Creating a `FormGroup` without FormsService (without Children)
```
const formGroup = FormGroup({});
```

Example 4: Creating a `FormGroup` without FormsService (with Children)
```
const formGroup = FormGroup({
    id: FormControl(),
    name: FormControl(),
    address: FormGroup({
        street: FormControl(),
        number: FormControl()
    })
});
```

In addition to `FormGroups`, `FormControls` can also be created. A `FormControl` is equivalent to an input element in a form and contains only one value. A `FormControl` has no children elements. `FormControls` can be created in various ways.

Example 5: Creating a `FormControl` with FormsService
```
const formControl = formsService.createFormControl();
``` 

Example 6: Creating a `FormControl` without FormsService
```
const formControl = FormControl();
```

Once you have created a `FormGroup` with the corresponding elements, you need to connect it to the form elements in your HTML code. To do this, create a form in your HTML code and assign a unique ID to the top element of your form, which you can use to locate the form later. Additionally, add a button of type "Button" and assign an event, for example, via `onclick`. You can link individual input elements by specifying the field's name in the form under `formControlName`. If you have a sub-`FormGroup` within your main `FormGroup`, you can assign it to a wrapper element via `formGroupName` and the sub-`FormControls` within it via `formControlName`.

Example 7: A form in HTML code
```
<div id="formGroup" formGroup="formGroup">
    <div class="input-wrapper">
        <label for="id">ID</label>
        <input type="text" id="id" placeholder="Enter your ID (optional)" formControlName="id"/>
    </div>
    <div class="input-wrapper">
        <label for="name">Name *</label>
        <input type="text" id="name" placeholder="Enter your name" formControlName="name"/>
    </div>
    <div formGroupName="address">
        <h3>Address</h3>
        <div class="input-wrapper">
            <label for="street">Street *</label>
            <input type="text" id="street" placeholder="Enter a valid street name" formControlName="street"/>
        </div>
        <div class="input-wrapper">
            <label for="housenumber">Housenumber *</label>
            <input type="text" id="housenumber" placeholder="Enter a valid number" formControlName="housenumber"/>
        </div>
    </div>
    <div class="button-wrapper">
        <button type="button" onclick="submit(this)">
            Send
        </button>
    </div>
</div>
```

Now, transition to the JavaScript code and inject the FormsService first (if you haven't injected it yet). Next, link the form with the `init()` method of the FormsService. In the following example, the `formGroup` we created of type `FormGroup` is assigned to the HTML element with `id="formGroup"`.

Example 8: Initializing a FormGroup
```
const formsService = inject(FormsService);
formsService.init(document.querySelector('#formGroup'), formGroup);
```

If you now want to process the value of the FormGroup, implement the function assigned to the button (see Example 7). In this case, we name the function `submit()`. Within this method, you can now obtain the current FormGroup and process the result. In our example, we simply print the result to the console.

Example 9: Implementation of a method `submit()` for the button in the form.
```
function submit(buttonEl){
    const formsService = inject(FormsService);
    const formGroupResult = formsService.getFormGroupResult(buttonEl);

    console.log(formGroupResult.value);
}
```

You can add validators to all elements that inherit from the `AbstractControl` class. These validators check, with each input or when `markAsTouched()` is called, whether the entered value complies with the validator. If not, the class `.error` is added to the connected HTML element (if available). This allows you to, for example, easily apply red text or borders to an input with the class `.error` using CSS. Additionally, the errors for the respective `AbstractControl` can be viewed through the `errors` attribute, which contains an array of all errors for the element. Furthermore, the status of the `AbstractControls` and all of its parent elements is set to `INVALID`. The following example illustrates how a validator can be added to an `AbstractControl` and used.

Example 10: Using Validators
```
// Validator that checks that the value is not empty
const validatorNumber = function(control){ 
    return (!/^\d+$/.test(control.value) ? {onlyNumbers: 'This field only allowed numbers.'} : null)
};

// Validator that checks that the value only contains numbers
const validatorRequired = function(control){
    return (!control.value ? {required: 'This field is not optional. Enter a value.'} : null)
};

// add single Validator
const streetFormControl = FormControl();
streetFormControl.setValidators([validatorRequired]);

// add multiple Validators
const numberFormControl = FormControl();
numberFormControl.setValidators([validatorNumber, validatorRequired]);
```

If you want to apply a function to the value or the status of an object that inherits from the `AbstractControl` class, you can subscribe to these changes. For this purpose, `AbstractControl` includes the variables `statusChanges` and `valueChanges`. These are of type `SimpleObservable`, which is a stripped-down version of RxJS observables. Unlike RxJS observables, with `SimpleObservables`, you can only invoke the method `subscribe(() => {})`, and the use of `pipe()` and other functions is not possible. The `subscribe(() => {})` method takes a single parameter, a function to be executed when a new value or status is set. You can see an example implementation below. In the following example, each new value or status is logged to the console.

Example 11: Applying subscribe to statusChanges and valueChanges
```
formGroup.valueChanges.subscribe(function(value){
    console.log(value);
});

formGroup.statusChanges.subscribe(function(status){
    console.log(status);
});
```

## Requirements
- Text-Editor for editing the code files
- Min. Internet Explorer 11, Firefox 70, Google Chrome 70, Safari 11, Chromium 70

## Contribute
If you want to contribute to the development of this project, feel free to submit pull requests or open issues. Let's make the FormsVJS even better together!

## License
This project is licensed under the [MIT License](LICENSE).
