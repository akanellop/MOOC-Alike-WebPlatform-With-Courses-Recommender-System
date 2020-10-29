import React from "react";
import tw from "twin.macro";
import axios from 'axios';
import Header from "../components/headers/light.js";
import Footer from "../components/footers/MiniCenteredFooter.js";
import styled from "styled-components";
import VideoPlayer from 'react-video-js-player';
import ReactAudioPlayer from 'react-audio-player';
import StarRatings from 'react-star-ratings';
import {Grid,Avatar,Switch,Button} from '@material-ui/core';
import {PrimaryButton} from "../components/misc/Buttons";

const SecondaryButton = tw.text`font-bold px-2 lg:px-1 py-3 rounded text-green-400 text-xs `;
const SecondaryButton2 = tw.text`font-bold px-2 lg:px-1 py-3 rounded text-teal-800 `;
const Paragraph = tw.p`my-5 lg:my-8 text-sm lg:text-base font-medium text-white max-w-lg mx-auto lg:mx-0`;
const Container = tw.div`relative`;
const OpacityOverlay = tw.div`z-10 absolute inset-0 bg-purple-800 opacity-75`;
const HeroContainer = tw.div`z-10 relative px-1 sm:px-8 mx-auto h-full flex flex-col  `;
const Content = tw.div`px-4 flex flex-1 flex-col justify-center items-center`;
const Heading = styled.h1`${tw`text-3xl text-center sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-100 leading-snug -mt-24 sm:mt-0`}span {${tw`inline-block mt-2`}}`;

//Load and display files that represent each available content tye of items
const video_dir =()=>{ return(<Grid item> <VideoPlayer controls={true} src={'/content_files/videoplayback.mp4'} width="720" height="420" /> </Grid>)} 
const pdf_dir =()=>{
    return(
    <Grid item>
        <PrimaryButton as="a" style={{display: "table-cell"}} href={'/content_files/Κινητός & διάχυτος- Report.pdf'} target = "_blank" rel = "noopener noreferrer">
            Click here for PDF.
        </PrimaryButton>
    </Grid>)}  
const audio_dir=()=>{return(<Grid item><ReactAudioPlayer src= {'/content_files/Graph Data Structure 4. Dijkstras Shortest Path Algorithm.mp3'} autoPlay= {false} controls = {true} /></Grid>)} 
const form_src =()=>{return(<Grid item><PrimaryButton as="a" style={{display: "table-cell"}} 
href={'https://docs.google.com/forms/d/e/1FAIpQLSePiz-m8AUo_i69mhBRVTr8SyLT-R7EO8DAXckzKZVdP4sPAA/viewform?usp=sf_link'}
target = "_blank" rel = "noopener noreferrer">Click here for Quiz.</PrimaryButton></Grid>)} 
const literat_rec = () =>{
    return(
        <Container>
        <Grid container wrap="wrap" alignContent="center" spacing={6}>
            <Grid item>
            <SecondaryButton2>EXTRA LITERATURE SOURCES:</SecondaryButton2><br></br>
            </Grid>
            <Grid item>
            <SecondaryButton2>Head-First Python, 2nd edition, Paul Barry (O’Reilly, 2016)</SecondaryButton2><br></br>
            <SecondaryButton2>Invent Your Own Computer Games with Python, 4th edition, Al Sweigart (No Starch, 2017)</SecondaryButton2><br></br>
            <SecondaryButton2>Think Python: How to Think Like a Computer Scientist, 2nd edition, Allen B. Downey (O’Reilly, 2015)</SecondaryButton2>
            </Grid>
        </Grid>
        </Container>
    )
}

//Flags for displaying the needed types if the course has it in its curriculum
let content_types = {
    extralit: false,
    exercises: false,
    audios: false,
    videos: false,
    scripts: false
}
let counterDisplay = 0;
let counterForScore = 0;
const counterToDisplay=()=>{
    counterDisplay++;
    return(counterDisplay);
}

//Message example for course's header
const message = "This course aims to teach everyone the basics of programming computers using Python. We cover the basics of how one constructs a program from a series of simple instructions in Python. The course has no pre-requisites and avoids all but the simplest mathematics.Anyone with moderate computer experience should be able to master the materials in this course.This course will cover Chapters 1-5 of the textbook “Python for Everybody”. "

export default class CoursePage extends React.Component{
    constructor(props){
        super(props);
        this.toDisplay=this.toDisplay.bind(this);
        this.onChangeTask= this.onChangeTask.bind(this);
        this.onStarClick = this.onStarClick.bind(this);
        this.onScoreSubmit = this.onScoreSubmit.bind(this);
        //Information about the course
        this.state = {
            courseid :this.props.location.pathname.slice(8,-1),
            rating:0,
            score:0,
            completed: false,
            array_of_contents: [false,false,false,false,false]   //[videos,audios,exercises,scripts,extraliterature] 
        };
    }

