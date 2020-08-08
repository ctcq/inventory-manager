import React from 'react';
import $ from 'jquery';

import '../css/SidebarContent.css';
import mug from '../resources/mug.png';

class SidebarContent extends React.Component {
  render() {
    return (
      <div className='SidebarContent'>
        <div className='wrapper-logo'>
          <img id='mug-logo' src={mug}/>
        </div>
        <div className='wrapper-title container my-5'>
          <h1 className='text-center text-light'>
            Digitale Barliste 3.0
          </h1>
          <p className='text-white text-center'> Hallo <u>{this.props.userName}</u> </p>
        </div>
        <div className='btn-group-vertical container my-5' role='group'>
          <button className='btn btn-warning' onClick={() => {
            this.props.closeSidebar();
            this.props.openModalSummary();
          }}>Bardienst beenden</button>
          <button className='btn btn-outline-warning' onClick={() => {this.props.openModal(0); this.props.closeSidebar()}}>Notizen hinterlassen</button>
          <button className='btn btn-outline-light' onClick={() => {window.location.reload()}}>Seite neu laden</button>
          <button className='btn btn-outline-light'>Eingabe sperren</button>
          <a className='btn btn-outline-light' target='_blank' href='https://github.com/ctcq/InventoryManager/issues/new'>Bug melden</a>
        </div>
        <div className='wrapper-copyright text-secondary text-center container'>
          <span className='copyright'>Copyright &#169; 2020 <a target='_blank' href='https://github.com/ctcq'>Christopher Wiedey </a></span>
        </div>
      </div>
    );
  }
}

export default SidebarContent;
