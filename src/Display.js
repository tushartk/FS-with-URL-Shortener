import React, {Component} from 'react';
import './Display.css';
import {Col, Form, Modal, Row, Button, Card} from "react-bootstrap";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faFolder, faFile, faTimesCircle, faEdit} from '@fortawesome/free-solid-svg-icons'
import {chunk} from 'lodash';

class Display extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showRenameFolderModal: false,
            showRenameFileModal: false,
            showDeleteFileModal: false,
            showDeleteFolderModal: false,
            renameFolderName: '',
            renameFileName: '',
            folderIndexToRename: -1,
            fileIndexToRename: -1,
            folderIndexToDelete: -1,
            fileIndexToDelete: -1
        }
        this.selectFolder = this.selectFolder.bind(this)
        this.removeFolder = this.removeFolder.bind(this)
        this.triggerFolderRenameModal = this.triggerFolderRenameModal.bind(this)
        this.removeFile = this.removeFile.bind(this)
        this.triggerFileRenameModal = this.triggerFileRenameModal.bind(this)
        this.renameFile = this.renameFile.bind(this)
        this.renameFolder = this.renameFolder.bind(this)
    }

    selectFolder = (selectedFolder) => {
        this.props.selectFolder(selectedFolder)
    }



    triggerFolderRenameModal = (oIdx, iIdx) => {
        this.handleFolderModal()
        this.setState({
            folderIndexToRename: (oIdx * 3) + iIdx
        })
        // this.props.triggerFolderRenameModal((oIdx * 4) + iIdx)
    }

    renameFolder = () => {
        this.props.renameFolder(this.state.folderIndexToRename, this.state.renameFolderName)
        this.setState({
            folderIndexToRename: -1,
            renameFolderName: ''
        })
        this.handleFolderModal()
    }

    renameFile = () => {
        this.props.renameFile(this.state.fileIndexToRename, this.state.renameFileName)
        this.setState({
            fileIndexToRename: -1,
            renameFileName: ''
        })
        this.handleFileModal()
    }

    removeFile = () => {
        this.props.removeFile(this.state.fileIndexToDelete)
        this.setState({
            fileIndexToDelete: -1
        })
        this.handleDeleteFileModal()
    }

    removeFolder = () => {
        this.props.removeFolder(this.state.folderIndexToDelete)
        this.setState({
            folderIndexToDelete: -1
        })
        this.handleDeleteFolderModal()
    }

    triggerFileRenameModal = (oIdx, iIdx) => {
        this.handleFileModal()
        this.setState({
            fileIndexToRename: (oIdx * 4) + iIdx
        })
    }


    handleFolderModal = () => {
        this.setState({showRenameFolderModal: !this.state.showRenameFolderModal})
    };


    handleFileModal = () => {
        this.setState({showRenameFileModal: !this.state.showRenameFileModal})
    };

    handleDeleteFileModal = () => {
        this.setState({showDeleteFileModal: !this.state.showDeleteFileModal})
    }

    handleDeleteFolderModal = () => {
        this.setState({showDeleteFolderModal: !this.state.showDeleteFolderModal})
    }

    updateFolderNameInputValue = (event) => {
        this.setState({
            renameFolderName: event.target.value
        })
    }

    triggerFileDeleteModal = (oIdx, iIdx) => {
        this.handleDeleteFileModal()
        this.setState({
            fileIndexToDelete: (oIdx * 4) + iIdx
        })
    }

    triggerFolderDeleteModal = (oIdx, iIdx) => {
        this.handleDeleteFolderModal()
        this.setState({
            folderIndexToDelete: (oIdx * 3) + iIdx
        })
    }

    valueChange = key => e => this.setState({[key]: e.target.value})

    handleModal = key => this.setState({[key]: !this.state[key]})

    updateFileNameInputValue = (event) => {
        this.setState({
            renameFileName: event.target.value
        })
    }


    render() {
        return (
            <div className="Display">
                <Row>
                    <Col sm='5' className="ff-col-borders folders-col">
                        <h5 className="file-folder-heading">FOLDERS</h5>
                        {chunk(this.props.curFolderObj.folders, 3).map((row, i) => (
                            <Row key={i}>
                                {
                                    row.map((col, idx) =>
                                        <Col md="4" key={idx} className="folder-card">
                                            <Card>
                                                <Card.Body>
                                                    <FontAwesomeIcon
                                                        onClick={() => this.selectFolder(col)}
                                                        icon={faFolder}
                                                        size="5x"/>
                                                    <Card.Text>{col.name}</Card.Text>
                                                    <div className="ren-del-div">
                                                        <FontAwesomeIcon icon={faTimesCircle} onClick={() => this.triggerFolderDeleteModal(i, idx)}/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        <FontAwesomeIcon icon={faEdit} onClick={() => this.triggerFolderRenameModal(i, idx)}/>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    )
                                }
                            </Row>
                        ))}

                    </Col>
                    <Col sm='7' className="ff-col-borders files-col">
                        <h5 className="file-folder-heading">FILES</h5>
                        {chunk(this.props.curFolderObj.files, 4).map((row, i) => (
                            <Row key={i}>
                                {
                                    row.map((col, idx) =>
                                        <Col md="3" key={idx}>
                                            <Card>
                                                <Card.Body>
                                                    <FontAwesomeIcon
                                                        icon={faFile}
                                                        size="1x"/>
                                                    <Card.Text>{col}</Card.Text>
                                                    <div className="ren-del-div">
                                                        <FontAwesomeIcon icon={faTimesCircle} onClick={() => this.triggerFileDeleteModal(i, idx)}/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        <FontAwesomeIcon icon={faEdit} onClick={() => this.triggerFileRenameModal(i, idx)}/>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    )
                                }
                            </Row>
                        ))}

                    </Col>
                </Row>


                <Modal show={this.state.showRenameFolderModal}
                       animation={false} onHide={this.handleFolderModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Rename Folder Dialog</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>New Folder Name</Form.Label>
                                <Form.Control type="text"
                                              value={this.state.renameFolderName}
                                              onChange={this.updateFolderNameInputValue}
                                              placeholder="Enter the new folder name"/>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={this.renameFolder}>
                            Rename
                        </Button>
                        <Button variant="danger" onClick={this.handleFolderModal}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.showRenameFileModal}
                       animation={false} onHide={this.handleFileModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Rename File Dialog</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>New File Name</Form.Label>
                                <Form.Control type="text"
                                              value={this.state.renameFileName}
                                              onChange={this.updateFileNameInputValue}
                                              placeholder="Enter the new file name"/>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={this.renameFile}>
                            Rename
                        </Button>
                        <Button variant="danger" onClick={this.handleFileModal}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.showDeleteFolderModal}
                       animation={false} onHide={this.handleDeleteFolderModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete Folder Dialog</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Do you want to delete this folder ?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={this.removeFolder}>
                            Delete
                        </Button>
                        <Button variant="primary" onClick={this.handleDeleteFolderModal}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.showDeleteFileModal}
                       animation={false} onHide={this.handleDeleteFileModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete File Dialog</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Do you want to delete this file ?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={this.removeFile}>
                            Delete
                        </Button>
                        <Button variant="primary" onClick={this.handleDeleteFileModal}>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal>


            </div>


        )
    }
}

export default Display;