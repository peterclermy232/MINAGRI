import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http' ;
import { map } from "rxjs/operators"

@Injectable({
  providedIn: 'root'
})
export class FarmerService {

  constructor(private http : HttpClient) { }
  postFarmer(data:any){
    return this.http.post<any>("http://localhost:3000/posts",data)
    .pipe(map((res:any)=>{
      return res;
    }))
  }
  getFarmer(){
    return this.http.get<any>("http://localhost:3000/posts")
    .pipe(map((res:any)=>{
      return res;
    }))
  }
  updateFarmer(data:any,id:number){
    return this.http.put<any>("http://localhost:3000/posts/"+id,data)
    .pipe(map((res:any)=>{
      return res;
    }))
  }
}
