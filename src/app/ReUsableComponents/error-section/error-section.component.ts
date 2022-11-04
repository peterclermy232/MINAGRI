import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-error-section',
  templateUrl: './error-section.component.html',
  styleUrls: ['./error-section.component.scss'],
})
export class ErrorSectionComponent implements OnInit {
  @Input() public inputObject:
    | { invalid: boolean; dirty: boolean; touched: boolean; errors: any }
    | undefined
    | null;
  @Input() public inputProperty!: string;
  @Input() public formSubmitted!: boolean;
  // error = {
  //   active: false,
  //   message: '',
  // };
  constructor() {}

  ngOnInit() {}

  get error() {
    if (this.inputObject) {
      const canSHowError =
        this.inputObject.invalid &&
        (this.inputObject.dirty ||
          this.inputObject.touched ||
          this.formSubmitted);
      if (canSHowError && this.inputObject.errors) {
        return {
          active: true,
          message: this.showMessage(this.inputObject.errors),
        };
      } else {
        return {
          active: false,
          message: '',
        };
      }
    } else {
      return {
        active: false,
        message: '',
      };
    }
  }

  showMessage(errorObj: any) {
    let userFriendlyInput =
      this.inputProperty.charAt(0).toUpperCase() + this.inputProperty.slice(1);

    if (userFriendlyInput.indexOf('_') > -1) {
      userFriendlyInput = userFriendlyInput.split('_').join(' ');
    }

    switch (Object.keys(errorObj)[0]) {
      case 'required':
        return `${userFriendlyInput} is a required field`;
      case 'minlength':
        return `${userFriendlyInput} is of invalid length`;
      case 'min':
        return `${userFriendlyInput} is of invalid length`;
      case 'max':
        return `${userFriendlyInput} is of invalid length`;
      case 'maxlength':
        return `${userFriendlyInput} is of invalid length`;
      case 'email':
        return `${userFriendlyInput} is not valid`;
      case 'server':
        return (
          errorObj.server.charAt(0).toUpperCase() + errorObj.server.slice(1)
        );
    }
  }
}
