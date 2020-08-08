import React from 'react';
import $ from 'jquery';
import { prototype } from 'react-modal';

class Summary extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      'money_before' : "-",
      'money_after' : "-",
      'money_diff' : "-",
      'articles_before' : '-',
      'articles_after' : '-',
      'articles_diff' : '-',
      'balance' : '-'
    };

    $.ajax({
      url : '/api/v1/metadata/balance',
      type : 'get',
      statusCode : {
        200 : (data) => {
          this.setState(JSON.parse(data));
          if (parseInt(this.state.balance) < 0) {
            props.notify('warning', 'Dein Kassenstand ist negativ. Bitte begleiche die Differenz bevor du den Bardienst beendest.');
          }
        }
      }
    });
  }

  render() {
    let data = this.state;
    return (
      <div className='bg-secondary jumbotron'>
        <table className='table table-secondary table-bordered'>
          <thead className='thead-dark'>
            <tr>
              <th scope='col'></th>
              <th className='text-bold' scope='col'>Vorher</th>
              <th scope='col'>Nachher</th>
              <th scope='col'>Differenz</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='font-weight-bold' scope='row'>Warenwert</td>
              <td scope='row'>{data.articles_before} €</td>
              <td scope='row'>{data.articles_after} €</td>
              <td scope='row'>{data.articles_diff} €</td>
            </tr>
            <tr>
              <td className='font-weight-bold' scope='row'>Bargeld</td>
              <td scope='row'>{data.money_before} €</td>
              <td scope='row'>{data.money_after} €</td>
              <td scope='row'>{data.money_diff} €</td>
            </tr>
            <tr>
              <td className='font-weight-bold' scope='row'>Umsatz</td>
              <td scope='row'></td>
              <td scope='row'></td>
              <td scope='row'>{data.balance} €</td>
            </tr>
          </tbody>
        </table>
        <div className='text-center' role='group'>
          <button type='button' className='btn btn-dark' onClick={() => {this.props.onRequestClose(); this.props.onRequestSubmit()}}>Bardienst beenden</button>
          <button type='button' className='btn btn-light' onClick={() => {this.props.onRequestClose()}}>Abbrechen</button>
        </div>
      </div>
    );
  }
}

export default Summary;
