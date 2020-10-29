import React from "react";
import tw from "twin.macro";
import {Tab,AppBar,TablePagination,Button} from "@material-ui/core";
import {TabContext,TabList,TabPanel} from '@material-ui/lab/'
import Header from "../components/headers/light.js";
import {useTable} from 'react-table';
import MaUTable from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Checkbox from "@material-ui/core/Checkbox";
import axios from 'axios';
import {Link} from "react-router-dom";
const Container = tw.div`relative`;

///Header of courses's table
const columns = [
  {
    Header: "Courses",
    columns: [
      {
        Header: "Title",
        accessor: "title"
      },
      {
        Header: "Field",
        accessor: "coursefield"
      },
      {
        Header: "Difficulty",
        accessor: "difficulty"
      }
    ]
  }
];
//Helping variable for checkboxes selection
let selectedInit = []

const Table = ({ columns, data}) => {
  const { getTableProps, headerGroups, rows} = useTable({columns,data}); //data given by the main class below when calling the table function
  
  //Pagination 
  const rowsPerPage =10;
  const [page, setPage] = React.useState(0);
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  //Checbox utilities
  let [selected, setSelected] = React.useState([]);
  if(selected.length === 0){
    selected = selectedInit;
  }
  const isSelected = (courseid) => selected.indexOf(courseid) !== -1;
  //On newly selected checkbox change its appearance
  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    selectedInit = newSelected;
    setSelected(newSelected);
  };
  
  //On button click send new courses' selection to server
  const handleClickButton = e => {
    const request = {"id":localStorage.id,selected}
    axios.post('http://localhost:4000/webappdbs/coursessubmit/',request)
        .then(res => {
          if(res.status === 200){
            selectedInit = selected;
            alert("New preferences submitted!");
          }else{
            console.log("error")
          }
        })
        .catch(e => {
          console.log(e);
        });
      }

  //Rendered table
  return (
    <MaUTable {...getTableProps()} size="small" >
      <TableHead>
        {headerGroups.map(headerGroup => (
          <TableRow {...headerGroup.getHeaderGroupProps()} >
            {headerGroup.headers.map(column => (
              <TableCell {...column.getHeaderProps()}>
                {column.render("Header")}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableHead>

      <TableBody>
        {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
          return(
            <TableRow hover key={row.original.courseid}>
              <TableCell allign='left' component={Link} to={`/course/${row.original.courseid}/`}>{row.original.courseid}</TableCell>
              <TableCell allign='left'>{row.original.coursefield}</TableCell>
              <TableCell allign='left'>{row.original.difficulty}</TableCell>
              <TableCell padding="checkbox">
                <Checkbox checked={isSelected(row.original.courseid)} onClick={(event) => handleClick(event, row.original.courseid)} inputProps={{ 'aria-labelledby': row.original.courseid}} />
              </TableCell>
            </TableRow>
          )})
        }
      </TableBody>
      <TablePagination rowsPerPageOptions={[10]} component="div" count={rows.length} rowsPerPage={rowsPerPage} page={page} onChangePage={handlePageChange} />
      <Button variant="contained" size="large" color="primary" onClick={handleClickButton}>Submit</Button>
    </MaUTable>
  );
};

export default class coursesTable extends React.Component{

  constructor(props){
    super(props);
    this.state = {courses :[],file:null,TabValue:'0',page:0};
    this.handleTabChange = this.handleTabChange.bind(this);
  }

  //Get courses accordingly to selected tab, 0-> taken, 1-> avaiable, 2-> recommended
  handleTabChange(e,value){
    e.preventDefault();
    axios.get('http://localhost:4000/webappdbs/courses?ID='+localStorage.id+'|'+value)
        .then(response => {
          this.setState({
            courses: response.data,
            TabValue: value
          });
        })
        .catch(function (error ){
            console.log(error);
        })
  }

  componentWillMount(){ //before loading the page get taken courses and load the first tab
    axios.get('http://localhost:4000/webappdbs/courses?ID='+localStorage.id+'|0')
        .then(response => {
          response.data.forEach(element => {
            selectedInit = selectedInit.concat(element.courseid)  
          });
          this.setState({courses: response.data});
        })
        .catch(function (error ){
            console.log(error);
        })
        
  }
  
  render(){
    return(
      <Container>
        <Header/>
        <TabContext value={this.state.TabValue}>
          <AppBar position="static">
            <TabList onChange={this.handleTabChange} aria-label="simple tabs example">
              <Tab label="Taken" value="0"/>
              <Tab label="Available" value="1"/>
              <Tab label="Proposed" value="2"/>
            </TabList>
          </AppBar>

          <TabPanel value="0">
          <Table columns={columns} data={this.state.courses}/>
          </TabPanel>
          <TabPanel value="1">
          <Table columns={columns} data={this.state.courses}/>
          </TabPanel>
          <TabPanel value="2">
            <Table columns={columns} data={this.state.courses}/>
          </TabPanel>

        </TabContext>
      </Container>

    )
  }
};
