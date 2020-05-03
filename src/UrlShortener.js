import React, {Component} from 'react';
import './UrlShortener.css';
import {Button, Form, Card} from "react-bootstrap";
import Alert from "react-bootstrap/Alert";


class UrlShortener extends Component {
    constructor(props) {
        super(props);
        this.state = {
            urlToShorten: '',
            shortenedUrl: '',
            alertMessage: '',
            alertVariant: 'danger',
            showAlert: false
        };
    }

    updateUrlInputValue = (event) => {
        this.setState({
            urlToShorten: event.target.value
        })
    }

    showErrorDialog = (message) => {
            this.setState({
                showAlert: true,
                alertMessage: message,
            })
            setTimeout(() => {
                this.setState({
                    showAlert: false,
                    alertMessage: '',
                })
            }, 5000)
    }

    fetchShortenedUrl = () => {
        this.setState({
            shortenedUrl: ''
        })
        const url = 'http://localhost:5000/shorten'
        fetch(url, {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'url': this.state.urlToShorten}),
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    // to Show the error message if it was an error
                    this.showErrorDialog(data.message)
                } else {
                    // else show the shortened url
                    this.setState({
                        shortenedUrl: data.body
                    })
                }
            })
            .catch((error) => {
                this.showErrorDialog(error.message)
            });
    }

    render() {
        return (
            <div className="UrlShortener">

                <Card style={{width: '40rem'}}>
                    <Card.Body>
                        <Card.Title>Enter the URL to shorten</Card.Title>
                        <Form>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>Paste the URL</Form.Label>
                                <Form.Control type="text"
                                              value={this.state.urlToShorten}
                                              onChange={this.updateUrlInputValue}
                                              placeholder="Enter the URL to shorten"/>
                            </Form.Group>
                        </Form>
                        <Card.Text>
                            The shortened URL is: <a href={this.state.shortenedUrl}>{this.state.shortenedUrl}</a>
                        </Card.Text>
                        <Button variant="primary" onClick={this.fetchShortenedUrl}>
                            Shorten
                        </Button>

                    </Card.Body>
                </Card>
                {this.state.showAlert && <Alert variant={this.state.alertVariant} className="alert-msg">
                    {this.state.alertMessage}
                </Alert>}
            </div>
        )
    }
}

export default UrlShortener;