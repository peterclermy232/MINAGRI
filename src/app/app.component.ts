import { Component ,ElementRef} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './shared/auth.service';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'admindashboard';
  showLayout = false;

  // Define public routes where layout should be hidden
  publicRoutes = ['/login', '/register', '/', '/pages-error404'];
  constructor(private elementRef: ElementRef,
     public  _router: Router,
     private authService: AuthService
  ) { }

  ngOnInit() {

    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "../assets/js/main.js";
    this.elementRef.nativeElement.appendChild(s);
    // Listen to route changes
    this._router.events
  .pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd)
  )
  .subscribe((event) => {
    const isPublicRoute = this.publicRoutes.includes(event.url);
    const isLoggedIn = this.authService.isloggedInUserTokenUsable();

    this.showLayout = !isPublicRoute && isLoggedIn;
  });

  }
}
