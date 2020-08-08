import React from 'react';
import $ from 'jquery';

import '../css/Table.css';

import TableRow from './TableRow.js';
import Summary from './Summary.js';

class Table extends React.Component {

  constructor() {
    super();
    this.state = {
      ready : false,
    };
    this.getData((response) => {this.data = JSON.parse(response); this.setState({'ready' : true})});
  }

  getData = (callback) => {
    $.ajax({
      url : '/api/v1/tabledata',
      type : 'get',
      statusCode : {
        200 : (response) => {
          let notification = '';
          let message = '';
          if (response === 'NULL') {
            notification = 'error';
            message = 'Fehler beim Laden der Listendaten!';
          } else {
            notification = 'success';
            message = 'Daten wurden erfolgreich geladen!';
          }
          this.props.notify(notification, message);
          callback(response);
        },
        404 : () => {this.props.notify('error', 'Verbindung mit dem Server fehlgeschlagen!')},
        500 : () => {this.props.notify('error', 'Verbindung mit der Datenbank fehlgeschlagen!')}
      }
    });
  };

  handleSummaryData = () => {
    if (this.state.data.length < 2 || this.state.data[1]['name'] === 'Bargeld') {
      return null;
    }
    let moneyBefore = this.state.data[1]['before'];
    let moneyAfter = this.state.data[1]['after'];

    let summaryData = {
      'money_before' : this.state.data[1]['before'],
      'money_after' : this.state.data[1]['after'],
      'money_diff' : this.state.data[1]['before'] - this.state.data[1]['after'],
      'articles_before' : null,
      'articles_after' : null,
      'articles_diff' : null,
      'total_diff' : null
    };

    let sumBefore = 0;
    let sumAfter = 0;
    for (let i = 2; i < this.state.data.length; i++) {
      let price = parseFloat(this.state.data[1]['price']);
      sumBefore += price * this.state.data[i]['before'];
      sumAfter += price * this.state.data[i]['after'];
    }
    summaryData['articles_before'] = sumBefore;
    summaryData['articles_after'] = sumAfter;
    summaryData['articles_diff'] = sumBefore - sumAfter;
    summaryData['total_diff'] = summaryData['money_diff'] - summaryData['articles_diff'];

    this.props.handleSummaryData(summaryData);
  }

  render() {
    if (this.state.ready) {
      let head = [];
      // Create table headers
      Object.keys(this.data[0]).forEach((col) => {
        if (col !== 'category' && col !== 'modified' && col !== 'id') {
          let cell = <th key={`th-${col}`}>{col}</th>;
          head.push(cell);
        }
      });
      // Add column for sum
      head.push(<th key={'th-sum'} className={'th-sum'}>sum</th>);

      let body = [];

      let category = '';
      let new_category = true;

      // Create table body
      this.data.forEach((rowData) => {
        // Print table header
        new_category = rowData.category !== category;
        category = rowData.category;
        if (new_category) {
            body.push(
              <tr key={"tr-"+rowData.id}>
                <td colSpan='100%' className='table-caption'>
                  <span className='font-weight-bold my-auto text-light'>{category}</span>
                </td>
              </tr>);
        }
        body.push(
          <TableRow
            id={rowData.id}
            key={rowData.id}
            name={rowData.name}
            price={rowData.price}
            last={rowData.last}
            before={rowData.before}
            after={rowData.after}
          />);
      });

      return (
        <div className='container table-scroll' >
          <table className='table table-striped table-dark'>
            <thead className='thead-dark'><tr>{head}</tr></thead>
            <tbody>{body}</tbody>
          </table>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default Table;
