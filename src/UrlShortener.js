import React, {Component} from 'react';
import './UrlShortener.css';
import {Alert, Button, Form, Card, Table} from "react-bootstrap";
import {faTimesCircle} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import urlData from './url.json';


class UrlShortener extends Component {
    constructor(props) {
        super(props);
        this.state = {
            urlToShorten: '',
            shortenedUrl: '',
            alertMessage: '',
            alertVariant: 'danger',
            showAlert: false,
            allUrlsData: []
        };
        this.deleteUrl = this.deleteUrl.bind(this)
    }

    fetchAllUrlData() {
        const url = urlData.url + 'fetchAllUrls'
        fetch(url)
            .then(response => response.json())
            .then(data => {
                this.setState({
                    allUrlsData: data.allUrls
                })
            })
            .catch((error) => {
                this.showAlertDialog(error.message)
            });
    }

    deleteUrl = (shortUrl) => {
        const url = urlData.url + '/deleteUrl'
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'short_url': shortUrl}),
        })
            .then(response => response.json())
            .then(data => {
                this.showAlertDialog(data.message, 'success')
                this.fetchAllUrlData()
            })
            .catch((error) => {
                this.showAlertDialog(error.message, 'danger')
            });
    }

    componentDidMount = () => {
        this.fetchAllUrlData()
    }

    updateUrlInputValue = (event) => {
        this.setState({
            urlToShorten: event.target.value
        })
    }

    showAlertDialog = (message, alertType) => {
        this.setState({
            showAlert: true,
            alertMessage: message,
            alertVariant: alertType
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
        const url = urlData.url + '/shorten'
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
                    if (data.body) {
                        this.showAlertDialog(data.message, 'success')
                        this.setState({
                            shortenedUrl: data.body
                        })
                        this.fetchAllUrlData()
                    } else {
                        // to Show the error message if it was an error
                        this.showAlertDialog(data.message, 'danger')
                    }
                } else {
                    // else show the shortened url
                    this.setState({
                        shortenedUrl: data.body
                    })
                    this.fetchAllUrlData()
                }
            })
            .catch((error) => {
                this.showAlertDialog(error.message, 'danger')
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
                        <Button variant="primary" onClick={this.fetchShortenedUrl}>
                            Shorten
                        </Button>
                        </Card.Body>
                            <Card.Body>
                            <Card.Text>
                            The shortened URL is: <a href={this.state.shortenedUrl}>{this.state.shortenedUrl}</a>
                        </Card.Text>
                    </Card.Body>
                </Card>

                <h5 className="short-url-heading">Short URL's stored in Database</h5>
                <div className="short-url-para">(Press x in options to delete them from database)</div>

                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Long URL</th>
                        <th>Short URL</th>
                        <th>Options</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.allUrlsData.map((row, i) => (
                            <tr key={i}>
                                <td>{i + 1}</td>
                                <td>{row.long_url}</td>
                                <td><a href={row.short_url}>{row.short_url}</a></td>
                                <td className="delete-record"><FontAwesomeIcon icon={faTimesCircle}
                                                     onClick={() => this.deleteUrl(row.short_url)}/></td>
                            </tr>
                        ))
                    }

                    </tbody>
                </Table>
                {!this.state.allUrlsData.length > 0 && <div className="short-url-para">[Table is currently empty. Shorten a URL to populate the table]</div>}


                {this.state.showAlert && <Alert variant={this.state.alertVariant} className="alert-msg">
                    {this.state.alertMessage}
                </Alert>}
            </div>
        )
    }
}

export default UrlShortener;