    //Call functions accordingly to the needed contents
    toDisplay(i){
        return(
            <div>
            <Grid container wrap="wrap" alignContent="center" spacing={6}>
                <Grid item> <Avatar>{counterToDisplay()}</Avatar> </Grid>
                {i===0 ? video_dir():null}
                {i===1 ? audio_dir():null}
                {i===2 ? form_src():null}
                {i===3 ? pdf_dir():null}
                {i===4 ? literat_rec():null}
            </Grid>
            <div style={{float: 'right'}}> 
                <SecondaryButton>Completed Task: </SecondaryButton>
                <Switch color='primary' onChange={(event)=>this.onChangeTask(i)} checked={this.state.array_of_contents[i]}/>
            </div>
        </div>
    )}
    
    //Change course's rating and updating the server
    onStarClick(nextValue, prevValue, name) {
        this.setState({rating: nextValue});
        const ratingJSON = {
            userid: localStorage.id,
            courseid: this.state.courseid,
            rating: nextValue
        }
        axios.post('http://localhost:4000/webappdbs/newrating/', ratingJSON)
        .then(res => {
          if(res.status === 200){
            console.log("New rating sent successfully");
            this.setState({
                rating:nextValue
            })
          }else if(res.status === 400){
            console.log("error sending new rating to server");
          }
        })
        .catch(e => {
            console.log(e);
        });
    }
 
    //Function that changes the score / progress of the course if the user xhange a task's completion
    onChangeTask(i){
        if(this.state.array_of_contents[i]===true){
            counterForScore-=25;
        }else{
            counterForScore+=25;
        }
        this.setState(state=>{
         const list = this.state.array_of_contents;
         list[i]=!list[i];
            return(list)
        });
    }
    //Submit new score
    onScoreSubmit(e) {
        const scoreJSON = {
            userid: localStorage.id,
            courseid: this.state.courseid,
            score: counterForScore,
            listToBeReturned: this.state.array_of_contents
        };
        console.log(this.state.score)
        axios.post('http://localhost:4000/webappdbs/newscore/', scoreJSON)
        .then(res => {
            console.log("new score")
            if(res.status === 200){
                this.setState(state=>{
                    const list = res.data;
                    return(list)
                });
            }
            else if(res.status === 400){
                console.log("error sending new rating to server");
            }
        })
        .catch(e => {
            console.log(e);
        });
    }

    componentWillMount () { //Before loading the page for the user, 
        content_types.audios=false;
        content_types.videos=false;
        content_types.exercises=false;
        content_types.extralit=false;
        content_types.scripts=false;
        
        axios.get('http://localhost:4000/webappdbs/course/'+localStorage.id+'|'+this.state.courseid)
        .then(res => {
            if( res.status === 200){
                console.log(res.data.content)
                res.data.content.split('|').forEach(element =>{ //get the information about the needed content
                    if(element==='audios'){content_types.audios=true;counterDisplay++;}
                    else if(element==='videos'){content_types.videos=true;counterDisplay++;}
                    else if(element==='scripts'){content_types.scripts=true;counterDisplay++;}
                    else if(element==='exercises'){content_types.exercises=true;counterDisplay++;}
                    else if(element==='extraliterature'){content_types.extralit=true;counterDisplay++;}

                })
                if(res.data.score===100){ //get the information about the course's completion
                    this.setState({
                        completed:true,
                        rating: res.data.ratings,
                        score:res.data.score,
                        array_of_contents:[true,true,true,true,true]
                    })
                }else if(res.data.score===0){
                    this.setState({
                        rating: res.data.ratings,
                        score:res.data.score
                    })
                }else{
                    let tempList = Array(4).fill().map(() => Math.floor(Math.random() * 10) )
                    tempList = tempList.map(element => {
                        if(element>=5){counterForScore+=25;return(true);}
                        else{return(false)}
                    });
                    tempList.push(false);
                    this.setState({
                        rating: res.data.ratings,
                        score:res.data.score,
                        array_of_contents:tempList
                    })
                }
            }else if(res.status === 400){
                console.log("error gettin rating from server");
            }
        })
        .catch(e => {
            console.log(e);
        });
    }

    render(){
        counterDisplay=0;
        return(
            <Container>
                <Header/>
                <Container>
                    <OpacityOverlay />
                    <HeroContainer>
                        <StarRatings rating={this.state.rating} starRatedColor="#a5c5e5" changeRating={this.onStarClick.bind(this)}
                        numberOfStars={5} name='rating' starDimension={'40px'} starEmptyColor={'#d5d9d1'} starHoverColor 	="#a5c5e5" />
                        <Content>
                            <Heading>
                                CourseID {this.state.courseid}:
                                <br />
                                Programming for Everybody (Getting Started with Python)
                                </Heading>
                        </Content>
                        <Paragraph>{message}</Paragraph>
                    </HeroContainer>
                </Container>
                <br></br>
                {content_types.videos ? (this.toDisplay(0)):(null)}
                {content_types.audios ? (this.toDisplay(1)):(null)}
                {content_types.exercises ? (this.toDisplay(2)):(null)}
                {content_types.scripts ? (this.toDisplay(3)):(null)}
                {content_types.extralit ? (this.toDisplay(4)):(null)}
                        
                <br></br><br></br><br></br><br></br><br></br><br></br>
                <div style={{float: 'right'}}>
                <Button variant="contained" size="large" color="primary" onClick={this.onScoreSubmit}>Submit</Button>
                </div>
                <br></br><br></br>
                <Footer/>
            </Container>
        )
    }
}

