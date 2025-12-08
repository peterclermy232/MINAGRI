import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class NotifierService {
  constructor() {}

  // ------------------- TOAST NOTIFICATION -------------------
  showToast(data: { typ: 'success' | 'error'; message: string }) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    return Toast.fire({
      icon: data.typ,
      title: data.message,
    });
  }

  // ------------------- SWEET ALERT (INFO, WARN, ERROR, SUCCESS) -------------------
  showSweetAlert(data: {
    typ: 'success' | 'error' | 'warning';
    message: string;
    timer?: boolean;
  }): Promise<any> {
    const title =
      data.typ === 'success'
        ? 'Success!'
        : data.typ === 'warning'
        ? 'Warning!'
        : 'Error!';

    if (data.timer) {
      return Swal.fire({
        icon: data.typ as SweetAlertIcon,
        title,
        text: data.message,
        timer: 2000,
        showCancelButton: false,
        showConfirmButton: false,
      });
    }

    return Swal.fire({
      icon: data.typ as SweetAlertIcon,
      title,
      text: data.message,
    });
  }

  // ------------------- CONFIRMATION DIALOG -------------------
  confirm(
    message: string,
    confirmText: string = 'Yes',
    cancelText: string = 'Cancel'
  ): Promise<any> {
    return Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      html: `<div style="font-size:16px">${message}</div>`,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
    });
  }
}
