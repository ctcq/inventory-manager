import React from 'react';
import ReactDOM from 'react-dom';

import {NotificationContainer, NotificationManager} from 'react-notifications';

import Sidebar from 'react-sidebar';

import Modal from 'react-modal';

import Login from './modules/Login.js';
import Table from './modules/Table.js';
import Summary from './modules/Summary.js';
import SidebarContent from './modules/SidebarContent.js';

import $ from 'jquery';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-table/dist/extensions/sticky-header/bootstrap-table-sticky-header.css';
import 'react-notifications/lib/notifications.css';

import bg_login from './resources/background.jpg';
import bg_error from './resources/error.jpg';

const modalStyle = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    backgroundColor       : 'rgb(69, 77, 85)',
    color                 : 'white',
    border                : '3px solid rgb(211, 158, 0)',
  },
  overlay : {
    backgroundColor : 'rgb(255, 255, 255, 0.25)'
  }
};

const modalSummaryStyle = {};

Modal.setAppElement('#root');

class App extends React.Component {

  constructor(props) {
    super();
    document.title = 'Barliste';

    this.state = {
      showLogin : false,
      showTable : false,
      sidebarOpen: true,
      modalIsOpen: false,
      modalSummaryIsOpen : false,
      commentPrivate : '',
      commentPublic : '',
      userName : '',
      lastMetadata : ''
    };

    // Query for last data
    $.ajax({
      url : '/api/v1/last',
      method : 'get',
      dataType: 'json',
      statusCode: {
        200 : (response) => {
          this.setState({
            lastMetadata : response
          });
        }
      }
    });

    // Sidebar bindings
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);

