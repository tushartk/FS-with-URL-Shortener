import React, {Component} from 'react';
import Display from "./Display";
import "./FileSystem.css";
import {find} from "lodash";
import {Button, Form, Modal, Breadcrumb} from "react-bootstrap";
import Alert from "react-bootstrap/Alert";

class FileSystem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            globalDirectoryInfo: {
                name: 'Home',
                files: ['Hello1'],
                folders: [{
                    name: 'subfolder1',
                    folders: [],
                    files: ['hello5']
                }]
            },
            curDirectoryInfo: {
                name: '',
                files: [],
                folders: []
            },
            folderPathForBrdCrb: [],
            showCreateFolderModal: false,
            showCreateFileModal: false,
            newFolderName: '',
            newFileName: '',
            alertMessage: '',
            alertVariant: 'danger',
            showAlert: false

        };
        this.restoreFolder = this.restoreFolder.bind(this);
        this.beforeunload = this.beforeunload.bind(this);
    }

    componentDidMount = () => {
        window.addEventListener('beforeunload', this.beforeunload);
        console.log(localStorage.getItem('dataStored'))
        const curDirInfo = (localStorage.getItem('dataStored') === null) ?
            this.state.globalDirectoryInfo :
            JSON.parse(localStorage.getItem('dataStored'));
        this.setState({
            curDirectoryInfo: curDirInfo,
            globalDirectoryInfo: curDirInfo,
            folderPathForBrdCrb: ['Home']
        })
    }

    beforeunload(e) {
        if (localStorage.getItem('dataStored') !== null) {
            localStorage.removeItem('dataStored')
        }
        localStorage.setItem('dataStored', JSON.stringify(this.state.globalDirectoryInfo))
    }

    fetchDataFromServer = () => {
        const url = 'http://localhost:5000/fetch'
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.found) {
                    this.setState({
                        globalDirectoryInfo: data.storedData,
                        curDirectoryInfo: data.storedData
                    })
                } else {
                    this.showALert('No data in server', 'danger')
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    saveDataToServer = () => {
        const url = 'http://localhost:5000/store'
        fetch(url, {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.state.globalDirectoryInfo),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                this.showALert('Data Stored in server', 'success')
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }



    componentWillUnmount = () => {
        window.removeEventListener('beforeunload', this.beforeunload);
    }

    handleFolderModal = () => {
        this.setState({showCreateFolderModal: !this.state.showCreateFolderModal})
    };

    handleFileModal = () => {
        this.setState({showCreateFileModal: !this.state.showCreateFileModal})
    };


    createFolder = () => {
        let newFoldObj = this.state.curDirectoryInfo.folders;
        if (find(newFoldObj, ['name', this.state.newFolderName]) !== undefined) {
            this.showALert('Folder already exists with the same name', 'danger')
            return;
        }
        newFoldObj.push({name: this.state.newFolderName, files: [], folders: []})
        this.setState({
            showCreateFolderModal: !this.state.showCreateFolderModal,
            newFolderName: ''
        })
    }

    showALert = (message, alertType) => {
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

    createFile = () => {
        let newFileObj = this.state.curDirectoryInfo.files;
        if (find(newFileObj, [this.state.newFileName]) !== undefined) {
            this.showALert('File already exists with the same name', 'danger')
            return;
        }
        newFileObj.push(this.state.newFileName)
        this.setState({
            showCreateFileModal: !this.state.showCreateFileModal,
            newFileName: ''
        })
    }

    findWithRecursion = (indexToFetch, currentIndex, DataObj) => {
        let foundObj
        if (indexToFetch === currentIndex) {
            foundObj = find(DataObj.folders, ['name', this.state.folderPathForBrdCrb[indexToFetch]])
            const updatedBrdCrumb = this.state.folderPathForBrdCrb.slice(0, indexToFetch + 1)
            this.setState({
                curDirectoryInfo: foundObj,
                folderPathForBrdCrb: updatedBrdCrumb
            })
        } else {
            foundObj = find(DataObj.folders, ['name', this.state.folderPathForBrdCrb[currentIndex]])
            this.findWithRecursion(indexToFetch, currentIndex + 1, foundObj)
        }
    }

    restoreFolder = (indexToFetch) => {
        if (indexToFetch === 0) {
            this.setState({
                curDirectoryInfo: this.state.globalDirectoryInfo,
                folderPathForBrdCrb: ["Home"]
            })
        } else {
            this.findWithRecursion(indexToFetch, 1, this.state.globalDirectoryInfo)
        }
    }


    removeFolder = (idx) => {
        let copyOfCurDir = this.state.curDirectoryInfo;
        copyOfCurDir.folders.splice(idx, 1)
        this.setState({
            curDirectoryInfo: copyOfCurDir
        })
    }

    removeFile = (idx) => {
        let copyOfCurDir = this.state.curDirectoryInfo;
        copyOfCurDir.files.splice(idx, 1)
        this.setState({
            curDirectoryInfo: copyOfCurDir
        })
    }

    renameFolder = (idx, val) => {
        let copyOfCurDir = this.state.curDirectoryInfo;
        copyOfCurDir.folders[idx].name = val
        this.setState({
            curDirectoryInfo: copyOfCurDir
        })
    }

    renameFile = (idx, val) => {
        let copyOfCurDir = this.state.curDirectoryInfo;
        copyOfCurDir.files[idx] = val
        this.setState({
            curDirectoryInfo: copyOfCurDir
        })
    }

    updateFolderNameInputValue = (event) => {
        this.setState({
            newFolderName: event.target.value
        })
    }

    selectFolder = (folderDetails) => {
        let currentFoldStruct = this.state.folderPathForBrdCrb
        currentFoldStruct.push(folderDetails.name)
        this.setState({
            curDirectoryInfo: folderDetails,
            folderPathForBrdCrb: currentFoldStruct
        })
    }


    updateFileNameInputValue = (event) => {
        this.setState({
            newFileName: event.target.value
        })
    }


    render() {
        return (
            <div className="FileSystem">
                {
                    // This is for the button for folder creation and fetch from server
                }

                <div className="d-flex all-button-div">
                    <div className="mr-auto">
                        <Button variant="primary" onClick={this.handleFolderModal}>Create New
                            Folder</Button>{' '}
                        <Button variant="primary" onClick={this.handleFileModal}>Create New File</Button>
                    </div>
                    <div>
                        <Button variant="success" onClick={this.fetchDataFromServer}>Fetch from
                            server</Button>{' '}
                        <Button variant="success" onClick={this.saveDataToServer}>Save to server</Button>
                    </div>
                </div>


                <Modal show={this.state.showCreateFolderModal}
                       animation={false} onHide={this.handleFolderModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create Folder Dialog</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>Folder Name</Form.Label>
                                <Form.Control type="text"
                                              value={this.state.newFolderName}
                                              onChange={this.updateFolderNameInputValue}
                                              placeholder="Enter the folder name"/>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={this.createFolder}>
                            Create
                        </Button>
                        <Button variant="danger" onClick={this.handleFolderModal}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.showCreateFileModal}
                       animation={false} onHide={this.handleFileModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create File Dialog</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>File Name</Form.Label>
                                <Form.Control type="text"
                                              value={this.state.newFileName}
                                              onChange={this.updateFileNameInputValue}
                                              placeholder="Enter the file name"/>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={this.createFile}>
                            Create
                        </Button>
                        <Button variant="danger" onClick={this.handleFileModal}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Breadcrumb className="justify-content-center">
                    {
                        this.state.folderPathForBrdCrb.map((val, i) =>
                            <Breadcrumb.Item key={i} onClick={() => {
                                this.restoreFolder(i)
                            }}>{val}</Breadcrumb.Item>
                        )
                    }
                    {/*<Breadcrumb.Item active>Data</Breadcrumb.Item>*/}
                </Breadcrumb>

                {
                    // This is for displaying the folders
                }
                <Display curFolderObj={this.state.curDirectoryInfo}
                         selectFolder={this.selectFolder}
                         removeFolder={this.removeFolder}
                         removeFile={this.removeFile}
                         renameFolder={this.renameFolder}
                         renameFile={this.renameFile}
                />
                {this.state.showAlert && <Alert variant={this.state.alertVariant} className="alert-msg">
                    {this.state.alertMessage}
                </Alert>}
            </div>
        )
    }
}

export default FileSystem;