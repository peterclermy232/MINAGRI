import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
@Injectable({
  providedIn: 'root',
})
export class NotifierService {
  constructor() {}
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

    Toast.fire({
      icon: data.typ,
      title: data.message,
    });
  }

  showSweetAlert(data: {
    typ: 'success' | 'error';
    message: string;
    timer?: boolean;
  }) {
    const title = data.typ === 'success' ? 'Success!' : 'Error Occurred!';
    if (data.timer) {
      console.log('has timer');
      Swal.fire({
        icon: data.typ,
        title,
        text: data.message,
        timer: 2000,
        showCancelButton: false,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: data.typ,
        title,
        text: data.message,
      });
    }
  }
}
