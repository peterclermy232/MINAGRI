import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-pages-login',
  templateUrl: './pages-login.component.html',
  styleUrls: ['./pages-login.component.css']
})
export class PagesLoginComponent implements OnInit {

  constructor(private router:Router) { }

  ngOnInit(): void {
  }

  handleLogin(){
    this.router.navigateByUrl('/home')
  }

}
