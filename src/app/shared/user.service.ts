import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http : HttpClient) { }

  postUser(data:any){
    return this.http.post<any>("https://minagri.swiftcoins.co.ke/api/v1/users",data)
    .pipe(map((res:any)=>{
      return res;
    }))
  }
  getUser(){
    return this.http.get<any>("https://minagri.swiftcoins.co.ke/api/v1/users")
    .pipe(map((res:any)=>{
      return res;
    }))
  }
  updateUser(data:any,id:number){
    return this.http.put<any>("https://minagri.swiftcoins.co.ke/api/v1/users/"+id,data)
    .pipe(map((res:any)=>{
      return res;
    }))
  }
}
