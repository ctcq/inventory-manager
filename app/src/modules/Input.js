import React from 'react';
import '../css/Input.css';
import $ from 'jquery';

class Input extends React.Component {

  constructor (props) {
    super();
    this.state = {
      'ready' : true,
      'value' : props.value === null ? '' : props.value
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({'value': event.target.value});
    $('#input-' + this.props.col + '-' + this.props.id).val(event.target.value);
  }

  sendData = (event) => {
    if (event.target.value === '') {
      return;
    }
    this.setState({'ready' : false});
    $.ajax({
      url : '/api/v1/tabledata/' + this.props.id + '/' + this.props.col + '/' + event.target.value,
      type : 'post',
      statusCode : {
        200 : (response) => {
          if (response !== '1') {
            this.props.notify('error', 'Speichern fehlgeschlagen:\n Bitte lade die Seite neu...');
          } else {
            $.ajax({
              url : '/api/v1/tabledata/' + this.props.id + '/' + this.props.col,
              type : 'get',
              statusCode : {
                200 : (response) => {
                  if (response === 'NULL') {
                    this.props.notify('error', 'Laden fehlgeschlagen:\n Bitte lade die Seite neu...');
                  } else {
                    setTimeout(() => {
                      this.setState(
                        {
                          'ready' : true,
                          'value' : response
                        }
                      );
                      let new_sum;
                      if (this.props.id != '1') {
                        new_sum = parseFloat(this.props.price) * ($('#input-before-' + this.props.id).val() - $('#input-after-' + this.props.id).val());
                      } else {
                        new_sum = ($('#input-before-' + this.props.id).val() - $('#input-after-' + this.props.id).val());
                      }
                      this.props.updateSum(new_sum);
                    }, 750);
                  }
                },
                404 : () => {
                  this.props.notify('error', 'Speichern fehlgeschlagen...');
                },
                500 : () => {
                  this.props.notify('error', 'Speichern fehlgeschlagen...');
                }
              }
            });
          }
        },
        404 : () => {
          this.props.notify('error', 'Speichern fehlgeschlagen...');
        },
        500 : () => {
          this.props.notify('error', 'Speichern fehlgeschlagen...');
        }
      }
    });
  }

  render() {
    if (this.state.ready) {
      return (
        <div className = 'input-group input-group-prepend'>
          <div className = 'input-group-text bg-white'>
            <span className="input-prepend" role="status">#</span>
          </div>
          <input id={'input-' + this.props.col + '-' + this.props.id} value={this.state.value} class='form-control' type='number' onBlur = {this.sendData} step='0.01' onChange={this.handleChange}/>
        </div>
      );
    } else {
      return (
        <div className = 'input-group-prepend'>
          <div className = 'input-group-text bg-white'>
            <span className="spinner-border spinner-border-sm text-primary"></span>
          </div>
          <input id={'input-' + this.props.col + '-' + this.props.id} value={this.state.value} class='form-control' type='number' disabled = {true} step = '0.01' onChange={this.handleChange}/>
        </div>
      );
    }
  }
}

export default Input;
