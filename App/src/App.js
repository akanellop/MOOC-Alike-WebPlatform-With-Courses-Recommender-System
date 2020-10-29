import "tailwindcss/dist/base.css";
import "styles/globalStyles.css";
import React from "react";

//import template pages from treact-ui
import Hero from "components/hero/FullWidthWithImage.js";
import Footer from "components/footers/MiniCenteredFooter.js";
import CoursesTable from "pages/coursesTable.js";
import LoginPage from "pages/Login.js";
import SignupPage from "pages/Signup.js";
import CoursePage from "pages/CoursePage.js";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

export default function App() {
    return (
    <Router>
      <Switch>
        <Route path="/courses"> {/*Page that displays table of all available , all taken and all recommended courses based on selected tab*/}
          <CoursesTable/>
          <Footer/>
        </Route>  
        <Route path="/course/:id" component={CoursePage}> {/*Page that display the contents of a chosen course*/} 
        </Route>
        <Route path="/signup"> {/*Signup route */}
          <SignupPage />
        </Route>
        <Route path="/main"> {/*Main page route */}
          <Hero />
          <Footer/>
        </Route>
        <Route path="/"> {/*Login route */}
          <LoginPage />
        </Route>
      </Switch>
    </Router>
  );
}