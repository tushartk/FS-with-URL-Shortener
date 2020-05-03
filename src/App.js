import React, {Component} from 'react';
import './App.css';

import {Container, Tab, Tabs} from "react-bootstrap";
import FileSystem from "./FileSystem";
import UrlShortener from "./UrlShortener";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    render() {
        return (
            <div className="App">
                <Container fluid>
                    <Tabs defaultActiveKey="filesystem" transition={false} id="noanim-tab-example">
                        <Tab eventKey="filesystem" title="File System">
                            <FileSystem />
                        </Tab>
                        <Tab eventKey="urlShortener" title="Url Shortener">
                            <UrlShortener />
                        </Tab>
                    </Tabs>
                    {/*<Navbar expand="lg" bg="light" variant="light">*/}
                    {/*    <Navbar.Brand>File System Upload</Navbar.Brand>*/}
                    {/*    <Nav className="mr-auto">*/}
                    {/*        <Nav.Link>Home</Nav.Link>*/}
                    {/*    </Nav>*/}
                    {/*</Navbar>*/}
                </Container>
            </div>
        );
    }
    ;
}

export default App;