    // Modal bindings
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  onSetSidebarOpen(open) {
    this.setState({ sidebarOpen: open });
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  openModalSummary() {
    // First check if the table is complete
    $.ajax({
      url : '/api/v1/metadata/complete',
      type : 'get',
      statusCode : {
        200 : (response) => {
          if (response === '1') {
            this.setState({modalSummaryIsOpen : true});
          } else {
            this.createNotification('error', 'Du hast noch nicht alle Felder ausgefüllt!');
          }
        },
        404 : () => {this.createNotification('error', 'Verbindung mit dem Server fehlgeschlagen!')},
        500 : () => {this.createNotification('error', 'Verbindung mit der Datenbank fehlgeschlagen!')}
      }
    })
  }

  closeModalSummary() {
    this.setState({modalSummaryIsOpen : false});
  }

  onRequestSubmit() {
    $.ajax({
      url : '/api/v1/finish',
      type : 'post',
      data : {'name' : this.state.userName},
      statusCode : {
        200 : (response => {
          if (response === '1') {
            this.createNotification('success', "Barliste wurde erfolgreich gespeichert!");
            this.setState({
              showLogin : true,
              showTable : false
            });
          } else {
            this.createNotification('error', "Barliste konnte nicht gespeichert werden!");
          }
        })
      }
    });
  }

  handleSummaryData = (data) => {
    this.setState({"summaryData" : data});
  }

  componentDidMount() {
    $.ajax({
      url : '/api/v1/metadata',
      type : 'get',
      statusCode : {
        200 : (response) => {
          let message = '';
          if (response === '0') {
            message = 'Keine laufende Session gefunden. Neuer Bardienst kann begonnen werden.';
            this.setState({'showLogin' : true});
          } else if (response) {
            message = 'Laufenden Bardienst gefunden!';
            let metadata = JSON.parse(response);
            this.setState({
              'showTable'     : true,
              'userName'      : metadata.name,
              'commentPublic' : metadata.comment_public,
              'commentPrivate': metadata.comment_private
            });
          } else {
            message = 'Fehler';
          }
          this.createNotification('info', message);
        },
        404 : () => {this.createNotification('error', 'Verbindung mit dem Server fehlgeschlagen!')},
        500 : () => {this.createNotification('error', 'Verbindung mit der Datenbank fehlgeschlagen!')}
      }
    });
  }

  createNotification(type, message) {
     switch (type) {
       case "info":
         NotificationManager.info(message);
         break;
       case "success":
         NotificationManager.success(message, "");
         break;
       case "warning":
         NotificationManager.warning(message, "", 10000);
         break;
       case "error":
         NotificationManager.error(message, "Fehler!", 5000, () => {
           alert("callback");
         });
         break;
       default:
         break;
     }
   };

  initTable = () => {
   $.ajax({
     url : '/api/v1/tabledata/name/' + btoa($("#login").val()),
     type : 'put',
     statusCode : {
       200 : (response) => {
         let message = '';
         let notification = '';
         if (response === '0') {
           message = 'Fehler beim Erstellen einer neuen Liste! Möglicherweise ist die Preisliste falsch formatiert.';
           this.setState({'error' : true});
           notification = 'error';
         } else if (response === '1'){
           message = 'Auf gehts!'
           notification = 'success';
           this.setState({'showTable' : true});
         } else {
           message = 'Fehler: "' + response + '"';
           notification = 'error';
           this.setState({'error' : true});
         }
         this.createNotification(notification, message);
       },
       404 : () => {this.createNotification('error', 'Verbindung mit dem Server fehlgeschlagen!')},
       500 : () => {this.createNotification('error', 'Verbindung mit der Datenbank fehlgeschlagen!')}
     }
   });
  };

  render = () => {
    let bg_image;

    let loginForm = null;
    if (this.state.showLogin && !this.state.error) {
      bg_image = bg_login;
      loginForm =
      <Login
        lastName={this.state.lastMetadata.name}
        notify={(type, message) => {
          this.createNotification(type, message);
        }}
        initTable = {() => {this.initTable()}}
      />;
    }
    let sidebarToggle = null;
    let sidebar = null;
    let sidebarSummaryToggle = null;
    let sidebarSummary = null;

    let modal = null;
    let modalSummary = null;

    if (this.state.showTable && !this.state.error) {
      $('.App').removeClass('bg-image');
      let table =
        <Table
          notify = {(type, message) => {
            this.createNotification(type, message);
          }}
          postSummaryData = {this.getSummaryData}
        />;
      sidebarToggle =
        <div
          className = 'btn btn-warning border border-dark'
          style={{'zIndex' : 1}}
          onClick={() => this.onSetSidebarOpen(true)}>
          <div className ='btn-hamburger'>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>;

      sidebar =
        <Sidebar
          sidebar={
            <SidebarContent
              openModal={() => {this.openModal()}}
              openModalSummary={() => {this.openModalSummary()}}
              closeSidebar={() => {this.onSetSidebarOpen(false)}}
              userName={this.state.userName}
              updateSummary={this.updateSummary}
            />}
          children={table}
          sidebarClassName={'bg-dark'}
          open={this.state.sidebarOpen}
          onSetOpen={this.onSetSidebarOpen}
          styles={{ sidebar: { width: "25%" } }}
        />;

      sidebarSummaryToggle =
      <div
        className = 'btn btn-warning border border-dark align-self-end'
        style={{'zIndex' : 1}}
        onClick={() => this.onSetSidebarOpen(true)}>
        <div className ='btn-hamburger'>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>;

      sidebarSummary =
        <Sidebar
          children={table}
          sidebarClassName={'bg-dark'}
          open={this.state.sidebarOpen}
          onSetOpen={this.onSetSidebarOpen}
          styles={{ sidebar: { width: "25%" } }}
        />;

      modal =
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={modalStyle}
          contentLabel="Comment Modal"
        >
          <div className='container'>
            <h4 className='text text-center'>Nachricht an den OBK</h4>
          </div>
          <form>
            <div className='container my-4'>
              <textarea
                id='text-comment'
                className='form-control'
                value={this.state.commentPrivate}
                placeholder='Das erscheint später auf deiner Inventarliste.'
                onChange={(event) => {this.setState({'commentPrivate' : event.target.value})}}
              />
            </div>

            <div className='container'>
              <h4 className='text text-center'>Nachricht an den nächsten Bardienst</h4>
            </div>
            <div className='container my-4'>
              <textarea
                id='text-comment'
                className='form-control'
                value={this.state.commentPublic}
                placeholder='Das bekommt der nächste Bardienst zu sehen.'
                onChange={(event) => {this.setState({'commentPublic' : event.target.value})}}
              />
            </div>

            <div className='btn-group container' role='group'>
              <button type='button' className='btn btn-warning'
                onClick={() => {
                  let type = this.state.commentPrivate == '' ? 'delete' : 'post';
                  $.ajax({
                    url : 'api/v1/metadata/comment_private/' + btoa(this.state.commentPrivate),
                    type : type,
                    statusCode : {
                      200 : (response) => {
                        if (response == 'NULL') {
                          this.createNotification('error', 'Nachricht konnte nicht gespeichert werden!');
                        } else {
                          this.createNotification('success', 'Nachricht wurde erfolgreich gespeichert!');
                        }
                      },
                      404 : () => {this.createNotification('error', 'Verbindung mit dem Server fehlgeschlagen!')},
                      500 : () => {this.createNotification('error', 'Verbindung mit der Datenbank fehlgeschlagen!')}
                    }
                  });

                  type = this.state.commentPublic == '' ? 'delete' : 'post';
                  $.ajax({
                    url : 'api/v1/metadata/comment_public/' + btoa(this.state.commentPublic),
                    type : type,
                    statusCode : {
                      200 : (response) => {
                        if (response == '0') {
                          this.createNotification('error', 'Nachricht konnte nicht gespeichert werden!');
                        } else {
                          this.createNotification('success', 'Nachricht wurde erfolgreich gespeichert!');
                        }
                      },
                      404 : () => {this.createNotification('error', 'Verbindung mit dem Server fehlgeschlagen!')},
                      500 : () => {this.createNotification('error', 'Verbindung mit der Datenbank fehlgeschlagen!')}
                    }
                  });
                  this.closeModal();
                }}>Speichern</button>
              <button type='button' className='btn btn-outline-warning' onClick={this.closeModal}>Abbrechen</button>
            </div>
          </form>
        </Modal>;

        modalSummary =
          <Modal
            isOpen={this.state.modalSummaryIsOpen}
            onAfterOpen={this.afterOpenModalSummary}
            style={modalSummaryStyle}
            contentLabel="Summary Modal"
          >
            <div className='container'>
              <Summary
                onRequestClose={() => {this.closeModalSummary()}}
                onRequestSubmit={() => {this.onRequestSubmit()}}
                notify = {(type, message) => {this.createNotification(type, message)}}
              />
            </div>
          </Modal>;
    }

    let main_style = {
      backgroundImage : `url(${bg_image})`,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover'
    };

    return (
      <div style={main_style} className='App d-flex bg-dark'>
        {modal}
        {modalSummary}
        {loginForm}
        {sidebarToggle}
        {sidebar}
        <NotificationContainer />
      </div>
    );
  }
}

export default App;
