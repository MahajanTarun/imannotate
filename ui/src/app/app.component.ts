import { Component, OnInit } from '@angular/core';
import { environment } from '../environments/environment';
import { UserService } from './services/user.service';
import { User } from './classes/user';
import { Router } from '@angular/router';
import { ThemeService } from "./services/theme.service";
import { NavbarComponent } from "./components/nav/navbar/navbar.component";
import { ViewChild } from "@angular/core";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private _navbar: NavbarComponent;
  show = true

  @ViewChild(NavbarComponent)
  set navbar(v: NavbarComponent) {
    setTimeout( () => this._navbar = v);
  }
  title = 'Imannotate' + (environment.production ? '' : ' -- testing');

  constructor(
    private userservice: UserService,
    private router: Router,
    private themeService: ThemeService,
  ) { }

  ngOnInit() {

    this.themeService.setTheme();
    const luser = localStorage.getItem('user');

    if (luser !== null) {
      this.userservice.setCurrentUser(JSON.parse(luser));
      console.log('Yes, user found');
      if (location.pathname === "/") {
        this.router.navigate(['dashboard']);
      }
    } else {
      console.log('Hu... user NOT found');
      if (location.pathname !== "/signup") {
        this.router.navigate(['signin']);
      }
    }
  }

  showNav(v: boolean) {
    this._navbar.show = v;
    this.show = v;
    // fake resize event, annotator will need it
    const evt = new Event('resize', {bubbles: true});
    setTimeout(() => window.dispatchEvent(evt))
  }


  // on swipe, show or hide navbar. We need to invert
  // behavior if window.innerWidth is > 768 because the
  // default is to show navbar for that size, so the swipe
  // direction is inverted !
  onSwipe(evt: Event) {
    //prevent opening menu while user is drawing selection on annotator
    if (evt.target["tagName"] == "CANVAS") {
      return
    }
    if (Math.abs(evt["deltaX"]) < 80 ){
      return;
    }
    switch(evt["additionalEvent"]) {
      case "panleft":
        this.showNav(window.innerWidth < 768)
        break;
      case "panright":
        this.showNav(window.innerWidth > 768)
        break;
    }
  }
}
