// src/app/pipes/filter.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], key: string, value: any): any[] {
    if (!items || !key) {
      return items;
    }

    return items.filter(item => item[key] === value);
  }
}

// Add this pipe to your app.module.ts declarations:
// import { FilterPipe } from './pipes/filter.pipe';
// declarations: [
//   ...
//   FilterPipe
// ]
