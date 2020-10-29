import React from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { Container as ContainerBase } from "components/misc/Layouts";
import tw from "twin.macro";
import styled from "styled-components";
import { css } from "styled-components/macro"; //eslint-disable-line
import illustration from "images/design-illustration.svg";
import { ReactComponent as SignUpIcon } from "feather-icons/dist/icons/user-plus.svg";
import axios from "axios";

const Container = tw(ContainerBase)`min-h-screen bg-blue-900 text-white font-medium flex justify-center -m-8`;
const Content = tw.div`max-w-screen-xl m-0 sm:mx-20 sm:my-16 bg-white text-gray-900 shadow sm:rounded-lg flex justify-center flex-1`;
const MainContainer = tw.div`lg:w-1/2 xl:w-5/12 p-6 sm:p-12`;
const MainContent = tw.div`mt-12 flex flex-col items-center`;
const Heading = tw.h1`text-2xl xl:text-3xl font-extrabold`;
const FormContainer = tw.div`w-full flex-1 mt-8`;
const Form = tw.form`mx-auto max-w-xs`;
const Input = tw.input`w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5 first:mt-0`;
const SubmitButton = styled.button`
  ${tw`mt-5 tracking-wide font-semibold bg-primary-500 text-gray-100 w-full py-4 rounded-lg hover:bg-primary-900 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none`}
  .icon {${tw`w-6 h-6 -ml-2`}}
  .text {${tw`ml-3`}}`;
const IllustrationContainer = tw.div`sm:rounded-r-lg flex-1 bg-purple-100 text-center hidden lg:flex justify-center`;
const IllustrationImage = styled.div`
  ${props => `background-image: url("${props.imageSrc}");`}
  ${tw`m-12 xl:m-16 w-full max-w-lg bg-contain bg-center bg-no-repeat`}
`;

export default class Signup extends React.Component{
  constructor(props){
    super(props);
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onChangePass = this.onChangePass.bind(this);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      email:'',
      password:'',
      username:''
    }
  }
  //Information below is needed to fill the form for a new user, Email, Password, Username
  onChangeEmail(e) {
    this.setState({
      email: e.target.value
    })
  }

  onChangePass(e) {
    this.setState({
      password: e.target.value
    })
  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    })
  }

  onSubmit(e) {
    //Prevent the default handling of the event
    e.preventDefault();

    //New object to be sent to backend server
    const checkUser = {
        email: this.state.email,
        password: this.state.password,
        username: this.state.username
    }
    
    axios.post('http://localhost:4000/webappdbs/signup/', checkUser)
        .then(res => {
          if(res.status === 200){ //if new user is stored successfully
            window.location.href = ("http://localhost:3000/login"); //load login page
          }else if(res.status === 400){ //else reload
            window.location.href = ("http://localhost:3000/signup");
          }
        })
        .catch(e => {
          alert("Email already in use.\nTry again.");
        });
  
    this.setState({
      email:'',
      password:'',
      username:''
    })
  }


  render(){
    const illustrationImageSrc = illustration;
    const headingText = "Sign Up For LearnIo";
    const submitButtonText = "Sign Up";
    const SubmitButtonIcon = SignUpIcon;
    const tosUrl = "#";
    const privacyPolicyUrl = "#";
    const signInUrl = "/login";

    return(
      <AnimationRevealPage>
        <Container>
          <Content>
            <MainContainer>
              
              <MainContent>
                <Heading>{headingText}</Heading>
                <FormContainer>
                  <Form onSubmit={this.onSubmit}>
                    <Input type="email" placeholder="Email" value = {this.state.email} onChange={this.onChangeEmail}/>
                    <Input type="username" placeholder="Username"  value = {this.state.username} onChange={this.onChangeUsername}/>
                    <Input type="password" placeholder="Password"  value = {this.state.password} onChange={this.onChangePass}/>
                    <SubmitButton type="submit">
                      <SubmitButtonIcon className="icon" />
                      <span className="text">{submitButtonText}</span>
                    </SubmitButton>
                    <p tw="mt-6 text-xs text-gray-600 text-center">
                      I agree to abide by LearnIo's{" "}
                      <a href={tosUrl} tw="border-b border-gray-500 border-dotted">
                        Terms of Service
                      </a>{" "}
                      and its{" "}
                      <a href={privacyPolicyUrl} tw="border-b border-gray-500 border-dotted">
                        Privacy Policy
                      </a>
                    </p>

                    <p tw="mt-8 text-sm text-gray-600 text-center">
                      Already have an account?{" "}
                      <a href={signInUrl} tw="border-b border-gray-500 border-dotted">
                        Sign In
                      </a>
                    </p>
                  </Form>
                </FormContainer>
              </MainContent>
            </MainContainer>
            <IllustrationContainer>
              <IllustrationImage imageSrc={illustrationImageSrc} />
            </IllustrationContainer>
          </Content>
        </Container>
      </AnimationRevealPage>
      
  )}};
